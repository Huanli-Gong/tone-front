/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-var */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
import React, { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import { toPercentage, handleIcon } from '@/components/AnalysisMethods/index';
import { handleColor, switchExpectation } from './ChartMethod';
const TypeChart = (props: any) => {
    const { callBackColor, name, envData, chartType, time, data } = props
    const chart = useRef<any>()
    const chartDom: any = useRef()

    useEffect(() => {
        chartDom.current?.dispatchAction({
            name,
            type: "legendToggleSelect"
        });
    }, [name])

    const ChartList = useMemo(() => {
        let obj: any = {
            series: [], // 结果List
            xAxisData: [], // 横坐标name
            legData: [], // 图例
            subText: [], // 副标题
            dataZoom_end: 100,
        }
        let metricData: any = [] // test_value
        let result = [] // 组装后数组处理的容器
        let metricLen = 0
        let len = 0
        let legArr = []
        for (let compare = envData.compare_groups, k = 0; k < compare.length; k++) {
            legArr.push(compare[k].tag)
        }
        let newLegArr = legArr.splice(0)
        newLegArr.splice(envData.base_index, 0, envData.base_group.tag)
        obj.legData = obj.legData.concat(newLegArr)
        if (chartType == '1') {
            obj.subText.push(data.direction)
            for (let compare = data.compare_data, i = 0; i < compare.length; i++) {
                metricData.push({
                    value: compare[i]?.test_value,
                    compare_value: compare[i]?.compare_value,
                    compare_result: compare[i]?.compare_result,
                })
                len = compare.length
            }
            obj.xAxisData.push(data.metric)
            for (let j = 0; j < len; j++) {
                obj.series.push({
                    type: 'bar',
                    data: [{
                        value: metricData[j].value,
                        compare_value: metricData[j].compare_value,
                        compare_result: metricData[j].compare_result
                    }],
                    name: obj.legData[j],
                    barWidth: '10px',
                    barGap: '80%',
                    barCategoryGap: '40%',
                    barMinHeight: 1,
                })
            }
        } else {
            if (chartType == '2') {
                if (data.length > 5) {
                    obj.dataZoom_end = (5 / data.length) * 100;
                }
                for (let i = 0; i < data.length; i++) {
                    // metricData.push({
                    //     value: data[i].test_value,
                    // })
                    obj.xAxisData.push(data[i].conf_name)
                    obj.subText.push(data[i].direction)
                    len = data[i].compare_data.length
                    metricLen = data.length
                }
                for (let b = 0; b < len; b++) {
                    data?.forEach((metric: any) => {
                        metric.compare_data?.forEach((compare: any, idx: number) => {
                            if (idx === b) {
                                metricData.push({
                                    value: compare.test_value,
                                    compare_value: compare.compare_value,
                                    compare_result: compare.compare_result,
                                })
                            }
                        })
                    })
                } // metric 对比数据 遍历
            }
            if (chartType == '3') {
                if (data.metric_list.length > 5) {
                    obj.dataZoom_end = (5 / data.metric_list.length) * 100;
                }
                for (let b = 0, metric = data.metric_list; b < metric.length; b++) {
                    obj.xAxisData.push(metric[b].metric)
                    len = metric[b].compare_data.length
                    metricLen = metric.length
                }
                data.metric_list?.forEach((metric: any) => {
                    metric.compare_data?.forEach((item: any) => {
                        metricData.push({
                            value: item.test_value,
                            compare_value: item.compare_value,
                            compare_result: item.compare_result,
                            cv_threshold: metric.cv_threshold,
                            cmp_threshold: metric.cmp_threshold
                        })
                    })
                })
            }
            for (let k = 0, leng = metricData.length; k < leng; k += metricLen) {
                result.push(metricData.slice(k, k + metricLen));
            }
            for (let m = 0; m < len; m++) {
                obj.series.push({
                    type: 'bar',
                    data: result[m],
                    name: obj.legData[m],
                    barWidth: '10px',
                    barGap: '80%',
                    barCategoryGap: '40%',
                    barMinHeight: 1,
                })
            }
        }
        return obj;
    }, [data])

    useEffect(() => {
        const { series, subText, xAxisData, legData, dataZoom_end } = ChartList
        const duration = time.reduce((p: any, c: any) => p += c * 2, 0)
        let option = {
            title: {
                subtext: chartType == '3' ? '' : switchExpectation(subText.toString())
            },
            grid: {
                left: 40,
                right: 8,
                bottom: chartType === '1' ? '15%' : '30%'
            },
            animation: false,
            xAxis: {
                data: xAxisData,
                type: 'category',
                nameLocation: 'start',
                axisTick: { show: false },
                axisLabel: {
                    interval: 0,
                    formatter: function (val: any) {
                        var strs = val.split(''); //字符串数组
                        var str = ''
                        for (var i = 0, s; s = strs[i++];) { //遍历字符串数组
                            str += s;
                            if (!(i % 15)) str += '\n'; //按需要求余
                        }
                        return str
                        // return str + '\n' + 'more is better' 
                    }
                },
            },
            legend: {
                data: legData,
                show: false,
            },
            tooltip: {
                trigger: chartType == '1' ? 'item' : 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                confine: true,
                show: true,
                renderMode: 'html',
                backgroundColor: '#fff',
                borderColor: "#fff",
                textStyle: {
                    color: 'rgba(0,0,0,0.65)',
                    fontSize: 14,
                },
                extraCssText: 'box-shadow: 0 2px 8px 0 rgba(0,0,0,0.15);border-radius: 2px;padding:12px;z-index:9999',
                formatter: function (params: any) {
                    let result = ''
                    for (let i = 0; i < params.length; i++) {
                        result += `
                            <div style="display:flex;flex-wrap:wrap;">
                                <div style="width:8px;height:8px;border-radius:50%;background:${params[i].color};margin-top:5px;"></div>
                                <div style="padding-left:9px;width:120px;word-break:break-all;white-space:normal;">${params[i].seriesName}</div>
                                <div style="padding-left:16px;">${params[i].value || '-'}</div>
                                <div style="padding-left:9px;width:30px;">
                                    <i style="font-style:normal;color:${handleColor(params[i].data?.compare_result) || ''}">
                                        ${params[i].data?.compare_value || ''}
                                        ${handleIcon(params[i].data?.compare_result) || ''}
                                    </i>
                                </div>
                            </div>
                            `
                    }
                    if (chartType == '1') {
                        return `
                                <div style"width:auto;min-width:300px">
                                    <div style="display:flex;flex-warp:wrap">
                                        <div style="width:180px;word-break:break-all;white-space:normal;font-weight:bold;padding-right:5px">${data.metric}</div>
                                        (${`${toPercentage(data.cv_threshold)}/${toPercentage(data.cmp_threshold)}`})
                                    </div>
                                    <div style="display:flex;flex-warp:wrap">
                                        <div style="width:8px;height:8px;border-radius:50%;background:${params.color};margin-top:5px;"></div>
                                        <div style="padding-left:9px;width:120px;word-break:break-all;white-space:normal;">${params.seriesName}</div>
                                        <div style="padding-left:16px;">${params.value || '-'}</div>
                                        <div style="padding-left:9px;width:30px;">
                                            <i style="font-style:normal;color:${handleColor(params.data.compare_result) || ''}">
                                            ${params.data.compare_value || ''}
                                            ${handleIcon(params.data.compare_result) || ''}
                                            </i>
                                        </div>
                                    </div>
                                </div>`
                    } else if (chartType == '2') {
                        return `<div style="width:auto;min-width:300px">
                                    <div style="font-weight:bold">${params[0].name}</div>
                                    ${result}
                                </div>`
                    } else {
                        return `<div style="width:auto;min-width:300px">
                                    <div>
                                        <span style="font-weight:bold;padding-right:5px">${params[0].name}</span>
                                        (${`${toPercentage(params[0].data.cv_threshold)}/${toPercentage(params[0].data.cmp_threshold)}`})
                                    </div>
                                    ${result}
                                </div>
                               `
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisTick: { show: false, inside: true },
                splitLine: { show: true, lineStyle: { type: 'dashed' }, },
                axisLabel: {
                    showMinLabel: true,
                    showMaxLabel: true,
                    interval: 0,
                    fontSize: 10,
                    margin: 2,
                    formatter: function (value: any) {
                        if (value >= 10000 && value < 100000000) {
                            value = value / 10000 + "万";
                        }
                        if (value >= 100000000 && value < 1000000000000) {
                            value = value / 100000000 + "亿";
                        }
                        return value;
                    }
                },
                boundaryGap: true,
            },
            series,
            dataZoom: [
                {
                    type: 'slider',
                    show: chartType !== '1',
                    realtime: true,
                    start: 0,
                    end: dataZoom_end,
                    handleSize: 8,
                    height: 8,
                },
                {
                    type: 'inside',
                    realtime: true,
                    start: 0,
                    end: dataZoom_end,
                    zoomOnMouseWheel: false,
                    moveOnMouseMove: true,
                    moveOnMouseWheel: true,
                    preventDefaultMouseMove: false,
                }
            ],
        }
        const timer = setTimeout(() => {
            // 渲染数据展示
            const chartObj = echarts.init(chart.current, undefined, {
                renderer: 'svg',
            });
            chartObj.setOption(option as any)
            callBackColor(chartObj.getOption().color)
            chartDom.current = chartObj
        }, duration)

        return () => {
            timer && clearTimeout(timer)
            chartDom.current && chartDom.current.dispose()
        }

    }, [ChartList])

    return (
        <div ref={chart} style={{ width: chartType !== '1' ? '100%' : 268, height: 340, display: 'inline-block', flexShrink: 0 }} />
    )
}
export default React.memo(TypeChart);