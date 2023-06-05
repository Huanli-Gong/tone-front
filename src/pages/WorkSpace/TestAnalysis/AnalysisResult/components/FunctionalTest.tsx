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

import React, { useContext, memo, useMemo, useState, useEffect } from 'react';
import { Empty, Row, Col, Typography, Space, Button, Select } from 'antd';
import { ReportContext } from '../Provider';
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg';
import { ReactComponent as IconArrowBlue } from '@/assets/svg/icon_arrow_blue.svg';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { DiffTootip } from '@/pages/WorkSpace/TestAnalysis/AnalysisResult/components/DiffTootip';
import { toShowNum, handleCaseColor } from '@/components/AnalysisMethods/index';
import { JumpResult } from '@/utils/hooks';
import { useIntl, FormattedMessage } from 'umi'
const { Option } = Select
import {
    TestDataTitle,
    TestWrapper,
    TestSuite,
    TestItemFunc,
    SuiteName,
    TestConf,
    ConfTitle,
    ConfData,
    TestConfWarpper,
    TestCase,
    CaseTitle,
    TestSubCase,
    SubCaseTitle,
    CaseText,
    SubCaseText,
    ExpandIcon,
} from '../AnalysisUI';
import _ from 'lodash';

const ReportTestFunc: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const { allGroupData, compareResult, baselineGroupIndex, group, wsId, containerScroll } = useContext(ReportContext)
    const { scrollLeft } = props
    const { func_data_result } = compareResult
    const [arrowStyle, setArrowStyle] = useState('')
    const [num, setNum] = useState(0)
    const [btn, setBtn] = useState<boolean>(false)
    const [filterName, setFilterName] = useState('All')
    const [expandKeys, setExpandKeys] = useState<any>([])
    const [dataSource, setDataSource] = useState<any>([])

    useEffect(() => {
        if (Array.isArray(func_data_result) && !!func_data_result.length) {
            setDataSource(func_data_result)
        }
    }, [func_data_result])

    // 单个展开
    const ExpandSubcases = (props: any) => {
        const { sub_case_list, conf_id } = props
        const expand = expandKeys.includes(conf_id)
        return (
            <>
                {
                    expand && sub_case_list?.map((item: any, idx: number) => {
                        /* slice(0, group) */
                        /* const len = Array.from(Array(allGroupData.length - item.compare_data.length)).map(val => ({}))
                        console.log(len)
                        len.forEach((i) => item.compare_data.push('-')) */
                        return (
                            <TestSubCase key={idx}>
                                <SubCaseTitle gLen={group}>
                                    <Typography.Text><EllipsisPulic title={item.sub_case_name} /></Typography.Text>
                                </SubCaseTitle>
                                {
                                    !!item.compare_data.length ?
                                        item.compare_data?.slice(0, group)?.map((cur: any, id: number) => {
                                            return (
                                                <SubCaseText gLen={group} key={id}>
                                                    <Typography.Text style={{ color: handleCaseColor(cur) }}>{cur || '-'}</Typography.Text>
                                                </SubCaseText>
                                            )
                                        })
                                        :
                                        <SubCaseText gLen={group} >
                                            <Typography.Text>-</Typography.Text>
                                        </SubCaseText>
                                }
                            </TestSubCase>
                        )
                    })
                }
            </>
        )
    }

    const hanldeExpand = (id: any) => {
        const expand = expandKeys.includes(id)
        if (expand)
            setExpandKeys(expandKeys.filter((i: any) => i !== id))
        else
            setExpandKeys(expandKeys.concat(id))
    }

    // 差异化排序
    const handleArrow = (conf: any, i: any) => {
        console.log("func test handleArrow")
        setNum(i)
        setArrowStyle(conf.suite_id)
        let pre: any = []
        for (let x = 0; x < 5; x++) pre.push([])
        let num = i > baseIndex ? i - 1 : i
        const conf_list = conf.conf_list.map((item: any) => {
            item.sub_case_list.forEach((element: any) => {
                if (element.result === 'Pass' && element.compare_data[num] === 'Fail') {
                    pre[0].push(element)
                } else if (element.result === 'Fail' && element.compare_data[num] === 'Pass') {
                    pre[1].push(element)
                } else if (element.result === 'Fail' && element.compare_data[num] === 'Fail') {
                    pre[2].push(element)
                } else if (element.result === 'Pass' && element.compare_data[num] === 'Pass') {
                    pre[3].push(element)
                } else {
                    pre[4].push(element)
                }
            });
            return {
                ...item,
                sub_case_list: [].concat(...pre)
            }
        })
        setDataSource(dataSource.map((item: any) => {
            if (item.suite_id == conf.suite_id) {
                return {
                    ...item,
                    conf_list
                }
            }
            return item
        }))
    }

    const baseIndex = useMemo(() => {
        if (baselineGroupIndex === -1) return 0
        return baselineGroupIndex
    }, [baselineGroupIndex])

    const OpenSubCase = () => {
        setBtn(!btn)
    }
    useEffect(() => {
        setExpandKeys([])
        setExpandKeys(
            btn ?
                dataSource.reduce(
                    (p: any, c: any) => p.concat(c.conf_list.map((item: any) => item.conf_id))
                    , [])
                :
                []
        )
    }, [btn])

    // 筛选操作
    const handleConditions = (value: any) => {
        setFilterName(value)
        let data = _.cloneDeep(func_data_result)
        let newData: any = []
        if (value == 'All') {
            setDataSource(data)
        } else {
            data.map((item: any) => {
                let conf_list: any = []
                item.conf_list.map((conf: any) => {
                    let sub_case_list = conf.sub_case_list.filter((i: any) => i.compare_data.includes(value))
                    conf_list.push({
                        ...conf,
                        sub_case_list
                    })
                })
                newData.push({
                    ...item,
                    conf_list
                })
            })
            setDataSource(newData)
        }
    }
    // 右侧功能按钮
    const ItemFunc: React.FC<any> = () => {
        return (
            <TestItemFunc>
                <Space>
                    <Button onClick={OpenSubCase}><FormattedMessage id={btn ? 'analysis.folded.all' : 'analysis.expand.all'} /></Button>
                    <Space>
                        <Typography.Text><FormattedMessage id="analysis.filter" />: </Typography.Text>
                        <Select defaultValue="All" style={{ width: 200 }} value={filterName} onSelect={handleConditions}>
                            <Option value="All"><FormattedMessage id="analysis.all" /></Option>
                            <Option value="Pass"><FormattedMessage id="analysis.pass" /></Option>
                            <Option value="Fail"><FormattedMessage id="analysis.fail" /></Option>
                            <Option value="Skip"><FormattedMessage id="analysis.skip" /></Option>
                        </Select>
                    </Space>
                </Space>
            </TestItemFunc>
        )
    }

    return (
        <>
            <Row style={{ maxWidth: document.body.clientWidth - 40 + scrollLeft }}>
                <Col span={12}>
                    <TestDataTitle id="func_item"><FormattedMessage id="functional.test" /></TestDataTitle>
                </Col>
                <Col span={12}>
                    <ItemFunc />
                </Col>
            </Row>
            <TestWrapper>
                {
                    !!dataSource.length ?
                        dataSource.map((item: any, idx: number) => {
                            return (
                                <React.Fragment key={idx}>
                                    <TestSuite>
                                        <SuiteName style={{ textIndent: containerScroll?.left }}>{item.suite_name}</SuiteName>
                                        <TestConf>
                                            {(item.conf_list && item.conf_list.length) ?
                                                <>
                                                    <ConfTitle gLen={group}>Conf</ConfTitle>
                                                    {allGroupData?.map((cont: any, i: number) => (
                                                        <ConfData gLen={group} key={i}>
                                                            <Row>
                                                                <Col span={12}>
                                                                    <FormattedMessage id="analysis.total/pass/fail" />
                                                                </Col>
                                                                {
                                                                    i !== baseIndex && <Col span={12} style={{ textAlign: 'right', paddingRight: 10 }}>
                                                                        <FormattedMessage id="analysis.comparison.results" />
                                                                        <span onClick={() => handleArrow(item, i)} style={{ margin: '0 5px 0 3px', verticalAlign: 'middle', cursor: 'pointer' }}>
                                                                            {arrowStyle == item.suite_id && num == i ?
                                                                                <IconArrowBlue /> : <IconArrow title={formatMessage({ id: 'analysis.differentiated.sorting' })} />}
                                                                        </span>
                                                                        <DiffTootip />
                                                                    </Col>
                                                                }
                                                            </Row>
                                                        </ConfData>
                                                    ))
                                                    }
                                                </> : null
                                            }
                                        </TestConf>
                                        <TestConfWarpper>
                                            {(item.conf_list && item.conf_list.length) ?
                                                item.conf_list?.map((conf: any, cid: number) => {
                                                    const expand = expandKeys.includes(conf.conf_id)
                                                    let conf_data = conf.conf_compare_data || conf.compare_conf_list
                                                    return (
                                                        <React.Fragment key={cid}>
                                                            <TestCase expand={expand}>
                                                                <CaseTitle gLen={group}>
                                                                    <EllipsisPulic title={conf.conf_name}>
                                                                        <ExpandIcon
                                                                            rotate={expand ? 90 : 0}
                                                                            onClick={() => hanldeExpand(conf.conf_id)}
                                                                        />
                                                                        <Typography.Text style={{ marginLeft: '12px' }}>{conf.conf_name}</Typography.Text>
                                                                    </EllipsisPulic>
                                                                </CaseTitle>
                                                                {
                                                                    conf_data?.slice(0, group)?.map((metric: any, idx: number) => (
                                                                        <CaseText gLen={group} key={idx}>
                                                                            <Space size={16}>
                                                                                <Typography.Text style={{ color: '#649FF6' }}>{toShowNum(metric.all_case)}</Typography.Text>
                                                                                <Typography.Text style={{ color: '#81BF84' }}>{toShowNum(metric.success_case)}</Typography.Text>
                                                                                <Typography.Text style={{ color: '#C84C5A' }}>{toShowNum(metric.fail_case)}</Typography.Text>
                                                                                {
                                                                                    metric && !metric.is_baseline ?
                                                                                        <JumpResult ws_id={wsId} job_id={metric.obj_id} style={{ paddingLeft: 10 }} /> :
                                                                                        <></>
                                                                                }
                                                                            </Space>
                                                                        </CaseText>
                                                                    ))
                                                                }
                                                            </TestCase>
                                                            <ExpandSubcases
                                                                {...conf}
                                                            />
                                                        </React.Fragment>
                                                    )
                                                })
                                                :
                                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                            }
                                        </TestConfWarpper>
                                    </TestSuite>
                                </React.Fragment>
                            )
                        }) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
            </TestWrapper>
        </>
    )
}
export default memo(ReportTestFunc);