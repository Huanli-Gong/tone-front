/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-array-index-key */
import React,{ useMemo } from "react";
import { Typography, Spin } from 'antd';
import NoTypeChart from './TestDataChild/NoChartReview';
import TypeChart from './TestDataChild/TypeChart';

const RenderMetricChart: React.FC<any> = (props) => {
    const { current, handleChartColor, legend, envData, loading, chartMetric, chartType  } = props
    
    const data = useMemo(() => {
        return chartMetric &&
        <>
            {
                JSON.stringify(chartMetric.metric_dic) === '{}'
                ? <NoTypeChart chartType={chartType} data={['']} />
                : chartMetric.metric_dic && Object.keys(chartMetric.metric_dic).map((key: any, idx: number) => (
                    <div
                        key={idx}
                        id={`${key}-${idx}`}
                        style={{ width: '100%', overflow: 'hidden' }}
                    >
                        <div style={current === `${key}-${idx}` ? { background: 'rgba(59,160,255,0.05)' } : {}}>
                            <Typography.Title level={5} style={current === `${key}-${idx}` ? { color: '#1890FF' } : {}}>
                                {key}
                            </Typography.Title>
                        </div>
                        <Spin spinning={loading}>
                            <TypeChart
                                callBackColor={handleChartColor}
                                name={legend}
                                envData={envData}
                                chartType={chartType}
                                time={[idx]}
                                data={chartMetric.metric_dic[key]}
                            />
                        </Spin>
                    </div>
                ))
            }
        </>
    },[ current, legend, loading, chartMetric, chartType ])
    
    return data;

}
export default RenderMetricChart;