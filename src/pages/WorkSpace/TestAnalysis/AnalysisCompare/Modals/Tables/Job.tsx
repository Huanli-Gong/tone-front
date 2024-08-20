/* eslint-disable react-hooks/exhaustive-deps */
import { useRequest } from "ahooks"
import { Col, Space, Row, Select, DatePicker } from "antd"
import React from "react"
import { useIntl, FormattedMessage, useParams } from "umi"
import { queryJobList, queryProductList, queryProduct } from '../../services'

import SearchInput from '@/components/Public/SearchInput'
import SelectRadio from '@/components/Public/SelectRadio';
import SelectUser from '@/components/Public/SelectUser'

import { FilterFilled } from "@ant-design/icons"
import { ColumnEllipsisText } from "@/components/ColumnComponents"
import Highlighter from "react-highlight-words"
import { ResizeHooksTable } from "@/utils/table.hooks"
import CommonPagination from "@/components/CommonPagination"
import WsListSelect from '@/pages/WorkSpace/TestReport/components/WsListSelect'

import lodash from "lodash"

const DEFAULT_PAGE_PARAMS = { page_size: 10, page_num: 1 }

export const filterJobIds = (arr: any, $type: any) => arr.filter((i: any) => i.type === $type).reduce((pre: any, cur: any) => {
    if (!cur) return pre
    if (!cur.members) return pre
    return pre.concat(cur.members?.map((i: any) => i.id))
}, [])

const AddJobTable: React.FC<AnyType> = (props) => {
    const { selectedRowDatas, setSelectedRowDatas } = props
    const { product_id, product_version, members, noGroupData, allGroupData, activeKey,
        selectedWsId, setSelectedWsId,
     } = props

    const tempList = filterJobIds(allGroupData, activeKey)
    const hasIds = filterJobIds(noGroupData, activeKey).concat(tempList).filter((i: any) => !members.map((t: any) => t.id).includes(i))

    const { ws_id } = useParams() as any
    const { formatMessage } = useIntl()

    const defaultList = [
        { id: 1, name: formatMessage({ id: 'header.test_type.functional' }) },
        { id: 0, name: formatMessage({ id: 'header.test_type.performance' }) },
    ]

    const [listParams, setListParams] = React.useState<AnyType>({
        ...DEFAULT_PAGE_PARAMS,
        ws_id: selectedWsId || ws_id,
        state: 'success,fail,skip,stop,running',
        filter_id: hasIds.toString()
    })
    const [products, setProduct] = React.useState<any>([])

    const [autoFocus, setFocus] = React.useState(true)
    const [productVersions, setProductVersions] = React.useState([])
    const [loading, setLoading] = React.useState<any>(false)
    const [jobs, setJobs] = React.useState({})

    const getProduct = async (q: any)=> {
        const { data = [], code } = await queryProduct(q)
        if (code === 200) setProduct(data)
        else setProduct([])
    }
    const getProductVersionsList = async (id: any) => {
        const { data, code } = await queryProductList({ ws_id: selectedWsId, product_id: id })
        if (code === 200)
            return data || []
        return []
    }
    const getJobList = async () => {
        setLoading(true)
        const data = await queryJobList(listParams)
        setLoading(false)
        if (data.code === 200) {
            setJobs(data)
        } else {
            setJobs({})
        }
    }
    // const { data: jobs, loading } = useRequest(
    //     () => queryJobList(listParams),
    //     {
    //         debounceInterval: 200,
    //         refreshDeps: [listParams],
    //         ready: !!listParams.product_id && !!listParams.product_version
    //     }
    // )

    React.useEffect(() => {
        if (products && products.length) {
            const newData = { product_id: product_id ?? products[0].id, product_version }
            if (newData.product_id)
                getProductVersionsList(newData.product_id)
                    .then(list => {
                        setProductVersions(list)
                        const newVersion = list.length > 0 ? list[0] : undefined
                        setListParams((p: any) => {
                            if (!product_version) {
                                return { ...p, ...newData, product_version: newVersion }
                            }
                            return { ...p, ...newData }
                        })
                    })
        }
    }, [products, product_id, product_version])


    React.useEffect(() => {
        if (selectedWsId) {
            getProduct({ ws_id: selectedWsId })
        } else {
            setSelectedWsId(ws_id)
            getProduct({ ws_id })
        }
    }, [])

    React.useEffect(() => {
        if (listParams.product_id && listParams.product_version) {
           getJobList()
        }
    }, [listParams])

    const onWsChange = (value: any) => {
        setListParams((p: any) => ({ ...p, page_num: 1, ws_id: value, product_id: undefined, product_version: undefined }))
        setJobs({})
        // 
        setSelectedWsId(value)
        getProduct({ ws_id: value })
    }

    const disabled = React.useMemo(() => {
        return product_version && product_id
    }, [product_version, product_id])

    const handleSelectTime = (date: any, dateStrings: any, confirm: any) => {
        const start_time = dateStrings[0]
        const end_time = dateStrings[1]
        if (!start_time && !end_time)
            setListParams((p: any) => ({ ...p, creation_time: null, page_num: 1 }))
        if (start_time && end_time)
            setListParams((p: any) => ({ ...p, creation_time: JSON.stringify({ start_time, end_time }), page_num: 1 }))
        confirm?.()
    }

    const columns: any = [
        {
            title: 'Job ID',
            dataIndex: 'id',
            width: 100,
            ellipsis: {
                shwoTitle: false,
            },
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    confirm={confirm}
                    autoFocus={autoFocus}
                    onConfirm={(val: any) => setListParams((p: any) => ({ ...p, job_id: val, page_num: 1 }))}
                    placeholder={formatMessage({ id: 'analysis.JobID.placeholder' })}
                />
            ),
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) setFocus(!autoFocus)
            },
            filterIcon: () => <FilterFilled style={{ color: listParams?.job_id ? '#1890ff' : undefined }} />,
            render: (_: any) => _,
        },
        {
            title: <FormattedMessage id="analysis.job.name" />,
            dataIndex: 'name',
            width: 300,
            ellipsis: {
                shwoTitle: false,
            },
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    confirm={confirm}
                    autoFocus={autoFocus}
                    styleObj={{ container: 230, button_width: 115 }}
                    onConfirm={(val: any) => setListParams((p: any) => ({ ...p, name: val, page_num: 1 }))}
                    placeholder={formatMessage({ id: 'analysis.job.name.placeholder' })}
                />
            ),
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) setFocus(!autoFocus)
            },
            filterIcon: () => <FilterFilled style={{ color: listParams?.name ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => {
                return (
                    <ColumnEllipsisText ellipsis={{ tooltip: row.name }}>
                        <Highlighter
                            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                            searchWords={[listParams?.name || '']}
                            autoEscape
                            textToHighlight={row && row.name}
                        />
                    </ColumnEllipsisText>
                )
            }
        },
        {
            title: <FormattedMessage id="analysis.test_type" />,
            width: 100,
            dataIndex: 'test_type',
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any, row: any) => {
                if (["功能", "功能测试", "functional"].includes(row.test_type)) {
                    return (
                        <ColumnEllipsisText ellipsis={{ tooltip: true }}>
                            {formatMessage({ id: `header.test_type.functional` })}
                        </ColumnEllipsisText>
                    )
                }
                return (
                    <ColumnEllipsisText ellipsis={{ tooltip: true }}>
                        {formatMessage({ id: "header.test_type.performance" })}
                    </ColumnEllipsisText>
                )
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
            filterDropdown: ({ confirm }: any) => (
                <SelectUser
                    autoFocus={autoFocus}
                    mode=""
                    confirm={confirm}
                    onConfirm={(val: []) => setListParams((p: any) => ({ ...p, creators: val ? JSON.stringify([val]) : null, page_num: 1 }))}
                    page_size={9999}
                />
            ),
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) setFocus(!autoFocus)
            },
            filterIcon: () => <FilterFilled style={{ color: listParams?.creators && listParams?.creators !== '[]' ? '#1890ff' : undefined }} />,
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{_ || '-'}</ColumnEllipsisText>
        },
        {
            title: <FormattedMessage id="analysis.test_time" />,
            width: 180,
            ellipsis: {
                shwoTitle: false,
            },
            dataIndex: 'start_time',
            filterDropdown: ({ confirm }: any) => (
                <DatePicker.RangePicker
                    size="middle"
                    showTime={{ format: 'HH:mm:ss' }}
                    format="YYYY-MM-DD HH:mm:ss"
                    onChange={lodash.partial(handleSelectTime, lodash, lodash, confirm)}
                />
            ),
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) setFocus(!autoFocus)
            },
            filterIcon: () => <FilterFilled style={{ color: listParams?.creation_time ? '#1890ff' : undefined }} />,
            render: (record: any) => {
                return record || '-'
            }
        },
    ]

    const selectedChange = (record: any, selected: any) => {
        setSelectedRowDatas(
            (p: React.Key[]) => selected ?
                p.concat(record)
                : p.filter((k: any) => k.id !== record.id)
        )
    }

    const rowSelection = {
        selectedRowKeys: selectedRowDatas.map((i: any) => i.id),
        getCheckboxProps: (record: any) => {
            // 有用
            const flag = (!members && product_id === record?.product_id) && !["success", "fail"].includes(record?.state)
            return ({
                disabled: flag, // Column configuration not to be checked
                name: record.name,
            })
        },
        preserveSelectedRowKeys: false,
        onSelect: selectedChange,
        onSelectAll: (selected: boolean, selectedRows: any, changeRows: any) => {
            const selectIds = changeRows.map((i: any) => i.id)
            setSelectedRowDatas(
                (p: React.Key[]) => selected ?
                    p.concat(changeRows)
                    : p.filter((k: any) => !selectIds.includes(k.id))
            )
        },
    };

    const baseSelectProps = {
        showSearch: true,
        allClear: true,
        optionFilterProp: "children",
        disabled,
        style: { flex: 1 },
        filterOption: (input: any, option: any) => option.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }

    return (
        <Space direction="vertical" style={{ width: "100%", padding: "0 16px" }} size={0}>
            <Row gutter={20}>
                <Col span={8}>
                    <div style={{display: 'flex',alignItems: 'center'}}>
                        <span><FormattedMessage id="analysis.ws.list" /></span>
                        <WsListSelect
                            {...baseSelectProps}
                            allClear={false}
                            ws_id={ws_id}
                            value={selectedWsId} 
                            onSelect={onWsChange}
                            style={{ flex: 1 }}
                        />
                    </div>
                </Col>
                <Col span={8}>
                    <div style={{display: 'flex',alignItems: 'center'}}>
                        <FormattedMessage id="analysis.product.label" />
                        <Select
                            {...baseSelectProps}
                            placeholder={formatMessage({ id: 'analysis.product.placeholder' })}
                            value={listParams.product_id}
                            onSelect={(value: any) => {
                                getProductVersionsList(value)
                                    .then((list: any) => {
                                        const newVersion = list && list.length > 0 ? list[0] : undefined
                                        setListParams((p: any) => ({ ...p, page_num: 1, product_id: value, product_version: newVersion }))
                                        setProductVersions(list)
                                        setSelectedRowDatas([])
                                    })
                            }}
                            options={
                                products?.map((item: any) => ({
                                    value: item.id,
                                    label: item.name
                                }))
                            }
                        />
                    </div>
                </Col>
                <Col span={8}>
                    <div style={{display: 'flex',alignItems: 'center'}}>
                        <FormattedMessage id="analysis.version.label" />
                        <Select
                            {...baseSelectProps}
                            placeholder={formatMessage({ id: 'analysis.version.placeholder' })}
                            value={listParams.product_version}
                            onSelect={(value: any) => {
                                setListParams({ ...listParams, product_version: value })
                                setSelectedRowDatas([])
                            }}
                            options={
                                productVersions?.map((item: any) => ({
                                    value: item,
                                    label: item
                                }))
                            }
                        />
                    </div>
                </Col>
            </Row>

            <Space direction="vertical" size={0} style={{ width: "100%" }}>
                <ResizeHooksTable
                    rowSelection={rowSelection as any}
                    rowKey='id'
                    name="ws-analysis-compare-job-add"
                    refreshDeps={[selectedWsId, listParams, selectedRowDatas, disabled, props]}
                    columns={columns as any}
                    loading={loading}
                    dataSource={jobs?.data ?? []}
                    pagination={false}
                    size="small"
                />

                <CommonPagination
                    total={jobs?.total}
                    currentPage={listParams?.page_num}
                    pageSize={listParams?.page_size}
                    onPageChange={(page_num, page_size) => setListParams(p => ({ ...p, page_num, page_size }))}
                />
            </Space>
        </Space>
    )
}


export default AddJobTable