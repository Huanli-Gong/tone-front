import React, { useState, useEffect, memo, useRef, useMemo, useCallback } from 'react';
import { Col, Button, message, Spin } from 'antd';
import { ReactComponent as IconLink } from '@/assets/svg/icon_link.svg'
import { history, Access, useAccess, useIntl, FormattedMessage, useParams } from 'umi';
import { useScroll } from 'ahooks';
import { UpOutlined } from '@ant-design/icons';
import SaveReport from '@/pages/WorkSpace/TestReport/components/SaveReport';
import { queryForm, compareForm } from './service';
import { queryCompareResultList, queryEenvironmentResultList } from '../AnalysisCompare/services';
import TestEnv from './components/TestEnv';
import PerformanceTest from './components/PerformanceTest';
import FunctionalTest from './components/FunctionalTest';
import { ReportContext } from './Provider';
import { fillData } from '@/pages/WorkSpace/TestAnalysis/AnalysisCompare/CommonMethod'
import _ from 'lodash';
import { MyLoading, AnalysisWarpper, ResultTitle, TypographyText, ResultContent, ModuleWrapper, SubTitle } from './AnalysisUI';
import { useClientSize, useCopyText } from '@/utils/hooks';
import { requestCodeMessage } from '@/utils/utils';

const Report = (props: any) => {
    const { formatMessage } = useIntl()
    const { ws_id, form_id } = useParams() as any
    const local = props.history.location
    const access = useAccess();
    const testDataRef = useRef(null)
    const [testDataParam, setTestDataParam] = useState<any>({})
    const [paramEenvironment, setParamEenvironment] = useState({})
    const [domainGroupResult, setDomainGroupResult] = useState({})
    const [compareGroupData, setCompareGroupData] = useState({})
    const [allGroupData, setAllGroupData] = useState([])
    const [baselineGroupIndex, setBaselineGroupIndex] = useState(0)
    const [environmentResult, setEnvironmentResult] = useState<any>({})
    const [envData, setEnvData] = useState<Array<{}>>([])
    const [shareWsId, setShareWsId] = useState(undefined)
    const [suiteLen, setSuiteLen] = useState(1)
    const [scrollLeft, setScrollLeft] = useState(0)
    const saveReportDraw: any = useRef(null)

    const [shareId, setShareId] = React.useState(undefined)
    const [fetching, setFetching] = React.useState(false)

    const scrollDom = document.querySelector('.ant-layout-has-sider .ant-layout')
    const { top } = useScroll(scrollDom as any)

    const { height: layoutHeight } = useClientSize()
    // 请求对比数据
    const queryCompareForm = async () => {
        const data = await queryForm({ form_id })
        if (data.code == 200) {
            if (!data?.data) return
            setTestDataParam(data?.data.testDataParam)
            setParamEenvironment(data?.data.envDataParam)
            setAllGroupData(data?.data.allGroupData)
            setBaselineGroupIndex(data?.data.baselineGroupIndex)
            setShareWsId(data?.data.allGroupData[0]?.members[0]?.ws_id)
        } else if (data.code === 500) {
            history.push(`/500?page=${location.href}`)
        } else {
            requestCodeMessage(data.code, data.msg)
        }
    }

    useEffect(() => {
        if (form_id) {
            queryCompareForm()
        } else {
            if (local.state && JSON.stringify(local.state) !== '{}') {
                setTestDataParam(local.state.testDataParam)
                setParamEenvironment(local.state.envDataParam)
                setCompareGroupData(local.state.compareGroupData)
                setAllGroupData(local.state.allGroupData)
                setBaselineGroupIndex(local.state.baselineGroupIndex)
                setDomainGroupResult(local.state.domainGroupResult)
            }
        }
    }, [form_id, local])

    const group = allGroupData?.length

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
            message.error(formatMessage({ id: 'analysis.please.add.comparison.group' }))
            return
        }
        if (res.code !== 200) {
            message.error(res.msg)
        }
        const { perf_suite_dic, func_suite_dic } = testDataParam
        let perfArr: any = []
        let funcArr: any = []
        if (perf_suite_dic && JSON.stringify(perf_suite_dic) !== '{}') {
            perfArr = fillData(perf_suite_dic)
        }
        if (func_suite_dic && JSON.stringify(func_suite_dic) !== '{}') {
            funcArr = fillData(func_suite_dic)
        }
        let resLen: any = []
        resLen = perfArr.concat(funcArr)
        setSuiteLen(resLen.length)
        resLen.map((item: any, i: number) => queryCompareResultFn(item)
            .then(res => {
                if (res.code === 200) {
                    if (JSON.stringify(res.data) !== '{}' && res.data.test_type === 'functional') {
                        compareResult.func_data_result = compareResult.func_data_result.concat(res.data)
                    }
                    if (JSON.stringify(res.data) !== '{}' && res.data.test_type === 'performance') {
                        compareResult.perf_data_result = compareResult.perf_data_result.concat(res.data)
                    }

                }
                setCompareResult({
                    ...compareResult
                })
                if (res.code === 500) {
                    history.push(`/500?page=${location.href}`)
                    return
                }
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
        return perf + func
    }, [compareResult])

    useEffect(() => {
        if (JSON.stringify(testDataParam) !== '{}' && JSON.stringify(paramEenvironment) !== '{}') {
            handleData()
        }
    }, [testDataParam, paramEenvironment])

    const handleReportId = async () => {
        const arr = allGroupData.map((item: any) => {
            let members = item.members.map((i: any) => i.id)
            return {
                ...item,
                members
            }
        })
        const form_data: any = {
            allGroupData: arr,
            baselineGroupIndex,
            testDataParam,
            envDataParam: paramEenvironment
        }
        const { data, code, msg } = await compareForm({ form_data })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        return data
    }

    const copyText = useCopyText(formatMessage({ id: 'analysis.copy.sharing.link.succeeded' }))

    const handleShare = async () => {
        if (fetching) return
        let id = shareId
        if (!id) {
            setFetching(true)
            id = await handleReportId()
            setFetching(false)
        }

        setShareId(id)
        copyText(location.origin + `/share/analysis_result/${id}`)
    }

    const handleCreatReportOk = () => { // suiteData：已选的
        saveReportDraw.current?.show({})
    }
    const creatReportCallback = (reportData: any) => { // suiteData：已选的
        history.push({
            pathname: `/ws/${ws_id}/test_create_report`,
            state: {
                environmentResult,
                baselineGroupIndex,
                allGroupData,
                testDataParam: _.cloneDeep(testDataParam),
                compareResult: _.cloneDeep(compareResult),
                compareGroupData,
                domainGroupResult,
                saveReportData: reportData
            }
        })
    }

    const slidingLeft = (e: any) => {
        const scrollWidth = e.srcElement.scrollLeft || 0;
        setScrollLeft(scrollWidth)
    }
    useEffect(() => {
        window.addEventListener('scroll', slidingLeft, true)
        return () => {
            window.removeEventListener('scroll', slidingLeft, true)
        }
    }, [])

    useEffect(() => {
        if (JSON.stringify(environmentResult) !== '{}') {
            const deep = _.cloneDeep(environmentResult)
            if (deep.base_group) deep.base_group.is_group = true
            let compare = deep.compare_groups
            let base = deep.base_group
            compare.splice(baselineGroupIndex, 0, base)
            setEnvData(compare)
        }
    }, [environmentResult.compare_groups])

    return (
        <ReportContext.Provider
            value={{
                allGroupData,
                baselineGroupIndex,
                environmentResult,
                compareResult,
                envData,
                group,
                wsId: ws_id || shareWsId
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
                        <ResultTitle style={{ maxWidth: document.body.clientWidth - 40 + scrollLeft }}>
                            <TypographyText><FormattedMessage id="analysis.comparison.result" /></TypographyText>
                            <span className="btn">
                                <span className="test_result_copy_link"></span>
                                {
                                    !form_id &&
                                    <span onClick={handleShare} style={{ cursor: 'pointer' }} >
                                        <IconLink style={{ marginRight: 5 }} /><FormattedMessage id="operation.share" />
                                    </span>
                                }
                                <Access accessible={access.IsWsSetting()}>
                                    {
                                        !form_id &&
                                        <Button
                                            type="primary"
                                            loading={compareLen !== suiteLen}
                                            onClick={handleCreatReportOk}
                                            style={{ marginLeft: 8 }}
                                        >
                                            <FormattedMessage id="analysis.create.report" />
                                        </Button>
                                    }
                                </Access>
                            </span>
                        </ResultTitle>

                        <ResultContent >
                            {
                                (environmentResult && JSON.stringify(environmentResult) !== '{}') &&
                                <TestEnv />
                            }
                            <ModuleWrapper style={{ position: 'relative' }} id="test_data" ref={testDataRef}>
                                <SubTitle><span className="line"></span><FormattedMessage id="analysis.test.data" /></SubTitle>
                                <PerformanceTest parentDom={testDataRef} scrollLeft={scrollLeft} />
                                <FunctionalTest scrollLeft={scrollLeft} />
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
                    allGroup={allGroupData}
                />
            </div>
        </ReportContext.Provider>
    )
}
export default memo(Report);
