import React, { useState, useEffect, memo, useRef, useMemo, useCallback } from 'react';
import { Col, Button, message, Spin } from 'antd';
import { ReactComponent as IconLink } from '@/assets/svg/icon_link.svg'
import { history, Access, useAccess } from 'umi';
import { useScroll } from 'ahooks';
import { UpOutlined } from '@ant-design/icons';
import SaveReport from '@/pages/WorkSpace/TestReport/components/SaveReport';
import { queryForm, compareForm } from './service';
import { queryCompareResultList, queryEenvironmentResultList } from '../AnalysisCompare/services';
import TestEnv from './components/TestEnv';
import PerformanceTest from './components/PerformanceTest';
import FunctionalTest from './components/FunctionalTest';
import { ReportContext } from './Provider';
import Clipboard from 'clipboard';
import _ from 'lodash';
import { MyLoading, AnalysisWarpper, ResultTitle, TypographyText, ResultContent, ModuleWrapper, SubTitle } from './AnalysisUI';
import { useClientSize } from '@/utils/hooks';

const Report = (props: any) => {
    const { ws_id, form_id } = props.match.params
    const local = props.history.location
    // const id = local.query.form_id
    const access = useAccess();
    const testDataRef = useRef(null)
    const [testDataParam, setTestDataParam] = useState<any>({})
    const [paramEenvironment, setParamEenvironment] = useState({})
    const [allGroupData, setAllGroupData] = useState([])
    const [baselineGroupIndex, setBaselineGroupIndex] = useState(0)
    const [environmentResult, setEnvironmentResult] = useState<any>({})
    const [envData, setEnvData] = useState<Array<{}>>([])
    const [suiteLen, setSuiteLen] = useState(1)
    const [shareId, setShareId] = useState<Number>(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    // const windowHeight = () => setLayoutHeight(innerHeight)
    const saveReportDraw: any = useRef(null)

    const scrollDom = document.querySelector('.ant-layout-has-sider .ant-layout')
    const { top } = useScroll(scrollDom as any)
    const group = allGroupData?.length

    const { height: layoutHeight } = useClientSize()
    // 请求对比数据
    const queryCompareForm = async () => {
        const data = await queryForm({ form_id })
        if (data.code == 200) {
            const shareData = JSON.parse(data.data.req_form)
            setTestDataParam(shareData.testDataParam)
            setParamEenvironment(shareData.envDataParam)
            setAllGroupData(shareData.allGroupData)
            setBaselineGroupIndex(shareData.baselineGroupIndex)
        }
    }

    useEffect(() => {
        if (form_id) {
            queryCompareForm()
        } else {
            if (local.state && JSON.stringify(local.state) !== '{}') {
                setTestDataParam(local.state.testDataParam)
                setParamEenvironment(local.state.envDataParam)
                setAllGroupData(local.state.allGroupData)
                setBaselineGroupIndex(local.state.baselineGroupIndex)
            }
        }
    }, [form_id, local])

    const backTop = () => (document.querySelector('.ant-layout-has-sider .ant-layout') as any).scrollTop = 0

    const [compareResult, setCompareResult] = useState<any>({
        func_data_result: [],
        perf_data_result: []
    })

    const queryCompareResultFn = async (paramData: any) => {
        const result = await queryCompareResultList(paramData)
        return result
    }

    const handleData = async () => {
        // setLoading(true)
        const res = await queryEenvironmentResultList(paramEenvironment)
        if (res.code == 200) {
            setEnvironmentResult(res.data)
        }
        if (res.code === 1358) {
            message.error('请添加对比组数据')
            return
        }
        if (res.code !== 200) {
            message.error(res.msg)
        }

        const { perf_suite_dic, func_suite_dic } = testDataParam
        let perfArr: any = []
        let funcArr: any = []
        if (perf_suite_dic && JSON.stringify(perf_suite_dic) !== '{}') {
            Object.keys(perf_suite_dic).map((key: any) => {
                perfArr.push({
                    async_request: '1',
                    suite_id: key,
                    suite_info: perf_suite_dic[key]
                })
            })
        }
        if (func_suite_dic && JSON.stringify(func_suite_dic) !== '{}') {
            Object.keys(func_suite_dic).map((key: any) => {
                funcArr.push({
                    async_request: '1',
                    suite_id: key,
                    suite_info: func_suite_dic[key]
                })
            })
        }

        let resLen: any = perfArr.length > funcArr.length ? perfArr : funcArr
        setSuiteLen(resLen.length)
        resLen.map((item: any, i: number) => queryCompareResultFn({ func_suite_dic: funcArr[i], perf_suite_dic: perfArr[i] })
            .then(res => {
                if (res.data.func_data_result) {
                    compareResult.func_data_result = compareResult.func_data_result.concat(res.data.func_data_result)
                }
                if (res.data.perf_data_result) {
                    compareResult.perf_data_result = compareResult.perf_data_result.concat(res.data.perf_data_result)
                }
                setCompareResult({
                    ...compareResult
                })
                if (res.code !== 200) {
                    message.error(res.msg)
                    return
                }
            })
        )
        // setLoading(false)
    }

    const compareLen = useMemo(() => {
        const { func_data_result, perf_data_result } = compareResult
        let perf = perf_data_result.length
        let func = func_data_result.length
        return func > perf ? func : perf
    }, [compareResult])

    useEffect(() => {
        if (JSON.stringify(testDataParam) !== '{}' && JSON.stringify(paramEenvironment) !== '{}') {
            handleData()
        }
    }, [testDataParam, paramEenvironment])

    const handleReportId = async() => {
        let form_data: any = {
            allGroupData,
            baselineGroupIndex,
            testDataParam,
            envDataParam: paramEenvironment
        }
        const { data } =  await compareForm({ form_data })
        setShareId(data)
    }

    useEffect(()=> {
        handleReportId()
    },[])
    
    const handleShare = useCallback(
         () => {
            if(shareId){
                const clipboard = new Clipboard('.test_result_copy_link', {
                    text: function (trigger) {
                        return location.origin + `/share/analysis_result/${shareId}`
                    }
                });
               
                clipboard.on('success', function (e: any) {
                    message.success('复制分享链接成功')
                    e.clearSelection();
                });
                
                (document.querySelector('.test_result_copy_link') as any).click()
                clipboard.destroy()
            }
        }, [allGroupData, shareId]
    )
    
    const handleCreatReportOk = () => { // suiteData：已选的
        saveReportDraw.current?.show({})
    }

    const creatReportCallback = (reportData: any) => { // suiteData：已选的
        history.push({
            pathname: `/ws/${ws_id}/test_create_report`,
            state: {
                wsId: ws_id,
                environmentResult,
                baselineGroupIndex,
                allGroupData,
                compareResult: _.cloneDeep(compareResult),
                compareGroupData: local.state.compareGroupData,
                domainGroupResult: local.state.domainGroupResult,
                saveReportData: reportData
            }
        })
    }

    const slidingLeft = (e:any) => {
        const scrollWidth =  e.srcElement.scrollLeft || 0;
            setScrollLeft(scrollWidth)
    }
        useEffect(()=>{
        window.addEventListener('scroll',slidingLeft,true)
        return () => {
            window.removeEventListener('scroll',slidingLeft,true)
        }
    },[])

    useEffect(() => {
        if (JSON.stringify(environmentResult) !== '{}') {
            const deep = _.cloneDeep(environmentResult)
            if (!!environmentResult.compare_groups.length) deep.base_group.is_base = true
            let compare = deep.compare_groups
            let base = deep.base_group
            compare.splice(baselineGroupIndex, 0, base)
            setEnvData(compare)
        }
    }, [environmentResult])

    return (
        <ReportContext.Provider
            value={{
                allGroupData,
                baselineGroupIndex,
                environmentResult,
                compareResult,
                envData,
                ws_id,
                group,
            }}
        >
            <div
                style={{
                    width: '100%',
                    minHeight: layoutHeight - 50,
                    position: 'relative',
                    overflow: 'auto',
                    background: "#f5f5f5"
                }}
            >
                {
                    compareLen !== suiteLen && <MyLoading>
                        <span className="my-loading-span">
                            <i></i>
                            <i></i>
                            <i></i>
                            <i></i>
                        </span>
                    </MyLoading>
                }
                <AnalysisWarpper style={{ width: group > 3 ? group * 390 : 1200 }}>
                    <Col span={24}>
                        <ResultTitle style={{ maxWidth : document.body.clientWidth - 40 + scrollLeft }}>
                            <TypographyText>对比分析结果</TypographyText>
                            <span className="btn">
                                <span className="test_result_copy_link"></span>
                                { !form_id && <span onClick={handleShare} style={{ cursor: 'pointer' }} >
                                        <IconLink style={{ marginRight: 5 }} />分享
                                    </span>
                                }
                                <Access accessible={access.IsWsSetting()}>
                                    {!form_id && <Button type="primary" onClick={handleCreatReportOk} style={{ marginLeft: 8 }}>生成报告</Button>}
                                </Access>
                            </span>
                        </ResultTitle>
                        <ResultContent >
                            {
                                (environmentResult && JSON.stringify(environmentResult) !== '{}') &&
                                <TestEnv />
                            }
                            <ModuleWrapper style={{ position: 'relative' }} id="test_data" ref={testDataRef}>
                                <SubTitle><span className="line"></span>测试数据</SubTitle>
                                <PerformanceTest parentDom={testDataRef} scrollLeft={scrollLeft}/>
                                <FunctionalTest scrollLeft={scrollLeft}/>
                            </ModuleWrapper>
                        </ResultContent>
                    </Col>
                </AnalysisWarpper>
                {
                    top > 600 &&
                    <div
                        style={{ width: 44, height: 44, borderRadius: 2, backgroundColor: 'rgb(0, 0, 0, 0.1)', position: 'fixed', bottom: 10, right: 20 }}
                        onClick={backTop}
                    >
                        <UpOutlined style={{ fontSize: 30, padding: 7, color: 'rgb(0, 0, 0, 0.7)' }} />
                    </div>
                }
                <SaveReport
                    ref={saveReportDraw}
                    onOk={creatReportCallback}
                    ws_id={ws_id}
                    allGroup={allGroupData}
                />
            </div>
        </ReportContext.Provider>
    )
}
export default memo(Report);
