import { Modal, Spin, Form, Input, message } from 'antd'
import React, { useState, useImperativeHandle, forwardRef } from 'react'
import ColorPicker from '../../../TagManage/components/ColorPicker';
import { addTag } from '../service'
export default forwardRef(
    (props: any, ref: any) => {
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [padding, setPadding] = useState(false)
        const [msg, setMsg] = useState<string>()
        useImperativeHandle(
            ref,
            () => ({
                show: () => {
                    setVisible(true)
                    setMsg('仅允许包含字母、数字、下划线、中划线、点，最长32个字符')
                    form.setFieldsValue({ tag_color: 'rgb(255,157,78,1)' })
                }
            }),
        )
     

        const handleCancel = () => {
            form.resetFields()
            setVisible(false)
            setPadding(false)
        }
        const handleTagName = () => {
            setPadding(false)
        }
        const handleOk = () => {
            if (padding) return
            setPadding(true)
            setMsg(undefined)
            form.validateFields().then(
                async (val: any) => {
                    const { code, msg } = await addTag({ ws_id: props.ws_id, ...val })
                    if (code === 200) {
                        props.onOk()
                        handleCancel()
                        message.success('操作成功!')
                    } else if (code === 1302) {
                        setMsg('标签名称已存在')
                    } else {
                        setPadding(false)
                        message.error(msg)
                    }
                })
                .catch(err => {
                    setPadding(false)
                })
        }
        return (
            <Modal
                width={460}
                title="新建标签"
                visible={visible}
                centered={true}
                onCancel={handleCancel}
                maskClosable={false}
                onOk={handleOk}
                okText="确认"
                cancelText="取消"
            >
                <Spin spinning={false}>
                    <Form
                        form={form}
                        layout="vertical"
                        /*hideRequiredMark*/
                    >
                        <Form.Item
                            name="tag_color"
                            label="标签颜色"
                        >
                            <ColorPicker />
                        </Form.Item>
                        <Form.Item
                            name="name"
                            label="标签名称"
                            help = {msg}
                            rules={
                                [{
                                    required: true,
                                    max: 32,
                                    message: '仅允许包含字母、数字、下划线、中划线、点，最长32个字符',
                                    pattern: /^[A-Za-z0-9\._-]*$/g
                                }]
                            }
                        >
                            <Input onFocus={handleTagName} />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="备注"
                        >
                            <Input.TextArea rows={4} placeholder="请输入备注信息" />
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        )
    }
)