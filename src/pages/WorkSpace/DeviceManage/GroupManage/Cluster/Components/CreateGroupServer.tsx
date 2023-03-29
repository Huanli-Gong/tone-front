import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { useIntl, FormattedMessage, useParams } from 'umi'
import { Drawer, Form, Input, Space, Button, message } from 'antd'
import { createServerGroup, updateServerGroup } from '../../services'
import Owner from '@/components/Owner/index'
import { requestCodeMessage } from '@/utils/utils'
import MachineTags from '@/components/MachineTags';

const CreateGroupDrawer = (props: any, ref: any) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams()
    const { onFinish } = props
    const [tagFlag, setTagFlag] = useState({
        list: [],
        isQuery: '',
    })
    const [padding, setPadding] = useState(false)
    const [visible, setVisible] = useState(false)
    const [source, setSource] = useState<any>(null)

    const [form] = Form.useForm()

    useImperativeHandle(ref, () => ({
        show(_: any) {
            setVisible(true)
            if (_) {
                setSource(_)
                let params = _
                const list = params.tag_list.map((i: any) => i.id)
                params.tags = list
                setTagFlag({ ...tagFlag, isQuery: 'edit', list })
                form.setFieldsValue(params)
            } else {
                setTagFlag({ ...tagFlag, isQuery: 'add', list: [] })
            }
        }
    }))

    const handleFinish = () => {
        setPadding(true)
        form
            .validateFields()
            .then(async (values: any) => {
                let data: any;
                if (!source)
                    data = await createServerGroup({
                        ...values,
                        cluster_type: 'aligroup',
                        ws_id
                    })
                else
                    data = await updateServerGroup(source.id, { ...values, ws_id })

                if (data.code === 200) {
                    message.success(formatMessage({ id: 'operation.success' }))
                    onFinish()
                    handleCancel()
                }
                else
                    requestCodeMessage(data.code, data.msg)
                setPadding(false)
            })
            .catch((err: any) => {
                console.log(err)
                setPadding(false)
            })
    }

    const handleCancel = () => {
        form.resetFields()
        setVisible(false)
        setSource(null)
    }

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title={!source ? <FormattedMessage id="device.cluster.btn" /> : <FormattedMessage id="device.cluster.edit" />}
            forceRender={true}
            visible={visible}
            onClose={handleCancel}
            width="376"
            destroyOnClose
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleCancel}><FormattedMessage id="operation.cancel" /></Button>
                        <Button type="primary" disabled={padding} onClick={handleFinish}>
                            {!source ? <FormattedMessage id="operation.ok" /> : <FormattedMessage id="operation.update" />}
                        </Button>
                    </Space>
                </div>
            }
        >
            <Form
                layout="vertical"
                /*hideRequiredMark*/
                form={form}
                name="createGroup"
            >
                <Form.Item name="name" label={<FormattedMessage id="device.cluster.name.s" />}
                    rules={[{
                        message: formatMessage({ id: 'device.cluster.name.s.message' }),
                        required: true
                    }]}>
                    <Input autoComplete="off" placeholder={formatMessage({ id: 'please.enter' })} />
                </Form.Item>
                {
                    visible &&
                    <Owner />
                }
                <MachineTags {...tagFlag} />
                <Form.Item name="description" label={<FormattedMessage id="device.description" />}>
                    <Input.TextArea
                        placeholder={formatMessage({ id: 'device.description.placeholder' })}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default forwardRef(CreateGroupDrawer)