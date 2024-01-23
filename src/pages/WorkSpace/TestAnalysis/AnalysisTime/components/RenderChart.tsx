import { Card } from 'antd'
import React, { memo, useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { useParams, useIntl, FormattedMessage } from 'umi'

import customChartOption from './customChartOption'
import styled from 'styled-components'
import PerfLineOption from './PerfLineOption'
import passRateLineOption from './passRateLineOption'
import AliyunPerfLine from './AliyunPerfLine'
import { targetJump } from '@/utils/utils'

const Title = styled.div`
    width: 100%;
    font-size: 16px;
    font-weight: 500;
    color:  rgba(0,0,0,0.85);
    line-height: 43px;
    height: 43px;
    border-bottom: 1px solid #E9E9E9;
    text-indent: 1em;
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

type RenderChartProps = {
    dataSource?: any;
    title?: string;
    provider_env?: string;
    test_type?: string;
    show_type?: string;
    [k: string]: any;
}

const RenderChart: React.FC<RenderChartProps> = (props) => {
    const { formatMessage } = useIntl()
    const { dataSource: chartDatas, title, provider_env, test_type, show_type } = props
    const { ws_id }: any = useParams()

    const chart: any = useRef()
    const [dataSource, setDataSource] = useState<any>(undefined)

    React.useEffect(() => {
        const myChart = echarts.init(chart.current)
        myChart.clear()
        myChart.showLoading()
        if (dataSource && JSON.stringify(dataSource) !== '{}') {
            if (test_type === 'performance') {
                if (provider_env === "aliyun") {
                    myChart.setOption(AliyunPerfLine({ dataSource, ws_id, formatMessage }))
                }
                else {
                    myChart.setOption(PerfLineOption({ dataSource, ws_id, formatMessage }))
                }
            }
            if (test_type === 'functional') {
                if (show_type === 'result_trend')
                    myChart.setOption(
                        customChartOption(dataSource, ws_id, formatMessage)
                    )
                if (show_type === 'pass_rate')
                    myChart.setOption(
                        passRateLineOption(dataSource, ws_id, formatMessage)
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
    }, [dataSource, formatMessage, provider_env, show_type, test_type, ws_id])

    useEffect(() => {
        setDataSource(undefined)
    }, [provider_env, test_type, show_type])

    useEffect(() => {
        setDataSource(chartDatas || undefined)
    }, [chartDatas])

    return (
        <CardWrapper >
            {
                test_type === 'performance' &&
                <Title>{title}</Title>
            }
            {
                (test_type === 'functional' && show_type === 'result_trend') &&
                <Title><FormattedMessage id="analysis.chart.title.passRate" /></Title>
            }
            {
                (test_type === 'functional' && show_type === 'pass_rate') &&
                <Title><FormattedMessage id="analysis.chart.title.resultTrend" /></Title>
            }
            <div ref={chart} style={{ width: '100%', height: 360 - 48 }} />
        </CardWrapper>
    )
}

export default memo(RenderChart)