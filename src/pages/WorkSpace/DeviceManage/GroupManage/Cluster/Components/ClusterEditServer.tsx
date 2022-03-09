import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Drawer, Space, Button, Form, Input, Select, Radio, Badge } from 'antd'

import { updateClusterServer } from '../../services'
import { useParams } from 'umi'
import { requestCodeMessage } from '@/utils/utils'
import { AgentSelect } from '@/components/utils'


const EditServerDrawer = (props: any, ref: any) => {
    const { handleOk } = props
    const { ws_id }: any = useParams()

    const [form] = Form.useForm()
    const [padding, setPadding] = useState(false)
    const [source, setSource] = useState<any>(null)
    const [visible, setVisible] = useState(false)

    useImperativeHandle(ref, () => ({
        show(_: any) {
            setVisible(true)
            if (_) {
                setSource(_)
                let params = _
                params = Object.assign(_.test_server, params)
                form.setFieldsValue(params)
            }
        }
    }))

    const hanldeClose = () => {
        setVisible(false)
        setSource(null)
        form.resetFields()
    }

    const onSubmit = () => {
        setPadding(true)
        form
            .validateFields()
            .then(
                async (values) => {
                    const data = await updateClusterServer(source.id, { ...values, ws_id })
                    if (data.code === 200) {
                        handleOk()
                        hanldeClose()
                    }
                    else
                        requestCodeMessage(data.code, data.msg)
                    setPadding(false)
                }
            )
            .catch(
                (err: any) => {
                    setPadding(false)
                }
            )
    }

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title="编辑机器"
            forceRender={true}
            visible={visible}
            width="376"
            destroyOnClose={true}
            onClose={hanldeClose}
            footer={
                <div style={{ textAlign: 'right' }} >
                    <Space>
                        <Button onClick={hanldeClose}>取消</Button>
                        <Button type="primary" disabled={padding} onClick={onSubmit}>更新</Button>
                    </Space>
                </div>
            }
        >
            <Form
                layout="vertical"
                /*hideRequiredMark*/
                form={form}
            >
                <Form.Item name="ip" label="机器">
                    <Input disabled />
                </Form.Item>
                <Form.Item name="private_ip" label="私有IP">
                    <Input autoComplete="off" placeholder="请输入私有IP" />
                </Form.Item>
                <Form.Item name="channel_type" initialValue={'ToneAgent'} label="控制通道" rules={[{ required: true, message: '请选择控制通道' }]} >
                    <AgentSelect disabled={BUILD_APP_ENV}/>
                </Form.Item>
                <Form.Item
                    label="使用状态"
                    name="state"
                    hasFeedback
                    rules={[{ required: true, message: '请选择机器状态!' }]}
                    initialValue={'Available'}
                >
                    <Select placeholder="请选择机器状态" >
                        <Select.Option value="Available"><Badge status="success" />Available</Select.Option>
                        <Select.Option value="Reserved"><Badge status="default" />Reserved</Select.Option>
                    </Select>
                </Form.Item>
                {/* <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                    <Select placeholder="请选择角色">
                        <Select.Option value="local">local</Select.Option>
                        <Select.Option value="remote">remote</Select.Option>
                    </Select>
                </Form.Item> */}
                <Form.Item name="baseline_server" label="是否基线机器">
                    <Radio.Group>
                        <Radio value={true}>是</Radio>
                        <Radio value={false}>否</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item name="kernel_install" label="安装内核">
                    <Radio.Group>
                        <Radio value={true}>是</Radio>
                        <Radio value={false}>否</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item name="var_name" label="运行变量名" rules={[{
                    required: true,
                    // pattern: /^[A-Za-z0-9]+$/g,
                    // message: '仅允许包含字母、数字'
                }]}>
                    <Input autoComplete="off" placeholder="请输入" />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default forwardRef(EditServerDrawer)