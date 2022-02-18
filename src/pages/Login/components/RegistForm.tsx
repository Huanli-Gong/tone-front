import React from 'react'
import { Form, Input, Button, message } from 'antd';
import styled from 'styled-components';
import { userRegist } from '../services';

import { history, useLocation, useModel } from 'umi';
import { deepObject } from '@/utils/utils';

const LoginWrapper = styled(Form)`
    width:300px;
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
                setTimeout(() => {
                    history.push(query?.redirect_url || '/')
                }, 100)
                form.resetFields()
            })
            .catch(console.log)
    }

    const customFocus = (field: string) => {
        form.setFields([{ name: field, errors: undefined }])
    }

    return (
        <LoginWrapper
            form={form}
            layout="vertical"
        >
            <Form.Item
                label=""
                name="username"
                validateTrigger={'onBlur'}
                rules={[
                    ({ isFieldsTouched }) => ({
                        validator(rule, val) {
                            // 账号必须字母开头，6-18位字母数字或字符
                            if (!val && isFieldsTouched(['username']))
                                return Promise.reject('账号不能为空')
                            if (!/^[a-zA-Z][0-9a-zA-Z]{5,17}$/.test(val))
                                return Promise.reject('账号必须字母开头，6-18位字母数字，不允许特殊字符')
                            return Promise.resolve()
                        }
                    })
                ]}
            >
                <Input placeholder="用户名" onFocus={() => customFocus('username')} />
            </Form.Item>
            <Form.Item
                label=""
                name="password"
                validateTrigger={'onBlur'}
                rules={[
                    ({ isFieldsTouched }) => ({
                        validator(rule, value) {
                            if (!isFieldsTouched(['password'])) return Promise.resolve()
                            if (!value) return Promise.reject('请输入密码')
                            if (!/^[\dA-Za-z!@#$%^&*?.]{6,18}$/.test(value)) return Promise.reject('6-18位数字、字母或特殊字符')
                            return Promise.resolve()
                        }
                    })
                ]}
            >
                <Input.Password placeholder="密码" onFocus={() => customFocus('password')} />
            </Form.Item>
            <Form.Item
                label=""
                name="password_repeat"
                validateTrigger={'onBlur'}
                dependencies={['password']}
                rules={[
                    ({ getFieldValue, isFieldsTouched }) => ({
                        validator(_, value) {
                            if (!isFieldsTouched(['password_repeat'])) return Promise.resolve()
                            if (getFieldValue('password') !== value)
                                return Promise.reject(new Error('确认密码不一致!'));
                            if (!value && getFieldValue('password') === value)
                                return Promise.resolve();

                            return Promise.resolve()
                        },
                    }),
                ]}
            >
                <Input.Password placeholder="确认密码" onFocus={() => customFocus('password_repeat')} />
            </Form.Item>
            <Form.Item >
                <LoginButton type="primary" onClick={onClick}>注册</LoginButton>
            </Form.Item>
        </LoginWrapper >
    )
}

export default LoginForm