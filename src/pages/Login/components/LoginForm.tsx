import React from 'react'
import { Form, Input, Button, message } from 'antd';
import styled from 'styled-components';
import { userLogin } from '../services';
import { history, useLocation, useModel } from 'umi';
import { deepObject } from '@/utils/utils';

const LoginWrapper = styled(Form)`
    width:300px
`

const LoginButton = styled(Button)`
    width:100%;
`

const LoginForm: React.FC = () => {
    const [form] = Form.useForm()
    const { query } = useLocation() as any;
    const { initialState, setInitialState } = useModel('@@initialState')

    const onClick = () => {
        form.validateFields()
            .then(async (values) => {
                const { data, code } = await userLogin(values)
                if (code !== 200) {
                    form.setFields([{
                        name: 'password',
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
                history.push(query?.redirect_url || '/')
                message.success('登陆成功')
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
                rules={[{ required: true, message: '用户名不能为空' }]}
            >
                <Input placeholder="用户名" />
            </Form.Item>
            <Form.Item label="" name="password"
                rules={[{ required: true, message: '密码不能为空' }]}
            >
                <Input.Password placeholder="密码" />
            </Form.Item>
            <Form.Item >
                <LoginButton
                    type="primary"
                    onClick={onClick}
                >
                    登录
                </LoginButton>
            </Form.Item>
        </LoginWrapper>
    )
}

export default LoginForm