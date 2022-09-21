import { Drawer, Space, Button, Form, AutoComplete } from 'antd'
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
        const [title, setTitle] = useState('') // 弹框顶部title
        const [editer, setEditer] = useState<any>({}) // 编辑的数据
        const [options, setOptions] = useState<{ value: string }[]>([]);
        useImperativeHandle(
            ref,
            () => ({
                show: (title: string = formatMessage({id: 'analysis.edit.mark'}), data: any = {}, name:string = '') => {
                    setVisible(true)
                    setTitle(title)
                    let mark = _.get(data,'product_version') || ''
                    mark = mark.replace(/\n/g,' ')
                    data.product_version = mark
                    setEditer(data)
                    setOptions([{ value: name }])
                    form.setFieldsValue({ name: [mark] })
                }
            })
        )
        const handleClose = () => {
            form.resetFields() // 重置一组字段到 initialValues
            setPadding(false)
            setVisible(false)
        }
        
        const onSelect = (data: string) => {
            form.setFieldsValue({ name: data })
        };
        
        const handleOk = () => {
            setPadding(true)
            form.validateFields() // 触发表单验证，返回Promise
                .then(async (values) => {
                    const newEditer = editer
                    newEditer.product_version = values.name
                    props.onOk(newEditer)
                    form.setFieldsValue({ name: [] })
                    setPadding(false)
                    setVisible(false)
                })
                .catch(err => console.log(err))
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
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                            <Button type="primary" disabled={padding} onClick={handleOk}><FormattedMessage id="operation.update" /></Button>
                        </Space>
                    </div>
                }
            >
                {/* <Form
                    form={form}
                    layout="vertical" // 表单布局 ，垂直
                    validateTrigger={''}
                    >
                    <Form.Item
                        label="对比组"
                        name="name"
                        validateStatus={(!nameStatus) && 'error'}
                        help={(!nameStatus && `对比组名称不能为空`)}
                        rules={[{ required: true }]}>
                        <Select
                            mode="multiple"
                            className={styles.pers_select}
                            getPopupContainer={node => node.parentNode}
                            onSearch={handleFuncsBaselineSelectSearch}
                            onBlur={handlePerfBaselineSelectBlur}
                            onChange={onChange}
                            title={form.getFieldValue('name')}
                            dropdownRender={() => {
                                return (
                                    <div style={{ maxHeight: 300, overflow: 'auto' }}>
                                        <Checkbox.Group options={[editer.product_version]} value={markeVal} onChange={onChange} className={styles.eidt_marked} title={editer.product_version}/>
                                    </div>
                                )
                        }}
                        placeholder="请输入对比组名称"
                        />
                    </Form.Item>
                </Form> */}
                <Form
                    form={form}
                    layout="vertical" // 表单布局 ，垂直
                    >
                    <Form.Item
                        label={<FormattedMessage id="analysis.comparison.group"/>}
                        name="name"
                        rules={[{ required: true, message: formatMessage({id: 'analysis.comparison.group.cannot.empty'}) }]}
                    >
                        <AutoComplete
                            allowClear={true}
                            options={options}
                            style={{ width: '98%' }}
                            onSelect={onSelect}
                            placeholder={formatMessage({id: 'analysis.comparison.group.name.placeholder'})}
                        />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)
