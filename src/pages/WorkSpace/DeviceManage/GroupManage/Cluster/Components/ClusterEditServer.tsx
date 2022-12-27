import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Drawer, Space, Button, Form, Input, Select, Radio, Badge } from 'antd'

import { updateClusterServer } from '../../services'
import { useParams, useIntl, FormattedMessage } from 'umi'
import { requestCodeMessage } from '@/utils/utils'
import { AgentSelect } from '@/components/utils'


const EditServerDrawer = (props: any, ref: any) => {
    const { formatMessage } = useIntl()
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
                const { ip, private_ip } = _.test_server
                form.setFieldsValue({ ..._, ip, private_ip })
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
            title={<FormattedMessage id="device.device.edit"/>}
            forceRender={true}
            visible={visible}
            width="376"
            destroyOnClose={true}
            onClose={hanldeClose}
            footer={
                <div style={{ textAlign: 'right' }} >
                    <Space>
                        <Button onClick={hanldeClose}><FormattedMessage id="operation.cancel"/></Button>
                        <Button type="primary" disabled={padding} onClick={onSubmit}>
                            <FormattedMessage id="operation.update"/>
                        </Button>
                    </Space>
                </div>
            }
        >
            <Form
                layout="vertical"
                form={form}
            >
                <Form.Item name="ip" label={<FormattedMessage id="device.machine"/>}>
                    <Input disabled />
                </Form.Item>
                <Form.Item name="private_ip" label={<FormattedMessage id="device.private_ip.ip"/>}>
                    <Input autoComplete="off" placeholder={formatMessage({id: 'device.private_ip.ip.placeholder'}) } />
                </Form.Item>
                <Form.Item name="channel_type" 
                    initialValue={'toneagent'} 
                    label={<FormattedMessage id="device.channel_type"/>}
                    rules={[{ required: true, message: formatMessage({id: 'device.channel_type.message'}) }]}>
                    <AgentSelect disabled={BUILD_APP_ENV}/>
                </Form.Item>
                <Form.Item
                    label={<FormattedMessage id="device.usage.state"/>}
                    name="state"
                    hasFeedback
                    rules={[{ required: true, message: formatMessage({id: 'device.usage.state.message'}) }]}
                    initialValue={'Available'}
                >
                    <Select placeholder={formatMessage({id: 'device.usage.state.message'})}>
                        <Select.Option value="Available"><Badge status="success" text={"Available"}/></Select.Option>
                        <Select.Option value="Reserved"><Badge status="success" text="Reserved"/></Select.Option>
                        <Select.Option value="Unusable"><Badge status="default" text="Unusable"/></Select.Option>
                    </Select>
                </Form.Item>
                {/* <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                    <Select placeholder="请选择角色">
                        <Select.Option value="local">local</Select.Option>
                        <Select.Option value="remote">remote</Select.Option>
                    </Select>
                </Form.Item> */}
                <Form.Item name="baseline_server" label={<FormattedMessage id="device.baseline_server"/>}>
                    <Radio.Group>
                        <Radio value={true}><FormattedMessage id="operation.yes"/></Radio>
                        <Radio value={false}><FormattedMessage id="operation.no"/></Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item name="kernel_install" label={<FormattedMessage id="device.kernel_install"/>}>
                    <Radio.Group>
                        <Radio value={true}><FormattedMessage id="operation.yes"/></Radio>
                        <Radio value={false}><FormattedMessage id="operation.no"/></Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item name="var_name" label={<FormattedMessage id="device.var_name"/>}
                    rules={[{
                        required: true,
                        // pattern: /^[A-Za-z0-9]+$/g,
                        // message: '仅允许包含字母、数字'
                }]}>
                    <Input autoComplete="off" placeholder={formatMessage({id: 'please.enter'})} />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default forwardRef(EditServerDrawer)