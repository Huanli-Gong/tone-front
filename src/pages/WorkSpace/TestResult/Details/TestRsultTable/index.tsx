import React, { useState, useRef, useEffect } from 'react'
import { useRequest, useModel, Access, useAccess, useParams, useIntl, FormattedMessage  } from 'umi'
import { queryTestResult } from '../service'
import { Space, Row, Button, Menu, Dropdown } from 'antd'
import { CaretRightFilled, CaretDownFilled, DownOutlined } from '@ant-design/icons';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import { matchTestType } from '@/utils/utils'
import CaseTable from './CaseTable'
import JoinBaseline from '../components/JoinBaseline'
import EditRemarks from '../components/EditRemarks'
import { uniqBy } from 'lodash'
import { ReactComponent as StopCircle } from '@/assets/svg/TestResult/suite/skip.svg'
import { ReactComponent as SuccessCircle } from '@/assets/svg/TestResult/suite/success.svg'
import { ReactComponent as ErrorCircle } from '@/assets/svg/TestResult/suite/fail.svg'
import { EllipsisEditColumn, tooltipTd } from '../components'
import styles from './index.less'
import ContrastBaseline from '../components/ContrastBaseline';
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import ResizeTable from '@/components/ResizeTable'

// 结果详情 - 测试列表

const TestResultTable: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const funcStates = [
        { key: 'count',  name: formatMessage({id: `ws.result.details.count`}), value: '', color: '#649FF6' },
        { key: 'success',name: formatMessage({id: `ws.result.details.success`}), value: 'success', color: '#81BF84' },
        { key: 'fail', name: formatMessage({id: `ws.result.details.fail`}), value: 'fail', color: '#C84C5A' },
        { key: 'warn', name: formatMessage({id: `ws.result.details.warn`}), value: 'warn', color: '#dcc506' },
        { key: 'skip', name: formatMessage({id: `ws.result.details.skip`}), value: 'skip', color: '#DDDDDD' },
    ]
    const perfStates = [
        { key: 'count',  name: formatMessage({id: `ws.result.details.count`}), value: '', color: '#649FF6' },
        { key: 'increase',name: formatMessage({id: `ws.result.details.increase`}), value: 'increase', color: '#81BF84' },
        { key: 'decline', name: formatMessage({id: `ws.result.details.decline`}), value: 'decline', color: '#C84C5A' },
        { key: 'normal',  name: formatMessage({id: `ws.result.details.normal`}), value: 'normal', color: '#DDDDDD' },
        { key: 'invalid', name: formatMessage({id: `ws.result.details.invalid`}), value: 'invalid', color: '#DDDDDD' },
        { key: 'na', name: formatMessage({id: `ws.result.details.na`}), value: 'na', color: '#DDDDDD' },
    ]
    const businessBusinessStates = [
        { key: 'count',  name: formatMessage({id: `ws.result.details.business.count`}), value: '', color: '#649FF6' },
        { key: 'success',name: formatMessage({id: `ws.result.details.business.success`}), value: 'success', color: '#81BF84' },
        { key: 'fail',   name: formatMessage({id: `ws.result.details.business.fail`}), value: 'fail', color: '#C84C5A' },
    ]

    const { id: job_id, ws_id } = useParams() as any
    const { caseResult = {}, test_type = '功能', provider_name: serverProvider = '', creator } = props
    const defaultParams = { state: '', job_id }
    const initialData: any[] = []
    const testType = matchTestType(test_type)

    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])
    const [openAllRows, setOpenAllRows] = useState(false)
    const [suiteCaseSelectKeys, setSuiteCaseSelectKeys] = useState<any>([])
    const [expandedRowKeys, setExpandedRowKeys] = useState<Array<any>>([])
    const joinBaselineDrawer: any = useRef(null)
    const contrastBaselineDrawer: any = useRef(null)
    const editRemarkDrawer: any = useRef(null)
    const [filterData, setFilterData] = useState<any>([])
    // const [openAllExpand, setOpenAllExpand] = useState(false)
    const access = useAccess()
    const [refreshCaseTable, setRefreshCaseTable] = useState(false)
    const [isExpandAll, setIsExpandAll] = useState(false)
    // 展开指标级的标志
    const [indexExpandFlag, setIndexExpandFlag] = useState(false)

    const { data: dataSource, run, params, loading, refresh } = useRequest(
        (p) => queryTestResult(p),
        {
            formatResult: response => {
                if (response.code === 200)
                    if (response.data)
                        return response.data
                    else return initialData
                else {
                    requestCodeMessage(response.code, response.msg)
                    return initialData
                }
            },
            initialData,
            defaultParams: [defaultParams]
        }
    )
    const queryDefaultTestData = async() => {
        const { data } = await queryTestResult({ state: '', job_id  })
        setFilterData(data)
    }
    useEffect(()=> {
        queryDefaultTestData()
    },[])

    const states = ['functional', 'business_functional'].includes(testType) ? funcStates
        : (testType === 'business_business' ? businessBusinessStates : perfStates)

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
            render: (text: any) => <span>{text || '-'}</span>,
        },
        ['business_functional', 'business_performance', 'business_business'].includes(testType) &&
        {
            title: <FormattedMessage id="ws.result.details.business_name" />,
            dataIndex: 'business_name',
            width: 160,
            ellipsis: {
                showTitle: false
            },
            render: (text: any) => <PopoverEllipsis title={text} />,
        },
        {
            title: <FormattedMessage id="ws.result.details.the.server" />,
            width: 130,
            render: () => ('-')
        },
        ['functional', 'business_functional', 'business_business'].includes(testType) &&
        {
            title: <FormattedMessage id="ws.result.details.result" />,
            dataIndex: 'result',
            width: 50,
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
            title: ['functional', 'business_functional'].includes(testType) ? <FormattedMessage id="ws.result.details.functional" />: (testType === 'business_business' ? <FormattedMessage id="ws.result.details.business_business" /> : <FormattedMessage id="ws.result.details.performance" />),
            width: 255,
            render: (_: any) => {
                return (
                    ['functional', 'business_functional', 'business_business'].includes(testType) ?
                        (
                            <Space>
                                <div className={styles.column_circle_text} style={{ background: "#649FF6" }} onClick={() => handleStateChange('')} >{_.conf_count}</div>
                                <div className={styles.column_circle_text} style={{ background: "#81BF84" }} onClick={() => handleStateChange('success')} >{_.conf_success}</div>
                                <div className={styles.column_circle_text} style={{ background: "#C84C5A" }} onClick={() => handleStateChange('fail')} >{_.conf_fail}</div>
                                <div className={styles.column_circle_text} style={{ background: "#dcc506" }} onClick={() => handleStateChange('warn')} >{_.conf_warn}</div>
                                {testType !== 'business_business' && (
                                    <div className={styles.column_circle_text} style={{ background: "#DDDDDD", color: "rgba(0,0,0.65)" }} onClick={() => handleStateChange('skip')} >{_.conf_skip}</div>
                                )}
                            </Space>
                        ) : (
                            <Space>
                                <div className={styles.column_circle_text} style={{ background: "#649FF6" }} onClick={() => handleStateChange('')} >{_.count}</div>
                                <div className={styles.column_circle_text} style={{ background: "#81BF84" }} onClick={() => handleStateChange('increase')} >{_.increase}</div>
                                <div className={styles.column_circle_text} style={{ background: "#C84C5A" }} onClick={() => handleStateChange('decline')} >{_.decline}</div>
                                <div className={styles.column_circle_text} style={{ background: "#DDDDDD", color: "rgba(0,0,0.65)" }} onClick={() => handleStateChange('normal')} >{_.normal}</div>
                                <div className={styles.column_circle_text} style={{ background: "#DDDDDD", color: "rgba(0,0,0.65)" }} onClick={() => handleStateChange('invalid')} >{_.invalid}</div>
                                <div className={styles.column_circle_text} style={{ background: "#DDDDDD", color: "rgba(0,0,0.65)" }} onClick={() => handleStateChange('na')} >{_.na}</div>
                            </Space>
                        )
                )
            }
        },
        (['performance', 'business_performance'].includes(testType) && !!dataSource.length && dataSource[0].baseline) &&
        {
            title: <FormattedMessage id="ws.result.details.baseline" />,
            dataIndex: 'baseline',
            width: 80,
            ...tooltipTd(),
        },
        (['performance', 'business_performance'].includes(testType) && !!dataSource.length && dataSource[0].baseline_job_id) &&
        {
            title: <FormattedMessage id="ws.result.details.baseline_job_id" />,
            dataIndex: 'baseline_job_id',
            width: 80,
            ...tooltipTd(),
        },
        {
            title: <FormattedMessage id="ws.result.details.start_time" />,
            dataIndex: 'start_time',
            width: 175,
            ...tooltipTd(),
        },
        {
            title: <FormattedMessage id="ws.result.details.end_time" />,
            dataIndex: 'end_time',
            width: 175,
            ...tooltipTd(),
        },
        access.WsTourist() &&
        {
            title: <FormattedMessage id="ws.result.details.test_summary" />,
            dataIndex: 'note',
            width: 80,
            ellipsis: {
                showTitle: false
            },
            render: (_: any, row: any) => (
                <EllipsisEditColumn
                    title={_}
                    width={80}
                    access={access.WsMemberOperateSelf(creator)}
                    onEdit={
                        () => editRemarkDrawer.current.show({ ...row, suite_name: row.suite_name, editor_obj: 'test_job_suite' })
                    }
                />
            )
        },
        ['performance', 'business_performance'].includes(testType) &&
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            width: 145,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => (
                <Access accessible={access.WsTourist()}>
                    <Access
                        accessible={access.WsMemberOperateSelf(creator)}
                        fallback={
                            <Space>
                                <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => AccessTootip()}><FormattedMessage id="ws.result.details.baseline" /></span>
                                <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => AccessTootip()}><FormattedMessage id="ws.result.details.join.baseline" /></span>
                            </Space>
                        }
                    >
                        <Space>
                            <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleContrastBaseline(_)}><FormattedMessage id="ws.result.details.baseline" /></span>
                            <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleJoinBaseline(_)}><FormattedMessage id="ws.result.details.join.baseline" /></span>
                        </Space>
                    </Access>
                </Access>
            )
        }
    ].filter(Boolean)

    const handleContrastBaseline = (_: any) => {
        contrastBaselineDrawer.current.show({ ..._, job_id })
    }

    const handleBatchContrastBaseline = () => {
        contrastBaselineDrawer.current.show({
            job_id,
            suite_data: suiteCaseSelectKeys,
            suite_list: selectedRowKeys
        })
    }

    const handleContrastBaselineOk = () => {
        refresh()
        setSuiteCaseSelectKeys([])
        setSelectedRowKeys([])
        setRefreshCaseTable(!refreshCaseTable)
    }

    const handleJoinBaselineOk = () => {
        refresh()
        setSuiteCaseSelectKeys([])
        setSelectedRowKeys([])
    }

    const handleJoinBaseline = (_: any) => {
        joinBaselineDrawer.current.show({ ..._, job_id })
    }

    const handleBatchJoinBaseline = () => {
        joinBaselineDrawer.current.show({
            job_id,
            suite_data: suiteCaseSelectKeys,
            suite_list: selectedRowKeys
        })
    }

    const handleOpenAll = () => {
        setOpenAllRows(!openAllRows)
        setIndexExpandFlag(!indexExpandFlag)
        if (!openAllRows) {
            setExpandedRowKeys(dataSource.map(({ suite_id }: any) => suite_id))
            setIsExpandAll(true)
        } else {
            setExpandedRowKeys([])
            setIsExpandAll(false)
        }
    }

    // conf级
    const handleOpenExpandBtn = () => {
        if (!openAllRows) {
            // case1.展开
            setExpandedRowKeys(dataSource.map(({ suite_id }: any) => suite_id))
            // case2. 展开状态标志
            setOpenAllRows(true)
        } else {
            setExpandedRowKeys([])
            setIndexExpandFlag(false)
            setOpenAllRows(false)
        }
    }
    // index级
    const indexExpandClick = () => {
        if (!indexExpandFlag) {
            setOpenAllRows(true)
            setIndexExpandFlag(true)
            setExpandedRowKeys(dataSource.map(({ suite_id }: any) => suite_id))
            setIsExpandAll(true)
        } else {
            setIndexExpandFlag(false)
            setIsExpandAll(false)
        }
    }

    const handleStateChange = (state: string) => {
        run({ ...defaultParams, state })
        if(!!filterData.length){
            setExpandedRowKeys(filterData.map(({ suite_id }: any) => suite_id))
            setIsExpandAll(true)
        }
        // handleOpenAll()
    }
    useEffect(() => {
        if (caseResult.count < 50) {
            setExpandedRowKeys(dataSource.map(({ suite_id }: any) => suite_id))
            // case2. 展开状态标志
            setOpenAllRows(true)
            setIndexExpandFlag(true)
            setIsExpandAll(true)
        }
    }, [caseResult, dataSource])

    const rowSelection = testType === 'performance' ? {
        columnWidth: 40,
        selectedRowKeys,
        onChange: (selectedRowKeys: any[]) => {
            setSelectedRowKeys(selectedRowKeys)
        }
    } : undefined

    const handleCaseSelect = (suite_id: any, case_list: any) => {
        let suiteData: any = []
        if (case_list.length > 0) {
            const idx = suiteData.findIndex((i: any) => i.suite_id === suite_id)
            if (idx > -1) {
                suiteData = suiteCaseSelectKeys.filter((i: any): any => {
                    if (i.suite_id === suite_id) return { suite_id, case_list }
                })
            }
            else {
                suiteData = suiteCaseSelectKeys.concat([{ suite_id, case_list }]).reverse()
            }
        }
        else {
            suiteData = suiteCaseSelectKeys.filter((i: any): any => {
                if (i.suite_id !== suite_id) return i
            })
        }
        setSuiteCaseSelectKeys(uniqBy(suiteData, 'suite_id'))
    }
    const childName = ['functional', 'business_functional', 'business_business'].includes(testType) ? 'Case' : 'index'
    const expandBtnText = openAllRows ? formatMessage({id: `ws.result.details.folded.conf`}): formatMessage({id: `ws.result.details.expand.conf`})
    const expandIndexBtnText = indexExpandFlag ? formatMessage({id: `ws.result.details.folded.${childName}`}): formatMessage({id: `ws.result.details.expand.${childName}`})

    return (
        <>
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
                            {openAllRows ? formatMessage({id: `ws.result.details.folded.all`}) : formatMessage({id: `ws.result.details.expand.all`})}
                        </Dropdown.Button>
                        {
                            ['performance', 'business_performance'].includes(testType) &&
                            <Access accessible={access.WsTourist()}>
                                <Access
                                    accessible={access.WsMemberOperateSelf(creator)}
                                    fallback={
                                        <Space>
                                            <Button onClick={() => AccessTootip()}><FormattedMessage id="ws.result.details.batch.baseline" /></Button>
                                            <Button onClick={() => AccessTootip()}><FormattedMessage id="ws.result.details.batch.join.baseline" /></Button>
                                        </Space>
                                    }
                                >
                                    <Space>
                                        <Button onClick={() => handleBatchContrastBaseline()}><FormattedMessage id="ws.result.details.batch.baseline" /></Button>
                                        <Button onClick={() => handleBatchJoinBaseline()}><FormattedMessage id="ws.result.details.batch.join.baseline" /></Button>
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
                                            color: params[0] && params[0].state === value ? '#1890FF' : 'rgba(0, 0, 0, 0.65)'
                                        }}
                                    >
                                        {name}({caseResult[key]})
                                    </span>
                                )
                            )
                        }
                    </Space>
                </Row>
                <ResizeTable
                    columns={columns as any}
                    rowKey="suite_id"
                    dataSource={dataSource}
                    pagination={false}
                    size="small"
                    loading={loading}
                    scroll={{ x: '100%' }}
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
                                if (tempList?.length === dataSource.length) {
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
                                key={refreshCaseTable}
                                {...record}
                                ws_id={ws_id}
                                creator={creator}
                                server_provider={serverProvider}
                                provider_name={serverProvider}
                                testType={testType}
                                job_id={job_id}
                                openAllRows={openAllRows}
                                setIndexExpandFlag={setIndexExpandFlag}
                                isExpandAll={isExpandAll}
                                state={params[0].state}
                                suiteSelect={selectedRowKeys}
                                onCaseSelect={handleCaseSelect}
                            />
                        ),

                        expandIcon: ({ expanded, onExpand, record }: any) => (
                            // expanded ? null : null
                            expanded ?
                                (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                                (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                        )
                    }}
                />
            </div>
            <JoinBaseline
                ref={joinBaselineDrawer}
                test_type={testType}
                server_provider={serverProvider}
                onOk={handleJoinBaselineOk}
                accessible={access.IsWsSetting()}
            />
            <EditRemarks
                ref={editRemarkDrawer}
                onOk={refresh}
            />
            <ContrastBaseline
                ref={contrastBaselineDrawer}
                test_type={testType}
                server_provider={serverProvider}
                onOk={handleContrastBaselineOk}
            />
        </>
    )
}


export default TestResultTable