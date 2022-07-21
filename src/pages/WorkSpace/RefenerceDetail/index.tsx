import React, { useEffect, useState, useMemo } from 'react';
import { Breadcrumb, Collapse, message, Table, Tooltip } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useClientSize } from '@/utils/hooks';
import CommonPagination from '@/components/CommonPagination';
import { history } from 'umi';
import styled from 'styled-components';
import { JobListStateTag } from '../TestResult/Details/components/index'
import { queryJobTypeList, querTempDel, querServerDel, querySuiteList } from './services';
import { aligroupServer, aliyunServer, requestCodeMessage } from '@/utils/utils';

const Wapper = styled.div`
    .breadcrumb{
        height:50px;
        line-height:50px;
        padding-left:24px;
    }
    .content{
        //background:#fff;
        width: 97%;
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
const Refenerce = (props: any) => {
    const { Panel } = Collapse;
    const { type, ws_id } = props.match.params
    const { search } = location
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [dataSource, setDataSource] = useState<any>([])
    const [params, setParams] = useState<any>({ page_num: 1, page_size: 10 })
    const [tempParams, setTempParams] = useState<any>({ page_num: 1, page_size: 10 })
    const [JobTotal, setJobTotal] = useState(0)
    const [JobData, setJobData] = useState<any>([])
    const [TempTotal, setTempTotal] = useState(0)
    const [TempData, setTempData] = useState<any>([])
    let param = new URLSearchParams(search);
    let [id, name, test_type] = [param.get('id'), param.get('name'), param.get('test_type')]
    const { height: layoutHeight } = useClientSize()

    let obj: any = {}
    if (type == 1) obj.path = `/ws/${ws_id}/test_suite`, obj.name = `Test Suite管理`
    else if (type == 2) obj.path = `/ws/${ws_id}/job/types`, obj.name = `Job类型管理`
    else if (type == 3) obj.path = `/ws/${ws_id}/job/templates`, obj.name = `模板列表`
    else if (type == 4) obj.path = `/ws/${ws_id}/device/group`, obj.name = `${aligroupServer}单机`
    // else if (type == 4) obj.path = `/ws/${ws_id}/device/group`, obj.name = `内网单机`
    else if (type == 5) obj.path = `/ws/${ws_id}/device/group`, obj.name = `${aligroupServer}集群`
    // else if (type == 5) obj.path = `/ws/${ws_id}/device/group`, obj.name = `内网集群`
    // else if (type == 6) obj.path = `/ws/${ws_id}/device/group`, obj.name = `云上单机`
    else if (type == 6) obj.path = `/ws/${ws_id}/device/group`, obj.name = `${aliyunServer}单机`
    // else if (type == 7) obj.path = `/ws/${ws_id}/device/group`, obj.name = `云上集群`
    else if (type == 7) obj.path = `/ws/${ws_id}/device/group`, obj.name = `${aliyunServer}集群`

    let text = ``
    if (type == 1) text = `Test Suite`
    else if (type == 2) text = `Job类型`
    else if (type == 3) text = `模板`
    else if (type == 4) text = `${aligroupServer}单机`
    // else if (type == 4) text = `内网机器`
    else if (type == 5) text = `${aligroupServer}集群`
    // else if (type == 5) text = `内网集群`
    // else if (type == 6) text = `云上单机`
    else if (type == 6) text = `${aliyunServer}单机`
    // else if (type == 7) text = `云上集群`
    else if (type == 7) text = `${aliyunServer}集群`

    let JobObj: any = {
        flag: 'job',
        ws_id,
        suite_id_list: '',
        case_id_list: id,
        test_type,
        ...params
    }
    let TempObj: any = {
        flag: 'template',
        ws_id,
        suite_id_list: '',
        case_id_list: id,
        test_type,
        ...tempParams
    }

    const BreadcrumbItem: React.FC<any> = () => (
        <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item >
                <span style={{ cursor: 'pointer' }} onClick={() => history.push(obj.path)}>{obj.name}</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item >
                <span style={{ cursor: 'pointer', color: 'rgba(0,0,0,0.85)' }}>{text}<span style={{ color: 'rgba(0,0,0,0.65)' }}>({name})</span>引用详情</span>
            </Breadcrumb.Item>
        </Breadcrumb>
    )
    const QueryJobData = async () => {
        setLoading(true)
        const data = await querySuiteList(JobObj)
        if (data.code == 200) {
            setJobTotal(data.total)
            setJobData(data.data)
            setLoading(false)
        }
        else requestCodeMessage(data.code, data.msg)
    }
    const QuerySuiteTempData = async () => {
        setLoading(true)
        const data = await querySuiteList(TempObj)
        if (data.code == 200) {
            setTempTotal(data.total)
            setTempData(data.data)
            setLoading(false)
        }
        else requestCodeMessage(data.code, data.msg)
    }

    const QueryTemplateData = async () => {
        setLoading(true)
        const data = await queryJobTypeList({ jt_id: id, ...params })
        if (data.code == 200) {
            setTotal(data.total)
            setDataSource(data.data)
            setLoading(false)
        }
        else requestCodeMessage(data.code, data.msg)
    }
    const QueryPlanData = async () => {
        setLoading(true)
        const data = await querTempDel({ template_id: id, ...params })
        if (data.code == 200) {
            setTotal(data.total)
            setDataSource(data.data)
            setLoading(false)
        }
        else requestCodeMessage(data.code, data.msg)
    }
    const QueryStandLoneServerData = async () => {
        setLoading(true)
        const data = await querServerDel({ server_id: id, run_mode: 'standalone', server_provider: 'aligroup', ...params })
        if (data.code == 200) {
            setTotal(data.total)
            setDataSource(data.data)
            setLoading(false)
        }
        else requestCodeMessage(data.code, data.msg)
    }
    const QueryClusterServerData = async () => {
        setLoading(true)
        const data = await querServerDel({ server_id: id, run_mode: 'cluster', server_provider: 'aligroup', ...params })
        if (data.code == 200) {
            setTotal(data.total)
            setDataSource(data.data)
            setLoading(false)
        }
        else requestCodeMessage(data.code, data.msg)
    }
    const CloudStandLoneServerData = async () => {
        setLoading(true)
        const data = await querServerDel({ server_id: id, run_mode: 'standalone', server_provider: 'aliyun', ...params })
        if (data.code == 200) {
            setTotal(data.total)
            setDataSource(data.data)
            setLoading(false)
        }
        else requestCodeMessage(data.code, data.msg)
    }
    const CloudClusterServerData = async () => {
        setLoading(true)
        const data = await querServerDel({ server_id: id, run_mode: 'cluster', server_provider: 'aliyun', ...params })
        if (data.code == 200) {
            setTotal(data.total)
            setDataSource(data.data)
            setLoading(false)
        }
        else requestCodeMessage(data.code, data.msg)
    }
    const showTemp = useMemo(() => {
        if (JobTotal > 0) return true
        return false
    }, [JobTotal])

    useEffect(() => {
        if (type == 1) {
            QueryJobData();
            QuerySuiteTempData();
        } else if (type == 2) {
            QueryTemplateData();
        } else if (type == 3) {
            QueryPlanData();
        } else if (type == 4) {
            QueryStandLoneServerData();
        } else if (type == 5) {
            QueryClusterServerData();
        } else if (type == 6) {
            CloudStandLoneServerData()
        } else {
            CloudClusterServerData()
        }
    }, [params])

    const JobColumns = [
        {
            title: 'Conf',
            dataIndex: 'case_name_list',
            key: 'case_name_list',
            width: 400,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any, row: any) => (
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
    const TempColumns = [
        {
            title: test_type && <>Conf</>,
            dataIndex: 'case_name_list',
            key: 'case_name_list',
            width: test_type ? 400 : 1,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any, row: any) => (
                test_type && <Tooltip
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
            render: (_: any, row: any) => (
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
        if (type == 1) {
            return (
                <>
                    {
                        JobTotal > 0 && <Collapse
                            bordered={false}
                            ghost
                            defaultActiveKey="1"
                            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                            className="site-collapse-custom-collapse"
                        >
                            <Panel header={<div>Job列表<span className="total">{JobTotal}</span></div>} key="1" className="site-collapse-custom-panel">
                                <Table dataSource={JobData} columns={JobColumns} size='small' loading={loading} rowKey="id" pagination={false} />
                                <CommonPagination
                                    pageSize={params.page_size}
                                    currentPage={params.page_num}
                                    total={JobTotal}
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
                        TempTotal > 0 && <Collapse
                            bordered={false}
                            ghost
                            defaultActiveKey={showTemp ? '0' : '1'}
                            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                            className="site-collapse-custom-collapse"
                        >
                            <Panel header={<div>模版列表<span className="total">{TempTotal}</span></div>} key="1" className="site-collapse-custom-panel">
                                <Table dataSource={TempData} columns={TempColumns} size='small' loading={loading} rowKey="id" pagination={false} />
                                <CommonPagination
                                    pageSize={tempParams.page_size}
                                    currentPage={tempParams.page_num}
                                    total={TempTotal}
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
        } else if (type == 3) {
            return (
                <Collapse
                    bordered={false}
                    ghost
                    defaultActiveKey={'1'}
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    className="site-collapse-custom-collapse"
                >
                    <Panel header={<div>计划列表<span className="total">{total}</span></div>} key="1" className="site-collapse-custom-panel">
                        <Table dataSource={dataSource} columns={PlanColumns} size='small' loading={loading} rowKey="id" pagination={false} />
                        <CommonPagination
                            pageSize={params.page_size}
                            currentPage={params.page_num}
                            total={total}
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
                    <Panel header={<div>模版列表<span className="total">{total}</span></div>} key="1" className="site-collapse-custom-panel">
                        <Table
                            dataSource={dataSource}
                            columns={TempColumns}
                            size='small'
                            loading={loading}
                            rowKey="id"
                            pagination={false} />
                        <CommonPagination
                            pageSize={params.page_size}
                            currentPage={params.page_num}
                            total={total}
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
                <RenderItem />
            </div>
        </Wapper>
    )
}
export default Refenerce;