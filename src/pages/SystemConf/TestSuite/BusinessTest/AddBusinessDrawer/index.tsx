import { Drawer, Space, Button, Form, Input, message } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { addBusiness, editBusiness } from '../../service'
import styles from './index.less'

export default forwardRef(
    (props: any, ref: any) => {
        const [form] = Form.useForm()
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState('')
        const [editData, setEditData] = useState<any>({}) // 编辑的数据
        const [nameStatus, setNameStatus] = useState({status: true, message: ''}) // 校验名称是否重复|是否为空|是否超长

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string, data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    setEditData(data)
                    form.setFieldsValue(data) // 动态改变表单值
                }
            })
        )
        
        const handleClose = () => {
            form.resetFields() // 重置字段
            setPadding(false)
            setVisible(false)
            setNameStatus({status: true, message: ''})
        }

        const defaultOption = (code: number, msg: string, type: string) => {
            if (code === 200) {
                message.success('操作成功')
                setVisible(false)
                form.resetFields() //重置字段
                props.callback()
            } else if (code === 201) {
                setNameStatus({ status: false, message: `业务名称已存在`})
            } else {
                message.error(msg || '操作失败')
            }
        }

        const handleOk = () => {
            form.validateFields().then(async (values) => {
                setPadding(true)
                if (editData.id) {
                    const { code, msg } = await editBusiness({ id: editData.id, ...values })
                    defaultOption(code, msg, 'edit')                    
                } else {
                    const { code, msg } = await addBusiness({ ...values })
                    defaultOption(code, msg, 'add')
                }
                setPadding(false)
            }).catch((err) => {
                setPadding(false)
                // console.log(err)
                // 单独校验业务名称
                err?.errorFields?.forEach((item: any)=> {
                    if (item.name[0] === 'name') {
                       setNameStatus({status: false, message: item.errors[0]})
                    }
                })
            })
        }

        return (
          <Drawer className={styles.addBusiness_drawer}
            title={title}
            maskClosable
            keyboard={ false }
            width="375"
            onClose={handleClose}
            visible={visible}
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleClose}>取消</Button>
                        <Button type="primary" disabled={padding|| !nameStatus.status} onClick={handleOk}>{editData && editData.name ? '更新' : '确定'}</Button>
                    </Space>
                </div>
            }
          >
            <Form
              form={form}
              layout="vertical" // 表单布局
              // hideRequiredMark
              >
              <Form.Item label="业务名称"
                name="name"
                validateStatus={(!nameStatus.status) ? 'error' : undefined}
                help={(!nameStatus.status && nameStatus.message )}
                rules={[
                    {required: true },
                ]}>
                <Input autoComplete="off" placeholder="请输入业务测试名称" onChange={(e) => {
                    if (!e.target.value) {
                        setNameStatus({ status: false, message: `业务名称不能为空` })
                    } else {
                        setNameStatus({ status: true, message: '' })
                        const value = e.target.value
                        if (!(value.match(/^[A-Za-z0-9\._-]+$/g) && value.length <= 32)) {
                            setNameStatus({status: false, message: `仅允许包含字母、数字、下划线、中划线、点，最长32个字符` })  
                        }
                    }
                }} 
                allowClear
                />
              </Form.Item>
              <Form.Item label="描述"
                name="description"
                rules={[
                    {required: false },
                    {max: 500, message: '限制最长500个字符'},
                ]}
              >
                <Input.TextArea placeholder="请输入描述信息" />
              </Form.Item>
            </Form>
          </Drawer>
        )
    }
)
