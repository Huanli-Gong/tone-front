import { renderProviderText, textTip, serverLinkTip, commitLinkTip } from '.'
function isRepeat(arr: any, num: any) {
    // return arr.toString().match(new RegExp( num , 'g')).length > 1
    let sum = 0
    for (let x = 0, len = arr.length; x < len; x++) {
        if (arr[x] === num) {
            sum++
            if (sum > 1) return true
        }
    }
    return false
}

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

const PerfLineOption: any = ({ dataSource, ws_id, provider, formatMessage }: any) => {
    const { result_data, baseline_data } = dataSource || {}
    let option = {}
    if (result_data && JSON.stringify(result_data) !== '{}') {
        const chartData: any = []
        let xAxis: any = []
        const legend: any = []
        const upSeries: any = []
        const downSeries: any = []

        const pointers = {}

        Object.keys(result_data).forEach((key) => {
            const metric = result_data[key]
            Object.keys(metric).forEach((d) => {
                const o = metric[d]
                if (o) {
                    const val = toFixed(+ o.value, 2) //parseInt(o.value) //
                    pointers[d] = pointers[d] ? [...pointers[d], val] : [val]
                }
            })
        })

        Object.keys(result_data).forEach((i: any) => {
            legend.push({
                name: i,
            })
            const defaultOpt = { type: 'line', smooth: true }
            const AreaOpt = {
                lineStyle: { opacity: 0 },
                tooltip: { show: false },
                symbol: "none",
            }

            const data: any = { ...defaultOpt, symbolSize: 8, connectNulls: false, name: i, z: 9999, opacity: 1 }

            const upArea: any = { ...defaultOpt, ...AreaOpt, name: "U", areaStyle: { color: '#ccc' }, }
            const downArea: any = { ...defaultOpt, ...AreaOpt, name: "D", areaStyle: { color: '#fff', opacity: 1 }, z: 100 }//

            const lineData: any = []
            const upAreaData: any = []
            const downAreaData: any = []

            Object.keys(result_data[i]).forEach((d: any) => {
                const item = result_data[i][d]
                xAxis.push(d)
                if (item) {
                    const val: any = toFixed(+ item.value, 2)
                    const column = { ...item, date: d, value: val }
                    if (item.note)
                        column.symbol = 'path://M873,435C877.4182739257812,435,881,438.58172607421875,881,443C881,447.41827392578125,877.4182739257812,451,873,451C868.5817260742188,451,865,447.41827392578125,865,443C865,438.58172607421875,868.5817260742188,435,873,435ZM873,436C869.134033203125,436,866,439.1340026855469,866,443C866,446.8659973144531,869.134033203125,450,873,450C876.865966796875,450,880,446.8659973144531,880,443C880,439.1340026855469,876.865966796875,436,873,436ZM873,439C875.2091674804688,439,877,440.7908630371094,877,443C877,445.2091369628906,875.2091674804688,447,873,447C870.7908325195312,447,869,445.2091369628906,869,443C869,440.7908630371094,870.7908325195312,439,873,439Z'

                    if (JSON.stringify(pointers) !== '{}' && isRepeat(pointers[d], val)) {
                        column.symbol = 'circle'
                        column.itemStyle = { color: '#000' }
                    }
                    lineData.push(column)

                    const cv = item.cv_value.replace('±', '').replace('%', '') * 100 / 100 / 100
                    const up = toFixed((1 + cv) * val, 2)
                    const down = toFixed((1 - cv) * val, 2)

                    upAreaData.push({
                        date: d, value: up,
                    })
                    downAreaData.push({
                        date: d, value: down,
                    })
                }
                else {
                    lineData.push({ date: d, value: null })
                    upAreaData.push({ date: d, value: null })
                    downAreaData.push({ date: d, value: null })
                }
            })
            upSeries.push({ ...upArea, data: upAreaData })
            downSeries.push({ ...downArea, data: downAreaData })
            chartData.push({ ...data, data: lineData })
        })

        xAxis = Array.from(new Set(xAxis))

        let baselineSerie: any = { type: 'line', name: formatMessage({ id: 'analysis.baseline.avg' }), itemStyle: { color: '#2FC25B' } }
        if (baseline_data.value) {
            legend.push({ name: formatMessage({ id: 'analysis.baseline.avg' }), icon: 'path://M802,720C802.5523071289062,720,803,720.4476928710938,803,721C803,721.5523071289062,802.5523071289062,722,802,722L798,722C797.4476928710938,722,797,721.5523071289062,797,721C797,720.4476928710938,797.4476928710938,720,798,720L802,720ZM810,720C810.5523071289062,720,811,720.4476928710938,811,721C811,721.5523071289062,810.5523071289062,722,810,722L806,722C805.4476928710938,722,805,721.5523071289062,805,721C805,720.4476928710938,805.4476928710938,720,806,720L810,720ZM818,720C818.5523071289062,720,819,720.4476928710938,819,721C819,721.5523071289062,818.5523071289062,722,818,722L814,722C813.4476928710938,722,813,721.5523071289062,813,721C813,720.4476928710938,813.4476928710938,720,814,720L818,720Z' })
            baselineSerie = {
                type: 'line', name: formatMessage({ id: 'analysis.baseline.avg' }), symbol: 'none', tooltip: { show: false },
                lineStyle: { width: 1, color: '#2FC25B', type: 'dashed' }, itemStyle: { color: '#2FC25B' },
                data: xAxis.map((i: any) => ({ date: i, value: toFixed(baseline_data.value, 2) })),
                z: 100
            }
        }

        option = {
            legend: {
                icon: "rect",
                itemHeight: 2,
                itemWidth: 10,
                data: legend,
                top: '5%',
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
                extraCssText: 'box-shadow: 0 2px 8px 0 rgba(0,0,0,0.15);border-radius: 2px;padding:12px;',
                formatter: function (params: any) {
                    const tips = params.reduce((pre: any, cur: any) => {
                        const item = cur.data || {}

                        if (!item.value) return pre
                        const element = (
                            `<div style="margin-right:10px">
                                ${cur.marker} ${cur.name} <br />
                                ${commitLinkTip('JobID', item.job_id, ws_id)}
                                ${textTip('commit', item.commit)}
                                ${textTip('Avg', item.value)}
                                ${textTip('CV', item.cv_value)}
                                ${textTip(formatMessage({ id: 'analysis.baseline.value' }), baseline_data.value && Number(baseline_data.value).toFixed(2))}
                                ${textTip(formatMessage({ id: 'analysis.baseline.cv' }), baseline_data.cv_value)}
                                ${textTip('commit', item.commit)}
                                ${serverLinkTip(params.seriesName)}
                                ${renderProviderText(params, provider)}
                                ${textTip(formatMessage({ id: 'analysis.table.column.note' }), item.note)}
                            </div>`
                                .trim()
                        )
                        return pre += `<div style="display:flex;">${element}</div>`
                    }, "")

                    if (tips.length === 0) return ""
                    return `<div style="display:flex;flex-direction:row;gap:8px;max-width:545px;flex-wrap:wrap;">${tips}<div>`
                },
            },
            grid: { left: '5%', right: 60, bottom: '10%', }, //left: 50, 
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
                splitLine: { show: false, lineStyle: { type: 'dashed' }, },
                axisPointer: {
                    z: 100
                },
                min: "dataMin",
                max: "dataMax",
                splitArea: {
                    areaStyle: ['#fff', '#fff']
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
                ...upSeries,
                ...downSeries,
                baselineSerie,
                ...chartData,
            ],
        }
    }

    return option
}

export default PerfLineOption