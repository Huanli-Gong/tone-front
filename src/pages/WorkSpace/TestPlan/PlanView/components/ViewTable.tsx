import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Space, Table, Popconfirm, message, Spin, Tooltip } from 'antd'
import styled from 'styled-components'
import { StateTagRender, RenderCountTags } from './'
import { useRequest, history, Access, useAccess } from 'umi'
import { queryPlanResult, deletePlanInstance } from '../services'
import CommonPagination from '@/components/CommonPagination'
import { getSearchFilter, getCheckboxFilter } from '@/components/TableFilters'
import CompareBar from './compareBar'
import styles from './compareBar.less'
import _ from 'lodash'
import { requestCodeMessage, matchRoleEnum } from '@/utils/utils'
import ViewReport from '@/pages/WorkSpace/TestResult/CompareBar/ViewReport'
import ResizeTable from '@/components/ResizeTable'
const OptionButton = styled.span`
    color:#1890FF;
    cursor:pointer;
`
interface ViewTableProps {
    plan_id: string | number
    ws_id: string
    showPagination?: boolean
}

const ViewAllPlan = styled.div`
    height : 36px;
    width : 100%;
    text-align:center;
    cursor:pointer;
    line-height:36px;
    color:rgba(0,0,0,.65);
    border-top:1px solid #f0f0f0;
`

const ViewTable = (props: ViewTableProps) => {
    // 权限
    const { currentRole, currentRoleId } = matchRoleEnum();
    const limitAuthority = ['ws_tester', 'ws_tester_admin', 'sys_admin'].includes(currentRole);
    const access = useAccess()
    const { plan_id, ws_id, showPagination = false } = props
    const [pageParam, setPageParam] = useState<any>({ page_size: 10, page_num: 1, ws_id, plan_id })
    const [selectedRowKeys, setSelectedRowKeys] = useState<any>([])
    const [allGroup, setAllGroup] = useState<any>([])

    const { data, run, loading, refresh } = useRequest(
        (params: any) => queryPlanResult(params),
        {
            initialData: { data: [], total: 1 },
            manual: true,
            formatResult: ret => ret
        }
    )
    useEffect(() => {
        // console.log('pageParam:', pageParam)
        run(pageParam)
        // 过滤筛选
    }, [plan_id, pageParam.name, pageParam.state])
    const getWidth = () => {
        const arr = data && _.isArray(data.data) ? data.data : [];
        const flag = arr.some((item: any) => _.get(item, 'report_li') && item.report_li.length)
        return flag ? 150 : 100

    }
    const hanldeOpenPlanDetail = useCallback((row) => {
        history.push(`/ws/${ws_id}/test_plan/view/detail/${row.id}`)
    }, [])

    const hanldeDeletePlan = async (row: any) => {
        const { code, msg } = await deletePlanInstance({ plan_instance_id: row.id, ws_id })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        refresh()
        message.success('操作成功')
    }

    let columns = [
        {
            dataIndex: 'name',
            title: '计划名称',
            ellipsis: {
                showTitle: false
            },
            render: (_: string, record: any) => (
                <span
                    style={{ cursor: 'pointer' }}
                    onClick={
                        () => hanldeOpenPlanDetail(record)
                    }
                >
                    {_ || '-'}
                </span>
            ),
            ...getSearchFilter(pageParam, setPageParam, 'name')
        }, {
            dataIndex: 'state',
            title: '状态',
            width: 120,
            render(_: string) {
                return <StateTagRender state={_} />
            },
            ...getCheckboxFilter(
                pageParam,
                setPageParam,
                [
                    { name: 'Complate', value: 'success' },
                    { name: 'Fail', value: 'fail' },
                    { name: 'Running', value: 'running' },
                    { name: 'Pedding', value: 'pedding' },
                ],
                'state'
            )
        }, {
            title: '总计/成功/失败',
            width: 180,
            render: (row: any) => (
                <RenderCountTags {...row.statistics} />
            )
        }, {
            dataIndex: 'trigger_name',
            width: 100,
            title: '触发者',
            ellipsis: {
                showTitle: false,
            },
            render(_: string = '-') {
                return (
                    <Tooltip placement='topLeft' title={_}>
                        {_}
                    </Tooltip>
                )
            }
        }, {
            dataIndex: 'start_time',
            title: '开始时间',
            width: 180
        }, {
            dataIndex: 'end_time',
            title: '完成时间',
            width: 180
        },
        access.wsRoleContrl() &&
        {
            title: '操作',
            width: 150,
            ellipsis: {
                showTitle: false
            },
            className: 'option',
            render(row: any) {
                return (
                    <Space>
                        <OptionButton
                            className="option-detail"
                            onClick={
                                () => hanldeOpenPlanDetail(row)
                            }
                        >
                            详情
                        </OptionButton>
                        <Access
                            accessible={access.wsRoleContrl(row.creator)}
                            fallback={<span style={{ color: '#ccc', cursor: 'not-allowed' }}>删除</span>}
                        >
                            <Popconfirm
                                title="确认删除该计划吗？"
                                okText="确认"
                                cancelText="取消"
                                onConfirm={() => hanldeDeletePlan(row)}
                            >
                                <OptionButton className="option-delete">删除</OptionButton>
                            </Popconfirm>
                        </Access>
                        <ViewReport
                            className={'option-detail'}
                            dreType="left"
                            title={'报告'}
                            ws_id={ws_id}
                            jobInfo={row}
                            origin={'jobList'}
                        />
                    </Space>
                )
            }
        }
    ].filter(Boolean);

    const handleCancle = () => {
        setSelectedRowKeys([])
        setAllGroup([])
    }

    const containerRef = useRef<any>(null)

    const [layoutWidth, setLayoutWidth] = useState(0)

    const resultColumns = useMemo(() => {
        if (layoutWidth) {
            const countWidth = columns.reduce((pre: any, cur: any) => pre += (cur.width ? cur.width : 0), 0)
            const nameWidth = layoutWidth - countWidth
            return columns.map((item: any) => item.dataIndex === 'name' ? { ...item, width: nameWidth } : item)
        }
        return columns
    }, [layoutWidth])

    const hanldeReizeLayout = () => {
        setLayoutWidth(containerRef.current.clientWidth)
    }

    useEffect(() => {
        containerRef.current && hanldeReizeLayout()
        window.addEventListener('resize', hanldeReizeLayout)
        return () => {
            window.removeEventListener('resize', hanldeReizeLayout)
        }
    }, [])

    const hanldeViewAll = useCallback(
        (id: any) => {
            history.push(`/ws/${ws_id}/test_plan/view/summary/${id}`)
        }, [ws_id]
    )

    return (
        <div ref={containerRef} className={styles.list_container}>
            <Spin spinning={loading}>
                <ResizeTable
                    className={styles.ViewTableStyle}
                    columns={resultColumns}
                    dataSource={data.data}
                    size="small"
                    pagination={false}
                    rowKey="id"
                />
                {
                    showPagination &&
                    <CommonPagination
                        total={data.total}
                        pageSize={pageParam.page_size}
                        currentPage={pageParam.page_num}
                        onPageChange={
                            (page_num, page_size) => {
                                const param = { page_num, page_size, ws_id, plan_id }
                                setPageParam(param)
                                run(param)
                            }
                        }
                    />
                }
                <CompareBar
                    selectedRowKeys={selectedRowKeys}
                    allGroup={allGroup}
                    wsId={ws_id}
                    selectedChange={handleCancle}
                />
                {
                    showPagination ? null
                        : (data.total > 10 && <ViewAllPlan onClick={() => hanldeViewAll(plan_id)}>查看全部</ViewAllPlan>)
                }
            </Spin>
        </div>
    )
}

export default ViewTable

/* const selectedChange = (record: any, selected: any) => {
    // 去掉未选组的job 开始
    let arrKeys = _.cloneDeep(selectedRowKeys)
    let arrData: any = _.cloneDeep(allGroup)
    if (selected) {
        arrKeys = [...arrKeys, record.id]
        arrData = [...arrData, { id: record.id, job_total: record.job_total }]
    } else {
        arrKeys = arrKeys.filter((keys: any) => Number(keys) !== Number(record.id))
        arrData = arrData.filter((obj: any) => Number(obj.id) !== Number(record.id))
    }
    setSelectedRowKeys(arrKeys);
    setAllGroup(arrData)
}

const allSelectFn = (allData: any) => {
    const arr = _.isArray(allData) ? allData : []
    const keysArr: any = []
    const groupData: any = []
    arr.forEach((item: any) => {
        keysArr.push(item.id)
        groupData.push({ id: item.id, job_total: item.job_total })
    })
    let arrKeys = _.cloneDeep(selectedRowKeys)
    let arrData: any = _.cloneDeep(allGroup)
    setSelectedRowKeys([...arrKeys, ...keysArr])
    setAllGroup([...arrData, ...groupData])
}
const cancleAllSelectFn = (allData: any) => {
    const arr = _.isArray(allData) ? allData : []
    const keysArr: any = []
    arr.forEach((item: any) => keysArr.push(item.id))
    setSelectedRowKeys(_.difference(_.cloneDeep(selectedRowKeys), keysArr))
    setAllGroup(_.differenceBy(_.cloneDeep(allGroup), arr, 'id'))
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
}; */