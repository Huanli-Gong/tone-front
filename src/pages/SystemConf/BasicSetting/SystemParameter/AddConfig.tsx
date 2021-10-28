import { requestCodeMessage } from '@/utils/utils'
import { Drawer, Form, Input, Radio, Space, Button, message } from 'antd'
import React, { useImperativeHandle, forwardRef, useState } from 'react'

import { createCongfig, updateConfig } from '../services'

export default forwardRef(
    ({ onOk }: any, ref: any) => {
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [padding, setPadding] = useState(false)
        const [title, setTitle] = useState('新增配置')
        const [data, setData] = useState<any>({})

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = '新增配置', editValue: any = {}) => {
                    setData(editValue)
                    form.setFieldsValue(editValue)
                    setTitle(title)
                    setVisible(true)
                }
            })
        )

        const handleClose = () => {
            setVisible(false)
            form.resetFields()
        }

        const defaultOption = (code: number, msg: string) => {
            if (code === 200) {
                message.success('操作成功！')
                form.resetFields()
                setVisible(false)
                onOk()
            }
            else {
                requestCodeMessage( code , msg )
            }
        }

        const handleOk = async () => {
            setPadding(true)
            form.validateFields()
                .then(
                    async (values: any) => {
                        if (title === '新增配置') {
                            const { code, msg } = await createCongfig({
                                config_type: 'sys',
                                ...values
                            })
                            defaultOption(code, msg)
                        }
                        else if (title === '编辑配置') {
                            const { code, msg } = await updateConfig({
                                config_type: 'sys',
                                config_id: data.id,
                                ...values
                            })
                            defaultOption(code, msg)
                        }
                        setPadding(false)
                    }
                )
                .catch(
                    err => {
                        console.log(err)
                        setPadding(false)
                    }
                )
        }

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                visible={visible}
                width="376"
                title={title}
                onClose={handleClose}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}>取消</Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}>
                                {
                                    title === '编辑配置' ? '更新' : '确定'
                                }
                            </Button>
                        </Space>
                    </div>
                }
            >
                <Form
                    layout="vertical"
                    form={form}
                    initialValues={{
                        enable: true
                    }}
                >
                    <Form.Item 
                        label="配置名称" 
                        name="config_key" 
                        rules={[{
                            required: true,
                            min: 1,
                            max: 32,
                            pattern: /^[A-Za-z0-9\._-]+$/g,
                            message: '仅允许包含字母、数字、下划线、中划线、点，最长32个字符'
                        }]}
                    >
                        <Input autoComplete="off" placeholder="请输入配置名称" />
                    </Form.Item>
                    <Form.Item label="是否启用" name="enable" >
                        <Radio.Group>
                            <Radio value={true}>启用</Radio>
                            <Radio value={false}>停用</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="配置内容" name="config_value">
                        <Input.TextArea style={{ height: 400 }} placeholder="请输入配置内容" />
                    </Form.Item>
                    <Form.Item label="描述" name="description">
                        <Input.TextArea style={{ height: 110 }} placeholder="请输入描述信息" />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)