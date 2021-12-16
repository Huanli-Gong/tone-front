import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { toPercentage, handleIcon } from '@/components/AnalysisMethods/index';
const TypeChart = (props: any) => {
    const { name, envData, data, chartType } = props
    const chart = useRef<any>()
    const chartDom: any = useRef()

    useEffect(() => {
        chartDom.current?.dispatchAction({
            name,
            type: "legendToggleSelect"
        });
    }, [name])

    const handleColor = (name: any) => {
        const dict = {
            normal: 'rgba(0,0,0,1)',
            increase: '#81BF84',
            decline: '#C84C5A',
            invalid: 'rgba(0,0,0,0.25)',
        }
        return dict[name]
    }
    useEffect(() => {
        chartDom.current = echarts.init(chart.current, {});
        let series: any = [] // 结果List
        let metricData: any = [] // test_value
        let xAxisData: any = [] // 横坐标name
        let legData: any = [] // 图例
        let subText: any = [] // 副标题
        let result = [] // 组装后数组处理的容器
        let metricLen = 0
        let dataZoom_end: number = 100
        let len = 0
        legData.push(envData.base_group.tag)
        for (let compare = envData.compare_groups, k = 0; k < compare.length; k++) {
            legData.push(compare[k].tag)
        }
        if (chartType == '1') {
            metricData.push({
                value: data.test_value,
            })
            subText.push(data.direction)
            for (let compare = data.compare_data, i = 0; i < compare.length; i++) {
                metricData.push({
                    value: compare[i]?.test_value,
                    compare_value: compare[i]?.compare_value,
                    compare_result: compare[i]?.compare_result,
                })
                len = compare.length
            }
            xAxisData.push(data.metric)
            for (let j = 0; j < len + 1; j++) {
                series.push({
                    type: 'bar',
                    data: [{
                        value: metricData[j].value,
                        compare_value: metricData[j].compare_value,
                        compare_result: metricData[j].compare_result
                    }],
                    name: legData[j],
                    barWidth: '10px',
                    barGap: '80%',
                    barCategoryGap: '40%'
                })
            }
        } else {
            if(chartType == '2'){
                if (data.length > 5) {
                    dataZoom_end = (5 / data.length) * 100;
                } 
                for (let i = 0; i < data.length; i++) {
                    metricData.push({
                        value: data[i].test_value,
                    })
                    xAxisData.push(data[i].conf_name)
                    subText.push(data[i].direction)
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
            if(chartType == '3'){
                if (data.metric_list > 5) {
                    dataZoom_end = (5 / data.metric_list) * 100;
                } 
                for (let b = 0, metric = data.metric_list; b < metric.length; b++) {
                    metricData.push({
                        value: metric[b].test_value,
                        cv_threshold: metric[b].cv_threshold,
                        cmp_threshold: metric[b].cmp_threshold
                    })
                    xAxisData.push(metric[b].metric)
                    len = metric[b].compare_data.length
                    metricLen = metric.length
                }
                data.metric_list?.forEach((metric: any) => {
                    metric.compare_data?.forEach((item: any) => {
                        metricData.push({
                            value: item.test_value,
                            compare_value: item.compare_value,
                            compare_result: item.compare_result,
                        })
                    })
                })
            }
            for (let k = 0, leng = metricData.length; k < leng; k += metricLen) {
                result.push(metricData.slice(k, k + metricLen));
            }
            for (let m = 0; m < len + 1; m++) {
                series.push({
                    type: 'bar',
                    data: result[m],
                    name: legData[m],
                    barWidth: '10px',
                    barGap: '80%',
                    barCategoryGap: '40%'
                })
            }
        }
        // 渲染数据展示
        chartDom.current.clear()
        chartDom.current.setOption({
            title: {
                subtext: chartType == '3' ? '' : subText.toString() === ('increase' || '上升') ? 'more is better' : 'less is better'
            },
            grid: {
                left: 40,
                right: 8,
                bottom: '20%'
            },
            animation: false,
            xAxis: {
                data: xAxisData,
                type: 'category',
                nameLocation: 'start',
                axisTick: { show: false },
                axisLabel: {
                    interval: 0,
                    // width: 110,
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
                }
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
                            <div style="display:flex;flex-warp:wrap;">
                                <span style="width:8px;height:8px;border-radius:50%;background:${params[i].color};margin-top:5px;"></span>
                                <span style="padding-left:9px;width:200px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${params[i].seriesName}</span>
                                <span style="padding-left:16px;">${params[i].value}</span>
                                <span style="padding-left:9px;">
                                <i style="font-style:normal;color:${handleColor(params[i].data?.compare_result) || ''}">
                                ${params[i].data?.compare_value || ''}
                                ${handleIcon(params[i].data?.compare_result) || ''}
                                    </i>
                                </span>
                            </div>
                            `
                    }
                    if (chartType == '1') {
                        return `<div>
                                    <span style="font-weight:bold">${data.metric}</span>
                                    (${`${toPercentage(data.cv_threshold)}/${toPercentage(data.cmp_threshold)}`})
                                </div>
                                <div style="display:flex;flex-warp:wrap;">
                                    <span style="width:8px;height:8px;border-radius:50%;background:${params.color};display:inline-block;margin-top:5px;"></span>
                                    <span style="display:inline-block;padding-left:9px;width:200px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${params.seriesName}</span>
                                    <span style="display:inline-block;padding-left:16px;">${params.value}</span>
                                    <span style="display:inline-block;padding-left:9px;">
                                        <i style="font-style:normal;color:${handleColor(params.data.compare_result) || ''}">
                                        ${params.data.compare_value || ''}
                                        ${handleIcon(params.data.compare_result) || ''}
                                        </i>
                                    </span>
                                </div>`
                    } else if (chartType == '2') {
                        return `<div>
                                    <span style="font-weight:bold">${params[0].name}</span>
                                </div>
                                ${result}`
                    } else {
                        return `<div>
                                    <span style="font-weight:bold">${params[0].name}</span>
                                    (${`${toPercentage(params[0].data.cv_threshold)}/${toPercentage(params[0].data.cmp_threshold)}`})
                                </div>
                                ${result}`
                    }

                }
            },
            // color: ['#FAD337', '#4DCB73', '#3BA0FF', '#36CBCB'],
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
                        if (value >= 10000 && value < 10000000) {
                            value = value / 10000 + "w";
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
                    preventDefaultMouseMove: false,
                }],

        })
        props.callBackColor(chartDom.current.getOption().color)
    }, [ chartType, data ])
    return (
        <React.Suspense fallback={ <div> loading... </div> } >
            <div ref={chart} style={{ width: chartType !== '1' ? '100%' : 268, height: 376, display: 'inline-block', flexShrink: 0 }} />
        </React.Suspense>
    )
}
export default React.memo(TypeChart);
