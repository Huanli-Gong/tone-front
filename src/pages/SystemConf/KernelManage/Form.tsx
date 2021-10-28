import React, { useImperativeHandle, useState, forwardRef } from 'react'
import { Drawer, Form, Input, Radio, Space, Button, message } from 'antd'

import { createKernel, updateKernel } from '../services'
import { requestCodeMessage } from '@/utils/utils'

export default forwardRef(
    ({ confirm }: any, ref: any) => {
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [padding, setPadding] = useState(false)
        const [title, setTitle] = useState('新增内核')

        const [initValue, setInitValue] = useState<any>({})

        useImperativeHandle(
            ref,
            () => ({
                show: (name: string, data?: any) => {
                    setVisible(true)
                    name && setTitle(name)
                    if (data?.id) {
                        setInitValue(data)
                        form.setFieldsValue(data)
                    }
                }
            })
        )

        const handleClose = () => {
            setVisible(false)
            form.resetFields()
            setInitValue({})
        }

        const defaultResult = (code: number, msg: string) => {
            if (code === 200) {
                confirm()
                setVisible(false)
                form.resetFields()
                setInitValue({})
                message.success('操作成功!')
            }
            else {
                requestCodeMessage( code , msg )
            }
        }

        const handleSubmit = () => {
            form
                .validateFields()
                .then(
                    async (values: any) => {
                        setPadding(true)
                        if (initValue?.id) {
                            const { code, msg } = await updateKernel({ kernel_id: initValue.id, ...values })
                            defaultResult(code, msg)
                        }
                        else {
                            const { code, msg } = await createKernel(values)
                            defaultResult(code, msg)
                        }
                        setPadding(false)
                    }
                )
        }

        return (
            <Drawer 
                maskClosable={ false }
                keyboard={ false }
                width={376}
                title={title}
                visible={visible}
                onClose={handleClose}
                forceRender={true}
                destroyOnClose={true}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}>取消</Button>
                            <Button type="primary" disabled={padding} onClick={handleSubmit}>
                                {title.indexOf('新增') > -1 ? '确定' : '更新'}
                            </Button>
                        </Space>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    /*hideRequiredMark*/
                >
                    <Form.Item
                        rules={[{
                            required: true,
                            max:64,
                            pattern: /^[A-Za-z0-9\._-]+$/g,
                            message: '仅允许包含字母、数字、下划线、中划线、点，最长64个字符'
                        }]} 
                        label="内核版本" 
                        name="version"
                    >
                        <Input autoComplete="off" placeholder="请输入" />
                    </Form.Item>
                    <Form.Item rules={[{ required: true }]} label="内核包路径" name="kernel_link">
                        <Input autoComplete="off" placeholder="请输入" />
                    </Form.Item>
                    <Form.Item rules={[{ required: true }]} label="devel包路径" name="devel_link">
                        <Input autoComplete="off" placeholder="请输入" />
                    </Form.Item>
                    <Form.Item rules={[{ required: true }]} label="headers包路径" name="headers_link">
                        <Input autoComplete="off" placeholder="请输入" />
                    </Form.Item>
                    <Form.Item label="备注" name="description">
                        <Input.TextArea placeholder="请输入" />
                    </Form.Item>
                    <Form.Item initialValue={true} label="版本类型" name="release">
                        <Radio.Group>
                            <Radio value={true}>发布版本</Radio>
                            <Radio value={false}>临时版本</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item initialValue={true} label="是否启用" name="enable">
                        <Radio.Group>
                            <Radio value={true}>启用</Radio>
                            <Radio value={false}>停用</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)