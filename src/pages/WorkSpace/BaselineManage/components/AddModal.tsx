import { Row, Button, Space, Drawer, Form, Input, message } from "antd";
import React from "react";
import { useIntl, useParams } from "umi";
import { createBaseline, updateBaseline } from '../services'

type IProps = Record<string, any>
type IRefs = Record<string, any>

const AddModal: React.ForwardRefRenderFunction<IProps, IRefs> = (props, ref) => {
    const { title, onOk } = props
    const { ws_id } = useParams() as any
    const intl = useIntl()

    const NAME_EXISTS = intl.formatMessage({ id: 'pages.workspace.baseline.addScript.error.name_exists' })
    const NAME_NULL = intl.formatMessage({ id: 'pages.workspace.baseline.addScript.error.name_null' })

    const [source, setSource] = React.useState<any>()
    const [fetching, setFetching] = React.useState<boolean>(false)
    const [open, setOpen] = React.useState<boolean>(false)

    const [form] = Form.useForm()

    React.useImperativeHandle(ref, () => ({
        show(_: any) {
            setOpen(true)
            if (_) {
                const { name, description } = _
                setSource(_)
                form.setFieldsValue({ name, description })
            }
        }
    }))

    const handleClose = () => {
        setFetching(false)
        setSource(undefined)
        setOpen(false)
        form.resetFields()
    }

    const handleSubmit = () => {
        form.validateFields() // 触发表单验证，返回Promise
            .then(async (values) => {
                const params = { test_type: title, ws_id, ...values }
                setFetching(true)
                const { code, msg } = !source ?
                    await createBaseline({ version: '', ...params }) :
                    await updateBaseline({ baseline_id: source?.id, ...params })
                setFetching(false)

                if (code !== 200) {
                    if (code === 201) {
                        form.setFields([{ name: "name", errors: [NAME_EXISTS] }])
                    }
                    return
                }
                message.success(intl.formatMessage({ id: 'operation.success' }))
                handleClose()
                onOk?.()
            })
            .catch(err => console.log(err))
    }

    return (
        <Drawer
            title={
                intl.formatMessage({
                    id: `baseline.addScript.${source ? "edit" : "add"}`,
                }, {
                    title: intl.formatMessage({
                        id: `baseline.${title}`
                    })
                })
            }
            open={open}
            destroyOnClose
            onClose={handleClose}
            footer={
                <Row justify={"end"}>
                    <Space>
                        <Button
                            onClick={handleClose}
                        >
                            {intl.formatMessage({ id: "operation.cancel" })}
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            disabled={fetching}
                        >
                            {intl.formatMessage({ id: source ? "operation.update" : "operation.ok" })}
                        </Button>
                    </Space>
                </Row>
            }
        >
            <Form
                form={form}
                layout="vertical" // 表单布局 ，垂直
            >
                <Form.Item
                    label={intl.formatMessage({ id: `pages.workspace.baseline.addScript.label.name` })}
                    name="name"
                    rules={[{ required: true, message: NAME_NULL }]}
                >
                    <Input
                        autoComplete="off"
                        placeholder={intl.formatMessage({ id: 'pages.workspace.baseline.addScript.label.name.placeholder' })}
                    />
                </Form.Item>
                <Form.Item
                    label={intl.formatMessage({ id: "pages.workspace.baseline.addScript.label.description" })}
                    name="description"
                >
                    <Input.TextArea
                        autoSize={{
                            minRows: 8,
                            maxRows: 22
                        }}
                        placeholder={
                            intl.formatMessage({ id: 'pages.workspace.baseline.addScript.label.description.placeholder' })
                        }
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default React.forwardRef(AddModal)