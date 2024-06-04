import { Button, Col, Form, Input, Row, message } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { getBootSetting, updateBootSetting } from '../Knowledge/services'
import { useIntl } from 'umi'

const ContentCls = styled(Row)`
    width: 100%;
`

const BootSetting: React.FC = () => {
    const { formatMessage } = useIntl()
    const [form] = Form.useForm()

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields()
            const { code, msg } = await updateBootSetting(values)
            if (code !== 200) {
                form.setFields([{ name: 'problem_type', errors: [msg] }])
                return
            }
            message.success(formatMessage({ id: 'operation.success' }))
        }
        catch (err) {

        }
    }

    const init = async () => {
        const { data, code } = await getBootSetting()
        if (code !== 200) {
            return
        }
        form.setFieldsValue(data)
    }

    React.useEffect(() => {
        init()
    }, [])

    return (
        <ContentCls>
            <Col span={12}>
                <Form
                    form={form}
                    layout='vertical'
                >
                    <Form.Item
                        name={'problem_type'}
                        label={'分类配置'}
                    >
                        <Input.TextArea autoSize={{ minRows: 2 }} allowClear />
                    </Form.Item>
                    <Form.Item
                        name={'problem_attribution'}
                        label={'属性配置'}
                    >
                        <Input.TextArea autoSize={{ minRows: 2 }} allowClear />
                    </Form.Item>
                    <Form.Item
                        name={'group_link'}
                        label={'反馈群二维码链接'}
                    >
                        <Input.TextArea autoSize={{ minRows: 2 }} allowClear />
                    </Form.Item>
                    <Form.Item
                        name={'ding_token'}
                        label={'钉钉Token配置'}
                    >
                        <Input.TextArea autoSize={{ minRows: 2 }} allowClear />
                    </Form.Item>
                </Form>
                <Row justify={'end'}>
                    <Button onClick={handleUpdate} type='primary'>
                        更新
                    </Button>
                </Row>
            </Col>
        </ContentCls>
    )
}

export default BootSetting