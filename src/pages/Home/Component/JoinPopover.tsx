import React, { useState } from 'react'
import { Button, Space, Row, Input, Typography, Col, Divider, Popover, message, Avatar } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import styles from '../index.less'
import { applyWorkspaceMember } from '@/services/Workspace'
import LogoEllipsis from '@/components/LogoEllipsis/index';

const JoinPopover = (props: any) => {
    const { formatMessage } = useIntl()
    const [reason, setReason] = useState('')

    return (
        <Row>
            <Col span={24} style={{ marginBottom: 8 }}>
                <Space>
                    <Typography.Text><FormattedMessage id="pages.home.join.popover.reason" /></Typography.Text>
                    <Typography.Text disabled>
                        <FormattedMessage id="pages.home.join.popover.optional" />
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
                            {/* 取消 */}
                            <FormattedMessage id="pages.home.popover.btn.cancel" />
                        </Button>
                        <Button type="primary" onClick={() => props.handleSubmit(reason)}>
                            {/* 提交申请 */}
                            <FormattedMessage id="pages.home.popover.btn.submit" />
                        </Button>
                    </Space>
                </Row>
            </Col>
        </Row>
    )
}

export default (props: any) => {
    const { formatMessage } = useIntl()
    const [visible, setVisible] = useState(false)
    const [padding, setPadding] = useState(false)

    const handleSubmit = async (reason: string) => {
        setPadding(true)
        await applyWorkspaceMember({
            ws_id: props.id,
            reason
        })
        message.success(formatMessage({id: 'operation.success'}) )
        setVisible(false)
        setPadding(false)
    }
    return (
        <Popover
            title={<FormattedMessage id="pages.home.popover.title" /> }
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
            <Button disabled={padding} onClick={() => setVisible(true)} style={{ display: props.type === 'operate' ? 'inlineBlock' : 'none' }}>
                {/* 加入 */}
                <FormattedMessage id="pages.home.join.popover.btn.join" />
            </Button>
            { props.type === 'show_name' && <div className={styles.showName}>
                <LogoEllipsis props={props} size={32} />
            </div>
            }
        </Popover>
    )
}