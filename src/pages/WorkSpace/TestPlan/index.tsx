/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'

import { useClientSize, writeDocumentTitle } from '@/utils/hooks'
import { Space, Tabs, Button, message, Popconfirm, Spin } from 'antd'
import { history, useIntl, FormattedMessage, Access, useAccess, useParams, useLocation } from 'umi'
import CommonPagination from '@/components/CommonPagination'

import styled from 'styled-components'
import PlanSettingDrawer from './components/PlanSettingDrawer'
import { queryPlanManageList, deleteTestPlan, copyTestPlan } from './services'
import { getUserFilter, getSearchFilter, getRadioFilter } from '@/components/TableFilters'
import { requestCodeMessage, AccessTootip } from '@/utils/utils'
import { ResizeHooksTable } from '@/utils/table.hooks'
import { tooltipTd } from '../TestResult/Details/components'

interface OptionBtnProp {
    disabled?: boolean
}

const OptButton = styled.span<OptionBtnProp>`
    color: #1890FF;
    margin-right: 10 ;
    cursor: pointer ;
    ${props => props.disabled && 'opacity: 0.25;'} 
`

const TestPlanManage = (props: any) => {
    const { formatMessage } = useIntl()
    const { route } = props
    const { ws_id } = useParams() as any
    const { query } = useLocation() as any
    const access = useAccess()
    writeDocumentTitle(`Workspace.TestPlan.${route.name}`)

    const { height: layoutHeight } = useClientSize()
    const viewSettingRef: any = useRef()
    const [data, setData] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [pageParams, setPageParams] = useState<any>(query && JSON.stringify(query) !== "{}" ? query : { ws_id, page_num: 1, page_size: 10 })

    const queryPlanList = async () => {
        const { code, msg, ...rest } = await queryPlanManageList(pageParams)
        if (code === 200) {
            setData(rest)
        } else {
            requestCodeMessage(code, msg)
        }
        setLoading(false)
    }

    useEffect(() => {
        queryPlanList()
    }, [pageParams])

    const handleRun = async (row: any) => {
        if (!row.enable) return;
        history.push(`/ws/${ws_id}/test_plan/${row.id}/run`, pageParams)
    }

    const handleView = (row: any) => {
        viewSettingRef.current.show(row)
    }

    const handleCopy = async (row: any) => {
        const { code, msg } = await copyTestPlan({ plan_id: row.id, ws_id })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        message.success(formatMessage({ id: 'request.copy.success' }))
        queryPlanList()
    }

    const handleEdit = (row: any) => {
        history.push(`/ws/${ws_id}/test_plan/${row.id}/edit`, pageParams)
    }

    const handleDelete = async (row: any) => {
        const { code, msg } = await deleteTestPlan({ plan_id: row.id, ws_id })
        if (code === 200) queryPlanList()
        else requestCodeMessage(code, msg)
    }

    const columns: any = [
        {
            dataIndex: 'name',
            title: <FormattedMessage id="plan.table.name" />,
            fixed: "left",
            width: 400,
            ...getSearchFilter(pageParams, setPageParams, 'name'),
            ...tooltipTd("-"),
        },
        {
            dataIndex: 'cron_info',
            title: <FormattedMessage id="plan.table.cron_info" />,
            width: 120,
            ...tooltipTd("-"),
        },
        {
            dataIndex: 'enable',
            title: <FormattedMessage id="plan.table.enable" />,
            width: 120,
            ellipsis: {
                showTitle: false
            },
            render: (_: any) => (
                _ ? <FormattedMessage id="operation.yes" /> : <FormattedMessage id="operation.no" />
                // <Badge status="processing" text="是" /> :
                // <Badge status="default" text="否" />
            ),
            ...getRadioFilter(
                pageParams,
                setPageParams,
                [
                    { name: <FormattedMessage id="operation.yes" />, value: 'True' },
                    { name: <FormattedMessage id="operation.no" />, value: 'False' }
                ],
                'enable'
            )
        },
        {
            dataIndex: 'creator_name',
            title: <FormattedMessage id="plan.table.creator_name" />,
            width: 120,
            ...tooltipTd("-"),
            ...getUserFilter(pageParams, setPageParams, 'creator_name')
        },
        {
            dataIndex: 'gmt_created',
            title: <FormattedMessage id="plan.table.gmt_created" />,
            width: 170,
            ...tooltipTd("-"),
        },
        {
            dataIndex: 'gmt_modified',
            title: <FormattedMessage id="plan.table.gmt_modified" />,
            ...tooltipTd("-"),
            width: 170,
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            fixed: "right",
            key: "operation",
            width: 220,
            render: (row: any, record: any) => (
                <Space>
                    <OptButton disabled={!row.enable} onClick={() => handleRun(row)}><FormattedMessage id="operation.run" /></OptButton>
                    <OptButton onClick={() => handleView(row)}><FormattedMessage id="operation.view" /></OptButton>
                    <OptButton onClick={() => handleCopy(row)}><FormattedMessage id="operation.copy" /></OptButton>
                    <Access accessible={access.WsTourist()}>
                        <Access
                            accessible={access.WsMemberOperateSelf(record.creator)}
                            fallback={
                                <Space>
                                    <OptButton onClick={() => AccessTootip()}><FormattedMessage id="operation.edit" /></OptButton>
                                    <OptButton onClick={() => AccessTootip()}><FormattedMessage id="operation.delete" /></OptButton>
                                </Space>
                            }
                        >
                            <Space>
                                <OptButton onClick={() => handleEdit(row)}><FormattedMessage id="operation.edit" /></OptButton>
                                <Popconfirm title={<FormattedMessage id="delete.prompt" />}
                                    onConfirm={() => handleDelete(row)}
                                    okText={<FormattedMessage id="operation.confirm" />}
                                    cancelText={<FormattedMessage id="operation.cancel" />}
                                >
                                    <OptButton><FormattedMessage id="operation.delete" /></OptButton>
                                </Popconfirm>
                            </Space>
                        </Access>
                    </Access>
                </Space>
            )
        }
    ]

    return (
        <Spin spinning={loading} >
            <div style={{ width: '100%', minHeight: layoutHeight - 50 }}>
                <div style={{ width: '100%', background: '#fff', minHeight: '100%' }}>
                    <Tabs
                        tabBarStyle={{
                            height: 64,
                            background: '#FAFBFC'
                        }}
                        tabBarExtraContent={
                            <Button
                                type="primary"
                                style={{ marginRight: 20 }}
                                onClick={() => history.push(`/ws/${ws_id}/test_plan/create`)}
                            >
                                <FormattedMessage id={'Workspace.TestPlan.Create'} />
                            </Button>
                        }
                    >
                        <Tabs.TabPane key={'list'} tab={<FormattedMessage id={`Workspace.TestPlan.${route.name}`} />} >
                            <div style={{ paddingLeft: 20, paddingRight: 20 }}>
                                <ResizeHooksTable
                                    columns={columns}
                                    name="ws-test-plan-manage"
                                    refreshDeps={[ws_id, pageParams, access]}
                                    dataSource={data.data}
                                    rowKey={record => record.id}
                                    size={'small'}
                                    pagination={false}
                                />
                                <CommonPagination
                                    pageSize={data.page_size}
                                    onPageChange={
                                        (page_num, page_size) => {
                                            const params = { ...pageParams, page_num, page_size }
                                            setPageParams(params)
                                        }
                                    }
                                    currentPage={data.page_num}
                                    total={data.total}
                                />
                            </div>
                        </Tabs.TabPane>
                    </Tabs>
                </div>
                <PlanSettingDrawer ws_id={ws_id} ref={viewSettingRef} />
            </div>
        </Spin>
    )
}

export default TestPlanManage