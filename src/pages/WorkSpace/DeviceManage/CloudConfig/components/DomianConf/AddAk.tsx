import { Drawer, Space, Button, Form, Input, Radio, message, Select } from 'antd'
import { forwardRef, useState, useImperativeHandle, useRef } from 'react'
import { useIntl, FormattedMessage, useParams } from 'umi'
import { createCloudAk, updateCloudAk } from '../../service'
import styles from './index.less'
import _ from 'lodash'

export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const { ws_id } = useParams() as any
        const [form] = Form.useForm()
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState('new') // 弹框顶部title
        const [editer, setEditer] = useState<any>({}) // 编辑的数据
        const IdRef = useRef<any>(null);
        const KeyRef = useRef<any>(null);
        useImperativeHandle(
            ref,
            () => ({
                show: ($title: string = "new", data: any = {}) => {
                    setVisible(true)
                    setTitle($title)
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

        const defaultOption = (code: number, msg: string) => {
            if (code === 200) {
                props.onOk()
                message.success(formatMessage({ id: 'operation.success' }))
                setVisible(false)
                form.resetFields() //重置一组字段到 initialValues
            }
            else {
                if (code === 201) {
                    const localeStr = formatMessage({ id: 'device.ak.name.cannot.repeated' })
                    form.setFields([{ name: 'name', errors: [localeStr] }])
                    form.scrollToField("name")
                } else {
                    message.error(msg)
                }
            }
            setPadding(false)
        }

        const handAccessIdChange = (e: any) => {
            if (e.target.value?.indexOf('*') !== -1) {
                form.setFieldsValue({ access_id: '' })
            }
            IdRef.current!.focus({
                cursor: 'end',
            });
        }
        const handAccessKeyChange = (e: any) => {
            if (e.target.value?.indexOf('*') !== -1) {
                form.setFieldsValue({ access_key: '' })
            }
            KeyRef.current!.focus({
                cursor: 'end',
            });
        }
        const handleOk = () => {
            if (padding) return
            setPadding(true)
            form.validateFields() // 触发表单验证，返回Promise
                .then(async (values) => {
                    const valuesCopy = _.cloneDeep(values)
                    valuesCopy.enable = valuesCopy.enable ? 'True' : 'False'
                    if (title === 'new') {
                        const { code, msg } = await createCloudAk({ ...valuesCopy, ws_id })
                        defaultOption(code, msg)
                    }
                    else {
                        const { code, msg } = await updateCloudAk({ id: editer.id, ...valuesCopy, ws_id })
                        defaultOption(code, msg)
                    }
                    setPadding(false)
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

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                title={title === 'new' ? <FormattedMessage id="device.new.ak" /> : <FormattedMessage id="device.edit.ak" />}
                width="375"
                onClose={handleClose}
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
                    initialValues={{
                        enable: editer.enable || true,
                        vm_quota: "*"
                    }}
                >
                    <Form.Item
                        label={<FormattedMessage id="device.cloud.service.provider" />}
                        name="provider"
                        rules={[{ required: true, message: formatMessage({ id: 'device.cloud.service.provider.cannot.empty' }) },]}
                    >
                        <Select
                            placeholder={formatMessage({ id: 'device.cloud.service.provider.select' })}
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
                    <Form.Item
                        label={<FormattedMessage id="device.enable" />}
                        name="enable">
                        <Radio.Group>
                            <Radio value={true}><FormattedMessage id="operation.yes" /></Radio>
                            <Radio value={false}><FormattedMessage id="operation.no" /></Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        label="AK Name"
                        name="name"
                        rules={[{ required: true, message: formatMessage({ id: 'device.ak.name.cannot.empty' }) }]}
                    >
                        <Input autoComplete="auto" placeholder={formatMessage({ id: 'device.ak.name.enter' })} />
                    </Form.Item>
                    <Form.Item
                        label="Access ID"
                        name="access_id"
                        rules={[{ required: true, message: formatMessage({ id: 'device.access_id.cannot.empty' }) }]}
                    >
                        <Input autoComplete="auto" placeholder={formatMessage({ id: 'device.access_id.enter' })}
                            onChange={handAccessIdChange} ref={IdRef} />
                    </Form.Item>
                    <Form.Item
                        label="Access Key"
                        name="access_key"
                        rules={[{ required: true, message: formatMessage({ id: 'device.access_key.cannot.empty' }) }]}
                    >
                        <Input autoComplete="auto" placeholder={formatMessage({ id: 'device.access_key.enter' })}
                            onChange={handAccessKeyChange} ref={KeyRef} />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="device.vm_quota" />}
                        name="vm_quota"
                        rules={[{ required: true, message: formatMessage({ id: 'device.vm_quota.cannot.empty' }) }]}
                    >
                        <Input placeholder={formatMessage({ id: 'device.vm_quota.placeholder' })} />
                    </Form.Item>
                    {/* 开源和社区版需要 */}
                    {
                        BUILD_APP_ENV &&
                        <Form.Item
                            label={<FormattedMessage id="device.resource_group_id" />}
                            name="resource_group_id"
                        >
                            <Input
                                autoComplete="auto"
                                placeholder={formatMessage({ id: 'please.enter' })}
                            />
                        </Form.Item>
                    }
                    <Form.Item label={<FormattedMessage id="device.description.option" />}
                        name="description">
                        <Input.TextArea placeholder={formatMessage({ id: 'device.description.option.placeholder' })}
                        />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)