import React, { memo } from 'react'
import { Typography, Row , Space } from 'antd'
import styled from 'styled-components'
import { PreviewTableTr, FullRow, CustomRow } from '../styled'
import { ReactComponent as BaseGroupIcon } from '@/assets/svg/TestReport/BaseIcon.svg'

const SummaryCount = styled(Row)`
    &>div{
        width:48px;
        height:40px;
        border-right:1px solid rgba(0,0,0,0.10);
        display: flex;
        flex-direction: column;
        padding-left:8px;
        &:first-child {
            padding-right:8px;
            padding-left:16px;
            width:56px;
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

const PerfCount = () => (
    <SummaryCount>
        <div><Typography.Text>总计</Typography.Text><Typography.Text>-</Typography.Text></div>
        <div><Typography.Text>上升</Typography.Text><Typography.Text>-</Typography.Text></div>
        <div><Typography.Text>下降</Typography.Text><Typography.Text>-</Typography.Text></div>
    </SummaryCount>
)

const FuncCount = () => (
    <SummaryCount>
        <div><Typography.Text>总计</Typography.Text><Typography.Text>-</Typography.Text></div>
        <div><Typography.Text>通过</Typography.Text><Typography.Text>-</Typography.Text></div>
        <div><Typography.Text>失败</Typography.Text><Typography.Text>-</Typography.Text></div>
    </SummaryCount>
)

const GroupTableRow = () => (
    <GroupRow>
        <PreviewTableTr>
            <Typography.Text strong>对比组</Typography.Text>
        </PreviewTableTr>
        <PreviewTableTr>
            <Space align="center">
                <BaseGroupIcon style={{ transform: 'translateY(2px)'}}/>
                <Typography.Text strong>基准组</Typography.Text>
            </Space>
        </PreviewTableTr>
        <PreviewTableTr><Typography.Text strong>对比组1</Typography.Text></PreviewTableTr>
        <PreviewTableTr><Typography.Text strong>对比组2</Typography.Text></PreviewTableTr>
    </GroupRow>
)

const Summary = (props: any) => {
    return (
        <CustomRow id={'need_test_summary'}>
            <div><Typography.Title level={5} >Summary</Typography.Title></div>
            <GroupTableRow />
            <SummaryTest>
                <PreviewTableTr><Typography.Text strong >性能测试</Typography.Text></PreviewTableTr>
                <PreviewTableTr style={{ padding: 0 }}><PerfCount /></PreviewTableTr>
                <PreviewTableTr style={{ padding: 0 }}><PerfCount /></PreviewTableTr>
                <PreviewTableTr style={{ padding: 0 }}><PerfCount /></PreviewTableTr>
            </SummaryTest>
            <SummaryTest>
                <PreviewTableTr><Typography.Text strong >功能测试</Typography.Text></PreviewTableTr>
                <PreviewTableTr style={{ padding: 0 }}><FuncCount /></PreviewTableTr>
                <PreviewTableTr style={{ padding: 0 }}><FuncCount /></PreviewTableTr>
                <PreviewTableTr style={{ padding: 0 }}><FuncCount /></PreviewTableTr>
            </SummaryTest>
        </CustomRow>
    )
}

export default memo(Summary)