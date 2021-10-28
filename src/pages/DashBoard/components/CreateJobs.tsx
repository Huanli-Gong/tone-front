import React, { useEffect, useRef } from 'react'
import { queryChartData } from '../services';
import { message } from 'antd'
import * as antv from '@antv/g2';
import { Container, Title } from './styled'

import { gblen , gblenStr, requestCodeMessage } from '@/utils/utils'
const { Chart } = antv
const CreateJobs = (props: any) => {
    const myChart: any = useRef()
    const DEFAULT_CHART_TYPE = 'ws_create_job'

    const getChartData = async () => {
        const { data, code, msg } = await queryChartData({ chart_type: DEFAULT_CHART_TYPE })
        if (code !== 200) return requestCodeMessage( code , msg )

        const chart = new Chart({
            container: myChart.current,
            autoFit: true,
        });
        chart.data(data);
        chart.coordinate()
        chart.interval().position('show_name*count').size(18);
        chart.scale('show_name', {
            nice: true,
            type : 'cat'
        });
        chart.axis('show_name', {
            label: {
                autoRotate: true,
                formatter: (text) => gblen(text) > 11 ? `${gblenStr(text, 11)}` : text
            },
        })
        chart.option('scrollbar', {
            // 滚动条类型： 'horizontal' / 'vertical'
            type: 'horizontal',
        });
        chart.tooltip({
            showMarkers: false
        });
        chart.interaction('active-region');
        chart.render();
    }

    useEffect(() => {
        getChartData()
    }, [])

    return (
        <Container >
            <Title >WorkSpaces创建Job数</Title>
            <div style={{ height: 'calc(100% - 25px - 8px)' }} ref={myChart} />
        </Container>
    )
}

export default CreateJobs