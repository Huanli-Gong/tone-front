import { useClientSize } from '@/utils/hooks';
import { Col, Layout, Row, Statistic, Typography, Space, message, Spin, Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components'

import ClassUsers from './components/ClassUsers'
import CreateJobs from './components/CreateJobs'
import CreateRank from './components/CreateRank'
import MissionTrends from './components/MissionTrends'
import { queryLiveData, querySysData } from './services';

import { ReactComponent as BaselineQuantity } from '@/assets/svg/dashboard/baseline_quantity.svg'
import { ReactComponent as BenchmarkQuantity } from '@/assets/svg/dashboard/benchmark_quantity.svg'
import { ReactComponent as TeamQuantity } from '@/assets/svg/dashboard/team_quantity.svg'
import { ReactComponent as WorkspaceQuantity } from '@/assets/svg/dashboard/ws_quantity.svg'
import { requestCodeMessage } from '@/utils/utils';

import { useRequest } from 'umi'

interface CommentProps {
    height?: number;
    no_padding?: string
}

const Container = styled(Layout) <CommentProps>`
    padding:20px;
    /* overflow:auto; */
    ${({ height }) => `min-height:${height}px;` || ''}
    min-height:unset;
`

const WitheBlock = styled(Row) <CommentProps>`
    background:#fff;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.06);
    border-radius: 4px;
    ${({ no_padding = false }) => `padding:${no_padding ? 0 : 24}px;`}
    ${({ height }) => `height:${height}px;` || ''}
    position:relative;
`

const RealtimeDataRow = styled(WitheBlock)`
    height:136px;
    margin-bottom:16px;
`

const RealtimeDataItem = styled.div`
    width:20%;
    height:calc(100% - 17px - 8px);
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 8px;

    .ant-row { width : 100%; }
    
    &::after{
        content: '';
        width: 1px;
        height: 42px;
        background: rgba(0,0,0,0.10);
        position: absolute;
        right: 0;
        top: 50%;
        transform: translate(0, -50%);
    }

    &:last-child::after {
        content:unset;
    }
`

const DashBoardTitle = styled(Col)`
    height:17px;
    display: flex;
    align-items: center;
    margin-bottom:8px;
`

const SmailStatistic = styled(Statistic)`
    margin-top:8px!important;
    line-height:1.3!important;
    .ant-statistic-title { margin : 0 ;}
    .ant-statistic-content { font-size:18px; }
`

const UnMarginStatistic = styled(Statistic)`
    line-height:22px!important;
    .ant-statistic-content { font-size:30px; }
`

const MarginBottomRow = styled(Row)`
    margin-bottom:16px;
`

interface ItemIconProps {
    background?: string
}

const ItemIcon = styled.div<ItemIconProps>`
    position:absolute;
    right:24px;
    // top:50%;
    // transform: translate(0, -50%);
    top:24px;
    height: 48px;
    width: 48px;
    border-radius: 10px;
    display:flex;
    align-items:center;
    justify-content:center;
    ${({ background }) => background ? `background-color:${background};` : null}
`

const dataSet = ["workspace", "group", "benchmark", "baseline"]

export default () => {
    const { height: layoutHeight } = useClientSize()

    const [workspace, setWorkspace] = useState<any>({})
    const [loading, setLoading] = React.useState(true)

    const { data: realtime } = useRequest(queryLiveData, {
        pollingInterval: 5000,
        onSuccess() {
            setLoading(false)
        }
    })

    const getWorkspaceData = async () => {
        dataSet.forEach(async (i) => {
            const { data, code, msg } = await querySysData({ data_type: i })
            if (code !== 200) {
                console.log(msg)
                return
            }
            setWorkspace((wsConf: any) => Object.assign(wsConf, data))
        })
    }

    useEffect(() => {
        getWorkspaceData()
    }, [])

    return (
        <Container height={layoutHeight - 50}>
            <RealtimeDataRow >
                {/* <Skeleton loading={loading} paragraph={{ rows: 2 }} active>
                    <> */}
                <DashBoardTitle span={24}><Typography.Text strong>实时数据</Typography.Text></DashBoardTitle>
                <RealtimeDataItem>
                    <Row>
                        <Col span={12}>
                            <UnMarginStatistic groupSeparator="" title={'Job总数（个）'} value={realtime?.job_total_num || "-"} />
                        </Col>
                        <Col span={12}>
                            <SmailStatistic title={'Running'} value={realtime?.job_running_num || "-"} valueStyle={{ color: '#2B7EF7' }} />
                        </Col>
                    </Row>
                </RealtimeDataItem>
                <RealtimeDataItem>
                    <Row>
                        <Col span={12}>
                            <UnMarginStatistic groupSeparator="" title={'Test Run(次)'} value={realtime?.test_run_total_num || "-"} />
                        </Col>
                        <Col span={12}>
                            <SmailStatistic title={'当前运行'} value={realtime?.test_run_running_num || "-"} valueStyle={{ color: '#2B7EF7' }} />
                        </Col>
                    </Row>
                </RealtimeDataItem>
                <RealtimeDataItem>
                    <Row>
                        <Col span={12}>
                            <UnMarginStatistic groupSeparator="" title={'机器调度(次)'} value={realtime?.server_alloc_num || "-"} />
                        </Col>
                        <Col span={12}>
                            <SmailStatistic title={'当前运行'} value={realtime?.server_running_num || "-"} valueStyle={{ color: '#2B7EF7' }} />
                        </Col>
                    </Row>
                </RealtimeDataItem>
                <RealtimeDataItem>
                    <Row>
                        <Col span={12}>
                            <UnMarginStatistic groupSeparator="" title={'总数据量(万)'} value={realtime?.result_total_num || "-"} formatter={(val: any) => typeof val === "number" ? (val / 10000).toFixed(2) : val} />
                        </Col>
                        <Col span={12}>
                            <Space>
                                <SmailStatistic title={'功能'} value={realtime?.func_result_num || "-"} formatter={(val: any) => typeof val === "number" ? (val / 10000).toFixed(2) : val} valueStyle={{ color: '#0FB966' }} />
                                <SmailStatistic title={'性能'} value={realtime?.perf_result_num || "-"} formatter={(val: any) => typeof val === "number" ? (val / 10000).toFixed(2) : val} valueStyle={{ color: '#0FB966' }} />
                            </Space>
                        </Col>
                    </Row>
                </RealtimeDataItem>
                <RealtimeDataItem>
                    <UnMarginStatistic title={'累计测试时长（天）'} value={realtime?.total_duration || "-"} precision={2} />
                </RealtimeDataItem>
                {/* </>
                </Skeleton> */}
            </RealtimeDataRow>
            <MarginBottomRow gutter={16}>
                <Col span={6} >
                    <WitheBlock height={166}>
                        {/* {
                            workspace.workspace_num || "-" ?
                                <> */}
                        <Col span={24}>
                            <UnMarginStatistic title={'Workspace数(个)'} value={workspace?.workspace_num || "-"} />
                        </Col>
                        <Col span={24}>
                            <Space size={48}>
                                <SmailStatistic title={'产品数'} value={workspace?.product_num || "-"} />
                                <SmailStatistic title={'项目数'} value={workspace?.project_num || "-"} />
                            </Space>
                        </Col>
                        <ItemIcon background={'rgba(181,39,207,0.10)'} >
                            <WorkspaceQuantity />
                        </ItemIcon>
                        {/* </> :
                                <Skeleton active />
                        } */}
                    </WitheBlock>
                </Col>
                <Col span={6} >
                    <WitheBlock height={166}>
                        {/* {
                            workspace.team_num || "-" ?
                                <> */}
                        <Col span={24}>
                            <UnMarginStatistic title={'团队数(个)'} value={workspace?.team_num || "-"} />
                        </Col>
                        <SmailStatistic title={'用户数'} value={workspace?.user_total_num || "-"} />
                        <ItemIcon background={'rgba(243,97,94,0.10)'} >
                            <TeamQuantity />
                        </ItemIcon>
                        {/* </> :
                                <Skeleton active />
                        } */}
                    </WitheBlock>
                </Col>
                <Col span={6} >
                    <WitheBlock height={166}>
                        {/* {
                            workspace.test_conf_num || "-" ?
                                <> */}
                        <Col span={24}>
                            <UnMarginStatistic title={'Benchmark数(个)'} value={workspace?.benchmark_num || "-"} />
                        </Col>
                        <Space size={48}>
                            <SmailStatistic title={'TestConf'} value={workspace?.test_conf_num || "-"} />
                            <SmailStatistic title={'TestCase'} value={workspace?.test_case_num || "-"} />
                            <SmailStatistic title={'Metric'} value={workspace?.test_metric_num || "-"} />
                        </Space>
                        <ItemIcon background={'rgba(235,162,62,0.10)'} >
                            <BenchmarkQuantity />
                        </ItemIcon>
                        {/* </> :
                                <Skeleton active />
                        } */}
                    </WitheBlock>
                </Col>
                <Col span={6} >
                    <WitheBlock height={166}>
                        {/* {
                            workspace.baseline_total_num || "-" ?
                                <> */}
                        <Col span={24}>
                            <UnMarginStatistic title={'总基线数(个)'} value={workspace?.baseline_total_num || "-"} />
                        </Col>
                        <Space size={48}>
                            <SmailStatistic title={'功能数据'} value={workspace?.func_baseline_res_num || "-"} />
                            <SmailStatistic title={'性能数据'} value={workspace?.perf_baseline_res_num || "-"} />
                        </Space>
                        <ItemIcon background={'rgba(104,203,158,0.10)'} >
                            <BaselineQuantity />
                        </ItemIcon>
                        {/*  </> :
                                <Skeleton active />
                        } */}
                    </WitheBlock>
                </Col>
            </MarginBottomRow>
            <MarginBottomRow gutter={16}>
                <Col span={12}>
                    <WitheBlock height={376}>
                        <MissionTrends />
                    </WitheBlock>
                </Col>
                <Col span={12}>
                    <WitheBlock height={376}>
                        <CreateJobs />
                    </WitheBlock>
                </Col>
            </MarginBottomRow>
            <Row gutter={16}>
                <Col span={12}>
                    <WitheBlock height={400}>
                        <ClassUsers />
                    </WitheBlock>
                </Col>
                <Col span={12}>
                    <WitheBlock height={400} no_padding={'true'}>
                        <CreateRank />
                    </WitheBlock>
                </Col>
            </Row>
        </Container>
    )
}