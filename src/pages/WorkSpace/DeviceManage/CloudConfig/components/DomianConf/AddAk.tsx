import { Drawer, Space, Button, Form, Input, Radio, message, Select } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { createCloudAk, updateCloudAk } from '../../service'
import styles from './index.less'
import _ from 'lodash'

export default forwardRef(
    (props: any, ref: any) => {
        const [form] = Form.useForm()
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState('新建ak') // 弹框顶部title
        const [editer, setEditer] = useState<any>({}) // 编辑的数据

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "新建ak", data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    setEditer(data)
                    form.setFieldsValue(data) // 动态改变表单值
                }
            })
        )
        const handleClose = () => {
            form.resetFields() // 重置一组字段到 initialValues
            setPadding(false)
            setVisible(false)
        }

        const defaultOption = (code: number, msg: string, type: string) => {
            if (code === 200) {
                // props.onOk()
                props.setPage()
                message.success('操作成功')
                setVisible(false)
                form.resetFields() //重置一组字段到 initialValues
            }
            else {
                if (code === 201) {
                    form.setFields([{ name: 'name', errors: ["akName不能重复"] }])
                } else {
                    message.error(msg)
                }
            }
            setPadding(false)
        }

        const handleOk = () => {
            if (padding) return
            setPadding(true)
            form.validateFields() // 触发表单验证，返回Promise
                .then(async (values) => {
                    const valuesCopy = _.cloneDeep(values)
                    valuesCopy.enable = valuesCopy.enable ? 'True' : 'False'
                    if (title === '新建ak') {
                        const { code, msg } = await createCloudAk({ ...valuesCopy, ws_id: props.ws_id })
                        defaultOption(code, msg, 'new')
                    }
                    else {
                        const { code, msg } = await updateCloudAk({ id: editer.id, ...valuesCopy, ws_id: props.ws_id })
                        defaultOption(code, msg, 'edit')
                    }
                    setPadding(false)
                })
                .catch(err => {
                    console.log(err)
                    setPadding(false)
                })
        }
        const providerArr = [{ id: 'aliyun_ecs', name: '阿里云ECS' }, { id: 'aliyun_eci', name: '阿里云ECI' }]

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
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
                    layout="vertical" // 表单布局 ，垂直
                    initialValues={{
                        enable: editer.enable || true,
                    }}
                >
                    <Form.Item
                        label="云服务商"
                        name="provider"
                        rules={[{ required: true, message: '云服务商不能为空' },]}
                    >
                        <Select
                            placeholder="请选择云服务商"
                            filterOption={(input, option: any) => {
                                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }}
                            optionFilterProp="children"
                        >
                            {
                                providerArr.map(
                                    (item: any) => (
                                        <Select.Option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.name}
                                        </Select.Option>
                                    )
                                )
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item label="是否启用" name="enable">
                        <Radio.Group>
                            <Radio value={true}>是</Radio>
                            <Radio value={false}>否</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        label="akName"
                        name="name"
                        rules={[{ required: true, message: 'akName不能为空' }]}
                    >
                        <Input autoComplete="auto" placeholder="请输入akName" />
                    </Form.Item>
                    <Form.Item
                        label="accessID"
                        name="access_id"
                        rules={[{ required: true, message: 'accessID不能为空' }]}
                    >
                        <Input autoComplete="auto" placeholder="请输入akaccessID" />
                    </Form.Item>
                    <Form.Item
                        label="accessKEY"
                        name="access_key"
                        rules={[{ required: true, message: 'accessKEY不能为空' }]}
                    >
                        <Input autoComplete="auto" placeholder="请输入accessKEY" />
                    </Form.Item>
                    {/* 开源和社区版需要 */}
                    {
                        BUILD_APP_ENV &&
                        <Form.Item
                            label="资源组ID"
                            name="resource_group_id"
                        >
                            <Input
                                autoComplete="auto"
                                placeholder="请输入资源组ID"
                            />
                        </Form.Item>
                    }
                    <Form.Item label="描述（选填）" name="description">
                        <Input.TextArea placeholder="请输入描述信息" />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)