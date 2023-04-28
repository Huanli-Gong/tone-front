/* eslint-disable react-hooks/exhaustive-deps */
import React from "react"
import { PlusCircleOutlined } from "@ant-design/icons"
import { Dropdown, Space, Table } from "antd";
import { useAnalysisProvider } from "../../provider"
import styled from "styled-components";
import { getSearchFilter } from "@/components/TableFilters";

const DropdownMenu = styled(Space)`
    background: #fff;
    width: 322px;
`

const TableCls = styled(Table)`
    .record-row-hide {
        display: none;
    }
`

const MetricDropdown: React.FC<any> = (props) => {
    const { fetchData, onChange } = props
    const { metrics } = useAnalysisProvider()
    const [params, setParams] = React.useState<any>({})
    const [open, setOpen] = React.useState(false)
    const [selectMetric, setSelectMetric] = React.useState<any>(fetchData?.metric || [])

    React.useEffect(() => {
        return () => {
            setParams({})
        }
    }, [])

    React.useEffect(() => {
        if (!open) {
            onChange?.({ ...fetchData, metric: selectMetric })
        }
    }, [selectMetric, open])

    return (
        <Dropdown
            destroyPopupOnHide
            open={open}
            trigger={["click"]}
            onOpenChange={setOpen}
            dropdownRender={() => (
                <DropdownMenu direction="vertical" size={0}>
                    <TableCls
                        pagination={false}
                        size="small"
                        rowKey={"value"}
                        rowClassName={(record: any) => {
                            if (!params?.name) return ''
                            if (!~record.label?.indexOf(params?.name)) return "record-row-hide"
                            return ""
                        }}
                        rowSelection={{
                            selectedRowKeys: selectMetric,
                            onChange: (list: any) => {
                                setSelectMetric(list)
                            }
                        }}
                        scroll={{
                            y: 38 * 6,
                        }}
                        columns={[{
                            dataIndex: "label",
                            title: "指标",
                            ...getSearchFilter(params, setParams, "name")
                        }]}
                        dataSource={metrics?.map((i: any) => ({
                            value: i,
                            label: i
                        }))}
                    />
                </DropdownMenu>
            )}
        >
            <PlusCircleOutlined style={{ cursor: "pointer" }} />
        </Dropdown>
    )
}

export default MetricDropdown