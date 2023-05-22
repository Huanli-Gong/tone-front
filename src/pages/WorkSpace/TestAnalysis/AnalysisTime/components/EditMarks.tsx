import { requestCodeMessage } from '@/utils/utils'
import { Drawer, Space, Button, Form, Row, Input, Typography } from 'antd'
import { useState, forwardRef, useImperativeHandle } from 'react'
import { useIntl, FormattedMessage } from 'umi'
import { updateAnalysisNote } from '../services'

//编辑备注
export default forwardRef(
    (props: any, ref: any) => {
        const { formatMessage } = useIntl()
        const { show_type, test_type, onOk } = props
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)
        const [data, setData] = useState<any>({ suite_name: '', conf_name: '' })
        const [padding, setPadding] = useState(false)

        const handleClose = () => {
            setVisible(false)
            setData(undefined)
            setPadding(false)
            form.resetFields()
        }

        useImperativeHandle(
            ref, () => ({
                show: (_: any = false) => {
                    console.log(_)
                    setVisible(true)
                    if (_ !== false) {
                        setData(_)
                        form.setFieldsValue({ note: _.note })
                    }
                },
                hide: handleClose
            })
        )

        const handleOk = () => {
            if (padding) return
            setPadding(true)
            form
                .validateFields()
                .then(
                    async (values: any) => {
                        const { note } = values
                        let editor_obj = 'perf_analysis'
                        if (test_type !== 'performance') {
                            editor_obj = 'func_case_analysis'
                            if (show_type === 'pass_rate') {
                                editor_obj = 'func_conf_analysis'
                            }
                        }
                        const params: any = {
                            editor_obj,
                            note
                        }

                        if (test_type === "performance") {
                            params.test_job_id = data.job_id
                        }
                        else {
                            params.result_obj_id = data.result_obj_id
                        }

                        const { code, msg } = await updateAnalysisNote(params)
                        setPadding(false)
                        if (code !== 200) return requestCodeMessage(code, msg)
                        onOk()
                        handleClose()
                    }
                )
                .catch((err) => {
                    console.log(err)
                    setPadding(false)
                })
        }

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                width={376}
                title={<FormattedMessage id="analysis.edit.note" />}
                open={visible}
                onClose={handleClose}
                bodyStyle={{ padding: 0 }}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                            <Button type="primary" onClick={handleOk}><FormattedMessage id="operation.update" /></Button>
                        </Space>
                    </div>
                }
            >
                {
                    data &&
                    <Row style={{ marginBottom: 10, background: '#fff', padding: 20, borderBottom: '10px solid #f0f2f5' }}>
                        <Typography.Text style={{ width: 70, fontWeight: 600, marginRight: 8 }}><FormattedMessage id="analysis.job.name" /></Typography.Text>
                        <Typography.Paragraph style={{ width: "calc( 100% - 70px - 8px)", marginBottom: 0 }} ellipsis>{data.job_name}</Typography.Paragraph>
                    </Row>
                }
                <Form
                    form={form}
                    layout="vertical"
                    /*hideRequiredMark*/
                    style={{ background: '#fff', padding: 20, height: 'calc( 100% - 94px )' }}
                >
                    <Form.Item label={<FormattedMessage id="analysis.annotations" />} name="note">
                        <Input.TextArea rows={8} placeholder={formatMessage({ id: 'analysis.annotations.placeholder' })} />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)