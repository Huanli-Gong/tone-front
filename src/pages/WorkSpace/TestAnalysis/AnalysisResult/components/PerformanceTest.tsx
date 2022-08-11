import React, { useContext, useState, useRef, useEffect, memo, useMemo } from 'react';
import { Space, Empty, Row, Col, Select, Button, Typography, Tooltip } from 'antd';
import { ReportContext } from '../Provider';
import { ReactComponent as IconLink } from '@/assets/svg/Report/IconLink.svg';
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg';
import { ReactComponent as IconArrowBlue } from '@/assets/svg/icon_arrow_blue.svg';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { toPercentage, handleIcon, handleColor } from '@/components/AnalysisMethods/index';
import ChartsIndex from '@/pages/WorkSpace/TestReport/NewReport/components/PerfCharts';
import Identify from '@/pages/WorkSpace/TestAnalysis/AnalysisResult/components/Identify';
import { filterResult, conversion } from '@/components/Report/index'
import _ from 'lodash';
import ChartTypeChild from '../../../TestReport/NewReport/components/TestDataChild/ChartTypeChild'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { useScroll } from 'ahooks'
import styled from 'styled-components'

import {
    TestDataTitle,
    Summary,
    Group,
    TestWrapper,
    PerfGroupTitle,
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
                        <Identify envData={envData} group={groupLen} isData={true} />
                    </Group>
                </Summary>
            </GroupBar>
        )
    } else {
        return <></>
    }
}

// const handleDataArr = (dataArr: any, baseIndex: number) => {
//     if (Array.isArray(dataArr) && !!dataArr.length) {
//         dataArr.forEach((per: any) => (
//             per.conf_list.forEach((conf: any, i: number) => (
//                 conf.metric_list.forEach((metric: any, idx: number) =>
//                 (
//                     metric.compare_data.splice(baseIndex, 0, {
//                         cv_value: metric.cv_value,
//                         test_value: metric.test_value,
//                     })
//                 )
//                 )
//             ))
//         ))
//     }
//     return dataArr;
// }
const ReportTestPref: React.FC<any> = (props) => {
    const { compareResult, allGroupData, environmentResult, baselineGroupIndex, envData, group } = useContext(ReportContext)
    const { parentDom, scrollLeft } = props
    const [arrowStyle, setArrowStyle] = useState('')
    const [num, setNum] = useState(0)
    const [dataSource, setDataSource] = useState<any>([])
    const [btn, setBtn] = useState<boolean>(true)
    const [btnName, setBtnName] = useState<string>('')
    const [filterName, setFilterName] = useState('all')
    const groupRowRef = useRef<any>(null)
    const { perf_data_result } = compareResult
    // 当没有定义基准组时baseIndex的值
    const baseIndex = useMemo(() => {
        if (baselineGroupIndex === -1) return 0
        return baselineGroupIndex
    }, [baselineGroupIndex])
    // 只在列表中调换基准组位置
    useEffect(() => {
        let dataArr = _.cloneDeep(perf_data_result)
        setDataSource(
            btn ? dataArr : dataArr.map((item: any) => {
                return {
                    ...item,
                    chartType: '1'
                }
            })
        )
    }, [perf_data_result, btn])

    // 图表、列表模式切换
    const switchMode = () => {
        setBtn(!btn)
        // setChartType('1')
    }

    useEffect(() => {
        setBtnName(btn ? '图表模式' : '列表模式')
    }, [btn])

    // 右侧功能按钮
    const ItemFunc: React.FC = () => {
        return (
            <TestItemFunc>
                <Space>
                    <Button onClick={switchMode}>{btnName}</Button>
                    {btn && <Space>
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
                    }
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
    const handleArrow = (suite: any, i: any) => {
        setNum(i)
        setArrowStyle(suite.suite_id)

        const compareTerms = ['decline', 'increase', 'normal', 'invalid']
        const endList = suite.conf_list
            .reduce((pre: any[], cur: any) => {
                return pre.concat({
                    ...cur,
                    metric_list: cur.metric_list.reduce((p: any[], c: any) => {
                        const { compare_result } = c.compare_data[i]
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
    
    //筛选过滤
    const handleConditions = (value: any) => {
        setFilterName(value)
        let dataSource = _.cloneDeep(perf_data_result)
        if (value === 'all') {
            setDataSource(dataSource)
        } else {
            setDataSource(dataSource.map((item: any) => {
                let conf_list = item.conf_list.map((conf: any) => {
                    return {
                        ...conf,
                        metric_list: conf.metric_list.filter((metric: any) => filterResult(metric.compare_data, value))
                    }
                })
                return {
                    ...item,
                    conf_list,
                }
            }))
        }
    }
    const renderShare = (conf: any, wsId:any) => {
        let obj = conf.conf_compare_data || conf.compare_conf_list || []
        return (
            obj.map((item: any, idx: number) => (
                <PrefDataText gLen={group} key={idx}>
                    <a style={{ cursor: 'pointer' }}
                        href={`/ws/${wsId}/test_result/${item}`}
                        target="_blank"
                    >
                        {item ? <IconLink style={{ width: 9, height: 9 }} /> : <></>}
                    </a>
                </PrefDataText>
            ))
        )
    }

    return (
        <>
            <Summary ref={groupRowRef}>
                <Group style={{ border: '1px solid rgba(0,0,0,0.10)' }}>
                    <PerfGroupTitle gLen={group}>对比组名称</PerfGroupTitle>
                    <Identify envData={envData} group={group} isData={true} />
                </Group>
            </Summary>
            <GroupBarWrapper
                groupRowRef={groupRowRef}
                parentDom={parentDom}
                envData={envData}
                groupLen={group}
            />
            <Row style={{ maxWidth: document.body.clientWidth - 40 + scrollLeft }}>
                <Col span={12}>
                    <TestDataTitle id="perf_item">性能测试</TestDataTitle>
                </Col>
                <Col span={12}>
                    <ItemFunc />
                </Col>
            </Row>
            <TestWrapper>
                {
                    dataSource && !!dataSource.length ?
                        dataSource.map((item: any, idx: number) => {
                            return (
                                <TestSuite key={idx}>
                                    <SuiteName>
                                        {item.suite_name}
                                        <ChartTypeChild btn={btn} isReport={false} obj={dataSource} suiteId={item.suite_id} setPerData={setDataSource} />
                                    </SuiteName>
                                    <TestConfWarpper>
                                        {
                                            btn ?
                                                (item.conf_list && item.conf_list.length) ? item.conf_list.map((conf: any, cid: number) => (
                                                    !!conf.metric_list.length && <div key={cid}>
                                                        <TestConf>
                                                            <ConfTitle gLen={group}>Test Conf / 指标 </ConfTitle>
                                                            {
                                                                allGroupData?.map((cont: any, i: number) => (
                                                                    <ConfData gLen={group} key={i}>
                                                                        {
                                                                            i !== baseIndex ?
                                                                                <Row justify="space-between">
                                                                                    <Col span={12}>
                                                                                        <Typography.Text style={{ color: 'rgba(0,0,0,0.45)' }}>结果</Typography.Text>
                                                                                    </Col>
                                                                                    <Col span={12}>
                                                                                        <RightResult>
                                                                                            对比结果/跟踪结果
                                                                                            <span onClick={() => handleArrow(item, i)} style={{ margin: '0 5px 0 3px', verticalAlign: 'middle', cursor:'pointer' }}>
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
                                                                <PrefDataTitle gLen={group}><EllipsisPulic title={conf.conf_name} /></PrefDataTitle>
                                                                {renderShare(conf,item.ws_id)}
                                                            </PrefData>
                                                            {
                                                                conf.metric_list.map((metric: any, idx: number) => (
                                                                    (
                                                                        <PrefMetric key={idx}>
                                                                            <MetricTitle gLen={group}>
                                                                                <Row justify="space-between">
                                                                                    <Col span={16}>
                                                                                        <Row justify="start">
                                                                                            <EllipsisPulic
                                                                                                title={`${metric.metric}${metric.unit ? '(' + metric.unit + ')' : ''}`}
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
                                                                                Array.isArray(metric.compare_data) && !!metric.compare_data.length &&
                                                                                metric.compare_data.map((item: any, i: number) => (
                                                                                    <MetricText gLen={group} key={i}>
                                                                                        <Row justify="space-between">
                                                                                            <Col span={item && item.compare_result ? 12 : 20}>
                                                                                                <Row justify="start">
                                                                                                    <EllipsisPulic
                                                                                                        title={conversion(item)}
                                                                                                    >
                                                                                                        <Typography.Text style={{ color: 'rgba(0,0,0,0.65)' }}>
                                                                                                            {conversion(item)}
                                                                                                        </Typography.Text>
                                                                                                    </EllipsisPulic>
                                                                                                </Row>
                                                                                            </Col>
                                                                                            {
                                                                                                item && item.compare_result &&
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
                                                                                            }
                                                                                        </Row>
                                                                                    </MetricText>
                                                                                ))
                                                                            }
                                                                        </PrefMetric>
                                                                    )
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                                : <ChartsIndex {...item} envData={environmentResult} base_index={baseIndex} />
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