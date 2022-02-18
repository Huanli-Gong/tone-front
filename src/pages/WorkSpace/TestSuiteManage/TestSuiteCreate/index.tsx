import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Table, PageHeader, Layout, Button, Row, Space, Select, Input, Typography, Modal, Tooltip, Spin, message } from 'antd'
import { history, useParams } from 'umi'
import { PlusCircleFilled, MinusCircleFilled, CaretRightFilled, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { ReactComponent as UnFullExpand } from '@/assets/svg/un_full.svg'
import { test_type_enum } from '@/utils/utils'
import { queryTestSuiteList, saveSuiteCaseList, queryWorkspaceSuiteList, queryWsCaseConfirm } from './service'
import { queryDomains, queryBusinessSuite, queryWorkspaceBusinessSuite } from '@/pages/WorkSpace/TestSuiteManage/service'

import styles from './index.less'
import { unionBy } from 'lodash'
import CodeViewer from '@/components/CodeViewer'
import { useClientSize } from '@/utils/hooks'
export default (props: any) => {
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

    const handleExpandRowChange = useCallback(
        (expandedRows: any) => {
            setExpandRows(expandedRows)
        },
        []
    )

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
        //const delArr = leftWsHasSuiteArr.filter(item => item && item.id === record.id)
        setLeftWsHasSuiteArr(arr)
    }
    // const suite_id_list = useMemo(()=>{
    //     let suiteIdList: number[] = []
    //     leftWsHasSuiteArr.forEach(
    //         (suite: any) => {
    //         if (suite.addCaseCount === 'all')
    //             suiteIdList.push(suite.id)
    //         }
    //     )
    //     return suiteIdList.toString()
    // },[ leftWsHasSuiteArr ])

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
        // let suiteIdList: number[] = []
        // let caseIdList: number[] = []
        // leftTableDataSource.forEach(
        //     (suite: any) => {
        //         if (suite.test_case_list && suite.test_case_list.length > 0)
        //             caseIdList = caseIdList.concat(...suite.test_case_list.map((item: { id: any }) => item.id))
        //         else
        //             if (suite.addCaseCount === 'all')
        //                 suiteIdList.push(suite.id)
        //     }
        // )
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
                message.success('操作成功')
                history.go(-1)
            }
            else
                message.error('提交失败，请重试!')
        }
    }
    const handleCancel = () => {
        setDeleteVisible(false)
        //history.go(-1)
    }
    const handleDetail = () => {
        // let suiteIdList: number[] = []
        // let caseIdList: number[] = []
        // leftTableDataSource.forEach(
        //     (suite: any) => {
        //         if (suite.test_case_list && suite.test_case_list.length > 0)
        //             caseIdList = caseIdList.concat(...suite.test_case_list.map((item: { id: any }) => item.id))
        //         else
        //             if (suite.addCaseCount === 'all')
        //                 suiteIdList.push(suite.id)
        //     }
        // )
        window.open(`/ws/${ws_id}/refenerce/1/?test_type=${test_type}&name=${delType}&id=${case_id_list}`)
    }
    const handleSave = async () => {
        if (addFlag) {
            handleDelete()
        } else {
            // let suiteIdList: number[] = []
            // let caseIdList: number[] = []
            // leftTableDataSource.forEach(
            //     (suite: any) => {
            //         if (suite.test_case_list && suite.test_case_list.length > 0)
            //             caseIdList = caseIdList.concat(...suite.test_case_list.map((item: { id: any }) => item.id))
            //         else
            //             if (suite.addCaseCount === 'all')
            //                 suiteIdList.push(suite.id)
            //     }
            // )
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
        // return leftSuites 
    }

    // const leftTableDataSource = useMemo( computeLeftTableData , [ suiteList, leftWsHasSuiteArr ] )
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

    return (
        <Layout.Content style={{ height: layoutHeight, overflow: 'hidden' }}>
            <PageHeader
                className={styles.suite_nav_bar}
                title="Test Suite管理"
                onBack={handleBackPage}
                extra={
                    <Space>
                        <Button
                            //type="primary"
                            onClick={handleRestore}
                        >
                            恢复
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSave}
                            disabled={btnLoad}
                            loading={btnLoad}
                        >
                            保存
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
                        <PageHeader title="已添加" />
                        {
                            <Spin spinning={leftTableLoading}>
                                {
                                    leftTableDataSource.length === 0 ?
                                        <div style={{ textAlign: 'center', marginTop: 192 }}>
                                            <Typography.Text>点击右侧&nbsp;</Typography.Text>
                                            <PlusCircleFilled style={{ color: '#1890ff' }} />
                                            <Typography.Text>，从系统用例中添加用例到Workspace</Typography.Text>
                                        </div> :
                                        <Table
                                            size="small"
                                            className={styles.right_table_style}
                                            scroll={{ y: innerHeight - 90 - 72 - 39 }}
                                            columns={[{ title: 'Test Suite', dataIndex: 'name' }]}
                                            dataSource={leftTableDataSource}
                                            expandable={{
                                                // onExpandedRowsChange: handleExpandRowChange,
                                                onExpand: (_, record) => _ ? onExpand(record) : setExpandRows([]),
                                                expandedRowKeys: expandRows,
                                                expandedRowRender: (_: any) => (
                                                    <Table
                                                        locale={{ emptyText: '暂无数据' }}
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
                                                    <Space>
                                                        <MinusCircleFilled
                                                            style={{ color: 'red' }}
                                                            onClick={
                                                                () => handleIsAddSuiteMinus(record)
                                                            }
                                                        />
                                                        <CaretRightFilled rotate={expanded ? 90 : 0} onClick={(e: any) => onExpand(record, e)} />
                                                    </Space>
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
                            title={`${test_type === 'business' ? '业务' : (test_type === 'functional' ? '功能' : '性能')}用例列表`}
                            extra={
                                <Space>
                                    <Select
                                        value={domainValue}
                                        onSelect={handleTestSuiteSelect}
                                        style={{ width: 148 }}
                                    >
                                        <Select.Option value="">全部领域</Select.Option>
                                        {
                                            domainList?.map((item: any) => (
                                                <Select.Option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.name}
                                                </Select.Option>
                                            ))
                                        }
                                    </Select>
                                    {/* <Input.Search
                                        placeholder="搜索TestSuites"
                                        allowClear
                                        onChange={ handleTestSuiteSearch }
                                    /> */}
                                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'center' }}>
                                        <Input
                                            style={{ width: 160, height: 32 }}
                                            allowClear
                                            value={searchInp}
                                            onChange={({ target }) => setSearchInp(target.value)}
                                            onPressEnter={handleTestSuiteSearch}
                                            placeholder="搜索TestSuites"
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
                                    { title: 'Test Suite', dataIndex: 'name', },
                                    { title: '业务名称', dataIndex: 'business_name', },
                                    { title: '测试类型', dataIndex: 'test_type', render: (text: any, record: any) => <>{test_type_enum.map((item) => item.value === text ? item.name : '')}</>, },
                                ] : [
                                    { title: 'Test Suite', dataIndex: 'name', },
                                    { title: '变量', dataIndex: 'var', ...toolTipSetting },
                                    {
                                        title: '说明', dataIndex: 'doc', ellipsis: true, render(text: any, record: any) {
                                            const { doc, description } = record
                                            const _ = doc || description
                                            return (
                                                _ ?
                                                    <Tooltip placement='leftTop' arrowPointAtCenter overlayClassName={styles.tooltipCss} color="#fff" title={<CodeViewer code={_} />} >
                                                        <span>
                                                            {_}
                                                        </span>
                                                    </Tooltip> : '-'
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
                            expandable={{
                                // onExpandedRowsChange: handleExpandRowChange,
                                expandedRowKeys: expandRows,
                                onExpand: (_, record) => _ ? onExpand(record) : setExpandRows([]),
                                expandedRowRender: (record: any) => {
                                    return (
                                        <Table
                                            size="small"
                                            rowKey="id"
                                            locale={{ emptyText: '暂无数据' }}
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
                                                    { title: '变量', dataIndex: 'var', ...toolTipSetting },
                                                    {
                                                        dataIndex: 'doc', ellipsis: true, render(text: any, record: any) {
                                                            const { doc, description } = record
                                                            const _ = doc || description
                                                            return (
                                                                _ ?
                                                                    <Tooltip placement={_.length > 100 ? 'left' : 'top'} title={_}>
                                                                        <span>{_}</span>
                                                                    </Tooltip> : '-'
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
                                    const { hasAdd, addCaseCount } = record
                                    let color = '#1890ff'
                                    if (addCaseCount === 'all')
                                        color = '#eee'

                                    return (
                                        <Space>
                                            {/*一级表格前面的添加图标*/}
                                            {
                                                hasAdd && addCaseCount !== 'all' ?
                                                    <UnFullExpand
                                                        onClick={() => handleTestSuitePlus(record)}
                                                        style={{ fontSize: 14, width: 14, height: 14, cursor: 'pointer' }}
                                                    /> :
                                                    <PlusCircleFilled
                                                        style={{ color }}
                                                        onClick={() => handleTestSuitePlus(record)}
                                                    />
                                            }
                                            <CaretRightFilled
                                                rotate={expanded ? 90 : 0}
                                                style={{ cursor: 'pointer' }}
                                                onClick={(e: any) => onExpand(record, e)}
                                            />
                                        </Space>
                                    )
                                }
                            }}
                        />
                    </div>
                </Row>
            </Layout>
            <Modal
                title="删除提示"
                centered={true}
                visible={deleteVisible}
                //onOk={remOuter}
                onCancel={handleCancel}
                footer={[
                    <Button key="submit" onClick={handleDelete} loading={btnLoad}>
                        确定删除
                    </Button>,
                    <Button key="back" type="primary" onClick={handleCancel}>
                        取消
                    </Button>
                ]}
                width={600}
                maskClosable={false}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    要删除的{delType == 'suite' ? 'Suite' : 'Conf'}被运行中的job或测试模板引用，请谨慎删除！！
                </div>
                <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>删除{delType == 'suite' ? 'suite' : 'conf'}影响范围：运行中的job、测试模板、对比分析报告</div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>查看引用详情</div>
            </Modal>
        </Layout.Content>
    )
}