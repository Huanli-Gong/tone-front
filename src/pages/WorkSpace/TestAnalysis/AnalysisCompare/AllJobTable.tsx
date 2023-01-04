import React, { useState, useEffect } from 'react'
import { Space, Row, Col, Select, Divider, Button, DatePicker, Typography } from 'antd'
import { FilterFilled } from '@ant-design/icons';
import Highlighter from 'react-highlight-words'
import SearchInput from '@/components/Public/SearchInput'
import styles from './index.less'
import _ from 'lodash';
import { queryJobList, queryProductList, queryProduct } from './services';
import { useClientSize } from '@/utils/hooks';
import { useIntl, FormattedMessage, getLocale, useParams } from 'umi'
import { Scrollbars } from 'react-custom-scrollbars';
import SelectRadio from '@/components/Public/SelectRadio';
import SelectUser from '@/components/Public/SelectUser';
import CommonPagination from '@/components/CommonPagination';
import { requestCodeMessage } from '@/utils/utils'
import { ResizeHooksTable } from '@/utils/table.hooks';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const { RangePicker } = DatePicker
const { Option } = Select
const defaultResult = {
    all_job: 0,
    data: [],
    fail_job: 0,
    my_job: 0,
    pending_job: 0,
    running_job: 0,
    stop_job: 0,
    success_job: 0,
    total: 0,
}

const styleObj = {
    container: 210,
    button_width: 105
}

const AllJobTable = (props: any) => {
    const { onOk, onCancel, noGroupData, groupData } = props
    const { ws_id }: any = useParams();
    const page_default_params: any = {
        page_num: 1,
        page_size: 10,
        ws_id,
        state: 'success,fail,skip,stop,running',
    }

    const { height: layoutHeight } = useClientSize()
    const maxHeight = layoutHeight >= 728 ? layoutHeight - 128 : 600
    const [selectedRowKeys, setSelectedRowKeys] = useState<any>([])
    const [allProduct, setAllProduct] = useState([])
    const [allVersion, setAllVersion] = useState<any>([])
    const [selectRowData, setSelectRowData] = useState<any>([])
    const [loading, setLoading] = useState<any>(false)
    const { formatMessage } = useIntl()
    const [params, setParams] = useState(page_default_params)
    const [autoFocus, setFocus] = useState(true)
    const defaultList = [
        { id: 1, name: formatMessage({ id: 'header.test_type.functional' }) },
        { id: 0, name: formatMessage({ id: 'header.test_type.performance' }) },
    ]
    const [pruductId, setPruductId] = useState<any>()
    const [pruductVersion, setPruductVersion] = useState<any>()
    const [dataSource, setDataSource] = useState(defaultResult)

    const handleSelectTime = (date: any, dateStrings: any, confirm: any) => {
        const start_time = dateStrings[0]
        const end_time = dateStrings[1]
        if (!start_time && !end_time) setParams({ ...params, creation_time: null })
        if (start_time && end_time) setParams({ ...params, creation_time: JSON.stringify({ start_time, end_time }) })
        confirm?.()
    }

    const getProductList = async (id: any) => {
        setLoading(true)
        let result = await queryProductList({ ws_id, product_id: id })
        if (result.code === 200) {
            let data = result.data.filter((val: any) => val.trim())
            data = data.map((item: any, index: number) => ({ label: index, value: item }))
            setAllVersion(data)
            if (!!data.length && pruductId) setPruductVersion(data[0].value)
            else setPruductVersion(undefined)
        } else {
            requestCodeMessage(result.code, result.msg)
        }
        setLoading(false)
    }

    const getProductData = async () => {
        setLoading(true)
        let result = await queryProduct({ ws_id })
        if (result.code === 200) {
            let data = _.isArray(result.data) ? result.data : []
            setAllProduct(data)
            if (!!data.length) setPruductId(undefined)
        } else {
            requestCodeMessage(result.code, result.msg)
        }
        setLoading(false)
    }

    const getJobList = async () => {
        setLoading(true)
        let data = await queryJobList(params)
        if (data.code === 200) {
            setDataSource(data)
            setLoading(false)
        } else {
            setDataSource(defaultResult)
            requestCodeMessage(data.code, data.msg)
        }
    }

    useEffect(() => {
        if (!!noGroupData.length) {
            setSelectedRowKeys(noGroupData.map((i: any) => i.id));
            setSelectRowData(noGroupData);
        }
    }, [noGroupData])

    const columns = [
        {
            title: 'Job ID',
            dataIndex: 'id',
            width: 100,
            ellipsis: {
                shwoTitle: false,
            },
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                onConfirm={(val: any) => { setParams({ ...params, job_id: val, page_num: 1 }) }}
                placeholder={formatMessage({ id: 'analysis.JobID.placeholder' })}
            />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.job_id ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => _,
        },
        {
            title: <FormattedMessage id="analysis.job.name" />,
            dataIndex: 'name',
            width: 300,
            ellipsis: {
                shwoTitle: false,
            },
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                styleObj={styleObj}
                onConfirm={(val: any) => { setParams({ ...params, name: val, page_num: 1 }) }}
                placeholder={formatMessage({ id: 'analysis.job.name.placeholder' })}
            />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.name ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => {
                return (
                    <ColumnEllipsisText ellipsis={{ tooltip: row.name }}>
                        <Highlighter
                            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                            searchWords={[params.name || '']}
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
                const text = ["功能", "功能测试", "functional"].includes(row.test_type) ? "functional" : "performance"
                return <ColumnEllipsisText ellipsis={{ tooltip: true }}>{formatMessage({ id: `header.test_type.${text}` })}</ColumnEllipsisText>
            },
            filterIcon: () => <FilterFilled style={{ color: params.test_type ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SelectRadio
                list={defaultList}
                confirm={confirm}
                onConfirm={(val: any) => {
                    let value = undefined
                    if (val === 1) value = 'functional'
                    if (val === 0) value = 'performance'
                    setParams({ ...params, test_type: value })
                }} />,
        },
        {
            title: <FormattedMessage id="analysis.creator_name" />,
            width: 80,
            ellipsis: {
                shwoTitle: false,
            },
            dataIndex: 'creator_name',
            filterDropdown: ({ confirm }: any) => <SelectUser
                autoFocus={autoFocus} mode="" confirm={confirm}
                onConfirm={(val: []) => setParams({ ...params, creators: val ? JSON.stringify([val]) : null })} page_size={9999} />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.creators && params.creators !== '[]' ? '#1890ff' : undefined }} />,
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={_ || '-'} />
        },
        {
            title: <FormattedMessage id="analysis.test_time" />,
            width: 180,
            ellipsis: {
                shwoTitle: false,
            },
            dataIndex: 'start_time',
            filterDropdown: ({ confirm }: any) => (
                /* @ts-ignore */
                <RangePicker
                    size="middle"
                    showTime={{ format: 'HH:mm:ss' }}
                    format="YYYY-MM-DD HH:mm:ss"
                    onChange={_.partial(handleSelectTime, _, _, confirm)}
                />
            ),
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.creation_time ? '#1890ff' : undefined }} />,
            render: (record: any) => {
                return record || '-'
            }
        },
    ]

    useEffect(() => {
        getProductData()
        getProductList(undefined)
    }, [])

    useEffect(() => {
        if (pruductId) getProductList(pruductId)
    }, [pruductId])

    useEffect(() => {
        getJobList()
    }, [params])

    useEffect(() => {
        if (pruductId && !pruductVersion) {
            setParams({ ...params, product_id: pruductId, product_version: undefined })
        }
        if (pruductId && pruductVersion) {
            setParams({ ...params, product_version: pruductVersion, product_id: pruductId })
        }
    }, [pruductId, pruductVersion])

    const onVersionChange = (value: any) => {
        setPruductVersion(value)
    }

    const onProductChange = (value: any) => {
        setPruductId(value)
    }

    const handleClearVersion = () => {
        setPruductVersion(undefined)
        setParams({ ...params, product_version: undefined })
    }

    const handleClearProduct = () => {
        setPruductId(undefined)
        setPruductVersion(undefined)
        setParams(page_default_params)
    }

    const selectedChange = (record: any, selected: any) => {
        // 去掉未选组的job 开始
        if (selected) {
            const allRecord = selectRowData.concat(record)
            setSelectRowData(allRecord)
            setSelectedRowKeys(allRecord.map((i: any) => i.id))
        } else {
            const allRecord = selectRowData.filter((i: any) => i.id !== record.id)
            setSelectRowData(allRecord)
            setSelectedRowKeys(allRecord.map((i: any) => i.id))
        }
    }

    const allSelectFn = (allData: any) => {
        const arr = _.isArray(allData) ? allData : []
        const keysArr: any = []
        arr.forEach((item: any) => keysArr.push(item.id))
        setSelectedRowKeys([...selectedRowKeys, ...keysArr])
        setSelectRowData([...selectRowData, ...arr])
    }

    const cancleAllSelectFn = (allData: any) => {
        const arr = _.isArray(allData) ? allData : []
        const keysArr: any = []
        arr.forEach((item: any) => keysArr.push(item.id))
        setSelectedRowKeys(_.difference(selectedRowKeys, keysArr))
        setSelectRowData(_.differenceBy(selectRowData, arr, 'id'))
    }
    
    const groupDataJobIds = groupData.filter((i: any) => i.type === "job").reduce((p: any, c: any) => {
        const { members } = c
        return p.concat(members.map((i: any) => i.id))
    }, [])

    const rowSelection = {
        selectedRowKeys,
        preserveSelectedRowKeys: false,
        getCheckboxProps: (record: any) => {
            return {
                disabled: groupDataJobIds.includes(record.id), // Column configuration not to be checked
                name: record.name,
            }
        },
        onSelect: selectedChange,
        onSelectAll: (selected: boolean, selectedRows: [], changeRows: []) => {
            if (selected) {
                allSelectFn(changeRows)
                return
            } else {
                cancleAllSelectFn(changeRows)
            }
        },
    };
    const handleSelectCancle = () => {
        setSelectedRowKeys([]);
        setSelectRowData([]);
    }
    const handleCancle = () => {
        onCancel()
    }
    const handleOk = () => {
        onOk(selectRowData)
    }
    let tableData = _.isArray(dataSource.data) ? dataSource.data : []
    // 滚动条参数
    const scroll = {
        // 最大高度，内容超出该高度会出现滚动条
        height: maxHeight - 339 > 430 ? 430 : maxHeight - 339,
    }

    return (
        <div className={styles.list_container} id="list_container">
            <div className={styles.select_product}>
                <Row>
                    <Col span={12} >
                        <span><FormattedMessage id="analysis.product.label" /></span>
                        <Select
                            showSearch
                            allowClear={true}
                            style={{ width: 'calc(100% - 75px)' }}
                            placeholder={formatMessage({ id: 'analysis.product.placeholder' })}
                            value={pruductId}
                            optionFilterProp="children"
                            onSelect={onProductChange}
                            onClear={handleClearProduct}
                            filterOption={(input, option: any) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {allProduct.map((item: any) => <Option value={item.id} key={item.id}>{item.name}</Option>)}
                        </Select>
                    </Col>
                    <Col span={12} >
                        <span><FormattedMessage id="analysis.version.label" /></span>
                        <Select
                            showSearch
                            allowClear={true}
                            style={{ width: `calc(100% - ${getLocale() === 'en-US' ? 120 : 75}px)` }}
                            placeholder={formatMessage({ id: 'analysis.version.placeholder' })}
                            value={pruductVersion}
                            optionFilterProp="children"
                            onSelect={onVersionChange}
                            onClear={handleClearVersion}
                            filterOption={(input, option: any) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {allVersion.map((item: any) => <Option value={item.value} key={item.label}>{item.value}</Option>)}
                        </Select>
                    </Col>
                </Row>
                <div className={styles.job_text}><FormattedMessage id="analysis.job.table" /></div>
                <Divider className={styles.line} />
            </div>
            <Scrollbars style={scroll} className={styles.scroll}>
                <ResizeHooksTable
                    rowSelection={rowSelection as any}
                    rowKey='id'
                    columns={columns as any}
                    name="ws-compare-all-job-list"
                    refreshDeps={[ws_id, params, autoFocus]}
                    loading={loading}
                    dataSource={tableData}
                    pagination={false}
                    size="small"
                />
            </Scrollbars>
            <CommonPagination
                total={dataSource.total}
                currentPage={params && params.page_num}
                pageSize={params && params.page_size}
                onPageChange={(page_num, page_size) => {
                    setParams({ ...params, page_num, page_size })
                }}
            />
            <Divider className={styles.footer_line} />
            <div className={styles.footer}>
                <span>
                    <span><FormattedMessage id="analysis.selected" /></span>
                    <span className={styles.text_num}>{`${selectRowData.length}`}</span>
                    <span><FormattedMessage id="analysis.item" /></span>
                    <span className={styles.text_cancle} onClick={handleSelectCancle}>
                        <FormattedMessage id="analysis.all.cancel" />
                    </span>
                </span>
                <span>
                    <Space>
                        <Button onClick={handleCancle}><FormattedMessage id="operation.cancel" /></Button>
                        <Button type="primary" onClick={handleOk}><FormattedMessage id="operation.ok" /></Button>
                    </Space>
                </span>
            </div>
        </div>
    )
}

export default AllJobTable;