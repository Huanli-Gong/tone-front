import { Drawer, Space, Button, Form, Input, Radio, message, Select } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { createCloudImage, updateCloudImage, queryCloudAk, queryRegionCloudAk } from '../../service'

import styles from './index.less'
import _ from 'lodash'
export default forwardRef(
    (props: any, ref: any) => {
        const defaultParmasAk = {
            page_num: 1,
            page_size: 1000,
            ws_id:props.ws_id
        }
        const [form] = Form.useForm()
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState('新建Image') // 弹框顶部title
        const [editer, setEditer] = useState<any>({}) // 编辑的数据
        const [akData, setAkData] = useState<any>([]) // 编辑的数据
        const [regionList, setRegionList] = useState<any>([])
        const [providerType, setProviderType] = useState<any>() // 编辑的数据

        const [nameAkStatus, setNameAkStatus] = useState(true) // 校验名称是否为空
        const [nameStatus, setNameStatus] = useState(true) // 校验名称是否为空
        const [idStatus, setIDStatus] = useState(true) // 校验名称是否为空
        const [versionStatus, setVersiontatus] = useState(true) // 校验名称是否为空
        const [providerStatus, setProviderStatus] = useState(true) // 校验名称是否为空

        const [platformStatus, setPlatformStatus] = useState(true) // 校验名称是否为空
        const [regionStatus, setRegionStatus] = useState(true) // 校验名称是否为空
        const [queryNameStatus, setQuerynameStatus] = useState(true) // 校验名称重复的校验

        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = "新建Image", data: any = {}) => {

                    let type = ''
                    if(data && data.provider) {
                        type = data.provider
                        getAkList({...defaultParmasAk, provider:type})
                    }
                    const { ak_id } = data
                    // console.log('ak_id:', ak_id);
                    ak_id && getRegionList({ ak_id });
                    setVisible(true)
                    setTitle(title)
                    setEditer(data)
                    setQuerynameStatus(true)
                    setProviderType(type)
                    form.setFieldsValue(data) // 动态改变表单值
                }
            })
        )
       
        const getAkList = async (params:any) => {
            const { data } = await queryCloudAk(params)
            setAkData(data || [])
        };

        const getRegionList = async (params:any) => {
            const { data } = await queryRegionCloudAk(params)
            setRegionList(data || [])
        };


 
       const handleClose = () => {
            form.resetFields() // 重置一组字段到 initialValues
            setPadding(false)
            setVisible(false)
            setQuerynameStatus(true)
            setNameAkStatus(true)
            setNameStatus(true)
            setIDStatus(true)
            setVersiontatus(true)
            setProviderStatus(true)
            setPlatformStatus(true)
            setRegionStatus(true)
            setEditer({})
        }

        const defaultOption = (code: number, msg: string, type: string) => {
            if (code === 200) {
                props.onOk()
                props.setPage(1)
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
            if (!form.getFieldValue('ak_name')) {
                setNameAkStatus(false)
                return
            }
            if (!form.getFieldValue('image_name')) {
                setNameStatus(false)
                return
            }
            if (!form.getFieldValue('image_id')) {
                setIDStatus(false)
                return
            }
            if (!form.getFieldValue('image_version')) {
                setVersiontatus(false)
                return
            }
            if (!form.getFieldValue('platform')) {
                setPlatformStatus(false)
                return
            }
            if (!form.getFieldValue('region')) {
                setRegionStatus(false)
                return
            }
            setPadding(true)
            form.validateFields() // 触发表单验证，返回Promise
                .then(async (values) => {
                    let akId = values.ak_name
                    const arr = akData.filter(item => item.name === values.ak_name)
                    if (arr.length) akId = arr[0].id
                    values.ak_id = akId
                    if (title === '新建Image') {
                        const { code, msg } = await createCloudImage({ ...values, ws_id: props.ws_id })
                        defaultOption(code, msg, 'new')
                    }
                    else {
                        const { code, msg } = await updateCloudImage({ id: editer.id, ...values, ws_id: props.ws_id })
                        defaultOption(code, msg, 'edit')
                    }
                })
                .catch(err => console.log(err))
        }
        const providerArr = [{id:'aliyun_ecs',name: '阿里云ECS'},{id:'aliyun_eci',name: '阿里云ECI'}]
        const providerSelectFn = (value:string)=>{
            setProviderStatus(true)
            if(value !== providerType){
                const fieldsValue = _.cloneDeep(form.getFieldsValue())
                fieldsValue.ak_name = undefined
                form.setFieldsValue(fieldsValue)
                setProviderType(value)

            }
            
            getAkList({...defaultParmasAk,provider:value})
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
                            onSelect={providerSelectFn}
                            placeholder="请选择云服务商"
                            // defaultValue={providerArr[0].id}
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
                    <Form.Item
                        label="Ak Name"
                        name="ak_name"
                        validateStatus={(!providerType || !nameAkStatus ) && 'error'}
                        help={(!providerType && `请先选择云服务商`) || (!nameAkStatus && `AK Name不能为空`)}
                        rules={[{ required: true }]}>
                        <Select
                            onChange={(value) => {
                                form.setFieldsValue({ region: undefined });
                                const oneItem = akData.filter((item: any) => item.name ===  value);
                                if (oneItem.length && oneItem[0].id) {
                                  getRegionList({ ak_id: oneItem[0].id }) }}
                                }
                            onSelect={()=>{setNameAkStatus(true)}}
                            placeholder="请选择AK Name"
                            disabled={!providerType ? true : false}
                            showSearch={true}
                            filterOption={(input, option: any) => {
                                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }}
                            optionFilterProp="children">
                            {
                                akData.map(
                                    (item: any) => (
                                        <Select.Option
                                            value={item.name}
                                        >
                                            {item.name}
                                        </Select.Option>
                                    )
                                )
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item label="Region"
                        name="region"
                        // validateStatus={(!regionStatus) && 'error'}
                        // help={(!regionStatus && `region不能为空`)}
                        rules={[{ required: true }]}>
                        {/* <Input autoComplete="auto" placeholder="请输入region" onChange={(e) => {
                            if (!e.target.value) {
                                setRegionStatus(false)
                                return
                            }
                            setRegionStatus(true)
                        }} /> */}
                        <Select placeholder="请输入region" disabled={!regionList.length}>
                            {regionList.map((item: any)=>
                                <Select.Option value={item.id} key={item.id}>
                                    {item.name}
                                </Select.Option>
                            )}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="ImageGroup"
                        name="platform"
                        validateStatus={(!platformStatus) && 'error'}
                        help={(!platformStatus && `ImageGroup不能为空`)}
                        rules={[{ required: true }]}>
                        <Input autoComplete="auto" placeholder="请输入ImageGroup" onChange={(e) => {
                            if (!e.target.value) {
                                setPlatformStatus(false)
                                return
                            }
                            setPlatformStatus(true)
                        }} />
                    </Form.Item>
                    

                    <Form.Item
                        label="ImageName"
                        name="image_name"
                        validateStatus={(!nameStatus || !queryNameStatus) && 'error'}
                        help={(!nameStatus && `ImageName不能为空`) || (!queryNameStatus && `ImageName不能重复`)}
                        rules={[{ required: true }]}>
                        <Input autoComplete="auto" placeholder="请输入ImageName" onChange={(e) => {
                            if (!e.target.value) {
                                setNameStatus(false)
                                return
                            }
                            setQuerynameStatus(true)
                            setNameStatus(true)
                        }} />
                    </Form.Item>
                    <Form.Item
                        label="ImageID"
                        name="image_id"
                        validateStatus={(!idStatus) && 'error'}
                        help={(!idStatus && `ImageID不能为空`)}
                        rules={[{ required: true }]}>
                        <Input autoComplete="auto" placeholder="请输入ImageID" onChange={(e) => {
                            if (!e.target.value) {
                                setIDStatus(false)
                                return
                            }
                            setIDStatus(true)
                        }} />
                    </Form.Item>
                    <Form.Item
                        label="ImageVersion"
                        name="image_version"
                        validateStatus={(!versionStatus) && 'error'}
                        help={(!versionStatus && `ImageVersion不能为空`)}
                        rules={[{ required: true }]}>
                        <Input autoComplete="auto" placeholder="请输入ImageVersion" onChange={(e) => {
                            if (!e.target.value) {
                                setVersiontatus(false)
                                return
                            }
                            setVersiontatus(true)
                        }} />
                    </Form.Item>


                </Form>
            </Drawer>
        )
    }
)