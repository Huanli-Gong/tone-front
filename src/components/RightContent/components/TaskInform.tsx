import { useState, useEffect } from 'react';
import { Typography, Empty, Spin, message } from 'antd';
import { useModel, FormattedMessage, useLocation } from 'umi';
import { singleTagRead, queryTaskMsg } from '@/services/Workspace'
import styles from './index.less';

const TaskInform: React.FC<AnyType> = (props) => {
    const { tab } = props;
    const { pathname } = useLocation()
    const [taskMsgList, setTaskMsgList] = useState<Array<{}>>([])
    const [loading, setLoading] = useState(false)
    const ws_id = pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
    // 查看全部
    const lookAll = () => {
        const is_ws = pathname.indexOf('/ws/') > -1
        if (is_ws) {
            return window.open(`/ws/${ws_id}/message?task`)
        } else {
            return window.open('/message?task')
        }
    }
    // 全局数据流
    const { increment } = useModel('msg');

    const queryTask = async () => {
        setLoading(true)
        const data = await queryTaskMsg({ is_read: '0', page_num: 1, page_size: 4 })
        setLoading(false)
        if (data.code === 200) {
            setTaskMsgList(data.data)
        } else {
            message.error(data.msg)
        }
    }

    useEffect(() => {
        if (tab === '1') {
            queryTask()
        }
    }, [tab])

    // 点击详情跳转
    const handleJump = async (item: any) => {
        await singleTagRead({ msg_id: item.id })
        increment();
        const obj = JSON.parse(item.content)
        if (item.msg_type === 'machine_broken') {
            window.open(`/ws/${obj.ws_id}/test_result/${obj.impact_job}`)
        } else {
            window.open(`/ws/${obj.ws_id}/test_result/${obj.job_id}`)
        }
    }

    return (
        <Spin spinning={loading}>
            <div className={styles.task_warp}>
                {
                    taskMsgList?.length > 0 ?
                        taskMsgList?.map((item: any, index: number) => {
                            const obj = JSON.parse(item.content)
                            if (item.msg_type === 'job_complete') {
                                return (
                                    <div className={styles.list_content} key={index}>
                                        <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                            <Typography.Text className={styles.list_titles}>
                                                <FormattedMessage id="right.content.job.complete" />
                                            </Typography.Text>
                                            <Typography.Text className={styles.list_main}><span style={{ cursor: 'pointer' }} onClick={() => handleJump(item)}>{obj.job_name}</span></Typography.Text>
                                        </Typography.Text>
                                        <Typography.Text className={styles.list_time}><span>{item.gmt_created}</span></Typography.Text>
                                    </div>
                                )
                            } else if (item.msg_type === 'plan_complete') {
                                return (
                                    <div className={styles.list_content} key={item.id}>
                                        <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                            <Typography.Text className={styles.list_titles}>
                                                <FormattedMessage id="right.content.plan.complete" />
                                            </Typography.Text>
                                            <Typography.Text className={styles.list_main}><span style={{ cursor: 'pointer' }} onClick={() => handleJump(item)}>{obj.job_name}</span></Typography.Text>
                                        </Typography.Text>
                                        <Typography.Text className={styles.list_time}><span>{item.gmt_created}</span></Typography.Text>
                                    </div>
                                )
                            } else if (item.msg_type === 'machine_broken') {
                                return (
                                    <div className={styles.list_content} key={item.id}>
                                        <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                            <Typography.Text className={styles.list_titles}>
                                                <FormattedMessage id="right.content.machine.broken" />
                                            </Typography.Text>
                                            <Typography.Text className={styles.list_main}>
                                                <span style={{ cursor: 'pointer', color: '#E53333' }} onClick={() => handleJump(item)}>{obj.sn}/{obj.ip}</span>
                                                <span><FormattedMessage id="right.content.broken.span1" /></span>
                                                <span style={{ color: '#E53333' }}><FormattedMessage id="right.content.broken.span2" /></span>
                                                <span><FormattedMessage id="right.content.broken.span3" /></span>
                                                <span>{obj.impact_job}</span>
                                                <span><FormattedMessage id="right.content.broken.span4" /></span>
                                                <span>{obj.impact_suite}</span>
                                            </Typography.Text>
                                        </Typography.Text>
                                        <Typography.Text className={styles.list_time}><span>{item.gmt_created}</span></Typography.Text>
                                    </div>
                                )
                            } else {
                                return (
                                    <div className={styles.list_content} key={item.id}>
                                        <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                            <Typography.Text className={styles.list_titles}>
                                                <FormattedMessage id="right.content.system.announcement" />
                                            </Typography.Text>
                                            <Typography.Text className={styles.list_main}>
                                                <FormattedMessage id="right.content.nothing" />
                                            </Typography.Text>
                                        </Typography.Text>
                                        <Typography.Text className={styles.list_time}><span>{item.gmt_created}</span></Typography.Text>
                                    </div>
                                )
                            }
                        })
                        : <div style={{ height: 'auto' }}>
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<FormattedMessage id="right.content.no.notice" />} />
                        </div>
                }
            </div>
            <div className={styles.task_footer} onClick={lookAll}>
                <FormattedMessage id="right.content.view.all" />
            </div>
        </Spin>
    )
}

export default TaskInform