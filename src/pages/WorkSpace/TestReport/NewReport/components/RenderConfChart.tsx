import React, { useMemo } from "react";
import { Typography, Spin } from 'antd';
import NoTypeChart from './TestDataChild/NoChartReview';
import TypeChart from './TestDataChild/TypeChart';
import styled from 'styled-components';
interface ConfRowProp {
    is_active: boolean
}
const ConfMetricRow = styled.div<ConfRowProp>`
    height:376px;
    width:100%;
    display: flex;
    overflow-x:auto;
    overflow-y:hidden;
    flex-wrap: nowrap;
    flex-shrink: 0;
    background: ${({ is_active }) => is_active ? 'rgba(59,160,255,0.05)' : ''};
`
const ConfChart = (props: any) => {
    const { callBackColor, legend, envData, loading, chartData, time, is_active, chartType } = props
    if (chartType === '1') {
        return (
            <ConfMetricRow is_active={is_active}>
                {
                    chartData.metric_list.length === 0 ?
                        <NoTypeChart chartType={chartType} data={['']} is_active={is_active} />
                        :
                        chartData.metric_list.map((metric: any, idx: any) => (
                            <TypeChart
                                callBackColor={callBackColor}
                                name={legend}
                                envData={envData}
                                chartType={chartType}
                                time={time.concat(idx)}
                                data={metric}
                            />
                        ))
                }
            </ConfMetricRow>
        )
    } else {
        return (
            <ConfMetricRow is_active={is_active}>
                {
                    JSON.stringify(chartData) === '{}' ?
                        <NoTypeChart chartType={chartType} data={['']} is_active={is_active} />
                        :
                        <TypeChart
                            callBackColor={callBackColor}
                            name={legend}
                            envData={envData}
                            chartType={chartType}
                            time={time}
                            data={chartData}
                        />
                }
            </ConfMetricRow>
        )
    }
}
const RenderConfChart: React.FC<any> = (props) => {
    const { current, handleChartColor, legend, envData, loading, chartConf, chartType } = props
    const data = useMemo(() => {
        return chartConf && chartConf.map(
            (conf: any, idx: number) => (
                <div
                    key={idx}
                    id={`${conf.conf_name}-${idx}`}
                    style={{ width: '100%', overflow: 'hidden' }}
                >
                    <div style={current === `${conf.conf_name}-${idx}` ? { background: 'rgba(59,160,255,0.05)' } : {}}>
                        <Typography.Title level={5} style={current === `${conf.conf_name}-${idx}` ? { color: '#1890FF' } : {}}>
                            {conf.conf_name}
                        </Typography.Title>
                    </div>
                    {
                        <ConfChart
                            callBackColor={handleChartColor}
                            legend={legend}
                            envData={envData}
                            loading={loading}
                            chartData={conf}
                            time={[idx]}
                            is_active={current === `${conf.conf_name}-${idx}`}
                            chartType={chartType}
                        />
                    }
                </div>
            )
        )
    },[ current, legend, loading, chartConf, chartType ])
    return data;
}
export default RenderConfChart;