import { requestCodeMessage } from '@/utils/utils'
import { Input, Modal, message, Form,Space,Button } from 'antd'
import React, { useState, useImperativeHandle, forwardRef } from 'react'

import { updateProject } from '../services'

export default forwardRef(
    ( props: any, ref: any,  ) => {
        const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [info, setInfo] = useState<any>({})
        const [padding , setPadding ] = useState( true )
        useImperativeHandle(
            ref,
            () => ({
                show: (item: any) => {
                    setVisible(true)
                    setPadding(true)
                    setInfo(item)
                    form.setFieldsValue(item)
                    // form.setFieldsValue({ 'name': item.name })
                    // form.setFieldsValue({ 'product_version': item.product_version })
                    // form.setFieldsValue({ 'description': item.description })
                }
            })
        )
        const handleCancel = () => {
            setVisible(false)
            
        }
        const handleChange = (e:any) => {
            if(e.target.value){
                setPadding( false )
            }
        }
        const handleOk = async () => {
            form.validateFields()
                .then(async (values) => {
                    values.ws_id = ws_id
                    const { code, msg } = await updateProject({
                        project_id: info.id,
                        ...values
                    })
                    if (code === 200) {
                        props.onOk();
                        setVisible(false)
                    }
                    else {
                        requestCodeMessage( code , msg )
                    }
                })
                .catch(err => setPadding( false ))
        }
        

        return (
            <Modal
                title="编辑项目"
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                //cancelText="取消"
                //okText="更新"
                maskClosable={false}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleCancel}>取消</Button>
                            <Button type="primary" disabled={ padding } onClick={handleOk}>更新</Button>
                        </Space>
                    </div>
                } 
            >
                <Form
                    form={form}
                    layout="vertical"
                    /*hideRequiredMark*/
                    //initialValues={{product_version:'uname -r'}}
                >
                    <Form.Item label="项目名称" name="name"
                        rules={[{
                            required: true,
                            max: 64,
                            pattern: /^[A-Za-z0-9\._-]*$/g,
                            message: '仅允许字母、数字、下划线、中划线、点，最长64个字符',
                        }]}>
                        <Input autoComplete="auto" placeholder="请输入产品名称" onChange={handleChange}/>
                    </Form.Item>
                    <Form.Item label="产品版本" name="product_version" initialValue="uname -r">
                        <Input autoComplete="auto"  onChange={handleChange}/>
                    </Form.Item>
                    <Form.Item label="项目描述（选填）" name="description">
                        <Input.TextArea placeholder="请输入备注信息" rows={4} onChange={handleChange}/>
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
)