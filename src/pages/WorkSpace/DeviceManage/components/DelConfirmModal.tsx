import React from "react"

import { Modal, Button, Typography, Space } from "antd"
import { useIntl, FormattedMessage } from "umi"
import { ExclamationCircleOutlined } from "@ant-design/icons"

const DelConfirmModal: React.ForwardRefRenderFunction<AnyType, AnyType> = (props, ref) => {

    const intl = useIntl()
    const { onOk } = props

    const [open, setOpen] = React.useState(false)
    const [source, setSource] = React.useState([])
    const [words, setWords] = React.useState("")

    const defaultOptionFun = () => {
        setOpen(false)
        setWords("")
        setSource([])
    }

    const handleCancel = () => {
        defaultOptionFun()
    }

    const handleOk = () => {
        onOk?.(source)
        handleCancel()
    }

    React.useEffect(() => {
        return () => {
            defaultOptionFun()
        }
    }, [])

    React.useImperativeHandle(ref, () => ({
        show: (row: any, str: string) => {
            setWords(str)
            setSource(row)
            setOpen(true)
        }
    }))

    return (
        <Modal
            title={<FormattedMessage id="delete.tips" />}
            centered={true}
            open={open}
            onCancel={handleCancel}
            footer={[
                <Button key="submit" onClick={handleOk}>
                    <FormattedMessage id="operation.confirm.delete" />
                </Button>,
                <Button key="back" type="primary" onClick={handleCancel}>
                    <FormattedMessage id="operation.cancel" />
                </Button>
            ]}
            width={300}
        >
            <Space>
                <Typography.Text type="danger">
                    <ExclamationCircleOutlined />
                </Typography.Text>

                <Typography.Text type="danger">
                    {
                        intl.formatMessage({
                            id: "delete.prompt",
                        }, {
                            data: words
                        })
                    }
                </Typography.Text>
            </Space>
        </Modal>
    )
}

export default React.forwardRef(DelConfirmModal)