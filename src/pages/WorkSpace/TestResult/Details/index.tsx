import React, { useRef, useState } from 'react'
import { Row, Col, Tag, Typography, Tabs, Button, message, Spin, Tooltip, Breadcrumb, Space, Alert, Popconfirm } from 'antd'
import styles from './index.less'
import { history, useModel, Access, useAccess, useParams, useIntl, FormattedMessage, getLocale, Helmet } from 'umi'
import { querySummaryDetail, updateSuiteCaseOption, getJobDownloadLink } from './service'

import { addMyCollection, deleteMyCollection, queryJobState } from '@/pages/WorkSpace/TestResult/services'
import { StarOutlined, StarFilled, EditOutlined, DownloadOutlined, ShareAltOutlined } from '@ant-design/icons'
import Chart from './components/Chart'
import TestResultTable from './TestRsultTable'
import ProcessTable from './ProcessTable'
import TestSettingTable from './TestSettingTable'
import EditRemarks from './components/EditRemarks'
import TagsEditer from './components/TagsEditer'
import { StateTag } from './components'
import ViewReport from '../CompareBar/ViewReport'
import NotFound from './components/404'
import RenderMachineItem from './components/MachineTable'
import RenderMachinePrompt from './components/MachinePrompt'
import ReRunModal from './components/ReRunModal'
import { requestCodeMessage, AccessTootip, matchTestType, targetJump } from '@/utils/utils';
import _, { isNull } from 'lodash'
import { useCopyText } from '@/utils/hooks'
import styled from 'styled-components'

const BreadcrumbIcon = styled(Typography.Text)`
    cursor: pointer;
    font-size: 16px;
    &:hover {
        color: #1890ff
    }
`

const CAN_STOP_JOB_STATES = ['running', 'pending', 'pending_q']
const RenderDesItem: React.FC<any> = ({ name, dataIndex, isLink, onClick }: any) => {
    const locale = getLocale() === 'en-US';
    const widthStyle = locale ? 120 : 58

    return (
        <Col span={8} style={{ display: 'flex', alignItems: 'start' }}>
            <Typography.Text className={styles.test_summary_item} style={{ width: widthStyle }}>{name}</Typography.Text>
            {
                isLink ?
                    <Typography.Text
                        className={styles.test_summary_item_right}
                        style={{ cursor: 'pointer', color: '#1890FF', width: `calc(100% - ${widthStyle}px - 16px)` }}
                    >
                        <span onClick={onClick}>{dataIndex || '-'}</span>
                    </Typography.Text> :
                    <Typography.Text
                        className={styles.test_summary_item_right}
                        style={{ width: `calc( 100% - ${widthStyle}px - 16px)` }}
                    >
                        {dataIndex || '-'}
                    </Typography.Text>
            }
        </Col>
    )
}

const BreadcrumbItem: React.FC<any> = (d: any) => {
    const { ws_id, id: job_id } = useParams() as any
    const access = useAccess()
    const intl = useIntl()

    const downloadRef = React.useRef<HTMLAnchorElement>(null)
    const [downloadHerf, setDownloadHref] = React.useState()
    const [fetching, setFetching] = React.useState(false)

    const handleCopy = useCopyText(intl.formatMessage({ id: "request.copy.success" }))

    const handleDownloadJob = async () => {
        if (downloadHerf) {
            downloadRef.current?.click()
            return
        }
        if (!fetching) {
            setFetching(true)
            const { data, code } = await getJobDownloadLink({ job_id })
            setFetching(false)
            if (code !== 200) return

            if (data) {
                setDownloadHref(data)
            }
        }
    }

    React.useEffect(() => {
        if (downloadHerf) downloadRef.current?.click()
    }, [downloadHerf])

    const { origin, pathname } = window.location

    return (
        <Row justify={"space-between"}>
            <Breadcrumb style={{ marginBottom: d.bottomHeight }}>
                <Breadcrumb.Item >
                    <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => history.push(`/ws/${ws_id}/test_result`)}
                    >
                        <FormattedMessage id="ws.result.details.test.result" />
                    </span>
                </Breadcrumb.Item>
                <Breadcrumb.Item><FormattedMessage id="ws.result.details.result.details" /></Breadcrumb.Item>
            </Breadcrumb>
            <Access accessible={access.IsWsSetting()}>
                <Space>
                    <Tooltip
                        placement="bottom"
                        title={intl.formatMessage({ id: `ws.result.details.breadcrumb.button.share` })}
                    >
                        <BreadcrumbIcon onClick={() => handleCopy(origin + pathname)}>
                            <ShareAltOutlined />
                        </BreadcrumbIcon>
                    </Tooltip>
                    <Tooltip
                        placement="bottom"
                        title={intl.formatMessage({ id: `ws.result.details.breadcrumb.button.download` })}
                    >
                        <BreadcrumbIcon onClick={handleDownloadJob}>
                            <DownloadOutlined />
                        </BreadcrumbIcon>
                    </Tooltip>
                </Space>
            </Access>
            <a ref={downloadRef} href={downloadHerf} target="_blank" style={{ display: "none" }} />
        </Row>
    )
}

const EditNoteBtn: React.FC<any> = (props) => {
    const access = useAccess()
    const { creator_id, note, refresh } = props;
    const { id: job_id } = useParams() as any
    const ref: any = useRef()

    const handleOpenEditRemark = () => {
        ref.current?.show({ editor_obj: 'job', job_id, note })
    }

    const noteStyle: any = {
        paddingTop: 5,
        marginRight: 10,
    }

    return (
        <>
            <Access
                accessible={access.WsMemberOperateSelf(creator_id)}
                fallback={
                    <EditOutlined
                        onClick={() => AccessTootip()}
                        style={{ ...noteStyle }}
                    />
                }
            >
                <EditOutlined
                    onClick={handleOpenEditRemark}
                    style={{ ...noteStyle }}
                />
            </Access>
            <EditRemarks ref={ref} onOk={refresh} />
        </>

    )
}
const TestResultDetails: React.FC = (props: any) => {
    const { formatMessage } = useIntl()
    const locale = getLocale() === 'en-US';
    const widthStyle = locale ? 120 : 58
    const { ws_id, id: job_id } = useParams() as any

    const access = useAccess()
    const [tab, setTab] = useState('testResult')
    const rerunModalRef: any = useRef()
    const processTableRef: any = useRef()
    const [fetching, setFetching] = React.useState(false)
    const [refreshResult, setRefreshResult] = React.useState(false)
    const allReport: any = useRef(null)
    const veiwReportHeight: any = useRef(null)
    const { initialState } = useModel('@@initialState');

    const [loading, setLoading] = React.useState(true)
    const [details, setDetails] = React.useState<any>({})

    const timer = React.useRef<any>(null)

    const queryJobDetails = async () => {
        setLoading(true)
        const { data, code, msg } = await querySummaryDetail({ job_id, ws_id })
        setLoading(false)
        if (code !== 200 || Object.prototype.toString.call(data) !== "[object Array]" || data.length === 0)
            return setDetails({})

        const [dataSource] = data
        if (!dataSource) return setDetails({})
        if (dataSource?.state === 'running')
            setTab('testProgress')
        setDetails(dataSource)
    }

    React.useEffect(() => {
        queryJobDetails()
        return () => {
            timer.current && clearTimeout(timer.current)
            setDetails({})
        }
    }, [])

    const getJobState = async () => {
        const { state } = details
        if (!CAN_STOP_JOB_STATES.includes(state)) return
        const { data: { job_state }, code } = await queryJobState({ job_id, ws_id })
        if (code !== 200) return
        if (CAN_STOP_JOB_STATES.includes(job_state)) {
            timer.current = setTimeout(getJobState, 5000)
        }
        setDetails((p: any) => ({ ...p, state: job_state }))
    }

    React.useEffect(() => {
        const { state } = details
        if (timer.current) setTimeout(timer.current)
        if (state) getJobState()
    }, [details?.state])

    const handleTabClick = (t: string) => {
        setTab(t)
    }

    const handleEditTagsOk = () => {
        message.success(formatMessage({ id: 'operation.success' }))
        queryJobDetails()
    }

    const conversion = () => {
        if (!isNull(details?.baseline_job_id)) {
            return <a href={`/ws/${ws_id}/test_result/${details?.baseline_job_id}`}># {details?.baseline_job_id}</a>
        }
        return details?.baseline_name
    }

    const handleCollection = async () => {
        const { msg, code } = !details.collection ? await addMyCollection({ job_id }) : await deleteMyCollection({ job_id })
        if (code !== 200) return requestCodeMessage(code, msg)
        setDetails((p: any) => ({ ...p, collection: !p.collection, }))
    }

    const handleStopJob = async () => {
        if (fetching) return
        setFetching(true)
        // 添加用户id
        const { user_id } = initialState?.authList
        const q = user_id ? { user_id } : {}
        const { code, msg } = await updateSuiteCaseOption({ ...q, editor_obj: 'job', job_id, state: 'stop' })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            setFetching(false)
            return
        }
        message.success(formatMessage({ id: 'operation.success' }))
        queryJobDetails()
        if (tab === 'testResult') {
            setRefreshResult(true)
        }
        if (tab === 'testProgress') {
            processTableRef.current.refresh()
        }
        setFetching(false)
    }

    let TextStyle: any = {
        // width: 'calc(100% - 104px)',
        wordBreak: 'break-all',
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
    }

    const handleReplay = () => {
        rerunModalRef.current.show(details)
    }
    // const { height: windowHeight } = useClientSize()
    // !["success", "fail", "skip", "stop"].includes(data.state)

    const buttonType = details?.report_li?.length ? "default" : "primary"
    // 判断是"离线上传"的数据
    const buttonDisable = details?.created_from === 'offline'
    // 判断是"执行过程tab"

    const getProviderName = (name: string) => new Map(
        [
            ["内网机器", formatMessage({ id: 'aligroupServer' })],
            ["云上机器", formatMessage({ id: 'aliyunServer' })],
            ["aligroup", formatMessage({ id: 'aligroupServer' })],
            ["aliyun", formatMessage({ id: 'aliyunServer' })],
        ]
    ).get(name)

    const transProvider = (name: string) => new Map(
        [
            ["内网机器", "aligroup"],
            ["云上机器", "aliyun"],
            ["aligroup", "aligroup"],
            ["aliyun", "aliyun"],
        ]
    ).get(name)


    return (
        <Spin spinning={loading} className={styles.spin_style}>
            <Helmet>
                <title>{`#${job_id} ${details?.name} - T-One`}</title>
            </Helmet>
            {
                JSON.stringify(details) === '{}' ?
                    <NotFound /> :
                    <div style={{ background: '#F5F5F5', width: "100%", overflowX: "hidden", overflowY: "auto" }} >
                        <div style={{ minHeight: 270, marginBottom: 10, background: '#fff', padding: 20 }}>
                            <BreadcrumbItem bottomHeight={4} />
                            <div style={{ paddingLeft: 20, position: 'relative' }}>
                                <Access accessible={access.WsTourist()}>
                                    {
                                        !details?.collection ?
                                            <StarOutlined
                                                style={{ color: '#4F4F4F' }}
                                                className={styles.detail_collection}
                                                onClick={handleCollection}
                                            /> :
                                            <StarFilled
                                                style={{ color: '#F7B500' }}
                                                className={styles.detail_collection}
                                                onClick={handleCollection}
                                            />
                                    }
                                </Access>
                                <Row className={styles.test_result_name} align="middle">
                                    {`#${details?.id} ${details?.name}`}
                                    {
                                        details?.created_from === 'offline' &&
                                        <span className={styles.offline_flag}>
                                            <FormattedMessage id="ws.result.list.offline" />
                                        </span>
                                    }
                                </Row>
                                <Row >
                                    <Col span={17} >
                                        <Row style={{ marginBottom: details?.state !== 'pending' || isNull(details?.pending_state_desc) ? 26 : 0 }}>
                                            <Space>
                                                <StateTag state={details?.state} />
                                                {
                                                    details?.provider_name &&
                                                    <Tooltip title={formatMessage({ id: 'ws.result.details.provider_name' })} placement="bottom">
                                                        <Tag color="#F2F4F6" style={{ color: '#515B6A', margin: 0 }}>
                                                            {getProviderName(details?.provider_name)}
                                                        </Tag>
                                                    </Tooltip>
                                                }
                                                {
                                                    details?.test_type &&
                                                    <Tooltip title={formatMessage({ id: 'ws.result.details.test_type' })} placement="bottom">
                                                        <Tag color="#F2F4F6" style={{ color: '#515B6A', margin: 0 }}>
                                                            <FormattedMessage id={`${matchTestType(details?.test_type)}.test`} defaultMessage={details?.test_type} />
                                                        </Tag>
                                                    </Tooltip>
                                                }
                                                {
                                                    details?.job_type &&
                                                    <Tooltip title={formatMessage({ id: 'ws.result.details.job_type' })} placement="bottom">
                                                        <Tag color="#F2F4F6" style={{ color: '#515B6A', margin: 0 }}>{details?.job_type}</Tag>
                                                    </Tooltip>
                                                }
                                            </Space>
                                        </Row>
                                        {
                                            details?.state === 'pending' && details?.pending_state_desc &&
                                            <Row style={{ marginBottom: 26, marginTop: 6 }}>
                                                <Alert
                                                    message={
                                                        <span dangerouslySetInnerHTML={{
                                                            __html: details?.pending_state_desc.replace(/(\d+)/g, `<a href="/ws/${ws_id}/test_result/$1" target="_blank">$1</a>`)
                                                        }} />
                                                    }
                                                    type="warning"
                                                    showIcon
                                                    closable
                                                    style={{ height: 30, color: 'rgba(0,0,0,0.65)', fontSize: 12 }}
                                                />
                                            </Row>
                                        }
                                        <Row className={styles.test_summary_row} >
                                            <RenderDesItem
                                                name={formatMessage({ id: 'ws.result.details.creator_name' })}
                                                dataIndex={details?.creator_name}
                                            />
                                            <RenderDesItem
                                                name={formatMessage({ id: 'ws.result.details.gmt_created' })}
                                                dataIndex={details?.gmt_created}
                                            />
                                            <RenderDesItem
                                                name={formatMessage({ id: 'ws.result.details.finish_time' })}
                                                dataIndex={details?.end_time}
                                            />
                                        </Row>
                                        <Row className={styles.test_summary_row} >
                                            <RenderDesItem
                                                name={formatMessage({ id: 'ws.result.details.project_name' })}
                                                dataIndex={details?.project_name}
                                            />
                                            <RenderDesItem
                                                name={
                                                    !isNull(details?.baseline_job_id) ?
                                                        formatMessage({ id: 'ws.result.details.baseline_job' }) :
                                                        formatMessage({ id: 'ws.result.details.baseline_test' })
                                                }
                                                dataIndex={conversion()}
                                            />
                                            <Col span={8} >
                                                <Row>
                                                    <Typography.Text
                                                        className={styles.test_summary_item}
                                                        style={{ width: widthStyle }}
                                                    >
                                                        <FormattedMessage id="ws.result.details.produce.version" />
                                                    </Typography.Text>
                                                    <Typography.Text
                                                        className={styles.test_summary_item_right_unellipsis}
                                                        style={{ width: `calc( 100% - ${widthStyle}px - 16px)` }}
                                                    >
                                                        {details?.product_version || '-'}
                                                    </Typography.Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                        {
                                            (details?.plan_instance_name && details?.plan_instance_id) &&
                                            <Row className={styles.test_summary_row} >
                                                <RenderDesItem
                                                    name={formatMessage({ id: 'ws.result.details.plan_instance_name' })}
                                                    dataIndex={details?.plan_instance_name}
                                                    isLink
                                                    onClick={() => history.push(`/ws/${ws_id}/test_plan/view/detail/${details?.plan_instance_id}`)}
                                                />
                                            </Row>
                                        }
                                        <Row className={styles.test_summary_row}>
                                            <Typography.Text className={styles.test_summary_item} style={{ width: widthStyle }}><FormattedMessage id="ws.result.details.job.tag" /></Typography.Text>
                                            <TagsEditer
                                                onOk={handleEditTagsOk}
                                                ws_id={ws_id}
                                                job_id={job_id}
                                                tags={details?.tags}
                                                creator_id={details?.creator}
                                                accessLabel={access.WsMemberOperateSelf()}
                                            />
                                        </Row>
                                        <Row style={{ position: 'relative' }}>
                                            <Typography.Text className={styles.test_summary_item} style={{ width: widthStyle }}>
                                                <FormattedMessage id="ws.result.details.test_summary" />
                                            </Typography.Text>
                                            <EditNoteBtn
                                                note={details?.note}
                                                creator_id={details?.creator}
                                                refresh={queryJobDetails}
                                            />
                                            <div style={{ ...TextStyle, width: `calc(100% - ${widthStyle}px - 60px)` }}>
                                                {
                                                    details?.note ?
                                                        <Tooltip
                                                            title={<span style={{ whiteSpace: 'pre-wrap' }}>{details?.note}</span>}
                                                            placement="topLeft"
                                                            overlayStyle={{ minWidth: 800 }}
                                                        >
                                                            {details?.note}
                                                        </Tooltip> :
                                                        <span>-</span>
                                                }
                                            </div>
                                        </Row>
                                    </Col>
                                    <Col span={7} style={{ position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'fix-end', width: '100%' }}>
                                            <Chart
                                                test_type={details.test_type}
                                                data={details.case_result}
                                                plan={(details.plan_instance_name && details.plan_instance_id)}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        <RenderMachineItem job_id={job_id} />
                        <RenderMachinePrompt {...details} />
                        <div style={{ background: '#fff' }}>
                            <Tabs
                                defaultActiveKey={tab}
                                onTabClick={handleTabClick}
                                className={styles.result_tab_nav}
                                tabBarExtraContent={
                                    <div style={{ display: 'flex', marginRight: 12 }}>
                                        <ViewReport
                                            viewAllReport={allReport}
                                            dreType="bottomRight"
                                            ws_id={ws_id}
                                            jobInfo={details}
                                            origin={'jobDetail'}
                                            stylesButton={veiwReportHeight.current}
                                        />
                                        <Access accessible={access.IsWsSetting()}>
                                            <Button
                                                type={buttonType}
                                                onClick={handleReplay}
                                                disabled={buttonDisable}
                                                style={{ marginRight: 8 }}
                                            >
                                                <FormattedMessage id="ws.result.details.rerun" />
                                            </Button>
                                        </Access>
                                        <Access
                                            accessible={access.WsMemberOperateSelf(details?.creator)}
                                            fallback={
                                                CAN_STOP_JOB_STATES.includes(details?.state) &&
                                                <Button onClick={() => AccessTootip()} style={{ marginRight: 8 }}>
                                                    <FormattedMessage id="ws.result.details.stop" />
                                                </Button>
                                            }
                                        >
                                            {CAN_STOP_JOB_STATES.includes(details?.state) &&
                                                <Popconfirm
                                                    placement="topRight"
                                                    title={
                                                        formatMessage({
                                                            id: "ws.result.details.job.confirm.stop",
                                                            defaultMessage: "确定要停止job吗？"
                                                        })
                                                    }
                                                    onConfirm={handleStopJob}
                                                >

                                                    <Button style={{ marginRight: 8 }}>
                                                        <FormattedMessage id="ws.result.details.stop" />
                                                    </Button>
                                                </Popconfirm>
                                            }
                                        </Access>
                                    </div>
                                }
                            >
                                <Tabs.TabPane
                                    tab={<FormattedMessage id="ws.result.details.tab.testResult" />}
                                    key="testResult"
                                    style={{ overflow: "hidden" }}
                                >
                                    <TestResultTable
                                        creator={details.creator}
                                        test_type={details.test_type}
                                        job_id={job_id}
                                        cases={details.case_result}
                                        caseResult={details.case_result}
                                        provider_name={transProvider(details.provider_name)}
                                        ws_id={ws_id}
                                        refreshResult={refreshResult}
                                    />
                                </Tabs.TabPane>
                                <Tabs.TabPane tab={<FormattedMessage id="ws.result.details.tab.testProgress" />}
                                    key="testProgress" disabled={details?.created_from === 'offline'} >
                                    <ProcessTable
                                        job_id={job_id}
                                        onRef={processTableRef}
                                        test_type={details?.test_type}
                                        provider_name={transProvider(details?.provider_name)}
                                    />
                                </Tabs.TabPane>
                                <Tabs.TabPane tab={<FormattedMessage id="ws.result.details.tab.testConfig" />}
                                    key="testConfig" >
                                    <TestSettingTable
                                        jt_id={details?.job_type_id}
                                        provider_name={transProvider(details?.provider_name)}
                                        test_type={details?.test_type}
                                    />
                                </Tabs.TabPane>
                            </Tabs>
                        </div>
                    </div>
            }
            <ReRunModal ref={rerunModalRef} />
        </Spin >
    )
}

export default TestResultDetails