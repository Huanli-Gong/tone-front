/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react'
import { Access, useAccess, useParams, useIntl, FormattedMessage, getLocale } from 'umi'
import { queryTestResult } from '../service'
import { Space, Row, Button, Menu, Dropdown } from 'antd'
import { CaretRightFilled, CaretDownFilled, DownOutlined } from '@ant-design/icons';
import { matchTestType } from '@/utils/utils'
import CaseTable from './CaseTable'
import JoinBaseline from '../components/JoinBaseline'
import EditRemarks from '../components/EditRemarks'
import { ReactComponent as StopCircle } from '@/assets/svg/TestResult/suite/skip.svg'
import { ReactComponent as SuccessCircle } from '@/assets/svg/TestResult/suite/success.svg'
import { ReactComponent as ErrorCircle } from '@/assets/svg/TestResult/suite/fail.svg'
import { EllipsisEditColumn, tooltipTd } from '../components'
import styles from './index.less'
import ContrastBaseline from '../components/ContrastBaseline';
import { AccessTootip } from '@/utils/utils';
import { ResizeHooksTable } from '@/utils/table.hooks';
import { v4 as uuid } from "uuid"
import { ColumnEllipsisText } from '@/components/ColumnComponents';

export const MetricSelectProvider = React.createContext<any>(null)
// 结果详情 - 测试列表

const TestResultTable: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const locale = getLocale() === 'en-US';

    const funcStates = [
        { key: 'count', name: formatMessage({ id: `ws.result.details.count` }), value: '', color: '#649FF6' },
        { key: 'success', name: formatMessage({ id: `ws.result.details.success` }), value: 'success', color: '#81BF84' },
        { key: 'fail', name: formatMessage({ id: `ws.result.details.fail` }), value: 'fail', color: '#C84C5A' },
        { key: 'warn', name: formatMessage({ id: `ws.result.details.warn` }), value: 'warn', color: '#dcc506' },
        { key: 'skip', name: formatMessage({ id: `ws.result.details.skip` }), value: 'skip', color: '#DDDDDD' },
    ]
    const perfStates = [
        { key: 'count', name: formatMessage({ id: `ws.result.details.count` }), value: '', color: '#649FF6' },
        { key: 'increase', name: formatMessage({ id: `ws.result.details.increase` }), value: 'increase', color: '#81BF84' },
        { key: 'decline', name: formatMessage({ id: `ws.result.details.decline` }), value: 'decline', color: '#C84C5A' },
        { key: 'normal', name: formatMessage({ id: `ws.result.details.normal` }), value: 'normal', color: '#DDDDDD' },
        { key: 'invalid', name: formatMessage({ id: `ws.result.details.invalid` }), value: 'invalid', color: '#DDDDDD' },
        { key: 'na', name: formatMessage({ id: `ws.result.details.na` }), value: 'na', color: '#DDDDDD' },
    ]
    const businessBusinessStates = [
        { key: 'count', name: formatMessage({ id: `ws.result.details.business.count` }), value: '', color: '#649FF6' },
        { key: 'success', name: formatMessage({ id: `ws.result.details.business.success` }), value: 'success', color: '#81BF84' },
        { key: 'fail', name: formatMessage({ id: `ws.result.details.business.fail` }), value: 'fail', color: '#C84C5A' },
    ]

    const { id: job_id, ws_id, share_id } = useParams() as any
    const { caseResult = {}, test_type, provider_name: serverProvider = '', creator, refreshResult } = props
    const testType = React.useMemo(() => matchTestType(test_type), [test_type])

    const [openAllRows, setOpenAllRows] = useState(false)
    const [expandedRowKeys, setExpandedRowKeys] = useState<any[]>([])
    const [expandedCaseRowKeys, setExpandedCaseRowKeys] = React.useState<any[]>([])
    const joinBaselineDrawer: any = useRef(null)
    const contrastBaselineDrawer: any = useRef(null)
    const editRemarkDrawer: any = useRef(null)
    const [filterData, setFilterData] = useState<any>([])
    // const [openAllExpand, setOpenAllExpand] = useState(false)
    const access = useAccess()
    const [refreshCaseTable, setRefreshCaseTable] = useState<any>()
    // 展开指标级的标志
    const [indexExpandFlag, setIndexExpandFlag] = useState(false)

    const [selectSuiteState, setSelectSuiteState] = React.useState<undefined | string>("")
    const [loading, setLoading] = React.useState(true)

    const [oSuite, setOSuite] = React.useState<any>({})

    const queryDefaultTestData = async () => {
        setLoading(true)
        const { data } = await queryTestResult({ state: '', job_id, share_id })
        setLoading(false)
        setFilterData(Object.prototype.toString.call(data) === "[object Array]" ? data : [])
    }

    React.useEffect(() => {
        queryDefaultTestData()
    }, [refreshResult])

    const handleSuiteStateChange = (row: any, state: string) => {
        setExpandedRowKeys((l: any[]) => l.concat(row.suite_id))
        setExpandedCaseRowKeys((l: any[]) => l.concat(row.suite_id))
        setFilterData((source: any) => {
            return source?.map((item: any) => {
                if (item.suite_id === row.suite_id)
                    return {
                        ...item, expandedState: state,
                    }
                return item
            })
        })
    }

    const handleContrastBaseline = (row: any) => {
        contrastBaselineDrawer.current.show({ ...row, ids: { [row.suite_id]: null } })
    }

    const handleContrastBaselineOk = () => {
        queryDefaultTestData()
        setOSuite([])
        setRefreshCaseTable(uuid())
    }

    const handleJoinBaseline = (row: any) => {
        joinBaselineDrawer.current.show(row)
    }

    const suiteCaseExpandedContrl = (isExpanded: boolean) => {
        const openKeys = isExpanded ? filterData.map(({ suite_id }: any) => suite_id) : []
        setOpenAllRows(isExpanded)
        setExpandedRowKeys(openKeys)
        setExpandedCaseRowKeys(openKeys)
    }

    const states = ['functional', 'business_functional'].includes(testType) ? funcStates
        : (testType === 'business_business' ? businessBusinessStates : perfStates)

    const { baseline, baseline_job_id } = filterData[0] || {}
    // 判断第一条数据中的属性
    const columns = [
        {
            title: 'Test Suite',
            dataIndex: 'suite_name',
            width: 260,
            ...tooltipTd(),
        },
        ['functional', 'performance'].includes(testType) &&
        {
            title: <FormattedMessage id="ws.result.details.test_type" />,
            dataIndex: 'test_type',
            width: 100,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => {
                const strLocale = matchTestType(_)
                return <span><FormattedMessage id={`${strLocale}.test`} defaultMessage={_} /></span>
            },
        },
        ['business_functional', 'business_performance', 'business_business'].includes(testType) &&
        {
            title: <FormattedMessage id="ws.result.details.business_name" />,
            dataIndex: 'business_name',
            width: 160,
            ellipsis: {
                showTitle: false
            },
            render: (text: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{text}</ColumnEllipsisText>,
        },
        {
            title: <FormattedMessage id="ws.result.details.the.server" />,
            width: 130,
            dataIndex: "server",
            render: () => ('-')
        },
        ['functional', 'business_functional', 'business_business'].includes(testType) &&
        {
            title: <FormattedMessage id="ws.result.details.result" />,
            dataIndex: 'result',
            width: 80,
            render: (_: any) => {
                if (_ === 'NA')
                    return <StopCircle style={{ width: 16, height: 16, verticalAlign: 'text-bottom' }} />
                if (_ === '-')
                    return _
                if (_ === 'fail')
                    return <ErrorCircle style={{ width: 16, height: 16, verticalAlign: 'text-bottom' }} />
                if (_ === 'success')
                    return <SuccessCircle style={{ width: 16, height: 16, verticalAlign: 'text-bottom' }} />
                return <></>
            }
        },
        {
            title: ['functional', 'business_functional'].includes(testType) ?
                <FormattedMessage id="ws.result.details.functional" /> :
                (testType === 'business_business' ?
                    <FormattedMessage id="ws.result.details.business_business" /> :
                    <FormattedMessage id="ws.result.details.performance" />),
            width: ['functional', 'business_functional', 'business_business'].includes(testType) ? 255 : 302,
            key: "details",
            render: (_: any) => {
                return (
                    ['functional', 'business_functional', 'business_business'].includes(testType) ?
                        (
                            <Space>
                                <div className={styles.column_circle_text} style={{ background: "#649FF6" }} onClick={() => handleSuiteStateChange(_, '')} >{_.conf_count}</div>
                                <div className={styles.column_circle_text} style={{ background: "#81BF84" }} onClick={() => handleSuiteStateChange(_, 'success')} >{_.conf_success}</div>
                                <div className={styles.column_circle_text} style={{ background: "#C84C5A" }} onClick={() => handleSuiteStateChange(_, 'fail')} >{_.conf_fail}</div>
                                <div className={styles.column_circle_text} style={{ background: "#dcc506" }} onClick={() => handleSuiteStateChange(_, 'warn')} >{_.conf_warn}</div>
                                {testType !== 'business_business' && (
                                    <div className={styles.column_circle_text} style={{ background: "#DDDDDD", color: "rgba(0,0,0.65)" }} onClick={() => handleSuiteStateChange(_, 'skip')} >{_.conf_skip}</div>
                                )}
                            </Space>
                        ) : (
                            <Space>
                                <div className={styles.column_circle_text} style={{ background: "#649FF6" }} onClick={() => handleSuiteStateChange(_, '')} >{_.count}</div>
                                <div className={styles.column_circle_text} style={{ background: "#81BF84" }} onClick={() => handleSuiteStateChange(_, 'increase')} >{_.increase}</div>
                                <div className={styles.column_circle_text} style={{ background: "#C84C5A" }} onClick={() => handleSuiteStateChange(_, 'decline')} >{_.decline}</div>
                                <div className={styles.column_circle_text} style={{ background: "#DDDDDD", color: "rgba(0,0,0.65)" }} onClick={() => handleSuiteStateChange(_, 'normal')} >{_.normal}</div>
                                <div className={styles.column_circle_text} style={{ background: "#DDDDDD", color: "rgba(0,0,0.65)" }} onClick={() => handleSuiteStateChange(_, 'invalid')} >{_.invalid}</div>
                                <div className={styles.column_circle_text} style={{ background: "#DDDDDD", color: "rgba(0,0,0.65)" }} onClick={() => handleSuiteStateChange(_, 'na')} >{_.na}</div>
                            </Space>
                        )
                )
            }
        },
        (['performance', 'business_performance'].includes(testType)) && !!baseline &&
        {
            title: <FormattedMessage id="ws.result.details.baseline" />,
            dataIndex: 'baseline',
            width: 80,
            ...tooltipTd(),
        },
        (['performance', 'business_performance'].includes(testType) && baseline_job_id) &&
        {
            title: <FormattedMessage id="ws.result.details.baseline_job_id" />,
            dataIndex: 'baseline_job_id',
            width: 80,
            ...tooltipTd(),
        },
        {
            title: <FormattedMessage id="ws.result.details.start_time" />,
            dataIndex: 'start_time',
            width: 160,
            ...tooltipTd(),
        },
        {
            title: <FormattedMessage id="ws.result.details.end_time" />,
            dataIndex: 'end_time',
            width: 160,
            ...tooltipTd(),
        },
        access.WsTourist() &&
        {
            title: <FormattedMessage id="ws.result.details.test_summary" />,
            dataIndex: 'note',
            width: 120,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => (
                <EllipsisEditColumn
                    title={_}
                    width={120}
                    access={access.WsMemberOperateSelf(creator)}
                    onEdit={
                        () => editRemarkDrawer.current.show({ ...row, suite_name: row.suite_name, editor_obj: 'test_job_suite' })
                    }
                />
            )
        },
        !share_id && ['performance', 'business_performance'].includes(testType) &&
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            width: locale ? 180 : 145,
            // fixed: 'right',
            key: "operation",
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => {
                const btnStyle: any = { color: '#1890FF', cursor: 'pointer', whiteSpace: 'nowrap' }
                return (
                    <Access accessible={access.WsTourist()}>
                        <Access
                            accessible={access.WsMemberOperateSelf(creator)}
                            fallback={
                                <Space>
                                    <span style={btnStyle} onClick={() => AccessTootip()}><FormattedMessage id="ws.result.details.baseline" /></span>
                                    <span style={btnStyle} onClick={() => AccessTootip()}><FormattedMessage id="ws.result.details.join.baseline" /></span>
                                </Space>
                            }
                        >
                            <Space>
                                <span style={btnStyle} onClick={() => handleContrastBaseline(_)}><FormattedMessage id="ws.result.details.baseline" /></span>
                                <span style={btnStyle} onClick={() => handleJoinBaseline(_)}><FormattedMessage id="ws.result.details.join.baseline" /></span>
                            </Space>
                        </Access>
                    </Access>
                )
            }
        }
    ]

    const handleBatchContrastBaseline = () => {
        contrastBaselineDrawer.current.show({ isMore: true })
    }

    const handleJoinBaselineOk = () => {
        queryDefaultTestData()
        setOSuite({})
    }

    const handleBatchJoinBaseline = () => {
        joinBaselineDrawer.current.show({ isMore: true })
    }

    const handleOpenAll = () => {
        setIndexExpandFlag(!openAllRows)
        suiteCaseExpandedContrl(!openAllRows)
    }

    // conf级
    const handleOpenExpandBtn = () => {
        if (openAllRows) {
            setExpandedCaseRowKeys([])
            setIndexExpandFlag(false)
        }
        setOpenAllRows(!openAllRows)
        setExpandedRowKeys(!openAllRows ? filterData.map((i: any) => i.suite_id) : [])
    }

    // index级
    const indexExpandClick = () => {
        setIndexExpandFlag(!indexExpandFlag)
        if (!indexExpandFlag) {
            suiteCaseExpandedContrl(true)
        }
        else {
            setExpandedCaseRowKeys([])
        }
    }

    const handleStateChange = (state: string) => {
        setSelectSuiteState(state)
        setFilterData((source: any) => {
            return source?.map((item: any) => ({
                ...item, expandedState: state,
            }))
        })
        if (!!filterData.length) {
            handleOpenAll()
            suiteCaseExpandedContrl(true)
        }
    }

    useEffect(() => {
        if (caseResult.count < 50) {
            // case2. 展开状态标志
            const openKeys = filterData.map(({ suite_id }: any) => suite_id)
            setExpandedRowKeys(openKeys)
            setExpandedCaseRowKeys(openKeys)
            setOpenAllRows(true)
            setIndexExpandFlag(true)
        }
    }, [caseResult, filterData])

    const rowSelection = !share_id && testType === 'performance' ? {
        columnWidth: 40,
        selectedRowKeys: oSuite ? Object.keys(oSuite)?.map((i: any) => + i) : [],
        onChange: (keys: any[]) => {
            console.log(keys)
            if (keys.length > 0) {
                setOSuite(keys.reduce((p: any, c: any) => {
                    p[c] = null
                    return p
                }, {}))
            }
            else {
                setOSuite({})
            }
        }
    } : undefined

    const isOpenAllConf = React.useMemo(() => {
        return expandedRowKeys.length === filterData.length
    }, [expandedRowKeys, filterData])

    const childName = ['functional', 'business_functional', 'business_business'].includes(testType) ? 'Case' : 'index'
    const expandBtnText = isOpenAllConf ? formatMessage({ id: `ws.result.details.folded.conf` }) : formatMessage({ id: `ws.result.details.expand.conf` })
    const expandIndexBtnText = indexExpandFlag ? formatMessage({ id: `ws.result.details.folded.${childName}` }) : formatMessage({ id: `ws.result.details.expand.${childName}` })

    const RESULT_SUITE_TABLE_NAME = "ws-job-result-list"

    const [columnsChange, setColumnsChange] = React.useState(uuid())
    const batchBtnDisabled = React.useMemo(() => {
        if (oSuite && Object.keys(oSuite).length) return false
        return true
    }, [oSuite])

    return (
        <MetricSelectProvider.Provider value={{ setOSuite, oSuite }}>
            <div style={{ padding: "4px 20px 20px 20px" }}>
                <Row justify="space-between" >
                    <Space>
                        <Dropdown.Button
                            onClick={handleOpenAll}
                            placement="bottomLeft"
                            icon={<DownOutlined />}
                            overlay={
                                <Menu>
                                    <Menu.Item
                                        key="1"
                                        className={styles.expandConf}
                                        onClick={handleOpenExpandBtn}
                                    >
                                        {expandBtnText}
                                    </Menu.Item>
                                    <Menu.Item
                                        key="2"
                                        className={styles.expandIndex}
                                        onClick={indexExpandClick}
                                    >
                                        {expandIndexBtnText}
                                    </Menu.Item>
                                </Menu>
                            }
                        >
                            {
                                isOpenAllConf ?
                                    formatMessage({ id: `ws.result.details.folded.all` }) :
                                    formatMessage({ id: `ws.result.details.expand.all` })
                            }
                        </Dropdown.Button>
                        {
                            !share_id && ['performance', 'business_performance'].includes(testType) &&
                            <Access accessible={access.WsTourist()}>
                                <Access
                                    accessible={access.WsMemberOperateSelf(creator)}
                                    fallback={
                                        <Space>
                                            <Button
                                                disabled={batchBtnDisabled}
                                                onClick={() => AccessTootip()}
                                            >
                                                <FormattedMessage id="ws.result.details.batch.baseline" />
                                            </Button>
                                            <Button
                                                disabled={batchBtnDisabled}
                                                onClick={() => AccessTootip()}
                                            >
                                                <FormattedMessage id="ws.result.details.batch.join.baseline" />
                                            </Button>
                                        </Space>
                                    }
                                >
                                    <Space>
                                        <Button
                                            disabled={batchBtnDisabled}
                                            onClick={() => handleBatchContrastBaseline()}
                                        >
                                            <FormattedMessage id="ws.result.details.batch.baseline" />
                                        </Button>
                                        <Button
                                            disabled={batchBtnDisabled}
                                            onClick={() => handleBatchJoinBaseline()}
                                        >
                                            <FormattedMessage id="ws.result.details.batch.join.baseline" />
                                        </Button>
                                    </Space>
                                </Access>
                            </Access>
                        }
                    </Space>
                    <Space>
                        {
                            states.map(
                                ({ key, name, value }: any) => (
                                    <span
                                        key={key}
                                        onClick={() => handleStateChange(value)}
                                        style={{
                                            cursor: 'pointer',
                                            color: selectSuiteState === value ? '#1890FF' : 'rgba(0, 0, 0, 0.65)'
                                        }}
                                    >
                                        {name}({caseResult[key]})
                                    </span>
                                )
                            )
                        }
                    </Space>
                </Row>
                <ResizeHooksTable
                    columns={columns as any}
                    onColumnsChange={() => setColumnsChange(uuid())}
                    rowKey={'suite_id'}
                    name={RESULT_SUITE_TABLE_NAME}
                    dataSource={filterData}
                    pagination={false}
                    refreshDeps={[ws_id, access, baseline, baseline_job_id, creator]}
                    size="small"
                    loading={loading}
                    className={styles.result_expand_table}
                    style={{ marginTop: 20 }}
                    rowSelection={rowSelection}
                    expandable={{
                        defaultExpandAllRows: openAllRows,
                        expandedRowKeys: expandedRowKeys,
                        onExpand: (expanded: boolean, record: any) => {
                            if (expanded) {
                                const tempList = expandedRowKeys.concat([record.suite_id])
                                setExpandedRowKeys(tempList)
                                if (tempList?.length === filterData.length) {
                                    // 展开的状态标志
                                    setOpenAllRows(true)
                                    setIndexExpandFlag(true)
                                }
                            }
                            else {
                                const tempList = expandedRowKeys.filter((i: number) => i !== record.suite_id)
                                setExpandedRowKeys(tempList)
                                if (!tempList.length) {
                                    // 收起的状态标志
                                    setOpenAllRows(false)
                                    setIndexExpandFlag(false)
                                }
                            }
                        },
                        expandedRowRender: (record) => (
                            <CaseTable
                                {...record}
                                key={refreshCaseTable}
                                creator={creator}
                                columnsChange={columnsChange}
                                parentTableName={RESULT_SUITE_TABLE_NAME}
                                server_provider={serverProvider}
                                provider_name={serverProvider}
                                testType={testType}
                                setIndexExpandFlag={setIndexExpandFlag}
                                expandedCaseRowKeys={expandedCaseRowKeys}
                            />
                        ),
                        expandIcon: ({ expanded, onExpand, record }: any) => (
                            expanded ?
                                (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                                (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                        )
                    }}
                />
                <JoinBaseline
                    ref={joinBaselineDrawer}
                    test_type={testType}
                    server_provider={serverProvider}
                    onOk={handleJoinBaselineOk}
                />
                <EditRemarks
                    ref={editRemarkDrawer}
                    onOk={queryDefaultTestData}
                />
                <ContrastBaseline
                    ref={contrastBaselineDrawer}
                    test_type={testType}
                    server_provider={serverProvider}
                    onOk={handleContrastBaselineOk}
                />
            </div>
        </MetricSelectProvider.Provider>
    )
}


export default TestResultTable