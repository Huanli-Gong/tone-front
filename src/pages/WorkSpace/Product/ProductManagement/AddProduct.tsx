import { Drawer, Space, Button, Form, Input, message } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { createProduct, updateProduct } from '../services'
import styles from './index.less'
export default forwardRef(
    (props: any, ref: any) => {
        const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/ , '$1')
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [ helpName, setHelpName ] = useState(false)
        const [padding , setPadding ] = useState( false )
        const [msg, setMsg] = useState<string>()
        const [title, setTitle] = useState('新增产品信息')
        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "新增产品信息", data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    setMsg('仅允许包含字母、数字、下划线、中划线、点，最长32个字符')
                    form.setFieldsValue(data)
                    form.setFieldsValue({ 'command' : data.command === undefined ? 'uname -r' : data.command})
                }
            })
        )

        const handleClose = () => {
            form.resetFields()
            setPadding( false )
            setVisible(false)
            setMsg(undefined)
        }

        const defaultOption = (code: number, msg: string, title: string ) => {
            if (code === 200) {
                props.onOk(title)
                message.success('操作成功')
                handleClose();
            }else if(code === 1368){
                setHelpName(true)
                setMsg('产品名称已存在')
            }
            else {
                message.error(msg)
            }
            setPadding ( false )
        }

        const handleOk = () => {
            setMsg(undefined)
            setPadding( true )
            form.validateFields()
                .then(async (values) => {
                    if (title === '新增产品信息') {
                        const { code, msg } = await createProduct({ ws_id: ws_id, ...values })
                        defaultOption(code, msg, title)
                    }
                    else {
                        values.ws_id = ws_id
                        const { code, msg } = await updateProduct({ prd_id:props.current.id,...values })
                        defaultOption(code, msg, title)
                    }
                })
                .catch(err => {
                    console.log(err)
                    setPadding( false )
                })
        }
        return (
            <Drawer 
                maskClosable={ false }
                keyboard={ false }
                title={title}
                width="380"
                onClose={handleClose}
                visible={visible}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}>取消</Button>
                            <Button type="primary" disabled={ padding } onClick={handleOk}>{title === '新增产品信息' ? '确定' : '更新'}</Button>
                        </Space>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    /*hideRequiredMark*/
                >
                    <Form.Item 
                        label="产品名称" 
                        name="name"
                        className={helpName ? styles.product_form : styles.product_helpForm}
                        help={msg}
                        rules={[{
                            required: true,
                            max: 32,
                            message: '仅允许包含字母、数字、下划线、中划线、点，最长32个字符',
                            pattern: /^[A-Za-z0-9\._-]*$/g
                        }]}>
                        <Input placeholder="请输入产品名称" />
                    </Form.Item>
                    <Form.Item label="版本命令" name="command" className={styles.product_helpForm} help="此产品的当前测试版本获取命令，默认是：uname -r">
                        <Input placeholder="请输入版本命令" />
                    </Form.Item>
                    <Form.Item label="产品描述(选填)" name="description">
                        <Input.TextArea placeholder="请输入备注信息" rows={4}/>
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)