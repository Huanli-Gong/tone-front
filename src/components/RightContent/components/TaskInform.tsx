import React, { useState } from 'react';
import { List, Typography, Empty, Spin, message } from 'antd';
import { useModel } from 'umi';
import { singleTagRead, queryTaskMsg } from '@/services/Workspace'
import styles from './index.less';
import { useEffect } from 'react';
const TaskInform = (props: any) => {
    const { tab } = props;
    const { pathname } = location
    const [taskMsgList, setTaskMsgList] = useState<Array<{}>>([])
    const [loading, setLoading] = useState(false)
    const ws_id = pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
    // 查看全部
    const lookAll = () => {
        const is_ws = pathname.indexOf('/ws/') > -1
        if (is_ws) window.open(`/ws/${ws_id}/message?task`)
        window.open('/message?task')
    }
    // 全局数据流
    const { increment } = useModel('msg', (ret) => ({
        increment: ret.increment,
    }));
    const queryTask = async () => {
        setLoading(true)
        const data = await queryTaskMsg({ is_read: '0', page_num: 1, page_size: 4 })
        if (data.code === 200) {
            setTaskMsgList(data.data)
            setLoading(false)
        } else {
            message.error(data.msg)
        }
    }
    useEffect(() => {
        if( tab == '1'){
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
                    taskMsgList?.length > 0
                        ? taskMsgList.map((item: any, index: number) => {
                            const obj = JSON.parse(item.content)
                            if (item.msg_type === 'job_complete') {
                                return (
                                    <div className={styles.list_content} key={index}>
                                        <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                            <Typography.Text className={styles.list_titles}>[Job] 测试完成</Typography.Text>
                                            <Typography.Text className={styles.list_main}><span style={{ cursor: 'pointer' }} onClick={() => handleJump(item)}>{obj.job_name}</span></Typography.Text>
                                        </Typography.Text>
                                        <Typography.Text className={styles.list_time}><span>{item.gmt_created}</span></Typography.Text>
                                    </div>
                                )
                            } else if (item.msg_type === 'plan_complete') {
                                return (
                                    <div className={styles.list_content} key={index}>
                                        <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                            <Typography.Text className={styles.list_titles}>[计划] 测试完成</Typography.Text>
                                            <Typography.Text className={styles.list_main}><span style={{ cursor: 'pointer' }} onClick={() => handleJump(item)}>{obj.job_name}</span></Typography.Text>
                                        </Typography.Text>
                                        <Typography.Text className={styles.list_time}><span>{item.gmt_created}</span></Typography.Text>
                                    </div>
                                )
                            } else if (item.msg_type === 'machine_broken') {
                                return (
                                    <div className={styles.list_content} key={index}>
                                        <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                            <Typography.Text className={styles.list_titles}>[故障] 测试机器故障</Typography.Text>
                                            <Typography.Text className={styles.list_main}>
                                                <span style={{ cursor: 'pointer', color: '#E53333' }} onClick={() => handleJump(item)}>{obj.sn}/{obj.ip}</span>
                                                <span>上的任务在测试准备阶段失败, 机器可能已经</span>
                                                <span style={{ color: '#E53333' }}>故障</span>
                                                <span>，请及时处理 ！影响的Job:</span>
                                                <span>{obj.impact_job}</span>
                                                <span>影响的Suite有:</span>
                                                <span>{obj.impact_suite}</span>
                                            </Typography.Text>
                                        </Typography.Text>
                                        <Typography.Text className={styles.list_time}><span>{item.gmt_created}</span></Typography.Text>
                                    </div>
                                )
                            } else {
                                return (
                                    <div className={styles.list_content} key={index}>
                                        <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                            <Typography.Text className={styles.list_titles}>[公告] 系统公告</Typography.Text>
                                            <Typography.Text className={styles.list_main}>暂无</Typography.Text>
                                        </Typography.Text>
                                        <Typography.Text className={styles.list_time}><span>{item.gmt_created}</span></Typography.Text>
                                    </div>
                                )
                            }
                        })
                        : <div style={{ height: 'auto' }}>
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无通知" />
                        </div>
                }
            </div>
            <div className={styles.task_footer} onClick={lookAll}>
                查看全部
            </div>
        </Spin>

        // <List
        //     footer={<div className={styles.task_footer} onClick={lookAll}>查看全部</div>}
        //     locale={{
        //         emptyText: '暂无数据'
        //     }}
        //     itemLayout="horizontal"
        //     dataSource={data}
        //     renderItem={ ( item:any ) => {
        //         const obj = JSON.parse(item.content)
        //         if(item.msg_type === 'job_complete'){
        //             return (
        //                 <div className={styles.list_warp}>
        //                 <List.Item>
        //                     <List.Item.Meta
        //                         title={
        //                             <Typography.Text ellipsis={true} style={{ width:'98%'}}>
        //                                 <Typography.Text className={styles.list_title}>[Job] 测试完成</Typography.Text>
        //                                 <Typography.Text className={styles.list_user}><span onClick={()=>handleJump(item)}>{obj.job_name}</span></Typography.Text>
        //                             </Typography.Text>
        //                         }
        //                         description={<Typography.Text className={styles.list_desc}>{item.gmt_created}</Typography.Text>}
        //                     />
        //                 </List.Item>
        //             </div>
        //             )
        //         }else if(item.msg_type === 'plan_complete'){
        //             return (
        //                 <div className={styles.list_warp}>
        //                 <List.Item>
        //                     <List.Item.Meta
        //                         title={
        //                             <Typography.Text ellipsis={true} style={{ width:'98%'}}>
        //                                 <Typography.Text className={styles.list_title}>[计划] 测试完成</Typography.Text>
        //                                 <Typography.Text className={styles.list_user}><span onClick={()=>handleJump(item)}>{obj.job_name}</span></Typography.Text>
        //                             </Typography.Text>
        //                         }
        //                         description={<Typography.Text className={styles.list_desc}>{item.gmt_created}</Typography.Text>}
        //                     />
        //                 </List.Item>
        //             </div>
        //             )
        //         }else if(item.msg_type === 'machine_broken'){
        //             return (
        //                 <div className={styles.list_warp}>
        //                 <List.Item>
        //                     <List.Item.Meta
        //                         title={
        //                             <Typography.Text ellipsis={true} style={{ width:'99%'}}>
        //                                 <Typography.Text className={styles.list_title}>[故障] 测试机器故障</Typography.Text>
        //                                 <Typography.Text className={styles.list_user}>
        //                                     <span onClick={()=>handleJump(item)}>{obj.sn}/{obj.ip}</span>
        //                                     <span>上的任务在测试准备阶段失败, 机器可能已经</span>
        //                                     <span>故障</span>
        //                                     <span>，请及时处理 ！影响的Task:</span>
        //                                     <span>{obj.impact_job}</span>
        //                                     <span>影响的Suite有:</span>
        //                                     <span>{obj.impact_suite}</span>
        //                                 </Typography.Text>
        //                             </Typography.Text>
        //                         }
        //                         description={<Typography.Text className={styles.list_desc}>{item.gmt_created}</Typography.Text>}
        //                     />
        //                 </List.Item>
        //             </div>
        //             )
        //         }else{
        //             return (
        //                 <div className={styles.msg_record} key={item.id}>
        //                     <Typography.Title level={5}>[公告] 系统公告</Typography.Title>
        //                     <Typography.Text><span className={styles.msg_time}>{item.gmt_created}</span></Typography.Text>
        //                 </div>
        //             )
        //         }
        //     }}
        // />
    )
}
export default TaskInform;