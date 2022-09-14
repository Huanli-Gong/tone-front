import React, { memo } from 'react'
import { Typography, Row , Space } from 'antd'
import styled from 'styled-components'
import { useIntl, FormattedMessage, getLocale } from 'umi'
import { PreviewTableTr, FullRow, CustomRow } from '../styled'
import { ReactComponent as BaseGroupIcon } from '@/assets/svg/TestReport/BaseIcon.svg'

const SummaryCount = styled(Row)`
    &>div{
        width: ${props => props.enLocale? 74: 48}px;
        height: 40px;
        border-right:1px solid rgba(0,0,0,0.10);
        display: flex;
        flex-direction: column;
        padding-left:8px;
        &:first-child {
            padding-right:8px;
            padding-left:16px;
            width: ${props => props.enLocale? 58: 56}px;
        }
        &:nth-child(2) {
            padding-right:8px;
        }
        &:last-child {
            border-right:none;
        }
        span{
            color:rgba(0,0,0,.65);
        }
        &>span:last-child {
            font-size:20px;
            transform: translateY(-8px);
        }
    }
    &>div:first-child  span:last-child {
        color: #649FF6;
    }
    &>div:nth-child(2) span:last-child{
        color: #81BF84;
    }
    &>div:last-child span:last-child{
        color: #C84C5A;
    }
`
const SummaryTest = styled(FullRow)`
    & ${PreviewTableTr} {
        height : 58px;
    }
`

const GroupRow = styled(FullRow)`
    height:48px;
    & ${PreviewTableTr} {
        height:48px;
    }
`

const PerfCount = () => {
    const enLocale = getLocale() === 'en-US'
    return (
        <SummaryCount enLocale={enLocale}>
            <div><Typography.Text><FormattedMessage id="report.all"/></Typography.Text><Typography.Text>-</Typography.Text></div>
            <div><Typography.Text><FormattedMessage id="report.increase"/></Typography.Text><Typography.Text>-</Typography.Text></div>
            <div><Typography.Text><FormattedMessage id="report.decline"/></Typography.Text><Typography.Text>-</Typography.Text></div>
        </SummaryCount>
    )
}

const FuncCount = () => {
    const enLocale = getLocale() === 'en-US'
    return (
        <SummaryCount enLocale={enLocale}>
            <div><Typography.Text><FormattedMessage id="report.all"/></Typography.Text><Typography.Text>-</Typography.Text></div>
            <div><Typography.Text><FormattedMessage id="report.success"/></Typography.Text><Typography.Text>-</Typography.Text></div>
            <div><Typography.Text><FormattedMessage id="report.fail"/></Typography.Text><Typography.Text>-</Typography.Text></div>
        </SummaryCount>
    )
}

const GroupTableRow = () => (
    <GroupRow>
        <PreviewTableTr>
            <Typography.Text strong><FormattedMessage id="report.comparison.group"/></Typography.Text>
        </PreviewTableTr>
        <PreviewTableTr>
            <Space align="center">
                <BaseGroupIcon style={{ transform: 'translateY(2px)'}}/>
                <Typography.Text strong><FormattedMessage id="report.benchmark.group"/></Typography.Text>
            </Space>
        </PreviewTableTr>
        <PreviewTableTr><Typography.Text strong><FormattedMessage id="report.comparison.group1"/></Typography.Text></PreviewTableTr>
        <PreviewTableTr><Typography.Text strong><FormattedMessage id="report.comparison.group2"/></Typography.Text></PreviewTableTr>
    </GroupRow>
)

const Summary = (props: any) => {
    return (
        <CustomRow id={'need_test_summary'}>
            <div><Typography.Title level={5} >Summary</Typography.Title></div>
            <GroupTableRow />
            <SummaryTest>
                <PreviewTableTr><Typography.Text strong ><FormattedMessage id="performance.test"/></Typography.Text></PreviewTableTr>
                <PreviewTableTr style={{ padding: 0 }}><PerfCount /></PreviewTableTr>
                <PreviewTableTr style={{ padding: 0 }}><PerfCount /></PreviewTableTr>
                <PreviewTableTr style={{ padding: 0 }}><PerfCount /></PreviewTableTr>
            </SummaryTest>
            <SummaryTest>
                <PreviewTableTr><Typography.Text strong ><FormattedMessage id="functional.test"/></Typography.Text></PreviewTableTr>
                <PreviewTableTr style={{ padding: 0 }}><FuncCount /></PreviewTableTr>
                <PreviewTableTr style={{ padding: 0 }}><FuncCount /></PreviewTableTr>
                <PreviewTableTr style={{ padding: 0 }}><FuncCount /></PreviewTableTr>
            </SummaryTest>
        </CustomRow>
    )
}

export default memo(Summary)