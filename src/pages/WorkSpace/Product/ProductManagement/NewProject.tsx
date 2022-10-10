import { Drawer, Space, Typography, Form, Button, message, Input, Tooltip, Radio } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { useIntl, FormattedMessage  } from 'umi'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import styles from './index.less'
import { createProject } from '../services'
export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [padding , setPadding ] = useState( false )
        const [msg, setMsg] = useState<string>()
        const [title, setTitle] = useState('new')
        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "new", data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    form.setFieldsValue(data)
                }
            })
        )

        const handleClose = () => {
            form.resetFields()
            setPadding( false )
            setVisible(false)
            setMsg(undefined)
        }
        
        const defaultOption = (code: number, msg: string) => {
            if (code === 200) {
                props.onOk()
                message.success(formatMessage({id: 'operation.success'}) )
                handleClose();
            }else if(code === 1371){
                setMsg(formatMessage({id: 'project.name.already.exists'}) )
            }
            else {
                message.error(msg)
            }
            setPadding ( false )
        }

        const handleOk = () => {
            setPadding( true )
            form.validateFields()
                .then(async (values) => {
                    if (title === 'new') {
                        const { code, msg } = await createProject({ ws_id, product_id: props.current.id, ...values })
                        defaultOption(code, msg)
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
                title={title === 'new' ? <FormattedMessage id="product.create.project"/>: title}
                width="380"
                onClose={handleClose}
                visible={visible}
                className={styles.drawer_warpper}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel"/></Button>
                            <Button type="primary" disabled={ padding } onClick={handleOk}><FormattedMessage id="operation.ok"/></Button>
                        </Space>
                    </div>
                }
            >
                <div className={styles.content_warpper}>
                    <Space style={{ display: 'revert', marginBottom: 5 }}>
                        <Typography.Text style={{ color: '#000', opacity: 0.85, fontSize: 14 }}><FormattedMessage id="product.name"/></Typography.Text>
                    </Space>
                    <Space className={styles.title_detail_project}>
                        <EllipsisPulic title={props.current.name} />
                        {/* <Tooltip title={props.current.name} placement="topLeft" overlayStyle={{ wordBreak: 'break-all' }}>
                            <Typography.Text className={styles.create_project_name}>{props.current.name}</Typography.Text>
                        </Tooltip> */}
                    </Space>
                </div>
                <div style={{ height: 10, backgroundColor: '#f5f5f5' }}></div>
                <div className={styles.content_warpper}>
                    <Form
                        form={form}
                        layout="vertical"
                        /*hideRequiredMark*/
                        initialValues={{ is_show:1 }}
                        className={styles.product_form}
                    >
                        <Form.Item 
                            label={<FormattedMessage id="product.project.name"/>}
                            name="name" 
                            help={msg} 
                            rules={[{
                                required: true,
                                max: 64,
                                pattern: /^[A-Za-z0-9\._-]*$/g,
                                message: formatMessage({id: 'product.project.name.message' }),
                            }]}>
                            <Input autoComplete="auto" 
                                placeholder={formatMessage({id: 'product.please.enter.project.name' })}
                            />
                        </Form.Item>
                        <Form.Item 
                            label={<FormattedMessage id="product.version.option"/>}
                            name="product_version">
                            <Input autoComplete="auto" 
                                placeholder={formatMessage({id: 'product.please.enter.version' })}
                            />
                        </Form.Item>
                        <Form.Item 
                            label={<FormattedMessage id="product.description.option"/>}
                            name="description">
                            <Input.TextArea 
                                placeholder={formatMessage({id: 'product.please.enter.desc' })}
                                rows={4} />
                        </Form.Item>
                        <Form.Item label={<FormattedMessage id="product.dashboard.count"/>}
                            name="is_show">
                            <Radio.Group>
                                <Radio value={1}><FormattedMessage id="operation.yes"/></Radio>
                                <Radio value={0}><FormattedMessage id="operation.no"/></Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Form>
                </div>
            </Drawer>
        )
    }
)