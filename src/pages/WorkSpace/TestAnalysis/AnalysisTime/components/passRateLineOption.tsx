import { textTip } from './'

const passRateLineOption : any = ( dataSource : any , ws_id : any ) => {
    const source = Object.keys(dataSource).map(key => {
        if (dataSource[key]) {
            return {
                ...dataSource[key],
                date: key,
                pass_rate: Number(dataSource[key].pass_rate * 100),
            }
        }
        return {
            date: key,
            pass_rate: null
        }
    })

    return {
        dataset: [{ source }],
        xAxis: {
            type: 'category',
            splitLine: { show: false }
        },
        legend: {
            icon: 'line',
            itemHeight: 2,
            itemWidth: 10,
            top: '5%'
        },
        grid: {
            left: '5%',
            right: 60,
            bottom: '10%',
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                show: true,
                formatter: '{value} %',
                showMaxLabel: true,
            },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: {
                show: true,
                lineStyle: { type: 'dashed' },
            }
        },
        series: [{
            type: 'line',
            name: 'TestConf成功率',
            symbol: 'circle',
            encode: {
                x: 'date',
                y: 'pass_rate'
            },
            smooth: true,
            symbolSize: 8,
            itemStyle: {
                color: '#2FC25B',
            }
        }],
        tooltip: {
            trigger: 'item',
            axisPointer: {
                snap: true,
                type: 'cross',
            },
            backgroundColor: '#fff',
            borderColor: "#fff",
            textStyle: {
                color: 'rgba(0,0,0,0.65)',
                fontSize: 14,
            },
            enterable: true,
            extraCssText: 'box-shadow: 0 2px 8px 0 rgba(0,0,0,0.15);border-radius: 2px;padding:12px;',
            formatter: (params: any) => {
                const item = params.data
                return `<div>
                    ${params.marker} ${item.start_time} <br />
                    ${textTip('JobID' , item.job_id)}
                    ${textTip('commit' , item.commit)}
                    通过率: ${Number(item.pass_rate).toFixed(2)}%<br />
                    ${textTip('总数' , item.all_case)}
                    ${textTip('通过数' , item.pass_case)}
                    ${textTip('标注' , item.note)}
                </div>`
            }
        }
    }
}

export default passRateLineOption