import { Input, Space, Typography, Form, Radio } from 'antd'
import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { useParams, FormattedMessage } from 'umi';
import { requestCodeMessage } from '@/utils/utils'
import { updatefuncsDetail } from '../services'
import { DrawerLayout, InfoRow, TableRow, ModalCls } from "./styled"

const EditCaseInfo: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { onOk } = props
    const { ws_id } = useParams() as any
    const [visible, setVisible] = useState(false)
    const [info, setInfo] = useState<any>({}) // 当前信息
    const [form] = Form.useForm()

    useImperativeHandle(
        ref,
        () => ({
            show: (item: any) => { // ref.current.show( currentObj ) 中的参数值
                setVisible(true)
                setInfo(item)
                form.setFieldsValue(item)
            }
        })
    )

    const handleCancel = () => {
        setVisible(false)
        setInfo({})
        form.resetFields() // 重置一组字段到 initialValues
    }

    const handleOk = async () => {
        form
            .validateFields()
            .then(
                async (values: any) => {
                    const { code, msg } = await updatefuncsDetail({
                        id: info.id,
                        ws_id,
                        ...values
                    })
                    if (code !== 200) {
                        requestCodeMessage(code, msg)
                        return
                    }
                    onOk?.()
                    handleCancel()
                }
            ).catch(errorInfo => {
                console.log(errorInfo)
            });
    }

    return (
        <ModalCls
            title={<FormattedMessage id="pages.workspace.baseline.comment.modal.title" />}
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={<FormattedMessage id="operation.confirm" />}
            cancelText={<FormattedMessage id="operation.cancel" />}
            maskClosable={false}
            wrapClassName={'editFailCaseModal'}
        >
            <DrawerLayout>
                <InfoRow>
                    <Space>
                        <Typography.Text strong>FailCase</Typography.Text>
                        <Typography.Text>{info?.sub_case_name || "-"}</Typography.Text>
                    </Space>
                </InfoRow>
                <TableRow>
                    <Form
                        form={form}
                        layout="vertical"
                        style={{ paddingTop: 20 }}
                    >
                        <Form.Item
                            label={<FormattedMessage id="pages.workspace.baseline.failDetail.table.bug" />}
                            name="bug"
                            rules={[{ required: true }]}
                        >
                            <Input autoComplete="off" />
                        </Form.Item>
                        <Form.Item
                            label={<FormattedMessage id="pages.workspace.baseline.failDetail.table.description" />}
                            name="description"
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>
                        <Form.Item
                            label={<FormattedMessage id="pages.workspace.baseline.failDetail.table.impact_result" />}
                            name="impact_result"
                            initialValue={info.impact_result}
                        >
                            <Radio.Group>
                                <Radio value={true}>
                                    <FormattedMessage id="operation.yes" />
                                </Radio>
                                <Radio value={false}>
                                    <FormattedMessage id="operation.no" />
                                </Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Form>
                </TableRow>
            </DrawerLayout>
        </ModalCls>
    )
}

export default forwardRef(EditCaseInfo)