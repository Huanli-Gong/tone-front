import React, { useState, useImperativeHandle, forwardRef, useMemo } from 'react'

import { Drawer, Space, Button, Form, Input, Select } from 'antd'
import styled from 'styled-components'
import { checkTestServerIps } from '@/pages/WorkSpace/DeviceManage/GroupManage/services'
import { AgentSelect } from '@/components/utils'

const FormWrapper = styled(Form)`
    .ant-form-item{
        margin-bottom: 8px;
    }
`

const TemplateListDrawer = (props: any, ref: any) => {
    const { ws_id, onOk } = props
    const [visible, setVisible] = useState(false)
    const [idx, setIdx] = useState<any>(null)
    const [form] = Form.useForm()
    const [pedding, setPedding] = useState(false)

    useImperativeHandle(ref, () => ({
        show: (_: any, data: any) => {
            setVisible(true)
            setIdx(_)
            if (data) {
                form.setFieldsValue(data)
            }
        }
    }), [])

    const handleClose = () => {
        setVisible(false)
        setPedding(false)
        form.resetFields()
        setIdx(null)
    }

    const handleOk = () => {
        if (pedding) return;
        setPedding(true)
        form
            .validateFields()
            .then(async (values) => {
                await onOk(values, idx)
                handleClose()
            })
            .catch(err => {
                setPedding(false)
            })
    }

    const title = useMemo(() => {
        return typeof idx === 'number' ? '编辑机器' : '添加机器'
    }, [idx])

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title={title}
            visible={visible}
            width="376"
            onClose={handleClose}
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleClose}>取消</Button>
                        <Button type="primary" onClick={handleOk} >确定</Button>
                    </Space>
                </div>
            }
        >
            <FormWrapper
                layout="vertical"
                form={form}
                /*hideRequiredMark*/
                scrollToFirstError
            >
                <Form.Item
                    name="channel_type"
                    label="机器"
                    initialValue={BUILD_APP_ENV ? open_agent : self_agent}
                    rules={[{ required: true, message: '请选择控制通道' }]}
                >
                    <AgentSelect placeholder="请选择机器类型(agent)" />
                </Form.Item>
                <Form.Item
                    name="machine"
                    validateTrigger={'onBlur'}
                    label=""
                    rules={[
                        () => ({
                            async validator(rule, value) {
                                const channelType = form.getFieldValue('channel_type')
                                if (!channelType) {
                                    form.validateFields(['channel_type'])
                                    return
                                }
                                const { data, msg } = await checkTestServerIps({ ws_id, ips: [value], channel_type: channelType })
                                if (data.errors.length === 0)
                                    return Promise.resolve()
                                return Promise.reject(msg.toString())
                            }
                        }),
                    ]}
                >
                    <Input placeholder="请输入机器IP/SN" autoComplete="off" />
                </Form.Item>
                <Form.Item
                    name="script"
                    label="自定义脚本"
                    rules={[{ required: true, message: '自定义脚本不能为空' }]}
                >
                    <Input.TextArea rows={4} placeholder="自定义脚本" />
                </Form.Item>
            </FormWrapper>
        </Drawer>
    )
}

export default forwardRef(TemplateListDrawer)