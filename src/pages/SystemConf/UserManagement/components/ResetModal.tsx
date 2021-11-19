import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Row, Modal, Space, Typography } from 'antd'

type Intro = { username?: string; password?: string }
const ResetModal: React.ForwardRefRenderFunction<{}, {}> = (props, ref) => {
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
            title={title || '重置密码成功'}
            visible={visible}
            onCancel={handleCancel}
            okText="确定"
            onOk={handleCancel}
            width={'40%'}
        >
            <Row style={{ padding: 30 }}>
                <Space direction="vertical">
                    <Space>
                        <Typography.Text>用户名</Typography.Text>
                        <Typography.Text>{intro?.username}</Typography.Text>
                    </Space>
                    <Space align="center">
                        <Typography.Text>新密码</Typography.Text>
                        <Typography.Paragraph style={{ marginBottom: 0 }} copyable={{ text: intro.password }}>{intro?.password}</Typography.Paragraph>
                    </Space>
                </Space>
            </Row>
        </Modal>
    )
}

export default forwardRef(ResetModal)