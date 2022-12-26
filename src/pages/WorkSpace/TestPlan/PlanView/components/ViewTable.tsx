import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Space, Popconfirm, message, Spin, Tooltip } from 'antd'
import styled from 'styled-components'
import { StateTagRender, RenderCountTags } from './'
import { useRequest, history, Access, useAccess, useIntl, FormattedMessage } from 'umi'
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
    const { formatMessage } = useIntl()
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

    const hanldeDeletePlan = async (row: any) => {
        const { page_size } = pageCurrent.current
        const { code, msg } = await deletePlanInstance({ plan_instance_id: row.id, ws_id })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        callBackViewTotal()
        setPageParam({ ...pageParam, page_num: handlePageNum(pageCurrent, totalCurrent), page_size })
        message.success(formatMessage({ id: 'plan.operation.success' }))
    }

    const [columns, setColumns] = React.useState([
        {
            dataIndex: 'name',
            title: <FormattedMessage id="plan.plan.name" />,
            ellipsis: {
                showTitle: false
            },
            className: 'plan_name_hover',
            render: (_: string, record: any) => (
                <span
                    onClick={
                        () => hanldeOpenPlanDetail(record)
                    }
                >
                    {_ || '-'}
                </span>
            ),
            ...getSearchFilter(pageParam, setPageParam, 'name')
        },
        {
            dataIndex: 'state',
            title: <FormattedMessage id="plan.state" />,
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
        },
        {
            title: <FormattedMessage id="plan.total/success/failure" />,
            width: 180,
            render: (row: any) => (
                <RenderCountTags {...row.statistics} />
            )
        },
        {
            dataIndex: 'trigger_name',
            width: 100,
            title: <FormattedMessage id="plan.trigger" />,
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
        },
        {
            dataIndex: 'start_time',
            title: <FormattedMessage id="plan.start_time" />,
            width: 180
        },
        {
            dataIndex: 'end_time',
            title: <FormattedMessage id="plan.end_time" />,
            width: 180
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
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
                            <FormattedMessage id="operation.detail" />
                        </OptionButton>
                        <Access accessible={access.WsTourist()}>
                            <Access
                                accessible={access.WsMemberOperateSelf(row.creator)}
                                fallback={<OptionButton className="option-delete" onClick={() => AccessTootip()}><FormattedMessage id="operation.delete" /></OptionButton>}
                            >
                                <Popconfirm
                                    title={<FormattedMessage id="delete.prompt" />}
                                    okText={<FormattedMessage id="operation.ok" />}
                                    cancelText={<FormattedMessage id="operation.cancel" />}
                                    onConfirm={() => hanldeDeletePlan(row)}
                                >
                                    <OptionButton className="option-delete"><FormattedMessage id="operation.delete" /></OptionButton>
                                </Popconfirm>
                            </Access>
                        </Access>
                        <ViewReport
                            className={'option-detail'}
                            dreType="left"
                            title={formatMessage({ id: 'plan.report' })}
                            ws_id={ws_id}
                            jobInfo={row}
                            origin={'jobList'}
                        />
                    </Space>
                )
            }
        }
    ])

    const handleCancle = () => {
        setSelectedRowKeys([])
        setAllGroup([])
    }

    const containerRef = useRef<any>(null)

    /* const [layoutWidth, setLayoutWidth] = useState(0)

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
    }, []) */

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
                    rowClassName={styles.result_table_row}
                    columns={columns}
                    setColumns={setColumns}
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