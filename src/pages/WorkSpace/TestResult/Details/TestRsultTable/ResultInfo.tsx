import { Tabs } from 'antd'
import React from 'react'
import { isUrl } from '@/utils/utils'
import { useIntl, FormattedMessage } from 'umi'

import TestResult from './InfoResultTable'
import ResultFile from './InfoResultFile'
import VersionInfo from './ResultVersionInfo'
import MonitorData from './MonitorData'
import MetricResultTable from './MetricResultTable'

import styled from "styled-components"

const CustomTabs = styled(Tabs)`
    .ant-tabs-nav {
        margin: 0;
    }
`

const ResultInfo: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const { testType = 'functional' } = props
    const { result_data = {} } = props
    const { ci_detail, result } = result_data
    const ciDetail = ci_detail ? JSON.parse(ci_detail) : {}

    const [tab, setTab] = React.useState("1")
    // console.log('ciDetail:', ci_detail);
    const RowItem = ({ label, value }: any) => {
        return (
            <div style={{ display: 'flex' }}>
                <div style={{ opacity: 0.85, width: 124, fontFamily: 'PingFangSC-Medium', fontSize: 14 }}>{label}</div>
                {matchResult(value)}
            </div>
        )
    }
    const matchResult = (params: string) => {
        switch (params) {
            case 'success': return <span style={{ color: '#81BF84' }}>{'Complete'}</span>
            case 'fail': return <span style={{ color: '#C84C5A' }}>{'Fail'}</span>
            default: return isUrl(params) ? <a href={params}>{params}</a> : <span style={{ opacity: 0.65 }}>{params}</span>
        }
    }

    return (
        <div style={{ paddingLeft: 40, paddingRight: 0, background: '#FBFBFB' }}>
            <CustomTabs defaultActiveKey="1" onTabClick={(t: any) => setTab(t)} activeKey={tab}>
                <Tabs.TabPane tab={<FormattedMessage id="ws.result.details.tab.testResult" />} key="1" />
                {
                    ['performance', 'business_performance'].includes(testType) &&
                    <Tabs.TabPane tab={<FormattedMessage id="ws.result.details.tab.monitor" />} key="2" />
                }
                <Tabs.TabPane tab={<FormattedMessage id="ws.result.details.tab.log" />} key="3" />
                <Tabs.TabPane tab={<FormattedMessage id="ws.result.details.tab.versionInfo" />} key="4" />
                {
                    ['business_business'].includes(testType) &&
                    <Tabs.TabPane tab={<FormattedMessage id="ws.result.details.tab.executionDetails" />} key="5" />
                }
            </CustomTabs>
            {
                tab === "1" &&
                <>
                    {['performance', 'business_performance'].includes(testType) &&
                        <MetricResultTable {...props} />
                    }
                    {['functional', 'business_functional'].includes(testType) &&
                        <TestResult {...props} />
                    }
                    {['business_business'].includes(testType) &&
                        <div style={{ background: '#fff', padding: '16px 24px' }}>
                            <RowItem label="Test Result" value={result || '-'} />
                        </div>
                    }
                </>
            }
            {
                tab === "2" &&
                <MonitorData {...props} />
            }
            {
                tab === "3" &&
                <ResultFile {...props} />
            }
            {
                tab === "4" &&
                <VersionInfo {...props} />
            }
            {
                tab === "5" &&
                <div style={{ background: '#fff', padding: '16px 24px' }}>
                    <RowItem label="CI type" value={ciDetail.ci_system || '-'} />
                    <RowItem label="Build ID" value={ciDetail.build_id || '-'} />
                    <RowItem label="CI Project" value={ciDetail.ci_project || '-'} />
                </div>
            }
        </div>
    )
}

export default ResultInfo