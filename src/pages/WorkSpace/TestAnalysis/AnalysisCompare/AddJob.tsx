/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-shadow */

import React, { useState, useEffect } from 'react';
import { useClientSize } from '@/utils/hooks';
import { FilterFilled } from '@ant-design/icons'
import { useIntl, FormattedMessage, getLocale, useParams } from 'umi'
import { queryJobList, queryProductList, queryProduct, queryBaelineList } from './services'
import Highlighter from 'react-highlight-words'
import styles from './index.less'
import CommonPagination from '@/components/CommonPagination';
import SelectRadio from '@/components/Public/SelectRadio';
import { Scrollbars } from 'react-custom-scrollbars';
import _ from 'lodash'
import { Tabs, Select, Divider, Space, Button, DatePicker, Row, Col } from 'antd';
import SearchInput from '@/components/Public/SearchInput'
import { resizeDocumentHeight } from './CommonMethod'
import SelectUser from '@/components/Public/SelectUser'
import { requestCodeMessage } from '@/utils/utils';
import { getUserFilter } from '@/components/TableFilters'
import { ResizeHooksTable } from '@/utils/table.hooks';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const { RangePicker } = DatePicker
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
    container: 230,
    button_width: 115
}
const getSelJobFn = (allGroup: any, allNoGroupData: any) => {
    const allGroupJob = _.reduce(allGroup, (arr: any, group: any) => {
        const members = _.get(group, 'members')
        return [...arr, ...members]
    }, [])
    const allJob = [...allNoGroupData, ...allGroupJob]
    const allJobId = allJob.map((item: any) => _.get(item, 'id'))
    return allJobId
}

export default (props: any) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const defaultList = [
        { id: 1, name: formatMessage({ id: 'header.test_type.functional' }) },
        { id: 0, name: formatMessage({ id: 'header.test_type.performance' }) },
    ]

    const { height: layoutHeight } = useClientSize()
    const maxHeight = layoutHeight >= 728 ? layoutHeight - 128 : 600
    const scollMaxHeight = maxHeight - 400 > 430 ? 430 : maxHeight - 400
    resizeDocumentHeight(scollMaxHeight)
    const { onCancel, onOk, currentGroup } = props

    const DEFAULTPARAM = {
        page_num: 1,
        page_size: 10,
        ws_id,
    }

    let { allGroup, allNoGroupData } = props
    allGroup = _.isArray(allGroup) ? allGroup : []
    const [tabKey, setTabKey] = useState<string>('1')
    allNoGroupData = _.isArray(allNoGroupData) ? allNoGroupData : []

    const selectedId: any = getSelJobFn(allGroup, allNoGroupData)

    const page_default_params: any = {
        ...DEFAULTPARAM,
        state: 'success,fail,skip,stop,running',
        filter_id: selectedId.join(','),
    }
    const [dataSource, setDataSource] = useState(defaultResult)
    const [baselineData, setBaselineData] = useState<any>([])
    const [loading, setLoading] = useState(false)
    const [params, setParams] = useState(page_default_params)
    const [baselineParam, setBaselineParam] = useState<any>(DEFAULTPARAM)
    const [pruductVersion, setPruductVersion] = useState()
    const [allVersion, setAllVersion] = useState<any>([])
    const [selectedRowKeys, setSelectedRowKeys] = useState<any>([])
    const [selectRowData, setSelectRowData] = useState<any>([])
    const [selectedBaselineKeys, setSelectedBaselineKeys] = useState<any>([])
    const [selectedBaselineData, setSelectedBaselineData] = useState<any>([])
    const [autoFocus, setFocus] = useState(true)
    const [allProduct, setAllProduct] = useState([])
    const [pruductId, setPruductId] = useState<any>()
    // 获取产品版本数据
    const getProductList = async (id: any) => {
        setLoading(true)
        const result = await queryProductList({ product_id: id, ws_id })
        if (result.code === 200) {
            let data = result.data.filter((val: any) => val?.trim())
            data = data.map((item: any, index: number) => ({ label: index, value: item }))
            setAllVersion(data)
            if (!currentGroup?.members.length) {
                const defaultProVersion = data.length ? data[0] : ''
                setPruductVersion(defaultProVersion)
            }
        } else {
            /* @ts-ignore */
            requestCodeMessage(result?.code, result?.msg)
        }
        setLoading(false)
    }
    // 获取产品列表数据
    const getProductData = async () => {
        setLoading(true)
        const { code, data, msg } = await queryProduct({ ws_id })
        setLoading(false)
        if (code === 200) {
            setAllProduct(data)
            if (!currentGroup.product_id) {
                if (data.length) setPruductId(data[0].id)
            }
            return
        } else {
            requestCodeMessage(code, msg)
        }
    }

    // 查询基线数据
    const getBaselineData = async () => {
        setLoading(true)
        const { code, msg, ...result } = await queryBaelineList({ ...baselineParam, ws_id })
        if (code === 200) {
            setBaselineData(result)
        } else {
            requestCodeMessage(code, msg)
        }
        setLoading(false)
    }
    useEffect(() => {
        if (currentGroup.type === 'baseline') setTabKey('2')
    }, [currentGroup])

    const handleTabSwitch = (key: any) => {
        setTabKey(key)
    }
    // 监听tab切换数据加载
    /* useEffect(() => {
        if (tabKey === '1') {
            if (!(currentGroup && _.get(currentGroup, 'members').length)) {
                getProductData()
            }
        }
    }, [tabKey]) */

    React.useEffect(() => {
        getProductData()
    }, [currentGroup])

    const getJobList = async (params: any) => {
        setLoading(true)
        const data = await queryJobList(params)
        defaultOption(data)
    }

    useEffect(() => {
        if (params.product_id) getJobList(params)
    }, [params])

    useEffect(() => {
        if (tabKey === '2') getBaselineData()
    }, [tabKey, baselineParam])

    useEffect(() => {
        setParams((p: any) => ({ ...p, product_version: pruductVersion, product_id: pruductId, page_num: 1 }))
    }, [pruductVersion, pruductId])

    useEffect(() => {
        pruductId && getProductList(pruductId)
    }, [pruductId])

    React.useEffect(() => {
        const { product_id, product_version } = currentGroup
        product_id && setPruductId(product_id)
        product_version && setPruductVersion(product_version)
    }, [currentGroup])

    const defaultOption = (ret: any) => {
        if (ret.code === 200) {
            setDataSource(ret)
        } else {
            setDataSource(defaultResult)
            requestCodeMessage(ret.code, ret.msg)
        }
        setLoading(false)
    }

    const onChange = (value: any) => {
        setPruductVersion(value)
        setParams((p: any) => ({ ...p, product_version: value, page_num: 1 }))
        setSelectedRowKeys([]);
        setSelectRowData([]);
    }

    const onProductChange = (value: any) => {
        setPruductId(value)
        setSelectedRowKeys([]);
        setSelectRowData([]);
    }

    const handleMemberFilter = (val: []) => {
        setParams((p: any) => ({ ...p, creators: val ? JSON.stringify([val]) : null }))
    }

    const handleSelectTime = (date: any, dateStrings: any, confirm: any) => {
        const start_time = dateStrings[0]
        const end_time = dateStrings[1]
        if (!start_time && !end_time) setParams((p: any) => ({ ...p, creation_time: null }))
        if (start_time && end_time) setParams((p: any) => ({ ...p, creation_time: JSON.stringify({ start_time, end_time }) }))
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
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                onConfirm={(val: any) => { setParams((p: any) => ({ ...p, job_id: val, page_num: 1 })) }}
                placeholder={formatMessage({ id: 'analysis.JobID.placeholder' })}
            />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.job_id ? '#1890ff' : undefined }} />,
            render: (_: any) => _,
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
                onConfirm={(val: any) => { setParams((p: any) => ({ ...p, name: val, page_num: 1 })) }}
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
            filterIcon: () => <FilterFilled style={{ color: params.test_type ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectRadio
                    list={defaultList}
                    confirm={confirm}
                    onConfirm={(val: any) => {
                        let value: any = undefined
                        if (val === 1) value = 'functional'
                        if (val === 0) value = 'performance'
                        setParams((p: any) => ({ ...p, test_type: value }))
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
            filterDropdown: ({ confirm }: any) => <SelectUser autoFocus={autoFocus} mode="" confirm={confirm} onConfirm={(val: []) => handleMemberFilter(val)} page_size={9999} />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.creators && params.creators !== '[]' ? '#1890ff' : undefined }} />,
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{_ || '-'}</ColumnEllipsisText>
        },
        {
            title: <FormattedMessage id="analysis.test_time" />,
            width: 180,
            ellipsis: {
                shwoTitle: false,
            },
            dataIndex: 'start_time',
            filterDropdown: ({ confirm }: any) => <RangePicker
                size="middle"
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD HH:mm:ss"
                onChange={_.partial(handleSelectTime, _, _, confirm)}
            />,
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

    const baselineColumns: any = [
        {
            title: <FormattedMessage id="analysis.baseline_name" />,
            dataIndex: 'name',
            width: 100,
            ellipsis: {
                shwoTitle: false,
            },
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                onConfirm={(val: any) => { setBaselineParam((p: any) => ({ ...p, name: val, page_num: 1 })) }}
                placeholder={formatMessage({ id: 'analysis.baseline.placeholder' })}
            />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: baselineParam.name ? '#1890ff' : undefined }} />,
            render: (_: any) => _,
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
            filterIcon: () => <FilterFilled style={{ color: baselineParam.test_type ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SelectRadio
                list={defaultList}
                confirm={confirm}
                onConfirm={(val: any) => {
                    let value: any = undefined
                    if (val === 1) value = 'functional'
                    if (val === 0) value = 'performance'
                    setBaselineParam((p: any) => ({ ...p, test_type: value, page_num: 1 }))
                }} />,
        },
        {
            title: <FormattedMessage id="analysis.creator_name" />,
            width: 80,
            ellipsis: {
                shwoTitle: false,
            },
            dataIndex: 'creator_name',
            ...getUserFilter(baselineParam, setBaselineParam, 'creator'),
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

    const selectedChange = (record: any, selected: any) => {
        const selectKey = tabKey === '1' ? selectedRowKeys : selectedBaselineKeys
        const selectRow = tabKey === '1' ? selectRowData : selectedBaselineData
        // 去掉未选组的job 开始
        let arrKeys = _.cloneDeep(selectKey)
        let arrData = _.cloneDeep(selectRow)
        if (selected) {
            arrKeys = [...arrKeys, record.id]
            arrData = [...arrData, record]
        } else {
            arrKeys = arrKeys.filter((keys: any) => Number(keys) !== Number(record.id))
            arrData = arrData.filter((obj: any) => obj && Number(obj.id) !== Number(record.id))
        }
        if (tabKey === '1') {
            setSelectedRowKeys(arrKeys);
            setSelectRowData(arrData);
        } else {
            setSelectedBaselineKeys(arrKeys);
            setSelectedBaselineData(arrData);
        }
    }

    const handleSelectCancle = () => {
        setSelectedRowKeys([]);
        setSelectRowData([]);
    }

    const handleCancle = () => {
        onCancel()
    }

    const handleOk = () => {
        const groupData = _.cloneDeep(currentGroup)
        if (tabKey === '1') {
            groupData.members = _.isArray(groupData.members) ? [...groupData.members, ...selectRowData] : selectRowData
            groupData.type = 'job'
            if (groupData.members.length > 0) {
                groupData.product_version = groupData.members[0].product_version
                groupData.product_id = groupData.members[0].product_id
            }
        } else {
            groupData.members = _.isArray(groupData.members) ? [...groupData.members, ...selectedBaselineData] : selectedBaselineData
            groupData.type = 'baseline'
        }

        onOk(groupData)
    }

    const allSelectFn = (allData: any) => {
        const arr = _.isArray(allData) ? allData : []
        const keysArr: any = []
        arr.forEach((item: any) => keysArr.push(item.id))
        if (tabKey === '1') {
            setSelectedRowKeys([...selectedRowKeys, ...keysArr])
            setSelectRowData([...selectRowData, ...arr])
        } else {
            setSelectedBaselineKeys([...selectedBaselineKeys, ...keysArr])
            setSelectedBaselineData([...selectedBaselineData, ...arr])
        }
    }

    const cancleAllSelectFn = (allData: any) => {
        const arr = _.isArray(allData) ? allData : []
        const keysArr: any = []
        arr.forEach((item: any) => keysArr.push(item.id))
        if (tabKey === '1') {
            setSelectedRowKeys(_.difference(selectedRowKeys, keysArr))
            setSelectRowData(_.differenceBy(selectRowData, arr, 'id'))
        } else {
            setSelectedBaselineKeys(_.difference(selectedRowKeys, keysArr))
            setSelectedBaselineData(_.differenceBy(selectRowData, arr, 'id'))
        }
    }

    const rowSelection = {
        selectedRowKeys,
        getCheckboxProps: (record: any) => {
            // 有用
            let flag = !["success", "fail"].includes(record.state)
            const selProductId = pruductId || _.get(selectRowData[0], 'product_id')
            if (selProductId) flag = _.get(record, 'product_id') !== selProductId

            return ({
                disabled: flag, // Column configuration not to be checked
                name: record.name,
            })
        },
        preserveSelectedRowKeys: false,
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

    const baselineSelection = {
        selectedRowKeys: selectedBaselineKeys,
        preserveSelectedRowKeys: false,
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

    // 滚动条参数
    const scroll = {
        // 最大高度，内容超出该高度会出现滚动条
        height: maxHeight - 339 > 430 ? 430 : maxHeight - 339,
        // height: scollMaxHeight
    }

    const testData = _.isArray(dataSource.data) ? dataSource.data : []
    const baseData = _.isArray(baselineData.data) ? baselineData.data : []
    const commonCur = currentGroup && _.get(currentGroup, 'members').length
    // 产品版本disable逻辑
    const flag = commonCur || tabKey === '2'
    const jobDisable = ((!!selectedBaselineData.length) || (currentGroup.type === 'baseline'))
    const baselineDisable = ((!!selectRowData.length) || (currentGroup.type === 'job'))
    return (
        <div className={styles.list_container} id="list_container">
            <div className={styles.select_product}>
                <Row>
                    <Col span={12} >
                        <span><FormattedMessage id="analysis.product.label" /></span>
                        <Select
                            showSearch
                            style={{ width: 'calc(100% - 75px)' }}
                            placeholder={formatMessage({ id: 'analysis.product.placeholder' })}
                            // defaultValue={product_id ? pruductName : pruductId}
                            value={pruductId}
                            optionFilterProp="children"
                            onSelect={onProductChange}
                            disabled={flag}
                            filterOption={(input, option: any) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            options={
                                allProduct?.map((item: any) => ({
                                    value: item.id,
                                    label: item.name
                                }))
                            }
                        />
                    </Col>
                    <Col span={12} >
                        <span><FormattedMessage id="analysis.version.label" /></span>
                        <Select
                            showSearch
                            style={{ width: `calc(100% - ${getLocale() === 'en-US' ? 120 : 75}px)` }}
                            placeholder={formatMessage({ id: 'analysis.version.placeholder' })}
                            value={pruductVersion}
                            optionFilterProp="children"
                            onSelect={onChange}
                            disabled={flag}
                            filterOption={(input, option: any) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            options={
                                allVersion?.map((item: any) => ({
                                    value: item,
                                    label: item
                                }))
                            }
                        />
                    </Col>
                </Row>
                <Tabs activeKey={tabKey} className={styles.job_test} onChange={handleTabSwitch}>
                    <Tabs.TabPane tab={<FormattedMessage id="analysis.job.data" />} key="1" disabled={jobDisable}>
                        <Scrollbars style={scroll} className={styles.scroll}>
                            <ResizeHooksTable
                                rowSelection={rowSelection as any}
                                rowKey='id'
                                name="ws-analysis-compare-job-add"
                                refreshDeps={[ws_id, params]}
                                columns={columns as any}
                                loading={loading}
                                dataSource={testData}
                                pagination={false}
                                size="small"
                            />
                        </Scrollbars>
                        <CommonPagination
                            total={dataSource.total}
                            currentPage={params && params.page_num}
                            pageSize={params && params.page_size}
                            onPageChange={(page_num, page_size) => {
                                let paramsCopy = _.cloneDeep(params)
                                paramsCopy = { ...paramsCopy, page_num, page_size }
                                setParams(paramsCopy)
                            }}
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={<FormattedMessage id="analysis.baseline.data" />} key="2" disabled={baselineDisable}>
                        <Scrollbars style={scroll} className={styles.scroll}>
                            <ResizeHooksTable
                                rowSelection={baselineSelection as any}
                                rowKey='id'
                                name="ws-analysis-compare-baseline-add"
                                columns={baselineColumns as any}
                                refreshDeps={[baselineParam, ws_id]}
                                loading={loading}
                                dataSource={baseData}
                                pagination={false}
                                size="small"
                            />
                        </Scrollbars>
                        <CommonPagination
                            total={baselineData.total}
                            currentPage={baselineParam.page_num}
                            pageSize={baselineParam.page_size}
                            onPageChange={(page_num, page_size) =>
                                setBaselineParam((p: any) => ({ ...p, page_num, page_size }))
                            }
                        />
                    </Tabs.TabPane>
                </Tabs>
            </div>
            <Divider className={styles.footer_line} />
            <div className={styles.footer}>
                <span>
                    <span><FormattedMessage id="analysis.selected" /></span>
                    <span className={styles.text_num}>{tabKey === '1' ? `${selectRowData.length}` : `${selectedBaselineData.length}`}</span>
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
