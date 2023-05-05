import { Drawer, Form, Input, Space, Button, Radio } from 'antd'
import { forwardRef, useState, useImperativeHandle } from 'react'
import { useIntl, FormattedMessage } from 'umi';
import styles from './index.less'

export default forwardRef(
    ({ onOk }: any, ref: any) => {
        const { formatMessage } = useIntl()
        const [form] = Form.useForm()

        const [padding, setPadding] = useState(false)
        const [visible, setVisible] = useState(false)

        useImperativeHandle(
            ref,
            () => ({
                show: () => {
                    setVisible(true)
                },
                hide: () => setVisible(false)
            }),
        )

        const handleClose = () => {
            form.resetFields()
            setVisible(false)
        }

        const handleOk = () => {
            setPadding(true)
            form.validateFields()
                .then(
                    (values: any) => {
                        onOk(values)
                        setPadding(false)
                    }
                )
                .catch((err) => {
                    console.log(err)
                    setPadding(false)
                })
        }

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                title={<FormattedMessage id="ws.test.job.template.drawer.title" />}
                width="380"
                onClose={handleClose}
                visible={visible}
                bodyStyle={{ paddingTop: 12 }}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}><FormattedMessage id="operation.ok" /></Button>
                        </Space>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    className={styles.job_test_form}
                /*hideRequiredMark*/
                >
                    <Form.Item
                        name="template_name"
                        label={<FormattedMessage id="ws.test.job.template_name" />}
                        rules={[{
                            required: true,
                            message: formatMessage({ id: 'ws.test.job.template_name.rules1' }),
                            whitespace: true,
                            type: 'string',
                            pattern: /^[A-Za-z0-9\._-]{1,64}$/g
                        },
                        {
                            type: 'string',
                            min: 1,
                            message: formatMessage({ id: 'ws.test.job.template_name.rules2' }),
                            whitespace: true,
                        }]}
                    >
                        <Input autoComplete="off" placeholder={formatMessage({ id: 'ws.test.job.template_name.rules1' })} />
                    </Form.Item>
                    {/* <Row style={{ fontSize : 12 , color : 'rgba(0,0,0,0.45)' }}>命名规则：</Row> */}
                    <Form.Item
                        label={<FormattedMessage id="ws.test.job.description" />}
                        name="description"
                    >
                        <Input.TextArea placeholder={formatMessage({ id: 'ws.test.job.description.placeholder' })} />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="ws.test.job.enable" />}
                        name="enable"
                        initialValue={true}
                    >
                        <Radio.Group>
                            <Radio value={true}><FormattedMessage id="operation.yes" /></Radio>
                            <Radio value={false}><FormattedMessage id="operation.no" /></Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)