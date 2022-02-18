import React, { useState, useEffect } from 'react'
import { Table } from 'antd'
import { useRequest } from 'umi'
import _ from 'lodash'
import { queryPlanResultList } from '../services'

import SearchInput from '@/components/Public/SearchInput'
import { FilterFilled } from '@ant-design/icons'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import Highlighter from 'react-highlight-words'
const styleObj = {
    container: 230,
    button_width: 115
}
const ViewTable = (props: any) => {
    const { planId, wsId, setSelectedRowFn, selectedRow, } = props
    const selectedPlanId = window.sessionStorage.getItem('selectedPlanId') || '' // 已选的计划Id
    const page_default_params = { plan_id: planId, ws_id: wsId, page_num: 1, page_size: 9999 }
    let [selectedRowKeys, setSelectedRowKeys] = useState<any>([])
    const [autoFocus, setFocus] = useState(true)
    const [params, setParams] = useState(page_default_params)
    const { data: dataSource, loading, run } = useRequest(
        (data) => queryPlanResultList(data),
        {
            formatResult: response => response,
            initialData: { data: [], total: 0 },
            defaultParams: [page_default_params]
        }
    )
    useEffect(() => {
        if (JSON.stringify(selectedRow) === '{}') {
            setSelectedRowKeys([])
        }
    }, [selectedRow])

    const selectedChange = (record: any, selected: any) => {
        // 去掉未选组的job 开始
        let arrKeys = _.cloneDeep(selectedRowKeys)
        if (selected) {
            arrKeys = [...arrKeys, record.id]
        } else {
            arrKeys = arrKeys.filter((keys: any) => Number(keys) !== Number(record.id))
        }
        setSelectedRowKeys(arrKeys);
        setSelectedRowFn(planId, arrKeys)
    }

    const allSelectFn = (allData: any) => {
        const arr = _.isArray(allData) ? allData : []
        const keysArr: any = []
        arr.forEach((item: any) => keysArr.push(item.id))
        setSelectedRowKeys([...selectedRowKeys, ...keysArr])
        setSelectedRowFn(planId, [...selectedRowKeys, ...keysArr])
    }
    const cancleAllSelectFn = (allData: any) => {
        const arr = _.isArray(allData) ? allData : []
        const keysArr: any = []
        arr.forEach((item: any) => keysArr.push(item.id))
        setSelectedRowKeys(_.difference(selectedRowKeys, keysArr))
        setSelectedRowFn(planId, _.difference(selectedRowKeys, keysArr))
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
            // setSelectedRowKeys([])
            // setSelectedRowFn(planId,[])
        },
    };

    const columns = [{
        dataIndex: 'name',
        title: '计划名称',
        ellipsis: {
            shwoTitle: false,
        },
        filterDropdown: ({ confirm }: any) => <SearchInput
            confirm={confirm}
            autoFocus={autoFocus}
            styleObj={styleObj}
            onConfirm={(val: any) => { setParams({ ...params, name: val }); run({ ...params, name: val }) }}
            placeholder="支持搜索计划名称"
        />,
        onFilterDropdownVisibleChange: (visible: any) => {
            if (visible) {
                setFocus(!autoFocus)
            }
        },
        filterIcon: () => <FilterFilled style={{ color: params.name ? '#1890ff' : undefined }} />,
        render: (_: any, row: any) => {
            return (
                <PopoverEllipsis title={row.name} >
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[params.name || '']}
                        autoEscape
                        textToHighlight={row && row.name}
                    />
                </PopoverEllipsis>
            )
        }
    }, {
        dataIndex: 'start_time',
        title: '开始时间',
        width: 280,
        render: (record: any) => record || '_'
    }, {
        dataIndex: 'end_time',
        title: '完成时间',
        width: 280,
        render: (record: any) => record || '_'
    }]

    return (
        <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataSource.data}
            size="small"
            loading={loading}
            pagination={false}
            rowKey="id"
        />
    )
}

export default ViewTable
