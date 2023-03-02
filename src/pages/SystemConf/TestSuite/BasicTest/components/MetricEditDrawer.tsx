import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { Drawer, Form, Button, Input, Select, InputNumber } from 'antd'
import { useRequest, useIntl, FormattedMessage } from 'umi'

import { queryTestMetric } from '../../service'
import styles from '../style.less';

export default forwardRef(
    ({ onOk, parentId, componentType }: any, ref: any) => {
        const { formatMessage } = useIntl()
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
            show: (t: string = '', _: any = {}) => {
                const params: any = componentType === 'suite' ? { suite_id: parentId } : { case_id: parentId }
                run(params)
                setTitle(t)
                setVisible(true)
                if (JSON.stringify(_) !== "{}")
                    form.setFieldsValue({ ..._, direction: _.direction === "上升" ? "increase" : "decline" })
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
                title={<FormattedMessage id={`metricEditer.title.${title}`}/>}
                width={480}
                onClose={handleCancle}
                open={visible}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div style={{ textAlign: 'right' }} >
                        <Button onClick={handleCancle} style={{ marginRight: 8 }}>
                            <FormattedMessage id="operation.cancel"/>
                        </Button>
                        <Button onClick={handleOk} type="primary" htmlType="submit" >
                            {title.indexOf('new') > -1 ? <FormattedMessage id="operation.ok"/> : <FormattedMessage id="operation.update"/>}
                        </Button>
                    </div>
                }
            >
                <Form
                    layout="vertical"
                    form={form}
                    initialValues={{
                        direction: "increase"
                    }}
                 
                >
                    {
                        ~title.indexOf('edit') ?
                            <Form.Item
                                name="name"
                                label="Metric"
                                rules={[{ required: true, message: formatMessage({id: 'please.enter'}) }]}
                            >
                                <Input autoComplete="off" placeholder={formatMessage({id: 'please.enter'})} />
                            </Form.Item> :
                            <Form.Item
                                name="name"
                                label="Metric"
                                rules={[{ required: true, message: formatMessage({id: 'please.select'}) }]}
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
                        label={<FormattedMessage id="TestSuite.cmp_threshold"/>}
                        rules={[{ required: true, message: formatMessage({id: 'please.enter'}) }]}
                    >
                        <InputNumber precision={2} style={{ width: '100%' }} min={0} step={1} placeholder={formatMessage({id: 'please.enter'})} />
                    </Form.Item>
                    <Form.Item
                        name="cv_threshold"
                        label={<FormattedMessage id="TestSuite.cv_threshold"/>}
                        rules={[{ required: true, message: formatMessage({id: 'please.enter'}) }]}
                    >
                        <InputNumber precision={2} style={{ width: '100%' }} min={0} step={1} placeholder={formatMessage({id: 'please.enter'})} />
                    </Form.Item>
                    <Form.Item
                        name="direction"
                        label={<FormattedMessage id="TestSuite.direction"/>}
                        rules={[{ required: true, message: formatMessage({id: 'please.select'}) }]}
                    >
                        <Select placeholder={formatMessage({id: 'please.select'})}>
                            <Select.Option value='increase'><FormattedMessage id="TestSuite.increase"/></Select.Option>
                            <Select.Option value='decline'><FormattedMessage id="TestSuite.decline"/></Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)