import React, { useEffect, useRef } from 'react'
import { queryChartData } from '../services';
import { message } from 'antd'
import { Container , Title } from './styled'
import * as antv from '@antv/g2';
import { gblen , gblenStr, requestCodeMessage } from '@/utils/utils'

const { Chart } = antv
const ClassUsers = (props: any) => {
    const myChart: any = useRef()
    const DEFAULT_CHART_TYPE = 'department_user'

    const getChartData = async () => {
        const { data, code, msg } = await queryChartData({ chart_type: DEFAULT_CHART_TYPE })
        if (code !== 200) return requestCodeMessage( code , msg )
        
        const chart = new Chart({
            container: myChart.current,
            autoFit: true,
        });
        
        chart.data(data);
        chart.interval().position('department*count').size(18);
        chart.scale('department', {
            nice: true,
            type:'cat'
        });
        chart.axis('department', {
            label: {
                formatter : ( text , item , index ) => {
                    return gblen(text) > 6 ? `${gblenStr(text, 6)}...` : text
                }
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
            <Title >部门用户数</Title>
            <div style={{ height : 'calc(100% - 25px - 8px)'}} ref={myChart} />
        </Container>
    )
}

export default ClassUsers