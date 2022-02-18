import React, { useRef, useEffect, useState } from 'react'
import { Row, Col, Tag, Typography, Tabs, Button, message, Spin, Tooltip, Breadcrumb } from 'antd'
import styles from './index.less'
import { useRequest, history, useModel, Access, useAccess } from 'umi'
import { querySummaryDetail, updateSuiteCaseOption } from './service'

import { addMyCollection, deleteMyCollection } from '@/pages/WorkSpace/TestResult/services'
import { StarOutlined, StarFilled } from '@ant-design/icons'
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
import ReRunModal from './components/ReRunModal'
import { useClientSize } from '@/utils/hooks';
import { requestCodeMessage } from '@/utils/utils';

export default (props: any) => {
    const { ws_id, id } = props.match.params
    const job_id = + id
    const access = useAccess()
    const [tab, setTab] = useState('')
    const [key, setKey] = useState(1)
    const rerunModalRef: any = useRef()
    const editRemarkDrawer: any = useRef()
    const processTableRef: any = useRef()
    const [collection, setCollection] = useState(false)
    const allReport: any = useRef(null)
    const veiwReportHeight: any = useRef(null)
    const timer: any = useRef(null)
    const { initialState } = useModel('@@initialState');
    const { data, loading, refresh } = useRequest(
        () => querySummaryDetail({ job_id }),
        {
            formatResult: (response: any) => {
                if (response.code === 200) {
                    return response?.data[0] || {}
                }
                requestCodeMessage(response.data, response.msg)
                return {}
            },
            initialData: {},
        }
    )

    const handleTabClick = (t: string) => {
        setTab(t)
    }

    useEffect(() => {
        setCollection(data.collection)
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

    const handleCollection = async () => {
        const { msg, code } = !data.collection ? await addMyCollection({ job_id }) : await deleteMyCollection({ job_id })
        if (code !== 200) return requestCodeMessage(code, msg)
        setCollection(!collection)
    }

    const handleStopJob = async () => {
        // 添加用户id
        const { user_id } = initialState?.authList
        const q = user_id ? { user_id } : {}
        const { code, msg } = await updateSuiteCaseOption({ ...q, editor_obj: 'job', job_id, state: 'stop' })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        message.success('操作成功')
        refresh()
        processTableRef.current.refresh()
    }

    const EditNoteBtn: React.FC<any> = (props: any) => {
        return (
            <Button type="link" size="small" onClick={handleOpenEditRemark} style={{ padding: 0, marginLeft: props.note && 10 }} >写备注</Button>
        )
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
    const { height: windowHeight } = useClientSize()
    const isShowStopButton = data && data.state !== 'success' && data.state !== 'fail' && data.state !== 'skip' && data.state !== 'stop'

    return (
        <Spin spinning={loading} className={styles.spin_style}>
            {
                JSON.stringify(data) === '{}' &&
                <NotFound />
            }
            {
                JSON.stringify(data) !== '{}' &&
                <div style={{ background: '#fff', minHeight: windowHeight - 50, overflowX: 'hidden' }}>
                    <div style={{ background: '#F5F5F5', overflowX: 'hidden' }}>
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
                                        <Row style={{ marginBottom: 26 }}>
                                            {<StateTag state={data.state} />}
                                            {data.provider_name && <Tooltip title="机器类型" placement="bottom">
                                                <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>{data.provider_name}</Tag></Tooltip>}
                                            {data.test_type && <Tooltip title="测试类型" placement="bottom">
                                                <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>{data.test_type}</Tag></Tooltip>}
                                            {data.job_type && <Tooltip title="Job类型" placement="bottom">
                                                <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>{data.job_type}</Tag></Tooltip>}
                                        </Row>
                                        <Row className={styles.test_summary_row} >
                                            <RenderDesItem name="创建人" dataIndex={data.creator_name} />
                                            <RenderDesItem name="创建时间" dataIndex={data.gmt_created} />
                                            <RenderDesItem name="完成时间" dataIndex={data.end_time} />
                                        </Row>
                                        <Row className={styles.test_summary_row} >
                                            <RenderDesItem name="所属项目" dataIndex={data.project_name} />
                                            <RenderDesItem name="测试基线" dataIndex={data.baseline_name} />
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
                                            <div style={{ width: 'calc(100% - 74px)', wordBreak: 'break-all' }}>
                                                {access.wsRoleContrl(data.creator) ? data.note : (data.note == null || data.note == '') ? '-' : data.note}
                                                {access.wsRoleContrl(data.creator) ? <EditNoteBtn note={data.note} /> : <></>}
                                            </div>
                                        </Row>
                                    </Col>
                                    <Col span={7} style={{ position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'fix-end', width: '100%' }}>
                                            <Chart test_type={data.test_type} data={data.case_result} plan={(data.plan_instance_name && data.plan_instance_id)}/>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        <RenderMachineItem job_id={job_id} />
                        <div style={{ background: '#fff' }}>
                            <Tabs
                                defaultActiveKey={tab}
                                onTabClick={handleTabClick}
                                className={styles.result_tab_bar}
                                key={key}
                                tabBarExtraContent={
                                    (() => {
                                        // 判断数组中有无数据
                                        const buttonType = data?.report_li?.length ? "default" : "primary"
                                        // 判断是"离线上传"的数据
                                        const buttonDisable = data?.created_from === 'offline'
                                        // 判断是"执行过程tab"
                                        const testProgressTab = tab === 'testProgress' && isShowStopButton
                                        return (
                                            <div style={{ display: 'flex', marginRight: 12 }}>
                                                <ViewReport viewAllReport={allReport} dreType="bottomRight" ws_id={ws_id} jobInfo={data} origin={'jobDetail'} stylesButton={veiwReportHeight.current} />

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
                                        )
                                    })()
                                }
                            >
                                <Tabs.TabPane tab="测试结果" key="testResult">
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
                                <Tabs.TabPane tab="执行过程" key="testProgress" disabled={data.created_from === 'offline'}>
                                    <ProcessTable job_id={job_id} onRef={processTableRef} test_type={data.test_type} provider_name={data.provider_name} />
                                </Tabs.TabPane>
                                <Tabs.TabPane tab="测试配置" key="testConfig">
                                    <TestSettingTable job_id={job_id} jt_id={data.job_type_id} ws_id={ws_id} test_type={data.test_type} />
                                </Tabs.TabPane>
                            </Tabs>
                        </div>
                    </div>
                </div>
            }
            <EditRemarks ref={editRemarkDrawer} onOk={refresh} />
            <ReRunModal ref={rerunModalRef} />
        </Spin>
    )
}
