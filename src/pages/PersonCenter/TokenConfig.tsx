import React, { useState, useRef } from 'react'
import { Layout, message, Space, Spin } from 'antd'

import styles from './index.less'
import { updatePutToken } from './services'
import { useClientSize } from '@/utils/hooks'
import _ from 'lodash'
import ModifyPassModal from './ModifyPassModal'
import { useIntl, FormattedMessage, getLocale } from 'umi'

let flag = true

const forFn = () => {
    let str = ''
    for (let i = 0; i < 32; i++) str += '*'
    return str
}
export default (props: any) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'

    const { tokenData, loading } = props
    const initTokenData = forFn()
    const [tokenValue, setTokenValue] = useState<any>(initTokenData)
    const {height: layoutHeight} = useClientSize()
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
                content: formatMessage({ id: 'request.reset.success' }),
                onClose: () => { flag = true },
                onClick: () => { flag = true },
            })
            setTokenValue(data)
        }
        // message.error('重置失败')
        if (code !== 200) {
            message.error({
                content: formatMessage({ id: 'request.reset.failed' }),
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
                                <span className={styles.token_label}><FormattedMessage id="person.center.login.password"/> </span>
                                <span className={styles.operate}><FormattedMessage id="Table.columns.operation"/> </span>
                            </div>
                            <div className={styles.second_row}>
                                <span >{forFn()} </span>
                                <Space align="start">
                                    <span className={styles.reset} onClick={modifyPassword}><FormattedMessage id="operation.modify"/></span>
                                </Space>
                            </div>
                        </div>
                    }
                    <div>
                        <div className={styles.first_row}>
                            <span className={styles.token_label}> Token </span>
                            <span className={styles.operate}><FormattedMessage id="Table.columns.operation"/> </span>
                        </div>
                        <div className={styles.second_row}>
                            <span >{tokenValue} </span>
                            <div>
                                <span className={styles.show} onClick={handleShow}><FormattedMessage id="operation.view"/></span>
                                <span className={styles.reset} onClick={handleReset}><FormattedMessage id="operation.reset"/></span>
                            </div>
                        </div>
                    </div>
                </Space>
            </Spin>
            <ModifyPassModal ref={modifyRef} />
        </Layout.Content>
    )
}