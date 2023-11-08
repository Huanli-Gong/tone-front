import React, { useState, useEffect } from 'react';
import { Empty, Typography, Spin, message } from 'antd';
import { useModel, FormattedMessage } from 'umi';
import { singleSystemRead, queryApplyMsg } from '@/services/Workspace'
import { handleMsgType, jumpPage, NoticeItem } from './utils'
import styles from './index.less';

const SystemInform = (props: any) => {
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
        setLoading(false)
        if (data.code === 200) {
            setSysMsgList(data.data)
        } else {
            message.error(data.msg)
        }
    }

    useEffect(() => {
        if (tab === '2') {
            querySysMsg()
        }
    }, [tab])

    const lookAll = () => {
        const is_ws = pathname.indexOf('/ws/') > -1
        if (is_ws) {
            return window.open(`/ws/${ws_id}/message?sys`)
        } else {
            return window.open('/message?sys')
        }
    }

    const jumpRoute = async (item: any) => {
        const data = await singleSystemRead({ msg_id: item.id })
        if (data.code === 200) {
            querySysMsg()
            increment()
        }
        const obj = JSON.parse(item.content)
        let name = obj.status
        let action = obj.action
        let ws_id = obj.ws_info === undefined ? '' : obj.ws_info.ws_id
        jumpPage(name, action, ws_id)
    }

    return (
        <Spin spinning={loading}>
            <div className={styles.task_warp}>
                {
                    sysMsgList?.length > 0
                        ? sysMsgList.map((item: any, index: number) => {
                            return (
                                <div className={styles.list_content} key={index}>
                                    <Typography.Text ellipsis={true} style={{ width: '99%' }}>
                                        <Typography.Text>
                                            <NoticeItem item={item} onClick={() => jumpRoute(item)}>
                                                {handleMsgType(item)}
                                            </NoticeItem>
                                        </Typography.Text>
                                    </Typography.Text>
                                    <Typography.Text className={styles.list_time}><span>{item.gmt_created}</span></Typography.Text>
                                </div>
                            )
                        })
                        : <div style={{ height: 'auto' }}>
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<FormattedMessage id="right.content.no.notice" />} />
                        </div>
                }
            </div>
            <div className={styles.task_footer} onClick={lookAll}>
                {/* 查看全部 */}
                <FormattedMessage id="right.content.view.all" />
            </div>
        </Spin>
    )
}
export default SystemInform;