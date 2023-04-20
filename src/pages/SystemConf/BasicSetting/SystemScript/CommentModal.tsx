import { requestCodeMessage } from '@/utils/utils'
import { Input, Modal } from 'antd'
import { useState, useImperativeHandle, forwardRef } from 'react'
import { useIntl, FormattedMessage } from 'umi'

import { updateConfig } from '../services'

export default forwardRef(
    ({ onOk }: any, ref: any) => {
        const { formatMessage } = useIntl()
        const PAGE_DEFAULT_PARAMS = { config_type: 'script' }

        const [visible, setVisible] = useState(false)
        const [padding, setPadding] = useState(false)
        const [common, setCommon] = useState('')

        const [info, setInfo] = useState<any>({})

        useImperativeHandle(
            ref,
            () => ({
                show: (item: any) => {
                    setVisible(true)
                    setInfo(item)
                }
            })
        )

        const handleCancel = () => {
            setVisible(false)
            setCommon('')
            setInfo({})
            setPadding(false)
        }

        const handleOk = async () => {
            if (padding) return
            setPadding(true)
            const { code, msg } = await updateConfig({
                ...PAGE_DEFAULT_PARAMS,
                commit: common,
                config_value: info.config_value,
                config_id: info.id
            })
            if (code === 200) {
                onOk()
                handleCancel()
            }
            else {
                requestCodeMessage(code, msg)
                setPadding(false)
            }
        }

        return (
            <Modal
                title="Comment"
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText={<FormattedMessage id="operation.confirm" />}
                cancelText={<FormattedMessage id="operation.cancel" />}
                maskClosable={false}
            >
                <Input.TextArea
                    placeholder={formatMessage({ id: 'basic.please.enter.comment' })}
                    value={common}
                    rows={4}
                    onChange={({ target }) => setCommon(target.value)}
                />
            </Modal>
        )
    }
)