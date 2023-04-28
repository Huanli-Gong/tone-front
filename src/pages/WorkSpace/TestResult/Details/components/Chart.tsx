/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { getLocale, useIntl } from 'umi'
import { matchTestType } from '@/utils/utils'

export default ({ data = {}, test_type = '' }: any) => {
    const { formatMessage } = useIntl()
    const switchState = (state: string, testType: string) => {
        if (state === 'increase') return { color: '#81BF84', name: formatMessage({ id: `ws.result.details.${state}` }), legend: '#389E0D' }
        if (state === 'decline') return { color: '#C84C5A', name: formatMessage({ id: `ws.result.details.${state}` }), legend: '#C84C5A' }
        if (state === 'normal') return { color: '#6A737D', name: formatMessage({ id: `ws.result.details.${state}` }), legend: '#000000' }
        if (state === 'invalid') return { color: '#6A737D', name: formatMessage({ id: `ws.result.details.${state}` }), legend: '#000000' }
        if (state === 'na') return { color: '#6A737D', name: formatMessage({ id: `ws.result.details.${state}` }), legend: '#000000' }

        if (state === 'success') return { color: '#81BF84', name: testType === 'business_business' ? formatMessage({ id: `ws.result.details.business.${state}` }) : formatMessage({ id: `ws.result.details.${state}` }), legend: '#389E0D' }
        if (state === 'fail') return { color: '#C84C5A', name: formatMessage({ id: `ws.result.details.${state}` }), legend: '#C84C5A' }
        if (state === 'warn') return { color: '#DCC506', name: formatMessage({ id: `ws.result.details.${state}` }), legend: '#DCC506' }
        if (state === 'skip') return { color: '#6A737D', name: formatMessage({ id: `ws.result.details.${state}` }), legend: '#000000' }
        return
    }

    const chart: any = useRef(null)
    const testType = matchTestType(test_type)
    // 用于语言国际化时时检测
    const [localeState, setLocaleState] = useState<any>('')
    useEffect(() => {
        const timer = setInterval(() => {
            const str = getLocale()
            if (str !== localeState) setLocaleState(str)
        }, 200)
        return () => {
            timer && clearInterval(timer)
        }
    }, [])

    useEffect(() => {
        if (JSON.stringify(data) === '{}') return
        // console.log('data:', data)
        const { count, ...datas } = data;
        const statisticalKeyList = testType === 'business_business' ? ['success', 'fail'] : Object.keys(datas);
        const dataSource = statisticalKeyList.map(
            key => ({
                value: data[key],
                key,
                ...switchState(key, testType)
            })
        )

        const mychart = echarts.init(chart.current)

        const rich = {}
        dataSource.forEach(({ legend, key }: any) => {
            rich[key] = { color: legend }
        })
        mychart.setOption({
            color: dataSource.map(({ color }: any) => color),
            legend: {
                selectedMode: false,
                show: true,
                bottom: 0,
                formatter: function (name) {
                    const idx = dataSource.findIndex((i: any) => name === i.name)
                    const item = dataSource[idx]
                    return `{${item.key}|${name}(${item.value})}`;
                },
                textStyle: {
                    rich
                },
                data: dataSource.map(({ color, name }: any) => ({ name, textStyle: color })),
                itemWidth: 0,
                itemHeight: 0,
            },
            tooltip: {
                show: false,
            },
            series: [{
                type: 'pie',
                radius: ['60%', '80%'],
                avoidLabelOverlap: false,
                data: dataSource,
                hoverOffset: 1,
                height: '90%',
                label: {
                    show: true,
                    position: 'center',
                    color: '#4c4a4a',
                    formatter: '{total|' + count + '}' + '\n\r' + '{active|All cases}',
                    rich: {
                        total: {
                            fontSize: 30,
                            fontFamily: "微软雅黑",
                            color: '#000000'
                        },
                        active: {
                            fontFamily: "微软雅黑",
                            fontSize: 12,
                            color: 'rgba(0,0,0,.65)',
                            // lineHeight:30,
                        },
                    },
                },
                emphasis: {//中间文字显示
                    label: {
                        show: true,
                    }
                }
            }],
        })

        return () => {
            mychart?.dispose()
        }
    }, [data, chart, localeState])

    return (
        <div style={{ width: 'calc(100% - 0px)' }}
        >
            <div ref={chart} style={{ height: 170 }}
            // style={{ width: '100%', height : 170, transform: `translateY(${plan ? '7%' : '0'})` }}
            />
        </div>
    )
}