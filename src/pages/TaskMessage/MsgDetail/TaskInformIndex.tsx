import React, { useState, useEffect } from 'react';
import { TaskListItem } from './data';
import { Spin, Space, Typography, Badge, Row, Col, Pagination, message, Button } from 'antd'
import MsgEmpty from './Component/index'
import { useModel } from 'umi';
import { queryTaskMsg, allTagRead, singleTagRead } from '@/services/Workspace'
import styles from './index.less';
import { requestCodeMessage } from '@/utils/utils';

const TaskInformIndex: React.FC<TaskListItem> = ({ tab, height: layoutHeight }) => {
    const [taskMsg, setTaskMsg] = useState([])
    const [params, setParams] = useState<any>({ page_num: 1, page_size: 20, is_read: '' })
    const [taskLoading, setTaskLoading] = useState(false)
    const [total, setTotal] = useState<any>([])
    const { msgNum, increment } = useModel('msg', (ret) => ({
        msgNum: ret.msgNum,
        increment: ret.increment,
    }));

    // 获取任务通知消息列表
    const getTaskMsg = async (num: string) => {
        setTaskLoading(true)
        params.is_read = num
        const data = await queryTaskMsg(params)
        if (data.code === 200) {
            setTaskMsg(data.data)
            setTotal(data)
            setTaskLoading(false)
        }
    }
    // 点击详情跳转
    const handleJump = async (item: any) => {
        const data = await singleTagRead({ msg_id: item.id })
        if (data.code === 200) {
            getTaskMsg('1')
            increment()
        }
        const obj = JSON.parse(item.content)
        if (item.msg_type === 'machine_broken') {
            window.open(`/ws/${obj.ws_id}/test_result/${obj.impact_job}`)
        } else {
            window.open(`/ws/${obj.ws_id}/test_result/${obj.job_id}`)
        }
    }
    // 全部已读
    const handleAllRead = async () => {
        const data = await allTagRead()
        if (data.code === 200) {
            //message.success(data.msg)
            getTaskMsg('1')
            increment()
        } else {
            requestCodeMessage(data.code, data.msg)
        }
    }
    // 只看未读
    const handleUnRead = () => {
        getTaskMsg('0')
    }
    useEffect(() => {
        if (tab === '1')
            getTaskMsg('1')
        //increment()
    }, [tab, params])


    return (
        <Spin spinning={taskLoading} >
            {
                taskMsg.length > 0 ?
                    <>
                        <div className={styles.read_father} style={{ height: layoutHeight - 183 }}>
                            <div className={styles.read_warp}>
                                <Space>
                                    <Typography.Text className={styles.msg_text}>一共{msgNum.task_msg_total_num}条通知，其中{msgNum.task_msg_unread_num}条未读</Typography.Text>
                                    <Typography.Text className={styles.msg_read}><Button type="link" onClick={handleAllRead} disabled={msgNum.task_msg_unread_num === 0}>全部已读</Button></Typography.Text>
                                    <Typography.Text className={styles.msg_unread}><Button type="link" onClick={handleUnRead} disabled={msgNum.task_msg_unread_num === 0}>只看未读</Button></Typography.Text>
                                </Space>
                            </div>
                            <div className={styles.read_content}>
                                {
                                    taskMsg.map((item: any, index: number) => {
                                        const obj = JSON.parse(item.content)
                                        if (item.msg_type === 'job_complete') {
                                            return (
                                                <div className={styles.msg_record} key={item.id}>
                                                    <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                                        <Typography.Text><span className={styles.msg_title}>[Job] 测试完成</span><span className={styles.msg_detail} onClick={() => handleJump(item)}>{obj.job_name}</span></Typography.Text>
                                                    </Typography.Text>
                                                    <Typography.Text><span className={styles.msg_time}>{item.gmt_created}</span></Typography.Text>
                                                    <div className={styles.msg_badge}>
                                                        {item.is_read ? '' : <Badge dot />}
                                                    </div>
                                                </div>
                                            )
                                        } else if (item.msg_type === 'plan_complete') {
                                            return (
                                                <div className={styles.msg_record} key={item.id}>
                                                    <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                                        <Typography.Text><span className={styles.msg_title}>[计划] 测试完成</span><span className={styles.msg_detail} onClick={() => handleJump(item)}>{obj.job_name}</span></Typography.Text>
                                                    </Typography.Text>

                                                    <Typography.Text><span className={styles.msg_time}>{item.gmt_created}</span></Typography.Text>
                                                    <div className={styles.msg_badge}>
                                                        {item.is_read ? '' : <Badge dot />}
                                                    </div>
                                                </div>
                                            )
                                        } else if (item.msg_type === 'machine_broken') {
                                            return (
                                                <div className={styles.msg_record} key={item.id} onClick={() => handleJump(item)} >
                                                    <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                                        <Typography.Text><span className={styles.msg_title}>[故障] 测试机器故障</span>
                                                            <span className={styles.msg_detail} style={{ color: '#E53333' }}>{obj.sn}/{obj.ip}</span>
                                                            <span className={styles.msg_default}>上的任务在测试准备阶段失败, 机器可能已经</span>
                                                            <span className={styles.msg_detail} style={{ color: '#E53333' }}>故障</span>
                                                            <span className={styles.msg_default}>，请及时处理 ！影响的Job:</span>
                                                            <span className={styles.msg_detail}>{obj.impact_job}</span>
                                                            <span className={styles.msg_default}>影响的Suite有:</span>
                                                            <span className={styles.msg_detail}>{obj.impact_suite}</span>
                                                        </Typography.Text>
                                                    </Typography.Text>
                                                    <Typography.Text><span className={styles.msg_time}>{item.gmt_created}</span></Typography.Text>
                                                    <div className={styles.msg_badge}>
                                                        {item.is_read ? '' : <Badge dot />}
                                                    </div>
                                                </div>
                                            )
                                        } else {
                                            return (
                                                <div className={styles.msg_record} key={item.id}>
                                                    <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                                        <Typography.Text><span className={styles.msg_title}>[公告] 系统公告</span></Typography.Text>
                                                    </Typography.Text>
                                                    <Typography.Text><span className={styles.msg_time}>{item.gmt_created}</span></Typography.Text>
                                                    <div className={styles.msg_badge}>
                                                        {item.is_read ? '' : <Badge dot />}
                                                    </div>
                                                </div>
                                            )
                                        }
                                    })
                                }
                            </div>
                        </div>
                        <Row style={{ marginTop: 15, height: 35 }}>
                            <Col span={4} style={{ paddingLeft:15 }}>
                                共 {total.total} 条
                            </Col>
                            <Col span={20} style={{ textAlign: 'right' }}>
                                <Pagination showQuickJumper total={total.total}
                                    showSizeChanger
                                    current={total.page_num}
                                    defaultPageSize={20}
                                    defaultCurrent={1}
                                    onChange={
                                        (page_num: number, page_size: any) => {
                                            setParams({
                                                ...params,
                                                page_num,
                                                page_size
                                            })
                                        }
                                    }
                                    onShowSizeChange={
                                        (page_num: number, page_size: any) => {
                                            setParams({
                                                ...params,
                                                page_num,
                                                page_size
                                            })
                                        }
                                    }
                                />
                            </Col>
                        </Row>
                    </>
                    : <MsgEmpty />
            }
        </Spin>
    )
}
export default TaskInformIndex;
