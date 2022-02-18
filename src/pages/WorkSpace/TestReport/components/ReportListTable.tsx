import React, { memo, useEffect, useState, useMemo } from 'react'
import { Space, Popconfirm, message, Spin, DatePicker, Row, Col } from 'antd'
import { OptBtn, TableContainer, ClsResizeTable } from './styled'
import { useRequest, history, Access, useAccess } from 'umi'
import { FilterFilled } from '@ant-design/icons';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import Highlighter from 'react-highlight-words'
import SearchInput from '@/components/Public/SearchInput'
import SelectProject from '@/components/Public/SelectProject'
import SelectUser from '@/components/Public/SelectUser'
import SelectProductVersion from '@/components/Public/SelectProductVersion'
import CommonPagination from '@/components/CommonPagination'
import { queryReportList, delReportList, } from '../services'
import _ from 'lodash'
import { requestCodeMessage, matchRoleEnum } from '@/utils/utils';
const { RangePicker } = DatePicker
const ReportListTable = (props: any) => {
    // 权限
    //const { currentRole, currentRoleId } = matchRoleEnum();
    //const limitAuthority =['ws_tester', 'ws_tester_admin', 'sys_admin'].includes(currentRole);
    const access = useAccess()
    const { ws_id, tab, tableHeght } = props
    const [autoFocus, setFocus] = useState(true)
    const defaultParmas = {
        name: '',
        project_id: [],  //创建人id
        product_version: '',
        creator: [],
        page_num: 1,
        page_size: 10,
        ws_id,
    }

    const [fetchParams, setFetchParams] = useState<any>()
    const fetchParamsData = fetchParams || defaultParmas

    const { data, loading, run, refresh, params } = useRequest(
        (data: any) => queryReportList(data),
        {
            formatResult: (response: any) => response,
            initialData: { data: [], total: 0 },
            defaultParams: [{ ws_id: ws_id, page_size: 10, page_num: 1 }]
        }
    )
    useEffect(() => {
        setFetchParams(defaultParmas)
    }, [tab])
    const handleReportDel = async (id: any) => {
        try {
            const { code, msg } = await delReportList({ report_id: id })
            if (code === 200) {
                message.success('删除成功')
                const num = data.total % data.page_size
                if (Math.ceil(data.total / data.page_size) === data.page_num && num === 1) // 删除的是最后一页的最后一条且最后一页只有一条
                {
                    updateFetchParams({ page_num: data.page_num - 1 > 1 ? data.page_num - 1 : 1 })
                }

                else {
                    refresh()
                }

            } else {
                requestCodeMessage(code, msg)
            }
        } catch (e) {
            console.log(e)
            message.error('删除失败')
        }
    }
    const styleObj = {
        container: 180,
        button_width: 90
    }
    const updateFetchParams = (obj = {}) => {
        setFetchParams({ ...fetchParamsData, ...obj })
        run({ ...fetchParamsData, ...obj })
    }
    const handleMemberFilter = (val: [], name: string) => {
        let searchVal: any = _.isArray(val) ? val : []
        const obj = {}
        obj[name] = searchVal;
        updateFetchParams(obj)
    }
    const handleProjectFilter = (val: [], name: string) => {
        let searchVal: any = _.isArray(val) ? val : []
        const obj = {}
        obj[name] = searchVal;
        updateFetchParams(obj)
    }
    const handleVersiontFilter = (val: any, name: string) => {
        const obj = {}
        obj[name] = val;
        updateFetchParams(obj)
    }
    const handleSelectTime = (date: any, dateStrings: any, confirm: any) => {
        const start_time = dateStrings[0]
        const end_time = dateStrings[1]
        if (!start_time && !end_time) updateFetchParams({ gmt_modified: null })
        if (start_time && end_time) updateFetchParams({ gmt_modified: JSON.stringify({ start_time, end_time }) })
        confirm()
    }

    const dataSource = useMemo(() => {
        return data && _.isArray(data.data) ? data.data : []
    }, [data])

    const columns: any = [{
        dataIndex: 'name',
        title: '报告名称',
        width: 200,
        ellipsis: {
            shwoTitle: false,
        },
        className: 'no_tourist',
        filterDropdown: ({ confirm }: any) => <SearchInput
            confirm={confirm}
            autoFocus={autoFocus}
            styleObj={styleObj}
            onConfirm={(val: any) => { updateFetchParams({ name: val }) }}
            currentData={{ tab }}
            placeholder="支持报告名称"
        />,
        onFilterDropdownVisibleChange: (visible: any) => {
            if (visible) {
                setFocus(!autoFocus)
            }
        },
        filterIcon: () => <FilterFilled style={{ color: fetchParamsData.name ? '#1890ff' : undefined }} />,
        render: (_: any, row: any) => {
            return (
                <PopoverEllipsis title={_ || '-'} >
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[fetchParamsData.name || '']}
                        autoEscape
                        textToHighlight={_ || '-'}
                        onClick={() => window.open(`/ws/${ws_id}/test_report/${row.id}/?cid=${row.creator_id}`)}
                    />
                </PopoverEllipsis>
            )
        }
    },
    {
        title: '所属项目',
        ellipsis: {
            shwoTitle: false,
        },
        width: 150,
        dataIndex: 'project',
        filterDropdown: ({ confirm }: any) => <SelectProject autoFocus={autoFocus} confirm={confirm} onConfirm={(val: []) => handleProjectFilter(val, 'project_id')} page_size={9999} ws_id={ws_id} />,
        onFilterDropdownVisibleChange: (visible: any) => {
            if (visible) {
                setFocus(!autoFocus)
            }
        },
        filterIcon: () => <FilterFilled style={{ color: fetchParamsData.project_id.length ? '#1890ff' : undefined }} />,
        render: (_: any) => <PopoverEllipsis title={_ || '-'} />
    }, {
        dataIndex: 'product_version',
        ellipsis: {
            shwoTitle: false,
        },
        width: 150,
        title: '产品版本',
        filterDropdown: ({ confirm }: any) => <SelectProductVersion autoFocus={autoFocus} confirm={confirm} onConfirm={(val: []) => handleVersiontFilter(val, 'product_version')} page_size={9999} ws_id={ws_id} />,
        onFilterDropdownVisibleChange: (visible: any) => {
            if (visible) {
                setFocus(!autoFocus)
            }
        },
        filterIcon: () => <FilterFilled style={{ color: fetchParamsData.product_version ? '#1890ff' : undefined }} />,
        render: (_: any) => <PopoverEllipsis title={_ || '-'} />
    }, {
        dataIndex: 'creator',
        width: 150,
        title: '创建人',
        filterDropdown: ({ confirm }: any) => <SelectUser autoFocus={autoFocus} confirm={confirm} onConfirm={(val: []) => handleMemberFilter(val, 'creator')} page_size={9999} />,
        onFilterDropdownVisibleChange: (visible: any) => {
            if (visible) {
                setFocus(!autoFocus)
            }
        },
        filterIcon: () => <FilterFilled style={{ color: fetchParamsData.creator && fetchParamsData.creator.length ? '#1890ff' : undefined }} />,
        render: (_: any) => <PopoverEllipsis title={_ || '-'} />
    }, {
        dataIndex: 'description',
        width: 200,
        title: '描述',
        ellipsis: {
            shwoTitle: false,
        },
        render: (_: any) => <PopoverEllipsis title={_ || '-'} />
    }, {
        dataIndex: 'gmt_modified',
        width: 200,
        title: '保存时间',
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
        filterIcon: () => <FilterFilled style={{ color: fetchParamsData.gmt_modified ? '#1890ff' : undefined }} />,
        ellipsis: true,
        render: (record: any) => {
            return record || '-'
        }

    },
    access.wsRoleContrl() && {
        title: '操作',
        width: 200,
        fixed: 'right',
        render(row: any) {
            const id = _.get(row, 'id')
            return (
                <Access
                    accessible={access.wsRoleContrl(row.creator_id)}
                    fallback={
                        <Space>
                            <OptBtn style={{ color: '#ccc', cursor: 'not-allowed' }}>编辑</OptBtn>
                            <OptBtn style={{ color: '#ccc', cursor: 'not-allowed' }}>删除</OptBtn>
                        </Space>
                    }
                >
                    <Space>
                        <OptBtn onClick={() => window.open(`/ws/${ws_id}/test_report/${id}/edit`)}>编辑</OptBtn>
                        <Popconfirm
                            title="确认删除该报告吗？"
                            okText="确认"
                            cancelText="取消"
                            onConfirm={_.partial(handleReportDel, id || '')}
                        >
                            <OptBtn>删除</OptBtn>
                        </Popconfirm>
                    </Space>
                </Access>
            )
        }
    }].filter(Boolean);

    return (
        <Spin spinning={loading}>
            <ClsResizeTable
                size="small"
                rowKey="id"
                columns={columns}
                pagination={false}
                dataSource={dataSource}
                scroll={{
                    x: 'max-content'
                }}
            />

            <CommonPagination
                total={data.total}
                currentPage={params[0] && params[0].page_num}
                pageSize={params[0] && params[0].page_size}
                onPageChange={
                    (page_num, page_size) => updateFetchParams({ page_num, page_size })
                }
            />
        </Spin>
    )
}

export default memo(ReportListTable)
