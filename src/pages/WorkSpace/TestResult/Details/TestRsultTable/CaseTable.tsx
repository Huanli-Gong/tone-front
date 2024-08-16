/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable react-hooks/exhaustive-deps */
import { Table, Space, Row, Button, message } from 'antd'
import React, { useEffect } from 'react'
import { Access, useAccess, useParams, FormattedMessage, useIntl, useModel, getLocale, request } from 'umi'
import ServerLink from '@/components/MachineWebLink/index';
import { queryTestResultSuiteConfList } from '../service'
import { CaretRightFilled, CaretDownFilled } from '@ant-design/icons';
import JoinBaseline from '../components/JoinBaseline'
import ResultInfo from './ResultInfo'
import EditRemarks from '../components/EditRemarks'
import { EllipsisEditColumn, tooltipTd } from '../components'

import { ReactComponent as SuccessSVG } from '@/assets/svg/TestResult/conf/success.svg'
import { ReactComponent as ErrorSVG } from '@/assets/svg/TestResult/conf/fail.svg'
import { ReactComponent as MinusSvg } from '@/assets/svg/TestResult/conf/skip.svg'

import styles from './index.less'
import ContrastBaseline from '../components/ContrastBaseline'
import treeSvg from '@/assets/svg/tree.svg'
import { AccessTootip } from '@/utils/utils';
import { getStorageState } from '@/utils/table.hooks';
import { MetricSelectProvider } from '.'
import { encode } from 'js-base64'

// const treeSvg = require('@/assets/svg/tree.svg')
const background = `url(${treeSvg}) center center / 38.6px 32px `

const CaseTable: React.FC<Record<string, any>> = (props) => {
    const {
        suite_id, testType, suite_name, server_provider, provider_name, creator, expandedState, expandedCaseRowKeys,
        openAllRows = false, setIndexExpandFlag, parentTableName, columnsChange
    } = props
    const { formatMessage } = useIntl()
    const { initialState } = useModel('@@initialState')

    const locale = getLocale() === 'en-US';
    const { setOSuite, oSuite } = React.useContext(MetricSelectProvider)
    const { id: job_id, share_id } = useParams() as any
    const [expandedRowKeys, setExpandedRowKeys] = React.useState<any[]>([])

    const access = useAccess()
    const [refreshId, setRefreshId] = React.useState('')
    const [loading, setLoading] = React.useState(true)
    const [source, setSource] = React.useState<any[]>([])
    const [currentState, setCurrentState] = React.useState(expandedState)
    // const [confLogInfo, setConfLogInfo] = React.useState({})

    const init = async () => {
        setLoading(true)
        const { data, code } = await queryTestResultSuiteConfList({ job_id, suite_id, state: expandedState, share_id })
        setLoading(false)
        if (code !== 200) return
        setSource(data)
    }

    React.useEffect(() => {
        init()
        setCurrentState(expandedState)
    }, [expandedState])

    const hanldeChangeChildState = (id: any, s: string = '') => {
        setExpandedRowKeys(Array.from(new Set(expandedRowKeys.concat(id))))
        setRefreshId(id)
        setCurrentState(s)
    }

    const editRemarkDrawer: any = React.useRef(null)
    const joinBaselineDrawer: any = React.useRef(null)
    const contrastBaselineDrawer: any = React.useRef(null)

    const hasBaselineColumn = !!source.length && source?.[0]?.baseline
    const hasBaselineIdColumn = !!source.length && source?.[0]?.baseline_job_id

    const handleContrastBaseline = (row: any) => {
        contrastBaselineDrawer.current.show({ ...row, ids: { [suite_id]: { [row.test_case_id]: null } } })
    }

    const handleJoinBaseline = (_: any) => {
        joinBaselineDrawer.current.show({ ..._, suite_id })
    }

    const handlePathClick = async (path: string, state: string) => {
        let params: any = {
            path: path,
            job_id, share_id
        }
        
        if (state === 'download') {
            params.download = '1'
        }

        if (BUILD_APP_ENV !== 'opensource') {
            const username = initialState?.authList?.username;
            const token = `${username}|${initialState?.token}|${new Date().getTime()}`;
            const signature = encode(token);

            params.username = username;
            params.signature = signature
        }

        if (state === 'download_folder') {
            params.download = '1';
            params.is_folder = '1'
            const downloadUrl = location.origin + `/api/get/oss/url/?` + Object.keys(params).filter((item)=> params[item]).map((key)=> `${key}=${params[key]}`).join('&')
            window.open(downloadUrl)
        } else {
            const data = await request(`/api/get/oss/url/`, { params })
            if (data) {
                if (data.code === 200 && data.msg === 'ok') window.open(data.data)
                else message.warn(`${['download', 'download_folder'].includes(state) ? formatMessage({ id: 'ws.result.details.failed.download.file' }): formatMessage({ id: 'ws.result.details.failed.get.file' })}`)
            }
        }
    }

    const columns = React.useMemo(() => [
        {
            title: 'Test Suite',
            dataIndex: 'conf_name',
            width: getStorageState(parentTableName, "suite_name") - 32 || 228,
            ...tooltipTd(),
        },
        {
            title: <FormattedMessage id="ws.result.details.test_type" />,
            dataIndex: 'test_type',
            width: getStorageState(parentTableName, "test_type") || 100,
            render: (text: any) => <span>{text || '-'}</span>,
        },
        {
            title: <FormattedMessage id="ws.result.details.the.server" />,
            dataIndex: 'server_ip',
            width: 130,
            ellipsis: {
                showHeader: false,
            },
            render: (_: string, row: any) => (
                <ServerLink
                    {...row}
                    val={_}
                    param={row.server_id}
                    provider={provider_name}
                    description={row.server_description}
                />
            )
        },
        ['functional', 'business_functional', 'business_business'].includes(testType) &&
        {
            title: <FormattedMessage id="ws.result.details.result" />,
            width: 80,
            render: (_: any) => {
                const r = _.result_data.result
                if (r === 'success') return <SuccessSVG style={{ width: 16, height: 16 }} />
                if (r === 'fail') return <ErrorSVG style={{ width: 16, height: 16 }} />
                if (r === 'NA') return <MinusSvg style={{ width: 16, height: 16 }} />
                if (r === '-') return r
                return ''
            }
        },
        { // title : '总计/通过/失败/跳过',
            width: ['functional', 'business_functional', 'business_business'].includes(testType) ? 255 : 302,
            render: (_: any) => (
                ['functional', 'business_functional', 'business_business'].includes(testType) ?
                    (
                        <Space>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, '')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "#649FF6" }}>{_.result_data.case_count}</span>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, 'success')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "#81BF84" }}>{_.result_data.case_success}</span>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, 'fail')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "#C84C5A" }}>{_.result_data.case_fail}</span>
                            <span onClick={() => hanldeChangeChildState(_.test_case_id, 'warn')} className={styles.column_circle_text} style={{ fontWeight: 600, color: "#dcc506" }}>{_.result_data.case_warn}</span>
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
        },
        (['performance', 'business_performance'].includes(testType) && hasBaselineColumn) &&
        {
            title: <FormattedMessage id="ws.result.details.baseline" />,
            dataIndex: 'baseline',
            width: 80,
            ...tooltipTd(),
        },
        (['performance', 'business_performance'].includes(testType) && hasBaselineIdColumn) &&
        {
            title: <FormattedMessage id="ws.result.details.baseline_job_id" />,
            dataIndex: 'baseline_job_id',
            width: 80,
            ...tooltipTd(),
        },
        {
            title: <FormattedMessage id="ws.result.details.start_time" />,
            dataIndex: 'start_time',
            width: getStorageState(parentTableName, "start_time") || 160,
            ...tooltipTd(),
        },
        {
            title: <FormattedMessage id="ws.result.details.end_time" />,
            dataIndex: 'end_time',
            width: getStorageState(parentTableName, "end_time") || 160,
            ...tooltipTd(),
        },
        access.WsTourist() &&
        {
            title: <FormattedMessage id="ws.result.details.note" />,
            dataIndex: 'note',
            width: 120,
            ellipsis: {
                showTitle: false,
            },
            render: (_: any, row: any) => (
                <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                    <EllipsisEditColumn
                        title={_}
                        width={70}
                        access={access.WsMemberOperateSelf(creator)}
                        onEdit={
                            () => editRemarkDrawer.current.show({
                                ...row,
                                suite_name: row.suite_name,
                                editor_obj: 'test_job_conf'
                            })
                        }
                    />
                    {// row.conf_log_path && 
                    <a><span onClick={
                        ()=> {
                            handlePathClick(row.conf_log_path, 'look')
                            // const { test_case_id, conf_log_path = "" } = row
                            // if (!expandedRowKeys.includes(test_case_id)) {
                            //     setExpandedRowKeys(expandedRowKeys.concat([test_case_id]))
                            // }
                            // // 跳转日志
                            // setConfLogInfo({ test_case_id, conf_log_path })
                       }}
                    >日志</span></a>
                    }
                </div>
            )
        },
        !share_id && ['performance', 'business_performance'].includes(testType) &&
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            width: locale ? 180 : 145,
            render: (_: any) => {
                return (
                    <Access accessible={access.WsTourist()}>
                        <Access accessible={access.WsMemberOperateSelf(creator)}
                            fallback={
                                <Space
                                    onClick={() => AccessTootip()}
                                >
                                    <span style={{ color: '#1890FF', cursor: 'pointer' }} ><FormattedMessage id="ws.result.details.baseline" /></span>
                                    <span style={{ color: '#1890FF', cursor: 'pointer' }} ><FormattedMessage id="ws.result.details.join.baseline" /></span>
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
        }
    ], [creator, access, hasBaselineColumn, hasBaselineIdColumn, columnsChange]).filter(Boolean)

    const rowSelection = !share_id && ['performance', 'business_performance'].includes(testType) ? {
        columnWidth: 40,
        selectedRowKeys: oSuite?.[suite_id] ? Object.keys(oSuite?.[suite_id]).map((i: any) => + i) : [],
        onChange: (keys: any[]) => {
            setOSuite(
                keys.length > 0 ?
                    {
                        ...oSuite,
                        [suite_id]: keys.reduce((p: any, c: any) => {
                            p[c] = oSuite?.[suite_id]?.[c] || null
                            return p
                        }, {})
                    } :
                    Object.keys(oSuite).reduce((p: any, c: any) => {
                        if (+ c !== suite_id) {
                            return p[c] = oSuite?.[suite_id]?.[c] || null
                        }
                        return p
                    }, {})
            )
        }
    } : undefined

    useEffect(() => {
        if (source && Object.prototype.toString.call(oSuite?.[suite_id]) === '[object Null]') {
            setOSuite({
                ...oSuite,
                [suite_id]: source.reduce((p: any, c: any) => {
                    const { test_case_id } = c
                    p[test_case_id] = null
                    return p
                }, {})
            })
        }
    }, [oSuite, source])

    const handleOnExpand = (expanded: boolean, record: any) => {
        if (expanded) {
            setIndexExpandFlag(true)
            setExpandedRowKeys(expandedRowKeys.concat([record.test_case_id]))
        }
        else {
            setIndexExpandFlag(false)
            setExpandedRowKeys(expandedRowKeys.filter((i: number) => i !== record.test_case_id))
        }
    }

    // 子级表格会通过监听传入的状态：展开全部/收起。
    useEffect(() => {
        if (source?.length && expandedCaseRowKeys.includes(suite_id)) {
            setExpandedRowKeys(source?.map((i: any) => i.test_case_id))
        } else {
            setExpandedRowKeys([])
        }
    }, [source, expandedCaseRowKeys])

    return (
        <div style={{ width: '100%' }}>
            <Row justify="start">
                <div style={{ width: 32, background }} />
                <Table
                    rowKey={'test_case_id'}
                    columns={columns as any}
                    loading={loading}
                    showHeader={false}
                    dataSource={source}
                    pagination={false}
                    scroll={{ x: '100%' }}
                    size="small"
                    className={styles["resultCaseTableCls"]}
                    style={{ width: `calc(100% - 32px)` }}
                    rowSelection={rowSelection}
                    expandable={{
                        defaultExpandAllRows: openAllRows,
                        expandedRowKeys: expandedRowKeys,
                        onExpand: handleOnExpand,
                        expandedRowClassName: () => "expandedRowClassNameCls",
                        expandedRowRender: (record: any) => (
                            <ResultInfo
                                {...record}
                                // confLogInfo={confLogInfo}
                                // resetLogInfoFn={setConfLogInfo}
                                lookPathCallback={handlePathClick}
                                state={currentState}
                                testType={testType}
                                server_provider={server_provider}
                                creator={creator}
                                suite_id={suite_id}
                                suite_name={suite_name}
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
                onOk={init}
            />
            <ContrastBaseline
                ref={contrastBaselineDrawer}
                test_type={testType}
                server_provider={server_provider}
                onOk={init}
            />
            <EditRemarks ref={editRemarkDrawer} onOk={init} />
        </div>
    )
}

export default CaseTable