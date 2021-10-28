import { Drawer, Space, Button, Form, Input, message } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { createDomains, updateDomains } from '../../../service'

import styles from './index.less'

export default forwardRef(
    (props: any, ref: any) => {
        const [form] = Form.useForm()
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState('新增领域配置') // 弹框顶部title
        const [editer, setEditer] = useState<any>({}) // 编辑的数据
        const [ queryStatus , setQueryStatus ] = useState(true) // 名称重复的校验
        const [nameStatus, setNameStatus] = useState(true) // 校验名称是否为空

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "新建领域", data: any = {}) => {
                    console.log(data,'datadatadata')
                    setVisible(true)
                    setTitle(title)
                    setEditer(data)
                    setQueryStatus(true)
                    form.setFieldsValue(data) // 动态改变表单值
                }
            })
        )
        
        const handleClose = () => {
            form.resetFields() // 重置一组字段到 initialValues
            setPadding(false)
            setVisible(false)
            setNameStatus( true )
            setQueryStatus(true)
        }

        const defaultOption = (code: number, msg: string, type: string) => {
            if (code === 200) {
                // if(type === 'new') props.setCurrent({})
                props.onOk()
                message.success('操作成功')
                setQueryStatus(true)
                setVisible(false)
                form.resetFields() //重置一组字段到 initialValues
            }
            else {
                if(code === 201){
                    setQueryStatus(false)
                } else {
                    message.error(msg)
                }
            }
            setPadding(false)
        }

        const handleOk = () => {
            if (!form.getFieldValue('name')) {
                setNameStatus(false)
                return
            }
            setPadding(true)
            form.validateFields() // 触发表单验证，返回Promise
                .then(async (values) => {
                    if (title === '新建领域') {
                        const { code, msg } = await createDomains({ ...values })
                        defaultOption(code, msg, 'new')
                    }
                    else {
                        const { code, msg } = await updateDomains({ id: editer.id, ...values })
                        defaultOption(code, msg, 'edit')
                    }
                })
                .catch(err => console.log(err))
        }

        return (
            <Drawer 
                maskClosable={ false }
                keyboard={ false }
                title={title}
                width="375"
                onClose={handleClose}
                visible={visible}
                className={styles.add_baseline_drawer}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}>取消</Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}>{editer && editer.name ? '更新' : '确定'}</Button>
                        </Space>
                    </div>
                }
            >
                <Form
                    form={form}
                    // onValuesChange= 
                    layout="vertical" // 表单布局 ，垂直
                    /*hideRequiredMark*/
                >
                    <Form.Item
                        label="领域名称"
                        name="name"
                        validateStatus={(!nameStatus || !queryStatus) && 'error'}
                        help={(!nameStatus && `领域名称不能为空`) || (!queryStatus && `领域名称已存在`)}
                        rules={[{ required: true }]}
                    >
                        <Input autoComplete="auto" placeholder="请输入领域名称" onChange={(e) => {
                            setQueryStatus(true)
                            if (!e.target.value) {
                                setNameStatus(false)
                                return
                            }
                            setNameStatus(true)
                        }} />
                    </Form.Item>
                    <Form.Item label="描述（选填）" name="description">
                        <Input.TextArea placeholder="请输入描述信息" />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)