import { Drawer, Form, Space, Button, Input, Radio } from "antd"
import React from "react"
import { FormattedMessage } from "umi"
import { putFeedback } from "./services"

const AddDrawer: React.ForwardRefRenderFunction<AnyType, AnyType> = (props, ref) => {
    const { onOk } = props

    const [open, setOpen] = React.useState(false)
    const [fetching, setFetching] = React.useState(false)
    const [source, setSource] = React.useState<any>()
    const [form] = Form.useForm()

    React.useImperativeHandle(ref, () => ({
        show(row: any) {
            setOpen(true)
            if (row) {
                setSource(row)
                const { status, ...rest } = row
                form.setFieldsValue({ ...rest, status: status === 'Init' ? 'Ignore' : status })
            }
        }
    }))

    const handleCancel = () => {
        form.resetFields()
        setOpen(false)
        setSource(undefined)
    }

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            if (fetching) return
            setFetching(true)
            const { code, msg } = await putFeedback({ ...values, contents_id: source?.id })
            setFetching(false)
            if (code !== 200) {
                form.setFields([{ name: 'reason', errors: [msg] }])
                return
            }

            onOk?.()
            handleCancel()
        }
        catch (err) {

        }
    }

    return (
        <Drawer
            title="意见反馈"
            open={open}
            maskClosable={false}
            forceRender={true}
            keyboard={false}
            destroyOnClose
            onClose={handleCancel}
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleCancel}><FormattedMessage id="operation.cancel" /></Button>
                        <Button type="primary" disabled={fetching} onClick={handleOk}>
                            {
                                !!source ?
                                    <FormattedMessage id="operation.update" /> :
                                    <FormattedMessage id="operation.ok" />
                            }
                        </Button>
                    </Space>
                </div>
            }
        >
            <Form
                form={form}
                layout='vertical'
                initialValues={{
                    status: 'Ignore',
                }}
            >
                <Form.Item
                    name="contents"
                    label="问题描述"
                >
                    <Input.TextArea
                        autoSize={{ minRows: 1 }}
                    />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="意见状态"
                >
                    <Radio.Group
                        options={[
                            {
                                label: '已处理',
                                value: 'Accept'
                            },
                            {
                                label: '忽略该问题',
                                value: 'Ignore'
                            }
                        ]}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default React.forwardRef(AddDrawer)