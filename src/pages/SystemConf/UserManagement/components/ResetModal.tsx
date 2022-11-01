import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Row, Modal, Space, Typography } from 'antd'
import { useIntl, FormattedMessage } from 'umi';

type Intro = { username?: string; password?: string }
const ResetModal: React.ForwardRefRenderFunction<{}, {}> = (props, ref) => {
    const { formatMessage } = useIntl()
    const [intro, setIntro] = useState<Intro>({})
    const [visible, setVisible] = useState(false)
    const [title, setTitle] = useState<string>('')

    useImperativeHandle(ref, () => ({
        show(intro: Intro, title?: any) {
            setIntro(intro)
            setVisible(true)
            title && setTitle(title)
        }
    }))

    const handleCancel = () => {
        setIntro({})
        setVisible(false)
        setTitle('')
    }

    return (
        <Modal
            title={title || <FormattedMessage id="operation.reset.password.succeeded"/>}
            visible={visible}
            onCancel={handleCancel}
            okText={<FormattedMessage id="operation.ok"/>}
            footer={false}
            onOk={handleCancel}
            width={'40%'}
        >
            <Row style={{ padding: 30 }}>
                <Space direction="vertical">
                    <Space>
                        <Typography.Text><FormattedMessage id="user.username"/></Typography.Text>
                        <Typography.Text>{intro?.username}</Typography.Text>
                    </Space>
                    <Space align="center">
                        <Typography.Text><FormattedMessage id="user.new.password"/></Typography.Text>
                        <Typography.Paragraph style={{ marginBottom: 0 }} copyable={{ text: intro.password }}>{intro?.password}</Typography.Paragraph>
                    </Space>
                </Space>
            </Row>
        </Modal>
    )
}

export default forwardRef(ResetModal)