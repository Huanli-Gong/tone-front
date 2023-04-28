import { useClientSize } from '@/utils/hooks'
import styled from 'styled-components'
import React, { useEffect, useState, useRef } from 'react'
import { Col, Layout, message, Row, Space, Spin, Statistic, Typography, DatePicker } from 'antd'
import { queryWorkspaceProductInfo, queryWorkspaceProjectChart } from '../services'
import { renderChart, filterChartSource } from './utils'
import { requestCodeMessage } from '@/utils/utils';
import JobTable from './components/JobTable'
import moment from 'moment';
import { useParams, useIntl, FormattedMessage } from 'umi'
interface ContainerProps {
    height?: number;
}
const { RangePicker }: any = DatePicker;

const Container = styled(Layout) <ContainerProps>`
    min-height:unset;
    overflow:auto;    
    display: block;
    padding:20px;
    ${({ height }) => height ? `height:${height}px;` : 'unset'}
`

const WhiteBlock = styled.div`
    background: #FFFFFF;
`

const InfoBanner = styled(WhiteBlock)`
    height: 103px;
    padding-left:24px;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.06);
    border-radius: 4px;
    padding-right:24px;
    margin-bottom:10px;
    padding-top:16px;
    padding-bottom:24px;
    h3 {
        margin-bottom:0;
        font-size:30px;
    }
    .ant-space-item span {
        font-size:12px;
        color: rgba(0,0,0,0.50);
    }
`
const InfoRightSpace = styled(Row)`
    .ant-statistic {
        margin-right:49px;
    }
`

const TableContainer = styled(WhiteBlock)`
    // max-height:555px;
    padding-left:20px;
    padding-right:20px;
    margin-bottom:10px;
`

const TableTitle = styled.div`
    height:65px;
    line-height:65px;
    font-size:18px;
    color:#000;
`

const ChartWrapper = styled(WhiteBlock)`
    height:385px;
    margin-bottom:0;
    padding:24px;
`

const ChartTitle = styled(Row)`
    height:calc( 100% - 300px );
    width:100%;
`

const ChartContent = styled.div`
    height:300px;
    overflow:hidden;
    width:100%;
`
const RangeTime = styled.div`
    float:right;
`

const ProjectDashboard: React.FC<AnyType> = (props) => {
    const { formatMessage } = useIntl()
    const { ws_id, project_id } = useParams() as any
    const { height: layoutHeight } = useClientSize()

    const statusChart: any = useRef()
    const suiteChart: any = useRef()

    const [info, setInfo] = useState<any>(null)
    const [jobChartLoading, setJobChartLoading] = useState(false)
    const [caseChartLoading, setCaseChartLoading] = useState(false)

    const getProjectInfo = async () => {
        const { data, code, msg } = await queryWorkspaceProductInfo({ ws_id, project_id })
        if (code !== 200) return requestCodeMessage(code, msg)
        setInfo(data)
    }

    const statusChartApi: any = useRef()
    const suiteChartApi: any = useRef()

    const getChartData = (dateStrings: any = []) => {
        getChartJob(dateStrings)
        getChartCase(dateStrings)
    }
    const getChartJob = async (dateStrings: any = []) => {
        setJobChartLoading(true)
        try {
            const { data, code, msg } = await queryWorkspaceProjectChart({
                ws_id, project_id,
                chart_type: 'job',
                start_time: dateStrings[0] || '',
                end_time: dateStrings[1] || ''
            })
            setJobChartLoading(false)
            if (code !== 200) return requestCodeMessage(code, msg)
            if (statusChartApi.current)
                statusChartApi.current.changeData(filterChartSource(data, 'Job', true))
            else
                statusChartApi.current = renderChart(statusChart.current, filterChartSource(data, 'Job', true))
        } catch (e) {
            setJobChartLoading(false)
        }
    }
    const getChartCase = async (dateStrings: any = []) => {
        setCaseChartLoading(true)
        try {
            const { data, code, msg } = await queryWorkspaceProjectChart({
                ws_id, project_id,
                chart_type: 'case',
                start_time: dateStrings[0] || '',
                end_time: dateStrings[1] || ''
            })
            setCaseChartLoading(false)
            if (code !== 200) return requestCodeMessage(code, msg)
            if (suiteChartApi.current)
                suiteChartApi.current.changeData(filterChartSource(data, 'Job', false))
            else
                suiteChartApi.current = renderChart(suiteChart.current, filterChartSource(data, 'Job', false))
        } catch (e) {
            setCaseChartLoading(false)
        }
    }

    useEffect(() => {
        getProjectInfo()
        getChartData()
    }, [])
    let startDate: any = moment().subtract(30, "days").format('YYYY-MM-DD')
    let endDate: any = moment().format('YYYY-MM-DD')
    const todayText = formatMessage({ id: 'ws.dashboard.today' })
    const monthText = formatMessage({ id: 'ws.dashboard.one.month' })
    return (
        <Container height={layoutHeight - 50}>
            <InfoBanner >
                <Row justify="space-between" align="middle">
                    <Space direction="vertical">
                        <Typography.Title level={3}>{info?.project_name}</Typography.Title>
                        <Typography.Text>{info?.project_description}</Typography.Text>
                    </Space>
                    <InfoRightSpace>
                        <Statistic title="Pending" value={info?.pending_num} />
                        <Statistic title="Running" value={info?.running_num} />
                        <Statistic title="Complete" value={info?.complete_num} />
                        <Statistic title="Fail" value={info?.fail_num} />
                    </InfoRightSpace>
                </Row>
            </InfoBanner>
            <TableContainer>
                <TableTitle><FormattedMessage id="ws.dashboard.list.details" /></TableTitle>
                <JobTable />
            </TableContainer>
            <ChartWrapper>
                <ChartTitle align="middle">
                    <Col span={24}>
                        <Typography.Text><FormattedMessage id="ws.dashboard.trend.chart" /></Typography.Text>
                        <RangeTime>
                            <RangePicker
                                defaultValue={[moment(startDate), moment(endDate)]}
                                ranges={{
                                    [todayText]: [moment(), moment()],
                                    [monthText]: [moment().startOf('month'), moment().endOf('month')],
                                }}
                                format="YYYY-MM-DD"
                                onChange={(d: any, t: any) => getChartData(t)}
                            />
                        </RangeTime>
                    </Col>
                    <Col span={24}>
                        <Typography.Text type="secondary">
                            <FormattedMessage id="ws.dashboard.job.success.failure" />
                        </Typography.Text>
                    </Col>
                </ChartTitle>
                <Spin spinning={jobChartLoading}>
                    <ChartContent ref={statusChart} />
                </Spin>
            </ChartWrapper>
            <ChartWrapper>
                <ChartTitle align="middle">
                    <Typography.Text type="secondary">
                        <FormattedMessage id="ws.dashboard.case.failed" />
                    </Typography.Text>
                </ChartTitle>
                <Spin spinning={caseChartLoading}>
                    <ChartContent ref={suiteChart} />
                </Spin>
            </ChartWrapper>
        </Container>
    )
}

export default ProjectDashboard