/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Drawer, Space, Button, Form, Input, message, Select } from 'antd'
import { forwardRef, useState, useImperativeHandle } from 'react'
import { useIntl, FormattedMessage, useParams } from 'umi'
import { createCloudImage, updateCloudImage, queryCloudAk, queryRegionCloudAk } from '../../service'

import styles from './index.less'
import _ from 'lodash'

export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const { ws_id } = useParams() as any
        const defaultParmasAk = {
            page_num: 1,
            page_size: 1000,
            ws_id
        }
        const [form] = Form.useForm()
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState('new') // 弹框顶部title
        const [editer, setEditer] = useState<any>({}) // 编辑的数据
        const [akData, setAkData] = useState<any>([]) // 编辑的数据
        const [regionList, setRegionList] = useState<any>([])
        const [providerType, setProviderType] = useState<any>() // 编辑的数据

        const getAkList = async (params: any) => {
            const { data } = await queryCloudAk(params)
            setAkData(data || [])
        };

        const getRegionList = async (params: any) => {
            const { data } = await queryRegionCloudAk(params)
            setRegionList(data || [])
        };

        useImperativeHandle(
            ref,
            () => ({
                show: ($title: string = "new", data: any = {}) => {
                    let type = ''
                    if (data && data.provider) {
                        type = data.provider
                        getAkList({ ...defaultParmasAk, provider: type })
                    }
                    const { ak_id } = data
                    // console.log('ak_id:', ak_id);
                    ak_id && getRegionList({ ak_id });
                    setVisible(true)
                    setTitle($title)
                    setEditer(data)
                    setProviderType(type)
                    form.setFieldsValue(data) // 动态改变表单值
                }
            })
        )

        const handleClose = () => {
            form.resetFields() // 重置一组字段到 initialValues
            setPadding(false)
            setVisible(false)
            setEditer({})
        }

        const defaultOption = (code: number, msg: string) => {
            setPadding(false)
            if (code === 200) {
                props.onOk()
                message.success(formatMessage({ id: 'operation.success' }))
                setVisible(false)
                form.resetFields() //重置一组字段到 initialValues
            }
            else {
                if (code === 201) {
                    form.setFields([{
                        name: "image_name",
                        errors: [
                            formatMessage({ id: 'device.image.name.cannot.repeated' })
                        ],
                    }])
                    form.scrollToField("image_name")
                } else {
                    message.error(msg)
                }
            }
        }

        const handleOk = () => {
            if (padding) return
            setPadding(true)
            form.validateFields() // 触发表单验证，返回Promise
                .then(async (values) => {
                    let akId = values.ak_name
                    const arr = akData.filter((item: any) => item.name === values.ak_name)
                    if (arr.length) akId = arr[0].id
                    values.ak_id = akId
                    if (title === 'new') {
                        const { code, msg } = await createCloudImage({ ...values, ws_id })
                        defaultOption(code, msg)
                    }
                    else {
                        const { code, msg } = await updateCloudImage({ id: editer.id, ...values, ws_id })
                        defaultOption(code, msg)
                    }
                })
                .catch(err => {
                    console.log(err)
                    setPadding(false)
                })
        }
        const providerArr = [
            { id: 'aliyun_ecs', name: formatMessage({ id: 'device.aliyun_ecs' }) },
            { id: 'aliyun_eci', name: formatMessage({ id: 'device.aliyun_eci' }) },
        ]
        const providerSelectFn = (value: string) => {
            if (value !== providerType) {
                const fieldsValue = _.cloneDeep(form.getFieldsValue())
                fieldsValue.ak_name = undefined
                form.setFieldsValue(fieldsValue)
                setProviderType(value)
            }

            getAkList({ ...defaultParmasAk, provider: value })
        }

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                title={title === 'new' ? <FormattedMessage id="device.new.image" /> : <FormattedMessage id="device.edit.image" />}
                width={375}
                onClose={handleClose}
                destroyOnClose
                open={visible}
                className={styles.add_baseline_drawer}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}>
                                {editer && editer.name ? <FormattedMessage id="operation.update" /> : <FormattedMessage id="operation.ok" />}
                            </Button>
                        </Space>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical" // 表单布局 ，垂直
                >
                    <Form.Item
                        label={<FormattedMessage id="device.cloud.service.provider" />}
                        name="provider"
                        rules={[{ required: true, message: formatMessage({ id: 'device.cloud.service.provider.cannot.empty' }) }]}>
                        <Select
                            onSelect={providerSelectFn}
                            placeholder={formatMessage({ id: 'device.cloud.service.provider.select' })}
                            filterOption={(input, option: any) => {
                                return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }}
                            options={
                                providerArr.map(
                                    (item: any) => ({
                                        value: item.id,
                                        label: item.name
                                    })
                                )
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        label="Ak Name"
                        name="ak_name"
                        rules={[{ required: true, message: formatMessage({ id: 'device.ak.name.cannot.empty' }) }]}>
                        <Select
                            onChange={(value) => {
                                form.setFieldsValue({ region: undefined });
                                const oneItem = akData.filter((item: any) => item.name === value);
                                if (oneItem.length && oneItem[0].id) {
                                    getRegionList({ ak_id: oneItem[0].id })
                                }
                            }}
                            placeholder={formatMessage({ id: 'device.ak.name.select' })}
                            disabled={!providerType ? true : false}
                            showSearch={true}
                            filterOption={(input, option: any) => {
                                return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }}
                            options={
                                akData.map(
                                    (item: any) => ({
                                        value: item.name,
                                        label: item.name
                                    })
                                )
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        label="Region"
                        name="region"
                        rules={[{ required: true, message: "region不能为空" }]}>
                        <Select
                            placeholder={formatMessage({ id: 'device.region.placeholder' })}
                            disabled={!regionList.length}
                            filterOption={(input, option: any) => {
                                return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }}
                            showSearch
                            options={
                                regionList.map((item: any) => ({
                                    value: item.id,
                                    label: item.name
                                }))
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        label="Image Group"
                        name="platform"
                        rules={[{ required: true, message: formatMessage({ id: 'device.image.group.cannot.empty' }) }]}>
                        <Input
                            autoComplete="auto"
                            placeholder={formatMessage({ id: 'device.image.group.enter' })}
                        />
                    </Form.Item>


                    <Form.Item
                        label="Image Name"
                        name="image_name"
                        rules={[{ required: true, message: formatMessage({ id: 'device.image.name.cannot.empty' }) }]}>
                        <Input autoComplete="auto" placeholder={formatMessage({ id: 'device.image.name.enter' })} />
                    </Form.Item>
                    <Form.Item
                        label="Image ID"
                        name="image_id"
                        rules={[{ required: true, message: formatMessage({ id: 'device.image.id.cannot.empty' }) }]}>
                        <Input autoComplete="auto" placeholder={formatMessage({ id: 'device.image.id.enter' })} />
                    </Form.Item>
                    <Form.Item
                        label="Image Version"
                        name="image_version"
                        rules={[{ required: true, message: formatMessage({ id: 'device.image.version.cannot.empty' }) }]}
                    >
                        <Input autoComplete="auto" placeholder={formatMessage({ id: 'device.image.version.enter' })} />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)