import { Modal, Spin, Form, Input, message } from 'antd'
import { useState, useImperativeHandle, forwardRef } from 'react'
import { useIntl, FormattedMessage } from 'umi'
import ColorPicker from '../../../TagManage/components/ColorPicker';
import { addTag } from '../service'

export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [padding, setPadding] = useState(false)
        const [msg, setMsg] = useState<string>()
        useImperativeHandle(
            ref,
            () => ({
                show: () => {
                    setVisible(true)
                    setMsg(formatMessage({ id: "please.enter.message" }))
                    form.setFieldsValue({ tag_color: 'rgb(255,157,78,1)' })
                }
            }),
        )


        const handleCancel = () => {
            form.resetFields()
            setVisible(false)
            setPadding(false)
        }
        const handleTagName = () => {
            setPadding(false)
        }
        const handleOk = () => {
            if (padding) return
            setPadding(true)
            setMsg(undefined)
            form.validateFields().then(
                async (val: any) => {
                    const { code, msg: $msg } = await addTag({ ws_id: props.ws_id, ...val })
                    if (code === 200) {
                        props.onOk()
                        handleCancel()
                        message.success(formatMessage({ id: 'operation.success' }))
                    } else if (code === 1302) {
                        setMsg(formatMessage({ id: 'ws.result.details.tag_name.already.exists' }))
                    } else {
                        setPadding(false)
                        message.error($msg)
                    }
                })
                .catch(() => {
                    setPadding(false)
                })
        }
        return (
            <Modal
                width={460}
                title={<FormattedMessage id="ws.result.details.new.tag" />}
                visible={visible}
                centered={true}
                onCancel={handleCancel}
                maskClosable={false}
                onOk={handleOk}
                okText={<FormattedMessage id="operation.confirm" />}
                cancelText={<FormattedMessage id="operation.cancel" />}
            >
                <Spin spinning={false}>
                    <Form
                        form={form}
                        layout="vertical"
                    /*hideRequiredMark*/
                    >
                        <Form.Item
                            name="tag_color"
                            label={<FormattedMessage id="ws.result.details.tag_color" />}
                        >
                            <ColorPicker />
                        </Form.Item>
                        <Form.Item
                            name="name"
                            label={<FormattedMessage id="ws.result.details.tag_name" />}
                            help={msg}
                            rules={
                                [{
                                    required: true,
                                    max: 32,
                                    message: formatMessage({ id: "please.enter.message" }),
                                    pattern: /^[A-Za-z0-9\._-]*$/g
                                }]
                            }
                        >
                            <Input onFocus={handleTagName} />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label={<FormattedMessage id="ws.result.details.test_summary" />}
                        >
                            <Input.TextArea rows={4} placeholder={formatMessage({ id: "ws.result.details.please.enter.remarks" })} />
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        )
    }
)