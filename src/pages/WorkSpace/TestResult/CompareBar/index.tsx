import React, { useState, useEffect, useRef } from 'react';
import { Space, Popconfirm, Button,message, Popover } from 'antd';
import { history, Access, useAccess } from 'umi'
import _ from 'lodash'
import styles from './index.less'
import { Scrollbars } from 'react-custom-scrollbars';
import { CloseOutlined, RightOutlined } from '@ant-design/icons'
import SaveReport from '@/pages/WorkSpace/TestReport/components/SaveReport'
import { querySuiteList,queryCompareResultList, queryEenvironmentResultList, queryDomainGroup } from '../services'
import {handleCompareOk,getJobRefSuit} from '@/pages/WorkSpace/TestAnalysis/AnalysisCompare/CommonMethod'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { requestCodeMessage } from '@/utils/utils';

export default (props: any) => {
    const {selectedChange, wsId, setIsloading, allSelectRowData} = props
    const access = useAccess()
    const scrollbarsRef:any = useRef(null)
    const [padding, setPadding] = useState(false)
    const [firstRowData, setFirstRowData] = useState([])
    const [secondRowData, setSecondRowData] = useState([])
    const [suitData, setSuitData] = useState<any>({}) // 全量数据
    const saveReportDraw: any = useRef(null)
    const onResizeWidth = () => {
        const oli = document.querySelector('#job_group li')
        const box: any = document.getElementById('job_group')
        if (oli && box) {
            const liWidth = oli.clientWidth + 1
            const width = box.clientWidth
            if (liWidth > width) setPadding(true)
        }
    }

    useEffect(() => {
        window.addEventListener('resize', onResizeWidth)
        return () => {
            window.removeEventListener('resize', onResizeWidth)
        }
    }, [])
    useEffect(() => {
        onResizeWidth()
    },[allSelectRowData])
    const handleCancle = () =>{
        selectedChange()
    }
    const handleNext = (path:string) =>{
        if(path === 'test_report/report') return
        history.push({
            pathname: `/ws/${wsId}/${path}`,
            state: {
                compareData: JSON.stringify([]),
                noGroupJobData: JSON.stringify(allSelectRowData),
                originType: 'test_result',
            }
        })
    }
 
    const handleDelete = (obj:any) => {
        selectedChange(obj,false)
    }


   const getScrollLeftVal = () => {
        if (scrollbarsRef.current){
           const scrollTop = scrollbarsRef.current.getScrollLeft();
            return scrollTop
        }
    }
    const handleScroll = () => {
        const box:any = document.getElementById('job_group')
        const width = box.clientWidth
        if (scrollbarsRef.current) {
            const scrollTop = getScrollLeftVal()
            scrollbarsRef.current.scrollLeft(scrollTop + width - 325)
        }
    }
    // 滚动条参数
    const scroll = {
        // 如果最终结果表格内容与表格头部无法对齐。
        // 表格头需要增加空白列，弹性布局
        width: '100%',

    }
    useEffect(() => {
        const first: any = []
        const second: any = []
        allSelectRowData.forEach((obj: any, num: number) => {
            if (num % 2 === 0) first.push(obj)
            if (num % 2 === 1) second.push(obj)
        })
        setFirstRowData(first)
        setSecondRowData(second)
    }, [allSelectRowData])
    const getSuitDetail = async (params: any) => {
        let { data, code, msg } = await querySuiteList(params)
        if (code === 200) {
            setSuitData(data)
        }else {
            requestCodeMessage( code , msg )
        }
    }
    const handleSaveReportScript = () => {
        const paramData:any = {
            func_data: {
                base_obj_li: [],
                compare_groups: []
            },
            perf_data: {
                base_obj_li: [],
                compare_groups: []
            },
            group_num: 1
        }
        if (_.isArray(allSelectRowData)) {
            allSelectRowData.forEach((item: any) => {
                if (item.test_type === '功能测试') {
                    paramData.func_data.base_obj_li.push({ is_job: 1, obj_id: item.id })
                }
                if (item.test_type === '性能测试') {
                    paramData.perf_data.base_obj_li.push({ is_job: 1, obj_id: item.id })
                }
                if (item.test_type === 'functional') {
                    paramData.func_data.base_obj_li.push({ is_job: 0, obj_id: item.id,baseline_type: 'func' })
                }
                if (item.test_type === 'performance') {
                    paramData.perf_data.base_obj_li.push({ is_job: 0, obj_id: item.id,baseline_type: 'perf' })
                }
            })
        }
        getSuitDetail(paramData)
        saveReportDraw.current?.show(allSelectRowData)
    }
    const queryDomainGroupFn = async (paramData: any) => {
        const result = await queryDomainGroup(paramData)
        return result

    }
    const queryCompareResultFn = async (paramData: any) => {
        const result = await queryCompareResultList(paramData)
        return result

    }
    const queryEenvironmentResultFn = async (paramData: any) => {
        const result = await queryEenvironmentResultList(paramData)
        return result

    }
    const getBaselineGroup = () => {
        const version = allSelectRowData.length ? allSelectRowData[0].product_version : 'Group1'
        const baselineGroup = {
            id: +new Date(),
            members: allSelectRowData,
            name: 'Group1',
            product_version: version,
            type: 'job'
        }
        return baselineGroup
    }
    const handlEenvironment = (selData:any) => {
        const {obj:baseObj} = getJobRefSuit(selData)
        const compare_groups:[] = []
        const baselineGroup = getBaselineGroup()
        const brr: any = []
        let baseMembers = _.get(baselineGroup, 'members')
        baseMembers = _.isArray(baseMembers) ? baseMembers : []
        baseMembers = baseMembers.filter((val: any) => val)

        const flag = baselineGroup.type === 'baseline'
        baseMembers.forEach((item: any) => {
            if (!flag) {
                brr.push({ is_job: 1, obj_id: item.id, suite_data: baseObj[item.id] || {}})
            }
            if (flag) {
                brr.push({ is_job: 0, obj_id: item.id, baseline_type: item.test_type === 'functional' ? 'func' : 'perf', suite_data: baseObj[item.id] || {}})
            }
        })
        const base_group = {
            tag: baselineGroup.product_version,
            base_objs: brr,
        }

        const paramData = {
            base_group,
            compare_groups
        }
        return paramData
        // const generObj = queryCompareResultFn(paramData)
        // const excuteResult: any = generObj.next();
        // excuteResult.value.then((result: any) => {
        //     const { code, msg } = result;
        //     defaultOption(code, msg);
        // })
    }
    const creatReportCallback = (reportData:any) => { 
        setIsloading(true)
        // suitData：已选的
        const confIdArr:any = handleCompareOk(suitData).confIdArr
        const paramCompare:any = handleCompareOk(suitData).paramData
        const paramEenvironment = handlEenvironment(suitData)
        Promise.all([queryCompareResultFn(paramCompare), queryEenvironmentResultFn(paramEenvironment),queryDomainGroupFn(confIdArr)])
            .then((result: any) => {
                setIsloading(false)
                if (_.get(result[0],'code') === 200 && _.get(result[1],'code') === 200 && _.get(result[2],'code')=== 200) {
                    history.push({
                        pathname: `/ws/${wsId}/test_create_report`,
                        state: {
                            wsId: wsId,
                            environmentResult: result[1].data,
                            baselineGroupIndex: 0,
                            allGroupData: [getBaselineGroup()],
                            compareResult: result[0].data,
                            compareGroupData: paramEenvironment.compare_groups,
                            domainGroupResult: result[2].data,
                            saveReportData: reportData
                        }
                    })
                    return
                }
                if (result[1].code === 1358) {
                    message.error('请添加对比组数据')
                    return
                }
                if (result[0].code !== 200) {
                    message.error(result[0].msg)
                    return
                }
                if (result[1].code !== 200) {
                    message.error(result[1].msg)
                }
            })
            .catch((e) => {
                setIsloading(false)
                message.error('请求失败')
                console.log(e)
            })
    }
    const getDisabled = () => {
        let disabled = false
        if (_.isArray(allSelectRowData)) {
            const versionArr = _.reduce(allSelectRowData, (arr: any, item: any) => {
                const version = _.get(item, 'product_version')
                const id = _.get(item, 'product_id')
                arr.push({product_version: version, product_id: id })
                return arr
            }, [])
            disabled =  _.uniqWith(versionArr, _.isEqual).length > 1 // 产品版本 + 产品id来判断唯一性
        }
        return disabled
    }
    
    return (
        <div className={styles.job_compare} style={{ display: allSelectRowData.length ? 'block' : 'none' }}>
            <div className={styles.title}>对比栏<span>（{allSelectRowData.length}）</span>  <Popover
                        content={
                            <div>
                                {"合并规则：取所有Job的并集数据；"}
                                <div>{"如果有重复的，排序靠前的Job优先。"}</div>
                            </div>
                        }
                        placement="right"
                    >
                        <QuestionCircleOutlined
                            className={styles.question_icon}
                        />
                    </Popover></div>
            <div className={styles.job_group} id='job_group'>
                <Scrollbars style={scroll} ref={scrollbarsRef}>
                    <ul id='box'>
                        <li>
                            <div className={styles.job_item}>
                                {
                                    firstRowData.map((obj: any) => {
                                        return (
                                            <Popconfirm title="你确定要删除吗" okText="删除" cancelText="取消" onConfirm={_.partial(handleDelete, obj)} placement="topLeft">
                                                <span className={styles.job_item_span}><span>{obj.id}</span><CloseOutlined className={styles.delete} /></span>
                                            </Popconfirm>
                                        )
                                    })
                                }
                            </div>
                            <div className={styles.job_item}>
                                {
                                    secondRowData.map((obj: any) => {
                                        return (
                                            <Popconfirm title="你确定要删除吗" okText="删除" cancelText="取消" onConfirm={_.partial(handleDelete, obj)} placement="topLeft">
                                                <span className={styles.job_item_span}>{obj.id}<CloseOutlined className={styles.delete} /></span>
                                            </Popconfirm>
                                        )
                                    })
                                }
                            </div>
                        </li>
                    </ul>
                </Scrollbars>
                <div className={styles.operate}>
                    <Space>
                        <RightOutlined onClick={handleScroll} style={{ opacity: padding ? 1 : 0, marginLeft: 16, marginRight: 8 }} />
                        <Button onClick={handleCancle}>取消</Button>
                        <Access accessible={access.testerAccess()}>
                            <Button type="primary" onClick={_.partial(handleSaveReportScript)} disabled={getDisabled()}>生成报告</Button>
                        </Access>
                        <Button type="primary" onClick={_.partial(handleNext,'test_analysis/compare')}>对比分析</Button>
                    </Space>
                </div>
                <SaveReport ref={saveReportDraw} onOk={creatReportCallback} ws_id = {wsId} allGroup = {[getBaselineGroup()]}/>
            </div>
        </div>
    )
}
