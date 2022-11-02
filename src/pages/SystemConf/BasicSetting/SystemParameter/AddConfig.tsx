import { requestCodeMessage } from '@/utils/utils'
import { Drawer, Form, Input, Radio, Space, Button, message } from 'antd'
import React, { useImperativeHandle, forwardRef, useState } from 'react'
import { useIntl, FormattedMessage } from 'umi'
import { createCongfig, updateConfig } from '../services'

export default forwardRef(
    ({ onOk }: any, ref: any) => {
        const { formatMessage } = useIntl()
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [padding, setPadding] = useState(false)
        const [title, setTitle] = useState('new')
        const [data, setData] = useState<any>({})

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = 'new', editValue: any = {}) => {
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
                message.success(formatMessage({id: 'operation.success'}) )
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
                        if (title === 'new') {
                            const { code, msg } = await createCongfig({
                                config_type: 'sys',
                                ...values
                            })
                            defaultOption(code, msg)
                        }
                        else if (title === 'edit') {
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
                title={<FormattedMessage id={`basic.addConfig.${title}`}/> }
                onClose={handleClose}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel"/></Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}>
                                {
                                    title === 'edit' ? <FormattedMessage id="operation.update"/> : <FormattedMessage id="operation.ok"/>
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
                        label={<FormattedMessage id="basic.config_key" />}
                        name="config_key" 
                        rules={[{
                            required: true,
                            min: 1,
                            max: 32,
                            pattern: /^[A-Za-z0-9\._-]+$/g,
                            message: formatMessage({id: 'please.enter.message'})
                        }]}
                    >
                        <Input autoComplete="off" placeholder={formatMessage({id: 'basic.please.enter.config_key'})} />
                    </Form.Item>
                    <Form.Item label={<FormattedMessage id="basic.is_enable" />} name="enable">
                        <Radio.Group>
                            <Radio value={true}><FormattedMessage id="basic.enable" /></Radio>
                            <Radio value={false}><FormattedMessage id="basic.stop" /></Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label={<FormattedMessage id="basic.config_value" />} name="config_value">
                        <Input.TextArea style={{ height: 400 }} placeholder={formatMessage({id: 'basic.please.enter.config_value'})} />
                    </Form.Item>
                    <Form.Item label={<FormattedMessage id="basic.desc" />} name="description">
                        <Input.TextArea style={{ height: 110 }} placeholder={formatMessage({id: 'basic.please.enter.desc'})} />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)