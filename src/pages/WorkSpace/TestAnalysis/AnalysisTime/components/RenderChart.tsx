import { Card } from 'antd'
import React, { memo, useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import _ from 'lodash'
import { useParams } from 'umi'

import customChartOption from './customChartOption'
import styled from 'styled-components'
import PerfLineOption from './PerfLineOption'
import passRateLineOption from './passRateLineOption'
import AliyunPerfLine from './AliyunPerfLine'
import { targetJump } from '@/utils/utils'

const Title = styled.div`
    width:100%;
    font-size:16px;
    font-weight:500;
    color: rgba(0,0,0,0.85);
    line-height:43px;
    height:43px;
    border-bottom:1px solid #E9E9E9;
    text-indent:1em;
`

const CardWrapper = styled(Card)`
    height: 360px;
    /* margin-top: 10px; */
    width: 100%;
    .ant-card-body {
        padding: 0 20px;
        border: none;
    }
`

const RenderChart = (props: any) => {
    const { dataSource: chartDatas, title, provider, testType, showType } = props
    const { ws_id }: any = useParams()

    const chart: any = useRef()
    const [dataSource, setDataSource] = useState<any>(undefined)

    useEffect(() => {
        const myChart = echarts.init(chart.current)
        myChart.clear()
        myChart.showLoading()
        if (dataSource && JSON.stringify(dataSource) !== '{}') {
            if (testType === 'performance') {
                if (provider === "aliyun") {
                    myChart.setOption(AliyunPerfLine(dataSource, ws_id))
                }
                else {
                    myChart.setOption(PerfLineOption(dataSource, ws_id))
                }
            }
            if (testType === 'functional') {
                if (showType === 'result_trend')
                    myChart.setOption(
                        customChartOption(dataSource, ws_id)
                    )
                if (showType === 'pass_rate')
                    myChart.setOption(
                        passRateLineOption(dataSource, ws_id)
                    )
            }
            myChart.on("click", 'series.line', (params: any) => {
                const { data } = params
                if (data) {
                    const { job_id } = data
                    if (job_id) targetJump(`/ws/${ws_id}/test_result/${job_id}`)
                }
            })
        }
        myChart.hideLoading()
        return () => {
            myChart.dispose()
        }
    }, [dataSource])

    useEffect(() => {
        setDataSource(undefined)
    }, [provider, testType, showType])

    useEffect(() => {
        setDataSource(chartDatas || undefined)
    }, [chartDatas])

    return (
        <CardWrapper >
            {
                testType === 'performance' &&
                <Title>{title}</Title>
            }
            {
                (testType === 'functional' && showType === 'result_trend') &&
                <Title>功能结果趋势图</Title>
            }
            {
                (testType === 'functional' && showType === 'pass_rate') &&
                <Title>功能通过率趋势图</Title>
            }
            <div ref={chart} style={{ width: '100%', height: 360 - 48 }} />
        </CardWrapper>
    )
}

export default memo(RenderChart)