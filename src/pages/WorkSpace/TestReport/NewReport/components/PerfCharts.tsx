import React, { memo, useEffect, useState, useMemo } from 'react'
import { Row, Space, Typography, Spin, Tooltip } from 'antd'
import styled from 'styled-components'
import { ReactComponent as GaryBaseIcon } from '@/assets/svg/Report/BaseIcon.svg';
import TypeChart from '../components/TestDataChild/TypeChart';
import NoTypeChart from '../components/TestDataChild/noTypeChart';
import { compareChart } from '../../services';
const FullRow = styled(Row)`
    width:100%;
`

const Wrapper = styled(FullRow)`
    margin-top:20px;
    border: 1px solid rgba(0,0,0,0.1);
`

const ModalHeader = styled(FullRow)`
    background:rgba(0,0,0,.02);
    min-height:40px;
    align-items:center;
    padding:0 20px;
    // overflow-x: scroll;
    // white-space: nowrap;
    word-break: break-all;
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
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color:rgba(0,0,0,.65);
`
interface ConfNameProp {
    is_active?: number
}
const ConfName = styled(Typography.Text) <ConfNameProp>`
    cursor:pointer;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color:rgba(0,0,0,.85);
    ${({ is_active }) => is_active && 'color:#1890FF;'}
`

const ModalContent = styled.div`
    width:calc( 100% - 340px );
    .ant-typography { margin-bottom:0;}
`



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
    setLegend?: Function,
    legend?: string,
    envData?: any,
    loading: boolean,
    chartData: any,
    is_active: boolean
    chartType: string | number
    conf_name?: string,
}

const ConfChart = (props: any) => {
    const { callBackColor, legend, envData, loading, chartData, is_active, chartType } = props
    if (chartType === '1') {
        return (
            <ConfMetricRow is_active={is_active}>
                {
                    chartData.metric_list.length === 0 ?
                        <NoTypeChart chartType={chartType} data={['']} is_active={is_active} />
                        :
                        chartData.metric_list.map((metric: any, idx: any) => (
                            <Spin spinning={loading}>
                                <TypeChart
                                    callBackColor={callBackColor}
                                    name={legend}
                                    envData={envData}
                                    chartType={chartType}
                                    data={metric}
                                    is_active={is_active} />
                            </Spin>
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
                            data={chartData}
                            is_active={is_active} />
                }
            </ConfMetricRow>
        )
    }
}

interface JumpChartProp {
    conf_name: string
    test_conf_id?: number
}

const ChartModal = (props: any) => {
    const { conf_list, suite_id, suite_name, chartType, envData } = props
    const [legend, setLegend] = useState<string>('')
    const [current, setCurrent] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [chartConf, setChartConf] = useState<any>(null)
    const [chartMetric, setChartMetric] = useState<any>(null)
    const [color, setColor] = useState<any>([])
    const queryChart = async (newObj: any) => {
        setLoading(true)
        const res = await compareChart(newObj)
        if (res.code === 200) {
            setLoading(false)
            if (chartType === '1' || chartType === '3') 
                setChartConf(res.data)
            else
                setChartMetric(res.data)
        }
    }
    useEffect(() => {
        let obj: any = {}
        obj.show_type = 1
        obj.base_suite_obj = {
            suite_id,
            suite_name,
            conf_dic: {}
        },
        conf_list?.map((conf: any, index: number) => {
            obj.base_suite_obj.conf_dic[conf.conf_id] = {
                conf_name: conf.conf_name,
                is_job: conf.is_job || conf.conf_source.is_job,
                obj_id: conf.obj_id || conf.conf_source.obj_id,
                compare_objs: conf.conf_compare_data || conf.compare_conf_list
            }
        })
        if(chartType === '2'){
            obj.show_type = 2
        }
        queryChart(obj)
    }, [ chartType ])

    const handleJumpChart = ({ conf_name }: JumpChartProp, idx: number) => {
        const id = `${conf_name}-${idx}`
        setCurrent(id)
        document.getElementById(id)?.scrollIntoView()
    }
    const handleToggle = (name: any) => {
        setLegend(name)
        setTimeout(() => {
            setLegend('')
        }, 100)
    }
    const handleChartColor = (arr: any) => {
        setColor(arr)
    }
    const legData = useMemo(() => {
        // let color = ['#FAD337', '#4DCB73', '#3BA0FF', '#36CBCB']
        let le: any = []
        le.push({
            name: `${envData?.base_group.tag}`,
            inner: <Space align="start" style={{ cursor: 'pointer' }}>
                <Dot color={color[0]} />
                { !!envData.compare_groups.length && 
                    <Tooltip title="基准组">
                        <GaryBaseIcon style={{ transform: 'translateY(3px)', marginLeft: 8 }} /> 
                    </Tooltip>
                }
                <Typography.Text strong>{envData?.base_group.tag}</Typography.Text>
            </Space>
        })

        for (let compare = envData.compare_groups, k = 0; k < compare.length; k++) {
            // if (compare.length > 3) color.push('#FAD337', '#4DCB73', '#3BA0FF', '#36CBCB')
            le.push({
                name: `${compare[k].tag}`,
                inner: <Space align="start" style={{ cursor: 'pointer' }}>
                    <Dot color={color[k + 1]} />
                    <Typography.Text strong>{compare[k].tag}</Typography.Text>
                </Space>

            })
        }
        return le
    }, [envData, color])
    return (
        <Wrapper>
            <ModalHeader>
                <Space align="start">
                    <Space style={{ whiteSpace: 'nowrap' }} >
                        <Typography.Text strong>对比组图例</Typography.Text>
                    </Space>
                    {
                        legData.map((i: any, idx: number) =>
                            <Space size={28} style={{ marginRight: 16 }} key={idx}>
                                <span onClick={() => handleToggle(i.name)}>{i.inner}</span>
                            </Space>
                        )
                    }
                </Space>
            </ModalHeader>
            {
                chartType === '2' ?
                    <ModalBody>
                        <ModalSlider>
                            <Space direction="vertical">
                                <SliderTitle>
                                    Test Conf列表({conf_list.length})
                                </SliderTitle>
                                {
                                    conf_list.map(
                                        (conf: any, idx: number) => (
                                            <span key={idx}>
                                                <ConfName>{conf.conf_name}</ConfName>
                                            </span>
                                        )
                                    )
                                }
                            </Space>
                        </ModalSlider>
                        <ModalContent>
                            {
                                chartMetric &&
                                <>
                                    {
                                        JSON.stringify(chartMetric.metric_dic) === '{}'
                                        ? <NoTypeChart chartType={chartType} data={['']} />
                                        : Object.keys(chartMetric.metric_dic).map((key: any, idx: number) => (
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
                                                        // setLegend={setLegend}
                                                        callBackColor={handleChartColor}
                                                        name={legend}
                                                        key={idx}
                                                        envData={envData}
                                                        data={chartMetric.metric_dic[key]}
                                                        chartType={chartType} />
                                                </Spin>
                                            </div>
                                        ))
                                    }
                                </>
                            }
                        </ModalContent>
                    </ModalBody>
                    :
                    <ModalBody>
                        <ModalSlider>
                            <Space direction="vertical">
                                <SliderTitle>
                                    Test Conf列表({conf_list.length})
                                </SliderTitle>
                                {
                                    conf_list.map((conf: any, idx: any) => (
                                        <span
                                            onClick={() => handleJumpChart(conf, idx)}
                                            key={idx}
                                        >
                                            <ConfName is_active={current === `${conf.conf_name}-${idx}` ? 1 : 0}>{conf.conf_name}</ConfName>
                                        </span>
                                    ))
                                }
                            </Space>
                        </ModalSlider>
                        <ModalContent>
                            {
                                chartConf && chartConf.conf_list.map(
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
                                                    is_active={current === `${conf.conf_name}-${idx}` ? true : false}
                                                    chartType={chartType}
                                                />

                                            }
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

export default React.memo(ChartModal)