import React, { useState, useEffect } from 'react';
import { useClientSize } from '@/utils/hooks';
import { useIntl, FormattedMessage, useParams } from 'umi'
import { queryBaelineList, queryProductList } from './services'
import styles from './index.less'
import CommonPagination from '@/components/CommonPagination';
import { Scrollbars } from 'react-custom-scrollbars';
import _ from 'lodash'
import { Table, Select, Divider, Space, Button } from 'antd';
import { resizeDocumentHeight } from './CommonMethod'
import { requestCodeMessage } from '@/utils/utils';

const { Option } = Select;
const defaultResult = {
    all_job: 0,
    data: [],
    fail_job: 0,
    my_job: 0,
    pending_job: 0,
    running_job: 0,
    stop_job: 0,
    success_job: 0,
}
export default (props: any) => {
    const { ws_id } = useParams() as any
    const { formatMessage } = useIntl()
    const { height: layoutHeight } = useClientSize()
    const maxHeight = layoutHeight >= 728 ? layoutHeight - 128 : 600
    const scollMaxHeight = maxHeight - 339 > 430 ? 430 : maxHeight - 339
    resizeDocumentHeight(scollMaxHeight)
    const { onCancel, onOk, currentGroup } = props
    const defaultVersion = currentGroup && _.get(currentGroup, 'members[0].version')
    const selectedId: any = []
    if (currentGroup && _.isArray(currentGroup.members)) {
        currentGroup.members.forEach((value: any) => selectedId.push(value.id))
    }
    const page_default_params: any = { page_num: 1, page_size: 10, ws_id, filter_version: defaultVersion || '', filter_id: selectedId.join(',') }

    const [dataSource, setDataSource] = useState(defaultResult)
    const [loading, setLoading] = useState(false)
    const [params, setParams] = useState(page_default_params)
    const [pruductVersion, setPruductVersion] = useState(defaultVersion || '')
    const [allVersion, setAllVersion] = useState([])
    let [selectedRowKeys, setSelectedRowKeys] = useState<any>([])
    let [selectRowData, setSelectRowData] = useState<any>([])

    const getBaseList = async (params: any) => {
        let data = await queryBaelineList(params)
        defaultOption(data)
    }
    const getProductList = async () => {
        let result = await queryProductList({ ws_id })
        if (result.code === 200) {
            let data = result.data.filter((val: any) => val.trim())
            data = data.map((item: any, index: number) => ({ label: index, value: item }))
            setAllVersion(data)
            if (data.length) setPruductVersion(data[0].value)

        } else {
            requestCodeMessage(result.code, result.msg)
        }
        defaultOption(result)
    }

    useEffect(() => {
        setLoading(true)
        if (pruductVersion) {
            getBaseList(params)
        } else {
            getProductList()
        }

    }, [params])
    useEffect(() => {
        let paramsCopy = _.cloneDeep(params)
        paramsCopy = { ...paramsCopy, ws_id }
        setParams(paramsCopy)
    }, [ws_id])

    useEffect(() => {
        const paramsCopy = _.cloneDeep(params)
        setParams({ ...paramsCopy, filter_version: pruductVersion })
    }, [pruductVersion])

    useEffect(() => {
        const emptyDom: any = document.querySelector('#list_container table .ant-empty-normal')
        if (emptyDom) {
            const scollHeight = maxHeight - 339 > 430 ? 430 : maxHeight - 339
            const number = (scollHeight - 130) / 2
            emptyDom.style.margin = `${number}px 0`
        }
    }, [dataSource])

    const defaultOption = (ret: any) => {
        setLoading(false)
        if (ret.code === 200) {
            setDataSource(ret)
        } else {
            setDataSource(defaultResult)
            requestCodeMessage(ret.code, ret.msg)
        }
    }
    const onChange = (value: any) => {
        setPruductVersion(value)
        setSelectedRowKeys([]);
        setSelectRowData([]);
    }

    const columns = [
        {
            title: <FormattedMessage id="analysis.baseline.name" />,
            dataIndex: 'name',
            width: 80,
        },
        {
            title: <FormattedMessage id="analysis.test_type" />,
            width: 100,
            dataIndex: 'test_type',
            render: (record: any) => {
                console.log(record)
                return record === 'performance' ? <FormattedMessage id="header.test_type.performance" /> : <FormattedMessage id="header.test_type.functional" />
            }
        },
        {
            title: <FormattedMessage id="analysis.creator_name" />,
            width: 80,
            dataIndex: 'creator_name',
            render: (record: any) => {
                return record || '-'
            }
        },
        {
            title: <FormattedMessage id="analysis.gmt_created" />,
            width: 180,
            dataIndex: 'gmt_created',
            ellipsis: true,
            render: (record: any) => {
                return record || '-'
            }
        },
    ]
    const selectedChange = (record: any, selected: any) => {
        // 去掉未选组的job 开始
        let arrKeys = _.cloneDeep(selectedRowKeys)
        let arrData = _.cloneDeep(selectRowData)
        if (selected) {
            arrKeys = [...arrKeys, record.id]
            arrData = [...arrData, record]
        } else {
            arrKeys = arrKeys.filter((keys: any) => Number(keys) !== Number(record.id))
            arrData = arrData.filter((obj: any) => obj && Number(obj.id) !== Number(record.id))
        }
        setSelectedRowKeys(arrKeys);
        setSelectRowData(arrData);
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
        groupData.members = _.isArray(groupData.members) ? [...groupData.members, ...selectRowData] : selectRowData
        onOk(groupData)
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
    const rowSelection = {
        selectedRowKeys,
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
    }

    return (
        <div className={styles.list_container} id='list_container'>
            <div className={styles.select_product}>
                <span><FormattedMessage id="analysis.version.label" /></span>
                <Select
                    showSearch
                    style={{ width: 'calc(100% - 70px)' }}
                    placeholder={formatMessage({ id: 'analysis.version.placeholder' })}
                    defaultValue={pruductVersion}
                    value={pruductVersion}
                    optionFilterProp="children"
                    onChange={onChange}
                    disabled={defaultVersion}
                    filterOption={(input, option: any) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {
                        allVersion.map((item: any) => <Option value={item.value} key={item.label}>{item.value}</Option>)
                    }
                </Select>
                <div className={styles.job_text}><FormattedMessage id="analysis.baseline.table" /></div>
                <Divider className={styles.line} />
            </div>
            <Scrollbars style={scroll}>
                <Table
                    rowSelection={rowSelection}
                    rowKey='id'
                    columns={columns}
                    loading={loading}
                    dataSource={_.isArray(dataSource.data) ? dataSource.data : []}
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
