import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import { requestModifyPassword } from './services'
import { useModel } from 'umi'
// import ResetModal from '@/pages/SystemConf/UserManagement/components/ResetModal'

const ModifyPassModal: React.ForwardRefRenderFunction<{}, {}> = (props, ref) => {
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
                message.success("修改成功")
            })
    }

    const handleCancel = () => {
        setIntro({})
        setVisible(false)
        form.resetFields()
    }

    return (
        <Modal
            title="修改登录密码"
            visible={visible}
            onCancel={handleCancel}
            okText="确定"
            onOk={handleOk}
            width={'40%'}
        >
            <Form form={form} layout="vertical">
                <Form.Item label="" name="old_password"
                    rules={[
                        {
                            required: true,
                            message: '请输入密码',
                        },
                        {
                            pattern: /^.{6,18}$/,
                            message: '密码长度6-18位'
                        }
                    ]}
                >
                    <Input.Password placeholder="旧密码" />
                </Form.Item>
                <Form.Item label="" name="new_password"
                    rules={[
                        {
                            required: true,
                            message: '请输入密码',
                        },
                        {
                            pattern: /^.{6,18}$/,
                            message: '密码长度6-18位'
                        }
                    ]}
                    hasFeedback
                >
                    <Input.Password placeholder="新密码" />
                </Form.Item>
                <Form.Item label="" name="new_password_repeat"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: '请输入确认密码!',
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value) return Promise.resolve()
                                if (!/^.{6,18}$/.test(value)) return Promise.reject(new Error('密码长度6-18位'))
                                if (!value || getFieldValue('new_password') === value)
                                    return Promise.resolve();
                                return Promise.reject(new Error('确认密码不一致!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="确认密码" />
                </Form.Item>
            </Form>
            {/* <ResetModal ref={resetModalRef} /> */}
        </Modal>
    )
}

export default forwardRef(ModifyPassModal)