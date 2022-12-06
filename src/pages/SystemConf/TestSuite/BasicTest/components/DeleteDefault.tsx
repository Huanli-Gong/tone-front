import React from "react"
import { Modal, Button, Typography, Space } from "antd"
import { FormattedMessage } from "umi"
import { ExclamationCircleOutlined } from "@ant-design/icons"

type Iprops = AnyType
type IRefs = AnyType

const DeleteTip: React.ForwardRefRenderFunction<IRefs, Iprops> = (props, ref) => {
    const { onOk } = props

    const [visible, setVisible] = React.useState(false)
    const [setting, setSetting] = React.useState<any>()

    React.useImperativeHandle(ref, () => ({
        show(_: AnyType) {
            _ && setSetting(_)
            setVisible(true)
        }
    }))

    const handleOk = () => {
        onOk?.(setting)
        setVisible(false)
    }

    const hanldeCancel = () => {
        setVisible(false)
    }

    return (
        <Modal
            destroyOnClose
            title={<FormattedMessage id="delete.tips" />}
            centered={true}
            visible={visible}
            onCancel={hanldeCancel}
            footer={[
                <Button key="submit" onClick={handleOk} type="danger">
                    <FormattedMessage id="operation.confirm.delete" />
                </Button>,
                <Button key="back" type="primary" onClick={hanldeCancel}>
                    <FormattedMessage id="operation.cancel" />
                </Button>
            ]}
            width={300}
        >
            <Typography.Text type="danger">
                <Space align="center">
                    <ExclamationCircleOutlined />
                    <FormattedMessage id="delete.prompt" />
                </Space>
            </Typography.Text>
        </Modal>
    )
}

export default React.forwardRef(DeleteTip)