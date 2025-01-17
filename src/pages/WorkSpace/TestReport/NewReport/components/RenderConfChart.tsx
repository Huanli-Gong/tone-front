/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-key */
import React, { useMemo } from "react";
import { Typography } from 'antd';
import NoTypeChart from './TestDataChild/NoChartReview';
import TypeChart from './TestDataChild/TypeChart';
import styled from 'styled-components';
interface ConfRowProp {
    is_active: boolean
}
const ConfMetricRow = styled.div<ConfRowProp>`
    height:340px;
    width:100%;
    display: flex;
    overflow-x:scroll;
    overflow-y:hidden;
    flex-wrap: nowrap;
    flex-shrink: 0;
    background: ${({ is_active }) => is_active ? 'rgba(59,160,255,0.05)' : ''};
    margin-bottom:10px;
    &::-webkit-scrollbar { 
        /* 隐藏默认的滚动条 */
        -webkit-appearance: none;
    }
    &::-webkit-scrollbar:horizontal{
        /* 设置水平滚动条厚度 */
        height: 8px;
    }
    &::-webkit-scrollbar-thumb { 
        border-radius: 3px; 
        // border: 2px solid rgba(255,255,255,.4); 
        background-color: rgba(0, 0, 0, .5);
    }
`

const ConfChart = (props: any) => {
    const { callBackColor, legend, envData, chartData, time, is_active, chartType } = props
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
                    style={{ width: '100%' }}
                >
                    <div style={current === `${conf.conf_name}-${idx}` ? { background: 'rgba(59,160,255,0.05)' } : {}}>
                        <Typography.Title level={5} style={current === `${conf.conf_name}-${idx}` ? { color: '#1890FF' } : {}}>
                            {conf.conf_name}
                        </Typography.Title>
                    </div>
                    {
                        <ConfChart
                            key={conf?.conf_name}
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
    }, [current, legend, loading, chartConf, chartType])
    return data;
}
export default RenderConfChart;