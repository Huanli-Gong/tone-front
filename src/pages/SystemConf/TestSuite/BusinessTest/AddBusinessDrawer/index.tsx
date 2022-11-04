import { Drawer, Space, Button, Form, Input, message } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { addBusiness, editBusiness } from '../../service'
import { useIntl, FormattedMessage } from 'umi'
import styles from './index.less'

export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const [form] = Form.useForm()
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [title, setTitle] = useState('')
        const [editData, setEditData] = useState<any>({}) // 编辑的数据
        const [nameStatus, setNameStatus] = useState({ status: true, message: '' }) // 校验名称是否重复|是否为空|是否超长

        useImperativeHandle(
            ref,
            () => ({
                show: (data : any ) => {
                    setVisible(true)
                    setTitle(data ? formatMessage({id: 'TestSuite.edit.business'}) : formatMessage({id: 'TestSuite.new.business'}) )
                    setEditData(data)
                    form.setFieldsValue(data) // 动态改变表单值
                }
            })
        )

        const handleClose = () => {
            form.resetFields() // 重置字段
            setPadding(false)
            setVisible(false)
            setNameStatus({ status: true, message: '' })
        }

        const defaultOption = (code: number, msg: string, type: string) => {
            if (code === 200) {
                message.success(formatMessage({id: 'operation.success'}) )
                setVisible(false)
                form.resetFields() //重置字段
                props.callback()
            } else if (code === 201) {
                setNameStatus({ status: false, message: formatMessage({id: 'TestSuite.business.name.already.exists'}) })
            } else {
                message.error(msg || formatMessage({id: 'operation.failed'}) )
            }
        }

        const handleOk = () => {
            form.validateFields().then(async (values) => {
                setPadding(true)
                if (editData && editData.id) {
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
                err?.errorFields?.forEach((item: any) => {
                    if (item.name[0] === 'name') {
                        setNameStatus({ status: false, message: item.errors[0] })
                    }
                })
            })
        }

        return (
            <Drawer
                className={styles.addBusiness_drawer}
                title={title}
                maskClosable
                keyboard={false}
                width="375"
                onClose={handleClose}
                visible={visible}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel"/></Button>
                            <Button type="primary" disabled={padding || !nameStatus.status} onClick={handleOk}>{editData && editData.name ? <FormattedMessage id="operation.update"/> : <FormattedMessage id="operation.ok"/>}</Button>
                        </Space>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical" // 表单布局
                // hideRequiredMark
                >
                    <Form.Item label={<FormattedMessage id="TestSuite.business.name"/>}
                        name="name"
                        validateStatus={(!nameStatus.status) ? 'error' : undefined}
                        help={(!nameStatus.status && nameStatus.message)}
                        rules={[
                            { required: true },
                        ]}>
                        <Input autoComplete="off" placeholder={formatMessage({id: 'please.enter'})} onChange={(e) => {
                            if (!e.target.value) {
                                setNameStatus({ status: false, message: formatMessage({id: 'TestSuite.business.name.cannot.be.empty'}) })
                            } else {
                                setNameStatus({ status: true, message: '' })
                                const value = e.target.value
                                if (!(value.match(/^[A-Za-z0-9\._-]+$/g) && value.length <= 32)) {
                                    setNameStatus({ status: false, message: formatMessage({id: 'please.enter.message'}) })
                                }
                            }
                        }}
                            allowClear
                        />
                    </Form.Item>
                    <Form.Item label={<FormattedMessage id="TestSuite.description"/>}
                        name="description"
                        rules={[
                            { required: false },
                            { max: 500, message: formatMessage({id: 'TestSuite.description.message'}) },
                        ]}
                    >
                        <Input.TextArea placeholder={formatMessage({id: 'TestSuite.please.enter.description'})} />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)
