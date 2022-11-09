import React, { useState } from 'react'
import { Button, Space, Row, Input, Typography, Col, Divider, Popover, message } from 'antd'

import { reApprove } from './services'
import { history, useIntl, FormattedMessage } from 'umi'
const JoinPopover = (props: any) => {
    const { formatMessage } = useIntl()
    const [reason, setReason] = useState('')
    return (
        <Row>
            <Col span={24} style={{ marginBottom: 8 }}>
                <Space>
                    <Typography.Text>{props.resonText}</Typography.Text>
                    <Typography.Text disabled><FormattedMessage id="pages.home.join.popover.optional" /></Typography.Text>
                </Space>
            </Col>
            <Col span={24}>
                <Input.TextArea
                    value={reason}
                    rows={3}
                    maxLength={200}
                    placeholder={props.action === 'join' ? formatMessage({id: 'enter.apply.to.join.reason'}) : formatMessage({id: 'enter.log.off.reason'}) }
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
                                    props.handleCancel()
                                }
                            }
                        >
                            <FormattedMessage id="pages.home.popover.btn.cancel" />
                        </Button>
                        <Button type="primary" onClick={() => props.handleSubmit(reason,setReason)}>
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
    const disabled = props.wsInfo.is_disabled
    const [visible, setVisible] = useState(false)
    const [padding, setPadding] = useState(disabled)

    const getText = (action:string) => {
        if(action === 'delete') {
            return { title: formatMessage({id: 'operation.log.off'}), resonText: formatMessage({id: 'log.off.reason'}) }
        }
        return { title: formatMessage({id: 'apply.to.join'}), resonText: formatMessage({id: 'apply.to.join.reason'}) }
    }
    
    const handleSubmit = async (reason: string,setReason:any) => {
        setPadding(true)
        await reApprove({
            id: props.wsInfo.id,
            reason
        })
        message.success(formatMessage({id: 'operation.success'}) )
        props.handleTabClick('approve')
        setVisible(false)
        setPadding(false)
        setReason('')
        
    }
    const handleClick = (e:any) => {
        e.stopPropagation();
        if(props.wsInfo.action === 'create') {
            window.sessionStorage.setItem('create_ws_info', JSON.stringify(props.wsInfo))
            history.push('/workspace/create')
        } else {
            if(disabled) return
            setVisible(true)
        }
    }
    if(disabled) {
        return <Button disabled={padding}><FormattedMessage id="approve.again" /></Button>
    }
    return (
        <Popover
            title={getText(props.wsInfo.action).title}
            trigger="click"
            visible={visible}
            placement='topLeft'
            onVisibleChange={visible => setVisible(visible)}
            content={
                <JoinPopover
                    handleCancel={
                        () => setVisible(false)
                    }
                    handleSubmit={handleSubmit}
                    action={props.wsInfo.action}
                    resonText={getText(props.wsInfo.action).resonText}
                />
            }
        >
            <Button disabled={padding} onClick={handleClick}><FormattedMessage id="approve.again" /></Button>
        </Popover>
    )
}