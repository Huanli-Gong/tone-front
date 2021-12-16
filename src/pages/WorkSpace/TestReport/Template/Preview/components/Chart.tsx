import React, { memo, useEffect, useRef, useState } from 'react'
import { Row, Space, Typography, Empty, Col } from 'antd'
import styled from 'styled-components'
import * as echarts from 'echarts'
import { ReactComponent as GaryBaseIcon } from '@/assets/svg/TestReport/GaryBase.svg'

const FullRow = styled(Row)`width:100%;`

const Wrapper = styled(FullRow)`
    margin-top:20px;
`

const ModalHeader = styled(FullRow)`
    background:rgba(0,0,0,.02);
    height:40px;
    align-items:center;
    padding:0 20px;
`
interface DotProp {
    color: String
}

const Dot = styled.div<DotProp>`
    width:8px;height:8px;
    display:inline-block;
    background:${({ color }) => color};
`

const ModalBody = styled(FullRow)`
    padding:20px 16px;
    background:#fff;
`

const ModalSlider = styled.div`
    height:100%;
    overflow-y:auto;
    overflow-x:hidden;
    width:340px;
    min-height:367px;
`

const SliderTitle = styled(Typography.Text)`
    color:rgba(0,0,0,.65);
`
interface ConfNameProp {
    is_active?: number
}
const ConfName = styled(Typography.Text) <ConfNameProp>`
    cursor:pointer;
    ${({ is_active }) => is_active && 'color:#1890FF;'}
`

const ModalContent = styled.div`
    width:calc( 100% - 340px );
    .ant-typography { margin-bottom:0;}
`

const TypeChart: React.FC<any> = ({ data, chartType }) => {
    const chart = useRef<any>()

    useEffect(() => {
        const rageMax: number = data.length > 4 ? parseInt(parseFloat(4 / data.length) * 100) : data.length
        const myChart = echarts.init(chart.current)
        myChart.clear()
        myChart.setOption({
            title: {
                subtext: 'more is better'
            },
            grid: {
                left: 40,
                right: 8
            },
            animation: false,
            xAxis: {
                data,
                axisTick: { show: false },
                axisLabel: {
                    interval: 0,
                    width: 110,
                    formatter: (value: string) => {
                        return value.length > 16 ? value.substr(0, 16) + '...' : value
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: true, lineStyle: { type: 'dashed' }, },
                axisLabel: {
                    showMinLabel: true,
                    showMaxLabel: true,
                    fontSize: 10,
                },
                boundaryGap: true,
                min: 0,
                max: 5000
            },
            dataZoom: [{
                show: chartType !== '1',
                realtime: true,
                start: 0,
                end: rageMax,
                left: '20%',
                height: 8,
                right: '20%',
            },
            {
                type: 'inside',
                realtime: true,
                zoomOnMouseWheel: false,
                start: 0,
                end: rageMax
            }],
        })
    }, [chartType])

    return (
        <div ref={chart} style={{ width: chartType !== '1' ? '100%' : 268, height: 376, display: 'inline-block', flexShrink: 0 }} />
    )
}

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

interface ConfChartProp {
    metric_list: Array<string>
    is_active: boolean
    chartType: string | number
    test_conf_name?: string
}

const ConfChart: React.FC<ConfChartProp> = ({ metric_list = [], is_active, chartType }) => {
    if (chartType === '1')
        return (
            <ConfMetricRow is_active={is_active}>
                {
                    metric_list.map(
                        (metric: string) => (
                            <TypeChart chartType={chartType} key={metric} data={[metric]} is_active={is_active} />
                        )
                    )
                }
                {
                    metric_list.length === 0 &&
                    <TypeChart chartType={chartType} data={['']} is_active={is_active} />
                }
            </ConfMetricRow>
        )

    if (chartType === '3')
        return (
            <ConfMetricRow is_active={is_active}>
                <TypeChart data={metric_list} chartType={chartType} />
            </ConfMetricRow>
        )

    return (
        <></>
    )
}

interface JumpChartProp {
    test_conf_name: string
    test_conf_id?: number
}

const ChartModal = (props: any) => {
    const { case_source, chartType, suite_show_name } = props

    const [current, setCurrent] = useState<any>(null)

    const handleJumpChart = ({ test_conf_name }: JumpChartProp, idx: number) => {
        const id = `${test_conf_name}-${idx}`
        setCurrent(id)
        document.getElementById(id)?.scrollIntoView()
    }

    return (
        <Wrapper>
            <ModalHeader>
                <Space>
                    <Typography.Text strong>对比组图例</Typography.Text>
                    <Space size={28}>
                        <Space align="center">
                            <Dot color="#3BA0FF" />
                            <GaryBaseIcon style={{ transform: 'translateY(3px)', marginLeft: 8 }} />
                            <Typography.Text strong>基准组</Typography.Text>
                        </Space>
                        <Space align="center">
                            <Dot color="#36CBCB" />
                            <Typography.Text strong>对比组1</Typography.Text>
                        </Space>
                        <Space align="center">
                            <Dot color="#36CBCB" />
                            <Typography.Text strong>对比组2</Typography.Text>
                        </Space>
                    </Space>
                </Space>
            </ModalHeader>
            {
                chartType === '2' ?
                    <ModalBody>
                        <FullRow >
                            <Typography.Title level={5} >{suite_show_name}</Typography.Title>
                        </FullRow>
                        <ModalSlider>
                            <Space direction="vertical">
                                <SliderTitle>
                                    Test Conf列表({case_source.length})
                                </SliderTitle>
                                {
                                    case_source.map(
                                        (conf: any, idx: number) => (
                                            <span
                                                key={idx}
                                            >
                                                <ConfName>{conf.test_conf_name}</ConfName>
                                            </span>
                                        )
                                    )
                                }
                            </Space>
                        </ModalSlider>
                        <ModalContent>
                            <TypeChart data={case_source.map((i: any) => i.test_conf_name)} chartType={chartType} />
                        </ModalContent>
                    </ModalBody> :
                    <ModalBody>
                        <ModalSlider>
                            <Space direction="vertical">
                                <SliderTitle>
                                    Test Conf列表({case_source.length})
                                </SliderTitle>
                                {
                                    case_source.map((conf: any, idx: any) => (
                                        <span
                                            onClick={() => handleJumpChart(conf, idx)}
                                            key={idx}
                                        >
                                            <ConfName is_active={current === `${conf.test_conf_name}-${idx}` ? 1 : 0}>{conf.test_conf_name}</ConfName>
                                        </span>
                                    ))
                                }
                            </Space>
                        </ModalSlider>
                        <ModalContent>
                            {
                                case_source.map(
                                    (conf: any, idx: number) => (
                                        <div
                                            key={idx}
                                            id={`${conf.test_conf_name}-${idx}`}
                                            style={{ width: '100%', overflow: 'hidden' }}
                                        >
                                            <div style={current === `${conf.test_conf_name}-${idx}` ? { background: 'rgba(59,160,255,0.05)' } : {}}>
                                                <Typography.Title level={5} style={current === `${conf.test_conf_name}-${idx}` ? { color: '#1890FF' } : {}}>{conf.test_conf_name}</Typography.Title>
                                            </div>
                                            <ConfChart chartType={chartType} {...conf} is_active={current === `${conf.test_conf_name}-${idx}` ? 1 : 0} />
                                        </div>
                                    )
                                )
                            }
                        </ModalContent>
                    </ModalBody>
            }
        </Wrapper >
    )
}

export default memo(ChartModal)