/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useMemo } from 'react';
import { Breadcrumb, Collapse, Spin, Table, Tooltip } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useClientSize } from '@/utils/hooks';
import CommonPagination from '@/components/CommonPagination';
import { history, useLocation, useParams } from 'umi';
import styled from 'styled-components';
import { JobListStateTag } from '../TestResult/Details/components/index'
import { queryJobTypeList, querTempDel, querServerDel, querySuiteList, queryFormDate } from './services';
import { aligroupServer, aliyunServer, requestCodeMessage } from '@/utils/utils';

const Wapper = styled.div`
    .breadcrumb{
        height:50px;
        line-height:50px;
        padding-left:24px;
    }
    .content{
        //background:#fff;
        /* width: 97%; */
        margin: 0 auto;
        height: auto;
        .site-collapse-custom-collapse{
            margin-bottom:16px;
            background:#fff;
            .total{
                height:20px;
                width:30px;
                border-radius: 12px;
                background: rgba(140,140,140,0.10);
                display: inline-block;
                text-align: center;
                margin-left:7px;
                color:rgba(0,0,0,0.75);
                font-size:12px;
                vertical-align: middle;
            }
            .tip{
                .ant-tooltip-inner{
                    max-width:400px;
                }
            }
            .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box{
                padding-top:2px;
                padding-bottom: 1px;
            }
        }
    }
`
/*
    ** 
    type  == 1  Test Suite管理
    type  == 2  Job类型管理
    type  == 3  模板管理
    type  == 4  机器管理

*/
const { Panel } = Collapse;

const Refenerce = () => {
    const { type: $type, ws_id } = useParams() as any
    const { query } = useLocation() as any
    const { pk } = query
    const [loading, setLoading] = useState(false)
    const [params, setParams] = useState<any>({ page_num: 1, page_size: 10 })
    const [tempParams, setTempParams] = useState<any>({ page_num: 1, page_size: 10 })
    const { height: layoutHeight } = useClientSize()
    const [source, setSource] = React.useState<any>()
    const [list, setList] = React.useState<any>()
    const [tempList, setTempList] = React.useState<any>()

    const init = async () => {
        const pageType = + $type
        setLoading(true)
        const { data, code } = await queryFormDate({ pk })
        if (code !== 200) return
        const { id, test_type } = data
        setSource(data)
        const JobObj: any = {
            flag: 'job',
            ws_id,
            suite_id_list: '',
            case_id_list: id,
            test_type,
            ...params
        }
        const TempObj: any = {
            flag: 'template',
            ws_id,
            suite_id_list: '',
            case_id_list: id,
            test_type,
            ...tempParams
        }

        let res: any
        if (pageType === 1) {
            const { code, msg, ...rest } = await querySuiteList(JobObj)
            if (code !== 200) {
                requestCodeMessage(code, msg)
                setLoading(false)
                return
            }
            setList(rest)
            const { code: tempCode, msg: tempMsg, ...tempRest } = await querySuiteList(TempObj)
            if (tempCode !== 200) {
                requestCodeMessage(tempCode, tempMsg)
                setLoading(false)
                return
            }
            setTempList(tempRest)
            setLoading(false)
            return
        } else if (pageType === 2) {
            res = await queryJobTypeList({ jt_id: id, ...params })
        } else if (pageType === 3) {
            res = await querTempDel({ template_id: id, ...params })
        } else if (pageType === 4) {
            res = await querServerDel({ server_id: id, run_mode: 'standalone', server_provider: 'aligroup', ...params })
        } else if (pageType === 5) {
            res = await querServerDel({ server_id: id, run_mode: 'cluster', server_provider: 'aligroup', ...params })
        } else if (pageType === 6) {
            res = await querServerDel({ server_id: id, run_mode: 'standalone', server_provider: 'aliyun', ...params })
        } else {
            res = await querServerDel({ server_id: id, run_mode: 'cluster', server_provider: 'aliyun', ...params })
        }

        const { code: resCode, msg, ...rest } = res
        if (code !== 200) {
            requestCodeMessage(resCode, msg)
            setLoading(false)
            return
        }
        setList(rest)
        setLoading(false)
    }

    React.useEffect(() => {
        if (pk) init()
    }, [pk])

    const obj: any = {}
    if (+ $type === 1) obj.path = `/ws/${ws_id}/test_suite`, obj.name = `Test Suite管理`
    else if (+ $type === 2) obj.path = `/ws/${ws_id}/job/types`, obj.name = `Job类型管理`
    else if (+ $type === 3) obj.path = `/ws/${ws_id}/job/templates`, obj.name = `模板列表`
    else if (+ $type === 4) obj.path = `/ws/${ws_id}/device/group`, obj.name = `${aligroupServer}单机`
    // else if (+ $type === 4) obj.path = `/ws/${ws_id}/device/group`, obj.name = `内网单机`
    else if (+ $type === 5) obj.path = `/ws/${ws_id}/device/group`, obj.name = `${aligroupServer}集群`
    // else if (+ $type === 5) obj.path = `/ws/${ws_id}/device/group`, obj.name = `内网集群`
    // else if (+ $type === 6) obj.path = `/ws/${ws_id}/device/group`, obj.name = `云上单机`
    else if (+ $type === 6) obj.path = `/ws/${ws_id}/device/group`, obj.name = `${aliyunServer}单机`
    // else if (+ $type === 7) obj.path = `/ws/${ws_id}/device/group`, obj.name = `云上集群`
    else if (+ $type === 7) obj.path = `/ws/${ws_id}/device/group`, obj.name = `${aliyunServer}集群`

    let text = ``
    if (+ $type === 1) text = `Test Suite`
    else if (+ $type === 2) text = `Job类型`
    else if (+ $type === 3) text = `模板`
    else if (+ $type === 4) text = `${aligroupServer}单机`
    // else if (+ $type === 4) text = `内网机器`
    else if (+ $type === 5) text = `${aligroupServer}集群`
    // else if (+ $type === 5) text = `内网集群`
    // else if (+ $type === 6) text = `云上单机`
    else if (+ $type === 6) text = `${aliyunServer}单机`
    // else if (+ $type === 7) text = `云上集群`
    else if (+ $type === 7) text = `${aliyunServer}集群`

    const BreadcrumbItem: React.FC<any> = () => (
        <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item >
                <span style={{ cursor: 'pointer' }} onClick={() => history.push(obj.path)}>{obj.name}</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item >
                <span style={{ cursor: 'pointer', color: 'rgba(0,0,0,0.85)' }}>{text}<span style={{ color: 'rgba(0,0,0,0.65)' }}>({source?.name})</span>引用详情</span>
            </Breadcrumb.Item>
        </Breadcrumb>
    )

    const showTemp = useMemo(() => {
        if (list?.total > 0) return true
        return false
    }, [list?.total])

    const JobColumns: any = [
        {
            title: 'Conf',
            dataIndex: 'case_name_list',
            key: 'case_name_list',
            width: 400,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any) => (
                <Tooltip
                    overlayStyle={{ maxWidth: 390 }}
                    overlay={<div>{_.replace(/,/g, '/')}</div>}
                    placement="topLeft"
                >
                    <span>{_.replace(/,/g, ' / ')}</span>
                </Tooltip>
            )
        },
        {
            title: 'Job ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Job名称',
            dataIndex: 'name',
            key: 'name',
            render: (_: any, row: any) => (
                <span
                    onClick={() => window.open(`/ws/${row.ws_id}/test_result/${row.id}`)}
                    style={{ color: '#1890FF', cursor: 'pointer' }}>
                    {_}
                </span>
            )
        },
        {
            title: '状态',
            dataIndex: 'state',
            key: 'state',
            render: (_: any, row: any) => <JobListStateTag {...row} />
        },
        {
            title: '创建人',
            dataIndex: 'creator_name',
            key: 'creator_name',
        },
        {
            title: '创建时间',
            dataIndex: 'gmt_created',
            key: 'gmt_created',
        },
    ];
    const TempColumns: any = [
        {
            title: source?.test_type && <>Conf</>,
            dataIndex: 'case_name_list',
            key: 'case_name_list',
            width: source?.test_type ? 400 : 1,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any) => (
                source?.test_type && <Tooltip
                    overlayStyle={{ maxWidth: 390 }}
                    overlay={<div>{_.replace(/,/g, '/')}</div>}
                    placement="topLeft"
                >
                    <span>{_.replace(/,/g, ' / ')}</span>
                </Tooltip>
            )
        },
        {
            title: '模板名称',
            dataIndex: 'name',
            key: 'name',
            render: (_: any, row: any) => (
                <span
                    onClick={() => window.open(`/ws/${ws_id}/test_template/${row.id}/preview`)}
                    style={{ color: '#1890FF', cursor: 'pointer' }}>
                    {_}
                </span>
            )
        },
        {
            title: '创建人',
            dataIndex: 'creator_name',
            key: 'creator_name',
        },
        {
            title: '创建时间',
            dataIndex: 'gmt_created',
            key: 'gmt_created',
        },
    ];
    const PlanColumns = [
        {
            title: '计划名称',
            dataIndex: 'name',
            key: 'name',
            render: (_: any) => (
                <span
                    onClick={() => window.open(`/ws/${ws_id}/test_plan`)}
                    style={{ color: '#1890FF', cursor: 'pointer' }}>
                    {_}
                </span>
            )
        },
        {
            title: '创建人',
            dataIndex: 'creator_name',
            key: 'creator_name',
        },
        {
            title: '创建时间',
            dataIndex: 'gmt_created',
            key: 'gmt_created',
        },
    ];

    const RenderItem: React.FC<any> = () => {
        if (+ $type === 1) {
            return (
                <>
                    {
                        list?.total > 0 &&
                        <Collapse
                            bordered={false}
                            ghost
                            defaultActiveKey="1"
                            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                            className="site-collapse-custom-collapse"
                        >
                            <Panel header={<div>Job列表<span className="total">{list?.total || 0}</span></div>} key="1" className="site-collapse-custom-panel">
                                <Table dataSource={list?.data} columns={JobColumns} size='small' rowKey="id" pagination={false} />
                                <CommonPagination
                                    pageSize={params.page_size}
                                    currentPage={params.page_num}
                                    total={list?.total}
                                    onPageChange={
                                        (page_num, page_size) => setParams({
                                            ...params,
                                            page_size,
                                            page_num
                                        })
                                    }
                                />
                            </Panel>
                        </Collapse>
                    }
                    {
                        tempList?.total > 0 &&
                        <Collapse
                            bordered={false}
                            ghost
                            defaultActiveKey={showTemp ? '0' : '1'}
                            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                            className="site-collapse-custom-collapse"
                        >
                            <Panel header={<div>模版列表<span className="total">{tempList?.total || 0}</span></div>} key="1" className="site-collapse-custom-panel">
                                <Table dataSource={tempList?.data || []} columns={TempColumns} size='small' loading={loading} rowKey="id" pagination={false} />
                                <CommonPagination
                                    pageSize={tempParams.page_size}
                                    currentPage={tempParams.page_num}
                                    total={tempList?.total}
                                    onPageChange={
                                        (page_num, page_size) => setTempParams({
                                            ...tempParams,
                                            page_size,
                                            page_num
                                        })
                                    }
                                />
                            </Panel>
                        </Collapse>
                    }
                </>
            )
        } else if (+ $type === 3) {
            return (
                <Collapse
                    bordered={false}
                    ghost
                    defaultActiveKey={'1'}
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    className="site-collapse-custom-collapse"
                >
                    <Panel header={<div>计划列表<span className="total">{list?.total || 0}</span></div>} key="1" className="site-collapse-custom-panel">
                        <Table dataSource={list?.data} columns={PlanColumns} size='small' rowKey="id" pagination={false} />
                        <CommonPagination
                            pageSize={params.page_size}
                            currentPage={params.page_num}
                            total={list?.total}
                            onPageChange={
                                (page_num, page_size) => setParams({
                                    ...params,
                                    page_size,
                                    page_num
                                })
                            }
                        />
                    </Panel>
                </Collapse>
            )
        } else {
            return (
                <Collapse
                    bordered={false}
                    ghost
                    defaultActiveKey={'1'}
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    className="site-collapse-custom-collapse"
                >
                    <Panel header={<div>模版列表<span className="total">{list?.total || 0}</span></div>} key="1" className="site-collapse-custom-panel">
                        <Table
                            dataSource={list?.data}
                            columns={TempColumns}
                            size='small'
                            rowKey="id"
                            pagination={false} />
                        <CommonPagination
                            pageSize={params.page_size}
                            currentPage={params.page_num}
                            total={list?.total}
                            onPageChange={
                                (page_num, page_size) => setParams({
                                    ...params,
                                    page_size,
                                    page_num
                                })
                            }
                        />
                    </Panel>
                </Collapse>
            )
        }
    }

    return (
        <Wapper>
            <BreadcrumbItem />
            <div className="content" style={{ height: layoutHeight - 88, overflowY: 'auto' }}>
                <Spin spinning={loading}>
                    <RenderItem />
                </Spin>
            </div>
        </Wapper>
    )
}

export default Refenerce;