import { textTip, commitLinkTip } from './'

const passRateLineOption: any = (dataSource: any, ws_id: any, formatMessage: any) => {
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
            name: formatMessage({ id: 'analysis.TestConf.pass_rate' }),
            symbol: 'circle',
            showAllSymbol: true,
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
                    ${commitLinkTip('JobID', item.job_id, ws_id)}
                    ${textTip('commit', item.commit)}
                    ${formatMessage({ id: 'analysis.pass_rate' })}: ${Number(item.pass_rate).toFixed(2)}%<br />
                    ${textTip(formatMessage({ id: 'analysis.table.total' }), item.all_case)}
                    ${textTip(formatMessage({ id: 'analysis.pass_num' }), item.pass_case)}
                    ${textTip(formatMessage({ id: 'analysis.table.column.note' }), item.note)}
                </div>`
            }
        }
    }
}

export default passRateLineOption