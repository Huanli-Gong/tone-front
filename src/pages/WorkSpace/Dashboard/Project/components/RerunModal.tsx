import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Modal, Row, Col, Form, Checkbox } from 'antd'
import { useParams, useIntl, FormattedMessage } from 'umi'
import { stringify } from 'querystring'

import styles from '@/pages/WorkSpace/TestResult/index.less'

const RerunModal = (props: any, ref: any) => {
    const { ws_id }: any = useParams()
    const [visible, setVisible] = useState(false)
    const [source, setSource] = useState<any>(null)

    const [ form ] = Form.useForm()

    const hanldeOk = () => {
        form.validateFields()
            .then((values: any) => {
                let obj: any = {}
                Object.keys(values).forEach(
                    key => {
                        if (values[key])
                            obj[key] = 1
                    }
                )
                const search = JSON.stringify(obj) !== '{}' ? `?${stringify(obj)}` : ''
                window.open(`/ws/${ws_id}/test_job/${source.id}/import${search}`)
            })
    }

    const hanldeCancle = () => {
        setSource(null)
        form.resetFields()
        setVisible(false)
    }

    useImperativeHandle(ref, () => ({
        show(_: any) {
            setSource(_)
            setVisible(true)
        }
    }), [])

    return (
        <Modal
            visible={visible}
            width={487}
            title={<FormattedMessage id="ws.dashboard.rerun.Modal.title" />}
            okText={<FormattedMessage id="operation.confirm" />}
            cancelText={<FormattedMessage id="operation.cancel" />}
            onOk={hanldeOk}
            onCancel={hanldeCancle}
            destroyOnClose
            className={styles.run_modal}
            maskClosable={false}
        >
            <Row style={{ backgroundColor: '#fff', height: 66, marginBottom: 10, paddingLeft: 20 }} align="middle" >
                <Col span={4} style={{ color: 'rgba(0,0,0,0.85)', fontWeight: 600 }}>
                    <FormattedMessage id="ws.dashboard.Modal.operation" />
                </Col>
                <Col span={18}>{source?.name}</Col>
            </Row>
            <Row style={{ backgroundColor: '#fff', height: 93, paddingLeft: 20 }} align="middle">
                <Form form={ form } >
                    <Form.Item valuePropName="checked" name="suite">
                        <Checkbox>
                            <FormattedMessage id="ws.dashboard.import.test.cases" />
                        </Checkbox>
                    </Form.Item>
                    <Form.Item valuePropName="checked" name="notice">
                        <Checkbox>
                            <FormattedMessage id="ws.dashboard.import.notification.config" />
                        </Checkbox>
                    </Form.Item>
                </Form>
            </Row>
        </Modal>
    )
}

export default forwardRef(RerunModal)