import { Drawer, Space, Button, Form, Input } from 'antd'
import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { useIntl, FormattedMessage } from 'umi'
import styles from './index.less'
import _ from 'lodash'

export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const [form] = Form.useForm()
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        // const [title, setTitle] = useState('') // 弹框顶部title
        const [editer, setEditer] = useState<any>({}) // 编辑的数据
        // const [options, setOptions] = useState<{ value: string }[]>([]);

        useImperativeHandle(
            ref,
            () => ({
                show: (data: any = {}) => {
                    setVisible(true)
                    setEditer(data)
                    // setOptions([{ value: name }])
                    form.setFieldsValue(data)
                }
            })
        )
        const handleClose = () => {
            form.resetFields() // 重置一组字段到 initialValues
            setPadding(false)
            setVisible(false)
        }

        /* const onSelect = (data: string) => {
            form.setFieldsValue({ name: data })
        }; */

        const handleOk = () => {
            setPadding(true)
            form.validateFields() // 触发表单验证，返回Promise
                .then(async (values) => {
                    props.onOk({ ...editer, ...values })
                    form.resetFields()
                    setPadding(false)
                    setVisible(false)
                })
                .catch(err => console.log(err))
        }

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                title={
                    formatMessage({ id: 'analysis.edit.mark.name' })
                }
                width="375"
                onClose={handleClose}
                open={visible}
                className={styles.add_baseline_drawer}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}><FormattedMessage id="operation.update" /></Button>
                        </Space>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical" // 表单布局 ，垂直
                >
                    <Form.Item
                        label={<FormattedMessage id="analysis.comparison.group" />}
                        name="name"
                        rules={[{ required: true, message: formatMessage({ id: 'analysis.comparison.group.cannot.empty' }) }]}
                    >
                        <Input
                            allowClear={true}
                            // options={options}
                            style={{ width: '98%' }}
                            autoComplete="off"
                            // onSelect={onSelect}
                            placeholder={formatMessage({ id: 'analysis.comparison.group.name.placeholder' })}
                        />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)
