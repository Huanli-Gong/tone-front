import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Space, Popconfirm, message, Spin, Tooltip } from 'antd'
import styled from 'styled-components'
import { StateTagRender, RenderCountTags } from './'
import { useRequest, history, Access, useAccess } from 'umi'
import { queryPlanResult, deletePlanInstance } from '../services'
import CommonPagination from '@/components/CommonPagination'
import { getSearchFilter, getCheckboxFilter } from '@/components/TableFilters'
import CompareBar from './compareBar'
import styles from './compareBar.less'
import _ from 'lodash'
import { requestCodeMessage, AccessTootip, handlePageNum, useStateRef } from '@/utils/utils'
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
    callBackViewTotal?: any
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
    const access = useAccess()
    const { plan_id, ws_id, showPagination = false, callBackViewTotal } = props
    const [pageParam, setPageParam] = useState<any>({ page_size: 10, page_num: 1, ws_id, plan_id })
    const [selectedRowKeys, setSelectedRowKeys] = useState<any>([])
    const [allGroup, setAllGroup] = useState<any>([])
    const pageCurrent = useStateRef(pageParam)
    const { data, run, loading } = useRequest(
        (params: any) => queryPlanResult(params),
        {
            initialData: { data: [] },
            manual: true,
            formatResult: ret => ret
        }
    )
    const totalCurrent = useStateRef(data)
    useEffect(() => {
        run(pageParam)
        // 过滤筛选
    }, [plan_id, pageParam])

    const hanldeOpenPlanDetail = useCallback((row) => {
        history.push(`/ws/${ws_id}/test_plan/view/detail/${row.id}`)
    }, [])
    
    const hanldeDeletePlan =  async(row: any) => {
        const { page_num, page_size } = pageCurrent.current
        const { total } = totalCurrent.current
        const { code, msg } = await deletePlanInstance({ plan_instance_id: row.id, ws_id })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        callBackViewTotal()
        setPageParam({ ...pageParam, page_num: handlePageNum(total, page_num, page_size)})
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
                        <Access accessible={access.WsTourist()}>
                            <Access
                                accessible={access.WsMemberOperateSelf(row.creator)}
                                fallback={<OptionButton className="option-delete" onClick={() => AccessTootip()}>删除</OptionButton>}
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
                                setPageParam({ ...pageParam, page_num, page_size })
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

export default ViewTable;