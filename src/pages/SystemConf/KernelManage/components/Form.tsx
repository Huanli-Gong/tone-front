/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useImperativeHandle, useState, forwardRef } from 'react'
import { Drawer, Form, Input, Radio, Space, Button, message, Row, Col } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import { createKernel, updateKernel } from '../services'
import { requestCodeMessage } from '@/utils/utils'

import PackagesFormItem from './PackagesFormItem'
import styled from 'styled-components'

const FormCls = styled(Form)`
    .ant-form-item {
        margin-bottom: 8px;
    }
`

export default forwardRef(
    ({ confirm }: any, ref: any) => {
        const { formatMessage } = useIntl()
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [padding, setPadding] = useState(false)
        const [title, setTitle] = useState('new')

        const [initValue, setInitValue] = useState<any>({})

        useImperativeHandle(
            ref,
            () => ({
                show: (name: string, data?: any) => {
                    setVisible(true)
                    name && setTitle(name)
                    if (data?.id) {
                        setInitValue(data)
                        form.setFieldsValue(data)
                    }
                }
            })
        )

        const handleClose = () => {
            setVisible(false)
            form.resetFields()
            setInitValue({})
        }

        const defaultResult = (code: number, msg: string) => {
            if (code === 200) {
                confirm?.()
                setVisible(false)
                form.resetFields()
                setInitValue({})
                message.success(formatMessage({ id: 'operation.success' }))
            }
            else {
                requestCodeMessage(code, msg)
            }
        }

        const handleSubmit = () => {
            form
                .validateFields()
                .then(
                    async (values: any) => {
                        setPadding(true)
                        if (initValue?.id) {
                            const { code, msg } = await updateKernel({ kernel_id: initValue.id, ...values })
                            defaultResult(code, msg)
                        }
                        else {
                            const { code, msg } = await createKernel(values)
                            defaultResult(code, msg)
                        }
                        setPadding(false)
                    }
                )
        }

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                width={376}
                title={<FormattedMessage id={`kernel.${title}.kernel`} />}
                visible={visible}
                onClose={handleClose}
                forceRender={true}
                destroyOnClose={true}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                            <Button type="primary" disabled={padding} onClick={handleSubmit}>
                                {title.indexOf('new') > -1 ? <FormattedMessage id="operation.ok" /> : <FormattedMessage id="operation.update" />}
                            </Button>
                        </Space>
                    </div>
                }
            >
                <Row>
                    <Col span={23}>
                        <FormCls
                            form={form}
                            layout="vertical"
                        /*hideRequiredMark*/
                        >
                            <Form.Item
                                rules={[{
                                    required: true,
                                    pattern: /^[A-Za-z0-9\._-]{1,64}$/g,
                                    message: formatMessage({ id: 'kernel.version.message' })
                                }]}
                                label={<FormattedMessage id="kernel.version" />}
                                name="version"
                            >
                                <Input autoComplete="off" placeholder={formatMessage({ id: 'please.enter' })} />
                            </Form.Item>
                            <PackagesFormItem />
                            <Form.Item label={<FormattedMessage id="kernel.remarks" />} name="description">
                                <Input.TextArea placeholder={formatMessage({ id: 'please.enter' })} />
                            </Form.Item>
                            <Form.Item initialValue={true} label={<FormattedMessage id="kernel.version.type" />} name="release">
                                <Radio.Group>
                                    <Radio value={true}><FormattedMessage id="kernel.release.version" /></Radio>
                                    <Radio value={false}><FormattedMessage id="kernel.temporary.version" /></Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item initialValue={true} label={<FormattedMessage id="kernel.is_enable" />} name="enable">
                                <Radio.Group>
                                    <Radio value={true}><FormattedMessage id="kernel.enable" /></Radio>
                                    <Radio value={false}><FormattedMessage id="kernel.stop" /></Radio>
                                </Radio.Group>
                            </Form.Item>
                        </FormCls>
                    </Col>
                </Row>
            </Drawer>
        )
    }
)