import React, { useState } from 'react'
import { Button, Space, Row, Input, Typography, Col, Divider, Popover, message } from 'antd'
import { applyWorkspaceMember } from '@/services/Workspace'
import styles from './index.less'
import { useParams } from 'umi'

const JoinPopover = (props: any) => {
    const [reason, setReason] = useState('')

    return (
        <Row>
            <Col span={24} style={{ marginBottom: 8 }}>
                <Space>
                    <Typography.Text>申请理由</Typography.Text>
                    <Typography.Text disabled>(选填)</Typography.Text>
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
                            取消
                        </Button>
                        <Button type="primary" onClick={() => props.handleSubmit(reason)}>提交申请</Button>
                    </Space>
                </Row>
            </Col>
        </Row>
    )
}

export default (props: any) => {
    const { ws_id } = props
    const [visible, setVisible] = useState(false)

    const handleSubmit = async (reason: string) => {
        await applyWorkspaceMember({
            ws_id,
            reason
        })
        message.success('操作成功！')
        setVisible(false)
    }

    return (
        <Popover
            title="申请加入"
            trigger="click"
            visible={visible}
            placement={'topRight'}
            overlayClassName={ styles.applyInner }
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
            <Button type="primary" style={{ marginRight: 10 }}>申请加入</Button>
        </Popover>
    )
}