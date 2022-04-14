import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { Drawer, Form, Button, Input, Select, InputNumber } from 'antd'
import { useRequest } from 'umi'

import { queryTestMetric } from '../../service'
import styles from '../style.less';

export default forwardRef(
    ({ onOk, parentId, componentType }: any, ref: any) => {
        const [title, setTitle] = useState('')
        const [visible, setVisible] = useState(false)
        const [form] = Form.useForm()
        const [search, setSearch] = useState('')
        const [choose, setChoose] = useState<boolean>(false)
        const { data: metricNameList, run } = useRequest(
            queryTestMetric,
            {
                initialData: [],
                manual: true
            }
        )

        useImperativeHandle(ref, () => ({
            show: (t: string = '新增Metric', _: any = {}) => {
                const params: any = componentType === 'suite' ? { suite_id: parentId } : { case_id: parentId }
                run(params)
                setTitle(t)
                setVisible(true)
                form.setFieldsValue(_)
            },
            hide: handleCancle
        }))

        const handleOk = () => {
            form.validateFields()
                .then(
                    (values: any) => {
                        onOk(values)
                    }
                )
                .catch(err => console.log(err))
        }

        const handleCancle = () => {
            setVisible(false)
            setSearch('')
            form.resetFields()
        }

        const handleSearchMetric = (val: string) => {
            if (val) setSearch(val)
        }

        const handleSelect = () => {
            setChoose(true)
        }

        const handleBlur = () => {
            if (search) {
                if (choose) {
                    const n = form.getFieldValue('name') || []
                    form.setFieldsValue({ n })
                } else {
                    const n = form.getFieldValue('name') || []
                    const name = Array.from(new Set(n.concat(search.split(','))))
                    form.setFieldsValue({ name })
                }
                setChoose(false)
            }
        }

        const hanldeClear = () => {
            setSearch('')
            form.setFieldsValue({ name: '' })
        }

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                className={styles.warp}
                title={title}
                width={376}
                onClose={handleCancle}
                visible={visible}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div style={{ textAlign: 'right' }} >
                        <Button onClick={handleCancle} style={{ marginRight: 8 }}>
                            取消
                        </Button>
                        <Button onClick={handleOk} type="primary" htmlType="submit" >
                            {title.indexOf('新增') > -1 ? '确定' : '更新'}
                        </Button>
                    </div>
                }
            >
                <Form
                    layout="vertical"
                    form={form}
                >
                    {
                        ~title.indexOf('编辑') ?
                            <Form.Item
                                name="name"
                                label="Metric"
                                rules={[{ required: true, message: '请输入' }]}
                            >
                                <Input autoComplete="off" placeholder="请输入" />
                            </Form.Item> :
                            <Form.Item
                                name="name"
                                label="Metric"
                                rules={[{ required: true, message: '请选择' }]}
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    onSearch={handleSearchMetric}
                                    onSelect={handleSelect}
                                    onBlur={handleBlur}
                                    onClear={hanldeClear}
                                >
                                    {
                                        metricNameList.map(
                                            (item: any) => (
                                                <Select.Option value={item.name} key={item.name} >{item.name}{item.unit ? `（${item.unit}）` : null}</Select.Option>
                                            )
                                        )
                                    }
                                </Select>
                            </Form.Item>
                    }
                    <Form.Item
                        name="cmp_threshold"
                        label="​Avg阈值(%)"
                        rules={[{ required: true, message: '请输入' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} step={1} placeholder="请输入" />
                    </Form.Item>
                    <Form.Item
                        name="cv_threshold"
                        label="CV阈值(%)"
                        rules={[{ required: true, message: '请输入' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} step={1} placeholder="请输入" />
                    </Form.Item>
                    <Form.Item
                        name="direction"
                        label="期望方向"
                        rules={[{ required: true, message: '请选择' }]}
                    >
                        <Select placeholder="请选择">
                            <Select.Option value='increase'>上升</Select.Option>
                            <Select.Option value='decline'>下降</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)