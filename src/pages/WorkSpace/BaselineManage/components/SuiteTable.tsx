import React from "react"
import { Table, Typography } from "antd"
import type { TableColumnProps } from "antd"
import { useSize } from "ahooks"
import { CaretRightFilled, CaretDownFilled, FilterFilled } from '@ant-design/icons'
import { useIntl, useLocation } from "umi"
import SearchInput from '@/components/Public/SearchInput'
import Highlighter from 'react-highlight-words'
import { queryFunctionalBaseline, queryPerformanceBaseline } from '../services'
import ConfTable from "./ConfTable"
import styled from "styled-components"

const TableCls = styled(Table)`
    .ant-table.ant-table-small .ant-table-tbody .ant-table-wrapper:only-child .ant-table {
        margin: -8px -8px -8px 0px;
    }
`

type IProps = Record<string, any>

const BaseTable: React.FC<IProps> = (props) => {
    const { test_type, current } = props
    const { id: baseline_id } = current

    const basicParams = React.useMemo(() => ({ test_type, baseline_id, search_suite: "" }), [test_type, baseline_id])
    // const PAGE_DEFAULT_PARAMS: any = { test_type, baseline_id, search_suite: '' }  // 有用

    const intl = useIntl()
    const { query } = useLocation() as any

    const [listParams, setListParams] = React.useState<any>({})
    const [source, setSource] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [expandKey, setExpandKey] = React.useState<React.Key[]>([])
    const ref = React.useRef(null)

    React.useEffect(() => {
        setListParams(basicParams)
    }, [basicParams])

    React.useMemo(() => {
        if (query?.test_suite_id) {
            setExpandKey([+ query?.test_suite_id])
        }
    }, [query, source])

    const fetchListData = async () => {
        if (!listParams?.baseline_id) {
            setSource([])
            setLoading(false)
            return
        }
        setLoading(true)
        const { code, data, msg } = test_type === "functional" ?
            await queryFunctionalBaseline(listParams) :
            await queryPerformanceBaseline(listParams)
        setLoading(false)
        if (code !== 200) return
        setSource(data)
    }

    React.useEffect(() => {
        fetchListData()
        return () => {
            setLoading(true)
            setExpandKey([])
            setSource([])
        }
    }, [listParams])

    const { height } = useSize(ref)

    const columns: TableColumnProps<Record<string, any>>[] = [
        {
            dataIndex: 'test_suite_name',
            title: 'Test Suite',
            key: 'Test Conf',
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    confirm={confirm}
                    onConfirm={(name: any) => setListParams((p: any) => ({ ...p, name }))}
                    currentData={{ test_type, id: baseline_id }}
                    placeholder={intl.formatMessage({ id: 'pages.workspace.baseline.detail.table.test_suite_name' })} // "支持搜索Test Suite名称"
                    styleObj={{ container: 280, button_width: 140 }}
                />
            ),
            filterIcon: () => <FilterFilled style={{ color: listParams?.name ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => {
                return (
                    <Typography.Text ellipsis={{ tooltip: true }}>
                        <Highlighter
                            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                            searchWords={[listParams?.name || '']}
                            autoEscape
                            textToHighlight={row.test_suite_name.toString()}
                        />
                    </Typography.Text>
                )
            }
        }
    ]

    const onExpand = async (record: any) => {
        setExpandKey([record.test_suite_id])
    }

    return (
        <div ref={ref} >
            <TableCls
                dataSource={source || []}
                columns={columns}
                rowKey={"test_suite_id"}
                pagination={false}
                loading={loading}
                size="small"
                scroll={{ y: height }}
                expandable={{
                    indentSize: 0,
                    columnWidth: 32,
                    expandedRowRender: record => {
                        return (
                            !loading &&
                            <ConfTable
                                loading={loading}
                                baseline_id={baseline_id}
                                test_type={test_type}
                                {...record}
                            />
                        )
                    },
                    onExpand: (_, record: any) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                        _ ? onExpand(record) : setExpandKey([])
                    },
                    expandedRowKeys: expandKey,
                    expandIcon: ({ expanded, onExpand: $expandFn, record }: any) => (
                        expanded ?
                            (<CaretDownFilled onClick={e => $expandFn(record, e)} />) :
                            (<CaretRightFilled onClick={e => $expandFn(record, e)} />)
                    )
                }}
            />
        </div>
    )
}

export default BaseTable