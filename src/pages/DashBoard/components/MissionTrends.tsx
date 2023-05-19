/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import { queryChartData } from '../services';
import { DatePicker, Row } from 'antd'
import { FormattedMessage } from 'umi'
import { Container, Title } from './styled'
import * as antv from '@antv/g2';
import moment from 'moment'
import { requestCodeMessage } from '@/utils/utils';
const { Chart } = antv
const switchName = (name: string) => {
    switch (name) {
        case 'sub_case': return 'TestCase'
        case 'metric': return 'Metric'
        case 'test_conf': return 'TestConf'
        case 'job': return 'Job'
        default: return ''
    }
}

const MissionTrends = () => {
    const myChart: any = useRef(null)
    const chartRef: any = useRef(null)

    const DEFAULT_CHART_TYPE = 'task_execute_trend'
    const DATE_FORMMATER = 'YYYY-MM-DD'

    const [timer, setTimer] = useState<any>([moment().add(-1, 'months'), moment()])

    const handleTimerChange = (date: any) => {
        setTimer(date)
    }

    const getChartData = async () => {
        const start_time = moment(timer[0]).format(DATE_FORMMATER)
        const end_time = moment(timer[1]).format(DATE_FORMMATER)
        const { data, code, msg } = await queryChartData({ chart_type: DEFAULT_CHART_TYPE, start_time, end_time })
        if (code !== 200) return requestCodeMessage(code, msg)

        const result = data.reduce((pre: any, cur: any) => {
            return pre.concat(
                Object.keys(cur).reduce((p: any, c: any) => {
                    const { date } = cur
                    if (c !== 'date') {
                        return p.concat({ date, name: switchName(c), count: cur[c] })
                    }
                    return p
                }, [])
            )
        }, [])

        if (chartRef.current) return chartRef.current.changeData(result)
        const chart = new Chart({
            container: myChart.current,
            autoFit: true,
        });
        chart.data(result);

        chart.scale({
            count: {
                nice: true,
            }
        });
        chart.axis('date', {
            tickLine: {
                alignTick: true
            }
        })

        chart.legend({
            position: 'top-right',
        });
        chart.tooltip({
            showCrosshairs: true,
            shared: true,
        });
        chart
            .line()
            .position('date*count')
            .color('name')
            .shape('smooth');

        // chart
        //     .point()
        //     .position('date*count')
        //     .color('name')
        //     .shape('circle')
        //     .style({
        //         stroke: '#fff',
        //         lineWidth: 1,
        //     });
        chart.option('scrollbar', { type: 'horizontal' });
        chart.render();
        chartRef.current = chart
    }

    useEffect(() => {
        getChartData()
    }, [timer])

    return (
        <Container >
            <Title >
                <Row justify="space-between">
                    <span><FormattedMessage id="sys.dashboard.trend.chart" /></span>
                    <DatePicker.RangePicker
                        value={timer}
                        onChange={handleTimerChange}
                        format={DATE_FORMMATER}
                        allowClear={false}
                    />
                </Row>
            </Title>
            <div style={{ height: 'calc(100% - 25px - 8px)' }} ref={myChart} />
        </Container>
    )
}

export default MissionTrends