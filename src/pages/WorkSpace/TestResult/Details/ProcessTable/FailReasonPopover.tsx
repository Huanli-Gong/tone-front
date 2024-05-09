/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { Tag, Popover, Spin } from 'antd';
import { queryFailReason } from '../service'
import styles from './index.less'

const FailReasonPopover = ({ text, placement = 'left' }: any) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [info, setInfo] = useState<any>([])
    const [visible, setVisible] = useState(false)
    const getData = async($visible: boolean)=> {
        if ($visible && text && !info.length) {
            setLoading(true)
            const res = await queryFailReason({ problem: text, limit: 1 }).catch(()=> setLoading(false))
            setLoading(false)
            setVisible($visible)
            if (res.code === 200) {
                setInfo(res.data)
            }
        }
        setVisible($visible)
    }

    useEffect(()=> {
        return ()=> {
            setInfo([])
        }
    }, [text])

    const style: any = { maxWidth: 400, wordBreak: 'break-word' }
    return (
        <Popover
            content={text ?
                <Spin spinning={loading}>
                    <div className={styles.answers_warp}>
                        <h3 style={style}>{text}</h3>
                        {info[0]?.answers?.map((item: any, i: string)=> {
                            return (
                                <div key={item.answer_id} style={style}>
                                    <div className={styles.process_fail_reason}><Tag color="processing">{`原因${i+1}`}</Tag>
                                        {item.reason}</div>
                                    <div className={styles.process_fail_answer} dangerouslySetInnerHTML={{ __html: item.answer }}></div>
                                </div>
                            )
                        })}
                    </div>
                </Spin>
                : null
            }
            open={visible}
            destroyTooltipOnHide
            placement={placement}
            overlayClassName={styles.popover_warp}
            overlayStyle={{ wordBreak: 'break-all' }}
            onOpenChange={getData}
        >
            <div className={styles.text_warp} style={{ cursor: loading ? 'progress' : 'default' }}
            >{text}</div>
        </Popover>
    )
}

export default FailReasonPopover