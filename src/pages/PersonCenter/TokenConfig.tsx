import React, { useState, useRef } from 'react'
import { Layout, message, Space, Spin } from 'antd'

import styles from './index.less'
import { updatePutToken } from './services'
import { resizeDocumentHeightHook } from '@/utils/hooks'
import _ from 'lodash'
import ModifyPassModal from './ModifyPassModal'

let flag = true

const forFn = () => {
    let str = ''
    for (let i = 0; i < 32; i++) str += '*'
    return str
}
export default (props: any) => {
    const { tokenData, loading } = props
    const initTokenData = forFn()
    const [tokenValue, setTokenValue] = useState<any>(initTokenData)
    const layoutHeight = resizeDocumentHeightHook()
    const tokenDataList = _.isString(tokenData) ? tokenData : ''

    const handleShow = () => {
        if (tokenValue !== initTokenData) return
        setTokenValue(tokenDataList)
    }
    const handleReset = async () => {
        if (!flag) return
        flag = false
        let { data, code } = await updatePutToken()
        if (code === 200) {
            message.success({
                content: '重置成功',
                onClose: () => { flag = true },
                onClick: () => { flag = true },
            })
            setTokenValue(data)
        }
        // message.error('重置失败')
        if (code !== 200) {
            message.error({
                content: '重置失败',
                onClose: () => { flag = true },
                onClick: () => { flag = true },
            })
        }
    }

    const modifyPassword = () => modifyRef.current?.show()
    const modifyRef = useRef<{ show: () => void }>(null)

    return (
        <Layout.Content style={{ height: layoutHeight - 270 - 40 }} className={styles.token_content}>
            <Spin spinning={loading}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    {
                        BUILD_APP_ENV === 'opensource' &&
                        <div>
                            <div className={styles.first_row}>
                                <span className={styles.token_label}> 登录密码 </span>
                                <span className={styles.operate}> 操作 </span>
                            </div>
                            <div className={styles.second_row}>
                                <span >{forFn()} </span>
                                <Space align="end">
                                    <span className={styles.show}>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                    <span className={styles.reset} onClick={modifyPassword}>修改</span>
                                </Space>
                            </div>
                        </div>
                    }
                    <div>
                        <div className={styles.first_row}>
                            <span className={styles.token_label}> Token </span>
                            <span className={styles.operate}> 操作 </span>
                        </div>
                        <div className={styles.second_row}>
                            <span >{tokenValue} </span>
                            <div>
                                <span className={styles.show} onClick={handleShow}>查看</span>
                                <span className={styles.reset} onClick={handleReset}>重置</span>
                            </div>
                        </div>
                    </div>
                </Space>
            </Spin>
            <ModifyPassModal ref={modifyRef} />
        </Layout.Content>
    )
}