import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Table, PageHeader, Layout, Button, Row, Space, Select, Input, Typography, Modal, Tooltip, Spin, message } from 'antd'
import { history, useParams, useIntl, FormattedMessage } from 'umi'
import { PlusCircleFilled, MinusCircleFilled, CaretRightFilled, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { ReactComponent as UnFullExpand } from '@/assets/svg/un_full.svg'
import { test_type_enum } from '@/utils/utils'
import { queryTestSuiteList, saveSuiteCaseList, queryWorkspaceSuiteList, queryWsCaseConfirm } from './service'
import { queryDomains, queryBusinessSuite, queryWorkspaceBusinessSuite } from '@/pages/WorkSpace/TestSuiteManage/service'

import styles from './index.less'
import { unionBy } from 'lodash'
import CodeViewer from '@/components/CodeViewer'
import { useClientSize } from '@/utils/hooks'

const TestSuiteCreate: React.FC = () => {
    const { formatMessage } = useIntl()
    const { ws_id, test_type }: any = useParams()

    const [leftWsHasSuiteArr, setLeftWsHasSuiteArr] = useState<Array<any>>([])
    const [flag, setFlag] = useState(true)
    const [btnLoad, setBtnLoad] = useState(false)
    const [suiteList, setSuiteList] = useState<Array<any>>([])
    const [suiteParams, setSuiteParams] = useState({ domain: '', test_type, name: '', scope: 'brief_case' })
    const [expandRows, setExpandRows] = useState<Array<number>>([])
    const [addFlag, setAddFlag] = useState(false)
    const [loading, setLoading] = useState(true)
    const [domainList, setDomainList] = useState<any>([])
    const [domainValue, setDomainValue] = useState<any>('')
    const [searchInp, setSearchInp] = useState<any>('')
    const [delType, setDelType] = useState<any>('suite')
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [leftTableLoading, setLeftTableLoading] = useState(true)

    const { height: layoutHeight } = useClientSize()
    const getDomains = async () => {
        const { data: domains } = await queryDomains()
        setDomainList(domains)
    }

    let timer: any = null

    useEffect(() => {
        getDomains()
        return () => {
            clearTimeout(timer)
        }
    }, [])

    // 下拉框领域切换函数
    const getTestSuiteList = async () => {
        let wsHasSuiteArr: any = leftWsHasSuiteArr
        let suiteListArr: any = []
        setLoading(true)

        if (leftWsHasSuiteArr.length === 0 && ws_id && flag) {
            setLeftTableLoading(true)
            const { data: list } = test_type === 'business' ?
                await queryWorkspaceBusinessSuite({ ws_id, scope: 'brief' }) :
                await queryWorkspaceSuiteList({ ws_id, test_type, scope: 'brief_case', page_size: 100 })
            wsHasSuiteArr = list
        }

        const { domain, name } = suiteParams
        const { data } = test_type === 'business' ? await queryBusinessSuite({ domain, name }) : await queryTestSuiteList(suiteParams)

        if (wsHasSuiteArr.length > 0) {
            suiteListArr = data.map(
                (suite: any) => {
                    for (let index = 0; index < wsHasSuiteArr.length; index++) {
                        let hasSuiteItem = wsHasSuiteArr[index];

                        if (suite.id === hasSuiteItem.id) {
                            if (hasSuiteItem.test_case_list.length > 0) {
                                let addCaseCount: any = 0
                                let test_case_list: any = suite.test_case_list

                                test_case_list = test_case_list.map(
                                    (cases: any) => {
                                        hasSuiteItem.test_case_list.forEach(
                                            (hasCase: any) => {
                                                if (hasCase.id === cases.id) {
                                                    cases = { ...cases, isAdd: true }
                                                    addCaseCount++
                                                }
                                            }
                                        )
                                        return cases
                                    }
                                )
                                // 二级用例添加的数量
                                if (addCaseCount === suite.test_case_list.length) addCaseCount = 'all'

                                return { ...suite, hasAdd: true, addCaseCount, test_case_list }
                            }
                            return { ...suite, hasAdd: true, addCaseCount: 'all' }
                        }
                    }
                    return { ...suite, addCaseCount: 0, hasAdd: false }
                }
            )
        }
        else
            suiteListArr = data.map((item: any) => ({ ...item, hadAdd: false, addCaseCount: 0 }))

        computeLeftTableData(suiteListArr, wsHasSuiteArr)
        setFlag(false)
        setSuiteList(suiteListArr)
        setLoading(false)
        setLeftTableLoading(false)
    }

    useEffect(() => {
        getTestSuiteList()
    }, [suiteParams])

    const onExpand = async (record: any) => {
        setExpandRows([+ record.id])
    }

    useEffect(() => {
        return () => {
            clearTimeout(timer)
        }
    }, []);

    const handleRestore = () => {
        window.location.reload();
    }
    const handleTestSuiteSearch = () => {
        const suiteSearchFn = () => setSuiteParams({ ...suiteParams, name: searchInp })
        timer && clearTimeout(timer)
        timer = setTimeout(suiteSearchFn, 300)
    }

    const handleTestSuiteSelect = (domain: string) => {
        setSuiteParams({ ...suiteParams, domain })
        setDomainValue(domain)
    }

    const handleBackPage = useCallback(
        () => {
            history.go(-1)
        },
        []
    )
    // 右侧 二级test suit添加
    const handleTestSuiteChildPlus = (_: any, record: any) => {
        setAddFlag(true)
        // 已经添加过了
        if (_.isAdd)
            return

        let addCaseCount: any = 0
        let hasAdd = record.hasAdd
        let addCaseList: Array<any> = []

        const test_case_list = record.test_case_list.map(
            (item: { isAdd: any, id: any }) => {
                if (item.isAdd) {
                    addCaseCount++
                    addCaseList.push(item)
                    return item
                }
                if (item.id === _.id) {
                    hasAdd = true
                    addCaseCount++
                    let newAddCase = { ...item, isAdd: true }
                    addCaseList.push(newAddCase)
                    return newAddCase
                }
                return item
            }
        )

        if (addCaseCount === record.test_case_list.length) addCaseCount = 'all'

        const arr = suiteList.map(
            (suite: any) => {
                return suite.id === record.id ?
                    { ...suite, test_case_list, hasAdd, addCaseCount } : suite
            }
        )
        setSuiteList(arr)
        computeLeftTableData(arr)
    }

    // 右侧一级test suit添加
    const handleTestSuitePlus = (record: any) => {
        setAddFlag(true)
        const arr = suiteList.map(
            (suite: any) => {
                if (suite.id === record.id) {
                    // 有二级 suit test
                    if (suite.test_case_list && suite.test_case_list.length > 0) {
                        const test_case_list = suite.test_case_list.map((item: any) => ({ ...item, isAdd: true }))
                        return { ...suite, addCaseCount: 'all', hasAdd: true, test_case_list }
                    }
                    // 无二级 
                    else return { ...suite, addCaseCount: 'all', hasAdd: true }
                }
                return suite
            }
        )
        setSuiteList(arr)
        computeLeftTableData(arr)
    }
    // 左侧表格二级取消添加图标
    const handleIsAddSuiteChildMinus = (_: any, row: any) => {
        setDelType('conf')
        setAddFlag(false)
        setSuiteList(
            suiteList.map(
                (suite: any) => {
                    let addCaseCount = 0
                    if (suite.id === _.id) {
                        const test_case_list = suite.test_case_list.map(
                            (item: { id: any; isAdd: any }) => {
                                if (item.id === row.id) {
                                    return { ...item, isAdd: false }
                                }
                                if (item.isAdd) addCaseCount++
                                return item
                            }
                        )

                        return addCaseCount === 0 ?
                            { ...suite, addCaseCount, hasAdd: false, test_case_list } :
                            { ...suite, addCaseCount, test_case_list }
                    }
                    return suite
                }
            )
        )
        let arr = leftWsHasSuiteArr.map(suite => {
            if (suite.id === _.id) {
                const test_case_list = suite.test_case_list.filter((item: any) => item.id !== row.id)
                suite.test_case_list = test_case_list
            }
            return suite
        })

        arr = arr.filter(item => item && item.test_case_list.length)
        setLeftWsHasSuiteArr(arr)
    }
    // 左侧表格一级取消图标
    const handleIsAddSuiteMinus = (record: any) => {
        setDelType('suite')
        setAddFlag(false)
        setSuiteList(
            suiteList.map(
                (suite: any) => {
                    if (suite.id === record.id) {
                        if (suite.test_case_list && suite.test_case_list.length > 0) {
                            const test_case_list = suite.test_case_list.map(
                                (item: any) => ({ ...item, isAdd: false })
                            )
                            return { ...suite, hasAdd: false, addCaseCount: 0, test_case_list }
                        }
                        return { ...suite, hasAdd: false, addCaseCount: 0 }
                    }
                    return suite
                }
            )
        )
        const arr = leftWsHasSuiteArr.filter(item => item && item.id !== record.id)
        setLeftWsHasSuiteArr(arr)
    }

    const case_id_list = useMemo(() => {
        let caseIdList: number[] = []
        leftWsHasSuiteArr.forEach(
            (suite: any) => {
                if (suite.test_case_list && suite.test_case_list.length > 0)
                    caseIdList = caseIdList.concat(...suite.test_case_list.map((item: { id: any }) => item.id))
            }
        )
        return caseIdList.toString()
    }, [leftWsHasSuiteArr])

    const handleDelete = async () => {
        setBtnLoad(true)
        if (ws_id) {
            //setPadding(true)
            const data = await saveSuiteCaseList({
                case_id_list,
                ws_id,
                suite_id_list: '',
                test_type
            })
            //setPadding(false)
            if (data.code === 200) {
                setBtnLoad(false)
                message.success(formatMessage({ id: 'operation.success' }))
                history.go(-1)
            }
            else
                message.error(formatMessage({ id: 'operation.failed' }))
        }
    }

    const handleCancel = () => {
        setDeleteVisible(false)
    }

    const handleDetail = () => {
        window.open(`/ws/${ws_id}/refenerce/1/?test_type=${test_type}&name=${delType}&id=${case_id_list}`)
    }

    const handleSave = async () => {
        if (addFlag) {
            handleDelete()
        } else {
            const data = await queryWsCaseConfirm({
                flag: 'pass',
                ws_id,
                suite_id_list: '',
                case_id_list,
                test_type
            })
            if (data.code == 200) {
                setDeleteVisible(true)
            } else {
                handleDelete()
            }
        }
    }

    const computeLeftTableData = (suiteListArr: any, leftTableData: any = leftWsHasSuiteArr) => {
        let leftSuites: any = []

        suiteListArr.forEach(
            (suite: any) => {
                if (suite.addCaseCount === 'all')
                    leftSuites.push(suite)
                else if (suite.addCaseCount) {
                    let test_case_list: any = []
                    for (let x of suite.test_case_list) {
                        if (x.isAdd) test_case_list.push(x)
                    }
                    leftSuites.push({ ...suite, test_case_list })
                }
            }
        )

        const arr = unionBy(leftSuites, leftTableData, 'id');
        setLeftWsHasSuiteArr(arr)
    }

    const leftTableDataSource = leftWsHasSuiteArr

    const toolTipSetting = {
        ellipsis: {
            showTitle: false
        },
        render: (_: any) => {
            if (_ && _ !== '[]')
                return (
                    <Tooltip placement={_ && _.length > 100 ? 'left' : 'top'} title={_ && _ !== '[]' ? _ : '-'} >
                        <span>{_ && _ !== '[]' ? _ : '-'}</span>
                    </Tooltip>
                )
            else return <span>-</span>
        }
    }

    const handleAddAllSuite = () => {
        const arr = suiteList.map((suite: any) => {
            return {
                ...suite,
                hasAdd: true,
                addCaseCount: "all",
                test_case_list: suite.test_case_list.map((conf: any) => ({ ...conf, isAdd: true }))
            }
        })
        setSuiteList(arr)
        setLeftWsHasSuiteArr(arr)
    }

    const hanldeRemoveAllSelectedSuite = () => {
        setSuiteList(
            (list: any[]) => list.map(
                (suite: any) => {
                    if (suite.test_case_list && suite.test_case_list.length > 0) {
                        const test_case_list = suite.test_case_list.map(
                            (item: any) => ({ ...item, isAdd: false })
                        )
                        return { ...suite, hasAdd: false, addCaseCount: 0, test_case_list }
                    }
                    return { ...suite, hasAdd: false, addCaseCount: 0 }
                }
            )
        )
        setLeftWsHasSuiteArr([])
    }


    const title = useMemo(() => {
        if (test_type === 'business') {
            return <FormattedMessage id="suite.business" />
        } else if (test_type === 'functional') {
            return <FormattedMessage id="suite.functional" />
        }
        return <FormattedMessage id="suite.performance" />
    }, [test_type])

    return (
        <Layout.Content style={{ height: layoutHeight, overflow: 'hidden' }}>
            <PageHeader
                className={styles.suite_nav_bar}
                title={<FormattedMessage id="test.suite.manage" />}
                onBack={handleBackPage}
                extra={
                    <Space>
                        <Button
                            //type="primary"
                            onClick={handleRestore}
                        >
                            <FormattedMessage id="suite.recovery" />
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSave}
                            disabled={btnLoad}
                            loading={btnLoad}
                        >
                            <FormattedMessage id="operation.save" />
                        </Button>
                    </Space>
                }
            />
            <Layout style={{ height: 'calc(100% - 50px)' }}>
                <Row style={{ padding: 20, height: '100%', background: '#f5f5f5' }}>
                    {/* left ---- suite & conf  */}
                    <div
                        className={styles.suite_left_wrapper}
                        style={{ height: innerHeight - 50 - 40 }}
                    >
                        <PageHeader title={<FormattedMessage id="suite.added" />} />
                        {
                            <Spin spinning={leftTableLoading}>
                                {
                                    leftTableDataSource.length === 0 ?
                                        <div style={{ textAlign: 'center', marginTop: 192 }}>
                                            <Typography.Text><FormattedMessage id="suite.click.right" />&nbsp;</Typography.Text>
                                            <PlusCircleFilled style={{ color: '#1890ff' }} />
                                            <Typography.Text><FormattedMessage id="suite.add.to.workspace" /></Typography.Text>
                                        </div> :
                                        <Table
                                            size="small"
                                            className={styles.right_table_style}
                                            scroll={{ y: innerHeight - 90 - 72 - 39 }}
                                            columns={[
                                                Table.SELECTION_COLUMN,
                                                Table.EXPAND_COLUMN,
                                                { title: 'Test Suite', dataIndex: 'name' }
                                            ]}
                                            rowSelection={{
                                                columnWidth: 24,
                                                columnTitle: (
                                                    <MinusCircleFilled
                                                        style={{ color: 'red' }}
                                                        onClick={
                                                            () => hanldeRemoveAllSelectedSuite()
                                                        }
                                                    />
                                                ),
                                                renderCell(_, record, index) {
                                                    return (
                                                        <MinusCircleFilled
                                                            style={{ color: 'red' }}
                                                            onClick={
                                                                () => handleIsAddSuiteMinus(record)
                                                            }
                                                        />
                                                    )
                                                }
                                            }}
                                            dataSource={leftTableDataSource}
                                            expandable={{
                                                columnWidth: 24,
                                                onExpand: (_, record) => _ ? onExpand(record) : setExpandRows([]),
                                                expandedRowKeys: expandRows,
                                                expandedRowRender: (_: any) => (
                                                    <Table
                                                        locale={{ emptyText: <FormattedMessage id="suite.no.data" /> }}
                                                        size="small"
                                                        columns={[{
                                                            render: (row: any) => (
                                                                <Space>
                                                                    <MinusCircleFilled
                                                                        style={{ color: 'red' }}
                                                                        onClick={
                                                                            () => handleIsAddSuiteChildMinus(_, row)
                                                                        }
                                                                    />
                                                                    <Typography.Text>{row.name}</Typography.Text>
                                                                </Space>
                                                            )
                                                        }]}
                                                        rowKey="id"
                                                        showHeader={false}
                                                        pagination={false}
                                                        dataSource={_.test_case_list || []}
                                                    />
                                                ),
                                                expandIcon: ({ expanded, onExpand, record }: any) => (
                                                    <CaretRightFilled
                                                        rotate={expanded ? 90 : 0}
                                                        onClick={(e: any) => onExpand(record, e)}
                                                    />
                                                )
                                            }}
                                            rowKey="id"
                                            pagination={false}
                                        />
                                }
                            </Spin>
                        }
                    </div>
                    {/* right ---- suite & conf  */}
                    <div
                        className={styles.suite_right_wrapper}
                        style={{ height: innerHeight - 50 - 40 }}
                    >
                        <PageHeader
                            title={title}
                            extra={
                                <Space>
                                    <Select
                                        value={domainValue}
                                        onSelect={handleTestSuiteSelect}
                                        style={{ width: 148 }}
                                        filterOption={(input, option: any) => {
                                            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }}
                                        allowClear
                                        showSearch
                                        options={
                                            [{ value: "", label: formatMessage({ id: "suite.all.domain" }) }].concat(
                                                domainList.map((item: any) => ({
                                                    value: item.id,
                                                    label: item.name
                                                }))
                                            )
                                        }
                                    />
                                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'center' }}>
                                        <Input
                                            style={{ width: 160, height: 32 }}
                                            allowClear
                                            value={searchInp}
                                            onChange={({ target }) => setSearchInp(target.value)}
                                            onPressEnter={handleTestSuiteSearch}
                                            placeholder={formatMessage({ id: 'suite.search.TestSuites' })}
                                        />
                                        <span
                                            className={styles.search_input_style}
                                            onClick={handleTestSuiteSearch}
                                        >
                                            <SearchOutlined />
                                        </span>
                                    </div>
                                </Space>
                            }
                        />

                        <Table
                            rowKey="id"
                            loading={loading}
                            columns={test_type === 'business' ?
                                [
                                    Table.SELECTION_COLUMN,
                                    Table.EXPAND_COLUMN,
                                    { title: 'Test Suite', dataIndex: 'name', },
                                    { title: formatMessage({ id: 'suite.business_name' }), dataIndex: 'business_name', },
                                    { title: formatMessage({ id: 'suite.test_type' }), dataIndex: 'test_type', render: (text: any, record: any) => <>{test_type_enum.map((item) => item.value === text ? formatMessage({ id: item.value }) : '')}</>, },
                                ]
                                :
                                [
                                    Table.SELECTION_COLUMN,
                                    Table.EXPAND_COLUMN,
                                    { title: 'Test Suite', dataIndex: 'name', },
                                    { title: formatMessage({ id: 'suite.var' }), dataIndex: 'var', width: 180, ...toolTipSetting },
                                    {
                                        title: formatMessage({ id: 'suite.description' }),
                                        dataIndex: 'doc',
                                        ellipsis: {
                                            showTitle: false,
                                        },
                                        width: 200,
                                        render(text: any, record: any) {
                                            const { doc, description } = record
                                            const _ = doc || description
                                            return (
                                                _ ?
                                                    <Tooltip
                                                        placement='leftTop'
                                                        // overlayClassName={styles.tooltipCss}
                                                        overlayInnerStyle={{ width: 450, height: 300, overflow: "auto" }}
                                                        color="#fff"
                                                        title={<CodeViewer code={_} />}
                                                    >
                                                        {_}
                                                    </Tooltip> :
                                                    '-'
                                            )
                                        }
                                    }
                                ]
                            }
                            size="small"
                            className={styles.left_table_style}
                            dataSource={suiteList}
                            pagination={false}
                            scroll={{ y: innerHeight - 90 - 72 - 39 }}
                            rowSelection={{
                                columnTitle: (
                                    <PlusCircleFilled
                                        style={{ color: '#1890ff', cursor: 'pointer' }}
                                        // onClick={() => handleTestSuiteChildPlus([], null)}
                                        onClick={() => handleAddAllSuite()}
                                    />
                                ),
                                columnWidth: 24,
                                renderCell(_, record, index) {
                                    const { hasAdd, addCaseCount } = record
                                    let color = '#1890ff'
                                    if (addCaseCount === 'all')
                                        color = '#eee'
                                    if (hasAdd && addCaseCount !== 'all')
                                        return (
                                            <UnFullExpand
                                                onClick={() => handleTestSuitePlus(record)}
                                                style={{ fontSize: 14, width: 14, height: 14, cursor: 'pointer' }}
                                            />
                                        )
                                    return (
                                        <PlusCircleFilled
                                            style={{ color }}
                                            onClick={() => handleTestSuitePlus(record)}
                                        />
                                    )
                                }
                            }}
                            expandable={{
                                // onExpandedRowsChange: handleExpandRowChange,
                                columnWidth: 24,
                                expandedRowKeys: expandRows,
                                onExpand: (_, record) => _ ? onExpand(record) : setExpandRows([]),
                                expandedRowRender: (record: any) => {
                                    return (
                                        <Table
                                            size="small"
                                            rowKey="id"
                                            locale={{ emptyText: <FormattedMessage id="suite.no.data" /> }}
                                            columns={test_type === 'business' ?
                                                [{
                                                    render: (_: any) => (
                                                        <Space>
                                                            {/*添加图标*/}
                                                            <PlusCircleFilled
                                                                style={{ color: _.isAdd ? '#eee' : '#1890ff', cursor: 'pointer' }}
                                                                onClick={() => handleTestSuiteChildPlus(_, record)}
                                                            />
                                                            <Typography.Text>{_.name}</Typography.Text>
                                                        </Space>
                                                    )
                                                },]
                                                :
                                                [
                                                    {
                                                        render: (_: any) => (
                                                            <Space>
                                                                {/*添加图标*/}
                                                                <PlusCircleFilled
                                                                    style={{ color: _.isAdd ? '#eee' : '#1890ff', cursor: 'pointer' }}
                                                                    onClick={() => handleTestSuiteChildPlus(_, record)}
                                                                />
                                                                <Typography.Text>{_.name}</Typography.Text>
                                                            </Space>
                                                        )
                                                    },
                                                    { title: formatMessage({ id: 'suite.var' }), dataIndex: 'var', width: 180, ...toolTipSetting },
                                                    {
                                                        dataIndex: 'doc',
                                                        ellipsis: true,
                                                        width: 200,
                                                        render(text: any, record: any) {
                                                            const { doc, description } = record
                                                            const _ = doc || description
                                                            return (
                                                                _ ?
                                                                    <Tooltip
                                                                        placement='leftTop'
                                                                        // overlayClassName={styles.tooltipCss}
                                                                        overlayInnerStyle={{ width: 450, height: 300, overflow: "auto" }}
                                                                        color="#fff"
                                                                        title={<CodeViewer code={_} />}
                                                                    >
                                                                        {_}
                                                                    </Tooltip> :
                                                                    '-'
                                                            )
                                                        }
                                                    }
                                                ]
                                            }
                                            dataSource={record.test_case_list}
                                            showHeader={false}
                                            pagination={false}
                                        />
                                    )
                                },
                                expandIcon: ({ expanded, onExpand, record }: any) => {
                                    return (
                                        <CaretRightFilled
                                            rotate={expanded ? 90 : 0}
                                            style={{ cursor: 'pointer' }}
                                            onClick={(e: any) => onExpand(record, e)}
                                        />
                                    )
                                }
                            }}
                        />
                    </div>
                </Row>
            </Layout>
            <Modal
                title={<FormattedMessage id="delete.tips" />}
                centered={true}
                visible={deleteVisible}
                //onOk={remOuter}
                onCancel={handleCancel}
                footer={[
                    <Button key="submit" onClick={handleDelete} loading={btnLoad}>
                        <FormattedMessage id="operation.confirm.delete" />
                    </Button>,
                    <Button key="back" type="primary" onClick={handleCancel}>
                        <FormattedMessage id="operation.cancel" />
                    </Button>
                ]}
                width={600}
                maskClosable={false}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    {formatMessage({ id: 'suite.please.delete.carefully' }, { data: delType === 'suite' ? 'Suite' : 'Conf' })}
                </div>
                <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
                    {formatMessage({ id: 'suite.delete.influence.range' }, { data: delType === 'suite' ? 'Suite' : 'Conf' })}
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>
                    <FormattedMessage id="suite.view.reference.details" />
                </div>
            </Modal>
        </Layout.Content>
    )
}

export default TestSuiteCreate