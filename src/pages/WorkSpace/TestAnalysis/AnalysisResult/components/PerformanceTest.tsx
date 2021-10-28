import React, { useContext, useState, useRef, useEffect, memo } from 'react';
import { Space, Empty, Row, Col, Select, Button, Typography, Tooltip } from 'antd';
import { ReportContext } from '../Provider';
import { ReactComponent as BaseIcon } from '@/assets/svg/Report/BaseIcon.svg';
import { ReactComponent as IconLink } from '@/assets/svg/Report/IconLink.svg';
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg';
import { ReactComponent as IconArrowBlue } from '@/assets/svg/icon_arrow_blue.svg';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { toPercentage, handleIcon, handleColor } from '@/components/AnalysisMethods/index';
//import Performance from './PerformanceTestChild'
import ChartsIndex from '@/pages/WorkSpace/TestReport/NewReport/components/PerfCharts';
import _ from 'lodash';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { useScroll } from 'ahooks'
import produce from 'immer'

import styled from 'styled-components'

import {
    TestDataTitle,
    Summary,
    Group,
    TestWrapper,
    PerfGroupTitle,
    PerfGroupData,
    TestSuite,
    SuiteName,
    TestItemFunc,
    TestConf,
    ConfTitle,
    ConfData,
    TestConfWarpper,
    PrefData,
    PrefDataTitle,
    PrefDataText,
    PrefMetric,
    MetricTitle,
    MetricText,
    RightResult,
} from '../AnalysisUI';

const { Option } = Select;

const GroupBar = styled.div<{ width: number, y: number }>`
    background: #fff;
    position: absolute;
    top: 57px;
    height: 50px;
    // willChange: transform;
    border: 1px solid rgba(0,0,0,0.10);
    z-index: 5;
    width:${({ width }) => width || 0}px;
    transform:translateY(${({ y }) => y || 0}px);
`

const GroupBarWrapper: React.FC<any> = (props) => {
    const { groupRowRef, parentDom, groupLen, envData } = props

    const { top } = useScroll(document.querySelector('.ant-layout-has-sider .ant-layout') as any)
    // console.log(top)
    const floatRow = groupRowRef.current
    const testDataEle = parentDom.current

    if (!floatRow && !testDataEle) return <></>
    const testOffset = (testDataEle as any).offsetTop || 0
    const width = floatRow?.offsetWidth

    const visible = top > (testOffset + floatRow.offsetTop)

    if (visible) {
        return (
            <GroupBar
                width={width}
                y={top - testOffset - floatRow.offsetTop}
            >
                <Summary style={{ border: 'none', paddingLeft: 18, paddingRight: 15 }}>
                    <Group>
                        <PerfGroupTitle gLen={groupLen}>对比组名称</PerfGroupTitle>
                        {
                            Array.isArray(envData) && envData.map((item: any, idx: number) => {
                                return (
                                    <PerfGroupData gLen={groupLen} key={idx}>
                                        <Space>
                                            {
                                                item.is_base &&
                                                <BaseIcon
                                                    style={{ marginRight: 4, marginTop: 17, width: 10, height: 14 }}
                                                    title="基准组"
                                                />
                                            }
                                        </Space>
                                        <EllipsisPulic title={item.tag} />
                                    </PerfGroupData>
                                )
                            })
                        }
                    </Group>
                </Summary>
            </GroupBar>
        )
    }else{
        return <></>
    }
    
}

const ReportTestPref: React.FC<any> = (props) => {
    const { compareResult, allGroupData, environmentResult, baselineGroupIndex, envData, ws_id } = useContext(ReportContext)
    const group = allGroupData?.length
    const { parentDom } = props
    const [arrowStyle, setArrowStyle] = useState('')
    const [num, setNum] = useState(0)
    const [dataSource, setDataSource] = useState<any>([])
    const [btn, setBtn] = useState<boolean>(true)
    const [btnName, setBtnName] = useState<string>('')
    const [chartType, setChartType] = useState('1')
    const [filterName, setFilterName] = useState('all')
    const groupRowRef = useRef<any>(null)
    const { perf_data_result } = compareResult

    useEffect(() => {
        if (Array.isArray(perf_data_result) && perf_data_result.length > 0) {
            setDataSource(perf_data_result)
        }
    }, [perf_data_result])

    const switchMode = () => {
        setBtn(!btn)
        setChartType('1')
    }
    const hanldeChangeChartType = (val: string) => setChartType(val)

    useEffect(() => {
        setBtnName(btn ? '图表模式' : '列表模式')
    }, [btn])
    // 右侧功能按钮
    const ItemFunc: React.FC = () => {
        return (
            <TestItemFunc>
                <Space>
                    <Button onClick={switchMode}>{btnName}</Button>
                    <Space>
                        <Typography.Text>筛选: </Typography.Text>
                        <Select defaultValue="all" style={{ width: 200 }} value={filterName} onSelect={handleConditions}>
                            <Option value="all">全部</Option>
                            <Option value="invalid">无效</Option>
                            <Option value="volatility">波动大（包括上升、下降）</Option>
                            <Option value="increase">上升</Option>
                            <Option value="decline">下降</Option>
                            <Option value="normal">正常</Option>
                        </Select>
                    </Space>
                </Space>
            </TestItemFunc>
        )
    }

    const compare = (prop: any) => {
        return function (a: any, b: any) {
            return a[prop] - b[prop]
        }
    }
    //差异化排序
    // const handleArrow = (suite: any, i: any) => {
    //     setNum(i)
    //     setArrowStyle(suite.suite_id)
    //     let data = _.cloneDeep(perf_data_result)
    //     let newArr: any = []
    //     suite.conf_list.forEach((conf: any, index: number) => {
    //         let metric_list: any = []
    //         conf.metric_list.forEach((metric: any) => {
    //             let result = metric.compare_data[i - 1]
    //             if (result?.compare_result == 'decline') {
    //                 metric.sortNum = 0
    //             } else if (result?.compare_result == 'increase') {
    //                 metric.sortNum = 1
    //             } else if (result?.compare_result == 'normal') {
    //                 metric.sortNum = 2
    //             } else if (result?.compare_result == 'invalid') {
    //                 metric.sortNum = 3
    //             } else {
    //                 metric.sortNum = 4
    //             }
    //             metric_list.push({
    //                 ...metric
    //             })
    //         })
    //         newArr.push({
    //             ...conf,
    //             metric_list
    //         })
    //     })

    //     const compare = (prop: any) => {
    //         return function (a: any, b: any) {
    //             return a[prop] - b[prop]
    //         }
    //     }

    //     const endList = newArr.map((item: any) => {
    //         let result = item.metric_list.sort(compare('sortNum'))
    //         return {
    //             ...item,
    //             metric_list: result
    //         }
    //     })
    //     setDataSource(
    //         data.map((item: any) => {
    //             if (item.suite_id === suite.suite_id) {
    //                 return {
    //                     ...item,
    //                     conf_list: endList
    //                 }
    //             } else {
    //                 return item
    //             }
    //         })
    //     )
    // }
    //差异化排序
    const handleArrow = (suite: any, i: any) => {
        setNum(i)
        setArrowStyle(suite.suite_id)

        const compareTerms = ['decline', 'increase', 'normal', 'invalid']
        const endList = suite.conf_list
            .reduce((pre: any[], cur: any) => {
                return pre.concat({
                    ...cur,
                    metric_list: cur.metric_list.reduce((p: any[], c: any) => {
                        const { compare_result } = c.compare_data[i - 1]
                        let sortNum = 4
                        if (compare_result) {
                            const idx = compareTerms.indexOf(compare_result)
                            sortNum = idx
                        }
                        return p.concat({ ...c, sortNum })
                    }, [])
                })
            }, [])
            .map((item: any) => ({
                ...item,
                metric_list: item.metric_list.sort(compare('sortNum'))
            }))

        setDataSource(
            dataSource.map((item: any) => {
                if (item.suite_id === suite.suite_id) {
                    return {
                        ...item,
                        conf_list: endList
                    }
                }
                return item
            })
        )
    }

    // const getCompareConfs = (value: string) => {
    //     let newData: any = []
    //     dataSource.forEach(({ conf_list }: any) => {
    //         conf_list.forEach(({ metric_list, conf_id }: any) => {
    //             metric_list.forEach(({ compare_data }: any) => {
    //                 compare_data.forEach(({ compare_result }: any) => {
    //                     if (value === 'volatility') {
    //                         if (compare_result === 'increase' || compare_result === 'decline')
    //                             newData.push(conf_id)
    //                     }
    //                     else
    //                         if (compare_result === value)
    //                             newData.push(conf_id)
    //                 })
    //             })
    //         })
    //     })
    //     return newData
    // }

    //筛选过滤
    // const handleConditions = (value: any) => {
    //     setFilterName(value)
    //     if (value === 'all') return setDataSource(dataSource)
    //     const compareIds = getCompareConfs(value)
    //     setDataSource(
    //         produce(
    //             dataSource,
    //             (draftState: any) => {
    //                 draftState = draftState.map((item: any) => {
    //                     const { conf_list } = item
    //                     return {
    //                         ...item,
    //                         conf_list: conf_list.filter((conf: any) => compareIds.includes(conf.conf_id))
    //                     }
    //                 })
    //             }
    //         )
    //     )
    // }
    //筛选过滤
    const handleConditions = (value: any) => {
        setFilterName(value)
        let dataSource = _.cloneDeep(perf_data_result)
        let newData: any = []
        dataSource.forEach((item: any) => {
            item.conf_list.forEach((conf: any) => {
                conf.metric_list.forEach((metric: any) => {
                    metric.compare_data.forEach((compare: any) => {
                        if (value === 'volatility') {
                            if (compare.compare_result === 'increase' || compare.compare_result === 'decline')
                                newData.push(conf.conf_id)
                        } else {
                            if (compare.compare_result === value)
                                newData.push(conf.conf_id)
                        }
                    })
                })
            })
        })
        if (value === 'all') {
            setDataSource(dataSource)
        } else {
            setDataSource(dataSource.map((item: any) => {
                let conf_list = item.conf_list.filter((conf: any) => newData.includes(conf.conf_id));
                return {
                    ...item,
                    conf_list
                }
            }))
        }
    }

    return (
        <>
            <Summary ref={groupRowRef}>
                <Group style={{ border:'1px solid rgba(0,0,0,0.10)' }}>
                    <PerfGroupTitle gLen={group}>对比组名称</PerfGroupTitle>
                    {
                        Array.isArray(envData) && envData.map((item: any, idx: number) => {
                            return (
                                <PerfGroupData gLen={group} key={idx}>
                                    <Space>
                                        {item.is_base ? <BaseIcon style={{ marginRight: 4, marginTop: 17 }} title="基准组" /> : null}
                                    </Space>
                                    <EllipsisPulic title={item.tag} />
                                </PerfGroupData>
                            )
                        })
                    }
                </Group>
            </Summary>
            <GroupBarWrapper
                groupRowRef={groupRowRef}
                parentDom={parentDom}
                envData={envData}
                groupLen={group}
            />
            <Row>
                <Col span={12}>
                    <TestDataTitle id="perf_item">性能测试</TestDataTitle>
                </Col>
                <Col span={12}>
                    <ItemFunc />
                </Col>
            </Row>
            <TestWrapper>
                {
                    dataSource.length > 0 ?
                        dataSource.map((item: any, idx: number) => {
                            return (
                                <TestSuite key={idx}>
                                    <SuiteName>
                                        {item.suite_name}
                                        {
                                            !btn && <Space style={{ position: 'absolute', right: 12 }}>
                                                <Typography.Text>视图：</Typography.Text>
                                                <Select value={chartType} style={{ width: 230 }} onChange={hanldeChangeChartType}>
                                                    <Select.Option value="1">所有指标拆分展示(type1)</Select.Option>
                                                    <Select.Option value="2">多Conf同指标合并(type2)</Select.Option>
                                                    <Select.Option value="3">单Conf多指标合并(type3)</Select.Option>
                                                </Select>
                                            </Space>
                                        }
                                    </SuiteName>
                                    <TestConfWarpper>
                                        {
                                            btn ?
                                                (item.conf_list && item.conf_list.length) ? item.conf_list.map((conf: any, cid: number) => (
                                                    <div key={cid}>
                                                        <TestConf>
                                                            <ConfTitle gLen={group}>Test Conf / 指标 </ConfTitle>
                                                            {
                                                                allGroupData?.map((cont: any, i: number) => (
                                                                    <ConfData gLen={group} key={i}>
                                                                        {
                                                                            i !== baselineGroupIndex ?
                                                                                <Row justify="space-between">
                                                                                    <Col span={12}>
                                                                                        <Typography.Text style={{ color: 'rgba(0,0,0,0.45)' }}>结果</Typography.Text>
                                                                                    </Col>
                                                                                    <Col span={12}>
                                                                                        <RightResult>
                                                                                            对比结果/跟踪结果
                                                                                            <span onClick={() => handleArrow(item, i)} style={{ margin: '0 5px 0 3px', verticalAlign: 'middle' }}>
                                                                                                {arrowStyle == item.suite_id && num == i ? <IconArrowBlue /> : <IconArrow />}
                                                                                            </span>
                                                                                            <Tooltip color="#fff" overlayStyle={{ minWidth: 350 }}
                                                                                                title={
                                                                                                    <span style={{ color: 'rgba(0,0,0,0.65)' }}>性能测试与基准组差值比例越大差异化越大。<br />规则如下：<br />下降&gt;上升&gt;波动不大&gt;无效</span>
                                                                                                }>
                                                                                                <QuestionCircleOutlined />
                                                                                            </Tooltip>
                                                                                        </RightResult>
                                                                                    </Col>
                                                                                </Row>
                                                                                : <Typography.Text style={{ color: 'rgba(0,0,0,0.45)' }}>{allGroupData.length > 1 ? '基准' : '结果'}</Typography.Text>
                                                                        }
                                                                    </ConfData>
                                                                ))
                                                            }
                                                        </TestConf>
                                                        <div style={{ border: '1px solid rgba(0,0,0,0.10)' }}>
                                                            <PrefData>
                                                                <PrefDataTitle gLen={group}>{conf.conf_name} </PrefDataTitle>
                                                                {
                                                                    allGroupData?.map((cont: any, i: number) => (
                                                                        <PrefDataText gLen={group} key={i}>
                                                                            {
                                                                                i !== baselineGroupIndex ?
                                                                                    <span
                                                                                        style={{ cursor: 'pointer' }}
                                                                                        onClick={() => window.open(`/ws/${ws_id}/test_result/${(conf.conf_compare_data || conf.compare_conf_list)[i - 1]?.obj_id}`)}>
                                                                                        {(conf.conf_compare_data || conf.compare_conf_list)[i - 1]?.obj_id ? <IconLink style={{ width: 9, height: 9 }} /> : <></>}
                                                                                    </span>
                                                                                    :
                                                                                    <span style={{ cursor: 'pointer' }} onClick={() => window.open(`/ws/${ws_id}/test_result/${(conf?.conf_source || conf).obj_id}`)}>
                                                                                        {(conf?.conf_source || conf).obj_id ? <IconLink style={{ width: 9, height: 9 }} /> : <></>}
                                                                                    </span>
                                                                            }
                                                                        </PrefDataText>
                                                                    ))
                                                                }
                                                            </PrefData>
                                                            {
                                                                conf.metric_list.map((metric: any, idx: number) => (
                                                                    <PrefMetric key={idx}>
                                                                        <MetricTitle gLen={group}>
                                                                            <Row justify="space-between">
                                                                                <Col span={16}>
                                                                                    <Row justify="start">
                                                                                        <EllipsisPulic
                                                                                            title={`${metric.metric}${metric.unit ? '(' + metric.unit + ')' : ''}`}
                                                                                            width={210}
                                                                                        >
                                                                                            <Typography.Text style={{ color: 'rgba(0,0,0,0.65)' }}>
                                                                                                {metric.metric}{metric.unit && <span>({metric.unit})</span>}
                                                                                            </Typography.Text>
                                                                                        </EllipsisPulic>
                                                                                    </Row>
                                                                                </Col>
                                                                                <Col span={8}>
                                                                                    <Row justify="end">
                                                                                        <RightResult>({`${toPercentage(metric.cv_threshold)}/${toPercentage(metric.cmp_threshold)}`})</RightResult>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                        </MetricTitle>
                                                                        {
                                                                            Array.isArray(metric.compare_data) && metric.compare_data.length > 0 ?
                                                                                metric.compare_data.map((item: any, i: number) => (
                                                                                    i !== baselineGroupIndex ?
                                                                                        <MetricText gLen={group} key={i}>
                                                                                            <Row justify="space-between">
                                                                                                <Col span={12}>
                                                                                                    <Row justify="start">
                                                                                                        <EllipsisPulic
                                                                                                            title={`${item.test_value}±${item.cv_value}`}
                                                                                                            width={210}
                                                                                                        >
                                                                                                            <Typography.Text style={{ color: 'rgba(0,0,0,0.65)' }} ellipsis={true}>
                                                                                                                {
                                                                                                                    JSON.stringify(item) === '{}'
                                                                                                                        ? '-'
                                                                                                                        : `${item.test_value}±${item.cv_value}`
                                                                                                                }
                                                                                                            </Typography.Text>
                                                                                                        </EllipsisPulic>
                                                                                                    </Row>
                                                                                                </Col>
                                                                                                <Col span={12}>
                                                                                                    <Row justify="end">
                                                                                                        <RightResult>
                                                                                                            <span className={handleColor(item.compare_result)}>
                                                                                                                {item.compare_value || '-'}
                                                                                                            </span>
                                                                                                            <span className={handleColor(item.compare_result)} style={{ padding: ' 0px 9px ' }}>
                                                                                                                {handleIcon(item.compare_result)}
                                                                                                            </span>
                                                                                                        </RightResult>
                                                                                                    </Row>
                                                                                                </Col>
                                                                                            </Row>
                                                                                        </MetricText> :
                                                                                        <>
                                                                                            <MetricText gLen={group} key={i}>
                                                                                                <Row justify="start">
                                                                                                    <EllipsisPulic
                                                                                                        title={`${metric.test_value}±${metric.cv_value}`}
                                                                                                        width={210}
                                                                                                    >
                                                                                                        <Typography.Text style={{ color: 'rgba(0,0,0,0.65)' }} ellipsis={true}>
                                                                                                            {
                                                                                                                JSON.stringify(metric) === '{}'
                                                                                                                    ? '-'
                                                                                                                    : `${metric.test_value}±${metric.cv_value}`
                                                                                                            }
                                                                                                        </Typography.Text>
                                                                                                    </EllipsisPulic>
                                                                                                </Row>
                                                                                            </MetricText>
                                                                                            <MetricText gLen={group}>
                                                                                                <Row justify="space-between">
                                                                                                    <Col span={12}>
                                                                                                        <Row justify="start">
                                                                                                            <EllipsisPulic
                                                                                                                title={`${item.test_value}±${item.cv_value}`} width={210}
                                                                                                            >
                                                                                                                <Typography.Text style={{ color: 'rgba(0,0,0,0.65)' }}>
                                                                                                                    {
                                                                                                                        JSON.stringify(item) === '{}'
                                                                                                                            ? '-'
                                                                                                                            : `${item.test_value}±${item.cv_value}`
                                                                                                                    }
                                                                                                                </Typography.Text>
                                                                                                            </EllipsisPulic>
                                                                                                        </Row>
                                                                                                    </Col>
                                                                                                    <Col span={12}>
                                                                                                        <Row justify="end">
                                                                                                            <RightResult>
                                                                                                                <span className={handleColor(item.compare_result)}>
                                                                                                                    {item.compare_value || '-'}
                                                                                                                </span>
                                                                                                                <span className={handleColor(item.compare_result)} style={{ padding: ' 0px 9px ' }}>
                                                                                                                    {handleIcon(item.compare_result)}
                                                                                                                </span>
                                                                                                            </RightResult>
                                                                                                        </Row>
                                                                                                    </Col>
                                                                                                </Row>
                                                                                            </MetricText>
                                                                                        </>
                                                                                ))
                                                                                :
                                                                                <MetricText gLen={group}>
                                                                                    <Row justify="start">
                                                                                        <EllipsisPulic
                                                                                            title={`${metric.test_value}±${metric.cv_value}`} width={210}
                                                                                        >
                                                                                            <Typography.Text style={{ color: 'rgba(0,0,0,0.65)' }}>
                                                                                                {
                                                                                                    JSON.stringify(metric) === '{}'
                                                                                                        ? '-'
                                                                                                        : `${metric.test_value}±${metric.cv_value}`
                                                                                                }
                                                                                            </Typography.Text>
                                                                                        </EllipsisPulic>
                                                                                    </Row>
                                                                                </MetricText>
                                                                        }
                                                                    </PrefMetric>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                                : <ChartsIndex {...item} chartType={chartType} envData={environmentResult} />
                                        }
                                    </TestConfWarpper>
                                </TestSuite>
                            )
                        }) :
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
            </TestWrapper>
        </>
    )
}
export default memo(ReportTestPref);

// const [top, setTop] = useState(0)
// const onScroll = (evt: any) => {
//     console.log(evt.target.scrollTop)
//     setTop(evt.target.scrollTop)
// }
// useEffect(() => {
//     document.querySelector('.ant-layout-has-sider .ant-layout')?.addEventListener('scroll', onScroll, true)
//     return () => {
//         document.querySelector('.ant-layout-has-sider .ant-layout')?.removeEventListener('scroll', onScroll, true)
//     }
// }, [])

//筛选过滤
// const handleConditions = (value: any) => {
//     setFilterName(value)
//     let dataSource = _.cloneDeep(perf_data_result)
//     let newData: any = []
//     dataSource.forEach((item: any) => {
//         item.conf_list.forEach((conf: any) => {
//             conf.metric_list.forEach((metric: any) => {
//                 metric.compare_data.forEach((compare: any) => {
//                     if (compare.compare_result === value)
//                         newData.push(conf.conf_id)
//                 })
//             })
//         })
//     })
//     if (value === 'all') {
//         setDataSource(dataSource)
//     } else if (value === 'volatility') {
//         let newData: any = []
//         dataSource.forEach((item: any) => {
//             item.conf_list.forEach((conf: any) => {
//                 conf.metric_list.forEach((metric: any) => {
//                     metric.compare_data.forEach((compare: any) => {
//                         if (compare.compare_result === 'increase' || compare.compare_result === 'decline')
//                             newData.push(conf.conf_id)
//                     })
//                 })
//             })
//         })
//         setDataSource(dataSource.map((item: any) => {
//             let conf_list = item.conf_list.filter((conf: any) => newData.includes(conf.conf_id));
//             return {
//                 ...item,
//                 conf_list
//             }
//         }))
//     } else {
//         setDataSource(dataSource.map((item: any) => {
//             let conf_list = item.conf_list.filter((conf: any) => newData.includes(conf.conf_id));
//             return {
//                 ...item,
//                 conf_list
//             }
//         }))
//     }
// }