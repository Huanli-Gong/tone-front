import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Space, Drawer, message, Pagination, Tooltip, Row, Alert, Table, Spin, Typography } from 'antd';
import { CaretRightFilled, CaretDownFilled, FilterFilled, EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { suiteList, addSuite, editSuite, delSuite, syncSuite, manual, lastSync, batchDeleteMetric } from '../service';
import ButtonEllipsis from '@/components/Public/ButtonEllipsis';
import Highlighter from 'react-highlight-words';
import { suiteChange } from '@/components/Public/TestSuite/index.js';
import styles from './style.less';
import CaseTable from './components/CaseTable';
import SelectCheck from '@/components/Public//SelectCheck';
import SearchInput from '@/components/Public/SearchInput';
import SelectDrop from '@/components/Public//SelectDrop';
import SelectRadio from '@/components/Public/SelectRadio';
import { useLocation, useIntl, FormattedMessage, getLocale } from 'umi'
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

import DeleteTips from "./components/DeleteTips"
import DeleteDefault from "./components/DeleteDefault"
import MetricBatchDelete from './components/MetricTable/MetricBatchDelete';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

let timeout: any = null;
let timer: any = null;

const SuiteManagement: React.ForwardRefRenderFunction<AnyType, AnyType> = (props, ref) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'

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
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])
    const [selectedRow, setSelectedRow] = useState<any>([])
    const [confRefresh, setConfRefresh] = useState<boolean>(true)
    const [dataSource, setDataSource] = useState<any>([])
    const [asyncTime, setAsyncTime] = useState(new Date().getTime())

    const [metricDelInfo, setMetricDelInfo] = React.useState<AnyType>({})

    const defaultList = [
        { id: 1, name: formatMessage({ id: 'operation.yes' }) },
        { id: 0, name: formatMessage({ id: 'operation.no' }) },
    ]

    const confDrawer: any = useRef(null)
    const suiteEditDrawer: any = useRef(null)
    const deleteTipsRef = React.useRef<any>(null)
    const edscFastEditer: any = useRef(null)
    const defaultDeleteRef = React.useRef<AnyType>(null)

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

        suiteEditDrawer.current.show('edit', row) // 编辑Test Suite
    }

    const onDesSubmit = async ({ doc, id }: any) => {
        await editSuite(id, { doc })
        message.success(formatMessage({ id: 'operation.success' }));
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
        message.success(formatMessage({ id: 'operation.success' }));
        getList()
    }

    const deleteOuter = async (row: any) => {
        const { code } = await queryConfirm({ flag: 'pass', suite_id: row.id })
        if (code === 200)
            return deleteTipsRef.current?.show(row)
        defaultDeleteRef.current?.show(row)
    }

    const remOuter = async (row: any) => {
        await delSuite(row.id)
        message.success(formatMessage({ id: 'operation.success' }));
        const { page_size, page_num } = pageParams
        const remainNum = dataSource.total % page_size === 1
        const totalPage: number = Math.floor(dataSource.total / page_size)
        if (remainNum && totalPage && totalPage + 1 <= page_num)
            setPageParams((p: any) => ({ ...p, total: totalPage }))
        else
            getList()
    }

    const synchro = async (row: any) => {
        setSync(true)
        const hide = message.loading({ content: formatMessage({ id: 'operation.synchronizing' }), duration: 0 })
        const { code, msg } = await syncSuite(row.id)
        setSync(false)
        hide()
        if (code !== 200) {
            message.warning(`${formatMessage({ id: 'request.synchronize.failed' })}，${msg}`)
            return
        }
        message.success(formatMessage({ id: 'request.synchronize.success' }))
        getList()
        setAsyncTime(new Date().getTime())
    }

    const columns: any = [
        {
            title: 'Test Suite',
            dataIndex: 'name',
            width: 300,
            fixed: 'left',
            ellipsis: true,
            filterDropdown: (p) => {
                console.log(confirm)
                return (
                    <SearchInput
                        {...p}
                        // autoFocus={autoFocus}
                        onConfirm={(val: string) => { setPageParams({ ...pageParams, name: val }) }}
                    />
                )
            },
            filterIcon: () => <FilterFilled style={{ color: pageParams.name ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: row.name }}  >
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[pageParams.name || '']}
                        autoEscape
                        textToHighlight={row.name.toString()}
                    />
                </ColumnEllipsisText>
            )
        },
        {
            title: <FormattedMessage id="TestSuite.run_mode" />,
            dataIndex: 'run_mode',
            render: (_: any) => _ === 'standalone' ? <FormattedMessage id="standalone" /> : <FormattedMessage id="cluster" />,
            width: enLocale ? 150 : 100,
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
            title: <FormattedMessage id="TestSuite.domain" />,
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
        testType !== 'functional' &&
        {
            title: (
                <Space>
                    <FormattedMessage id="TestSuite.view_type" />
                    <Tooltip
                        title={
                            <div>
                                <div><FormattedMessage id="TestSuite.view_type.1" /></div>
                                <div><FormattedMessage id="TestSuite.view_type.2" /></div>
                                <div><FormattedMessage id="TestSuite.view_type.3" /></div>
                            </div>
                        }
                        placement="bottomLeft"
                    >
                        <QuestionCircleOutlined />
                    </Tooltip>
                </Space>
            ),
            dataIndex: 'view_type',
            render: (_: any, record: any) => suiteChange(_, record),
            width: 120,
            ellipsis: true,
        },
        {
            title: <FormattedMessage id="TestSuite.desc" />,
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
            title: <FormattedMessage id="TestSuite.default.case" />,
            width: enLocale ? 130 : 110,
            render: (_: any, row: any) => row.is_default ? <FormattedMessage id="operation.yes" /> : <FormattedMessage id="operation.no" />,
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
                    <FormattedMessage id="TestSuite.is_certified" />
                    <Tooltip
                        title={<div><FormattedMessage id="TestSuite.is_certified.title" /></div>}
                        placement="bottomLeft"
                    >
                        <QuestionCircleOutlined />
                    </Tooltip>
                </Space>
            ),
            width: 120,
            render: (_: any, row: any) => row.certificated ? <FormattedMessage id="operation.yes" /> : <FormattedMessage id="operation.no" />,
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
            width: 100,
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: pageParams.owner ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectDrop
                    confirm={confirm}
                    onConfirm={(val: number) => setPageParams({ ...pageParams, owner: val })}
                />
            ),
        },
        {
            title: <FormattedMessage id="TestSuite.remarks" />,
            dataIndex: 'description',
            width: 100,
            ellipsis: true,
        },
        {
            title: <FormattedMessage id="TestSuite.gmt_created" />,
            dataIndex: 'gmt_created',
            width: 200,
            sorter: true,
            render: (_: any, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={row.gmt_created} />
        },
        {
            title: <FormattedMessage id="TestSuite.gmt_modified" />,
            dataIndex: 'gmt_modified',
            sorter: true,
            width: 200,
            render: (_: any, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={row.gmt_modified} />
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            valueType: 'option',
            dataIndex: 'id',
            width: enLocale ? 190 : 140,
            fixed: 'right',
            render: (_: any, row: any) => (
                <Space>
                    <Typography.Link onClick={() => synchro(row)}>
                        <FormattedMessage id="operation.synchronize" />
                    </Typography.Link>
                    <Typography.Link onClick={() => editOuter(row)}>
                        <FormattedMessage id="operation.edit" />
                    </Typography.Link>
                    <Typography.Link onClick={() => deleteOuter(row)}>
                        <FormattedMessage id="operation.delete" />
                    </Typography.Link>
                </Space>
            )
        },
    ].filter(Boolean)

    const [time, setTime] = useState()
    const onExpand = async (record: any) => {
        setExpandKey([record.id])
    }

    const handleSynchronous = async () => {
        const data = await manual()
        if (data.code === 200) {
            message.success(formatMessage({ id: 'request.synchronize.command.success' }))
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

    const totalPaginationClass = (total: any) => {
        return !total || total <= 0 ? styles.hidden : ''
    }

    const handleBatchDelete = async (selectRowKeys: React.Key[], is_sync?: any) => {
        const { code, msg } = await batchDeleteMetric({
            id_list: selectRowKeys,
            is_sync,
            object_id: metricDelInfo?.object_id,
            object_type: metricDelInfo?.innerkey === "1" ? "case" : "suite"
        })
        if (code !== 200) return
        message.success(formatMessage({ id: 'operation.success' }));
        metricDelInfo?.refresh()
        setMetricDelInfo({})
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
                metricDelInfo,
                setMetricDelInfo,
            }}
        >
            <Spin spinning={loading}>
                <Alert type="success"
                    showIcon
                    style={{ marginBottom: 16, height: 32 }}
                    message={
                        <span className={styles.synchronousTime}>
                            <FormattedMessage id="TestSuite.synchronize.time" />{time}
                        </span>
                    }
                    action={
                        <span
                            className={styles.synchronous}
                            onClick={handleSynchronous}
                        >
                            <FormattedMessage id="operation.synchronize" />
                        </span>
                    }
                />

                <Table
                    className={styles.suiteTable}
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
                    rowKey={record => record.id}
                    pagination={false}
                    expandable={{
                        indentSize: 0,
                        expandedRowRender: (record) => <CaseTable key={asyncTime} id={record.id} type={testType} />,
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
                            {formatMessage({ id: 'pagination.total.strip' }, { data: dataSource.total || 0 })}
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

            <MetricBatchDelete
                {...metricDelInfo}
                setMetricDelInfo={setMetricDelInfo}
                onOk={handleBatchDelete}
            />
            <DeleteDefault ref={defaultDeleteRef} onOk={remOuter} />
            <DeleteTips ref={deleteTipsRef} onOk={remOuter} />
            <ConfEditDrawer ref={confDrawer} onOk={submitCase} />
        </TestContext.Provider>
    );
};

export default forwardRef(SuiteManagement);
