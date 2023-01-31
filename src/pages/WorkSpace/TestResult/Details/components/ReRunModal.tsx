import React, { forwardRef, useImperativeHandle, useState } from 'react'

import { Modal, Row, Col, Form, Checkbox } from 'antd'
import styled from 'styled-components'
import { useParams, FormattedMessage } from 'umi'
import { stringify } from 'querystring'
import { targetJump } from '@/utils/utils'

const reRunCheckedText = 'reRun.checked.inheriting_machine'

const Content = styled(Modal)`
    .ant-modal-body {
        background-color: #f0f2f5;
        padding: 0;
    }

    .ant-form-item {
        margin-bottom: 0;
    }
`

const ReRunModal = (props: any, ref: any) => {
    const { ws_id } = useParams<any>()

    const [visible, setVisible] = useState(false)
    const [source, setSource] = useState<any>(null)
    // 重跑选项之一
    const [reRunChecked, setReRunChecked] = useState(false)
    
    const hanldeCancle = () => {
        setVisible(false)
        setReRunChecked(false)
        setSource(null)
        form.resetFields()
    }

    const [okLink, setOkLink] = React.useState<string | null>(null)

    const hanldeOk = () => {
        form
            .validateFields()
            .then(values => {
                let obj: any = {}
                Object.keys(values).forEach(
                    key => {
                        if (values[key]) {
                            obj[key === "fail_case" ? "suite" : key] = key === "fail_case" ? "fail" : 1
                        }
                    }
                )
                const search = JSON.stringify(obj) !== '{}' ? `?${stringify(obj)}` : ''

                setOkLink(`/ws/${ws_id}/test_job/${source.id}/import${search}`)
                hanldeCancle()
            })
    }

    const afterClose = () => {
        okLink && targetJump(okLink)
    }

    const [form] = Form.useForm()

    const fail_case = Form.useWatch('fail_case', form);
    const suite = Form.useWatch('suite', form);

    useImperativeHandle(ref, () => ({
        show(_: any) {
            _ && setSource(_)
            setVisible(true)
            setOkLink(null)
        }
    }))

    React.useEffect(() => {
        setReRunChecked(suite || fail_case)
    }, [fail_case, suite])

    return (
        <Content
            visible={visible}
            width={487}
            title={<FormattedMessage id="ws.result.list.reRun.Modal.title" />}
            okText={<FormattedMessage id="operation.confirm" />}
            cancelText={<FormattedMessage id="operation.cancel" />}
            onOk={hanldeOk}
            onCancel={hanldeCancle}
            maskClosable={false}
            afterClose={afterClose}
        >
            <Row style={{ backgroundColor: '#fff', height: 66, marginBottom: 10, paddingLeft: 20 }} align="middle" >
                <Col span={4} style={{ color: 'rgba(0,0,0,0.85)', fontWeight: 600 }}>
                    <FormattedMessage id="ws.result.list.name" />
                </Col>
                <Col span={18}>{source?.name}</Col>
            </Row>
            <Row style={{ backgroundColor: '#fff', paddingLeft: 20 }} align="middle">
                <Form form={form}>
                    <Form.Item valuePropName="checked" name="suite">
                        <Checkbox
                            onChange={({ target }: any) => {
                                const { checked } = target
                                if (checked)
                                    form.setFieldsValue({ fail_case: false })
                                else
                                    form.setFieldsValue({ inheriting_machine: false })
                            }}
                        >
                            <FormattedMessage id="ws.result.list.reRun.checked.suite" />
                        </Checkbox>
                    </Form.Item>
                    {
                        source?.test_type === "功能测试" &&
                        <Form.Item valuePropName="checked" name="fail_case">
                            <Checkbox
                                onChange={({ target }: any) => {
                                    const { checked } = target
                                    if (checked)
                                        form.setFieldsValue({ suite: false })
                                    else
                                        form.setFieldsValue({ inheriting_machine: false })
                                }}
                            ><FormattedMessage id="ws.result.list.reRun.checked.fail_case" /></Checkbox>
                        </Form.Item>
                    }
                    <Form.Item valuePropName="checked" name="notice">
                        <Checkbox><FormattedMessage id="ws.result.list.reRun.checked.notice" /></Checkbox>
                    </Form.Item>
                    <Form.Item valuePropName="checked" name="inheriting_machine">
                        <Checkbox
                            disabled={!reRunChecked}
                        >
                            <FormattedMessage id={`ws.result.list.reRun.checked.inheriting_machine`} />
                        </Checkbox>
                    </Form.Item>
                </Form>
            </Row>
        </Content>
    )
}

export default forwardRef(ReRunModal)