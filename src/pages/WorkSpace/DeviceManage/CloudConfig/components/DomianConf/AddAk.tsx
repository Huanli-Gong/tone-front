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

        const [nameStatus, setNameStatus] = useState(true) // 校验名称是否为空
        const [idStatus, setIDStatus] = useState(true) // 校验名称是否为空
        const [keyStatus, setKeytatus] = useState(true) // 校验名称是否为空
        const [resourceId, setResourceId] = useState(true) // 校验名称是否为空
        const [providerStatus, setProviderStatus] = useState(true) // 校验名称是否为空
        const [queryNameStatus, setQuerynameStatus] = useState(true) // 校验名称重复的校验
        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "新建ak", data: any = {}) => {
                    setVisible(true)
                    setTitle(title)
                    setEditer(data)
                    setQuerynameStatus(true)
                    form.setFieldsValue(data) // 动态改变表单值
                }
            })
        )
        const handleClose = () => {
            form.resetFields() // 重置一组字段到 initialValues
            setPadding(false)
            setVisible(false)
            setQuerynameStatus(true)
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
                if(code === 201){
                    setQuerynameStatus(false)            
                } else {
                    message.error(msg)
                }

            }
            setPadding(false)
        }

        const handleOk = () => {          
            if (!form.getFieldValue('provider')) {
                setProviderStatus(false)
                return
            }
            if (!form.getFieldValue('name')) {
                setNameStatus(false)
                return
            }
            if (!form.getFieldValue('access_id')) {
                setIDStatus(false)
                return
            }
            if (!form.getFieldValue('access_key')) {
                setKeytatus(false)
                return
            }
            if (BUILD_APP_ENV){
                if (!form.getFieldValue('resource_group_id')) {
                    setResourceId(false)
                    return
                }
            }
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
                })
                .catch(err => console.log(err))
        }
        const providerArr = [{id:'aliyun_ecs',name: '阿里云ECS'},{id:'aliyun_eci',name: '阿里云ECI'}]

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
                    layout="vertical" // 表单布局 ，垂直
                    /*hideRequiredMark*/
                    >
                    <Form.Item
                        label="云服务商"
                        name="provider"
                        validateStatus={(!providerStatus) && 'error'}
                        help={(!providerStatus && `云服务商不能为空`)}
                        rules={[{ required: true }]}>


                        <Select
                            onSelect={()=>{setProviderStatus(true)}}
                            placeholder="请选择云服务商"
                            filterOption={(input, option: any) => {
                                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }}
                            optionFilterProp="children">
                            {
                                providerArr.map(
                                    (item: any) => (
                                        <Select.Option
                                            value={item.id}
                                        >
                                            {item.name}
                                        </Select.Option>
                                    )
                                )
                            }
                        </Select>


                    </Form.Item>
                    <Form.Item initialValue={editer.enable || true} label="是否启用" name="enable">
                            <Radio.Group>
                                <Radio value={true}>是</Radio>
                                <Radio value={false}>否</Radio>
                            </Radio.Group>
                        </Form.Item>
                    <Form.Item
                        label="akName"
                        name="name"
                        validateStatus={(!nameStatus || !queryNameStatus) && 'error'}
                        help={(!nameStatus && `akName不能为空`)||(!queryNameStatus && `akName不能重复`)}
                        rules={[{ required: true }]}>
                        <Input autoComplete="auto" placeholder="请输入akName" onChange={(e) => {
                            if (!e.target.value) {
                                setNameStatus(false)
                                return
                            }
                            setQuerynameStatus(true)
                            setNameStatus(true)
                        }} />
                    </Form.Item>
                    <Form.Item
                        label="accessID"
                        name="access_id"
                        validateStatus={(!idStatus) && 'error'}
                        help={(!idStatus && `accessID不能为空`)}
                        rules={[{ required: true }]}>
                        <Input autoComplete="auto" placeholder="请输入akaccessID" onChange={(e) => {
                            if (!e.target.value) {
                                setIDStatus(false)
                                return
                            }
                            setIDStatus(true)
                        }} />
                    </Form.Item>
                    <Form.Item
                        label="accessKEY"
                        name="access_key"
                        validateStatus={(!keyStatus) && 'error'}
                        help={(!keyStatus && `accessKEY不能为空`)}
                        rules={[{ required: true }]}>
                        <Input autoComplete="auto" placeholder="请输入accessKEY" onChange={(e) => {
                            if (!e.target.value) {
                                setKeytatus(false)
                                return
                            }
                            setKeytatus(true)
                        }} />
                    </Form.Item>
                    {/* 开源和社区版需要 */}
                    {
                        BUILD_APP_ENV && <Form.Item
                            label="资源组ID"
                            name="resource_group_id"
                            validateStatus={(!resourceId) && 'error'}
                            help={(!resourceId && `资源组ID不能为空`)}
                            rules={[{ required: true }]}>
                            <Input autoComplete="auto" placeholder="请输入资源组ID" onChange={(e) => {
                                if (!e.target.value) {
                                    setResourceId(false)
                                    return
                                }
                                setResourceId(true)
                            }}/>
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