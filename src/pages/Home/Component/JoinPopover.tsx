import React, { useState } from 'react'
import { Button, Space, Row, Input, Typography, Col, Divider, Popover, message, Avatar } from 'antd'
import styles from '../index.less'
import { applyWorkspaceMember } from '@/services/Workspace'
import LogoEllipsis from '@/components/LogoEllipsis/index';
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
    const [visible, setVisible] = useState(false)
    const [padding, setPadding] = useState(false)

    const handleSubmit = async (reason: string) => {
        setPadding(true)
        await applyWorkspaceMember({
            ws_id: props.id,
            reason
        })
        message.success('操作成功！')
        setVisible(false)
        setPadding(false)
    }
    return (
        <Popover
            title="申请加入"
            trigger="click"
            visible={visible}
            placement={props.type === 'show_name' ? 'topLeft' : 'top'}
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
            <Button disabled={padding} onClick={() => setVisible(true)} style={{ display: props.type === 'operate' ? 'inlineBlock' : 'none' }} >加入</Button>
            { props.type === 'show_name' && <div className={styles.showName}>
                <LogoEllipsis props={props} size={32} />
            </div>
            }
        </Popover>
    )
}