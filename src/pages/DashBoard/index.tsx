import { useClientSize } from '@/utils/hooks';
import { Col, Layout, Row, Statistic, Typography, Space, message, Spin, Popover } from 'antd';
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

import { useRequest, useIntl, FormattedMessage, getLocale } from 'umi'

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
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'
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

    /**
     * @params { text } 国际化包裹后的内容
     **/ 
    const EllipsisDiv = ({ text, placement='top', style={} }: any)=> {
        return enLocale ?
        <Popover content={text} placement={placement}>
            <div style={{ overflow:'hidden',textOverflow:'ellipsis', whiteSpace:'nowrap', cursor: 'pointer', ...style }}>
                {text}
            </div>
        </Popover>
        :
        text
    }

    return (
        <Container height={layoutHeight - 50}>
            <RealtimeDataRow>
                <DashBoardTitle span={24}><Typography.Text strong><FormattedMessage id="sys.dashboard.real-time.data"/></Typography.Text></DashBoardTitle>
                <RealtimeDataItem>
                    <Row>
                        <Col span={12}>
                            <UnMarginStatistic groupSeparator=""
                                title={<EllipsisDiv text={formatMessage({ id: "sys.dashboard.job.total"})} style={{ paddingRight: 10 }}/>}
                                value={realtime?.job_total_num || "-"} />
                        </Col>
                        <Col span={12}>
                            <SmailStatistic title={'Running'} value={realtime?.job_running_num || "-"} valueStyle={{ color: '#2B7EF7' }} />
                        </Col>
                    </Row>
                </RealtimeDataItem>
                <RealtimeDataItem>
                    <Row>
                        <Col span={12}>
                            <UnMarginStatistic groupSeparator="" title={<FormattedMessage id="sys.dashboard.test.run"/>} value={realtime?.test_run_total_num || "-"} />
                        </Col>
                        <Col span={12}>
                            <SmailStatistic title={<FormattedMessage id="sys.dashboard.current.run"/>} value={realtime?.test_run_running_num || "-"} valueStyle={{ color: '#2B7EF7' }} />
                        </Col>
                    </Row>
                </RealtimeDataItem>
                <RealtimeDataItem>
                    <Row>
                        <Col span={12}>
                            <UnMarginStatistic groupSeparator="" title={<FormattedMessage id="sys.dashboard.server.scheduling"/>} value={realtime?.server_alloc_num || "-"} />
                        </Col>
                        <Col span={12}>
                            <SmailStatistic title={<FormattedMessage id="sys.dashboard.current.run"/>} value={realtime?.server_running_num || "-"} valueStyle={{ color: '#2B7EF7' }} />
                        </Col>
                    </Row>
                </RealtimeDataItem>
                <RealtimeDataItem>
                    <Row>
                        <Col span={12}>
                            <UnMarginStatistic groupSeparator=""
                                title={<EllipsisDiv text={formatMessage({ id: "sys.dashboard.total.data"})} style={{ paddingRight: 10 }} />}
                                value={realtime?.result_total_num || "-"} formatter={(val: any) => typeof val === "number" ? (val / 10000).toFixed(2) : val} />
                        </Col>
                        <Col span={12}>
                            <Row>
                                <Col span={14}>
                                    <SmailStatistic
                                        title={<EllipsisDiv text={formatMessage({ id: "functional"})} />} 
                                        value={realtime?.func_result_num || "-"} formatter={(val: any) => typeof val === "number" ? (val / 10000).toFixed(2) : val} valueStyle={{ color: '#0FB966' }} />
                                </Col>
                                <Col span={10}>
                                    <SmailStatistic
                                        title={<EllipsisDiv text={formatMessage({ id: "performance"})} />}
                                        value={realtime?.perf_result_num || "-"} formatter={(val: any) => typeof val === "number" ? (val / 10000).toFixed(2) : val} valueStyle={{ color: '#0FB966' }} /> 
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </RealtimeDataItem>
                <RealtimeDataItem>
                    <UnMarginStatistic title={<FormattedMessage id="sys.dashboard.accumulative.total"/>} value={realtime?.total_duration || "-"} precision={2} />
                </RealtimeDataItem>
            </RealtimeDataRow>
            <MarginBottomRow gutter={16}>
                <Col span={6} >
                    <WitheBlock height={166}>
                        <Col span={24}>
                            <UnMarginStatistic title={<FormattedMessage id="sys.dashboard.workspaces.num"/>} value={workspace?.workspace_num || "-"} />
                        </Col>
                        <Col span={24}>
                            <Space size={48}>
                                <SmailStatistic title={<FormattedMessage id="sys.dashboard.product_num"/>} value={workspace?.product_num || "-"} />
                                <SmailStatistic title={<FormattedMessage id="sys.dashboard.project_num"/>} value={workspace?.project_num || "-"} />
                            </Space>
                        </Col>
                        <ItemIcon background={'rgba(181,39,207,0.10)'} >
                            <WorkspaceQuantity />
                        </ItemIcon>
                    </WitheBlock>
                </Col>
                <Col span={6} >
                    <WitheBlock height={166}>
                        <Col span={24}>
                            <UnMarginStatistic title={<FormattedMessage id="sys.dashboard.team_num"/>} value={workspace?.team_num || "-"} />
                        </Col>
                        <SmailStatistic title={<FormattedMessage id="sys.dashboard.user_total_num"/>} value={workspace?.user_total_num || "-"} />
                        <ItemIcon background={'rgba(243,97,94,0.10)'} >
                            <TeamQuantity />
                        </ItemIcon>
                    </WitheBlock>
                </Col>
                <Col span={6} >
                    <WitheBlock height={166}>
                        <Col span={24}>
                            <UnMarginStatistic title={<FormattedMessage id="sys.dashboard.benchmark_num"/>} value={workspace?.benchmark_num || "-"} />
                        </Col>
                        <Space size={48}>
                            <SmailStatistic title={'TestConf'} value={workspace?.test_conf_num || "-"} />
                            <SmailStatistic title={'TestCase'} value={workspace?.test_case_num || "-"} />
                            <SmailStatistic title={'Metric'} value={workspace?.test_metric_num || "-"} />
                        </Space>
                        <ItemIcon background={'rgba(235,162,62,0.10)'} >
                            <BenchmarkQuantity />
                        </ItemIcon>
                    </WitheBlock>
                </Col>
                <Col span={6} >
                    <WitheBlock height={166}>
                        <Col span={24}>
                            <UnMarginStatistic title={<FormattedMessage id="sys.dashboard.baseline_total_num"/>} value={workspace?.baseline_total_num || "-"} />
                        </Col>
                        <Space size={48}>
                            <SmailStatistic title={<EllipsisDiv text={formatMessage({ id: "sys.dashboard.func_baseline_res_num"})} style={{ width: 100 }} />}
                                value={workspace?.func_baseline_res_num || "-"} />
                            <SmailStatistic title={<EllipsisDiv text={formatMessage({ id: "sys.dashboard.perf_baseline_res_num"})} style={{ width: 100 }} placement="topRight"/>}
                                value={workspace?.perf_baseline_res_num || "-"} />
                        </Space>
                        <ItemIcon background={'rgba(104,203,158,0.10)'} >
                            <BaselineQuantity />
                        </ItemIcon>
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