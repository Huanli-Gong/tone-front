/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, forwardRef, useImperativeHandle } from 'react'
import { Popover, Drawer, Button, Form, Row, Col, Input, Select, InputNumber, Space, Radio, message } from 'antd'
import styles from '../../style.less'
import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { useLocation, useIntl, FormattedMessage } from 'umi'
import { useSuiteProvider } from '../../../hooks'

export default forwardRef(
    ({ onOk }: any, ref: any) => {
        const { formatMessage } = useIntl()
        const { query }: any = useLocation()

        const { domainList } = useSuiteProvider()
        const [form] = Form.useForm()

        const [visible, setVisible] = useState(false)
        const [title, setTitle] = useState('')
        const [handle, setHandle] = useState<boolean>(true)
        const [data, setData] = useState<any>({ bentch: false })
        const [pending, setPending] = useState(false)

        const handleCancel = () => {
            setData({ bentch: false })
            setHandle(true)
            setVisible(false)
            setTitle('')
            form.resetFields()
            setPending(false)
        }

        useImperativeHandle(
            ref,
            () => ({
                show: (t: string, _: any) => {
                    t && setTitle(t)
                    setData(_)
                    setVisible(true)
                    const params: any = {
                        ..._,
                        certificated: _.certificated ? 1 : 0,
                    }
                    if (domainList.length && ~t.indexOf('new')) {
                        domainList.forEach(({ id, name }: any) => {
                            if (name === '其他') params.domain_list_str = [id]
                        })
                    }
                    form.setFieldsValue(params)
                },
                hide: handleCancel
            }),
        )

        const handleOk = () => {
            if (pending) return;
            setPending(true)
            form.validateFields()
                .then(
                    (values: any) => {
                        const { id, test_suite_id } = data
                        onOk({
                            ...values,
                            id,
                            test_suite_id,
                            domain_list_str: values.domain_list_str ? values.domain_list_str.join() : undefined
                        }, data.bentch)
                    }
                )
                .catch(
                    (error) => {
                        console.log(error)
                        setPending(false)
                    }
                )
        }

        const validCell = (rule: any, value: any, callback: any, index: any) => {
            const content = form.getFieldValue('var')
            const param = content[index]
            if ((param.name !== '' && param.val !== '' && param.des !== '') || (param.name === '' && param.val === '' && param.des === '')) {
                callback()
                return
            } else {
                if (value == '') {
                    callback(formatMessage({ id: 'please.enter' }));
                    return
                }
            }
            callback()
        }

        const validFunction = (rule: any, value: any, callback: any) => {
            try {
                const valid = JSON.parse(value)
                if (Object.prototype.toString.call(valid) === '[object Array]') {
                    const len = valid.length
                    for (let i = 0; i < len; i++) {
                        if (!(Object.prototype.toString.call(valid[i]) === '[object Object]')) {
                            callback(formatMessage({ id: 'TestSuite.data.format.error' }));
                            return
                        }
                    }
                } else {
                    callback(formatMessage({ id: 'TestSuite.data.format.error' }));
                    return
                }
            } catch (e) {
                callback(formatMessage({ id: 'TestSuite.data.format.error' }));
                return
            }
            callback()
        }

        const handleChangeValueStyle = () => {
            const content = form.getFieldValue('var')
            if (!handle) {
                try {
                    const valid = JSON.parse(content)
                    if (Object.prototype.toString.call(valid) === '[object Array]') {
                        const len = valid.length
                        for (let i = 0; i < len; i++) {
                            if (!(Object.prototype.toString.call(valid[i]) === '[object Object]')) {
                                message.error(formatMessage({ id: 'TestSuite.data.format.error' }));
                                return
                            }
                        }
                    } else {
                        message.error(formatMessage({ id: 'TestSuite.data.format.error' }));
                        return
                    }
                } catch (e) {
                    message.error(formatMessage({ id: 'TestSuite.data.format.error' }));
                    return
                }
            }
            form.setFieldsValue({ var: handle ? JSON.stringify(content, null, 4) : JSON.parse(content) })
            setHandle(!handle)
        }

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                title={<FormattedMessage id={`confDrawer.title.${title}`} />}
                className={styles.warp}
                forceRender={true}
                destroyOnClose={true}
                width={376}
                onClose={handleCancel}
                open={visible}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div style={{ textAlign: 'right' }} >
                        <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                            <FormattedMessage id="operation.cancel" />
                        </Button>
                        <Button onClick={handleOk} type="primary" htmlType="submit">

                            {title.indexOf('new') > -1 ? <FormattedMessage id="operation.ok" /> : <FormattedMessage id="operation.update" />}
                        </Button>
                    </div>
                }
            >
                <Form
                    layout="vertical"
                    form={form}
                    initialValues={
                        !data.bentch ? {
                            repeat: query.test_type === 'performance' ? 3 : 1,
                            timeout: 3600,
                            is_default: 1,
                            var: [{ name: '', val: '', des: '' }],
                        } : {}
                    }
                >
                    <Row gutter={16}>
                        {
                            !data.bentch &&
                            <Col span={24}>
                                <Form.Item
                                    name="name"
                                    label="Test Conf"
                                    rules={[{ required: true, message: formatMessage({ id: 'please.enter' }) }]}
                                >
                                    <Input autoComplete="off" placeholder={formatMessage({ id: 'please.enter' })} />
                                </Form.Item>
                            </Col>
                        }
                        {
                            !data.bentch &&
                            <Col span={24}>
                                <Form.Item
                                    name="alias"
                                    label={<FormattedMessage id="TestSuite.alias" />}
                                    // rules={[{ required: true, message: '请输入' }]}
                                >
                                    <Input placeholder={formatMessage({ id: 'TestSuite.alias.placeholder' })} />
                                </Form.Item>
                            </Col>
                        }
                        <Col span={24}>
                            <Form.Item
                                name="domain_list_str"
                                label={<FormattedMessage id="TestSuite.domain" />}
                                rules={!data.bentch ? [{ required: true, message: formatMessage({ id: 'please.select' }) }] : []}
                            >
                                <Select
                                    placeholder={formatMessage({ id: 'please.select' })}
                                    mode="multiple"
                                    getPopupContainer={node => node.parentNode}
                                    options={
                                        domainList?.map((item: any) => ({
                                            value: item.id,
                                            label: item.name
                                        }))
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="timeout"
                                label={<FormattedMessage id="TestSuite.timeout" />}
                                rules={!data.bentch ? [{ required: true, message: formatMessage({ id: 'please.enter' }) }] : []}
                            >
                                <InputNumber style={{ width: '100%' }} min={0} step={1} placeholder={formatMessage({ id: 'please.enter' })} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="repeat"
                                label={<FormattedMessage id="TestSuite.repeat" />}
                            // rules={!data.bentch ? [{ required: true, message: formatMessage({ id: 'please.enter' }) }] : []}
                            >
                                <InputNumber style={{ width: '100%' }} min={1} step={1} placeholder={formatMessage({ id: 'please.enter' })} />
                            </Form.Item>
                        </Col>
                        {
                            !data.bentch &&
                            <Col span={24}>
                                <Button
                                    style={{ position: 'absolute', right: 0, zIndex: 99 }}
                                    type="link"
                                    size="small"
                                    onClick={handleChangeValueStyle}
                                >
                                    {handle ? 'Bulk Edit' : 'Key-Value Edit'}
                                </Button>
                                {
                                    !handle ?
                                        <Form.Item
                                            name="var"
                                            label={<FormattedMessage id="TestSuite.var" />}
                                            rules={[{ validator: validFunction }]}
                                        >
                                            <Input.TextArea rows={4} style={{ width: '100%' }} placeholder="格式：key=value, description，多个换行" />
                                        </Form.Item>
                                        :
                                        <Form.List name="var" >
                                            {(fields, { add, remove }) => {
                                                return (
                                                    <div>
                                                        {fields.map((field: any, index: any) => (
                                                            <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="start">
                                                                <Form.Item
                                                                    label={index == 0 ? <FormattedMessage id="TestSuite.var" /> : null}
                                                                    {...field}
                                                                    name={[field.name, 'name']}
                                                                    fieldKey={[field.fieldKey, 'name']}
                                                                    rules={[{
                                                                        validator(rule, value, callback) {
                                                                            validCell(rule, value, callback, index)
                                                                        },
                                                                    }]}
                                                                >
                                                                    <Input autoComplete="off" placeholder={formatMessage({ id: 'TestSuite.variable.name' })} />
                                                                </Form.Item>
                                                                <div style={{ paddingTop: index == 0 ? '33px' : '0' }}>=</div>
                                                                <Form.Item
                                                                    label={index == 0 ? " " : null}
                                                                    {...field}
                                                                    name={[field.name, 'val']}
                                                                    fieldKey={[field.fieldKey, 'val']}
                                                                // rules={[{
                                                                //     validator(rule, value, callback) { validCell(rule, value, callback, index) },
                                                                // }]}
                                                                >
                                                                    <Input autoComplete="off" placeholder={formatMessage({ id: 'TestSuite.default' })} />
                                                                </Form.Item>
                                                                <div style={{ paddingTop: index == 0 ? '38px' : '0' }}>,</div>
                                                                <Form.Item
                                                                    label={index == 0 ? " " : null}
                                                                    {...field}
                                                                    name={[field.name, 'des']}
                                                                    fieldKey={[field.fieldKey, 'des']}
                                                                >
                                                                    <Input autoComplete="off" placeholder={formatMessage({ id: 'TestSuite.var.desc' })} />
                                                                </Form.Item>

                                                                {fields.length > 1 ?
                                                                    <div style={{ paddingTop: index == 0 ? '30px' : '0' }}>
                                                                        <DeleteOutlined
                                                                            className="dynamic-delete-button"
                                                                            style={{ margin: '8px 0' }}
                                                                            onClick={() => {
                                                                                remove(field.name);
                                                                            }}
                                                                        />
                                                                    </div> :
                                                                    <div style={{ width: '14px' }}> </div>
                                                                }
                                                            </Space>
                                                        ))}

                                                        <Button
                                                            style={{ width: 100, padding: 0, textAlign: 'left', marginBottom: 8 }}
                                                            type="link"
                                                            size="small"
                                                            onClick={() => {
                                                                const content = form.getFieldValue('var')
                                                                content.push({ name: '', val: '', des: '' })
                                                                form.setFieldsValue({ var: content })
                                                            }}
                                                            block
                                                        >
                                                            + <FormattedMessage id="TestSuite.var.add" />
                                                        </Button>

                                                    </div>
                                                );
                                            }}
                                        </Form.List>
                                }
                            </Col>
                        }
                        {
                            !data.bentch &&
                            <Col span={24}>
                                <Form.Item
                                    name="is_default"
                                    label={<FormattedMessage id="TestSuite.default.case" />}
                                    rules={[{ required: true, message: formatMessage({ id: 'please.select' }) }]}
                                >
                                    <Radio.Group>
                                        <Radio value={1}><FormattedMessage id="operation.yes" /></Radio>
                                        <Radio value={0}><FormattedMessage id="operation.no" /></Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                        }
                        {
                            !data.bentch &&
                            <Col span={24}>
                                <Form.Item
                                    name="certificated"
                                    label={
                                        <span>
                                            <FormattedMessage id="TestSuite.is_certified" />&nbsp;
                                            <Popover
                                                overlayClassName={styles.cer_tips}
                                                content={
                                                    <div>
                                                        <p><FormattedMessage id="TestSuite.is_certified.ps" /></p>
                                                    </div>
                                                }
                                                placement="bottomLeft"
                                                destroyTooltipOnHide={true}>
                                                <QuestionCircleOutlined />
                                            </Popover>
                                        </span>
                                    }
                                    rules={[{ required: true, message: formatMessage({ id: 'please.select' }) }]}
                                >
                                    <Radio.Group>
                                        <Radio value={1}><FormattedMessage id="operation.yes" /></Radio>
                                        <Radio value={0}><FormattedMessage id="operation.no" /></Radio>

                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                        }
                        {
                            !data.bentch &&
                            <Col span={24}>
                                <Form.Item
                                    name="description"
                                    label={<FormattedMessage id="TestSuite.desc" />}
                                >
                                    <Input.TextArea rows={4} placeholder={formatMessage({ id: 'TestSuite.desc.placeholder' })} />
                                </Form.Item>
                            </Col>
                        }
                    </Row>
                </Form>
            </Drawer>
        )
    }
)