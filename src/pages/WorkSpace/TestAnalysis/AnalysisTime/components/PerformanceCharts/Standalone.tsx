/* eslint-disable react-hooks/exhaustive-deps */
import { useRequest, useIntl, useParams } from "umi"
import React from "react"
import { queryPerfAnalysisList } from '../../services';
import * as echarts from 'echarts'
import { Title, CardWrapper, ChartWrapper } from "./styled";
import { textTip, serverLinkTip, commitLinkTip, renderProviderText, colors, isRepeat } from '..'
import { Row, Space, Spin, Typography } from "antd";
import Legend from "./Legend"
import MetricDropdown from "./MetricDropdown";
import { targetJump } from "@/utils/utils"

const symbol = 'path://M873,435C877.4182739257812,435,881,438.58172607421875,881,443C881,447.41827392578125,877.4182739257812,451,873,451C868.5817260742188,451,865,447.41827392578125,865,443C865,438.58172607421875,868.5817260742188,435,873,435ZM873,436C869.134033203125,436,866,439.1340026855469,866,443C866,446.8659973144531,869.134033203125,450,873,450C876.865966796875,450,880,446.8659973144531,880,443C880,439.1340026855469,876.865966796875,436,873,436ZM873,439C875.2091674804688,439,877,440.7908630371094,877,443C877,445.2091369628906,875.2091674804688,447,873,447C870.7908325195312,447,869,445.2091369628906,869,443C869,440.7908630371094,870.7908325195312,439,873,439Z'

function toFixed(number: any, precision: number) {
    let str: any = number + ''
    const len = str.length
    let last = str.substring(len - 1, len)
    if (last == '5') {
        last = '6'
        str = str.substring(0, len - 1) + last
        return (str - 0).toFixed(precision)
    } else {
        return (+ number).toFixed(precision)
    }
}

const StandaloneChart: React.FC<AnyType> = ({ fetchData = {}, provider_env, valueChange, setFetchData, setLoading }) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const ref = React.useRef<HTMLDivElement>(null)
    const [chart, setChart] = React.useState<any>(undefined)

    const { data, mutate, loading, run } = useRequest(
        (params = fetchData) => queryPerfAnalysisList(params),
        {
            manual: true,
            debounceInterval: 100,
            refreshDeps: [fetchData],
            onSuccess() {
                setLoading(false)
            },
            onError() {
                setLoading(false)
            }
        }
    )

    React.useEffect(() => {
        if (fetchData.metric) {
            run()
        }
    }, [fetchData])

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
        if (metric.length === 0)
            mutate(null)
    }

    const cts = React.useMemo(() => {
        if (!data) return
        const { metric_map, job_list } = data

        const pointers = job_list.reduce((x: any, y: any) => {
            const { date, value } = y
            const val: any = toFixed(+ value, 2) //parseInt(o.value) //
            x[date] = x[date] ? x[date].concat(val) : [val]
            return x
        }, {})

        return Object.keys(metric_map)?.reduce((pre: any, metric_name: any) => {
            const ctx = metric_map[metric_name]
            const { result_data, baseline_data } = ctx

            const { xAxis, lineDatas, upLine, downLine, titles } = Object.entries(result_data).reduce(
                (p: any, cur: any) => {
                    const [ip, list] = cur
                    const ipValues = Object.keys(list).reduce((a: any, date: any) => {
                        const s = list[date]
                        if (s) {
                            const val: any = toFixed(+ s.value, 2) //parseInt(o.value) //

                            const cv = s.cv_value.replace('±', '').replace('%', '') * 100 / 100 / 100
                            const up_value = toFixed((1 + cv) * val, 2)
                            const down_value = toFixed((1 - cv) * val, 2)

                            const point = {
                                ...s,
                                date,
                                metric_name,
                                ip,
                                baseline_data,
                                up_value,
                                down_value,
                                value: val,
                            }

                            if (s.note) point.symbol = symbol

                            if (pointers[date] && isRepeat(pointers[date], val)) {
                                point.symbol = 'circle'
                                point.itemStyle = { color: '#000' }
                            }
                            return a.concat(point)
                        }
                        return a.concat({ date, ip, value: null, baseline_data, metric_name })
                    }, [])

                    const name = `${metric_name}(${ip})`

                    p.titles.push({
                        name,
                    })

                    p.lineDatas.push({
                        type: 'line',
                        smooth: true,
                        ip,
                        symbolSize: 8,
                        connectNulls: false,
                        name,
                        z: 9999,
                        opacity: 1,
                        showAllSymbol: true,
                        data: ipValues
                    })

                    p.upLine.push({
                        type: 'line', smooth: true,
                        lineStyle: { opacity: 0 },
                        tooltip: { show: false },
                        symbol: "none",
                        // name: `${metric_name}-U`,
                        name,
                        select: { disabled: true },
                        selectedMode: false,
                        areaStyle: { color: '#ccc' },
                        data: ipValues.map((i: any) => ({ ...i, value: i.up_value }))
                    })

                    p.downLine.push({
                        type: 'line', smooth: true,
                        lineStyle: { opacity: 0 },
                        tooltip: { show: false },
                        symbol: "none",
                        name,
                        select: { disabled: true },
                        selectedMode: false,
                        // name: `${metric_name}-D`,
                        areaStyle: { color: '#fff', opacity: 1 }, z: 99,
                        data: ipValues.map((i: any) => ({ ...i, value: i.down_value }))
                    })

                    p.xAxis = Object.keys(list)
                    return p
                },
                { xAxis: [], lineDatas: [], upLine: [], downLine: [], titles: [] }
            )

            pre.baseline.push({
                type: 'line',
                name: metric_name,
                symbol: 'none',
                tooltip: { show: false },
                lineStyle: {
                    width: 1,
                    type: 'dashed'
                },
                z: 9999,
                data: xAxis?.map((i: any) => ({ date: i, value: baseline_data.value })),
            })
            pre.title.push([{
                name: metric_name,
                isBaseline: 1,
            }, ...titles])
            pre.series = pre.series.concat(upLine, downLine, lineDatas)
            pre.xAxis = xAxis
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
                icon: "rect",
                itemHeight: 2,
                itemWidth: 10,
                data: title.flat().map((x: any) => x.name),
                show: false,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    snap: true,
                    type: 'cross'
                },
                enterable: true,
                backgroundColor: '#fff',
                borderColor: "#fff",
                textStyle: {
                    color: 'rgba(0,0,0,0.65)',
                    fontSize: 14,
                },
                extraCssText: 'box-shadow: 0 2px 8px 0 rgba(0,0,0,0.15);border-radius: 2px;padding:12px;max-height: 320px;overflow: auto;',
                formatter: function (params: any) {
                    const tips = params.reduce((pre: any, cur: any) => {
                        const item = cur.data || {}
                        if (!item.value) return pre
                        const element = (
                            `<div style="margin-right:10px">
                                ${cur.marker} ${cur.seriesName} <br />
                                ${commitLinkTip('JobID', item.job_id, ws_id)}
                                ${textTip('commit', item.commit)}
                                ${textTip('Avg', item.value)}
                                ${textTip('CV', item.cv_value)}
                                ${textTip(formatMessage({ id: 'analysis.baseline.value' }), item?.baseline_data.value && Number(item?.baseline_data.value).toFixed(2))}
                                ${textTip(formatMessage({ id: 'analysis.baseline.cv' }), item?.baseline_data.cv_value)}
                                ${textTip('commit', item.commit)}
                                ${serverLinkTip(params.seriesName)}
                                ${renderProviderText(params, provider_env)}
                                ${textTip(formatMessage({ id: 'analysis.table.column.note' }), item.note)}
                            </div>`
                                .trim()
                        )
                        return pre.concat(`<div style="display:flex;">${element}</div>`)
                    }, "")

                    if (tips.length === 0) return ""
                    return `<div style="display:flex;flex-direction:row;gap:8px;max-width:545px;flex-wrap:wrap;">${tips}<div>`
                },
            },
            color: colors,
            grid: { left: '5%', right: 60, bottom: '10%', top: 20 }, //left: 50, 
            xAxis: {
                type: 'category',   // 还有其他的type，可以去官网喵两眼哦
                data: xAxis,
                axisLabel: {
                    showMaxLabel: true,
                },
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisPointer: {
                    z: 100
                },
                min: "dataMin",
                max: "dataMax",
                splitArea: {
                    areaStyle: {
                        color: ['#fff', '#fff']
                    }
                },
                axisLabel: {
                    formatter(value: any) {
                        const len = (parseInt(value) + "").length
                        if (len > 6) {
                            const q = new Map([
                                [1, formatMessage({ id: 'analysis.wan' })],
                                [2, formatMessage({ id: 'analysis.yi' })],
                                [3, formatMessage({ id: 'analysis.zhao' })]
                            ])

                            const s = parseInt((len / 4) as any)
                            return toFixed(value / Math.pow(10000, s), 2) + q.get(s)
                        }
                        return value
                    }
                },
                zlevel: 100
            },
            series: [
                ...series,
                ...baseline,
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
            <Spin spinning={loading}>
                <Title style={{ height: "auto", lineHeight: "28px", minHeight: 43, display: "flex", alignItems: "center" }}>
                    <Space size={0} wrap>
                        {
                            fetchData?.metric?.map((t: any) => (
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
                    <Space size={[24, 0]} wrap style={{ paddingLeft: "3%", paddingRight: "3%" }}>
                        {
                            cts?.title?.map((i: any, idx: any) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <Legend key={idx} isStandalone source={i} chartRef={chart} provider_env={provider_env} />
                            ))
                        }
                    </Space>
                </Row>

                <ChartWrapper ref={ref} />

            </Spin>
        </CardWrapper>
    )
}

export default React.memo(StandaloneChart, (prev, next) => {
    return JSON.stringify(prev?.fetchData) === JSON.stringify(next?.fetchData)
})
