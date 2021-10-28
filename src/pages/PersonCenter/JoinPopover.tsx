import React, { useState } from 'react'
import { Button, Space, Row, Input, Typography, Col, Divider, Popover, message } from 'antd'

import { reApprove } from './services'
import { history } from 'umi'
const JoinPopover = (props: any) => {
    const [reason, setReason] = useState('')
    return (
        <Row>
            <Col span={24} style={{ marginBottom: 8 }}>
                <Space>
                    <Typography.Text>{props.resonText}</Typography.Text>
                    <Typography.Text disabled>(选填)</Typography.Text>
                </Space>
            </Col>
            <Col span={24}>
                <Input.TextArea
                    value={reason}
                    rows={3}
                    maxLength={200}
                    placeholder={props.action === 'join' ? '请输入申请理由': '请输入注销理由'}
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
                            取消
                        </Button>
                        <Button type="primary" onClick={() => props.handleSubmit(reason,setReason)}>提交申请</Button>
                    </Space>
                </Row>
            </Col>
        </Row>
    )
}
const getText = (action:string) => {
    if(action === 'delete') {
        return{ title: '注销',resonText: '注销理由'}
    }
    return{ title: '申请加入',resonText: '申请理由'}
}

export default (props: any) => {
    const disabled = props.wsInfo.is_disabled
    const [visible, setVisible] = useState(false)
    const [padding, setPadding] = useState(disabled)
    
    const handleSubmit = async (reason: string,setReason:any) => {
        setPadding(true)
        await reApprove({
            id: props.wsInfo.id,
            reason
        })
        message.success('操作成功！')
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
        return <Button disabled={padding}>再次申请</Button>
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
            <Button disabled={padding} onClick={handleClick} >再次申请</Button>
        </Popover>
    )
}