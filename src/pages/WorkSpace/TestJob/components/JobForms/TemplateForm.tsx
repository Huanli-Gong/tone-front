/* eslint-disable react-hooks/exhaustive-deps */
import { forwardRef, useImperativeHandle, useEffect } from 'react'
import { Form, Input, Radio } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import styles from './index.less'

export default forwardRef(({ disabled, template, onEnabelChange }: any, ref: any) => {
    const { formatMessage } = useIntl()
    const [form] = Form.useForm()

    useImperativeHandle(ref, () => ({
        form,
        reset: form.resetFields,
        setVal: (data: any) => {
            form.setFieldsValue(data)
        }
    }))

    useEffect(() => {
        if (JSON.stringify(template) !== '{}') {
            const { template_name, description, enable } = template
            form.setFieldsValue({ template_name, description, enable })
        }
    }, [template])

    return (
        <Form
            colon={false}
            layout="horizontal"
            size="small"
            /*hideRequiredMark*/
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 14 }}
            style={{ width: '100%' }}
            name="basic"
            form={form}
            className={styles.job_test_form}
            initialValues={{ enable: true }}
        >
            <Form.Item
                label={<FormattedMessage id="ws.test.job.template.name" />}
                name="template_name"
                rules={[{
                    required: true,
                    pattern: /^[A-Za-z0-9\._-]{1,64}$/g,
                    message: formatMessage({ id: 'ws.test.job.template.message' }),
                }]}
            >
                <Input autoComplete="off" disabled={disabled}
                    placeholder={formatMessage({ id: 'ws.test.job.template.message' })} />
            </Form.Item>
            <Form.Item
                label={<FormattedMessage id="ws.test.job.description" />}
                name="description">
                <Input.TextArea rows={2} disabled={disabled} autoComplete="off"
                    placeholder={formatMessage({ id: 'ws.test.job.description.placeholder' })} />
            </Form.Item>
            <Form.Item
                label={<FormattedMessage id="ws.test.job.enable" />}
                name="enable">
                <Radio.Group disabled={disabled} onChange={({ target }) => onEnabelChange(target.value)}>
                    <Radio value={true}><FormattedMessage id="operation.yes" /></Radio>
                    <Radio value={false}><FormattedMessage id="operation.no" /></Radio>
                </Radio.Group>
            </Form.Item>
        </Form>
    )
})