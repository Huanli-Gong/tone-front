import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
const TypeChart: React.FC<any> = ({ setLegend, name, envData, data, chartType, loading }) => {
    const chart = useRef<any>()
    useEffect(() => {
        const rageMax: number = data.length > 4 ? parseInt(parseFloat(4 / data.length) * 100) : data.length
        const myChart = echarts.init(chart.current)
        myChart.clear()
        myChart.setOption({
            title: {
                subtext: 'more is better'
            },
            grid: {
                left: 40,
                right: 8
            },
            animation: false,
            xAxis: {
                data,
                axisTick: { show: false },
                axisLabel: {
                    interval: 0,
                    width: 110,
                    formatter: (value: string) => {
                        return value.length > 16 ? value.substr(0, 16) + '...' : value
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: true, lineStyle: { type: 'dashed' }, },
                axisLabel: {
                    showMinLabel: true,
                    showMaxLabel: true,
                    fontSize: 10,
                },
                boundaryGap: true,
                min: 0,
                max: 5000
            },
            dataZoom: [{
                show: chartType !== '1',
                realtime: true,
                start: 0,
                end: rageMax,
                left: '20%',
                height: 8,
                right: '20%',
            },
            {
                type: 'inside',
                realtime: true,
                zoomOnMouseWheel: false,
                start: 0,
                end: rageMax
            }],
        })
        //myChart.hideLoading()
    }, [chartType])
    return (
        <div ref={chart} style={{ width: chartType !== '1' ? '100%' : 268, height: 376, display: 'inline-block', flexShrink: 0 }} />
    )
}
export default TypeChart;
