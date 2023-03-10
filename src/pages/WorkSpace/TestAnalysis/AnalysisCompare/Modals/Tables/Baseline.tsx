import { Space } from "antd"
import React from "react"
import { ResizeHooksTable } from '@/utils/table.hooks';
import CommonPagination from "@/components/CommonPagination"
import { useIntl, FormattedMessage, useParams } from "umi"
import { useRequest } from "ahooks"
import { queryBaelineList } from '../../services'
import { ColumnEllipsisText } from '@/components/ColumnComponents';
import SearchInput from '@/components/Public/SearchInput'
import { FilterFilled } from '@ant-design/icons'
import SelectRadio from '@/components/Public/SelectRadio';
import { getUserFilter } from '@/components/TableFilters'

const DEFAULTPARAM = {
    page_num: 1,
    page_size: 10,
}

const BaselineSelect: React.FC<AnyType> = (props) => {
    const { selectedRowDatas, setSelectedRowDatas } = props
    
    const { ws_id } = useParams() as any
    const { formatMessage } = useIntl()

    const defaultList = [
        { id: 1, name: formatMessage({ id: 'header.test_type.functional' }) },
        { id: 0, name: formatMessage({ id: 'header.test_type.performance' }) },
    ]

    const [listParams, setListParams] = React.useState<any>(DEFAULTPARAM)
    const [autoFocus, setFocus] = React.useState(true)

    const { data: baselines, loading } = useRequest(
        () => queryBaelineList({ ...listParams, ws_id }),
        {
            debounceInterval: 200,
            refreshDeps: [listParams],
        }
    )

    const baselineSelection = {
        selectedRowKeys: selectedRowDatas.map((i: any) => i.id),
        preserveSelectedRowKeys: false,
        getCheckboxProps: (record: any) => {
            return ({
                // disabled: hasIds.includes(record?.id), // Column configuration not to be checked
                name: record.name,
            })
        },
        onSelect: (record: any, selected: any) => {
            setSelectedRowDatas(
                (p: React.Key[]) => selected ?
                    p.concat(record)
                    : p.filter((k: any) => k.id !== record.id)
            )
        },
        onSelectAll: (selected: boolean, selectedRows: [], changeRows: []) => {
            const selectIds = changeRows.map((i: any) => i.id)
            setSelectedRowDatas(
                (p: React.Key[]) => selected ?
                    p.concat(changeRows)
                    : p.filter((k: any) => !selectIds.includes(k.id))
            )
        },
    };

    const columns: any = [
        {
            title: <FormattedMessage id="analysis.baseline_name" />,
            dataIndex: 'name',
            width: 150,
            ellipsis: {
                shwoTitle: false,
            },
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    confirm={confirm}
                    autoFocus={autoFocus}
                    onConfirm={(val: any) => setListParams((p: any) => ({ ...p, name: val, page_num: 1 }))}
                    placeholder={formatMessage({ id: 'analysis.baseline.placeholder' })}
                />
            ),
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: listParams?.name ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => _,
        },
        {
            title: <FormattedMessage id="analysis.test_type" />,
            width: 100,
            dataIndex: 'test_type',
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any, row: any) => {
                const text = ["功能", "功能测试", "functional"].includes(row.test_type) ? "functional" : "performance"
                return <ColumnEllipsisText ellipsis={{ tooltip: true }}>{formatMessage({ id: `header.test_type.${text}` })}</ColumnEllipsisText>
            },
            filterIcon: () => <FilterFilled style={{ color: listParams?.test_type ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectRadio
                    list={defaultList}
                    confirm={confirm}
                    onConfirm={(val: any) => {
                        let value: any = undefined
                        if (val === 1) value = 'functional'
                        if (val === 0) value = 'performance'
                        setListParams((p: any) => ({ ...p, test_type: value, page_num: 1 }))
                    }}
                />
            ),
        },
        {
            title: <FormattedMessage id="analysis.creator_name" />,
            width: 80,
            ellipsis: {
                shwoTitle: false,
            },
            dataIndex: 'creator_name',
            ...getUserFilter(listParams, setListParams, 'creator'),
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{_ || '-'}</ColumnEllipsisText>
        },
        {
            title: <FormattedMessage id="analysis.gmt_created" />,
            width: 180,
            ellipsis: {
                shwoTitle: false,
            },
            dataIndex: 'gmt_created',
            render: (record: any) => {
                return record || '-'
            }
        },
    ]

    return (
        <Space
            direction="vertical"
            style={{ width: "100%", display: "flex", padding: "0 16px" }}
            size={0}
        >
            <ResizeHooksTable
                rowSelection={baselineSelection as any}
                rowKey='id'
                name="ws-analysis-compare-baseline-add"
                columns={columns as any}
                refreshDeps={[listParams, ws_id]}
                loading={loading}
                dataSource={baselines?.data}
                pagination={false}
                size="small"
            />
            <CommonPagination
                total={baselines?.total}
                currentPage={listParams?.page_num}
                pageSize={listParams?.page_size}
                onPageChange={(page_num, page_size) => setListParams((p: any) => ({ ...p, page_num, page_size }))}
            />
        </Space>
    )
}

export default BaselineSelect