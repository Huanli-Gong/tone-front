import React, { useEffect, useState } from 'react';
import echarts from 'echarts';
import{ Row,Col,Empty, Spin } from 'antd';
import styles from './index.less';
const RenderChart = (props:any) => {
    const { loading } = props
    const [ anchor,setAnchor ] = useState('')
    const forId = (idx:number, index: number) => {
        return `myChart-${idx}-${index}`
    }

    const handleScroll = (suiteIndex:number,idx: number) => {
        setAnchor(`${suiteIndex}-${idx}`)
        document.querySelector(`#myChart-${suiteIndex}-${idx}`)?.scrollIntoView()
    }

    useEffect(() => {
        let confList = props.chartData.conf_list
        let getCharts = [] // 渲染的echarts图表
        for (let i = 0; i < confList.length; i++) {
            const temp : any = document.getElementById(`myChart-${props.idx}-${i}`)
            getCharts.push(echarts.init(temp)) 
            let seriesData:any = []  // echarts图表数据
            let xAxisData:any = [] // 图表x轴的展示
            let legData:any = []
            let len = 0 // 对比数据的长度
            let metricLen = 0 // metric长度
            let metricData:any = []  // 重组要展示的数据
            let result = [] // 组装后数组处理的容器
            let legHeight = 20
            let gridHeight = 70
            legData.push(`对比标识：${props.identify.base_group.tag}`)
            for (let compare = props.identify.compare_groups,k = 0; k < compare.length; k++) {
                legData.push(`对比标识：${compare[k].tag}`)
                if(compare.length > 2 && compare.length <= 5){
                    legHeight = 65
                    gridHeight = 100
                }else if(compare.length > 5 && compare.length <= 8){
                    legHeight = 105
                    gridHeight = 130
                }
            }
            for (let metric =confList[i].metric_list,j = 0; j < metric.length; j++) {
                metricData.push(metric[j].test_value)
                xAxisData.push(metric[j].metric)
                len = metric[j].compare_data.length
                metricLen = metric.length
            }  // metric 遍历
            for (let b = 0; b < len; b++) {
                confList[i].metric_list.map((metric:any)=>{
                    metric.compare_data.map((compare:any,idx:number)=>{
                        if(idx === b){
                            metricData.push(compare.test_value)
                        }
                    })
                })
            } // metric 对比数据 遍历
            for(let j=0,len=metricData.length;j<len;j += metricLen){
                result.push(metricData.slice(j,j + metricLen));
            } // 数据重组
            for (let m = 0; m < len + 1 ; m++) {
                seriesData.push({
                    type: 'bar',
                    data: result[m], 
                    name: legData[m],
                    barWidth:'10px',
                    barGap:'80%',
                    barCategoryGap:'40%'
                })
            } // 渲染数据展示
            getCharts[i].setOption({
                title:{
                    text:`Config${i + 1} (Metrics Num:${metricLen})`,
                    left:0,
                    top:legHeight,
                    textStyle:{
                        fontFamily: 'PingFangSC-Regular',
                        fontSize: 12,
                        color: 'rgba(0,0,0,0.85)',
                    },  
                },
                color: ['#FAD337','#4DCB73','#3BA0FF','#36CBCB'],
                grid:{   
                    left: '2%',
                    right: '2%',
                    top: gridHeight,
                    containLabel: true,
                    borderWidth:0,
                },
                tooltip: {
                    trigger:'item',
                    //position: 'right',
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
                        ${params.seriesName}
                        </div>
                        <div>Test Conf：${confList[i].conf_name}</div>
                        <div>${params.name}：${params.value}</div>`
                    }    
                },
                legend:{
                    data:legData,
                    //orient: 'vertical',
                    // top:40,
                    // bottom:20,
                    padding:[20,0,20,0],
                },
                xAxis: [
                    {
                        type: 'category',
                        // data: [ 'config1/more is better','config2/more is better','config3/more is better','config4/more is better','config5/more is better','config6/more is better' ].map((str:string) => {
                        //     return str.replace('/', '\n')
                        // }),
                        data: xAxisData,
                        //axisLabel: { interval: 0, rotate: 30 },
                        axisTick: {
                            alignWithLabel: true,
                            show:false,
                        },
                    }
                ],
                yAxis: [
                    {
                        show:true,
                        type: 'value',
                        axisLine:{
                           show:false 
                        },
                        axisTick:{
                           show:false   //刻度
                        },
                        splitLine:{
                            show:true,
                            lineStyle:{
                                type:'dashed'
                            }
                        }
                    }
                ],
                series: seriesData
            })
        }
    })
    const confLen = props.chartData?.conf_list
    return (
        <Spin spinning={loading}>
            {
                props.chartData == null ?
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                :
                <Row>
                <Col span={16} style={{ minHeight:320, height: confLen.length > 2 ? confLen.length * 30 + 50 : '100%' }} className={styles.test_chart}>
                    {
                        confLen.map((item:any,index:number)=>(
                            <div id={forId(props.idx,index)} style={{ width: '100%', height: 320 }}></div>
                        ))
                    }
                </Col>
                <Col span={8}>
                    <div className={styles.test_conf}>Test Conf({confLen.length})</div>
                    {
                        confLen.map((item: any, index: number) => (
                            <div 
                                className={styles.test_conf_detail} 
                                style={{ color: anchor == `${props.idx}-${index}` ? '#1890FF' : '#000'}}
                                onClick={() => handleScroll(props.idx,index)}
                            >
                                {`Config${index + 1} ：${item.conf_name}`}
                            </div>
                        ))
                    }
                </Col>
            </Row>
            }
        </Spin>
       
    )
}
export default RenderChart;