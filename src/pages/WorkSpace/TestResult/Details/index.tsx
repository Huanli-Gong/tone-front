import React, { useRef, useEffect, useState } from 'react'
import { Row, Col, Tag, Typography, Tabs, Button, message, Spin, Tooltip, Breadcrumb, Space, Alert } from 'antd'
import styles from './index.less'
import { useRequest, history, useModel, Access, useAccess, useParams, useIntl, FormattedMessage } from 'umi'
import { querySummaryDetail, updateSuiteCaseOption } from './service'

import { addMyCollection, deleteMyCollection } from '@/pages/WorkSpace/TestResult/services'
import { StarOutlined, StarFilled, EditOutlined } from '@ant-design/icons'
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
import { useClientSize } from '@/utils/hooks';
import { requestCodeMessage, AccessTootip, aligroupServer, aliyunServer } from '@/utils/utils';
import _, { isNull } from 'lodash'

const TestResultDetails: React.FC = (props: any) => {
    const { formatMessage } = useIntl()
    const { ws_id, id: job_id } = useParams() as any

    const access = useAccess()
    const [tab, setTab] = useState('testResult')
    const [key, setKey] = useState(1)
    const rerunModalRef: any = useRef()
    const editRemarkDrawer: any = useRef()
    const processTableRef: any = useRef()
    const [collection, setCollection] = useState(false)
    const [fetching, setFetching] = React.useState(false)
    const allReport: any = useRef(null)
    const veiwReportHeight: any = useRef(null)
    const timer: any = useRef(null)
    const { initialState } = useModel('@@initialState');

    const { data, loading, refresh } = useRequest(
        () => querySummaryDetail({ job_id, ws_id }),
        {
            formatResult: (response: any) => {
                if (response.code === 200) {
                    return response?.data[0] || {}
                }
                return {}
            },
            initialData: {},
        }
    )

    const handleTabClick = (t: string) => {
        setTab(t)
    }

    useEffect(() => {
        data && setCollection(data.collection)
    }, [data])

    useEffect(() => {
        if (data && JSON.stringify(data) !== '{}' && data.id) {
            timer.current = setTimeout(() => {
                let title = `#${data.id} ${data.name} - T-One`
                window.document.title = title
            }, 2000)
        }
        return () => {
            clearTimeout(timer.current)
        }
    }, [data])

    useEffect(
        () => {
            if (data && data.state === 'running') {
                setTab('testProgress')
                setKey(+ new Date())
            }
        }, [data]
    )

    const handleOpenEditRemark = () => {
        editRemarkDrawer.current.show({ editor_obj: 'job', job_id, note: data.note })
    }

    const handleEditTagsOk = () => {
        message.success('操作成功')
        refresh()
    }

    const conversion = (data: any) => {
        if (!isNull(data.baseline_job_id)) {
            return <a href={`/ws/${ws_id}/test_result/${data.baseline_job_id}`}># {data.baseline_job_id}</a>
        }
        return data.baseline_name
    }

    const handleCollection = async () => {
        const { msg, code } = !data.collection ? await addMyCollection({ job_id }) : await deleteMyCollection({ job_id })
        if (code !== 200) return requestCodeMessage(code, msg)
        setCollection(!collection)
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
        message.success('操作成功')
        refresh()
        processTableRef.current.refresh()
        setFetching(false)
    }

    const RenderDesItem: React.FC<any> = ({ name, dataIndex, isLink, onClick }: any) => (
        <Col span={8} style={{ display: 'flex', alignItems: 'start' }}>
            <Typography.Text className={styles.test_summary_item}>{name}</Typography.Text>
            {
                isLink ?
                    <Typography.Text
                        className={styles.test_summary_item_right}
                        style={{ cursor: 'pointer', color: '#1890FF' }}
                    >
                        <span onClick={onClick}>{dataIndex || '-'}</span>
                    </Typography.Text> :
                    <Typography.Text className={styles.test_summary_item_right}>{dataIndex || '-'}</Typography.Text>
            }
        </Col>
    )

    const EditNoteBtn: React.FC<any> = (props: any) => {
        const { creator_id } = props;
        let noteStyle: any = {
            paddingTop: 5,
            marginRight: 10,
        }
        return (
            <Access
                accessible={access.WsMemberOperateSelf(creator_id)}
                fallback={<EditOutlined onClick={() => AccessTootip()} style={{ ...noteStyle }} />}
            >
                <EditOutlined
                    onClick={handleOpenEditRemark}
                    style={{ ...noteStyle }}
                />
            </Access>
        )
    }

    let TextStyle: any = {
        width: 'calc(100% - 104px)',
        wordBreak: 'break-all',
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
    }

    const BreadcrumbItem: React.FC<any> = (d: any) => (
        <Breadcrumb style={{ marginBottom: d.bottomHeight }}>
            <Breadcrumb.Item >
                <span style={{ cursor: 'pointer' }} onClick={() => history.push(`/ws/${ws_id}/test_result`)}><FormattedMessage id="ws.result.details.test.result"/></span>
            </Breadcrumb.Item>
            <Breadcrumb.Item><FormattedMessage id="ws.result.details.result.details"/></Breadcrumb.Item>
        </Breadcrumb>
    )

    const handleReplay = () => {
        rerunModalRef.current.show(data)
    }
    // const { height: windowHeight } = useClientSize()
    // !["success", "fail", "skip", "stop"].includes(data.state)
    const isShowStopButton = data && data.state !== 'success' && data.state !== 'fail' && data.state !== 'skip' && data.state !== 'stop'

    const buttonType = data?.report_li?.length ? "default" : "primary"
    // 判断是"离线上传"的数据
    const buttonDisable = data?.created_from === 'offline'
    // 判断是"执行过程tab"
    const testProgressTab = tab === 'testProgress' && isShowStopButton

    const getProviderName = (name: string) => new Map(
        [
            ["内网机器", formatMessage({id: 'aligroupServer'})],
            ["云上机器", formatMessage({id: 'aliyunServer'})],
            ["aligroup", formatMessage({id: 'aligroupServer'})],
            ["aliyun", formatMessage({id: 'aliyunServer'})],
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
        <>
            <Spin spinning={loading} className={styles.spin_style}>
                {
                    JSON.stringify(data) === '{}' &&
                    <NotFound />
                }
                {
                    JSON.stringify(data) !== '{}' &&
                    <div
                        style={{ background: '#F5F5F5', width: "100%", overflowX: "hidden", overflowY: "auto" }}
                    >
                        <div style={{ minHeight: 270, marginBottom: 10, background: '#fff', padding: 20 }}>
                            <BreadcrumbItem bottomHeight={4} />
                            <div style={{ paddingLeft: 20, position: 'relative' }}>
                                <Access accessible={access.WsTourist()}>
                                    {!collection && <StarOutlined style={{ color: '#4F4F4F' }} className={styles.detail_collection} onClick={handleCollection} />}
                                    {collection && <StarFilled style={{ color: '#F7B500' }} className={styles.detail_collection} onClick={handleCollection} />}
                                </Access>
                                <Row className={styles.test_result_name} align="middle">
                                    {`#${data.id} ${data.name}`}
                                    {data.created_from === 'offline' && <span className={styles.offline_flag}><FormattedMessage id="ws.test.result.offline"/></span>}
                                </Row>
                                <Row >
                                    <Col span={17} >
                                        <Row style={{ marginBottom: data.state !== 'pending' || isNull(data.pending_state_desc) ? 26 : 0 }}>
                                            <Space>
                                                <StateTag state={data.state} />
                                                {data.provider_name && <Tooltip title={formatMessage({id: 'ws.result.details.provider_name'})} placement="bottom">
                                                    <Tag color="#F2F4F6" style={{ color: '#515B6A', margin: 0 }}>
                                                        {getProviderName(data.provider_name)}
                                                    </Tag>
                                                </Tooltip>}
                                                {data.test_type && <Tooltip title={formatMessage({id: 'ws.result.details.test_type'})} placement="bottom">
                                                    <Tag color="#F2F4F6" style={{ color: '#515B6A', margin: 0 }}>{data.test_type}</Tag>
                                                </Tooltip>}
                                                {data.job_type && <Tooltip title={formatMessage({id: 'ws.result.details.job_type'})} placement="bottom">
                                                    <Tag color="#F2F4F6" style={{ color: '#515B6A', margin: 0 }}>{data.job_type}</Tag>
                                                </Tooltip>}
                                            </Space>
                                        </Row>
                                        {
                                            data.state === 'pending' && data.pending_state_desc &&
                                            <Row style={{ marginBottom: 26, marginTop: 6 }}>
                                                <Alert
                                                    message={
                                                        <span dangerouslySetInnerHTML={{
                                                            __html: data.pending_state_desc.replace(/(\d+)/g, `<a href="/ws/${ws_id}/test_result/$1" target="_blank">$1</a>`)
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
                                            <RenderDesItem name={formatMessage({id: 'ws.result.details.creator_name'})} dataIndex={data.creator_name} />
                                            <RenderDesItem name={formatMessage({id: 'ws.result.details.gmt_created'})} dataIndex={data.gmt_created} />
                                            <RenderDesItem name={formatMessage({id: 'ws.result.details.finish_time'})} dataIndex={data.end_time} />
                                        </Row>
                                        <Row className={styles.test_summary_row} >
                                            <RenderDesItem name={formatMessage({id: 'ws.result.details.project_name'})} dataIndex={data.project_name} />
                                            <RenderDesItem name={!isNull(data.baseline_job_id)? formatMessage({id: 'ws.result.details.baseline_job'}): formatMessage({id: 'ws.result.details.baseline_test'})} dataIndex={conversion(data)} />
                                            {/* <RenderDesItem name="产品版本" dataIndex={data.product_version} /> */}
                                            <Col span={8} >
                                                <Row>
                                                    <Typography.Text className={styles.test_summary_item}><FormattedMessage id="ws.result.details.produce.version"/></Typography.Text>
                                                    <Typography.Text className={styles.test_summary_item_right_unellipsis}>{data.product_version || '-'}</Typography.Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                        {
                                            (data.plan_instance_name && data.plan_instance_id) &&
                                            <Row className={styles.test_summary_row} >
                                                <RenderDesItem
                                                    name={formatMessage({id: 'ws.result.details.plan_instance_name'})}
                                                    dataIndex={data.plan_instance_name}
                                                    isLink
                                                    onClick={() => history.push(`/ws/${ws_id}/test_plan/view/detail/${data.plan_instance_id}`)}
                                                />
                                            </Row>
                                        }
                                        <Row className={styles.test_summary_row} >
                                            <Typography.Text className={styles.test_summary_item}><FormattedMessage id="ws.result.details.job.tag"/></Typography.Text>
                                            <TagsEditer
                                                onOk={handleEditTagsOk}
                                                ws_id={ws_id}
                                                job_id={job_id}
                                                tags={data.tags}
                                                creator_id={data.creator}
                                                accessLabel={access.WsMemberOperateSelf()}
                                            />
                                        </Row>
                                        <Row style={{ position: 'relative' }}>
                                            <Typography.Text className={styles.test_summary_item}>
                                                <FormattedMessage id="ws.result.details.test_summary"/>
                                            </Typography.Text>
                                            <Access accessible={access.WsTourist()}>
                                                <EditNoteBtn note={data.note} creator_id={data.creator} />
                                            </Access>
                                            <div style={TextStyle}>
                                                <Tooltip
                                                    title={<span style={{ whiteSpace: 'pre-wrap' }}>{data.note}</span>}
                                                    placement="topLeft"
                                                    overlayStyle={{ minWidth: 800 }}
                                                >
                                                    {data.note || '-'}
                                                </Tooltip>
                                            </div>
                                        </Row>
                                    </Col>
                                    <Col span={7} style={{ position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'fix-end', width: '100%' }}>
                                            <Chart test_type={data.test_type} data={data.case_result} plan={(data.plan_instance_name && data.plan_instance_id)} />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        <RenderMachineItem job_id={job_id} />
                        <RenderMachinePrompt {...data} />
                        <div style={{ background: '#fff' }}>
                            <Tabs
                                defaultActiveKey={tab}
                                onTabClick={handleTabClick}
                                className={styles.result_tab_nav}
                                key={key}
                                tabBarExtraContent={
                                    <div style={{ display: 'flex', marginRight: 12 }}>
                                        <ViewReport
                                            viewAllReport={allReport}
                                            dreType="bottomRight"
                                            ws_id={ws_id}
                                            jobInfo={data}
                                            origin={'jobDetail'}
                                            stylesButton={veiwReportHeight.current}
                                        />
                                        <Access accessible={access.IsWsSetting()}>
                                            <Button type={buttonType} onClick={handleReplay} disabled={buttonDisable} style={{ marginRight: 8 }}>
                                                <FormattedMessage id="ws.result.details.rerun"/>
                                            </Button>
                                        </Access>
                                        <Access accessible={access.WsTourist()}>
                                            <Access
                                                accessible={access.WsMemberOperateSelf(data.creator)}
                                                fallback={testProgressTab && <Button onClick={() => AccessTootip()} style={{ marginRight: 8 }}>
                                                    <FormattedMessage id="ws.result.details.stop"/>
                                                </Button>}
                                            >
                                                {testProgressTab && <Button onClick={handleStopJob} style={{ marginRight: 8 }}><FormattedMessage id="ws.result.details.stop"/></Button>}
                                            </Access>
                                        </Access>
                                    </div>
                                }
                            >
                                <Tabs.TabPane
                                    tab={<FormattedMessage id="ws.result.details.tab.testResult"/>}
                                    key="testResult"
                                    style={{ overflow: "hidden" }}
                                >
                                    <TestResultTable
                                        creator={data.creator}
                                        test_type={data.test_type}
                                        job_id={job_id}
                                        cases={data.case_result}
                                        caseResult={data.case_result}
                                        provider_name={transProvider(data.provider_name)}
                                        ws_id={ws_id}
                                    />
                                </Tabs.TabPane>
                                <Tabs.TabPane tab={<FormattedMessage id="ws.result.details.tab.testProgress"/>}
                                    key="testProgress" disabled={data.created_from === 'offline'} >
                                    <ProcessTable
                                        job_id={job_id}
                                        onRef={processTableRef}
                                        test_type={data.test_type}
                                        provider_name={transProvider(data.provider_name)}
                                    />
                                </Tabs.TabPane>
                                <Tabs.TabPane tab={<FormattedMessage id="ws.result.details.tab.testConfig"/>}
                                    key="testConfig" >
                                    <TestSettingTable
                                        jt_id={data.job_type_id}
                                        provider_name={transProvider(data.provider_name)}
                                        test_type={data.test_type}
                                    />
                                </Tabs.TabPane>
                            </Tabs>
                        </div>
                    </div>
                }
            </Spin>
            <EditRemarks ref={editRemarkDrawer} onOk={refresh} />
            <ReRunModal ref={rerunModalRef} />
        </>
    )
}

export default TestResultDetails