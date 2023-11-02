/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { Popover, Drawer, Button, Form, Row, Col, Input, Select, InputNumber, Space, Radio, message, Popconfirm, Typography } from 'antd'
import styles from '../../style.less'
import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { useLocation, useIntl, FormattedMessage } from 'umi'
import { useSuiteProvider } from '../../../hooks'
import { editBentch, editCase, addCase } from '@/pages/SystemConf/TestSuite/service'

const getVars = (vars: any) => {
    if (!vars) return '[]'
    let arr = vars
    if (Object.prototype.toString.call(vars) === '[object String]')
        arr = JSON.parse(vars)

    const vls = arr.filter((item: any) => {
        const ctx = Object.entries(item)
        const t = ctx.filter(([, val]) => !!val)
        if (t.length === ctx.length) return item
    })

    if (!!vls.length) return JSON.stringify(vls)
    return '[]'
}

const ConfEditDrawer: React.ForwardRefRenderFunction<AnyType, AnyType> = ({ onOk, selectedRowKeys }: any, ref: any) => {
    const { formatMessage } = useIntl()
    const { query }: any = useLocation()
    const basicData = {
        repeat: query.test_type === 'performance' ? 3 : 1,
        timeout: 3600,
        is_default: 1,
        var: [{ name: '', val: '', des: '' }]
    }
    const { domainList } = useSuiteProvider()
    const [form] = Form.useForm()

    const [visible, setVisible] = useState(false)
    const [title, setTitle] = useState('')
    const [handle, setHandle] = useState<boolean>(true)
    const [data, setData] = useState<any>({ batch: false })
    const [pending, setPending] = useState(false)

    const varField = Form.useWatch('var', form)

    console.log(varField)

    React.useEffect(() => {
        if (!varField?.length) form.setFieldValue('var', basicData.var)
    }, [varField])

    const handleCancel = () => {
        setData({ batch: false })
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
                if (!_.batch) {
                    const params: any = {
                        ...basicData,
                        ..._,
                        certificated: _.certificated ? 1 : 0,
                    }
                    if (domainList.length && ~t.indexOf('new')) {
                        domainList.forEach(({ id, name }: any) => {
                            if (name === '其他') params.domain_list_str = [id]
                        })
                    }
                    form.setFieldsValue(params)
                }
            },
            hide: handleCancel
        }),
    )

    const handleOk = () => {
        if (pending) return;
        setPending(true)
        form.validateFields()
            .then(
                async (values: any) => {
                    const { var: vars } = values
                    const { test_suite_id, id } = data

                    const param = {
                        ...values,
                        id,
                        test_suite_id,
                        domain_list_str: values.domain_list_str ? values.domain_list_str.join() : undefined
                    }
                    const varConf = getVars(vars)

                    if (data.batch) {
                        const params = {
                            ...param,
                            case_id_list: selectedRowKeys.join(','),
                            var: varConf ?? undefined
                        }
                        await editBentch(params)
                    }
                    else {
                        if (!varConf) {
                            setPending(false)
                            form.setFields([{ name: 'var', errors: [formatMessage({ id: 'TestSuite.data.format.error' })] }])
                            return
                        }

                        const { code, msg } = id ? await editCase(id, param) : await addCase(param)
                        if (code === 201) {
                            setPending(false)
                            form.setFields([{
                                name: 'name',
                                errors: [formatMessage({ id: 'TestSuite.repeated.suite.name' })]
                            }])
                            return
                        }

                        if (code !== 200) {
                            setPending(false)
                            form.setFields([{
                                name: 'name',
                                errors: [msg]
                            }])
                            return
                        }
                    }
                    handleCancel()
                    onOk()
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
        if ((param.name && param.val && param.des) || (param.name === '' && param.val === '' && param.des === '')) {
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

    const testVarFn = (val: any, callback: any) => {
        try {
            const valid = JSON.parse(val)
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
    }

    const validFunction = (rule: any, value: any, callback: any) => {
        testVarFn(value, callback)
        callback()
    }

    const handleChangeValueStyle = () => {
        const content = form.getFieldValue('var')
        if (!handle) {
            testVarFn(content, message.error)
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
                    {
                        data.batch ?
                            <Popconfirm
                                onConfirm={handleOk}
                                title={<FormattedMessage id="confDrawer.popconfirm.title" />}
                                okText={<FormattedMessage id="operation.ok" />}
                                cancelText={<FormattedMessage id="operation.cancel" />}
                                placement='rightTop'
                            >
                                <Button type="primary" loading={pending}>
                                    <FormattedMessage id="operation.ok" />
                                </Button>
                            </Popconfirm> :
                            <Button onClick={handleOk} type="primary" htmlType="submit" loading={pending}>
                                {
                                    title.indexOf('new') > -1 ?
                                        <FormattedMessage id="operation.ok" /> :
                                        <FormattedMessage id="operation.update" />
                                }
                            </Button>
                    }
                </div>
            }
        >
            <Form
                layout="vertical"
                form={form}
                initialValues={{
                    var: [{ name: '', val: '', des: '' }]
                }}
            >
                <Row gutter={16}>
                    {
                        !data.batch &&
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
                        !data.batch &&
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
                            rules={!data.batch ? [{ required: true, message: formatMessage({ id: 'please.select' }) }] : []}
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
                            rules={!data.batch ? [{ required: true, message: formatMessage({ id: 'please.enter' }) }] : []}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} step={1} placeholder={formatMessage({ id: 'please.enter' })} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="repeat"
                            label={<FormattedMessage id="TestSuite.repeat" />}
                        // rules={!data.batch ? [{ required: true, message: formatMessage({ id: 'please.enter' }) }] : []}
                        >
                            <InputNumber style={{ width: '100%' }} min={1} step={1} placeholder={formatMessage({ id: 'please.enter' })} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Row justify={'space-between'} align={'middle'} style={{ marginBottom: 8 }}>
                            <FormattedMessage id="TestSuite.var" />
                            <Button
                                style={{ position: 'absolute', right: 0, zIndex: 99 }}
                                type="link"
                                size="small"
                                onClick={handleChangeValueStyle}
                            >
                                {handle ? 'Bulk Edit' : 'Key-Value Edit'}
                            </Button>
                        </Row>
                        {
                            !handle ?
                                <Form.Item
                                    name="var"
                                    rules={[{ validator: validFunction }]}
                                >
                                    <Input.TextArea rows={4} style={{ width: '100%' }} placeholder="格式：key=value, description，多个换行" />
                                </Form.Item>
                                :
                                <Form.List name="var" >
                                    {(fields, { add, remove }) => {
                                        console.log(fields)
                                        return (
                                            <Space direction='vertical'>
                                                {fields.map((field: any, index: any) => (
                                                    <Space key={field.key} align="start" direction='vertical'>
                                                        <Space align='center'>
                                                            <Form.Item
                                                                name={[field.name, 'name']}
                                                                rules={[{
                                                                    validator(rule, value, callback) {
                                                                        validCell(rule, value, callback, index)
                                                                    },
                                                                }]}
                                                            >
                                                                <Input autoComplete="off" placeholder={formatMessage({ id: 'TestSuite.variable.name' })} />
                                                            </Form.Item>
                                                            <Typography.Text >=</Typography.Text>
                                                            <Form.Item name={[field.name, 'val']} >
                                                                <Input autoComplete="off" placeholder={formatMessage({ id: 'TestSuite.default' })} />
                                                            </Form.Item>
                                                            <Typography.Text >,</Typography.Text>
                                                            <Form.Item name={[field.name, 'des']} >
                                                                <Input autoComplete="off" placeholder={formatMessage({ id: 'TestSuite.var.desc' })} />
                                                            </Form.Item>
                                                            <DeleteOutlined
                                                                className="dynamic-delete-button"
                                                                style={{ margin: '8px 0' }}
                                                                onClick={() => remove(field.name)}
                                                            />
                                                        </Space>
                                                    </Space>
                                                ))}

                                                <Button
                                                    style={{ width: 100, padding: 0, textAlign: 'left', marginBottom: 8 }}
                                                    type="link"
                                                    size="small"
                                                    onClick={() => add({ name: '', val: '', des: '' })}
                                                    block
                                                >
                                                    <Space>
                                                        + <FormattedMessage id="TestSuite.var.add" />
                                                    </Space>
                                                </Button>
                                            </Space>
                                        );
                                    }}
                                </Form.List>
                        }
                    </Col>
                    {
                        !data.batch &&
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
                        !data.batch &&
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
                        !data.batch &&
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

export default forwardRef(ConfEditDrawer)