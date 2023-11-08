/* eslint-disable react-hooks/exhaustive-deps */
import { useRequest, useIntl, useParams } from "umi"
import React from "react"
import { queryPerfAnalysisList } from '../../services';
import * as echarts from 'echarts'
import { Title, CardWrapper, ChartWrapper } from "./styled";
import { textTip, serverLinkTip, commitLinkTip } from '..'
import { Row, Space, Typography } from "antd";
import Legend from "./Legend"
import MetricDropdown from "./MetricDropdown";
import { targetJump } from "@/utils/utils"

const symbol = 'path://M873,435C877.4182739257812,435,881,438.58172607421875,881,443C881,447.41827392578125,877.4182739257812,451,873,451C868.5817260742188,451,865,447.41827392578125,865,443C865,438.58172607421875,868.5817260742188,435,873,435ZM873,436C869.134033203125,436,866,439.1340026855469,866,443C866,446.8659973144531,869.134033203125,450,873,450C876.865966796875,450,880,446.8659973144531,880,443C880,439.1340026855469,876.865966796875,436,873,436ZM873,439C875.2091674804688,439,877,440.7908630371094,877,443C877,445.2091369628906,875.2091674804688,447,873,447C870.7908325195312,447,869,445.2091369628906,869,443C869,440.7908630371094,870.7908325195312,439,873,439Z'

const ClusterChart: React.FC<AnyType> = (props) => {
    const { fetchData = {}, setFetchData, provider_env, valueChange, setLoading } = props
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const ref = React.useRef<HTMLDivElement>(null)
    const [chart, setChart] = React.useState<any>(undefined)

    const { data, mutate } = useRequest(
        (params = fetchData) => queryPerfAnalysisList(params),
        {
            debounceInterval: 200,
            refreshDeps: [fetchData],
            ready: !!fetchData?.metric,
            onSuccess() {
                setLoading(false)
            },
            onError() {
                setLoading(false)
            }
        }
    )

    React.useEffect(() => {
        if (!data) return
        const { job_list } = data
        if (!job_list) return
        valueChange?.(job_list)
    }, [data])

    const handleMetricChange = ($query: any) => {
        const { metric } = $query
        setFetchData((p: any) => {
            return p.map((x: any) => {
                if (x.key === fetchData?.key)
                    return {
                        ...x,
                        metric,
                    }
                return x
            })
        })
        if (metric.length === 0) mutate(null)
    }

    const cts = React.useMemo(() => {
        if (!data) return
        const { metric_map } = data

        return Object.keys(metric_map)?.reduce((pre: any, metric_name: any) => {
            const ctx = metric_map[metric_name]
            const { result_data, baseline_data } = ctx

            const { xAxis, lineDatas } = Object.entries(result_data).reduce(
                (p: any, cur: any) => {
                    const [date, vals] = cur
                    if (vals) {
                        const { value, ...rest } = vals
                        const val = value ? Number(Number(value).toFixed(2)) : null

                        p.lineDatas.push({
                            ...rest,
                            date,
                            baseline_data,
                            value: val,
                            symbol: value?.note ? symbol : undefined,
                        })
                    }
                    else {
                        p.lineDatas.push({ date, value: null })
                    }

                    if (!p.xAxis.includes(data))
                        p.xAxis.push(date)

                    return p
                },
                { xAxis: [], lineDatas: [] }
            )

            pre.title.push({
                name: metric_name,
                isBaseline: 0
            })

            pre.baseline.push({
                type: 'line',
                name: metric_name,
                symbol: 'none',
                tooltip: { show: false },
                lineStyle: {
                    width: 1,
                    type: 'dashed'
                },
                data: xAxis?.map((i: any) => ({ date: i, value: baseline_data.value })),
            })

            pre.series.push({
                type: 'line',
                name: metric_name,
                showAllSymbol: true,
                smooth: true,
                symbolSize: 8,
                connectNulls: false,
                data: lineDatas
            })

            pre.xAxis = Array.from(new Set(pre.xAxis.concat(xAxis)))
            return pre
        }, { baseline: [], title: [], series: [], xAxis: [] })
    }, [data])

    React.useEffect(() => {
        if (!ref.current) return
        if (!cts) return
        const { xAxis, series, title, baseline } = cts
        const myChart = echarts.init(ref.current)
        myChart.clear()
        myChart.showLoading()

        myChart.setOption({
            legend: {
                data: title.map((i: any) => i.name),
                show: false,
            },
            tooltip: {
                // trigger: 'axis',
                trigger: 'item',
                axisPointer: {
                    snap: true,
                    type: 'cross',
                },
                enterable: true,
                backgroundColor: '#fff',
                borderColor: "#fff",
                textStyle: {
                    color: 'rgba(0,0,0,0.65)',
                    fontSize: 14,
                },
                extraCssText: 'box-shadow: 0 2px 8px 0 rgba(0,0,0,0.15);border-radius: 2px;padding:12px;',
                formatter: function (params: any) {
                    const item = params.data || {}
                    const { baseline_data } = item
                    const element = (
                        `<div style="margin-right:10px">
                            ${params.marker} ${params.name} ${params.seriesName}<br />
                            ${commitLinkTip('JobID', item?.job_id, ws_id)}
                            ${textTip('commit', item?.commit)}
                            ${textTip('Avg', item?.value)}
                            ${textTip('CV', item?.cv_value)}
                            ${textTip(formatMessage({ id: 'analysis.baseline.value' }), baseline_data?.value && Number(baseline_data?.value).toFixed(2))}
                            ${textTip(formatMessage({ id: 'analysis.baseline.cv' }), baseline_data?.cv_value)}
                            ${textTip('commit', item?.commit)}
                            ${serverLinkTip(item?.server)}
                            ${textTip(formatMessage({ id: 'analysis.specs' }), item?.instance_type)}
                            ${textTip('Image', item?.image)}
                            ${textTip('Bandwidth', item?.bandwidth)}
                            ${textTip('RunMode', item?.run_mode)}
                            ${textTip(formatMessage({ id: 'analysis.table.column.note' }), item?.note)}
                            ${textTip(formatMessage({ id: 'analysis.chart.compare_result' }), item?.compare_result)}
                        </div>`
                            .trim()
                    )
                    return `<div style="display:flex;">${element}</div>`
                },
            },
            grid: { left: '5%', right: 60, bottom: '10%', top: "5%" }, //left: 50, 
            xAxis: {
                type: 'category',   // 还有其他的type，可以去官网喵两眼哦
                data: xAxis,
                axisLabel: {
                    showMaxLabel: true,
                }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false, lineStyle: { type: 'dashed' }, },
            },
            series: [
                ...series,
                ...baseline
            ],
        })

        myChart.on("click", 'series.line', (params: any) => {
            if (params?.data) {
                const { job_id } = params?.data
                if (job_id) targetJump(`/ws/${ws_id}/test_result/${job_id}`)
            }
        })

        myChart.hideLoading()
        setChart(myChart)
        return () => {
            myChart.dispose()
            setChart(undefined)
        }
    }, [cts])

    if (!data) return <></>
    if (data?.job_list?.length === 0) return <></>

    return (
        <CardWrapper>
            <Title style={{ height: "auto", lineHeight: "28px", minHeight: 43, display: "flex", alignItems: "center" }}>
                <Space size={0}>
                    {
                        fetchData?.metric.map((t: any) => (
                            <Typography.Text key={t}>{t}</Typography.Text>
                        ))
                    }
                    <MetricDropdown
                        onChange={handleMetricChange}
                        fetchData={fetchData}
                    />
                </Space>
            </Title>

            <Row justify={"center"}>
                <Space size={16} >
                    {
                        cts.title?.map((i: any) => (
                            <Legend provider_env={provider_env} key={i.name} {...i} chartRef={chart} />
                        ))
                    }
                </Space>
            </Row>

            <ChartWrapper ref={ref} />

        </CardWrapper>
    )
}

export default React.memo(ClusterChart, (prev, next) => JSON.stringify(prev?.fetchData) === JSON.stringify(next?.fetchData))