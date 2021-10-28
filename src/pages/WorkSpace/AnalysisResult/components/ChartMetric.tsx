import React, { useEffect, useRef } from 'react'
import echarts from 'echarts';

const ResultChart = ( props : any ) => {
    const { conf,idx } = props
    const chart : any = useRef()
    // useEffect(() => {
        
    // }, [ name ])
    useEffect(() => {
        const myChart = echarts.init( chart.current )
        let { metric,data,identify,idx } = props
        let title = Object.keys(data)
        let series:any = []
        let legData:any = []
        let xAxisData:any = []
        let metricData = []
        let subText:any = []
        let len = 0
        let result:any = []
        let legHeight = 20
        let gridHeight = 70
        let metricLen = metric.length
        for (let i = 0; i < metric.length; i++) {
            metricData.push(metric[i].test_value)
            xAxisData.push(metric[i].conf_name)
            subText.push(metric[i].direction)
            len = metric[i].compare_data.length
        }
        legData.push(`对比标识：${identify.base_group.tag}`)
        for (let compare = identify.compare_groups,k = 0; k < compare.length; k++) {
            legData.push(`对比标识：${compare[k].tag}`)
            if(compare.length > 2 && compare.length <= 5){
                legHeight = 55
                gridHeight = 110
            }else if(compare.length > 5 && compare.length <= 8){
                legHeight = 95
                gridHeight = 140
            }
        }
        for (let b = 0; b < len; b++) {
            metric.map((metric:any)=>{
                metric.compare_data.map((compare:any,idx:number)=>{
                    if(idx === b){
                        metricData.push(compare.test_value)
                        
                    }
                })
            })
        } // metric 对比数据 遍历
        for(let b=0,len=metricData.length;b<len;b += metricLen){
            result.push(metricData.slice(b,b + metricLen));
        }

        for (let m = 0; m < len+1; m++) {
            series.push({
                type: 'bar', 
                data: result[m],
                name: legData[m],
                barWidth: '10px', 
                barGap: '80%', 
                barCategoryGap: '40%'
            })
        }
            myChart.setOption({
                title: {
                    text: `${title[idx]}(Test Conf Num:${metricLen})`,
                    subtext:subText.toString() === 'increase' ? 'more is better' : 'less is better',
                    subtextStyle:{
                        fontFamily: 'PingFangSC-Regular',
                        fontSize: 12,
                        color: '#81BF84',
                    },
                    left: 0,
                    top: legHeight,
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
                    top: gridHeight,
                    containLabel: true,
                    borderWidth:0,
                },
                tooltip: {
                    trigger:'item',
                    position: 'right',
                    show:true,
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
                        <div>Test Conf：${params.name}</div>
                        <div>${title[idx]}：${params.value}</div>`
                    }    
                },
                legend:{
                    data:legData,
                    // top:40,
                    // bottom:20,
                },
                xAxis: [
                    {
                        type: 'category',
                        data: xAxisData,
                        axisTick: {
                            alignWithLabel: true,
                            show: false,
                        },
                        axisLabel:{
                            show:true,
                            interval:0,
                            formatter: function(value:any) {
                                var res = value;
                                if(res.length > 3) {
                                    res = res.substring(0, 5) + "...";
                                }
                                return res;
                            }
                        }
                        
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
                series,
                dataZoom: {
                    show: true, // 为true 滚动条出现
                    realtime: true,  
                    type:'slider', // 有type这个属性，滚动条在最下面，也可以不行，写y：36，这表示距离顶端36px，一般就是在图上面。
                    height: 15, // 表示滚动条的高度，也就是粗细
                    start: 0, // 表示默认展示20%～80%这一段。
                    end: 60
                }

            })
            return () => {
                myChart.dispose()
            }
    } , [])

    return (
        <div ref={ chart }  style={{ width: '100%', height: 320 }} id={`${conf}-${idx}`}/>
    )
}

export default ResultChart;

