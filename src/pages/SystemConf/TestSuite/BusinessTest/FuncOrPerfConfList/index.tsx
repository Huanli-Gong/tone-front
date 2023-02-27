import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button, Space, Tabs, message, Modal, Checkbox, Typography } from 'antd';
import { CaretRightFilled, CaretDownFilled, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { addCase, editCase, delCase, delBentch, openSuite, editBentch } from '@/pages/SystemConf/TestSuite/service';
import { useIntl, FormattedMessage } from 'umi'
import CommonTable from '@/components/Public/CommonTable';
import ButtonEllipsis from '@/components/Public/ButtonEllipsis';

import ConfEditDrawer from '@/pages/SystemConf/TestSuite/BasicTest/components/CaseTable/ConfEditDrawer'
import DesFastEditDrawer from '@/pages/SystemConf/TestSuite/BasicTest/components/DesFastEditDrawer'

import { queryConfirm } from '@/pages/WorkSpace/JobTypeManage/services';
import { requestCodeMessage } from '@/utils/utils';
import MetricTable from './components/MetricTable';
import styles from './index.less';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const { TabPane } = Tabs;

/**
 * 功能测试、性能测试的conf列表
 * @param id 父级列表suite_id
 * @param type 父级列表 测试类型
 * @returns 
 */
export default forwardRef(({ id, type: test_type, domainList }: any, ref: any) => {
    const { formatMessage } = useIntl()
    const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
    const [selectedRow, setSelectedRow] = useState<any>([]);
    const [innerKey, setInnerKey] = useState<string>('1')
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteDefault, setDeleteDefault] = useState(false);
    const [deleteObj, setDeleteObj] = useState<any>({});
    const [confPage, setConfPage] = useState<number>(1)
    const [confPageSize, setConfPageSize] = useState<number>(10)
    const [expandList, setExpandList] = useState<any>([])
    const [expandLoading, setExpandLoading] = useState<boolean>(true)
    const [expandInnerKey, setExpandInnerKey] = useState<string[]>([])
    const descFastEdit: any = useRef(null)
    const confDrawer: any = useRef(null)
    const [confRefresh, setConfRefresh] = useState<any>(false);

    // 刷新列表
    useImperativeHandle(
        ref,
        () => ({
            refresh: ({ refreshId }: any) => {
                // console.log('refreshId:', refreshId)
                if (id === refreshId) {
                    getCase()
                }
            }
        })
    )

    const getCase = async (query = {}) => {
        setExpandList({ data: [] })
        setExpandInnerKey([])
        setExpandLoading(true)
        const params = { suite_id: id, page_num: confPage, page_size: confPageSize, ...query }
        const data = await openSuite(params)
        setExpandList(data)
        setExpandLoading(false)
    }
    // 2.单个删除
    const submitDelConf = async () => {
        // setDeleteLoading(true)
        try {
            const { code, msg }: any = await delCase(deleteObj.id) || {};
            if (code === 200) {
                message.success(formatMessage({ id: 'request.delete.success' }));
                // *判断单个删除行时，对批量选中行的影响
                if (selectedRowKeys.includes(deleteObj.id)) {
                    const tempKeys = selectedRowKeys.filter((item: any) => item !== deleteObj.id)
                    const tempRows = selectedRow.filter((item: any) => item.id !== deleteObj.id)
                    setSelectedRowKeys(tempKeys)
                    setSelectedRow(tempRows)
                }
                setDeleteVisible(false)
                setDeleteDefault(false)
                setDeleteObj({})
                // 
                getCase()
            } else {
                message.error(msg || formatMessage({ id: 'request.delete.failed' }));
            }
            // setDeleteLoading(false)
        } catch (e) {
            console.log(e)
            // setDeleteLoading(false)
        }
    }
    // 3.批量删除
    const submitDelConfAll = async () => {
        const { code, msg } = await delBentch({ id_list: selectedRowKeys.join() }) || {}
        if (code === 200) {
            // 初始化状态&&关闭对话框
            setSelectedRow([])
            setSelectedRowKeys([])
            setDeleteVisible(false)
            setDeleteDefault(false)
            // 刷新表格数据
            getCase({ page_num: 1 })
        } else {
            message.error(msg || formatMessage({ id: 'operation.batch.delete.failed' }));
        }
    }

    useEffect(() => {
        getCase()
    }, [confPage, confPageSize, confRefresh]);


    // 新增|编辑｜批量编辑，回调函数。
    const submitCase = async (data: any, bentch: boolean) => {
        const { test_suite_id, id } = data
        const param = { ...data }
        if (bentch) {
            const params = { ...param, ...{ case_id_list: selectedRowKeys.join(',') } }
            await editBentch(params)
            setSelectedRowKeys([])
            setSelectedRow([])
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
                                message.error(formatMessage({ id: 'TestSuite.data.format.error' }));
                                return
                            }
                        }
                    } else {
                        message.error(formatMessage({ id: 'TestSuite.data.format.error' }));
                        return
                    }
                } catch (e) {
                    message.error(formatMessage({ id: 'TestSuite.data.format.error' }));
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
                message.error(formatMessage({ id: 'TestSuite.repeated.suite.name' }));
                return
            }
            if (code == 202) {
                message.error(msg);
                return
            }
        }

        confDrawer.current.hide()
        message.success(formatMessage({ id: 'operation.success' }));
        setConfRefresh(!confRefresh)
    }

    // 单个编辑
    const editInner = (row: any) => {
        row.var = row.var ? JSON.parse(row.var) : [{ name: '', val: '', des: '' }]
        row.is_default = row.is_default ? 1 : 0
        const arr = row.domain_id_list === '' ? [] : row.domain_id_list.split(',')
        let newArr = [];
        for (var i = 0; i < arr.length; i++) {
            newArr.push(Number.parseInt(arr[i]));
        }
        row.domain_list_str = newArr
        domainList.forEach((item: any) => { if (item.name == row.domain) row.domain = item.id })
        confDrawer.current.show('edit', row)
    }
    // 单个删除前查询
    const deleteInner = async (row: any) => {
        const data = await queryConfirm({ flag: 'pass', case_id_list: row.id })
        if (data.code === 200) setDeleteVisible(true)
        else setDeleteDefault(true)
        setDeleteObj(row)
    }

    // 批量删除前查询
    const queryDeleteAll = async () => {
        try {
            const data = await queryConfirm({ flag: 'pass', case_id_list: selectedRowKeys.join() }) || {}
            if (data.code === 200) setDeleteVisible(true)
            else setDeleteDefault(true)
            setDeleteObj({})
        } catch (e) {
            console.log(e)
        }
    }
    // 批量编辑
    const editAll = () => {
        confDrawer.current.show('batch.edit', { bentch: true, test_suite_id: id })
    }

    const handleInnerTab = (key: string, id: number) => {
        setInnerKey(key)
        if (innerKey == '1') return
        setConfRefresh(!confRefresh)
    }

    // 确定删除
    const remInnner = () => {
        if (deleteObj.id) {
            submitDelConf();
        } else {
            submitDelConfAll();
        }
    }

    const handleDetail = () => {
        let newData: any = []
        selectedRow.foreach((item: any) => newData.push(item.name))
        if (!deleteObj.id) {
            window.open(`/refenerce/conf/?name=${newData.join(',')}&id=${selectedRowKeys.join(',')}`)
        } else {
            window.open(`/refenerce/conf/?name=${deleteObj.name}&id=${deleteObj.id}`)
        }

    }
    const newCase = () => {
        confDrawer.current.show('new', { bentch: false, test_suite_id: id })
    }

    const rowSelection = + status === 0 ? {
        selectedRowKeys,
        onChange: (selectedRowKeys: any[], selectedRows: any) => {
            setSelectedRow(selectedRows)
            setSelectedRowKeys(selectedRowKeys)
        }
    } : undefined

    const onExpand = async (record: any) => {
        setExpandInnerKey([record.id])
    }

    const columns = [
        { title: 'Test Conf', dataIndex: 'name', width: 300, fixed: 'left', ellipsis: true, render: (_: any, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={row.name} /> },
        { title: <FormattedMessage id="TestSuite.alias" />, dataIndex: 'alias', width: 100, ellipsis: true, render: (_: any) => <>{_ ? _ : '-'}</> },
        { title: <FormattedMessage id="TestSuite.domain" />, width: 100, dataIndex: 'domain_name_list', render: (text: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={text || '-'} /> },
        { title: <FormattedMessage id="TestSuite.timeout" />, dataIndex: 'timeout', width: 160 },
        { title: <FormattedMessage id="TestSuite.default.repeat" />, width: '120px', dataIndex: 'repeat', ellipsis: true },
        {
            title: <FormattedMessage id="TestSuite.var" />,
            ellipsis: {
                showTitle: false
            },
            key: "var",
            width: 100,
            render: (_: number, row: any) => (
                <Typography.Text ellipsis={{ tooltip: true }}>
                    {
                        row.var && row.var != '[]' ? JSON.parse(row.var).map((item: any) => {
                            return `${item.name}=${item.val || '-'},${item.des || '-'};`
                        }) : '-'
                    }
                </Typography.Text>
            ),
        },
        {
            title: <FormattedMessage id="TestSuite.desc" />,
            key: "desc",
            ellipsis: true,
            width: 100,
            render: (_: any, row: any) => (
                <ButtonEllipsis title={row.doc} width={70} isCode={true}>
                    <EditOutlined
                        className={styles.edit}
                        onClick={() => descFastEdit.current.show(row)}
                    />
                </ButtonEllipsis>
            )
        },
        {
            title: <FormattedMessage id="TestSuite.default.case" />,
            dataIndex: 'doc',
            width: '80px',
            render: (_: any, row: any) => row.is_default ? <FormattedMessage id="operation.yes" /> : <FormattedMessage id="operation.no" />
        },
        {
            title: <FormattedMessage id="TestSuite.is_certified" />,
            dataIndex: 'certificated',
            width: '80px',
            render: (_: any, row: any) => row.certificated ? <FormattedMessage id="operation.yes" /> : <FormattedMessage id="operation.no" />
        },
        {
            title: <FormattedMessage id="TestSuite.gmt_created" />,
            dataIndex: 'gmt_created',
            ellipsis: {
                showTitle: false
            },
            width: '190px',
            render: (_: number, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.gmt_created}</ColumnEllipsisText>
        },
        {
            title: (
                <Space align="center">
                    <FormattedMessage id="Table.columns.operation" />
                    <Button type='primary' onClick={newCase} >
                        <FormattedMessage id="operation.new" />
                    </Button>
                </Space>
            ),
            valueType: 'option',
            dataIndex: 'operation',
            width: 150,
            fixed: 'right',
            render: (_: number, row: any) => (
                <Space>
                    <Typography.Link onClick={() => editInner({ ...row })}><FormattedMessage id="operation.edit" /></Typography.Link>
                    <Typography.Link onClick={() => deleteInner({ ...row })}><FormattedMessage id="operation.delete" /></Typography.Link>
                </Space>
            ),
        },
    ];

    const handlePage = (page_num: number, page_size: number) => {
        setConfPage(page_num)
        setConfPageSize(page_size)
    }

    // 编辑描述回调
    const handleEditDesc = async (data: any) => {
        const { code, msg } = await editCase(data.id, { doc: data.doc })
        if (code === 200) {
            message.success(formatMessage({ id: 'operation.success' }))
            descFastEdit.current.hide()
            setConfRefresh(!confRefresh)
        }
        else requestCodeMessage(code, msg)
    }

    return (
        <div className={`${styles.warp} case_table_wrapper`}>
            {test_type === 'performance' &&
                <Tabs defaultActiveKey={'1'} activeKey={innerKey} onChange={(key) => handleInnerTab(key, id)} >
                    <TabPane
                        tab="Test Conf"
                        key="1"
                    />
                    <TabPane
                        tab={<FormattedMessage id="TestSuite.conf.metric" />}
                        key="2"
                    />
                </Tabs>
            }
            {innerKey == '1' ?
                <CommonTable
                    className={styles.FuncOrPerfConfList_root}
                    columns={columns as any}
                    name="sys-suite-business-fun-or-perf-conf"
                    // scrollType={1400}
                    scroll={{ x: 1400 }}
                    rowKey={"id"}
                    loading={expandLoading}
                    dataSource={expandList.data}
                    page={expandList.page_num}
                    rowSelection={rowSelection}
                    totalPage={expandList.total_page}
                    total={expandList.total}
                    pageSize={expandList.page_size}
                    paginationBottom={true}
                    handlePage={handlePage}
                    expandable={
                        test_type == 'performance' ?
                            {
                                expandedRowRender: (record: any) => <MetricTable componentType={"case"} id={record.id} innerKey={innerKey} />,
                                onExpand: (_: any, record: any) => {
                                    _ ? onExpand(record) : setExpandInnerKey([])
                                },
                                expandedRowKeys: expandInnerKey,
                                expandIcon: ({ expanded, onExpand, record }: any) =>
                                    expanded ? (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                                        (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                            } :
                            {}
                    }
                />
                :
                <MetricTable componentType={"suite"} id={id} innerKey={innerKey} />
            }

            {/** 新增TestConf */}
            <ConfEditDrawer ref={confDrawer} onOk={submitCase} />

            {/** 编辑说明 */}
            <DesFastEditDrawer ref={descFastEdit} onOk={handleEditDesc} />

            {/** 200表示删除有引用;*/}
            <Modal
                title={<FormattedMessage id="delete.tips" />}
                footer={[
                    <Button key="submit" onClick={remInnner}>
                        <FormattedMessage id="operation.confirm.delete" />
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteVisible(false)}>
                        <FormattedMessage id="operation.cancel" />
                    </Button>
                ]}
                centered={true}
                className={styles.modalChange}
                visible={deleteVisible}
                onCancel={() => setDeleteVisible(false)}
                width={600}
                maskClosable={false}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    {deleteObj.name ?
                        formatMessage({ id: 'TestSuite.conf.name.delete.warning' }, { data: deleteObj.name })
                        :
                        formatMessage({ id: 'TestSuite.have.conf.delete.warning' })
                    }
                </div>
                <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
                    <FormattedMessage id="TestSuite.conf.delete.range" />
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}><FormattedMessage id="view.reference.details" /></div>
            </Modal>
            {/** 201表示可以直接删除 */}
            <Modal
                title={<FormattedMessage id="delete.tips" />}
                centered={true}
                className={styles.modalChange}
                visible={deleteDefault}
                onCancel={() => setDeleteDefault(false)}
                footer={[
                    <Button key="submit" onClick={remInnner}>
                        <FormattedMessage id="operation.confirm.delete" />
                    </Button>,
                    <Button key="back" type="primary" onClick={() => { setDeleteDefault(false); setDeleteObj({}) }}>
                        <FormattedMessage id="operation.cancel" />
                    </Button>
                ]}
                width={300}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    <FormattedMessage id="delete.prompt" />
                </div>
            </Modal>

            {/**批量操作 */}
            {selectedRowKeys.length > 0 &&
                <div className={styles.batch}>
                    <Space>
                        <Checkbox indeterminate={true} />
                        <Typography.Text>
                            {formatMessage({ id: 'selected.item' }, { data: selectedRowKeys?.length })}
                        </Typography.Text>
                        <Button type="link" onClick={() => { setSelectedRow([]); setSelectedRowKeys([]) }}><FormattedMessage id="operation.cancel" /></Button>
                    </Space>
                    <Space>
                        <Button onClick={queryDeleteAll}><FormattedMessage id="operation.batch.delete" /></Button>
                        <Button type="primary" onClick={editAll}><FormattedMessage id="operation.batch.edit" /></Button>
                    </Space>
                </div>
            }
        </div>
    );
});
