import { Modal, Tabs, Space, Button, Row, Typography } from "antd"
import React from "react"
import { useIntl, FormattedMessage } from "umi"
import JobTable from "./Tables/Job"
import BaselineSelectTable from "./Tables/Baseline"

import styles from "../index.less"

const AddGroupItem: React.ForwardRefRenderFunction<AnyType, AnyType> = (props, ref) => {
    const { onOk } = props

    const intl = useIntl()

    const [group, setGroup] = React.useState<AnyType>()
    const [open, setOpen] = React.useState(false)
    const [selectedRowDatas, setSelectedRowDatas] = React.useState<React.Key[]>([])

    const [activeKey, setActiveKey] = React.useState<"job" | "baseline">("job")

    const onTabClick = ($active: any) => {
        setActiveKey($active)
        setSelectedRowDatas($active === group?.type ? group?.members : [])
    }

    React.useImperativeHandle(ref, () => {
        return {
            show($row: any) {
                setGroup($row)
                setActiveKey($row?.type || "job")
                setOpen(true)
                setSelectedRowDatas($row.members || [])
            }
        }
    })

    const handleCancel = () => {
        setOpen(false)
        setSelectedRowDatas([])
        setActiveKey("job")
    }

    const handleOk = () => {
        const baseObj: any = {}
        if (activeKey === "job" && selectedRowDatas.length > 0) {
            const { product_id, product_version }: any = selectedRowDatas[0]
            baseObj.product_id = product_id
            baseObj.product_version = product_version
        }
        const result = {
            ...group,
            members: selectedRowDatas,
            ...baseObj,
            type: activeKey
        }

        onOk?.(result)
        handleCancel()
    }

    const tableProps = {
        ...props,
        ...group,
        activeKey,
        selectedRowDatas,
        setSelectedRowDatas,
    }

    const getCurrentEditType = ($type: any) => {
        if (!group?.type) return false
        return group?.type !== $type
    }

    return (
        <Modal
            title={group?.name}
            centered
            open={open}
            width={1000}
            className={styles.baseline_del_modal}
            onOk={handleOk}
            onCancel={handleCancel}
            maskClosable={false}
            destroyOnClose
            bodyStyle={{ padding: 0, minHeight: 480 }}
            footer={
                <Row justify={"space-between"} align="middle">
                    <Space>
                        <Space>
                            <FormattedMessage id="analysis.selected" />
                            {selectedRowDatas.length}
                            <FormattedMessage id="analysis.item" />
                        </Space>
                        <Typography.Link onClick={() => setSelectedRowDatas([])}>
                            <FormattedMessage id="analysis.all.cancel" />
                        </Typography.Link>
                    </Space>
                    <Space>
                        <Button onClick={handleCancel}><FormattedMessage id="operation.cancel" /></Button>
                        <Button type="primary" onClick={handleOk}><FormattedMessage id="operation.ok" /></Button>
                    </Space>
                </Row>
            }
        >
            <Tabs
                activeKey={activeKey}
                onTabClick={onTabClick}
                items={
                    ["job", "baseline"].map((i: any) => {
                        return ({
                            key: i,
                            disabled: getCurrentEditType(i),
                            label: intl.formatMessage({ id: `analysis.${i}.data` }),
                            children: i === "job" ?
                                <JobTable {...tableProps} />
                                : <BaselineSelectTable {...tableProps} />
                        })
                    })
                }
            />
        </Modal>
    )
}

export default React.forwardRef(AddGroupItem)