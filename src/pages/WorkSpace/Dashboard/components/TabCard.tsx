import React from 'react'
import { useParams, useIntl, FormattedMessage } from 'umi'
import moment from 'moment'
import type { Moment } from 'moment'
import { Col, Row, Space, Typography, Tooltip, Badge, Popover, Button, Select } from 'antd'
import { InfoCircleOutlined, DownSquareOutlined, CloseOutlined, CheckOutlined, UpSquareOutlined, FilterOutlined } from '@ant-design/icons'
import { JobListStateTag } from '@/pages/WorkSpace/TestResult/Details/components'
import styled from 'styled-components'
import cls from 'classnames'

type DateType = Moment | string | undefined | null

const getStatusColor = (status: string) => new Map([
    ['fail', '#F5222D'],
    ['success', '#39C15B'],
    ['pending', '#1890FF']
]).get(status) || '#D0D0D0'

const getCurrentTimeStr = (time: string) => {
    const { formatMessage } = useIntl()
    const timeMap = new Map([
        ['24h', formatMessage({id: 'ws.dashboard.24h'})],
        ['48h', formatMessage({id: 'ws.dashboard.48h'})],
        ['oneWeek', formatMessage({id: 'ws.dashboard.oneWeek'})],
    ])
    return moment.isMoment(time) ? time.format('YYYY-MM-DD') : timeMap.get(time)
}

type JobDataItemProps = {
    hasIcon?: boolean;
    fail?: number;
    success?: number;
    all?: number;
    time?: DateType;
    [k: string]: any;
}

const JobDataItemWrapper = styled.div`
    width: 50%;
    display: flex;
    flex-direction: column;
    user-select: none;
`

const CountNum = styled(Typography.Title)`
    margin: 0!important;
    color: rgba(0,0,0,0.85)!important;
    font-weight: normal!important;
    transform: translateY(2px);
`

const JobDataItem: React.FC<JobDataItemProps> = ({ hasIcon = false, fail = 0, success = 0, all = 0, time, tab, project_id, setTab }) => {
    const iconStyle: any = { color: '#D0D0D0' }

    if (all) {
        iconStyle.color = '#1890FF'
        iconStyle.currsor = 'pointer'
    }

    const spaceProps = {
        onClick: () => {
            setTab((tab: number | any) => {
                if (tab && tab === project_id) return null
                return project_id
            })
        },
        style: {
            cursor: 'pointer'
        }
    }

    return (
        <JobDataItemWrapper>
            <Typography.Text style={{ color: 'rgba(0,0,0,.45)' }} >{time}</Typography.Text>
            <Space align="end" {...(hasIcon && all ? spaceProps : {})}>
                <CountNum level={3}>{all}</CountNum>
                <Typography.Text style={{ color: '#55AB50' }}>{success}</Typography.Text>
                <Typography.Text style={{ color: '#DE5657' }}>{fail}</Typography.Text>
                {
                    hasIcon &&
                    <span style={iconStyle}>
                        {
                            tab === project_id ?
                                <UpSquareOutlined /> :
                                <DownSquareOutlined />
                        }
                    </span>
                }
            </Space>
        </JobDataItemWrapper>
    )
}


type ListRowProps = {
    [k: string]: React.ReactNode | string
}

const JobTitle = styled(Typography.Link)`
    color: rgba(0,0,0,.65)!important;
`

const ListRowWrapper = styled.div`
    border-bottom: 1px solid rgba(0,0,0,.06);
    height: 38px;
    line-height: 38px;
    padding: 0 16px;
    & .ant-col { color : rgba(0,0,0,.5);}
    .col-hover:hover {
        color: #1890ff;
        a { color: #1890ff!important; }
    }
    &.row-hover:hover {
        background-color: #fafafa;
    }
`

const ListRow: React.FC<ListRowProps> = ({ title, state, result, colHover, rowHover, start_time }) => {
    return (
        <ListRowWrapper className={cls(rowHover && 'row-hover')}>
            <Row align="middle">
                <Col span={14} className={cls(colHover && 'col-hover')}>
                    {title || '-'}
                </Col>
                <Col span={4}>
                    {start_time || "-"}
                </Col>
                <Col span={3}>
                    {state || '-'}
                </Col>
                <Col span={3}>
                    {result || '-'}
                </Col>
            </Row>
        </ListRowWrapper>
    )
}

type TabCardProps = {
    project_list?: any[]
    time: string
    product_id?: string
}

type JobDataProps = {
    time: string;
    [k: string]: any;
}

type BageLineProps = {
    status?: string | undefined;
}

const BageLine = styled.div<BageLineProps>`
    width: 100%;
    height: 4px;
    border-radius: 4px 4px 0 0;
    position: absolute;
    left: 0;
    top: 0;
    background-color:${({ status }) => getStatusColor(status || '')};
`

const JobData: React.FC<JobDataProps> = (props) => {
    const { formatMessage } = useIntl()
    const { time, ...rest } = props
    const { fail_num, complete_num, project_total_job, today_job_all, today_job_fail, today_job_success } = rest

    return (
        <div style={{ display: 'flex' }}>
            <JobDataItem
                hasIcon
                {...rest}
                time={`${getCurrentTimeStr(time)} Jobs`}
                all={today_job_all}
                success={today_job_success}
                fail={today_job_fail}
            />
            <JobDataItem
                time={formatMessage({id: 'ws.dashboard.all.job'})}
                all={project_total_job}
                success={complete_num}
                fail={fail_num}
            />
        </div>
    )
}

const flexCol = `
    display: flex;
    flex-direction: column;    
`

const flexRow = `
    display: flex;
    flex-direction: row;    
`

const TabCardWrapper = styled.div`
    ${flexCol}
    margin-bottom : 10px;
`
const hoverText = `
    &:hover {
        color: #1890FF!important;
    }    
`
const ProjectTitle = styled(Typography.Link)`
    font-size: 16px;
    color: rgba(0,0,0,0.85)!important;
    ${hoverText}
`

const TabCardContent = styled.div`
    ${flexRow}
    gap: 10px;
    z-index: 5;
`
const activeCardCls = `
    border-left: 1px solid rgba(0,0,0,0.10);
    border-right: 1px solid rgba(0,0,0,0.10);
    border-radius: 4px 4px 0 0;
    box-shadow: -5px -5px 6px -4px rgb(0 0 0 / 12%), 5px -5px 6px -4px rgb(0 0 0 / 8% );
    background-color: #ffffff;
    height: 140px;
`
const CardItem = styled.div<{ active: boolean }>`
    ${flexCol}
    position: relative;
    border-radius: 4px;
    height: 130px;
    width: calc(( 100% - 30px ) / 4);
    padding: 16px;
    background-color: #F8FAFB;
    ${({ active }) => active && activeCardCls}
`
const CardBody = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
`

const CardBodyTitle = styled.div`
    width: calc(100% - 30px);
    display: flex;
    gap: 8px;
    justify-content: left;
    align-items: center ;
`
const CardBodyData = styled.div<{ state: string }>`
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: ${({ state }) => getStatusColor(state)};
    display: flex;
    justify-content: center;
    align-items: center;
`
const CardProcessing = styled(Badge)`
    & .ant-badge-status-dot {
        width: 20px;
        height: 20px;
    }
`
const CardExpandedRow = styled.div`
    width: 100%;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    padding: 10px 20px 20px;
    box-shadow: 0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05);
`

const CardExpandedContainer = styled.div`
    box-shadow: inset 0 -1px 0 0 rgba(0,0,0,0.06);
    border: 1px solid rgba(0,0,0,0.10);
    border-radius: 0 0 4px 4px;
    overflow: hidden;
    transform: translateY(-1px);
    box-shadow:  0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05);
`

const filterIssue = (state: string) => {
    const { formatMessage } = useIntl()
    return new Map([
        ['fail', formatMessage({id: 'ws.dashboard.fail.reason'})],
        ['success', formatMessage({id: 'ws.dashboard.success.reason'})],
        ['pending', formatMessage({id: 'ws.dashboard.pending.reason'})],
    ]).get(state) ?? formatMessage({id: 'ws.dashboard.no.job'})
}

const TabCardItem: React.FC<{ list: any[] } & TabCardProps> = ({ list = [], time }) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const [tab, setTab] = React.useState(null)
    const [visible, setVisible] = React.useState(false);
    const [jobState, setJobState] = React.useState('');
    const defaultState = ['complete', 'pass', 'running', 'fail', 'pending', 'stop', 'skip']
     
    const handleSelect = (val:any) => {
        setJobState(val)
    }
    
    const handleClose = () => {
        setJobState('')
        setVisible(false);
    }

    const handleVisibleChange = (newVisible: boolean) => {
        setVisible(newVisible);
    };

    const expandedRow = React.useMemo(() => {
        if (!tab) return []
        const idx = list.findIndex((x) => x.project_id === tab)
        if (~idx) {
            const { today_query } = list[idx]
            if (today_query && today_query.length > 0) {
                if(jobState){
                    // 前后端“成功”时的字符串不一致,所以单独判断
                    if (jobState === 'complete') { return today_query.filter((item:any) => item.today_query_state === 'success') }
                    return today_query.filter((item:any) => item.today_query_state === jobState)
                } 
                return today_query
            }
            return []
        }
        return []
    }, [tab, list, jobState])

    React.useEffect(() => {
        setTab(null)
    }, [time])

    return (
        <TabCardWrapper>
            <TabCardContent>
                {
                    list.map((x) => (
                        <CardItem
                            key={x.project_id}
                            active={tab === x.project_id}
                        >
                            <BageLine status={x.project_state} />
                            <CardBody>
                                <CardBodyTitle>
                                    <ProjectTitle href={`/ws/${ws_id}/dashboard/${x.project_id}`} target="_blank" ellipsis >{x.project_name}</ProjectTitle>
                                    {
                                        x.project_description &&
                                        <Tooltip color={'#fff'} title={<Typography.Text>{x.project_description}</Typography.Text>}>
                                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                        </Tooltip>
                                    }
                                </CardBodyTitle>
                                <Tooltip
                                    color={'#ffffff'}
                                    title={
                                        <Typography.Text>{getCurrentTimeStr(time) + filterIssue(x.project_state)}</Typography.Text>
                                    }
                                >
                                    {
                                        x.project_state === 'pending'
                                            ? <CardProcessing status="processing" />
                                            :
                                            <CardBodyData state={x.project_state}>
                                                {
                                                    x.project_state === 'fail' &&
                                                    <CloseOutlined style={{ color: '#fff', fontSize: 10 }} />
                                                }
                                                {
                                                    x.project_state === 'success' &&
                                                    <CheckOutlined style={{ color: '#fff', fontSize: 10 }} />
                                                }
                                            </CardBodyData>
                                    }
                                </Tooltip>
                            </CardBody>
                            <JobData {...x} tab={tab} setTab={setTab} time={time} />
                        </CardItem>
                    ))
                }
            </TabCardContent>
            <CardExpandedContainer style={{ display: tab ? 'block' : 'none' }}>
                <CardExpandedRow>
                    <ListRow
                        title={`${getCurrentTimeStr(time)} ${formatMessage({id: 'ws.dashboard.job.name'})}`}
                        state={
                            <Popover
                                overlayClassName={'self_popover_no_content'}
                                title={
                                    <>
                                        <FormattedMessage id="ws.dashboard.job.state"/>：
                                        <Select style={{ width: 150 }} 
                                            placeholder={<FormattedMessage id="ws.dashboard.please.select.state"/>} 
                                            onSelect={handleSelect}
                                            allowClear
                                            onClear={handleClose}
                                        >
                                            {
                                                defaultState.map((item) => (
                                                    <Select.Option value={item}>{item.replace(/^[a-z]/, (L)=>L.toUpperCase())}</Select.Option>
                                                ))
                                            }
                                        </Select>
                                    </>
                                }
                                trigger="click"
                                visible={visible}
                                onVisibleChange={handleVisibleChange}
                            >
                                <Space style={{ color: 'rgba(0,0,0,.5)' }}>
                                    <FormattedMessage id="ws.dashboard.job.state"/>
                                    <FilterOutlined style={{ color: jobState ? '#1890ff': undefined }}/>
                                </Space>
                            </Popover>
                        }
                        result={formatMessage({id: 'ws.dashboard.job.result'})}
                        start_time={formatMessage({id: 'ws.dashboard.job.start_time'})}
                    />
                    {expandedRow?.length ?
                        expandedRow.map((y: any) => (
                            <ListRow
                                key={y.today_job_id}
                                rowHover
                                colHover
                                title={
                                    <JobTitle href={`/ws/${ws_id}/test_result/${y.today_job_id}`} target={"_blank"}>
                                        {`#${y.today_job_id} ${y.today_query_name}`}
                                    </JobTitle>
                                }
                                state={<JobListStateTag state={y.today_query_state} />}
                                result={
                                    <Space size={24}>
                                        <Typography.Text style={{ color: '#81BF84' }}>{y.today_query_pass ?? '-'}</Typography.Text>
                                        <Typography.Text style={{ color: '#C84C5A' }}>{y.today_query_fail ?? '-'}</Typography.Text>
                                    </Space>
                                }
                                start_time={y.today_query_job_start_time}
                            />
                        ))
                        :
                        <div style={{textAlign: 'center', marginTop:15, color:'#00000073'}}><FormattedMessage id="no.data"/></div>
                    }
                </CardExpandedRow>
            </CardExpandedContainer>
        </TabCardWrapper>
    )
}

export default TabCardItem
