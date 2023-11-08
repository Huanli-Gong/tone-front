import React, { useState, useRef } from 'react'
import { Layout, message, Space, Spin, Tooltip } from 'antd'

import styles from './index.less'
import { queryGetToken, updatePutToken } from './services'
import { useClientSize } from '@/utils/hooks'
import _ from 'lodash'
import ModifyPassModal from './ModifyPassModal'
import { useIntl, FormattedMessage } from 'umi'
import { EyeOutlined, EyeInvisibleOutlined, ReloadOutlined } from '@ant-design/icons'

const forFn = () => {
    let str = ''
    for (let i = 0; i < 32; i++) str += '*'
    return str
}

const HIDDEN_TOKEN_STRING = forFn()

const TokenConfig: React.FC<AnyType> = (props: any) => {
    const { formatMessage } = useIntl()

    const [pending, setPending] = useState(false)
    const [loading, setLoading] = React.useState(true)
    const [visible, setVisible] = useState(false)
    const [token, setToken] = useState('')
    const { height: layoutHeight } = useClientSize()

    const init = async () => {
        if (pending) return
        setLoading(true)
        const { data, code } = await queryGetToken()
        setLoading(false)
        if (code !== 200) return
        setToken(data)
    }
    React.useEffect(() => {
        init()
        return () => {
            setVisible(false)
        }
    }, [])

    const handleReset = async () => {
        if (pending) return
        setLoading(true)
        setPending(true)
        const { data, code } = await updatePutToken()
        setLoading(false)
        setPending(false)

        // message.error('重置失败')
        if (code !== 200) {
            message.error({
                content: formatMessage({ id: 'request.reset.failed' }),
            })
        }

        message.success({
            content: formatMessage({ id: 'request.reset.success' }),
        })
        setToken(data)
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
                                <span className={styles.token_label}><FormattedMessage id="person.center.login.password" /> </span>
                                <span className={styles.operate}><FormattedMessage id="Table.columns.operation" /> </span>
                            </div>
                            <div className={styles.second_row}>
                                <span >{HIDDEN_TOKEN_STRING} </span>
                                <Space align="start">
                                    <span className={styles.reset} onClick={modifyPassword}><FormattedMessage id="operation.modify" /></span>
                                </Space>
                            </div>
                        </div>
                    }
                    <div>
                        <div className={styles.first_row}>
                            <span className={styles.token_label}> Token </span>
                            <span className={styles.operate}><FormattedMessage id="Table.columns.operation" /> </span>
                        </div>
                        <div className={styles.second_row}>
                            <span >{visible ? token : HIDDEN_TOKEN_STRING} </span>
                            <Space>
                                <Tooltip
                                    title={<FormattedMessage id={visible ? 'operation.hidden' : "operation.view"} />}
                                    placement='bottom'
                                >
                                    <span onClick={() => setVisible(!visible)} style={{ cursor: 'pointer', color: '#1890ff' }}>
                                        {
                                            visible ?
                                                <EyeInvisibleOutlined /> :
                                                <EyeOutlined />
                                        }
                                    </span>
                                </Tooltip>

                                <Tooltip
                                    title={<FormattedMessage id="operation.reset" />}
                                    placement='bottom'
                                >
                                    <ReloadOutlined
                                        style={{ cursor: 'pointer', color: '#1890ff' }}
                                        onClick={handleReset}
                                    />
                                </Tooltip>
                            </Space>
                        </div>
                    </div>
                </Space>
            </Spin>
            <ModifyPassModal ref={modifyRef} />
        </Layout.Content>
    )
}

export default TokenConfig