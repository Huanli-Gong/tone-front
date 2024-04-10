/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { Tag, Popover, Spin } from 'antd';
import { queryFailReason } from '../service'
import styles from './index.less'

const FailReasonPopover = ({ text, placement = 'left' }: any) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [info, setInfo] = useState<any>([])
    const getData = async(params: string)=> {
        setLoading(true)
        const res = await queryFailReason({ problem: params}).catch(()=> setLoading(false))
        setLoading(false)
        if (res.code === 200) {
            setInfo(res.data)
        }
    }

    useEffect(()=> {
        if (text) getData(text)
    }, [text])

    const style = { maxWidth: 400 }
    return (
        <Spin spinning={loading}>
            <Popover
                content={
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
                }
                // visible
                placement={placement}
                overlayClassName={styles.popover_warp}
                overlayStyle={{ wordBreak: 'break-all' }}
            >
                <div className={styles.text_warp}>{text}</div>
            </Popover>
        </Spin>

    )
}

export default FailReasonPopover