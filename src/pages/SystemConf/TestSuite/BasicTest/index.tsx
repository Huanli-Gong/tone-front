import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { Button, Space, Drawer, message, Pagination, Modal, Tooltip, Row, Alert, Table, Spin } from 'antd';
import { CaretRightFilled, CaretDownFilled, FilterFilled, EditOutlined, QuestionCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { suiteList, addSuite, editSuite, delSuite, syncSuite, manual, lastSync } from '../service';
import ButtonEllipsis from '@/components/Public/ButtonEllipsis';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import Highlighter from 'react-highlight-words';
import { suiteChange } from '@/components/Public/TestSuite/index.js';
import styles from './style.less';
import CaseTable from './components/CaseTable';
import SelectCheck from '@/components/Public//SelectCheck';
import SearchInput from '@/components/Public/SearchInput';
import SelectDrop from '@/components/Public//SelectDrop';
import SelectRadio from '@/components/Public/SelectRadio';
import { useLocation } from 'umi'
import SuiteEditer from './components/AddSuiteTest'
import DesFastEditDrawer from './components/DesFastEditDrawer'
import BatchDelete from './components/BatchDelete';
import { TestContext } from '../Provider'
import ConfEditDrawer from './components/CaseTable/ConfEditDrawer'

import _ from 'lodash'
import { editBentch, editCase, addCase } from '@/pages/SystemConf/TestSuite/service'
import { queryConfirm } from '@/pages/WorkSpace/JobTypeManage/services';
import { requestCodeMessage } from '@/utils/utils';
import { useSuiteProvider } from '../hooks';

let timeout: any = null;
let timer: any = null;

const SuiteManagement = (props: any, ref: any) => {

    useImperativeHandle(ref, () => ({
        openCreateDrawer: suiteEditDrawer.current.show
    }))

    const { domainList, runList } = useSuiteProvider()
    const { query }: any = useLocation()

    const testType = query.test_type || 'functional'
    const DEFAULT_PAGE_PARAMS = { page_size: 10, page_num: 1, test_type: testType }

    const [pageParams, setPageParams] = useState<any>(DEFAULT_PAGE_PARAMS)
    const [loading, setLoading] = useState<boolean>(true)
    const [sync, setSync] = useState<boolean>(false)
    const [expandKey, setExpandKey] = useState<string[]>([])
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteDefault, setDeleteDefault] = useState(false)
    const [deleteObj, setDeleteObj] = useState<any>({});
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])
    const [selectedRow, setSelectedRow] = useState<any>([])
    const [confRefresh, setConfRefresh] = useState<boolean>(true)

    const [dataSource, setDataSource] = useState<any>([])

    const defaultList = [{ id: 1, name: '是' }, { id: 0, name: '否' }]

    const confDrawer: any = useRef(null)

    const suiteEditDrawer: any = useRef(null)
    const edscFastEditer: any = useRef(null)

    const [asyncTime, setAsyncTime] = useState(new Date().getTime())

    const getList = async () => {
        setLoading(true)
        const data: any = await suiteList(pageParams)
        setDataSource(data)
        handleLastSync()
        setLoading(false)
    };

    const debouncedList = (fn: any, wait: any) => {
        if (timer !== null) clearTimeout(timer);  //清除这个定时器
        timer = setTimeout(_.partial(fn, pageParams), wait);
    }

    const submitCase = async (data: any, bentch: boolean) => {
        const { test_suite_id, id } = data
        const param = { ...data }
        if (bentch) {
            const params = { ...param, ...{ case_id_list: selectedRowKeys.join(',') } }
            await editBentch(params)
            setSelectedRowKeys([])
        }
        else {
            let content = param.var
            if (Object.prototype.toString.call(param.var) === '[object String]') {
                try {
                    let valid = JSON.parse(content)
                    if (Object.prototype.toString.call(valid) === '[object Array]') {
                        let len = valid.length
                        for (var i = 0; i < len; i++) {
                            if (!(Object.prototype.toString.call(valid[i]) === '[object Object]')) {
                                message.error('变量数据格式错误');
                                return
                            }
                        }
                    } else {
                        message.error('变量数据格式错误');
                        return
                    }
                } catch (e) {
                    message.error('变量数据格式错误');
                    return
                }
            }
            else {
                let arr: any = []
                content.map((item: any) => {
                    if (item.name) {
                        arr.push(item)
                    }
                })
                content = JSON.stringify(arr)
            }
            param.var = content
            // ...{ test_suite_id }
            const params = { ...param, ...{ test_suite_id } }
            const { code, msg } = id ? await editCase(id, params) : await addCase(params)
            if (code == 201) {
                message.error('Test Suite名称重复');
                return
            }
            if (code == 202) {
                message.error(msg);
                return
            }
        }

        confDrawer.current.hide()
        message.success('操作成功');
        setConfRefresh(!confRefresh)
    }

    useEffect(() => {
        setExpandKey([])
        setPageParams(DEFAULT_PAGE_PARAMS)
    }, [query])

    useEffect(() => {
        debouncedList(getList, 300)
        return () => {
            clearTimeout(timeout)
            clearTimeout(timer)
        }
    }, [pageParams])

    const handlePage = (page_num: number, page_size: any) => {
        setPageParams({ ...pageParams, page_num, page_size })
    }

    const editOuter = (row: any) => {
        row.direction == '上升' ? row.domain = 'increase' : 'decline'
        row.is_default = row.is_default ? 1 : 0
        row.test_type = testType
        const arr = row.domain_id_list === '' ? [] : row.domain_id_list.split(',')
        let newArr = [];
        for (var i = 0; i < arr.length; i++) newArr.push(Number.parseInt(arr[i]))
        row.domain_list_str = newArr
        domainList.forEach((item: any) => { if (item.name == row.domain) row.domain = item.id })
        suiteEditDrawer.current.show('编辑Test Suite', row)
    }

    const onDesSubmit = async ({ doc, id }: any) => {
        await editSuite(id, { doc })
        message.success('操作成功');
        edscFastEditer.current.hide()
        pageParams.page_num === 1 ?
            getList() :
            setPageParams({ ...pageParams, page_num: 1 })
    }

    const submitSuite = async (data: any, editId: any) => {
        const params = { ...data }
        const { code, msg } = editId ?
            await editSuite(editId, params) :
            await addSuite(params)
        if (code !== 200) return requestCodeMessage(code, msg);
        suiteEditDrawer.current.hide()
        message.success('操作成功');
        getList()
    }

    const deleteOuter = async (row: any) => {
        const data = await queryConfirm({ flag: 'pass', suite_id: row.id })
        if (data.code === 200) setDeleteVisible(true)
        else setDeleteDefault(true)
        setDeleteObj(row)
    }

    const handleDetail = () => {
        window.open(`/refenerce/suite/?name=${deleteObj.name}&id=${deleteObj.id}`)
    }

    const remOuter = async () => {
        setDeleteVisible(false)
        setDeleteDefault(false)
        await delSuite(deleteObj.id)
        message.success('操作成功');
        getList()
    }

    const synchro = async (row: any) => {
        setSync(true)
        const hide = message.loading({ content: '同步中', duration: 0 })
        const { code } = await syncSuite(row.id)
        setSync(false)
        hide()
        if (code !== 200) {
            message.warning('同步失败')
            return
        }
        message.success('同步成功')
        getList()
        setAsyncTime( new Date().getTime() )
    }

    const columns: any = [
        {
            title: 'Test Suite',
            dataIndex: 'name',
            width: 300,
            fixed: 'left',
            ellipsis: true,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    confirm={confirm}
                    // autoFocus={autoFocus}
                    onConfirm={(val: string) => { setPageParams({ ...pageParams, name: val }) }}
                />
            ),
            filterIcon: () => <FilterFilled style={{ color: pageParams.name ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => (
                <PopoverEllipsis title={row.name} >
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[pageParams.name || '']}
                        autoEscape
                        textToHighlight={row.name.toString()}
                    />
                </PopoverEllipsis>
            )
        },
        {
            title: '运行模式',
            dataIndex: 'run_mode',
            render: (_: any) => _ === 'standalone' ? "单机" : '集群',
            width: 100,
            filterIcon: () => <FilterFilled style={{ color: pageParams.run_mode ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectCheck
                    list={runList}
                    confirm={confirm}
                    onConfirm={
                        (val: any) => { setPageParams({ ...pageParams, run_mode: val }) }
                    }
                />
            ),
        },
        {
            title: '领域',
            dataIndex: 'domain_name_list',
            width: 90,
            ellipsis: true,
            filterIcon: () => <FilterFilled style={{ color: pageParams.domain ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectCheck
                    list={domainList}
                    confirm={confirm}
                    onConfirm={(val: any) => { setPageParams({ ...pageParams, domain: val }) }}
                />
            ),
        },
        {
            title: (
                testType == 'functional' ?
                    <></> :
                    <Space>
                        视图类型
                        <Tooltip
                            title={
                                <div>
                                    <div>Type1：所有指标拆分展示</div>
                                    <div>Type2：多Conf同指标合并</div>
                                    <div>Type3：单Conf多指标合并</div>
                                </div>
                            }
                            placement="bottomLeft"
                        >
                            <QuestionCircleOutlined />
                        </Tooltip>
                    </Space>
            ),
            dataIndex: 'view_type',
            render: (_: any, record: any) => testType == 'functional' ? <></> : suiteChange(_, record),
            width: testType == 'functional' ? 0 : 120,
            ellipsis: true,
        },
        {
            title: '说明',
            dataIndex: 'doc',
            width: 130,
            ellipsis: true,
            render: (_: any, row: any) => (
                <div>
                    <ButtonEllipsis title={row.doc} width={95} isCode={true}>
                        <EditOutlined
                            className={styles.edit}
                            onClick={() => {
                                edscFastEditer.current.show(row)
                            }}
                        />
                    </ButtonEllipsis>
                </div>
            )
        },
        {
            title: '默认用例',
            width: 110,
            render: (_: any, row: any) => row.is_default ? '是' : '否',
            filterIcon: () => <FilterFilled style={{ color: pageParams.is_default === 1 ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectRadio
                    list={defaultList}
                    confirm={confirm}
                    onConfirm={(val: any) => { setPageParams({ ...pageParams, is_default: val }) }}
                />
            ),
        },
        {
            title: (
                <Space>
                    是否认证
                    <Tooltip
                        title={<div>
                            Is Certificated ：Certificated用例才能同步到Testfarm
                        </div>}
                        placement="bottomLeft"
                    >
                        <QuestionCircleOutlined />
                    </Tooltip>
                </Space>
            ),
            width: 120,
            render: (_: any, row: any) => row.certificated ? '是' : '否',
            filterIcon: () => <FilterFilled style={{ color: pageParams.certificated === 1 ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectRadio
                    list={defaultList}
                    confirm={confirm}
                    onConfirm={(val: any) => { setPageParams({ ...pageParams, certificated: val }) }}
                />
            ),
        },
        {
            title: 'Owner',
            dataIndex: 'owner_name',
            width: 80,
            filterIcon: () => <FilterFilled style={{ color: pageParams.owner ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectDrop
                    confirm={confirm}
                    onConfirm={(val: number) => setPageParams({ ...pageParams, owner: val })}
                />
            ),
        },
        {
            title: '备注',
            dataIndex: 'description',
            width: 100,
            ellipsis: true,
        },
        {
            title: '创建时间',
            dataIndex: 'gmt_created',
            width: 200,
            sorter: true,
            render: (_: any, row: any) => <PopoverEllipsis title={row.gmt_created} />
        },
        {
            title: '修改时间',
            dataIndex: 'gmt_modified',
            sorter: true,
            width: 200,
            render: (_: any, row: any) => <PopoverEllipsis title={row.gmt_modified} />
        },
        {
            title: '操作',
            valueType: 'option',
            dataIndex: 'id',
            width: '140px',
            fixed: 'right',
            render: (_: any, row: any) => (
                <Space>
                    <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => synchro(row)}>同步</Button>
                    <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => editOuter(row)}>编辑</Button>
                    <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => deleteOuter(row)}>删除</Button>
                </Space>
            )
        },
    ];

    const [time, setTime] = useState()
    const onExpand = async (record: any) => {
        setExpandKey([record.id + ''])
    }

    const handleSynchronous = async () => {
        const data = await manual()
        if (data.code === 200) {
            message.success('同步命令开始执行成功')
        } else if (data.code === 201) {
            message.warning(data.msg)
        } else {
            message.error(data.msg)
        }
    }

    const handleLastSync = async () => {
        const data = await lastSync()
        data.code === 200 ?
            setTime(data.data) :
            message.error(data.msg)
    }

    const defaultOption = (code: number, msg: string) => {
        if (code === 200) {
            message.success('操作成功')
            const pageNum = Math.ceil((dataSource.total - 1) / pageParams.page_size) || 1
            let index = pageParams.page_num
            if (pageParams.page_num > pageNum) {
                index = pageNum
            }
            setPageParams({ ...pageParams, page_num: index })
        }
        else {
            requestCodeMessage(code, msg)
        }
    }

    const totalTotal = (total: any) => {
        return total || 0
    }

    const totalPaginationClass = (total: any) => {
        return !total || total <= 0 ? styles.hidden : ''
    }

    return (
        <TestContext.Provider
            value={{
                selectedRowKeys,
                selectedRow,
                confDrawerShow: confDrawer.current?.show,
                confRefresh,
                setConfRefresh,
                setSelectedRowKeys,
                setSelectedRow,
            }}
        >
            <Spin spinning={loading}>

                <Alert type="success"
                    showIcon
                    style={{ marginBottom: 16, height: 32 }}
                    message={<span className={styles.synchronousTime}>缓存周期5分钟，上次缓存tone用例时间：{time}</span>}
                    action={<span className={styles.synchronous} onClick={handleSynchronous}>同步</span>}
                />

                <Table
                    size={'small'}
                    onChange={
                        (pagination: any, filters: any, sorter: any) => {
                            const { order, field } = sorter;

                            switch (order) {
                                case 'descend':
                                    if (field === 'gmt_created') setPageParams({ ...pageParams, order: '-gmt_created' })
                                    if (field === 'gmt_modified') setPageParams({ ...pageParams, order: '-gmt_modified' })
                                    break;
                                case 'ascend':
                                    if (field === 'gmt_created') setPageParams({ ...pageParams, order: 'gmt_created' })
                                    if (field === 'gmt_modified') setPageParams({ ...pageParams, order: 'gmt_modified' })
                                    break;
                                default:
                                    if (field === 'gmt_created') setPageParams({ ...pageParams, order: undefined })
                                    if (field === 'gmt_modified') setPageParams({ ...pageParams, order: undefined })
                                    break;
                            }
                        }
                    }
                    columns={columns}
                    dataSource={dataSource.data}
                    rowKey={record => record.id + ''}
                    pagination={false}
                    expandable={{
                        expandedRowRender: (record) => <CaseTable key={ asyncTime } id={record.id} type={testType} />,
                        onExpand: (_, record) => _ ? onExpand(record) : setExpandKey([]),
                        expandedRowClassName: () => 'case_expand_row',
                        expandedRowKeys: expandKey,
                        expandIcon: ({ expanded, onExpand, record }) => (
                            expanded ?
                                (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                                (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                        )
                    }}
                    scroll={{ x: 1470 }}
                />
                {selectedRowKeys.length > 0 && <BatchDelete />}
                {
                    dataSource.total &&
                    <Row justify="space-between" style={{ padding: '16px 20px 0' }}>
                        <div>
                            共{totalTotal(dataSource.total)}条
                        </div>
                        <Pagination
                            className={totalPaginationClass(dataSource.total)}
                            showQuickJumper
                            showSizeChanger
                            size="small"
                            current={pageParams.page_num}
                            defaultCurrent={1}
                            onChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
                            onShowSizeChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
                            total={dataSource.total}
                        />
                    </Row>
                }
            </Spin>
            {/* 同步遮罩 */}
            <Drawer
                visible={sync}
                width={0}
                getContainer={false}
            />
            <SuiteEditer
                test_type={testType}
                ref={suiteEditDrawer}
                onOk={submitSuite}
            />
            <DesFastEditDrawer
                ref={edscFastEditer}
                onOk={onDesSubmit}
            />
            <Modal
                title="删除提示"
                centered={true}
                className={styles.modalChange}
                visible={deleteVisible}
                //onOk={remOuter}
                onCancel={() => setDeleteVisible(false)}
                footer={[
                    <Button key="submit" onClick={remOuter}>
                        确定删除
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteVisible(false)}>
                        取消
                    </Button>
                ]}
                width={600}
                maskClosable={false}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    该Suite({deleteObj.name})已被Worksapce引用，删除后将影响以下Workspace的Test Suite管理列表，以及应用该Suite的Job、模板、计划，请谨慎删除！！
                </div>
                <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
                    删除suite影响范围：运行中的job、测试模板、对比分析报告
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>查看引用详情</div>
            </Modal>
            <Modal
                title="删除提示"
                centered={true}
                className={styles.modalChange}
                visible={deleteDefault}
                onCancel={() => setDeleteDefault(false)}
                footer={[
                    <Button key="submit" onClick={remOuter}>
                        确定删除
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteDefault(false)}>
                        取消
                    </Button>
                ]}
                width={300}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    确定要删除吗？
                </div>
            </Modal>
            <ConfEditDrawer ref={confDrawer} onOk={submitCase} />
        </TestContext.Provider>
    );
};

export default forwardRef(SuiteManagement);



                            // let orderArray = pageParams.order ? pageParams.order.split(',') : []
                            // let orderStr = ''
                            // if (order) {
                            //     const mark = (order === 'descend' ? '-' : '') + (order ? field : '')
                            //     if (JSON.stringify(orderArray) === '[]')
                            //         orderArray = orderArray.concat(mark)
                            //     else {
                            //         const hasField = ~pageParams.order.indexOf(field)
                            //         if (hasField)
                            //             orderArray = orderArray.reduce(
                            //                 (p: any, c: any) => p.concat(~c.indexOf(field) ? mark : c),
                            //                 []
                            //             )
                            //         else
                            //             orderArray = orderArray.concat(mark)
                            //     }
                            // }
                            // else {
                            //     orderArray = orderArray.reduce(
                            //         (p: any, c: any) => ~c.indexOf(field) ? p : p.concat(c),
                            //         []
                            //     )
                            // }
                            // orderStr = orderArray.join(',')
                            // setPageParams({ ...pageParams, order: orderStr })