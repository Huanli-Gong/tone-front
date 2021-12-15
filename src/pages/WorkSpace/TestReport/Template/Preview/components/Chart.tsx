import React, { memo, useEffect, useRef, useState, useMemo } from 'react'
import { Row, Space, Typography } from 'antd'
import styled from 'styled-components'
import * as echarts from 'echarts'
import { ReactComponent as GaryBaseIcon } from '@/assets/svg/TestReport/GaryBase.svg'

const FullRow = styled(Row)`
    width:100%;
`

const Wrapper = styled(FullRow) <{ show?: boolean }>`
    ${({ show }) => !show ? 'display:none;' : null};
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

const ChartWrapper = styled.div<{ chartWidth?: string | number, show?: boolean }>`
    height: 376px;
    display: ${({ show }) => !show ? 'none' : 'inline-block'};
    flex-shrink: 0 ;
`

const TypeChart: React.FC<any> = memo(
    ({ data, chartType = 1, time, show = false, modal }) => {
        const chart = useRef<any>()
        const myChart = useRef<any>()

        useEffect(() => {
            if (modal) {
                // const duration = time.reduce((p: any, c: any, i: number) => parseInt(p += (c * Math.pow(2, i))), 0)
                const duration = time.reduce((p: any, c: any) => p += c * 2, 0)
                // console.log(duration)
                const rageMax: number = data.length > 4 ? parseInt((parseFloat((4 / data.length) as any) * 100) as any) : data.length
                const opt: any = {
                    animation: false,
                    title: { subtext: 'more is better' },
                    grid: { left: 40, right: 8 },
                    xAxis: {
                        data, axisTick: { show: false },
                        axisLabel: {
                            interval: 0, width: 110,
                            formatter: (value: string) => value.length > 16 ? value.substr(0, 16) + '...' : value
                        }
                    },
                    yAxis: {
                        type: 'value', axisLine: { show: false }, axisTick: { show: false },
                        splitLine: { show: true, lineStyle: { type: 'dashed' }, },
                        axisLabel: { showMinLabel: true, showMaxLabel: true, fontSize: 10, },
                        // boundaryGap: true,
                        min: 0, max: 5000
                    },
                }
                opt.dataZoom = [
                    chartType !== 1 &&
                    {
                        show: true, realtime: true, start: 0, end: rageMax,
                        left: '20%', height: 8, right: '20%',
                    },
                    {
                        type: 'inside', realtime: true, zoomOnMouseWheel: false,
                        start: 0, end: rageMax
                    }
                ].filter(Boolean);

                const timer = setTimeout(() => {
                    const chartObj = echarts.init(
                        chart.current, undefined,
                        {
                            renderer: 'svg', height: 376,
                            width: chartType === 1 ? 268 : modal?.clientWidth
                        }
                    )
                    chartObj.showLoading()
                    chartObj.setOption(opt as any)
                    chartObj.hideLoading()
                    myChart.current = chartObj
                }, duration)

                return () => {
                    timer && clearTimeout(timer)
                    myChart.current && myChart.current.dispose()
                }
            }
        }, [modal, time])

        return (
            <ChartWrapper
                ref={chart}
                style={{ width: chartType === 1 ? 268 : modal?.clientWidth }}
                show={show}
            />
        )
    },
    (prev, next) => prev.modal === next.modal
)

interface ConfRowProp {
    is_active: boolean
    show?: boolean
}

const ConfMetricRow = styled.div<ConfRowProp>`
    height:376px;
    width:100%;
    /* display: ${({ show }) => show ? 'flex' : 'none'}; */
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
    time?: any
    show?: boolean
    [k: string]: any
}

const ConfChart: React.FC<ConfChartProp> = (props) => {
    const { metric_list = [], is_active, chartType, time } = props
    return (
        <ConfMetricRow is_active={is_active}>
            <TypeChart
                {...props}
                data={metric_list}
                chartType={3}
                show={chartType === 3}
                time={time}
            />
            {
                metric_list.map(
                    (metric: string, idx: number) => (
                        <TypeChart
                            {...props}
                            chartType={1}
                            key={metric}
                            data={[metric]}
                            is_active={is_active}
                            show={chartType === 1}
                            time={time.concat(idx)}
                        />
                    )
                )
            }
            {
                metric_list.length === 0 &&
                <TypeChart
                    {...props}
                    chartType={1}
                    data={['']}
                    show={chartType === 1}
                    is_active={is_active}
                    time={time}
                />
            }
        </ConfMetricRow>
    )
}

interface JumpChartProp {
    test_conf_name: string
    test_conf_id?: number
}

const ModalItem = styled.div<{ show?: boolean }>`
    width: 100%;
    overflow: hidden ;
    ${({ show }) => !show ? 'display:none;' : ''}
`

const LevelTitle = styled(Typography.Title)``

const ModalItemTitle = styled.div<{ isActive: boolean }>`
    ${({ isActive }) => isActive ? 'background:rgba(59,160,255,0.05)' : ''}
    ${LevelTitle} {
        ${({ isActive }) => isActive ? 'color:#1890FF' : ''}
    }
`

const ChartModal: React.FC<any> = (props: any) => {
    const { case_source, chartType, suite_show_name, time, show } = props

    const [current, setCurrent] = useState<any>(null)

    const handleJumpChart = ({ test_conf_name }: JumpChartProp, idx: number) => {
        const id = `${test_conf_name}-${idx}`
        setCurrent(id)
        document.getElementById(id)?.scrollIntoView()
    }

    const caseLen = case_source.length
    const modalContent = useRef<HTMLDivElement>(null)

    return (
        <Wrapper show={show}>
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
            <ModalBody>
                {
                    chartType === 2 &&
                    <FullRow>
                        <Typography.Title level={5} >{suite_show_name}</Typography.Title>
                    </FullRow>
                }
                <ModalSlider>
                    <Space direction="vertical">
                        <SliderTitle>
                            Test Conf列表({caseLen})
                        </SliderTitle>
                        {
                            case_source.map(
                                (conf: any, idx: number) => (
                                    chartType === 2 ?
                                        <span key={idx} >
                                            <ConfName>{conf.test_conf_name}</ConfName>
                                        </span> :
                                        <span
                                            onClick={() => handleJumpChart(conf, idx)}
                                            key={idx}
                                        >
                                            <ConfName
                                                is_active={current === `${conf.test_conf_name}-${idx}` ? 1 : 0}
                                            >
                                                {conf.test_conf_name}
                                            </ConfName>
                                        </span>
                                )
                            )
                        }
                    </Space>
                </ModalSlider>
                <ModalContent ref={modalContent}>
                    <TypeChart
                        data={case_source.map((i: any) => i.test_conf_name)}
                        chartType={2}
                        show={chartType === 2}
                        time={time}
                        modal={modalContent.current}
                    />
                    {
                        case_source.map(
                            (conf: any, idx: number) => {
                                const rowId = `${conf.test_conf_name}-${idx}`
                                const isActive = current === rowId
                                return (
                                    <ModalItem
                                        key={idx}
                                        id={rowId}
                                        show={chartType !== 2}
                                    >
                                        <ModalItemTitle isActive={isActive}>
                                            <LevelTitle level={5} >{conf.test_conf_name}</LevelTitle>
                                        </ModalItemTitle>
                                        <ConfChart
                                            {...conf}
                                            chartType={chartType}
                                            is_active={isActive}
                                            modal={modalContent.current}
                                            time={time.concat(idx)}
                                        />
                                    </ModalItem>
                                )
                            }
                        )
                    }
                </ModalContent>
            </ModalBody>
        </Wrapper>
    )
}

export default ChartModal