import { Table, Space, Row, Popover, Tooltip, Typography } from 'antd'
import React, { useRef, useState, useEffect } from 'react'
import { useRequest, useModel, Access, useAccess, useParams } from 'umi'

import { contrastBaseline, queryTestResultSuiteConfList } from '../service'
import { CaretRightFilled, CaretDownFilled } from '@ant-design/icons';
import JoinBaseline from '../components/JoinBaseline'
import ResultInfo from './ResultInfo'
import EditRemarks from '../components/EditRemarks'
import { ellipsisEditColumn, tooltipTd } from '../components'

import { ReactComponent as SuccessSVG } from '@/assets/svg/TestResult/conf/success.svg'
import { ReactComponent as ErrorSVG } from '@/assets/svg/TestResult/conf/fail.svg'
import { ReactComponent as MinusSvg } from '@/assets/svg/TestResult/conf/skip.svg'

import styles from './index.less'
import ContrastBaseline from '../components/ContrastBaseline'
import treeSvg from '@/assets/svg/tree.svg'
// const treeSvg = require('@/assets/svg/tree.svg')

const CaseTable: React.FC<any> = ({
    suite_id, testType, suite_name, server_provider, creator,
    suiteSelect = [], onCaseSelect, state = '', openAllRows = false
}) => {
    const { id: job_id, ws_id } = useParams() as any

    const background = `url(${treeSvg}) center center / 38.6px 32px `
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])
    const [expandedRowKeys, setExpandedRowKeys] = useState<Array<any>>([])
    const { initialState } = useModel('@@initialState');
    const { data, loading, refresh, run } = useRequest(
        () => queryTestResultSuiteConfList({ job_id, suite_id, state }),
        { initialData: [], manual: true }
    )
    const access = useAccess()
    const [childState, setChildState] = useState(state)
    const [refreshId, setRefreshId] = useState(null)

    useEffect(() => {
        run()
        setChildState(state)
    }, [state])

    const hanldeChangeChildState = (id: any, s: string = '') => {
        setExpandedRowKeys(Array.from(new Set(expandedRowKeys.concat(id))))
        setRefreshId(id)
        setChildState(s)
    }

    const editRemarkDrawer: any = useRef(null)
    const joinBaselineDrawer: any = useRef(null)
    const contrastBaselineDrawer: any = useRef(null)

    let columns: any = [{
        title: 'Test Suite',
        dataIndex: 'conf_name',
        ...tooltipTd(),
    }, {
        title: '机器',
        dataIndex: 'server_ip',
        width: 130,
        ellipsis: {
            showHeader: false,   
        },
        render: (_: string, row: any) => (
            _ ?
                <Tooltip title={_}>
                    <Typography.Text ellipsis>{_}</Typography.Text>
                </Tooltip>
                : '-'
        )
    }];

    if (['functional', 'business_functional', 'business_business'].includes(testType))
        columns = columns.concat([
            {
                title: '结果',
                width: 50,
                render: (_: any) => {
                    const r = _.result_data.result
                    if (r === 'success') return <SuccessSVG style={{ width: 16, height: 16 }} />
                    if (r === 'fail') return <ErrorSVG style={{ width: 16, height: 16 }} />
                    if (r === 'NA') return <MinusSvg style={{ width: 16, height: 16 }} />
                    if (r === '-') return r
                    return ''
                }
            }
        ])

    columns = columns.concat([
        { // title : '总计/通过/失败/跳过',
            width: ['performance', 'business_performance'].includes(testType) ? 255 : 200,
            render: (_: any) => (
                ['functional', 'business_functional', 'business_business'].includes(testType) ?
                    (
                        <Space>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, '')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "#649FF6" }}>{_.result_data.case_count}</span>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, 'success')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "#81BF84" }}>{_.result_data.case_success}</span>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, 'fail')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "#C84C5A" }}>{_.result_data.case_fail}</span>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, 'skip')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "rgba(0,0,0.65)" }}>{_.result_data.case_skip}</span>
                        </Space>
                    ) :
                    (
                        <Space>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, '')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "#649FF6" }} >{_.result_data.count}</span>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, 'increase')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "#81BF84" }} >{_.result_data.increase}</span>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, 'decline')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "#C84C5A" }} >{_.result_data.decline}</span>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, 'normal')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "rgba(0,0,0.65)" }} >{_.result_data.normal}</span>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, 'invalid')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "rgba(0,0,0.65)" }} >{_.result_data.invalid}</span>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, 'na')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "rgba(0,0,0.65)" }} >{_.result_data.na}</span>
                        </Space>
                    )
            )
        }
    ])

    if (['performance', 'business_performance'].includes(testType) && !!data.length && data[0].baseline)
        columns = columns.concat([{
            title: '对比基线',
            width: 80,
            dataIndex: 'baseline',
            ...tooltipTd(),
        }])
    if (['performance', 'business_performance'].includes(testType) && !!data.length && data[0].baseline_job_id)
        columns = columns.concat([{
            title: '基线Job',
            width: 80,
            dataIndex: 'baseline_job_id',
            ...tooltipTd(),
    }])

    columns = columns.concat(
        [
            {
                title: '开始时间',
                dataIndex: 'start_time',
                width: 175,
                ...tooltipTd(),
            }, {
                title: '结束时间',
                dataIndex: 'end_time',
                width: 175,
                ...tooltipTd(),
            },
        ]
    )
    if (access.wsRoleContrl(creator)) {
        columns = columns.concat([
            {
                title: '备注',
                dataIndex: 'note',
                width: 80,
                render: (_: any, row: any) => ellipsisEditColumn(
                    _,
                    row,
                    80,
                    () => editRemarkDrawer.current.show({
                        ...row,
                        suite_name: row.suite_name,
                        editor_obj: 'test_job_conf'
                    })
                )
            }
        ])
    }
    if (['performance', 'business_performance'].includes(testType)) {
        columns = columns.concat([
            {
                title: '操作',
                width: 145, //175,
                render: (_: any) => (
                    <Access accessible={access.wsRoleContrl(creator)}
                        fallback={
                            initialState?.authList?.ws_role_title === 'ws_tester' ?
                                <Space>
                                    <span style={{ color: '#ccc', cursor: 'pointer' }}>对比基线</span>
                                    <span style={{ color: '#ccc', cursor: 'pointer' }}>加入基线</span>
                                </Space>
                                : <></>
                        }
                    >
                        <Space>
                            <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleContrastBaseline(_)}>对比基线</span>
                            <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleJoinBaseline(_)}>加入基线</span>
                        </Space>
                    </Access>
                )
            }
        ])
    }

    const handleContrastBaseline = (_: any) => {
        contrastBaselineDrawer.current.show({ ..._, suite_id, job_id })
    }

    const handleJoinBaseline = (_: any) => {
        joinBaselineDrawer.current.show({ ..._, suite_id, job_id })
    }

    const rowSelection = ['performance', 'business_performance'].includes(testType) ? {
        columnWidth: 40,
        selectedRowKeys,
        onChange: (selectedRowKeys: any[]) => {
            setSelectedRowKeys(selectedRowKeys)
        }
    } : undefined

    useEffect(() => {
        if (suiteSelect.length) {
            const idx = suiteSelect.findIndex((i: any) => i === suite_id)
            if (idx > -1)
                setSelectedRowKeys(data.map((i: any) => i.test_case_id))
        }
        else setSelectedRowKeys([])
    }, [suiteSelect])


    const handleOnExpand = (expanded: boolean, record: any) => {
        if (expanded) {
            setExpandedRowKeys(expandedRowKeys.concat([record.test_case_id]))
        }
        else {
            setExpandedRowKeys(expandedRowKeys.filter((i: number) => i !== record.test_case_id))
        }
    }

    // 行选回调
    useEffect(() => {
        onCaseSelect(suite_id, selectedRowKeys)
    }, [selectedRowKeys])

    // 子级表格会通过监听传入的状态：展开全部/收起。
    useEffect(() => {
        if (data.length && openAllRows) {
            setExpandedRowKeys(data.map((i: any) => i.test_case_id))
        } else {
            setExpandedRowKeys([])
        }
    }, [data, openAllRows])

    return (
        <div style={{ width: '100%' }}>
            <Row justify="start">
                {
                    !loading &&
                    <div style={{ width: 32, background }} />
                }
                <Table
                    rowKey={'test_case_id'}
                    columns={columns}
                    loading={loading}
                    showHeader={false}
                    dataSource={data}
                    pagination={false}
                    size="small"
                    style={{ width: `calc(100% - 32px)` }}
                    rowSelection={rowSelection}
                    expandable={{
                        defaultExpandAllRows: openAllRows,
                        expandedRowKeys: expandedRowKeys,
                        onExpand: handleOnExpand,
                        expandedRowRender: (record: any) => (
                            <ResultInfo
                                {...record}
                                testType={testType}
                                server_provider={server_provider}
                                creator={creator}
                                suite_id={suite_id}
                                state={childState}
                                suite_name={suite_name}
                                openAllRows={openAllRows}
                                refreshId={refreshId}
                                setRefreshId={setRefreshId}
                            />
                        ),
                        expandIcon: ({ expanded, onExpand, record }: any) => (
                            expanded ?
                                (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                                (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                        )
                    }}
                />
            </Row>
            <JoinBaseline
                ref={joinBaselineDrawer}
                test_type={testType}
                server_provider={server_provider}
                onOk={refresh}
            />
            <ContrastBaseline
                ref={contrastBaselineDrawer}
                test_type={testType}
                server_provider={server_provider}
                onOk={refresh}
            />
            <EditRemarks ref={editRemarkDrawer} onOk={refresh} />
        </div>
    )
}

export default CaseTable