import React, { useState } from 'react'
import { Button, Space, Row, Input, Typography, Col, Divider, Popover, message } from 'antd'
import { applyWorkspaceMember } from '@/services/Workspace'
import styles from './index.less'
import { useIntl } from 'umi'

export default (props: any) => {
    const { ws_id, onRef, btnText } = props
    const intl = useIntl()
    const [visible, setVisible] = useState(false)
    const [reason, setReason] = useState('')

    React.useImperativeHandle(onRef, () => ({
        show() {
            setVisible(true)
        }
    }))

    const handleSubmit = async () => {
        await applyWorkspaceMember({
            ws_id,
            reason
        })
        message.success(intl.formatMessage({ id: `operation.success` }))
        setVisible(false)
    }

    const handleCancle = async () => {
        setTimeout(() => setVisible(false), 0)
    }

    return (
        <Popover
            destroyTooltipOnHide
            title={intl.formatMessage({ id: `pages.anolis_home.button.apply_join` })}
            trigger="click"
            visible={visible}
            placement={'topRight'}
            overlayClassName={styles.applyInner}
            onVisibleChange={visible => {
                setVisible(visible)
            }}
            content={
                <Row>
                    <Col span={24} style={{ marginBottom: 8 }}>
                        <Space>
                            <Typography.Text>
                                {intl.formatMessage({ id: `application.reason` })}
                            </Typography.Text>
                            <Typography.Text disabled>
                                {intl.formatMessage({ id: `pages.home.join.popover.optional` })}
                            </Typography.Text>
                        </Space>
                    </Col>
                    <Col span={24}>
                        <Input.TextArea
                            value={reason}
                            rows={3}
                            maxLength={200}
                            onChange={evt => setReason(evt.target.value)}
                        />
                    </Col>
                    <Divider style={{ marginTop: 20, marginBottom: 10 }} />
                    <Col span={24}>
                        <Row justify="end">
                            <Space>
                                <Button onClick={() => handleCancle()} >
                                    {intl.formatMessage({ id: `operation.cancel` })}
                                </Button>
                                <Button type="primary" onClick={() => handleSubmit()}>
                                    {intl.formatMessage({ id: `pages.home.popover.btn.submit`, defaultMessage: "提交申请" })}
                                </Button>
                            </Space>
                        </Row>
                    </Col>
                </Row>
            }
        >
            <Button type="primary" style={{ marginRight: 10 }} onClick={() => setVisible(true)}>
                {btnText ?? intl.formatMessage({ id: `pages.anolis_home.button.apply_join` })}
            </Button>
        </Popover>
    )
}