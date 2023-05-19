import { requestCodeMessage } from '@/utils/utils'
import { Input, Modal, Form, Space, Button, Radio } from 'antd'
import { useState, useImperativeHandle, forwardRef } from 'react'
import { useIntl, FormattedMessage } from 'umi'
import { updateProject } from '../services'

export default forwardRef(
    (props: any, ref: any,) => {
        const { formatMessage } = useIntl()
        const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [info, setInfo] = useState<any>({})
        const [padding, setPadding] = useState(true)
        useImperativeHandle(
            ref,
            () => ({
                show: (item: any) => {
                    setVisible(true)
                    setPadding(true)
                    setInfo(item)
                    form.setFieldsValue(item)
                }
            })
        )
        const handleCancel = () => {
            setVisible(false)

        }
        const handleChange = () => {
            // if(e.target.value || e.target.value === 0 ){
            setPadding(false)
            // }
        }
        const handleOk = async () => {
            form.validateFields()
                .then(async (values) => {
                    values.ws_id = ws_id
                    const { code, msg } = await updateProject({
                        project_id: info.id,
                        ...values
                    })
                    if (code === 200) {
                        props.onOk();
                        props.setVisible(false)
                        setVisible(false)
                    }
                    else {
                        requestCodeMessage(code, msg)
                    }
                })
                .catch(() => setPadding(false))
        }


        return (
            <Modal
                title={<FormattedMessage id="product.edit.project" />}
                open={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                //cancelText="取消"
                //okText="更新"
                maskClosable={false}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleCancel}><FormattedMessage id="operation.cancel" /></Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}><FormattedMessage id="operation.update" /></Button>
                        </Space>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        label={<FormattedMessage id="product.project.name" />}
                        name="name"
                        rules={[{
                            required: true,
                            max: 64,
                            pattern: /^[A-Za-z0-9\._-]*$/g,
                            message: formatMessage({ id: 'product.project.name.message' }),
                        }]}>
                        <Input autoComplete="auto" placeholder={formatMessage({ id: 'product.please.enter.project.name' })}
                            onChange={handleChange} />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="product.version" />}
                        name="product_version"
                        initialValue="uname -r">
                        <Input autoComplete="auto" onChange={handleChange} />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="project.description.option" />}
                        name="description">
                        <Input.TextArea placeholder={formatMessage({ id: 'product.please.enter.comments' })}
                            rows={4} onChange={handleChange} />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="product.dashboard.count" />}
                        name="is_show">
                        <Radio.Group onChange={handleChange}>
                            <Radio value={1}><FormattedMessage id="operation.yes" /></Radio>
                            <Radio value={0}><FormattedMessage id="operation.no" /></Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
)