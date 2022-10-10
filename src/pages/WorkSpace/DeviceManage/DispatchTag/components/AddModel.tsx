import React from 'react'
import { Drawer, Button, Form, Input, message } from 'antd'
import ColorPicker from './ColorPicker';
import { addTag, editTag } from '../service';
import { useParams, useIntl, FormattedMessage } from 'umi'

const nameReg = /^[A-Za-z0-9\._-]{0,32}$/

const AddModel: React.ForwardRefRenderFunction<{}, { callback: () => void }> = ({ callback }, ref) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any

    const [form] = Form.useForm();

    const [visible, setVisible] = React.useState<boolean>(false)
    const [fetching, setFetching] = React.useState<boolean>(false)
    const [dataSet, setDataSet] = React.useState<any>({})

    React.useImperativeHandle(ref, () => ({
        show(data: any) {
            if (data) {
                setDataSet(data ? data : {})
                form.setFieldsValue(data)
            }
            setVisible(true)
        }
    }))

    React.useEffect(() => {
        () => {
            handleClose()
        }
    }, [])

    const handleClose = () => {
        setDataSet({})
        setVisible(false)
        setFetching(false)
        form.resetFields()
    }

    const onSuiteSubmit = () => {
        if (fetching) {
            return
        }
        setFetching(true)
        form
            .validateFields()
            .then(
                async (values) => {
                    const params = { ws_id, ...values }
                    const { code, msg }: any = dataSet.id ? await editTag(dataSet.id, params) : await addTag(params)
                    if (code !== 200) {
                        setFetching(false)
                        message.error(msg)
                        return
                    }
                    message.success(formatMessage({id: 'operation.success'}) );
                    callback()
                    handleClose()
                }
            ).catch(err => {
                setFetching(false)
            })
    }

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title={dataSet.id ? <FormattedMessage id="device.edit.tag"/>: <FormattedMessage id="device.create.tag"/>}
            width={376}
            onClose={handleClose}
            visible={visible}
            bodyStyle={{ paddingBottom: 80 }}
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Button onClick={handleClose} style={{ marginRight: 8 }}>
                        <FormattedMessage id="operation.cancel"/>
                    </Button>
                    <Button onClick={onSuiteSubmit} type="primary" htmlType="submit" >
                        {dataSet.id ? <FormattedMessage id="operation.update"/>: <FormattedMessage id="operation.ok"/>}
                    </Button>
                </div>
            }
        >
            <Form
                layout="vertical"
                form={form}
                initialValues={{
                    tag_color: 'rgb(255,157,78,1)'
                }}
            >
                <Form.Item
                    name="tag_color"
                    label={<FormattedMessage id="device.tag_color"/>}
                    rules={[{ required: true, message: formatMessage({id: 'please.select'}) }]}
                >
                    <ColorPicker />
                </Form.Item>
                <Form.Item
                    name="name"
                    label={<FormattedMessage id="device.tag.name"/>}
                    rules={[
                        {
                            validator(rule, value) {
                                if (!value) return Promise.reject(formatMessage({id: 'device.tag.name.message'}) )
                                if (!value.replace(/\s+/g, "")) return Promise.reject(formatMessage({id: 'device.tag.name.message'}) )
                                if (!nameReg.test(value)) return Promise.reject(formatMessage({id: 'device.name.message'}) )
                                return Promise.resolve()
                            }
                        }
                    ]}
                >
                    <Input
                        placeholder={formatMessage({id: 'please.select'}) }
                        autoComplete="off"
                    />
                </Form.Item>
                <Form.Item
                    name="description"
                    label={<FormattedMessage id="device.description"/>}
                >
                    <Input.TextArea rows={3} placeholder={formatMessage({id: 'device.description.placeholder'}) } />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default React.forwardRef(AddModel)