import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Modal, Row, Col, Form, Checkbox } from 'antd'
import { useParams } from 'umi'
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
            title="导入配置"
            okText="确认"
            cancelText="取消"
            onOk={hanldeOk}
            onCancel={hanldeCancle}
            destroyOnClose
            className={styles.run_modal}
            maskClosable={false}
        >
            <Row style={{ backgroundColor: '#fff', height: 66, marginBottom: 10, paddingLeft: 20 }} align="middle" >
                <Col span={4} style={{ color: 'rgba(0,0,0,0.85)', fontWeight: 600 }}>Job名称</Col>
                <Col span={18}>{source?.name}</Col>
            </Row>
            <Row style={{ backgroundColor: '#fff', height: 93, paddingLeft: 20 }} align="middle">
                <Form form={ form } >
                    <Form.Item valuePropName="checked" name="suite">
                        <Checkbox >同时导入测试用例</Checkbox>
                    </Form.Item>
                    <Form.Item valuePropName="checked" name="notice">
                        <Checkbox>同时导入通知配置</Checkbox>
                    </Form.Item>
                </Form>
            </Row>
        </Modal>
    )
}

export default forwardRef(RerunModal)