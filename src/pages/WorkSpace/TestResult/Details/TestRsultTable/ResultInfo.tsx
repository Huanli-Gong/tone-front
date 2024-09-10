import { Tabs } from 'antd'
import React, { useEffect } from 'react'
import { isUrl } from '@/utils/utils'
import { FormattedMessage } from 'umi'

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

const matchResult = (params: string) => {
    switch (params) {
        case 'success': return <span style={{ color: '#81BF84' }}>{'Complete'}</span>
        case 'fail': return <span style={{ color: '#C84C5A' }}>{'Fail'}</span>
        default: return isUrl(params) ? <a href={params}>{params}</a> : <span style={{ opacity: 0.65 }}>{params}</span>
    }
}

const RowItem: React.FC<AnyType> = ({ label, value }: any) => {
    return (
        <div style={{ display: 'flex' }}>
            <div style={{ opacity: 0.85, width: 124, fontFamily: 'PingFangSC-Medium', fontSize: 14 }}>{label}</div>
            {matchResult(value)}
        </div>
    )
}

const ResultInfo: React.FC<any> = (props) => {
    const { testType } = props
    const { result_data = {} } = props
    const { ci_detail, result } = result_data
    const ciDetail = ci_detail ? JSON.parse(ci_detail) : {}

    const [tab, setTab] = React.useState("1")

    // useEffect(()=> {
    //     // 切换到日志文件tab
    //     if (confLogInfo.test_case_id && confLogInfo.test_case_id === test_case_id) {
    //         setTab('3')
    //     }
    // }, [confLogInfo.test_case_id])

    // console.log('ciDetail:', ci_detail);

    return (
        <div style={{ paddingLeft: 40, paddingRight: 0, background: '#FBFBFB', width: "100%" }}>
            <CustomTabs
                defaultActiveKey="1"
                onTabClick={(t: any) => setTab(t) }
                activeKey={tab}
                /* @ts-ignore */
                items={
                    [
                        {
                            key: '1',
                            label: <FormattedMessage id="ws.result.details.tab.testResult" />,
                            children: (
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
                            )
                        },
                        ['performance', 'business_performance'].includes(testType) &&
                        {
                            key: '2',
                            label: <FormattedMessage id="ws.result.details.tab.monitor" />,
                            children: <MonitorData {...props} />
                        },
                        {
                            key: '3',
                            label: <FormattedMessage id="ws.result.details.tab.log" />,
                            children: <ResultFile {...props} />
                        },
                        {
                            key: '4',
                            label: <FormattedMessage id="ws.result.details.tab.versionInfo" />,
                            children: <VersionInfo {...props} />
                        },
                        ['business_business'].includes(testType) &&
                        {
                            key: '5',
                            label: <FormattedMessage id="ws.result.details.tab.executionDetails" />,
                            children: (
                                <div style={{ background: '#fff', padding: '16px 24px' }}>
                                    <RowItem label="CI type" value={ciDetail.ci_system || '-'} />
                                    <RowItem label="Build ID" value={ciDetail.build_id || '-'} />
                                    <RowItem label="CI Project" value={ciDetail.ci_project || '-'} />
                                </div>
                            )
                        }
                    ].filter(Boolean)
                }
            />
        </div>
    )
}

export default ResultInfo