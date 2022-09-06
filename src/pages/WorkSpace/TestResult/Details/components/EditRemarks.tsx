import { requestCodeMessage } from '@/utils/utils'
import { Drawer, Space, Button, Form, Row, Col, Input, Typography, message } from 'antd'
import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { updateNode } from '../service'
import { useParams, useIntl, FormattedMessage } from "umi"

//编辑备注

const EditRemark: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any

    const [visible, setVisible] = useState(false)
    const [data, setData] = useState<any>({ suite_name: '', conf_name: '' })
    const [padding, setPadding] = useState(false)
    const [form] = Form.useForm()

    useImperativeHandle(
        ref, () => ({
            show: (_: any = false) => {
                setVisible(true)
                if (_ !== false) {
                    setData(_)
                    form.setFieldsValue({ note: _.note })
                }
            }
        })
    )

    const handleClose = () => {
        setVisible(false)
        setData({ suite_name: '', conf_name: '' })
        setPadding(false)
        form.resetFields()
    }

    const handleOk = () => {
        if (padding) return
        form
            .validateFields()
            .then(
                async (values: any) => {
                    setPadding(true)
                    console.log(values, data)
                    let params: any = { ...values }
                    params.editor_obj = data.editor_obj
                    params.ws_id = ws_id
                    if (data.editor_obj === 'job') params.job_id = data.job_id
                    if (data.editor_obj === 'test_job_suite') params.test_job_suite_id = data.job_suite_id
                    if (data.editor_obj === 'test_job_conf') params.test_job_conf_id = data.id
                    if (data.editor_obj === 'test_job_case') params.test_job_case_id = data.id

                    const { msg, code } = await updateNode(params)
                    if (code === 200) {
                        props.onOk()
                        handleClose()
                        message.success(formatMessage({id: 'operation.success'}) )
                        return
                    }
                    setPadding(false)
                    return requestCodeMessage(code, msg)
                }
            )
            .catch(console.log)
    }

    const renderTitle: React.FC<any> = (name, title) => (
        title &&
        <Col span={24}>
            <Row>
                <Typography.Text style={{ width: 70, fontWeight: 600, marginRight: 8 }}>{name}</Typography.Text>
                <Typography.Paragraph style={{ width: "calc( 100% - 70px - 8px)" }} ellipsis>{title}</Typography.Paragraph>
            </Row>
        </Col>
    )

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            width="376"
            title={<FormattedMessage id="ws.result.details.edit.remarks"/>}
            visible={visible}
            onClose={handleClose}
            bodyStyle={{ padding: 0 }}
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleClose}><FormattedMessage id="operation.cancel"/></Button>
                        <Button type="primary" onClick={handleOk}><FormattedMessage id="operation.update"/></Button>
                    </Space>
                </div>
            }
        >
            {
                (data.suite_name || data.conf_name) &&
                <Row style={{ marginBottom: 10, background: '#fff', padding: 20, borderBottom: '10px solid #f0f2f5' }}>
                    {renderTitle('Test Suite', data.suite_name)}
                    {renderTitle('Test Conf', data.conf_name)}
                    {renderTitle('Test Case', data.case_name)}
                </Row>
            }
            <Form
                form={form}
                layout="vertical"
                /*hideRequiredMark*/
                style={{ background: '#fff', padding: 20, height: 'calc( 100% - 94px )' }}
            >
                <Form.Item label={<FormattedMessage id="ws.result.details.test_summary"/>}
                    name="note">
                    <Input.TextArea rows={8} 
                        placeholder={formatMessage({id: 'ws.result.details.please.enter.remarks'})}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default forwardRef(EditRemark)