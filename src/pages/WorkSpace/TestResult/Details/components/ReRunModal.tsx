import React, { forwardRef, useImperativeHandle, useState } from 'react'

import { Modal, Row, Col, Form, Checkbox } from 'antd'
import styled from 'styled-components'
import { useParams, useIntl, FormattedMessage  } from 'umi'
import { stringify } from 'querystring'
import { reRunCheckedText } from '../../index'
import { targetJump } from '@/utils/utils'

const Content = styled(Modal)`
    .ant-modal-body {
        background-color: #f0f2f5;
        height: 169px;
        padding: 0;
    }

    .ant-form-item {
        margin-bottom: 0;
    }
`

const ReRunModal = (props: any, ref: any) => {
    const { formatMessage } = useIntl()
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
                        if (values[key])
                            obj[key] = 1
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

    useImperativeHandle(ref, () => ({
        show(_: any) {
            _ && setSource(_)
            setVisible(true)
            setOkLink(null)
        }
    }))

    return (
        <Content
            visible={visible}
            width={487}
            title="导入配置"
            okText={<FormattedMessage id="operation.confirm"/>}
            cancelText={<FormattedMessage id="operation.cancel"/>}
            onOk={hanldeOk}
            onCancel={hanldeCancle}
            maskClosable={false}
            afterClose={afterClose}
        >
            <Row style={{ backgroundColor: '#fff', height: 66, marginBottom: 10, paddingLeft: 20 }} align="middle" >
                <Col span={4} style={{ color: 'rgba(0,0,0,0.85)', fontWeight: 600 }}>Job名称</Col>
                <Col span={18}>{source?.name}</Col>
            </Row>
            <Row style={{ backgroundColor: '#fff', height: 93, paddingLeft: 20 }} align="middle">
                <Form form={form}>
                    <Form.Item valuePropName="checked" name="suite">
                        <Checkbox
                            onChange={(e: any) => {
                                const { checked } = e.target
                                setReRunChecked(checked)
                                if (!checked) form.setFieldsValue({ inheriting_machine: false })
                            }}>
                            同时导入测试用例
                        </Checkbox>
                    </Form.Item>
                    <Form.Item valuePropName="checked" name="notice">
                        <Checkbox>同时导入通知配置</Checkbox>
                    </Form.Item>
                    <Form.Item valuePropName="checked" name="inheriting_machine">
                        <Checkbox disabled={!reRunChecked}>{formatMessage({ id: reRunCheckedText })}</Checkbox>
                    </Form.Item>
                </Form>
            </Row>
        </Content>
    )
}

export default forwardRef(ReRunModal)