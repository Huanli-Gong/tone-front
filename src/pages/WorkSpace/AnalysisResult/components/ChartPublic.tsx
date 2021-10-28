import React, { useEffect, useRef , forwardRef , useImperativeHandle } from 'react'
import echarts from 'echarts';

const ResultChart = ( props : any , ref : any ) => {
    const { onRef , name , setLegend, idx } = props
    const chart : any = useRef()
    const chartDom : any = useRef()
    
    useEffect(() => {
        chartDom.current?.dispatchAction({
            name,
            type: "legendToggleSelect"
        });
        setTimeout(() => {
            setLegend('')
        } , 300 )
    } , [ name ])

    useImperativeHandle( onRef , () => (
        {
            legendToggleSelect ( name  = '' ) {
                chartDom.current.dispatchAction({
                  name,
                  type: "legendToggleSelect"
                });
            }
        }
    ))
    useEffect(() => {
        chartDom.current = echarts.init(chart.current, {});
        let { metric,metricLen,confLen,identify,conf } = props
        let series:any = []
        let xAxisData:any = []
        let legData:any = []
        let metricData = []
        let len = 0
        let title = confLen === 0 ? `Config${idx + 1} (Metrics Num:${metricLen})` : ''
        legData.push(`对比标识：${identify.base_group.tag}`)
        for (let compare = identify.compare_groups,k = 0; k < compare.length; k++) {
            legData.push(`对比标识：${compare[k].tag}`)
        }
        metricData.push(metric.test_value)
        xAxisData.push(metric.metric)
        for (let compare = metric.compare_data,i = 0; i < compare.length; i++) {
            metricData.push(compare[i].test_value)
            len = compare.length
        }
        for (let j = 0; j < len + 1; j++) {
            series.push({
                type: 'bar', 
                data:  [metricData[j]],
                barWidth: '10px', 
                name: legData[j],
                barGap: '80%', 
                barCategoryGap: '40%'
            })
        }

        chartDom.current.setOption({
            title: {
                text: title,
                left: 0,
                top: 20,
                textStyle: {
                    fontFamily: 'PingFangSC-Regular',
                    fontSize: 12,
                    color: 'rgba(0,0,0,0.85)',
                },
            },
            color: ['#FAD337', '#4DCB73', '#3BA0FF', '#36CBCB'],
            grid: {
                left: '2%',
                right: '2%',
                top: 70,
                containLabel: true,
                borderWidth:0,
            },
           
            tooltip: {
                trigger:'item',
                // position: function (point:any, params:any, dom:any, rect:any, size:any) {
                //     console.log('point',point,params,dom,rect,size)
                //     　　//其中params为当前鼠标的位置
                //     return [point[0]-120,'30%'];
                // },
                show:true,
                confine:true,
                // axisPointer: {
                //     snap: true,
                //     type: 'cross',
                // },
                //position: ['60%', '40%'],
                backgroundColor: '#fff',
                borderColor: "#fff",
                textStyle: {
                    color: 'rgba(0,0,0,0.65)',
                    fontSize: 14,
                },
                extraCssText: 'box-shadow: 0 2px 8px 0 rgba(0,0,0,0.15);border-radius: 2px;padding:12px;',
                formatter : function (params:any) {
                    return `<div style="font-weight:bold">
                    <span style="width:8px;height:8px;border-radius:50%;background:${params.color};display:inline-block"></span>
                    ${params.seriesName}</div>
                    <div>Test Conf：${conf}</div>
                    <div>${params.name}：${params.value}</div>`
                }    
            },
            legend:{
                data:legData,
                show:false,
            },
           
            xAxis: [
                {
                    type: 'category',
                    data: xAxisData,
                    axisTick: {
                        alignWithLabel: true,
                        show: false,
                    },
                }
            ],
            yAxis: [
                {
                    show: true,
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false   //刻度
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            type: 'dashed'
                        }
                    }
                }
            ],
            series
        })
    } , [])
    return (
        <>
            <div ref={ chart } style={{ width: 207, height: 320, display:'inline-block' }} ></div>
        </>
    )
}

export default forwardRef( ResultChart );

