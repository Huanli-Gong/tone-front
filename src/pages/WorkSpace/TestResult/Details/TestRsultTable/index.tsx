import React, { useState, useRef, useEffect } from 'react'
import { useRequest, useModel, Access, useAccess, useParams } from 'umi'
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
// import { test_type_enum } from '@/utils/utils'
import { EllipsisEditColumn, tooltipTd } from '../components'
import styles from './index.less'
import ContrastBaseline from '../components/ContrastBaseline';
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import ResizeTable from '@/components/ResizeTable'
const funcStates = [
    { key: 'count', name: '全部', value: '', color: '#649FF6' },
    { key: 'success', name: '通过', value: 'success', color: '#81BF84' },
    { key: 'fail', name: '失败', value: 'fail', color: '#C84C5A' },
    { key: 'skip', name: '跳过', value: 'skip', color: '#DDDDDD' },
]
const perfStates = [
    { key: 'count', name: '全部', value: '', color: '#649FF6' },
    { key: 'increase', name: '上升', value: 'increase', color: '#81BF84' },
    { key: 'decline', name: '下降', value: 'decline', color: '#C84C5A' },
    { key: 'normal', name: '正常', value: 'normal', color: '#DDDDDD' },
    { key: 'invalid', name: '无效', value: 'invalid', color: '#DDDDDD' },
    { key: 'na', name: 'NA', value: 'na', color: '#DDDDDD' },
]
const businessBusinessStates = [
    { key: 'count', name: '总计', value: '', color: '#649FF6' },
    { key: 'success', name: '成功', value: 'success', color: '#81BF84' },
    { key: 'fail', name: '失败', value: 'fail', color: '#C84C5A' },
]
// 结果详情 - 测试列表

const TestResultTable: React.FC<any> = (props) => {
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

    const states = ['functional', 'business_functional'].includes(testType) ? funcStates
        : (testType === 'business_business' ? businessBusinessStates : perfStates)

    const columns = [
        {
            title: 'Test Suite',
            dataIndex: 'suite_name',
            width: 300,
            ...tooltipTd(),
        },
        ['functional', 'performance'].includes(testType) &&
        {
            title: '测试类型',
            dataIndex: 'test_type',
            width: 100,
            ellipsis: {
                showTitle: false
            },
            render: (text: any) => <span>{text || '-'}</span>,
        },
        ['business_functional', 'business_performance', 'business_business'].includes(testType) &&
        {
            title: '业务名称',
            dataIndex: 'business_name',
            width: 160,
            ellipsis: {
                showTitle: false
            },
            render: (text: any) => <PopoverEllipsis title={text} />,
        },
        {
            title: '机器',
            width: 130,
            render: () => ('-')
        },
        ['functional', 'business_functional', 'business_business'].includes(testType) &&
        {
            title: '结果',
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
            title: ['functional', 'business_functional'].includes(testType) ? '总计/通过/失败/跳过' : (testType === 'business_business' ? '总计/成功/失败' : 'Metric总计/上升/下降/正常/无效/NA'),
            width: ['performance', 'business_performance'].includes(testType) ? 255 : 200,
            render: (_: any) => {
                return (
                    ['functional', 'business_functional', 'business_business'].includes(testType) ?
                        (
                            <Space>
                                <div className={styles.column_circle_text} style={{ background: "#649FF6" }} onClick={() => handleStateChange('')} >{_.conf_count}</div>
                                <div className={styles.column_circle_text} style={{ background: "#81BF84" }} onClick={() => handleStateChange('success')} >{_.conf_success}</div>
                                <div className={styles.column_circle_text} style={{ background: "#C84C5A" }} onClick={() => handleStateChange('fail')} >{_.conf_fail}</div>
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
            title: '对比基线',
            dataIndex: 'baseline',
            width: 80,
            ...tooltipTd(),
        },
        (['performance', 'business_performance'].includes(testType) && !!dataSource.length && dataSource[0].baseline_job_id) &&
        {
            title: '基线Job',
            dataIndex: 'baseline_job_id',
            width: 80,
            ...tooltipTd(),
        },
        {
            title: '开始时间',
            dataIndex: 'start_time',
            width: 175,
            ...tooltipTd(),
        },
        {
            title: '结束时间',
            dataIndex: 'end_time',
            width: 175,
            ...tooltipTd(),
        },
        access.WsTourist() &&
        {
            title: '备注',
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
            title: '操作',
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
                                <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => AccessTootip()}>对比基线</span>
                                <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => AccessTootip()}>加入基线</span>
                            </Space>
                        }
                    >
                        <Space>
                            <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleContrastBaseline(_)}>对比基线</span>
                            <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleJoinBaseline(_)}>加入基线</span>
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
        handleOpenAll()
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
    const childName = ['functional', 'business_functional', 'business_business'].includes(testType) ? 'Case' : '指标'
    const expandBtnText = openAllRows ? '收起所有Conf' : '展开所有Conf'
    const expandIndexBtnText = indexExpandFlag ? `收起所有${childName}` : `展开所有${childName}`

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
                            {openAllRows ? '收起所有' : '展开所有'}
                        </Dropdown.Button>
                        {
                            ['performance', 'business_performance'].includes(testType) &&
                            <Access accessible={access.WsTourist()}>
                                <Access
                                    accessible={access.WsMemberOperateSelf(creator)}
                                    fallback={
                                        <Space>
                                            <Button onClick={() => AccessTootip()}>批量对比基线</Button>
                                            <Button onClick={() => AccessTootip()}>批量加入基线</Button>
                                        </Space>
                                    }
                                >
                                    <Space>
                                        <Button onClick={() => handleBatchContrastBaseline()}>批量对比基线</Button>
                                        <Button onClick={() => handleBatchJoinBaseline()}>批量加入基线</Button>
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