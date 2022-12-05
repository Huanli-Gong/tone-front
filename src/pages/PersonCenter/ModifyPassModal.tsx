import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import { requestModifyPassword } from './services'
import { useModel, useIntl, FormattedMessage  } from 'umi'
// import ResetModal from '@/pages/SystemConf/UserManagement/components/ResetModal'

const ModifyPassModal: React.ForwardRefRenderFunction<{}, {}> = (props, ref) => {
    const { formatMessage } = useIntl()
    const [intro, setIntro] = useState<any>({})
    const [visible, setVisible] = useState(false)
    const { initialState, setInitialState } = useModel('@@initialState')

    // const resetModalRef = useRef<{ show: (_: { password: string, username: string }, title?: string) => void }>(null)

    const [form] = Form.useForm()

    useImperativeHandle(ref, () => ({
        show() {
            setVisible(true)
        }
    }))

    const handleOk = () => {
        form.validateFields()
            .then(async (values) => {
                const { data, code, msg } = await requestModifyPassword({ ...values, id: intro })
                if (code !== 200) {
                    form.setFields([{
                        name: 'old_password',
                        errors: [msg ?? data]
                    }])
                    return
                }
                setInitialState({
                    ...initialState,
                    ...data,
                    authList: data.user_info,
                })
                handleCancel()
                message.success(formatMessage({ id: 'request.modify.success'}) )
            })
    }

    const handleCancel = () => {
        setIntro({})
        setVisible(false)
        form.resetFields()
    }

    return (
        <Modal
            title={<FormattedMessage id="change.login.password" />}
            visible={visible}
            onCancel={handleCancel}
            okText={<FormattedMessage id="operation.ok" />}
            onOk={handleOk}
            width={'40%'}
        >
            <Form form={form} layout="vertical">
                <Form.Item label="" name="old_password"
                    rules={[
                        {
                            required: true,
                            message: formatMessage({ id: 'please.input.a.password'}),
                        },
                        {
                            pattern: /^.{6,18}$/,
                            message: formatMessage({ id: 'password.length.limit'}, {min: 6, max: 18} )
                        }
                    ]}
                >
                    <Input.Password placeholder={formatMessage({ id: 'please.input.old_password'})} />
                </Form.Item>
                <Form.Item label="" name="new_password"
                    rules={[
                        {
                            required: true,
                            message: formatMessage({ id: 'please.input.a.password'}),
                        },
                        {
                            pattern: /^.{6,18}$/,
                            message: formatMessage({ id: 'password.length.limit'}, {min: 6, max: 18} )
                        }
                    ]}
                    hasFeedback
                >
                    <Input.Password placeholder={formatMessage({ id: 'please.input.new_password'})} />
                </Form.Item>
                <Form.Item label="" name="new_password_repeat"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: formatMessage({ id: 'please.input.new_password.confirm'}),
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value) return Promise.resolve()
                                if (!/^.{6,18}$/.test(value)) return Promise.reject(new Error( formatMessage({ id: 'password.length.limit'}, {min: 6, max: 18} ) ))
                                if (!value || getFieldValue('new_password') === value)
                                    return Promise.resolve();
                                return Promise.reject(new Error( formatMessage({ id: 'password.is.inconsistent'}) ));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder={formatMessage({ id: 'confirm.password'})} />
                </Form.Item>
            </Form>
            {/* <ResetModal ref={resetModalRef} /> */}
        </Modal>
    )
}

export default forwardRef(ModifyPassModal)