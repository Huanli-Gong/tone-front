/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from "react"
import { Modal, Button, Typography, Space } from "antd"
import { FormattedMessage, useIntl } from "umi"
import { ExclamationCircleOutlined } from "@ant-design/icons"
import { saveRefenerceData } from "@/utils/utils"

type Iprops = AnyType
type IRefs = AnyType

const DeleteTip: React.ForwardRefRenderFunction<IRefs, Iprops> = (props, ref) => {
    const { onOk, basePath, onCancel } = props
    const { formatMessage } = useIntl()

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
        onCancel?.()
    }

    const handleOpenRef = async () => {
        if (!setting) return
        const { name, id } = setting
        const pk = await saveRefenerceData({ name, id })
        if (pk) window.open(`${basePath || "/refenerce/suite/"}?pk=${pk}`)
    }

    return (
        <Modal
            destroyOnClose
            title={<FormattedMessage id="delete.tips" />}
            centered={true}
            open={visible}
            onCancel={hanldeCancel}
            footer={[
                <Button key="submit" onClick={handleOk} type={"danger" as any}>
                    <FormattedMessage id="operation.confirm.delete" />
                </Button>,
                <Button key="back" type="primary" onClick={hanldeCancel}>
                    <FormattedMessage id="operation.cancel" />
                </Button>
            ]}
            width={600}
        >
            <Space style={{ width: "100%" }} direction="vertical">
                <Typography.Text type="danger" >
                    <Space align="start">
                        <ExclamationCircleOutlined />
                        {formatMessage({ id: 'TestSuite.suite.delete.warning' }, { data: setting?.name })}
                    </Space>
                </Typography.Text>
                <Typography.Text style={{ color: 'rgba(0,0,0,0.45)', }}>
                    <FormattedMessage id="TestSuite.suite.delete.range" />
                </Typography.Text>
                <Typography.Link
                    onClick={handleOpenRef}
                >
                    <FormattedMessage id="view.reference.details" />
                </Typography.Link>
            </Space>
        </Modal>
    )
}

export default React.forwardRef(DeleteTip)