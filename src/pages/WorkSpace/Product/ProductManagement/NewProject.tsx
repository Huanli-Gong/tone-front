import { Drawer, Space, Typography, Form, Button, message, Input, Tooltip, Radio } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import styles from './index.less'
import { createProject } from '../services'
export default forwardRef(
    (props: any, ref: any) => {
        const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [padding , setPadding ] = useState( false )
        const [msg, setMsg] = useState<string>()
        const [title, setTitle] = useState('创建项目')
        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "创建项目", data: any = {}) => {
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
                message.success('操作成功')
                handleClose();
            }else if(code === 1371){
                setMsg('项目名称已存在')
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
                    if (title === '创建项目') {
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
                title={title}
                width="380"
                onClose={handleClose}
                visible={visible}
                className={styles.drawer_warpper}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}>取消</Button>
                            <Button type="primary" disabled={ padding } onClick={handleOk}>确定</Button>
                        </Space>
                    </div>
                }
            >
                <div className={styles.content_warpper}>
                    <Space style={{ display: 'revert', marginBottom: 5 }}>
                        <Typography.Text style={{ color: '#000', opacity: 0.85, fontSize: 14 }}>产品名称</Typography.Text>
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
                        <Form.Item label="项目名称" name="name" help={msg} rules={[{
                            required: true,
                            max: 64,
                            pattern: /^[A-Za-z0-9\._-]*$/g,
                            message: '仅允许字母、数字、下划线、中划线、点，最长64个字符',
                        }]}><Input autoComplete="auto" placeholder="请输入项目名称" /></Form.Item>
                        <Form.Item label="产品版本（选填）" name="product_version">
                            <Input autoComplete="auto" placeholder="请输入版本号" />
                        </Form.Item>
                        <Form.Item label="项目描述（选填）" name="description">
                            <Input.TextArea placeholder="请输入描述信息" rows={4} />
                        </Form.Item>
                        <Form.Item label="Dashboard统计" name="is_show">
                            <Radio.Group>
                                <Radio value={1}>是</Radio>
                                <Radio value={0}>否</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Form>
                </div>
            </Drawer>
        )
    }
)