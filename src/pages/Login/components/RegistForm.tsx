import React from 'react'
import { Form, Input, Button, message } from 'antd';
import styled from 'styled-components';
import { userRegist } from '../services';

import { history, useLocation, useModel } from 'umi';
import { deepObject } from '@/utils/utils';

const LoginWrapper = styled(Form)`
    width:300px
`

const LoginButton = styled(Button)`
    width:100%;
`

const LoginForm: React.FC = () => {
    const [form] = Form.useForm();
    const { query } = useLocation() as any;
    const { initialState, setInitialState } = useModel('@@initialState');

    const onClick = () => {
        form.validateFields()
            .then(async (values) => {
                const { data, code } = await userRegist(values)
                if (code !== 200) {
                    form.setFields([{
                        name: 'password_repeat',
                        errors: [data]
                    }])
                    return
                }

                setInitialState({
                    ...initialState,
                    authList: {
                        ...deepObject(data)
                    }
                })

                message.success('注册成功')
                history.push(query?.redirect_url || '/')
                form.resetFields()
            })
            .catch(console.log)
    }

    return (
        <LoginWrapper
            form={form}
            layout="vertical"
        >
            <Form.Item label="" name="username"
                rules={[{
                    required: true,
                    validator(rule, val) {
                        // 账号必须字母开头，6-18位字母数字或字符
                        if (!val)
                            return Promise.reject('账号不能为空')
                        if (!/^[a-zA-Z][0-9a-zA-Z]{5,17}$/.test(val))
                            return Promise.reject('账号必须字母开头，6-18位字母数字或字符')
                        return Promise.resolve()
                    }
                }]}
            >
                <Input placeholder="用户名" />
            </Form.Item>
            <Form.Item label="" name="password"
                rules={[
                    {
                        required: true,
                        message: '请输入密码',
                    },
                    {
                        pattern: /^[\dA-Za-z!@#$%^&*?]{6,18}$/,
                        message: '6-18位数字、字母或特殊字符'
                    }
                ]}
                hasFeedback
            >
                <Input.Password placeholder="密码" />
            </Form.Item>
            <Form.Item label="" name="password_repeat"
                dependencies={['password']}
                hasFeedback
                rules={[
                    {
                        required: true,
                        message: '请输入确认密码!',
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value)
                                return Promise.resolve();
                            return Promise.reject(new Error('确认密码不一致!'));
                        },
                    }),
                ]}
            >
                <Input.Password placeholder="确认密码" />
            </Form.Item>
            <Form.Item >
                <LoginButton type="primary" onClick={onClick}>注册</LoginButton>
            </Form.Item>
        </LoginWrapper >
    )
}

export default LoginForm