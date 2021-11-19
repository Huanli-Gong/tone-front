import React, { useState, useEffect, memo, useRef, useCallback } from 'react';
import { Col, Button, message, Spin } from 'antd';
import { ReactComponent as IconLink } from '@/assets/svg/icon_link.svg'
import TestEnv from './components/TestEnv';
// import { resizeClientSize } from '@/utils/hooks'
import { history, Access, useAccess } from 'umi';
// import { writeDocumentTitle } from '@/utils/hooks';
import { queryForm, compareForm } from './service';
import { UpOutlined } from '@ant-design/icons';
import SaveReport from '@/pages/WorkSpace/TestReport/components/SaveReport';
import { queryCompareResultList, queryEenvironmentResultList } from '../AnalysisCompare/services';
import PerformanceTest from './components/PerformanceTest';
import FunctionalTest from './components/FunctionalTest';
// import dataSouce from './JSON.js';
import { ReportContext } from './Provider';
import Clipboard from 'clipboard';
import _ from 'lodash';
import { AnalysisWarpper, ResultTitle, TypographyText, ResultContent, ModuleWrapper, SubTitle } from './AnalysisUI';
// import { CreatePageData, EditPageData } from './hooks';

import { useScroll } from 'ahooks'

const Report = (props: any) => {
    const { ws_id } = props.match.params
    const access = useAccess();
    const local = props.history.location
    const id = local.query.form_id
    const [testDataParam, setTestDataParam] = useState({})
    const [paramEenvironment, setParamEenvironment] = useState({})
    const [allGroupData, setAllGroupData] = useState([])
    const [baselineGroupIndex, setBaselineGroupIndex] = useState(0)
    const [envData, setEnvData] = useState<Array<{}>>([])
    const [layoutHeight, setLayoutHeight] = useState(innerHeight)
    const [loading, setLoading] = useState(true)
    const windowHeight = () => setLayoutHeight(innerHeight)

    const scrollDom = document.querySelector('.ant-layout-has-sider .ant-layout')
    const { top } = useScroll(scrollDom as any)

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
        if (JSON.stringify(id) !== '{}' && id !== undefined) {
            queryCompareForm()
        } else {
            if (local.state && JSON.stringify(local.state) !== '{}') {
                setTestDataParam(local.state.testDataParam)
                setParamEenvironment(local.state.envDataParam)
                setAllGroupData(local.state.allGroupData)
                setBaselineGroupIndex(local.state.baselineGroupIndex)
            }
        }
    }, [id])

    const backTop = () => (document.querySelector('.ant-layout-has-sider .ant-layout') as any).scrollTop = 0

    const [compareResult, setCompareResult] = useState<any>({})
    const [environmentResult, setEnvironmentResult] = useState<any>({})

    const queryCompareResultFn = async (paramData: any) => {
        const result = await queryCompareResultList(paramData)
        return result
    }
    const queryEenvironmentResultFn = async (paramData: any) => {
        const result = await queryEenvironmentResultList(paramData)
        return result
    }
    const handleData = () => {
        setLoading(true)
        Promise.all([queryCompareResultFn(testDataParam), queryEenvironmentResultFn(paramEenvironment)])
            .then(res => {
                if (res[0].code == 200 && res[1].code == 200) {
                    console.log(res)
                    setCompareResult(res[0].data)
                    setEnvironmentResult(res[1].data)
                    setLoading(false)
                }
                if (res[1].code === 1358) {
                    message.error('请添加对比组数据')
                    return
                }
                if (res[0].code !== 200) {
                    message.error(res[0].msg)
                    return
                }
                if (res[1].code !== 200) {
                    message.error(res[1].msg)
                }
            })
            .catch((e) => {
                setLoading(false)
                message.error('请求失败')
                console.log(e)
            })
    }
    useEffect(() => {
        if (JSON.stringify(testDataParam) !== '{}' && JSON.stringify(paramEenvironment) !== '{}') {
            handleData()
        }
    }, [testDataParam, paramEenvironment])
    //writeDocumentTitle(`Workspace.${props.route.name}`)
    //window.document.title = saveReportData.name || 'T-one'
    const form_search = window.location.search
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

    // console.log(compareResult)
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

    const testDataRef = useRef(null)

    let group = allGroupData?.length
    return (
        <ReportContext.Provider
            value={{
                allGroupData,
                baselineGroupIndex,
                environmentResult,
                compareResult,
                envData,
                ws_id,
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
                    <AnalysisWarpper style={{ width: group > 4 ? group * 300 : 1180 }}>
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
                                        { form_search == '' && <Button type="primary" onClick={handleCreatReportOk} style={{ marginLeft: 8 }}>生成报告</Button>}
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
                                    {/* { JSON.stringify(data) !== '{}' && <PerformanceTest scrollbarsRef={scrollbarsRef}/> } */}
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