import { forwardRef, useImperativeHandle, useState } from 'react'
import { Drawer, Form, Input, Button, Space } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import { deployClusterServer } from '../services'

const DeployServer = forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const { handleOk } = props

        const [visible, setVisible] = useState(false)
        const [sourceId, setSourceId] = useState<any>(null)

        const [form] = Form.useForm()

        useImperativeHandle(ref, () => ({
            show: (_: any) => {
                setVisible(true)
                setSourceId(_)
            }
        }))

        const handleCancel = () => {
            setSourceId(null)
            setVisible(false)
            form.resetFields()
        }

        const onOk = () => {
            form
                .validateFields()
                .then(
                    async (values: any) => {
                        await deployClusterServer({
                            ...values,
                            server_id: sourceId
                        })
                        handleOk()
                        handleCancel()
                    }
                )
                .catch(
                    err => {
                        console.log(err)
                    }
                )
        }

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                title={<FormattedMessage id="device.deploy" />}
                forceRender={true}
                open={visible}
                width="376"
                onClose={handleCancel}
                footer={
                    <div style={{ textAlign: 'right' }} >
                        <Space>
                            <Button onClick={handleCancel}><FormattedMessage id="operation.cancel" /></Button>
                            <Button type="primary" onClick={onOk}><FormattedMessage id="operation.ok" /></Button>
                        </Space>
                    </div>
                }
            >
                <Form
                    layout="vertical"
                    /*hideRequiredMark*/
                    form={form}
                >
                    <Form.Item name="deploy_user" label={<FormattedMessage id="device.deploy_user" />}
                        rules={[{ required: true, message: formatMessage({ id: 'device.deploy_user.message' }) }]}>
                        <Input autoComplete="off" placeholder={formatMessage({ id: 'device.deploy_user.placeholder' })} />
                    </Form.Item>
                    <Form.Item name="deploy_pass" label={<FormattedMessage id="device.deploy_pass" />}
                        rules={[{ required: true, message: formatMessage({ id: 'device.deploy_pass.message' }) }]}>
                        <Input.Password autoComplete="off" placeholder={formatMessage({ id: 'device.deploy_pass.placeholder' })}
                            visibilityToggle={false} />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)

export default DeployServer