/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useContext, useEffect, useState, memo, useMemo, useRef } from 'react';
import { useIntl, FormattedMessage, getLocale, useLocation, useParams } from 'umi';
import { ReportContext } from '../../Provider';
import { Typography, Space, Select, Popconfirm, Tooltip, Empty, Row, Col } from 'antd';
import { PerfTextArea, GroupItemText } from '../EditPerfText';
// import { ReactComponent as IconLink } from '@/assets/svg/Report/IconLink.svg';
import { ReactComponent as DelDefault } from '@/assets/svg/Report/delDefault.svg';
import { ReactComponent as DelHover } from '@/assets/svg/Report/delHover.svg';
import { ReactComponent as TestItemIcon } from '@/assets/svg/Report/TestItem.svg';
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg';
import { ReactComponent as IconArrowBlue } from '@/assets/svg/icon_arrow_blue.svg';
// import CodeViewer from '@/components/CodeViewer';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { reportDelete, handleDataArr } from '../ReportFunction';
import { filterResult } from '@/components/Report/index'
// import ChartsIndex from '../../../../AnalysisResult/components/ChartIndex';
import ChartsIndex from '../PerfCharts';
import ChartTypeChild from './ChartTypeChild'
import { QuestionCircleOutlined } from '@ant-design/icons';
import { JumpResult } from '@/utils/hooks';
import lodash from 'lodash';
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
import { getCompareType } from '@/utils/utils';
import { useScroll } from 'ahooks';
const { Option } = Select;

const getSortNum = (compare_result: string) => new Map([
    ["decline", 0],
    ["increase", 1],
    ["normal", 2],
    ["invalid", 3],
    ["na", 4],
]).get(compare_result) || 5

const compare = ($props: any) => {
    return function (a: any, b: any) {
        return a[$props] - b[$props]
    }
}

const Performance = (props: any) => {
    const { formatMessage } = useIntl()
    const sortRef = useRef<any>();
    const { share_id } = useParams() as any
    const { pathname } = useLocation()
    const { child, name, btn, id, onDelete, dataSource, setDataSource } = props
    const { btnState, allGroupData, baselineGroupIndex, domainResult, environmentResult, groupLen, wsId, isOldReport } = useContext(ReportContext)
    const isEditPage = !!~pathname?.indexOf('/edit')

    const [filterName, setFilterName] = useState('all')
    const [perData, setPerData] = useState<any>({})
    const [sortKeys, setSortKeys] = React.useState<any>([])
    const baseIndex = useMemo(() => {
        if (baselineGroupIndex === -1) return 0
        return baselineGroupIndex
    }, [baselineGroupIndex])

    useEffect(() => {
        const data = isOldReport ? handleDataArr(lodash.cloneDeep(child), baseIndex) : child
        btn ? setPerData(data) : setPerData({
            ...child, list: child.list?.map((item: any) => {
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
        let dataSource = isOldReport ? handleDataArr(lodash.cloneDeep(child), baseIndex) : lodash.cloneDeep(child)
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
                    conf_list
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
                title={<FormattedMessage id="delete.prompt" />}
                onConfirm={() => handleDelete('conf', conf, cid)}
                cancelText={<FormattedMessage id="operation.cancel" />}
                okText={<FormattedMessage id="operation.delete" />}
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
        setDataSource(reportDelete(dataSource, name, row, rowKey))
    }

    // 右侧功能按钮
    const ItemFunc: React.FC<any> = () => {
        const enLocale = getLocale() === 'en-US'
        return (
            <TestItemFunc>
                <Space>
                    {
                        btn &&
                        <Space>
                            <Typography.Text><FormattedMessage id="report.filter" />: </Typography.Text>
                            <Select
                                defaultValue="all"
                                style={{ width: enLocale ? 336 : 200 }}
                                value={filterName}
                                onSelect={handleConditions}
                                getPopupContainer={node => node.parentNode}
                            >
                                <Option value="all"><FormattedMessage id="report.all.s" /></Option>
                                <Option value="invalid"><FormattedMessage id="report.invalid" /></Option>
                                <Option value="volatility" title={formatMessage({ id: 'report.volatility' })}><FormattedMessage id="report.volatility" /></Option>
                                <Option value="increase"><FormattedMessage id="report.increase" /></Option>
                                <Option value="decline"><FormattedMessage id="report.decline" /></Option>
                                <Option value="normal"><FormattedMessage id="report.normal" /></Option>
                            </Select>
                        </Space>
                    }
                </Space>
            </TestItemFunc>
        )
    }
    // 差异化排序
    const handleArrow = (suite: any, conf: any, i: number) => {
        sortRef.current = i

        let arr: any[] = []
        setSortKeys(arr.concat(conf.conf_id))

        const newConf = {
            ...conf,
            metric_list: conf.metric_list?.reduce((pre: any, metric: any) => {
                return pre.concat({
                    ...metric,
                    sortNum: getSortNum(metric.compare_data[i]?.compare_result)
                })
            }, []).sort(compare('sortNum'))
        }

        setPerData((p: any) => ({
            ...p,
            list: p.list.map((y: any) => {
                if (y.suite_id === suite.suite_id) {
                    return {
                        ...suite,
                        conf_list: suite.conf_list.map((x: any) => {
                            if (x.conf_id === conf.conf_id) return newConf
                            return x
                        })
                    }
                }
                return y
            })
        }))
    }

    const renderShare = (conf: any) => {
        let objList: any = []
        let objConf = conf?.conf_source || conf
        allGroupData?.map((c: any, i: number) => {
            objList.push((conf.conf_compare_data || conf.compare_conf_list)[i])
        })
        objList.splice(baseIndex, 0, objConf)
        let obj = conf.conf_compare_data || conf.compare_conf_list
        let arr = isOldReport ? objList : obj

        return (
            arr.map((item: any, idx: number) => {
                if (!item) return <></>
                return (
                    <PrefDataText gLen={groupLen} btnState={btnState} key={item?.obj_id}>
                        {
                            !share_id && !getCompareType(item) ?
                                <JumpResult ws_id={wsId} job_id={item?.obj_id || item} /> :
                                <div style={{ height: 38 }} />
                        }
                    </PrefDataText>
                )
            })
        )
    }

    const { containerRef } = useContext(ReportContext)
    const containerScroll = useScroll(containerRef)

    // suite遍历
    const RenderSuite = () => {
        return (
            Array.isArray(perData.list) && !!perData.list.length ? perData.list.map((suite: any, id: number) => (
                <TestSuite key={suite.suite_id}>
                    <SuiteName>
                        <Typography.Text style={{ display: "inline-block", textIndent: containerScroll?.left > 50 ? containerScroll?.left - 50 : 0 }}>
                            {suite.suite_name}
                        </Typography.Text>
                        {
                            btnState &&
                            <Popconfirm
                                title={<FormattedMessage id="delete.prompt" />}
                                onConfirm={() => handleDelete('suite', suite, id)}
                                cancelText={<FormattedMessage id="operation.cancel" />}
                                okText={<FormattedMessage id="operation.delete" />}
                            >
                                <CloseBtn />
                            </Popconfirm>
                        }
                        <ChartTypeChild btn={btn} isReport={true} obj={perData} suiteId={suite.suite_id} setPerData={setPerData} />
                    </SuiteName>
                    <TestConfWarpper>
                        {!domainResult.is_default &&
                            <Configuration>
                                {
                                    [
                                        ["need_test_env", "test_env", "env"],
                                        ["need_test_description", "test_description", "description"],
                                        ["need_test_conclusion", "test_conclusion", "conclusion"],
                                    ].map(($item: any) => {
                                        const [$var, name, $locale] = $item
                                        if (!domainResult.perf_conf) return
                                        if (!domainResult.perf_conf[$var]) return
                                        if (!isEditPage && !suite[name]) return
                                        return (
                                            <SigleWrapper
                                                key={$var}
                                            >
                                                <TestTitle>
                                                    <FormattedMessage id={`report.test.${$locale}`} />
                                                </TestTitle>
                                                <TestContent>
                                                    {/* need_test_description  need_test_conclusion edit button*/}
                                                    <PerfTextArea
                                                        name={suite[name]}
                                                        field={name}
                                                        suite={suite}
                                                        creator={domainResult?.creator}
                                                    />
                                                </TestContent>
                                            </SigleWrapper>
                                        )
                                    })
                                }
                            </Configuration>
                        }
                        {
                            btn ?
                                (suite.conf_list && !!suite.conf_list.length) ?
                                    suite.conf_list.map((conf: any, cid: number) => (
                                        <div key={conf?.conf_id}>
                                            <TestConf>
                                                <ConfTitle gLen={groupLen} style={{ marginLeft: btnState ? 39 : 0 }}><FormattedMessage id="report.conf/metric" /></ConfTitle>
                                                {
                                                    allGroupData?.map((cont: any, i: number) => (
                                                        <ConfData gLen={groupLen} key={cont?.tag} btnState={btnState}>
                                                            {
                                                                i !== baselineGroupIndex ?
                                                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                                                                        <EllipsisPulic title={cont.product_version || cont.tag}>
                                                                            <Typography.Text
                                                                                style={{ color: 'rgba(0,0,0,0.45)' }}
                                                                            >
                                                                                {cont.product_version || cont.tag}
                                                                            </Typography.Text>
                                                                        </EllipsisPulic>
                                                                        <RightResult>
                                                                            <FormattedMessage id="report.comparison/tracking.results" />
                                                                            <span onClick={() => handleArrow(suite, conf, i)} style={{ margin: '0 5px 0 3px', verticalAlign: 'middle', cursor: "pointer" }}>
                                                                                {sortKeys.includes(conf.conf_id) && sortRef.current === i ? <IconArrowBlue /> : <IconArrow />}
                                                                            </span>
                                                                            <Tooltip color="#fff" overlayStyle={{ minWidth: 350 }}
                                                                                title={
                                                                                    <span style={{ color: 'rgba(0,0,0,0.65)' }}>
                                                                                        <FormattedMessage id="report.performance.test.and.baseGroup" /><br />
                                                                                        <FormattedMessage id="report.rules.as.follows" />：<br />
                                                                                        <FormattedMessage id="report.decline" />&gt;<FormattedMessage id="report.increase" />&gt;<FormattedMessage id="report.little.fluctuation" />&gt;<FormattedMessage id="report.invalid" />
                                                                                    </span>
                                                                                }>
                                                                                <QuestionCircleOutlined />
                                                                            </Tooltip>
                                                                        </RightResult>
                                                                    </div>
                                                                    :
                                                                    <EllipsisPulic title={cont.product_version || cont.tag}>
                                                                        <Typography.Text style={{ color: 'rgba(0,0,0,0.45)' }}>{cont.product_version || cont.tag}</Typography.Text>
                                                                    </EllipsisPulic>

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
                                                        <PrefMetric key={metric.metric}>
                                                            <DelBtn conf={conf} cid={cid} />
                                                            {/* <DelBtnEmpty conf={conf} cid={cid} /> */}
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
                                                                            <RightResult>
                                                                                ({`${toPercentage(metric.cv_threshold)}/${toPercentage(metric.cmp_threshold)}`})
                                                                            </RightResult>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>
                                                            </MetricTitle>
                                                            {
                                                                Array.isArray(metric.compare_data) && !!metric.compare_data.length &&
                                                                metric.compare_data?.slice(0, groupLen).map((item: any, i: number) => (
                                                                    <MetricText gLen={groupLen} btnState={btnState} key={i}>
                                                                        <Row justify="space-between">
                                                                            <Col span={item && item.compare_result ? 12 : 20}>
                                                                                <Row justify="start">
                                                                                    <EllipsisPulic
                                                                                        title={!item || JSON.stringify(item) === '{}' ? '-' : `${item.test_value}±${item.cv_value}`}
                                                                                        width={210}
                                                                                    >
                                                                                        <Typography.Text style={{ color: 'rgba(0,0,0,0.65)' }}>
                                                                                            {
                                                                                                !item || JSON.stringify(item) === '{}'
                                                                                                    ? '-'
                                                                                                    : item.test_value && `${item.test_value}±${item.cv_value}`
                                                                                            }
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
                                <ChartsIndex {...suite} envData={environmentResult} base_index={baselineGroupIndex} />
                        }
                    </TestConfWarpper>
                </TestSuite >
            )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )
    }

    return (
        <div >
            <TestGroupItem id={`perf_item-${id}`} className="position_mark" isGroup={name === 'group'} >
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
                    title={<FormattedMessage id="delete.prompt" />}
                    onConfirm={() => onDelete(name, perData.name, perData.rowKey)}
                    cancelText={<FormattedMessage id="operation.cancel" />}
                    okText={<FormattedMessage id="operation.delete" />}
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


/* 
    if (result?.compare_result == 'decline') {
        metric.sortNum = 0
    } else if (result?.compare_result == 'increase') {
        metric.sortNum = 1
    } else if (result?.compare_result == 'normal') {
        metric.sortNum = 2
    } else if (result?.compare_result == 'invalid') {
        metric.sortNum = 3
    } else if (result?.compare_result == 'na') {
        metric.sortNum = 4
    } else {
        metric.sortNum = 5
    }
*/