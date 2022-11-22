import React,{ useEffect, useMemo, useState } from 'react';
import { Breadcrumb, Collapse,message,Table } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useClientSize } from '@/utils/hooks'
import CommonPagination from '@/components/CommonPagination'
import { history, useIntl, FormattedMessage, getLocale } from 'umi'
import styled from 'styled-components';
import { JobListStateTag } from '../WorkSpace/TestResult/Details/components/index'
import { queryConfirm } from '@/pages/WorkSpace/JobTypeManage/services';
import { requestCodeMessage } from '@/utils/utils';
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
            .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box{
                padding-top:2px;
                padding-bottom:1px;
            }
        }
    }
`

const Refenerce = ( props:any ) => {
    const { Panel } = Collapse;
    const { type } = props.match.params
    const [ JobTotal,setJobTotal ] = useState(0)
    const [ JobData,setJobData ] = useState<any>([])
    const [ TempTotal,setTempTotal ] = useState(0)
    const [ TempData,setTempData ] = useState<any>([])
    const [ loading,setLoading ] = useState(false)
    //const [ JobObj,setJobObj ] = useState<any>({  flag:'job', page_num:1, page_size:10 })
    //const [ TempObj,setTempObj ] = useState<any>({ flag:'template', page_num:1, page_size:10 })
    const [ params, setParams ] = useState<any>({ page_num:1, page_size:10 })
    const [ tempParams, setTempParams ] = useState<any>({ page_num:1, page_size:10 })
    const {height: layoutHeight} = useClientSize()
    let param =  new URLSearchParams(location.search);
    let [ id, name ] = [param.get('id'),param.get('name')]

    const BreadcrumbItem: React.FC<any> = () => (
        <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item >
                <span style={{ cursor: 'pointer' }} onClick={() => history.push(`/system/suite`)}>
                    <FormattedMessage id="SystemConf.menuLayout.suiteManagement" />
                </span>
            </Breadcrumb.Item>
            <Breadcrumb.Item >
                <span style={{ cursor: 'pointer',color:'rgba(0,0,0,0.85)' }}>{type == 1 ? 'Suite' : 'Conf'}<span style={{ color: 'rgba(0,0,0,0.65)' }}>({name})</span> <FormattedMessage id="reference.details" /></span>
            </Breadcrumb.Item>
        </Breadcrumb>
    )
    let JobObj:any = { flag:'job', ...params }
    let TempObj:any = { flag:'template', ...tempParams }
    if(type == 'suite') {
        JobObj.suite_id = id
        TempObj.suite_id = id
    }else{
        JobObj.case_id_list = id
        TempObj.case_id_list = id
    }

    const QueryJobData = async() =>{
        setLoading(true)
        const data = await queryConfirm(JobObj)
        if(data.code == 200){
            setJobTotal(data.total)
            setJobData(data.data)
            setLoading(false)
        }
        else requestCodeMessage( data.code , data.msg )
    }
    const QueryTemplateData = async() =>{
        setLoading(true)
        const data = await queryConfirm(TempObj)
        if(data.code == 200){
            setTempTotal(data.total)
            setTempData(data.data)
            setLoading(false)
        }
        else requestCodeMessage( data.code , data.msg )
    }
    const showTemp = useMemo(()=>{
        if(JobTotal > 0 ) return true
        return false
    },[JobTotal])

    useEffect(()=>{
        QueryJobData();
        QueryTemplateData();
    },[params,tempParams])
    
    const JobColumns = [
        {
            title: <FormattedMessage id="workspace.ws.name" />,
            dataIndex: 'ws_show_name',
            key: 'ws_show_name',
        },
        {
            title: 'Job ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: <FormattedMessage id="analysis.job.name" />,
            dataIndex: 'name',
            key: 'name',
            render:( _:any,row:any )=>(
                <span 
                    onClick={() => window.open(`/ws/${row.ws_id}/test_result/${row.id}`)} 
                    style={{ color:'#1890FF',cursor:'pointer'}}>
                    {_}
                </span>
            )
        },
        {
            title: <FormattedMessage id="ws.dashboard.job.state" />,
            dataIndex: 'state',
            key: 'state',
            render:( _:any,row:any ) => <JobListStateTag {...row} />
        },
        {
            title: <FormattedMessage id="device.create_user" />,
            dataIndex: 'creator_name',
            key: 'creator_name',
        },
        {
            title: <FormattedMessage id="common.createTime" />,
            dataIndex: 'gmt_created',
            key: 'gmt_created',
        },
    ];
    const TempColumns = [
        {
            title: <FormattedMessage id="workspace.ws.name" />,
            dataIndex: 'ws_show_name',
            key: 'ws_show_name',
        },
        {
            title: <FormattedMessage id="ws.test.job.template.name" />,
            dataIndex: 'name',
            key: 'name',
            render:( _:any,row:any )=>(
                <span 
                    onClick={() => window.open(`/ws/${row.ws_id}/test_template/${row.id}/preview`)} 
                    style={{ color:'#1890FF',cursor:'pointer'}}>
                    {_}
                </span>
            )
        },
        {
            title: <FormattedMessage id="device.create_user" />,
            dataIndex: 'creator_name',
            key: 'creator_name',
        },
        {
            title: <FormattedMessage id="common.createTime" />,
            dataIndex: 'gmt_created',
            key: 'gmt_created',
        },
    ];
    const RenderItem : React.FC<any> = (props:any) => {
        return props.children
    }
    return (
        <Wapper>
            <BreadcrumbItem/>
            <div className="content" style={{ height: layoutHeight - 88, overflowY: 'auto' }}>
            <RenderItem>
            {
                JobTotal > 0 && <Collapse
                    bordered={false}
                    ghost
                    defaultActiveKey="1"
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    className="site-collapse-custom-collapse"
                >
                    <Panel header={<div><FormattedMessage id="analysis.job.table" /><span className="total">{JobTotal}</span></div>} key="1" className="site-collapse-custom-panel">
                        <Table dataSource={JobData} columns={JobColumns} size='small' loading={loading} rowKey="id" pagination={false}/>
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
                    defaultActiveKey={ showTemp ? '0' : '1' }
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    className="site-collapse-custom-collapse"
                >
                <Panel header={<div><FormattedMessage id="template.list" /><span className="total">{TempTotal}</span></div>} key="1" className="site-collapse-custom-panel">
                    <Table dataSource={TempData} columns={TempColumns} size='small' loading={loading} rowKey="id" pagination={false}/>
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
            </RenderItem>
            </div>
        </Wapper>
    )
}
export default Refenerce;