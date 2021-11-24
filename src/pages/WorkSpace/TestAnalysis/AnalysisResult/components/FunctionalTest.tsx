import React, { useContext, memo, useMemo, useState, useEffect } from 'react';
import { Empty, Row, Col, Typography, Space, Button, Select } from 'antd';
import { ReportContext } from '../Provider';
import { ReactComponent as IconLink } from '@/assets/svg/Report/IconLink.svg';
import { ReactComponent as IconArrow } from '@/assets/svg/icon_arrow.svg';
import { ReactComponent as IconArrowBlue } from '@/assets/svg/icon_arrow_blue.svg';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { DiffTootip } from '@/pages/WorkSpace/TestAnalysis/AnalysisResult/components/DiffTootip';
import { toShowNum, handleCaseColor } from '@/components/AnalysisMethods/index';
import { targetJump } from '@/utils/utils'
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

const ReportTestFunc: React.FC<any> = () => {
    const { allGroupData, compareResult, baselineGroupIndex, ws_id, group } = useContext(ReportContext)
    const { func_data_result } = compareResult
    const [arrowStyle, setArrowStyle] = useState('')
    const [btnName, setBtnName] = useState<string>('')
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
        let subCaseList = _.cloneDeep(sub_case_list)
        return (
            <>
                {
                    expand && subCaseList?.map((item: any, idx: number) => {
                        item.compare_data.splice(baseIndex, 0, item.result)
                        const len = Array.from(Array(allGroupData.length - item.compare_data.length)).map(val => ({}))
                        len.forEach((i) => item.compare_data.push('-'))
                        return (
                            <TestSubCase key={idx}>
                                <SubCaseTitle gLen={group}>
                                    <Typography.Text><EllipsisPulic title={item.sub_case_name} /></Typography.Text>
                                </SubCaseTitle>
                                {
                                    !!item.compare_data.length ?
                                        item.compare_data.map((cur: any, id: number) => {
                                            return (
                                                <SubCaseText gLen={group} key={id}>
                                                    <Typography.Text style={{ color: handleCaseColor(cur) }}>{cur || '-'}</Typography.Text>
                                                </SubCaseText>
                                            )
                                        })
                                        :
                                        <SubCaseText gLen={group} >
                                            <Typography.Text style={{ color: handleCaseColor(item.result) }}>{item.result || '-'}</Typography.Text>
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
        setDataSource(dataSource.map((item:any)=>{
            if(item.suite_id == conf.suite_id){
                return {
                    ...item,
                    conf_list
                }
            }
            return item
        }))
    }

    const baseIndex = useMemo(()=>{
        if(baselineGroupIndex === -1) return 0
        return baselineGroupIndex
    },[ baselineGroupIndex ])
   
    const OpenSubCase = () => {
        setBtn(!btn)
    }
    useEffect(() => {
        setBtnName(btn ? '收起所有' : '展开所有')
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
                    let sub_case_list = conf.sub_case_list.filter((i: any) => i.result == value)
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
                    <Button onClick={OpenSubCase}>{btnName}</Button>
                    <Space>
                        <Typography.Text>筛选: </Typography.Text>
                        <Select defaultValue="All" style={{ width: 200 }} value={filterName} onSelect={handleConditions}>
                            <Option value="All">全部</Option>
                            <Option value="Pass">成功</Option>
                            <Option value="Fail">失败</Option>
                            <Option value="Skip">跳过</Option>
                        </Select>
                    </Space>
                </Space>
            </TestItemFunc>
        )
    }
    return (
        <>
            <Row>
                <Col span={12}>
                    <TestDataTitle id="func_item">功能测试</TestDataTitle>
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
                                <div key={idx}>
                                    <TestSuite>
                                        <SuiteName>{item.suite_name}</SuiteName>
                                        <TestConf>
                                            <ConfTitle gLen={group} >Conf</ConfTitle>
                                            {
                                                allGroupData?.map((cont: any, i: number) => (
                                                    <ConfData gLen={group} key={i}>
                                                        <Row>
                                                            <Col span={12}>
                                                                总计/通过/失败
                                                            </Col>
                                                            {
                                                                i !== baseIndex && <Col span={12} style={{ textAlign: 'right', paddingRight: 10 }}>
                                                                    对比结果
                                                                    <span onClick={() => handleArrow(item, i)} style={{ margin: '0 5px 0 3px', verticalAlign: 'middle' }}>
                                                                        {arrowStyle == item.suite_id && num == i ? <IconArrowBlue /> : <IconArrow title="差异化排序" />}
                                                                    </span>
                                                                    <DiffTootip />
                                                                </Col>
                                                            }
                                                        </Row>
                                                    </ConfData>
                                                ))
                                            }
                                        </TestConf>
                                        <TestConfWarpper>
                                            {
                                                (item.conf_list && item.conf_list.length) ? item.conf_list.map((conf: any, cid: number) => {
                                                    const expand = expandKeys.includes(conf.conf_id)
                                                    const { all_case, success_case, fail_case, obj_id } = conf.conf_source || conf
                                                    let conf_data = conf.conf_compare_data || conf.compare_conf_list
                                                    let metricList: any = []
                                                    for (let i = 0; i < allGroupData.length; i++) {
                                                        if (i === baseIndex)
                                                            metricList.push({
                                                                all_case,
                                                                success_case,
                                                                fail_case,
                                                                obj_id,
                                                            })
                                                        !!conf_data.length ?
                                                            conf_data?.forEach((item: any, idx: number) => {
                                                                if (item !== null) {
                                                                    const { all_case, success_case, fail_case, obj_id } = item || item.conf_source
                                                                    idx === i && metricList.push({
                                                                        all_case,
                                                                        success_case,
                                                                        fail_case,
                                                                        obj_id
                                                                    })
                                                                } else {
                                                                    idx === i && metricList.push({
                                                                        all_case: '-',
                                                                        success_case: '-',
                                                                        fail_case: '-'
                                                                    })
                                                                }
                                                            })
                                                            :
                                                            (allGroupData.length > 1) && (i - 1) && metricList.push({
                                                                all_case: '-',
                                                                success_case: '-',
                                                                fail_case: '-'
                                                            })
                                                    }
                                                    return (
                                                        <div key={cid}>
                                                            <TestCase expand={expand}>
                                                                <CaseTitle gLen={group}>
                                                                    <EllipsisPulic title={conf.conf_name}>
                                                                        <ExpandIcon
                                                                            rotate={expand ? 90 : 0}
                                                                            onClick={() => hanldeExpand(conf.conf_id)}
                                                                        />
                                                                        <Typography.Text>{conf.conf_name}</Typography.Text>
                                                                    </EllipsisPulic>
                                                                </CaseTitle>
                                                                {
                                                                    metricList?.map((item: any, idx: number) => (
                                                                            <CaseText gLen={group} key={idx}>
                                                                                <Space size={16}>
                                                                                    <Typography.Text style={{ color: '#649FF6' }}>{toShowNum(item.all_case)}</Typography.Text>
                                                                                    <Typography.Text style={{ color: '#81BF84' }}>{toShowNum(item.success_case)}</Typography.Text>
                                                                                    <Typography.Text style={{ color: '#C84C5A' }}>{toShowNum(item.fail_case)}</Typography.Text>
                                                                                </Space>
                                                                                {item !== null &&
                                                                                    <span style={{ cursor: 'pointer', paddingLeft: 10 }} onClick={() => targetJump(`/ws/${ws_id}/test_result/${item.obj_id}`)}>
                                                                                        {item.obj_id ? <IconLink style={{ width: 9, height: 9 }} /> : <></>}
                                                                                    </span>
                                                                                }
                                                                            </CaseText>
                                                                        )
                                                                    )
                                                                }
                                                            </TestCase>
                                                            <ExpandSubcases
                                                                {...conf}
                                                            />
                                                        </div>
                                                    )
                                                }) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                            }
                                        </TestConfWarpper>
                                    </TestSuite>
                                </div>
                            )
                        })
                        :
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
            </TestWrapper>
        </>
    )
}
export default memo(ReportTestFunc);