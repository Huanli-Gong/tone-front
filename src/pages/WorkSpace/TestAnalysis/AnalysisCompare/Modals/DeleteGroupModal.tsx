import React from "react";
import { Modal, Row, Space, Button } from "antd";
import styles from "../index.less"
import { FormattedMessage } from "umi"

const DeleteGroupModal: React.ForwardRefRenderFunction<AnyType, AnyType> = (props, ref) => {
    const { onOk } = props

    const [visible, setVisible] = React.useState(false)
    const [group, setGroup] = React.useState<AnyType>()

    const handleCancel = () => {
        setVisible(false)
    }

    React.useImperativeHandle(ref, () => {
        return {
            show(row: AnyType) {
                setGroup(row)
                setVisible(true)
            }
        }
    })

    const handleOk = () => {
        onOk?.(group)
        setVisible(false)
    }

    return (
        <Modal
            title={<FormattedMessage id="delete.prompt" />}
            open={visible}
            width={480}
            className={styles.baseline_del_modal}
            destroyOnClose={true}
            onCancel={handleCancel}
            footer={
                <Row justify="end">
                    <Space>
                        <Button onClick={handleCancel}><FormattedMessage id="operation.cancel" /></Button>
                        <Button onClick={handleOk} type="primary" danger><FormattedMessage id="operation.delete" /></Button>
                    </Space>
                </Row>
            }
        >
            <span>
                <FormattedMessage id="analysis.are.you.sure.delete.group" />
                【{group?.name}】
            </span>
        </Modal>
    )
}

export default React.forwardRef(DeleteGroupModal)