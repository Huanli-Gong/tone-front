import { Drawer, Space, Button, Form, Input, Typography, message, Divider } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { copyReportTemplateList } from '../services'
import styled from 'styled-components'
const TemplateDrawer = styled(Drawer)`
    .ant-drawer-title{
        font-weight: 600;
    }
    .server_provider {
        margin-bottom: 5px;  
    }
    .script_right_name{
        font-size: 14px;
        color: rgba(0,0,0,0.85);
    }
`
const Line = styled.div`
    width: calc(100% + 48px);
    transform: translateX(-24px);
`
const LineDivider = styled(Divider)`
    border-top: '10px solid #F5F5F5';
`

const randomStrings = () => new Array(4).fill('').reduce((p, c) => p.concat(String.fromCharCode(97 + Math.ceil(Math.random() * 25))), '')

export default forwardRef(
    (props: any, ref: any) => {
        const [form] = Form.useForm()
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [editer, setEditer] = useState<any>({}) // 编辑的数据
        const [oldTemplateName, setOldTemplateName] = useState('')

        useImperativeHandle(
            ref,
            () => ({
                show: (data: any = {}) => {
                    const copyName = `${data.name}-copy-${randomStrings()}`
                    setVisible(true)
                    setEditer({ ...data, name: copyName })
                    setOldTemplateName(data.name)
                    form.setFieldsValue({ ...data, name: copyName }) // 动态改变表单值
                }
            })
        )

        const handleClose = () => {
            form.resetFields() // 重置一组字段到 initialValues
            setPadding(false)
            setVisible(false)
        }

        const defaultOption = (code: number, msg: string) => {
            if (code === 200) {
                props.onOk()
                message.success('复制成功')
                setVisible(false)
                form.resetFields() //重置一组字段到 initialValues
            }
            else {
                if (code === 201) {
                    form.setFields([{ name: "name", errors: ["模板名称已存在"] }])
                } else {
                    message.error(msg)
                }
            }
            setPadding(false)
        }

        const handleOk = () => {
            if (!form.getFieldValue('name')) {
                // setNameStatus(false)
                return
            }
            setPadding(true)
            form.validateFields() // 触发表单验证，返回Promise
                .then(async (values) => {
                    const { code, msg } = await copyReportTemplateList({ ws_id: props.ws_id, ...editer, ...values })
                    defaultOption(code, msg)
                })
                .catch(err => console.log(err))
        }

        return (
            <TemplateDrawer
                title="模板复制"
                width="375"
                onClose={handleClose}
                visible={visible}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}>取消</Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}>{editer && editer.name ? '更新' : '确定'}</Button>
                        </Space>
                    </div>
                }
            >
                <div className="server_provider">
                    <Space>
                        <Typography.Text className="script_right_name" strong={true}>原模板名称</Typography.Text>
                        <Typography.Text>{oldTemplateName}</Typography.Text>
                    </Space>
                </div>
                <Line>
                    <LineDivider />
                </Line>
                <Form
                    form={form}
                    layout="vertical" // 表单布局 ，垂直
                >
                    <Form.Item
                        label="新建模板名称"
                        name="name"
                        rules={[{
                            required: true,
                            pattern: /^[\u4E00-\u9FA5A-Za-z0-9\._-]{1,64}$/g,
                            message: "仅允许包含中文、字母、数字、下划线、中划线、点，最长64个字符"
                        }]}
                    >
                        <Input autoComplete="auto" placeholder="请输入模板名称" />
                    </Form.Item>
                    <Form.Item label="描述（选填）" name="description">
                        <Input.TextArea placeholder="请输入模板描述信息" />
                    </Form.Item>
                </Form>
            </TemplateDrawer>
        )
    }
)