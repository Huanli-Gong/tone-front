/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-shadow */

import React, { useContext, useState, useRef, useEffect, memo, useMemo } from 'react';
import { Space, Empty, Row, Col, Select, Button, Typography, Tooltip } from 'antd';
import { ReportContext } from '../Provider';
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
import { JumpResult } from '@/utils/hooks';
import { getCompareType } from "@/utils/utils"
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
import { useIntl, FormattedMessage } from 'umi'

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
                        <PerfGroupTitle gLen={groupLen}><FormattedMessage id="analysis.comparison.group.name" /></PerfGroupTitle>
                        <Identify envData={envData} group={groupLen} isData={true} />
                    </Group>
                </Summary>
            </GroupBar>
        )
    } else {
        return <></>
    }
}

const compareTerms = ['decline', 'increase', 'normal', 'invalid', 'na']

const compare = (prop: any) => {
    return function (a: any, b: any) {
        return a[prop] - b[prop]
    }
}

const ReportTestPref: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const { compareResult, allGroupData, environmentResult, baselineGroupIndex, envData, group, wsId, containerRef } = useContext(ReportContext)
    const { parentDom, scrollLeft } = props
    const [sortKeys, setSortKeys] = useState<any>([])
    // const [sortFlag, setSortFlag] = useState<any>(0)
    const [dataSource, setDataSource] = useState<any>([])
    const [btn, setBtn] = useState<boolean>(true)
    const [btnName, setBtnName] = useState<string>('')
    const [filterName, setFilterName] = useState('all')
    const sortRef = useRef();
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
        setBtnName(btn ? 'chart' : 'list')
    }, [btn])

    // 右侧功能按钮
    const ItemFunc: React.FC = () => {
        return (
            <TestItemFunc>
                <Space>
                    <Button onClick={switchMode}><FormattedMessage id={btnName === 'chart' ? 'analysis.chart.mode' : 'analysis.list.mode'} /></Button>
                    {btn && <Space>
                        <Typography.Text><FormattedMessage id="analysis.filter" />: </Typography.Text>
                        <Select defaultValue="all" style={{ width: 200 }} value={filterName} onSelect={handleConditions}>
                            <Option value="all"><FormattedMessage id="analysis.all" /></Option>
                            <Option value="invalid"><FormattedMessage id="analysis.invalid" /></Option>
                            <Option value="volatility" title={formatMessage({ id: 'analysis.volatility' })}><FormattedMessage id="analysis.volatility" /></Option>
                            <Option value="increase"><FormattedMessage id="analysis.increase" /></Option>
                            <Option value="decline"><FormattedMessage id="analysis.decline" /></Option>
                            <Option value="normal"><FormattedMessage id="analysis.normal" /></Option>
                        </Select>
                    </Space>
                    }
                </Space>
            </TestItemFunc>
        )
    }

    //差异化排序
    const handleArrow = (suite: any, i: any, conf: any) => {
        sortRef.current = i
       
        // if (sortKeys.includes(conf.conf_id)) {
        //     const { perf_data_result } = compareResult
        //     // const arr = [...new Set(sortKeys)]
        //     setDataSource((p: any) => p.map((item: any) => {
        //         if (item.suite_id === suite.suite_id) {
        //             return {
        //                 ...item,
        //                 conf_list: perf_data_result.filter((ix: any) => ix.suite_id === suite.suite_id)[0]?.conf_list
        //             }
        //         }
        //         return item
        //     }))
        //     return
        // } else {
        //     let arr:Array<[]> = []
        //     setSortKeys(arr.concat(conf.conf_id))
        //     // setSortKeys((p: any) => p.concat(conf.conf_id))
        // }
        let arr:Array<[]> = []
        setSortKeys(arr.concat(conf.conf_id))
        // setSortKeys(sortKeys.filter((iy: any) => iy !== conf.conf_id))
        const endList = suite.conf_list
            .reduce((pre: any[], cur: any) => {
                if (cur.conf_id === conf.conf_id)
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
                        }, []).sort(compare('sortNum'))
                    })
                return pre.concat(cur)
            }, [])


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
    const renderShare = (conf: any) => {
        let obj = conf.conf_compare_data || conf.compare_conf_list || []
        return obj.map((item: any, idx: number) => {
            return (
                <PrefDataText gLen={group} key={idx}>
                    {
                        !getCompareType(item) ?
                            <JumpResult ws_id={wsId} job_id={item.obj_id || item} /> :
                            <div style={{ height: 38 }} />
                    }
                </PrefDataText>
            )
        })
    }

    const containerScroll = useScroll(containerRef)
    return (
        <>
            <Summary ref={groupRowRef}>
                <Group style={{ border: '1px solid rgba(0,0,0,0.10)' }}>
                    <PerfGroupTitle gLen={group}><FormattedMessage id="analysis.comparison.group.name" /></PerfGroupTitle>
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
                    <TestDataTitle id="perf_item"><FormattedMessage id="performance.test" /></TestDataTitle>
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
                                    <SuiteName style={{ textIndent: containerScroll?.left }}>
                                        {item.suite_name}
                                        <ChartTypeChild containerScroll={containerScroll} btn={btn} isReport={false} obj={dataSource} suiteId={item.suite_id} setPerData={setDataSource} />
                                    </SuiteName>
                                    <TestConfWarpper>
                                        {
                                            btn ?
                                                (item.conf_list && item.conf_list.length) ? item.conf_list.map((conf: any, cid: number) => (
                                                    !!conf.metric_list.length &&
                                                    <div key={cid}>
                                                        <TestConf>
                                                            <ConfTitle gLen={group}><FormattedMessage id="analysis.TestConf/metric" /></ConfTitle>
                                                            {
                                                                allGroupData?.map((cont: any, i: number) => (
                                                                    <ConfData gLen={group} key={i}>
                                                                        {
                                                                            i !== baseIndex ?
                                                                                <Row justify="space-between">
                                                                                    <Col span={12}>
                                                                                        <Typography.Text style={{ color: 'rgba(0,0,0,0.45)' }}><FormattedMessage id="analysis.result" /></Typography.Text>
                                                                                    </Col>
                                                                                    <Col span={12}>
                                                                                        <RightResult>
                                                                                            <FormattedMessage id="analysis.comparison/tracking.results" />
                                                                                            <span onClick={() => handleArrow(item, i, conf)} style={{ margin: '0 5px 0 3px', verticalAlign: 'middle', cursor: 'pointer' }}>
                                                                                                {sortKeys.includes(conf.conf_id) && sortRef.current === i ? <IconArrowBlue /> : <IconArrow />}
                                                                                            </span>
                                                                                            <Tooltip color="#fff" overlayStyle={{ minWidth: 350 }}
                                                                                                title={
                                                                                                    <span style={{ color: 'rgba(0,0,0,0.65)' }}>
                                                                                                        <FormattedMessage id="analysis.the.greater.difference" /><br /><FormattedMessage id="analysis.rules" />：<br /><FormattedMessage id="analysis.decline" />&gt;<FormattedMessage id="analysis.increase" />&gt;<FormattedMessage id="analysis.fluctuation" />&gt;<FormattedMessage id="analysis.invalid" />
                                                                                                    </span>
                                                                                                }>
                                                                                                <QuestionCircleOutlined />
                                                                                            </Tooltip>
                                                                                        </RightResult>
                                                                                    </Col>
                                                                                </Row>
                                                                                : <Typography.Text style={{ color: 'rgba(0,0,0,0.45)' }}>{allGroupData.length > 1 ? <FormattedMessage id="analysis.benchmark" /> : <FormattedMessage id="analysis.result" />}</Typography.Text>
                                                                        }
                                                                    </ConfData>
                                                                ))
                                                            }
                                                        </TestConf>
                                                        <div style={{ border: '1px solid rgba(0,0,0,0.10)' }}>
                                                            <PrefData>
                                                                <PrefDataTitle gLen={group}><EllipsisPulic title={conf.conf_name} /></PrefDataTitle>
                                                                {renderShare(conf)}
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
                                                                                metric.compare_data?.slice(0, group)?.map((item: any, i: number) => (
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