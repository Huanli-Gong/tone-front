import { Drawer, Space, Button, Form, Input, message } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { useIntl, FormattedMessage } from 'umi'
import { createProduct, updateProduct } from '../services'
import styles from './index.less'

export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/ , '$1')
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [ helpName, setHelpName ] = useState(false)
        const [padding , setPadding ] = useState( false )
        const [msg, setMsg] = useState<string>()
        const [title, setTitle] = useState('new') // 新增产品信息

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "new", data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    setMsg(formatMessage({id: 'product.name.message'}) )
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
                message.success(formatMessage({id: 'operation.success'}) )
                handleClose();
            }else if(code === 1368){
                setHelpName(true)
                setMsg(formatMessage({id: 'product.name.existed'}) )
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
                    if (title === 'new') {
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
                title={<FormattedMessage id={title === 'new'? 'product.new.product.info': 'product.edit.product.info'} />}
                width="380"
                onClose={handleClose}
                open={visible}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel"/></Button>
                            <Button type="primary" disabled={ padding } onClick={handleOk}>
                                {title === 'new' ? <FormattedMessage id="operation.ok"/>: <FormattedMessage id="operation.update"/>}</Button>
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
                        label={<FormattedMessage id="product.name"/>}
                        name="name"
                        className={helpName ? styles.product_form : styles.product_helpForm}
                        help={msg}
                        rules={[{
                            required: true,
                            message: formatMessage({ id: 'product.name.message'}),
                            pattern: /^[A-Za-z0-9\._-]{1,32}$/g
                        }]}>
                        <Input placeholder={formatMessage({ id: 'product.please.enter.name'}) } />
                    </Form.Item>
                    <Form.Item 
                        label={<FormattedMessage id="product.version.command"/>}
                        name="command" 
                        className={styles.product_helpForm} 
                        help={<FormattedMessage id="product.version.command.help"/>}>
                        <Input placeholder={formatMessage({ id: 'product.please.enter.version.command'}) } />
                    </Form.Item>
                    <Form.Item label={<FormattedMessage id="product.description.option"/>}
                        name="description">
                        <Input.TextArea placeholder={formatMessage({ id: 'product.please.enter.comments'}) } rows={4}/>
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)