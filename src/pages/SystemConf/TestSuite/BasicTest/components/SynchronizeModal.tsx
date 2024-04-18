/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from "react"
import { Modal, Button, Typography, Space } from "antd"
import { FormattedMessage, useIntl } from "umi"
import { ExclamationCircleOutlined } from "@ant-design/icons"
import { saveRefenerceData } from "@/utils/utils"

const SynchronizeModal = (props: any, ref: any) => {
  const { formatMessage } = useIntl()
    const [visible, setVisible] = React.useState(false)
    const [setting, setSetting] = React.useState<any>()

    React.useImperativeHandle(ref, () => ({
        show(_: any) {
            _ && setSetting(_)
            setVisible(true)
        }
    }))

    const handleOk = () => {
      props?.onOk(setting)
      setVisible(false)
      setSetting(null)
    }

    const handleCancel = () => {
        setVisible(false)
        setSetting(null)
    }

    const handleOpenRef = async () => {
      if (!setting) return
      const { name, id, delete_temp_case_id_list } = setting
      const case_id_list = delete_temp_case_id_list?.join()
      const pk = await saveRefenerceData({ name, id })
      if (pk) window.open(`${props.basePath || "/refenerce/suite/"}?pk=${pk}${case_id_list? `&case_id_list=${case_id_list}`: ''}`)
    }

    return (
        <Modal
            destroyOnClose
            title={<FormattedMessage id="synchronize.details" defaultMessage="同步详情"/>}
            centered={true}
            open={visible}
            onCancel={handleCancel}
            footer={[
                // <Button key="submit" type="primary" onClick={handleOk}>
                //     <FormattedMessage id="operation.synchronizes" defaultMessage="强制同步"/>
                // </Button>,
                <Button key="back" onClick={handleCancel}>
                    <FormattedMessage id="operation.cancel" />
                </Button>
            ]}
            width={600}
        >
            <Space style={{ width: "100%" }} direction="vertical">
                <Typography.Text type="danger" >
                    <Space align="start">
                        <ExclamationCircleOutlined />
                        {setting?.msg || formatMessage({ id: 'TestSuite.suite.delete.warning' }, { data: setting?.name })}
                    </Space>
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

export default React.forwardRef(SynchronizeModal)