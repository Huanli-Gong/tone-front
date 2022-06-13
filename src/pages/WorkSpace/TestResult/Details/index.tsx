import React, { useRef, useEffect, useState } from 'react'
import { Row, Col, Tag, Typography, Tabs, Button, message, Spin, Tooltip, Breadcrumb, Space, Alert } from 'antd'
import styles from './index.less'
import { useRequest, history, useModel, Access, useAccess, useParams } from 'umi'
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
import { requestCodeMessage } from '@/utils/utils';
import _, { isNull } from 'lodash'

const TestResultDetails: React.FC = (props: any) => {
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
            if (!tab && data && data.state === 'running') {
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

    const conversion = (data:any) => {
        if(!isNull(data.baseline_job_id)){
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
        const { note } = props;
        let noteStyle: any = {
            padding: 0,
            marginLeft: 10
        }
        if (isNull(note)) {
            noteStyle.marginLeft = 0
        } else {
            let len = note.split('\n')
            if (len.length >= 2) {
                noteStyle.position = 'absolute'
                noteStyle.top = 26
                noteStyle.left = len[0].length > 64 ? 'calc(100% - 22px)' : len[1].length * 14
            }
        }
        return (
            <EditOutlined
                onClick={handleOpenEditRemark}
                style={{ ...noteStyle }} />
        )
    }

    let TextStyle: any = {
        width: 'calc(100% - 74px)',
        wordBreak: 'break-all',
    }
    let BtnStyle: any = {
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        position: 'relative'
    }
    if (!isNull(data.note) && data.note?.indexOf('\n') !== -1) {
        TextStyle = { ...TextStyle, ...BtnStyle }
    }
    const BreadcrumbItem: React.FC<any> = (d: any) => (
        <Breadcrumb style={{ marginBottom: d.bottomHeight }}>
            <Breadcrumb.Item >
                <span style={{ cursor: 'pointer' }} onClick={() => history.push(`/ws/${ws_id}/test_result`)}>测试结果</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>结果详情</Breadcrumb.Item>
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
                                {!collection && <StarOutlined style={{ color: '#4F4F4F' }} className={styles.detail_collection} onClick={handleCollection} />}
                                {collection && <StarFilled style={{ color: '#F7B500' }} className={styles.detail_collection} onClick={handleCollection} />}
                                <Row className={styles.test_result_name} align="middle">
                                    {`#${data.id} ${data.name}`}
                                    {data.created_from === 'offline' && <span className={styles.offline_flag}>离</span>}
                                </Row>
                                <Row >
                                    <Col span={17} >
                                        <Row style={{ marginBottom: data.state !== 'pending' || isNull(data.pending_state_desc) ? 26 : 0 }}>
                                            <Space>
                                                <StateTag state={data.state} />
                                                {data.provider_name && <Tooltip title="机器类型" placement="bottom">
                                                    <Tag color="#F2F4F6" style={{ color: '#515B6A', margin: 0 }}>{data.provider_name}</Tag>
                                                </Tooltip>}
                                                {data.test_type && <Tooltip title="测试类型" placement="bottom">
                                                    <Tag color="#F2F4F6" style={{ color: '#515B6A', margin: 0 }}>{data.test_type}</Tag>
                                                </Tooltip>}
                                                {data.job_type && <Tooltip title="Job类型" placement="bottom">
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
                                            <RenderDesItem name="创建人" dataIndex={data.creator_name} />
                                            <RenderDesItem name="创建时间" dataIndex={data.gmt_created} />
                                            <RenderDesItem name="完成时间" dataIndex={data.end_time} />
                                        </Row>
                                        <Row className={styles.test_summary_row} >
                                            <RenderDesItem name="所属项目" dataIndex={data.project_name} />
                                            <RenderDesItem name={!isNull(data.baseline_job_id) ? '基线Job' : '测试基线'} dataIndex={conversion(data)} />
                                            {/* <RenderDesItem name="产品版本" dataIndex={data.product_version} /> */}
                                            <Col span={8} >
                                                <Row>
                                                    <Typography.Text className={styles.test_summary_item}>产品版本</Typography.Text>
                                                    <Typography.Text className={styles.test_summary_item_right_unellipsis}>{data.product_version || '-'}</Typography.Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                        {
                                            (data.plan_instance_name && data.plan_instance_id) &&
                                            <Row className={styles.test_summary_row} >
                                                <RenderDesItem
                                                    name="所属计划"
                                                    dataIndex={data.plan_instance_name}
                                                    isLink
                                                    onClick={() => history.push(`/ws/${ws_id}/test_plan/view/detail/${data.plan_instance_id}`)}
                                                />
                                            </Row>
                                        }
                                        <Row className={styles.test_summary_row} >
                                            <Typography.Text className={styles.test_summary_item}> Job标签 </Typography.Text>
                                            <TagsEditer
                                                onOk={handleEditTagsOk}
                                                ws_id={ws_id}
                                                job_id={job_id}
                                                tags={data.tags}
                                                accessible={access.wsRoleContrl(data.creator)}
                                                accessLabel={access.canWsAdmin()}
                                            />
                                        </Row>
                                        <Row>
                                            <Typography.Text className={styles.test_summary_item}>
                                                备注
                                            </Typography.Text>
                                            <div style={TextStyle}>
                                                <Tooltip
                                                    title={<span style={{ whiteSpace: 'pre-wrap' }}>{data.note}</span>}
                                                    placement="topLeft"
                                                    overlayStyle={{ minWidth: 800 }}
                                                >
                                                    {
                                                        data.note || '-'
                                                    }
                                                </Tooltip>

                                                {access.wsRoleContrl(data.creator) ? <EditNoteBtn note={data.note} /> : <></>}
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
                        <RenderMachinePrompt { ...data }/>
                        <div style={{ background: '#fff' }}>
                            <Tabs
                                defaultActiveKey={tab}
                                onTabClick={handleTabClick}
                                className={styles.result_tab_bar}
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

                                        <Access accessible={access.wsRoleContrl(data.creator)}
                                            fallback={
                                                initialState?.authList?.ws_role_title === 'ws_tester' ?
                                                    <>
                                                        <Button type={buttonType} disabled={true} style={{ marginRight: 8 }}>重跑</Button>
                                                        {testProgressTab && <Button disabled={true} style={{ marginRight: 8 }}>停止Job</Button>}
                                                    </>
                                                    : null
                                            }
                                        >
                                            <Button type={buttonType} onClick={handleReplay} disabled={buttonDisable} style={{ marginRight: 8 }}>重跑</Button>
                                            {testProgressTab && <Button onClick={handleStopJob} style={{ marginRight: 8 }}>停止Job</Button>}
                                        </Access>
                                    </div>
                                }
                            >
                                <Tabs.TabPane
                                    tab="测试结果"
                                    key="testResult"
                                    style={{ overflow: "hidden" }}
                                >
                                    <TestResultTable
                                        creator={data.creator}
                                        test_type={data.test_type}
                                        job_id={job_id}
                                        cases={data.case_result}
                                        caseResult={data.case_result}
                                        provider_name={data.provider_name}
                                        ws_id={ws_id}
                                    />
                                </Tabs.TabPane>
                                <Tabs.TabPane tab="执行过程" key="testProgress" disabled={data.created_from === 'offline'} >
                                    <ProcessTable
                                        job_id={job_id}
                                        onRef={processTableRef}
                                        test_type={data.test_type}
                                        provider_name={data.provider_name}
                                    />
                                </Tabs.TabPane>
                                <Tabs.TabPane tab="测试配置" key="testConfig" >
                                    <TestSettingTable
                                        jt_id={data.job_type_id}
                                        provider_name={data.provider_name}
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