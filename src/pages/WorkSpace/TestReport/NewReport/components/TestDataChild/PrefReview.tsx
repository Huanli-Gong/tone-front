import React, { useContext, useEffect, useState, memo, useMemo } from 'react';
import { ReportContext } from '../../Provider';
import { Typography, Space, Select, Popconfirm, Tooltip, Empty, Row, Col } from 'antd';
import { GroupItemText } from '../EditPerfText';
import { PerfTextArea } from '../EditPerfText';
import { ReactComponent as IconLink } from '@/assets/svg/Report/IconLink.svg';
import { ReactComponent as DelDefault } from '@/assets/svg/Report/delDefault.svg';
import { ReactComponent as DelHover } from '@/assets/svg/Report/delHover.svg';
import { ReactComponent as TestItemIcon } from '@/assets/svg/Report/TestItem.svg';
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg';
import { ReactComponent as IconArrowBlue } from '@/assets/svg/icon_arrow_blue.svg';
import CodeViewer from '@/components/CodeViewer';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { deleteSuite, deleteConf } from './DelMethod.js';
import { filterResult, conversion } from '@/components/Report/index'
// import ChartsIndex from '../../../../AnalysisResult/components/ChartIndex';
import ChartsIndex from '../PerfCharts';
import ChartTypeChild from './ChartTypeChild'
import { QuestionCircleOutlined } from '@ant-design/icons';
// import { FixedSizeList as List } from 'react-window';
import _ from 'lodash';
import {
    TestGroupItem,
    TestItemText,
    TestSuite,
    SuiteName,
    Configuration,
    SigleWrapper,
    TestTitle,
    TestContent,
    TestConf,
    ConfTitle,
    ConfData,
    TestConfWarpper,
    PrefData,
    PrefDataDel,
    PrefDataTitle,
    PrefDataText,
    PrefMetric,
    MetricTitle,
    MetricText,
    TestItemFunc,
    RightResult,
    CloseBtn,
} from '../../ReportUI';
import { toPercentage, handleIcon, handleColor } from '@/components/AnalysisMethods/index';
const { Option } = Select;

const Performance = (props: any) => {
    const { child, btn, wsId, name, id, onDelete, dataSource, setDataSource } = props
    const { btnState, allGroupData, baselineGroupIndex, domainResult, environmentResult, groupLen, isOldReport } = useContext(ReportContext)
    const [filterName, setFilterName] = useState('all')
    const [perData, setPerData] = useState<any>({})
    const [arrowStyle, setArrowStyle] = useState('')
    const [num, setNum] = useState(0)
    const baseIndex = useMemo(() => {
        if (baselineGroupIndex === -1) return 0
        return baselineGroupIndex
    }, [baselineGroupIndex])

    const handleDataArr = (dataArr: any, baseIndex: number) => {
        if (Array.isArray(dataArr.list) && !!dataArr.list.length) {
            dataArr.list.forEach((per: any) => (
                per.conf_list.forEach((conf: any, i: number) => (
                    conf.metric_list.forEach((metric: any, idx: number) =>
                    (
                        metric.compare_data.splice(baseIndex, 0, {
                            cv_value: metric.cv_value,
                            test_value: metric.test_value,
                        })
                    )
                    )
                ))
            ))
        }
        return dataArr;
    }
    useEffect(() => {
        // let timer: any;
        // if (btn) {
        //     timer = setTimeout(() => {
        //         setPerData(child)
        //     }, 100);
        // } else {
        // setPerData({
        //     ...child, list: child.list.map((item: any) => {
        //         return {
        //             ...item,
        //             chartType: '1'
        //         }
        //     })
        // })
        // }
        // return (() => {
        //     timer && clearTimeout(timer)
        // })
        const data = isOldReport ? handleDataArr(_.cloneDeep(child), baseIndex) : child
        btn ? setPerData(data) : setPerData({
            ...child, list: child.list.map((item: any) => {
                return {
                    ...item,
                    chartType: '1'
                }
            })
        })
    }, [child, btn])

    // 筛选过滤
    const handleConditions = (value: any) => {
        setFilterName(value)
        let dataSource = isOldReport ? handleDataArr(_.cloneDeep(child), baseIndex) : _.cloneDeep(child)
        if (value === 'all') {
            setPerData(dataSource)
        } else {
            let list = dataSource.list.map((item: any) => {
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
            })
            let obj = {
                ...dataSource,
                list,
            }
            setPerData(obj)
        }
    }
    const DelBtn: React.FC<any> = (props: any) => {
        const { conf, cid } = props;
        return (
            <Popconfirm
                title='确认要删除吗!'
                onConfirm={() => handleDelete('conf', conf, cid)}
                cancelText="取消"
                okText="删除"
            >
                {
                    btnState && <PrefDataDel empty={true}>
                        <DelDefault className="remove" />
                        <DelHover className="remove_active" />
                    </PrefDataDel>
                }
            </Popconfirm>
        )
    }

    const handleDelete = (name: string, row: any, rowKey: any) => {
        if (name == 'suite') {
            setDataSource(dataSource.map((item: any) => {
                if (item.is_group) {
                    let list = item.list.map((l: any) => deleteSuite(l, row))
                    return {
                        ...item,
                        list,
                    }
                } else {
                    return deleteSuite(item, row)
                }
            }))
        } else {
            setDataSource(dataSource.map((item: any) => {
                if (item.is_group) {
                    let list = item.list.map((l: any) => deleteConf(l, row))
                    return {
                        ...item,
                        list,
                    }
                } else {
                    return deleteConf(item, row)
                }
            }))
        }
    }
    // 右侧功能按钮
    const ItemFunc: React.FC<any> = () => {
        return (
            <TestItemFunc>
                {
                    btn && <Space>
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
            </TestItemFunc>
        )
    }
    // 差异化排序
    const handleArrow = (suite: any, i: any) => {
        setNum(i)
        setArrowStyle(suite.suite_id)
        let dataSource = child
        let newArr: any = []
        let newData: any = []
        suite.conf_list.map((conf: any, index: number) => {
            let metric_list: any = []
            conf.metric_list.map((metric: any) => {
                let result = metric.compare_data[i]
                if (result?.compare_result == 'decline') {
                    metric.sortNum = 0
                } else if (result?.compare_result == 'increase') {
                    metric.sortNum = 1
                } else if (result?.compare_result == 'normal') {
                    metric.sortNum = 2
                } else if (result?.compare_result == 'invalid') {
                    metric.sortNum = 3
                } else {
                    metric.sortNum = 4
                }

                metric_list.push({
                    ...metric
                })
            })
            newArr.push({
                ...conf,
                metric_list
            })
        })
        const compare = (prop: any) => {
            return function (a: any, b: any) {
                return a[prop] - b[prop]
            }
        }

        const endList = newArr.map((item: any) => {
            let result = item.metric_list.sort(compare('sortNum'))
            return {
                ...item,
                metric_list: result
            }
        })
        dataSource.list.map((item: any) => {
            if (item.suite_id == suite.suite_id) {
                newData.push({
                    ...item,
                    conf_list: endList
                })
            } else {
                newData.push({
                    ...item
                })
            }

        })
        let obj = {
            ...dataSource,
            list: newData
        }
        setPerData(obj)
    }

    const renderShare = (conf: any) => {
        let obj = conf.conf_compare_data || conf.compare_conf_list
        return (
            obj.map((item: any, idx: number) => (
                <PrefDataText gLen={groupLen} btnState={btnState} key={idx}>
                    <a style={{ cursor: 'pointer' }}
                        href={`/ws/${wsId}/test_result/${item?.obj_id || item}`}
                        target="_blank"
                    >
                        {item?.obj_id || item ? <IconLink style={{ width: 9, height: 9 }} /> : <></>}
                    </a>
                </PrefDataText>
            ))
        )
    }
    
    // suite遍历
    const RenderSuite = () => {
        return (
            <>
                {
                    Array.isArray(perData.list) && !!perData.list.length ? perData.list.map((suite: any, id: number) => (
                        <TestSuite key={id}>
                            <SuiteName>
                                {suite.suite_name}
                                <Popconfirm
                                    title='确认要删除吗！'
                                    onConfirm={() => handleDelete('suite', suite, id)}
                                    cancelText="取消"
                                    okText="删除"
                                >
                                    {btnState && <CloseBtn />}
                                </Popconfirm>
                                <ChartTypeChild btn={btn} isReport={true} obj={perData} suiteId={suite.suite_id} setPerData={setPerData} />
                            </SuiteName>
                            <TestConfWarpper>
                                {!domainResult.is_default &&
                                    <Configuration>
                                        {domainResult.perf_conf.need_test_suite_description &&
                                            <SigleWrapper>
                                                <TestTitle>测试工具</TestTitle>
                                                <TestContent>
                                                    <CodeViewer code={suite.tool || suite.test_suite_description} />
                                                </TestContent>
                                            </SigleWrapper>
                                        }
                                        {domainResult.perf_conf.need_test_env &&
                                            <SigleWrapper>
                                                <TestTitle>测试环境</TestTitle>
                                                <TestContent>
                                                    <PerfTextArea
                                                        name={suite.test_env}
                                                        field="test_env"
                                                        suite={suite}
                                                        dataSource={dataSource}
                                                        setDataSource={setDataSource}
                                                        btn={btnState}
                                                    />
                                                </TestContent>
                                            </SigleWrapper>
                                        }
                                        {domainResult.perf_conf.need_test_description &&
                                            <SigleWrapper>
                                                <TestTitle>测试说明</TestTitle>
                                                <TestContent>
                                                    <PerfTextArea
                                                        name={suite.test_description}
                                                        field="test_description"
                                                        suite={suite}
                                                        dataSource={dataSource}
                                                        setDataSource={setDataSource}
                                                        btn={btnState}
                                                    />
                                                </TestContent>
                                            </SigleWrapper>
                                        }
                                        {domainResult.perf_conf.need_test_conclusion &&
                                            <SigleWrapper>
                                                <TestTitle>测试结论</TestTitle>
                                                <TestContent>
                                                    <PerfTextArea
                                                        name={suite.test_conclusion}
                                                        field="test_conclusion"
                                                        suite={suite}
                                                        dataSource={dataSource}
                                                        setDataSource={setDataSource}
                                                        btn={btnState}
                                                    />
                                                </TestContent>
                                            </SigleWrapper>
                                        }
                                    </Configuration>
                                }
                                {
                                    btn ?
                                        (suite.conf_list && !!suite.conf_list.length) ? suite.conf_list.map((conf: any, cid: number) => (
                                            !!conf.metric_list.length &&
                                            <div key={cid}>
                                                <TestConf>
                                                    <ConfTitle gLen={groupLen} style={{ marginLeft: btnState ? 39 : 0 }}>Test Conf / 指标 </ConfTitle>
                                                    {
                                                        allGroupData?.map((cont: any, i: number) => (
                                                            <ConfData gLen={groupLen} key={i} btnState={btnState}>
                                                                {
                                                                    i !== baselineGroupIndex ?
                                                                        <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'space-between' }}>
                                                                            <span style={{ display: 'inline-block', color: 'rgba(0,0,0,0.45)' }}>{cont.tag}</span>
                                                                            <RightResult>
                                                                                对比结果/跟踪结果
                                                                                <span onClick={() => handleArrow(suite, i)} style={{ margin: '0 5px 0 3px', verticalAlign: 'middle', cursor: 'pointer' }}>
                                                                                    {arrowStyle == suite.suite_id && num == i ? <IconArrowBlue /> : <IconArrow />}
                                                                                </span>
                                                                                <Tooltip color="#fff" overlayStyle={{ minWidth: 350 }}
                                                                                    title={
                                                                                        <span style={{ color: 'rgba(0,0,0,0.65)' }}>性能测试与BaseGroup差值比例越大差异化越大。<br />规则如下：<br />下降&gt;上升&gt;波动不大&gt;无效</span>
                                                                                    }>
                                                                                    <QuestionCircleOutlined />
                                                                                </Tooltip>
                                                                            </RightResult>
                                                                        </div>
                                                                        : <Typography.Text style={{ color: 'rgba(0,0,0,0.45)' }}>{cont.tag}</Typography.Text>
                                                                }
                                                            </ConfData>
                                                        ))
                                                    }
                                                </TestConf>
                                                <div style={{ border: '1px solid rgba(0,0,0,0.10)' }}>
                                                    <PrefData>
                                                        <DelBtn conf={conf} cid={cid} />
                                                        <PrefDataTitle gLen={groupLen}><EllipsisPulic title={conf.conf_name} /></PrefDataTitle>
                                                        {renderShare(conf)}
                                                    </PrefData>
                                                    {
                                                        conf.metric_list.map((metric: any, idx: number) => (
                                                            <PrefMetric key={idx}>
                                                                <DelBtn conf={conf} cid={cid} />
                                                                <MetricTitle gLen={groupLen}>
                                                                    <Row justify="space-between">
                                                                        <Col span={16} >
                                                                            <Row justify="start">
                                                                                <EllipsisPulic
                                                                                    title={`${metric.metric}${metric.unit ? '(' + metric.unit + ')' : ''}`}
                                                                                // width={210}
                                                                                >
                                                                                    <Typography.Text style={{ color: 'rgba(0,0,0,0.65)' }} >
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
                                                                        <MetricText gLen={groupLen} btnState={btnState} key={i}>
                                                                            <Row justify="space-between">
                                                                                <Col span={item && item.compare_result ? 12 : 20}>
                                                                                    <Row justify="start">
                                                                                        <EllipsisPulic
                                                                                            title={conversion(item)}
                                                                                            width={210}
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
                                                        ))
                                                    }
                                                </div>
                                            </div> 
                                        )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                        :
                                        <ChartsIndex {...suite} envData={environmentResult} base_index={baseIndex}/>
                                }
                            </TestConfWarpper>
                        </TestSuite >
                    )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
            </>
        )
    }

    return (
        <div key={id}>
            <TestGroupItem id={`perf_item-${id}`} className="tree_mark" isGroup={name === 'group'} >
                <TestItemIcon style={{ marginLeft: 12, verticalAlign: 'middle' }} />
                <TestItemText>
                    <GroupItemText
                        name={perData.name}
                        rowKey={perData.rowKey}
                        btn={btnState}
                        dataSource={dataSource}
                        setDataSource={setDataSource}
                    />
                </TestItemText>
                <Popconfirm
                    title='确认要删除吗！'
                    onConfirm={() => onDelete(name, perData.name, perData.rowKey)}
                    cancelText="取消"
                    okText="删除"
                >
                    {btnState && <CloseBtn />}
                </Popconfirm>
                {!btnState && <ItemFunc />}
            </TestGroupItem>
            {JSON.stringify(perData) !== '{}' && RenderSuite()}
        </div>
    )
}
export default memo(Performance);