import React, { useEffect, useRef, useState } from 'react'

import { useClientSize, writeDocumentTitle } from '@/utils/hooks'
import { Space, Table, Tabs, Button, message, Popconfirm, Spin } from 'antd'
import { useRequest, history, FormattedMessage, Access, useAccess } from 'umi'
import CommonPagination from '@/components/CommonPagination'

import styled from 'styled-components'
import PlanSettingDrawer from './components/PlanSettingDrawer'
import { queryPlanManageList, deleteTestPlan, copyTestPlan } from './services'
import { getUserFilter, getSearchFilter, getRadioFilter } from '@/components/TableFilters'
import { requestCodeMessage, AccessTootip } from '@/utils/utils'
import ResizeTable from '@/components/ResizeTable'

interface OptionBtnProp {
    disabled?: boolean
}

const OptButton = styled.span<OptionBtnProp>`
    color : #1890FF;
    margin-right : 10 ;
    cursor : pointer ;
    ${props => props.disabled && 'opacity: 0.25;'} 
`

const TestPlanManage = (props: any) => {
    const { route } = props
    const { ws_id } = props.match.params
    const access = useAccess()
    writeDocumentTitle(`Workspace.TestPlan.${route.name}`)

    const {height: layoutHeight} = useClientSize()
    const viewSettingRef: any = useRef()

    const [pageParams, setPageParams] = useState<any>({ ws_id, page_num: 1, page_size: 10 })

    const { data, run, refresh, loading } = useRequest(
        (params: any = pageParams) => queryPlanManageList(params),
        {
            initialData: {},
            formatResult: (req: any) => req,
            manual: true
        }
    )

    useEffect(() => {
        run(pageParams)
    }, [pageParams])

    const handleRun = async (row: any) => {
        if (!row.enable) return;
        history.push(`/ws/${ws_id}/test_plan/${row.id}/run`)
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
        message.success('复制成功!')
        refresh()
    }

    const handleEdit = (row: any) => {
        history.push(`/ws/${ws_id}/test_plan/${row.id}/edit`)
    }

    const handleDelete = async (row: any) => {
        const { code, msg } = await deleteTestPlan({ plan_id: row.id, ws_id })
        if (code === 200) refresh()
        else requestCodeMessage(code, msg)
    }

    const columns = [{
        dataIndex: 'name',
        title: '计划名称',
        ellipsis: {
            showTitle: false
        },
        ...getSearchFilter(pageParams, setPageParams, 'name')
    }, {
        dataIndex: 'cron_info',
        title: '触发规则',
        render(_: any) {
            return _ || '-'
        }
    }, {
        dataIndex: 'enable',
        title: '启用',
        render: (_: any) => (
            _ ? '是' : '否'
            // <Badge status="processing" text="是" /> :
            // <Badge status="default" text="否" />
        ),
        ...getRadioFilter(
            pageParams,
            setPageParams,
            [{ name: '是', value: 'True' }, { name: '否', value: 'False' }],
            'enable'
        )
    }, {
        dataIndex: 'creator_name',
        title: '创建人',
        ...getUserFilter({ name: 'creator_name', data: pageParams, setDate: setPageParams })
    }, {
        dataIndex: 'gmt_created',
        title: '创建时间',
        ellipsis: {
            showTitle: false
        },
        width: 170,
    }, {
        title: '操作',
        ellipsis: {
            showTitle: false
        },
        width: 220,
        render: (row: any,record:any) => (
            <Space>
                <OptButton disabled={!row.enable} onClick={() => handleRun(row)}>运行</OptButton>
                <OptButton onClick={() => handleView(row)}>查看</OptButton>
                <OptButton onClick={() => handleCopy(row)}>复制</OptButton>
                <Access accessible={access.WsTourist()}>
                    <Access 
                        accessible={access.WsMemberOperateSelf(record.creator)}
                        fallback={
                            <Space>
                                <OptButton onClick={() => AccessTootip()}>编辑</OptButton>
                                <OptButton onClick={() => AccessTootip()}>删除</OptButton>
                            </Space>
                        }
                    >
                        <Space>
                            <OptButton onClick={() => handleEdit(row)}>编辑</OptButton>
                            <Popconfirm title="确认删除该计划吗？"
                                onConfirm={() => handleDelete(row)}
                                okText="确认"
                                cancelText="取消">
                                <OptButton>删除</OptButton>
                            </Popconfirm>
                        </Space>
                    </Access>
                </Access>
            </Space>
        )
    }]

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
                                <ResizeTable
                                    columns={columns}
                                    dataSource={data.data}
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