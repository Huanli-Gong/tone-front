import React, { useState } from 'react'
import { Button, Space, Row, Input, Typography, Col, Divider, Popover, message } from 'antd'
import { applyWorkspaceMember } from '@/services/Workspace'
import styles from './index.less'
import { useIntl } from 'umi'

const JoinPopover = (props: any) => {
    const intl = useIntl()
    const [reason, setReason] = useState('')

    return (
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
                        <Button
                            onClick={
                                () => {
                                    setReason('')
                                    props.handleCancel()
                                }
                            }
                        >
                            {intl.formatMessage({ id: `operation.cancel` })}
                        </Button>
                        <Button type="primary" onClick={() => props.handleSubmit(reason)}>
                            {intl.formatMessage({ id: `pages.home.popover.btn.submit`, defaultMessage: "提交申请" })}
                        </Button>
                    </Space>
                </Row>
            </Col>
        </Row>
    )
}

export default (props: any) => {
    const { ws_id, onRef } = props
    const intl = useIntl()
    const [visible, setVisible] = useState(false)

    React.useImperativeHandle(onRef, () => ({
        show() {
            setVisible(true)
        }
    }))

    const handleSubmit = async (reason: string) => {
        await applyWorkspaceMember({
            ws_id,
            reason
        })
        message.success(intl.formatMessage({ id: `operation.success` }))
        setVisible(false)
    }

    return (
        <Popover
            title={intl.formatMessage({ id: `pages.anolis_home.button.apply_join` })}
            trigger="click"
            visible={visible}
            placement={'topRight'}
            overlayClassName={styles.applyInner}
            onVisibleChange={visible => setVisible(visible)}
            content={
                <JoinPopover
                    handleCancel={
                        () => setVisible(false)
                    }
                    handleSubmit={handleSubmit}
                />
            }
        >
            <Button type="primary" style={{ marginRight: 10 }}>
                {intl.formatMessage({ id: `pages.anolis_home.button.apply_join` })}
            </Button>
        </Popover>
    )
}