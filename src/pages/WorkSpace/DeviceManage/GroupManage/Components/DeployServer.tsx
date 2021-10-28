import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Drawer, Form, Input, Button, Space } from 'antd'

import { deployClusterServer } from '../services'

const DeployServer = forwardRef(
    (props: any, ref: any) => {
        const { handleOk } = props

        const [ visible , setVisible ] = useState( false )
        const [ sourceId , setSourceId ] = useState<any>( null )

        const [form] = Form.useForm()

        useImperativeHandle( ref , () => ({
            show : ( _ : any ) => {
                setVisible( true )
                setSourceId( _ )
            }
        }))

        const onOk = () => {
            form
                .validateFields()
                .then(
                    async (values: any) => {
                        await deployClusterServer({
                            ...values,
                            server_id: sourceId
                        })
                        handleOk()
                        handleCancel()
                    }
                )
                .catch(
                    err => {
                        console.log(err)
                    }
                )
        }

        const handleCancel = () => {
            setSourceId( null )
            setVisible( false )
            form.resetFields()
        }

        return (
            <Drawer 
                maskClosable={ false }
                keyboard={ false }
                title="部署"
                forceRender={true}
                visible={visible}
                width="376"
                onClose={ handleCancel }
                footer={
                    <div style={{ textAlign: 'right' }} >
                        <Space>
                            <Button onClick={ handleCancel }>取消</Button>
                            <Button type="primary" onClick={onOk}>确定</Button>
                        </Space>
                    </div>
                }
            >
                <Form
                    layout="vertical"
                    /*hideRequiredMark*/
                    form={form}
                >
                    <Form.Item name="deploy_user" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                        <Input autoComplete="off" placeholder="请输入机器用户名" />
                    </Form.Item>
                    <Form.Item name="deploy_pass" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                        <Input.Password autoComplete="off" placeholder="请输入机器密码" visibilityToggle={false} />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)

export default DeployServer