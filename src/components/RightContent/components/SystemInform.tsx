import React,{ useState } from 'react';
import { Empty, Typography, Spin, Tooltip, message } from 'antd';
import { useModel } from 'umi';
import { singleSystemRead, queryApplyMsg } from '@/services/Workspace'
import { handleRole } from '@/components/Role/index.js';
import { handleTypeWait,handleTypePassed,handleTypeRefused,jumpPage } from './index.js'
import styles from './index.less';
import { useEffect } from 'react';
const SystemInform = ( props:any ) => {
    const { pathname } = location
    const { tab } = props;
    const ws_id = pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
    const [sysMsgList, setSysMsgList] = useState<Array<{}>>([])
    const [loading, setLoading] = useState(false)

    const { increment } = useModel('msg', (ret) => ({
        increment: ret.increment,
    }));

    const querySysMsg = async () => {
        setLoading(true)
        const data = await queryApplyMsg({ is_read: '0', page_num: 1, page_size: 4 })
        if (data.code === 200) {
            setSysMsgList(data.data)
            setLoading(false)
        } else {
            message.error(data.msg)
        }
    }  

    useEffect(()=>{
        if( tab == '2'){
            querySysMsg()
        }
    },[tab])

    const lookAll = () => {
        const is_ws = pathname.indexOf('/ws/') > -1
        if(is_ws) window.open(`/ws/${ws_id}/message?sys`)
        window.open('/message?sys')
    }
    
    const jumpRoute = async(item: any) => {
        const data = await singleSystemRead({ msg_id: item.id })
        if (data.code === 200) {
            querySysMsg()
            increment()
        }
        const obj = JSON.parse(item.content)
        let name = obj.status
        let action = obj.action
        let ws_id = obj.ws_info === undefined ? '' : obj.ws_info.ws_id
        jumpPage(name,action,ws_id)
    }

    const handleMsgType = (item: any) => {
        const obj = JSON.parse(item.content)
        if (obj.status === 'waiting') {
            return (
                <div onClick={() => jumpRoute(item)}>
                    <Typography.Text ellipsis={true}>
                        <Typography.Text className={styles.list_user} >{obj.operator_info.user_name}</Typography.Text>
                        <Typography.Text className={styles.list_title}>申请{handleTypeWait(obj.action)}Workspace</Typography.Text>
                        <Typography.Text className={styles.list_ws_name} style={{ cursor:'pointer' }}>{obj.ws_info.ws_show_name}</Typography.Text>
                    </Typography.Text>
                </div>
            )
        } else if (obj.status === 'passed') {
            return (
                <div onClick={() => jumpRoute(item)}>
                    <Typography.Text ellipsis={true}>
                        <Typography.Text className={styles.list_user} >{obj.operator_info.user_name}</Typography.Text>
                        <Typography.Text className={styles.list_title}>{obj.action === 'join' ? '通过你加入' : '通过'}</Typography.Text>
                        <Typography.Text className={styles.list_ws_name} style={{ cursor:'pointer' }}>{obj.ws_info.ws_show_name}</Typography.Text>
                        <Tooltip placement="topLeft" title={handleTypePassed(obj.action)}>
                            <Typography.Text className={styles.list_title}>{handleTypePassed(obj.action)}</Typography.Text>
                        </Tooltip>
                    </Typography.Text>
                </div>
            )
        } else if (obj.status === 'refused') {
            return (
                <div onClick={() => jumpRoute(item)}>
                    <Typography.Text ellipsis={true}>
                        <Typography.Text className={styles.list_user} >{obj.operator_info.user_name}</Typography.Text>
                        <Typography.Text className={styles.list_title}>{obj.action === 'join' ? '拒绝你加入' : '拒绝'}</Typography.Text>
                        <Tooltip placement="topLeft" title={obj.ws_info.ws_show_name}>
                            <Typography.Text className={styles.list_title}>{obj.ws_info.ws_show_name}</Typography.Text>
                        </Tooltip>
                        <Tooltip placement="topLeft" title={handleTypeRefused(obj.action)}>
                            <Typography.Text className={styles.list_title}>{handleTypeRefused(obj.action)}</Typography.Text>
                        </Tooltip>
                    </Typography.Text>
                </div>
            )
        } else {
            if (obj.action === 'set_ws_role') {
                return (
                    <div onClick={() => jumpRoute(item)}>
                        <Typography.Text ellipsis={true}>
                            <Typography.Text className={styles.list_user} >{obj.operator_info.user_name}</Typography.Text>
                            <Typography.Text className={styles.list_title}>
                                {obj.operator_info.action === 'add' ? '把你添加为' : '把你设置为'}
                            </Typography.Text>
                            <Typography.Text className={styles.list_ws_name} style={{ cursor:'pointer' }}>{obj.ws_info.ws_show_name}</Typography.Text>
                            <Typography.Text className={styles.list_title} >{handleRole(obj.role_title)}</Typography.Text>
                        </Typography.Text>
                    </div>
                )
            } else if (obj.action === 'set_sys_role') {
                return (
                    <div onClick={() => jumpRoute(item)}>
                        <Typography.Text ellipsis={true}>
                            <Typography.Text className={styles.list_user} >{obj.operator_info.user_name}</Typography.Text>
                            <Typography.Text className={styles.list_title}>把你添加为T-One{handleRole(obj.role_title)}</Typography.Text>
                        </Typography.Text>
                    </div>
                )
            } else if (obj.action === 'remove') {
                return (
                    <div onClick={() => jumpRoute(item)}>
                        <Typography.Text ellipsis={true}>
                            <Typography.Text className={styles.list_user} >{obj.operator_info.user_name}</Typography.Text>
                            <Typography.Text className={styles.list_title}>把你移除</Typography.Text>
                            <Typography.Text className={styles.list_title}>{obj.ws_info.ws_show_name}</Typography.Text>
                        </Typography.Text>
                    </div>
                )
            } else {
                return (
                    <div onClick={() => jumpRoute(item)}>
                        <Typography.Text ellipsis={true}>
                            <Typography.Text className={styles.list_user} >{obj.operator_info.user_name}</Typography.Text>
                            <Typography.Text className={styles.list_title}>把</Typography.Text>
                            <Typography.Text className={styles.list_ws_name} style={{ cursor:'pointer' }}>{obj.ws_info.ws_show_name}</Typography.Text>
                            <Typography.Text className={styles.list_title}>owner转让给你</Typography.Text>
                        </Typography.Text>
                    </div>
                )
            }
        }
    }
    return (
        <Spin spinning={loading}>
            <div className={styles.task_warp}>
                {
                    sysMsgList?.length > 0 
                    ? sysMsgList.map((item: any,index:number) => {
                        return (
                            <div className={styles.list_content} key={index}>
                                <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                    <Typography.Text>{handleMsgType(item)}</Typography.Text>
                                </Typography.Text>
                                <Typography.Text className={styles.list_time}><span>{item.gmt_created}</span></Typography.Text>
                            </div>
                        )
                    })
                    : <div style={{ height:'auto' }}>
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
        //     renderItem={( item:any ) => {
        //         return(
        //             <div className={styles.list_warps}>
        //                 <List.Item>
        //                     <List.Item.Meta
        //                         title={ handleMsgType( item ) }
        //                         description={<Typography.Text className={styles.list_desc}>{item.gmt_created}</Typography.Text>}
        //                     />
        //                 </List.Item>
        //             </div>
        //     )}}
        // />
    )
}
export default SystemInform;