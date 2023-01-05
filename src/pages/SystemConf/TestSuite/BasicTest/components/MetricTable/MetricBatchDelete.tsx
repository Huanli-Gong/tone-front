import { Affix, Row, Space, Checkbox, Typography, Button, Popconfirm } from "antd"
import React from "react"
import styled from "styled-components"
import { useIntl, FormattedMessage } from "umi"
import DeleteMetricPopover from './DeleteMetricPopover'

const BatchRow = styled(Row)`
    padding-right : 20px;
    margin-top: 16px;
    height:64px;
    width:100%;
    line-height: 64px;
    background-color: #fff;
    padding-left:24px;
    box-shadow:0 -9px 28px 8px rgba(0,0,0,0.05), 0 -6px 16px 0 rgba(0,0,0,0.08), 0 -3px 6px -4px rgba(0,0,0,0.12);
`

const BatchDelete: React.FC<AnyType> = (props) => {
    const { selectedRowKeys, setMetricDelInfo, onOk, innerKey } = props
    const intl = useIntl()

    const handleOk = (is_sync?: boolean) => {
        onOk?.(selectedRowKeys, is_sync)
        setMetricDelInfo({})
    }

    const handleCancel = () => {
        setMetricDelInfo({})
    }

    if (!selectedRowKeys?.length) return <></>

    return (
        <Affix offsetBottom={16}>
            <BatchRow justify="space-between" >
                <Space>
                    <Checkbox indeterminate={true} />
                    <Typography.Text>
                        {intl.formatMessage({ id: 'selected.item' }, { data: selectedRowKeys.length })}
                    </Typography.Text>
                    <Button type="link" onClick={handleCancel}>
                        <FormattedMessage id="operation.cancel" defaultMessage="取消" />
                    </Button>
                </Space>
                <Space>
                    {
                        innerKey === "1" ?
                            <Popconfirm
                                title={<FormattedMessage id="delete.prompt" />}
                                okText={<FormattedMessage id="operation.ok" />}
                                cancelText={<FormattedMessage id="operation.cancel" />}
                                onConfirm={() => handleOk()}
                                overlayStyle={{ width: '224px' }}
                            >
                                <Button >
                                    <FormattedMessage id={"operation.batch.delete"} />
                                </Button>
                            </Popconfirm> :
                            <DeleteMetricPopover isBatch onOk={handleOk} />
                    }
                </Space>
            </BatchRow>
        </Affix>
    )
}

export default BatchDelete