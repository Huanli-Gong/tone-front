import React, { useState, useEffect, memo, useRef, useCallback } from 'react';
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
import { AnalysisWarpper, ResultTitle, TypographyText, ResultContent, ModuleWrapper, SubTitle } from './AnalysisUI';

const Report = (props: any) => {
    const { ws_id } = props.match.params
    const access = useAccess();
    const local = props.history.location
    const form_search = window.location.search
    const id = local.query.form_id
    const testDataRef = useRef(null)
    const [testDataParam, setTestDataParam] = useState<any>({})
    const [paramEenvironment, setParamEenvironment] = useState({})
    const [allGroupData, setAllGroupData] = useState([])
    const [baselineGroupIndex, setBaselineGroupIndex] = useState(0)
    const [envData, setEnvData] = useState<Array<{}>>([])
    const [layoutHeight, setLayoutHeight] = useState(innerHeight)
    const [loading, setLoading] = useState(true)
    const windowHeight = () => setLayoutHeight(innerHeight)

    const scrollDom = document.querySelector('.ant-layout-has-sider .ant-layout')
    const { top } = useScroll(scrollDom as any)
    const group = allGroupData?.length

    useEffect(() => {
        window.addEventListener('resize', windowHeight)
        return () => {
            window.removeEventListener('resize', windowHeight)
        }
    }, [])
    // 请求对比数据
    const queryCompareForm = async () => {
        const data = await queryForm({ form_id: id })
        if (data.code == 200) {
            const shareData = JSON.parse(data.data.req_form)
            setTestDataParam(shareData.testDataParam)
            setParamEenvironment(shareData.envDataParam)
            setAllGroupData(shareData.allGroupData)
            setBaselineGroupIndex(shareData.baselineGroupIndex)
        }
    }

    useEffect(() => {
        if (id && JSON.stringify(id) !== '{}') {
            queryCompareForm()
        } else {
            if (local.state && JSON.stringify(local.state) !== '{}') {
                setTestDataParam(local.state.testDataParam)
                setParamEenvironment(local.state.envDataParam)
                setAllGroupData(local.state.allGroupData)
                setBaselineGroupIndex(local.state.baselineGroupIndex)
            }
        }
    }, [id,local])

    const backTop = () => (document.querySelector('.ant-layout-has-sider .ant-layout') as any).scrollTop = 0

    const [compareResult, setCompareResult] = useState<any>({})
    const [environmentResult, setEnvironmentResult] = useState<any>({})
    const queryCompareResultFn = async (paramData: any) => {
        const result = await queryCompareResultList(paramData)
        return result
    }
    const handleData = async() => {
        setLoading(true)
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
        let resLen:any = perfArr.length > funcArr.length  ? perfArr : funcArr
        let obj = {
            func_data_result:[],
            perf_data_result:[]
        }
        resLen.map(( item : any, i : number ) => queryCompareResultFn({ func_suite_dic:funcArr[i], perf_suite_dic:perfArr[i] })
            .then(res => {
                if(res.data.func_data_result ){
                    obj.func_data_result = obj.func_data_result.concat(res.data.func_data_result)
                }

                if(res.data.perf_data_result ){
                    obj.perf_data_result = obj.perf_data_result.concat(res.data.perf_data_result)
                }

                if (res.code == 200) {
                    setCompareResult(obj)
                    setLoading(false)
                }

                if (res.code !== 200) {
                    message.error(res.msg)
                    return
                }

            })
            .catch((e) => {
                setLoading(false)
                message.error('请求失败')
                console.log(e)
            }))
        const res = await queryEenvironmentResultList(paramEenvironment)
        if (res.code == 200) {
            setEnvironmentResult(res.data)
            setLoading(false)
        }
        if (res.code === 1358) {
            message.error('请添加对比组数据')
            return
        }
        if (res.code !== 200) {
            message.error(res.msg)
        }
    }
    useEffect(() => {
        if (JSON.stringify(testDataParam) !== '{}' && JSON.stringify(paramEenvironment) !== '{}') {
            handleData()
        }
    }, [testDataParam, paramEenvironment])


    const handleShare = useCallback(
        async () => {
            let form_data: any = {
                allGroupData,
                baselineGroupIndex,
                testDataParam,
                envDataParam: paramEenvironment
            }
            const data = await compareForm({ form_data })
            // setFormId(data.data)

            const clipboard = new Clipboard('.test_result_copy_link', {
                text: function (trigger) {
                    return `${location.href}/?form_id=${data.data}`;
                }
            });

            clipboard.on('success', function (e: any) {
                message.success('复制成功')
                e.clearSelection();
            });

            (document.querySelector('.test_result_copy_link') as any).click()
            clipboard.destroy()
        }, [allGroupData, baselineGroupIndex]
    )
    const saveReportDraw: any = useRef(null)
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
            <Spin spinning={loading}>
                <div
                    style={{
                        width: '100%',
                        height: layoutHeight - 50,
                        position: 'relative'
                    }}
                >
                    <AnalysisWarpper style={{ width: group > 4 ? group * 300 : 1200 }}>
                        <Col span={24}>
                            <ResultTitle>
                                <TypographyText>对比分析结果</TypographyText>
                                <span className="btn">
                                    {
                                        form_search == '' ?
                                            <>
                                                <span className="test_result_copy_link"></span>
                                                <span onClick={handleShare} style={{ cursor: 'pointer' }} ><IconLink style={{ marginRight: 5 }} />分享</span>
                                            </>
                                            :
                                            <span className="copy_link" style={{ cursor: 'pointer' }}><IconLink style={{ marginRight: 5 }} />分享</span>
                                    }
                                    <Access accessible={access.wsRoleContrl()}>
                                        {form_search == '' && <Button type="primary" onClick={handleCreatReportOk} style={{ marginLeft: 8 }}>生成报告</Button>}
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
                                    {
                                        JSON.stringify(compareResult.perf_data_result) !== '{}' &&
                                        <PerformanceTest
                                            parentDom={testDataRef}
                                        />
                                    }
                                    {
                                        JSON.stringify(compareResult.func_data_result) !== '{}' &&
                                        <FunctionalTest />
                                    }
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
            </Spin>
        </ReportContext.Provider>
    )
}
export default memo(Report);