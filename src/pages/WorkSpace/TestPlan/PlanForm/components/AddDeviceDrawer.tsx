import { useState, useImperativeHandle, forwardRef, useMemo } from 'react'
import { useIntl, FormattedMessage } from 'umi'
import { Drawer, Space, Button, Form, Input } from 'antd'
import styled from 'styled-components'
import { checkTestServerIps } from '@/pages/WorkSpace/DeviceManage/GroupManage/services'
import { AgentSelect } from '@/components/utils'

const FormWrapper = styled(Form)`
    .ant-form-item{
        margin-bottom: 8px;
    }
`

const TemplateListDrawer = (props: any, ref: any) => {
    const { formatMessage } = useIntl()
    const { ws_id, onOk } = props
    const [visible, setVisible] = useState(false)
    const [idx, setIdx] = useState<any>(null)
    const [form] = Form.useForm()
    const [pedding, setPedding] = useState(false)

    useImperativeHandle(ref, () => ({
        show: (_: any, data: any) => {
            setVisible(true)
            setIdx(_)
            if (data) {
                form.setFieldsValue(data)
            }
        }
    }))

    const handleClose = () => {
        setVisible(false)
        setPedding(false)
        form.resetFields()
        setIdx(null)
    }

    const handleOk = () => {
        if (pedding) return;
        setPedding(true)
        form
            .validateFields()
            .then(async (values) => {
                await onOk(values, idx)
                handleClose()
            })
            .catch(() => {
                setPedding(false)
            })
    }

    const title = useMemo(() => {
        return typeof idx === 'number' ? <FormattedMessage id="plan.edit.machine" /> : <FormattedMessage id="plan.add.machine" />
    }, [idx])

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title={title}
            visible={visible}
            width="376"
            onClose={handleClose}
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                        <Button type="primary" onClick={handleOk} ><FormattedMessage id="operation.ok" /></Button>
                    </Space>
                </div>
            }
        >
            <FormWrapper
                layout="vertical"
                form={form}
                /*hideRequiredMark*/
                scrollToFirstError
            >
                <Form.Item
                    name="channel_type"
                    label={<FormattedMessage id="plan.channel_type" />}
                    initialValue={BUILD_APP_ENV ? open_agent : self_agent}
                    rules={[{ required: true, message: formatMessage({ id: 'plan.channel_type.message' }) }]}
                >
                    <AgentSelect placeholder={formatMessage({ id: 'plan.channel_type.placeholder' })} />
                </Form.Item>
                <Form.Item
                    name="machine"
                    validateTrigger={'onBlur'}
                    label=""
                    rules={[
                        () => ({
                            async validator(rule, value) {
                                const channelType = form.getFieldValue('channel_type')
                                if (!channelType) {
                                    form.validateFields(['channel_type'])
                                    return
                                }
                                const { data, msg } = await checkTestServerIps({ ws_id, ips: [value], channel_type: channelType })
                                if (data.errors.length === 0)
                                    return Promise.resolve()
                                return Promise.reject(msg.toString())
                            }
                        }),
                    ]}
                >
                    <Input placeholder={`${formatMessage({ id: 'plan.please.enter.IP' })}${!BUILD_APP_ENV ? "/SN" : ""}`} autoComplete="off" />
                </Form.Item>
                <Form.Item
                    name="script"
                    label={<FormattedMessage id="plan.custom.script" />}
                    rules={[{ required: true, message: formatMessage({ id: 'plan.custom.script.cannot.empty' }) }]}
                >
                    <Input.TextArea rows={4} placeholder={formatMessage({ id: 'plan.custom.script' })} />
                </Form.Item>
            </FormWrapper>
        </Drawer>
    )
}

export default forwardRef(TemplateListDrawer)