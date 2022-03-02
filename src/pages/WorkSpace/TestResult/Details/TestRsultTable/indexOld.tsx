import React, { useState, useRef } from 'react'
import { useRequest, Access, useAccess } from 'umi'
import { queryTestResult } from '../service'
import { Space, Table, Row, Button, message, Popover } from 'antd'
import { CaretRightFilled, CaretDownFilled } from '@ant-design/icons';
import CaseTable from './CaseTable'
import JoinBaseline from '../components/JoinBaseline'
import EditRemarks from '../components/EditRemarks'
import { uniqBy } from 'lodash'
import { ReactComponent as StopCircle } from '@/assets/svg/TestResult/suite/skip.svg'
import { ReactComponent as SuccessCircle } from '@/assets/svg/TestResult/suite/success.svg'
import { ReactComponent as ErrorCircle } from '@/assets/svg/TestResult/suite/fail.svg'
import { test_type_enum } from '@/utils/utils'
import { ellipsisEditColumn, tooltipTd } from '../components'
import styles from './index.less'
import ContrastBaseline from '../components/ContrastBaseline';

// 测试结果
export default (props: any) => {
    const { job_id, caseResult = {}, test_type = '功能', provider_name = '', ws_id, creator } = props
    const defaultParams = { state: '', job_id }
    const initialData = { test_suite: [] }
    const testType = ~test_type.indexOf('功能') ? 1 : 2
    const serverProvider = ~provider_name.indexOf('云上') ? 'aliyun' : 'aligroup'
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])
    const [openAllRows, setOpenAllRows] = useState(false)
    const [suiteCaseSelectKeys, setSuiteCaseSelectKeys] = useState<any>([])
    const [expandedRowKeys, setExpandedRowKeys] = useState<Array<any>>([])
    const joinBaselineDrawer: any = useRef(null)
    const contrastBaselineDrawer: any = useRef(null)
    const editRemarkDrawer: any = useRef(null)
    const [openAllExpand, setOpenAllExpand] = useState(false)

    const [refreshCaseTable, setRefreshCaseTable] = useState(false)

    const { data, run, params, loading, refresh } = useRequest(
        (p) => queryTestResult(p),
        {
            formatResult: response => {
                if (response.code === 200)
                    if (response.data[0])
                        return response.data[0]
                    else return initialData
                else {
                    message.error(response.msg)
                    return initialData
                }
            },
            initialData,
            defaultParams: [defaultParams]
        }
    )

    const states = testType === 1 ?
        [
            { key: 'count', name: '全部', value: '', color: '#649FF6' },
            { key: 'success', name: '通过', value: 'success', color: '#81BF84' },
            { key: 'fail', name: '失败', value: 'fail', color: '#C84C5A' },
            { key: 'skip', name: '跳过', value: 'skip', color: '#DDDDDD' },
        ] :
        [
            { key: 'count', name: '全部', value: '', color: '#649FF6' },
            { key: 'increase', name: '上升', value: 'increase', color: '#81BF84' },
            { key: 'decline', name: '下降', value: 'decline', color: '#C84C5A' },
            { key: 'normal', name: '正常', value: 'normal', color: '#DDDDDD' },
            { key: 'invalid', name: '无效', value: 'invalid', color: '#DDDDDD' },
            { key: 'na', name: 'NA', value: 'na', color: '#DDDDDD' },
        ]

    let columns: any = [
        {
        title: 'Test Suite',
        dataIndex: 'suite_name',
        ...tooltipTd(),
    }, 
    {
        title: '测试类型',
        dataIndex: 'test_type',
        width: 100,
        render: (text:any) => <span>{text || '-'}</span>,
        // <>
        //   {test_type_enum.map((item: any)=> {
        //     return item.value === text ? <span key={item.value}>{item.name || '-'}</span> : null })
        //   }
        // </>,
    },
    {
        title: '机器',
        width: 130,
        render: () => ('-')
    }]
    if (testType === 1)
        columns = columns.concat({
            title: '结果',
            dataIndex: 'result',
            width: 50,
            render: (_: any) => {
                if (_ === 'NA')
                    return <StopCircle style={{ width: 16, height: 16 }} />
                if (_ === 'fail')
                    return <ErrorCircle style={{ width: 16, height: 16 }} />
                if (_ === 'success')
                    return <SuccessCircle style={{ width: 16, height: 16 }} />
                return <></>
            }
        })

    columns = columns.concat([{
        title: testType === 1 ? '总计/通过/失败/跳过' : 'Metric总计/上升/下降/正常/无效/NA',
        width: testType === 2 ? 255 : 200,
        render: (_: any) => (
            testType === 1 ?
                (
                    <Space>
                        <div className={styles.column_circle_text} style={{ background: "#649FF6" }} onClick={() => handleStateChange('')} >{_.conf_count}</div>
                        <div className={styles.column_circle_text} style={{ background: "#81BF84" }} onClick={() => handleStateChange('success')} >{_.conf_success}</div>
                        <div className={styles.column_circle_text} style={{ background: "#C84C5A" }} onClick={() => handleStateChange('fail')} >{_.conf_fail}</div>
                        <div className={styles.column_circle_text} style={{ background: "#DDDDDD", color: "rgba(0,0,0.65)" }} onClick={() => handleStateChange('skip')} >{_.conf_skip}</div>
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
    }])

    if (testType === 2)
        columns = columns.concat([{
            title: '对比基线',
            dataIndex: 'baseline',
            width: 80,
            ...tooltipTd(),
        }])

    columns = columns.concat([{
        title: '开始时间',
        dataIndex: 'start_time',
        width: 175
    }, {
        title: '结束时间',
        dataIndex: 'end_time',
        width: 175
    }, {
        title: '备注',
        dataIndex: 'note',
        width: 80,
        render: (_: any, row: any) => (
            ellipsisEditColumn(
                _,
                row,
                80,
                () => editRemarkDrawer.current.show({ ...row, suite_name: row.suite_name, editor_obj: 'test_job_suite' })
            )
        )
    }])

    if (testType === 2)
        columns = columns.concat([
            {
                title: '操作',
                width: 145,
                render: (_: any) => (
                    <Space>
                        {/* <span onClick={ () => handleEditRemark( _ )        } style={{ color : '#1890FF' , cursor : 'pointer' }}>编辑</span> */}
                        <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleContrastBaseline(_)}>对比基线</span>
                        <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleJoinBaseline(_)}>加入基线</span>
                    </Space>
                )
            }
        ])

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
        console.log(suiteCaseSelectKeys, selectedRowKeys)
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

    const handleOnExpand = (expanded: boolean, record: any) => {
        if (expanded) {
            setExpandedRowKeys(expandedRowKeys.concat([record.suite_id]))
        }
        else {
            setExpandedRowKeys(expandedRowKeys.filter((i: number) => i !== record.suite_id))
        }
    }

    const handleOpenAll = () => {
        setExpandedRowKeys(data.test_suite.map(({ suite_id }: any) => suite_id))
        setOpenAllRows(true)
    }

    const handleOpenExpandBtn = () => {
        openAllExpand === false ?
            setExpandedRowKeys(data.test_suite.map(({ suite_id }: any) => suite_id)) :
            setExpandedRowKeys([])
        setOpenAllExpand(!openAllExpand)

        if (openAllExpand === false && testType === 2)
            setOpenAllRows(true)
        else setOpenAllRows(false)
    }

    const handleStateChange = (state: string) => {
        run({ ...defaultParams, state })
        handleOpenAll()
    }

    const rowSelection = + testType === 2 ? {
        columnWidth: 40,
        selectedRowKeys,
        onChange: (selectedRowKeys: any[]) => {
            console.log(selectedRowKeys)
            setSelectedRowKeys(selectedRowKeys)
        }
    } : undefined

    // 
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

    console.log(params)

    return (
        <div style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20, marginTop: 16 }}>
            <Row justify="space-between" style={{ marginBottom: 20 }}>
                {
                    testType === 1 ?
                        <Button onClick={handleOpenExpandBtn}>
                            {openAllExpand ? '收起所有Conf' : '展开所有Conf'}
                        </Button> :
                        <Space>
                            {/* <Button onClick={ handleOpenAll }>展开</Button>
                        <Button onClick={ handleCloseAll }>收起</Button> */}
                            <Button onClick={handleOpenExpandBtn}>
                                {openAllExpand ? '收起所有指标' : '展开所有指标'}
                            </Button>
                            <Space>
                                <Button onClick={() => handleBatchContrastBaseline()}>批量对比基线</Button>
                                <Button onClick={() => handleBatchJoinBaseline()}>批量加入基线</Button>
                            </Space>
                        </Space>
                }
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
                                    { name}({ caseResult[key]})
                                </span>
                            )
                        )
                    }
                </Space>
            </Row>
            <Table
                columns={columns}
                rowKey="suite_id"
                dataSource={data.test_suite}
                pagination={false}
                size="small"
                loading={loading}
                className={styles.result_expand_table}
                rowSelection={rowSelection}
                expandable={{
                    defaultExpandAllRows: openAllRows,
                    expandedRowKeys: expandedRowKeys,
                    onExpand: handleOnExpand,
                    expandedRowRender: (record) => (
                        <CaseTable
                            key={refreshCaseTable}
                            {...record}
                            ws_id={ws_id}
                            creator={creator}
                            server_provider={serverProvider}
                            testType={testType}
                            job_id={job_id}
                            openAllRows={openAllRows}
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
            <JoinBaseline
                ref={joinBaselineDrawer}
                test_type={testType}
                server_provider={serverProvider}
                onOk={handleJoinBaselineOk}
                ws_id={ws_id}
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
                ws_id={ws_id}
            />
        </div>
    )
}
