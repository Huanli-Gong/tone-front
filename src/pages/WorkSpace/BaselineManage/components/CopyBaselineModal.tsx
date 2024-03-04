import { Drawer, Form, Input, Space, Button } from 'antd'
import React from 'react'
import { useIntl, FormattedMessage } from 'umi'
import { postBaselineCopy } from '../services'
import { randomStrings } from '@/utils/utils';

const CopyBaselineModal: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { onOk } = props
    const { formatMessage } = useIntl()

    const [open, setOpen] = React.useState(false)
    const [source, setSource] = React.useState<any>()
    const [fetching, setFetching] = React.useState<boolean>(false)

    const [form] = Form.useForm()

    React.useImperativeHandle(ref, () => ({
        show(row: any) {
            const { name: baseline_name } = row
            setSource(row)
            form.setFieldValue('baseline_name', `${baseline_name}-${randomStrings()}`)
            setOpen(true)
        }
    }))

    const handleCancel = () => {
        setSource(undefined)
        setOpen(false)
        form.resetFields()
        setFetching(false)
    }

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            const { baseline_name } = values
            if (fetching) return
            if (!baseline_name) return form.setFields([{ name: 'baseline_name', errors: [formatMessage({ id: 'baseline.modal.baseline_name.empty' })] }])
            setFetching(true)
            const { id: baseline_id } = source

            const { code, msg } = await postBaselineCopy({ baseline_name, baseline_id })
            setFetching(false)
            if (code !== 200) {
                console.log(msg)
                form.setFields([{ name: 'baseline_name', errors: [msg] }])
                return
            }
            handleCancel()
            onOk?.()
        })
    }

    return (
        <Drawer
            title={formatMessage({ id: 'baseline.modal.copy.title' })}
            open={open}
            onClose={handleCancel}
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleCancel}><FormattedMessage id="operation.cancel" /></Button>
                        <Button type="primary" disabled={fetching} onClick={handleOk}>
                            <FormattedMessage id="operation.ok" />
                        </Button>
                    </Space>
                </div>
            }
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    name={'baseline_name'}
                    label={formatMessage({ id: 'baseline.baseline_name' })}
                    rules={[
                        {
                            required: true,
                            message: formatMessage({ id: 'baseline.modal.baseline_name.empty' }),
                        },
                        {
                            validator(rule, value, callback) {
                                if (value) {
                                    if (value.length > 100)
                                        return Promise.reject(formatMessage({ id: 'pages.workspace.baseline.addScript.label.validator' }))
                                }
                                return Promise.resolve()
                            },
                        }
                    ]}
                >
                    <Input.TextArea
                        autoSize={{ minRows: 1 }}
                        autoComplete="off"
                        placeholder={formatMessage({ id: 'pages.workspace.baseline.addScript.label.name.placeholder' })}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default React.forwardRef(CopyBaselineModal)