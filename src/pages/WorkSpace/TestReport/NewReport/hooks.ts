/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from 'react'
import { detailTemplate, reportDetail } from '../services';
import { message } from 'antd';
import { redirectErrorPage, requestCodeMessage } from '@/utils/utils';
import _ from 'lodash';
import { fillData } from '@/pages/WorkSpace/TestAnalysis/AnalysisCompare/CommonMethod'
import { queryCompareResultList } from '@/pages/WorkSpace/TestAnalysis/AnalysisCompare/services'

export const CreatePageData = (props: any) => {
    const [logoData, setLogoData] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [envData, setEnvData] = useState<any[]>([])
    const [suiteLen, setSuiteLen] = useState(1)
    const defaultConf = {
        need_test_suite_description: true,
        need_test_env: true,
        need_test_description: true,
        need_test_conclusion: true,
        show_type: "list",
        test_data: false,
    }

    const [compareResult, setCompareResult] = useState<any>({
        func_data_result: [],
        perf_data_result: []
    })

    const [domainResult, setDomainResult] = useState<any>({
        name: "",
        is_default: false,
        need_test_background: true,
        need_test_method: true,
        need_test_summary: true,
        need_test_conclusion: true,
        need_test_env: true,
        need_env_description: true,
        need_func_data: false,
        need_perf_data: false,
        description: "",
        perf_conf: defaultConf,
        func_conf: defaultConf,
        perf_item: [],
        func_item: [],
    })

    const { ws_id } = props.match.params

    const {
        environmentResult = {},
        baselineGroupIndex = 0,
        allGroupData = [],
        testDataParam = {},
        compareGroupData = {},
        domainGroupResult = {},
        saveReportData = {},
    } = props.history.location.state

    const queryCompareResultFn = async (paramData: any) => {
        const result = await queryCompareResultList(paramData)
        return result
    }

    const handleData = async (data: any) => {
        setLoading(true)
        const { perf_suite_dic, func_suite_dic } = data
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
                    setLoading(false)
                    if (res.data.test_type === 'functional') {
                        compareResult.func_data_result = compareResult.func_data_result.concat(res.data)
                    }
                    if (res.data.test_type === 'performance') {
                        compareResult.perf_data_result = compareResult.perf_data_result.concat(res.data)
                    }
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
    }

    useEffect(() => {
        if (JSON.stringify(testDataParam) !== '{}') {
            handleData(testDataParam)
        }
    }, [testDataParam])

    const { func_data_result, perf_data_result } = compareResult

    const compareLen = useMemo(() => {
        const perf = perf_data_result.length
        const func = func_data_result.length
        return perf + func
    }, [compareResult])

    //自定义报告模板
    const getTemplate = async () => {
        const data = await detailTemplate({ id: saveReportData.template, ws_id })
        return data;
    }
    /*
       *** 默认和自定义模版的切换
   */

    const switchReport = useMemo(() => {
        return saveReportData.is_default
    }, [saveReportData])

    useEffect(() => {
        // setLoading(true)
        if (switchReport) {
            const obj: any = new Object;
            const newFunc: any = []
            const newPerf: any = []
            Object.keys(domainGroupResult).forEach((t: any, idx: number) => {
                const feild = domainGroupResult[t]
                if (t == 'functional') {
                    Object.keys(feild).forEach((x: any) => {
                        const item = feild[x]
                        const list: any = []
                        Object.keys(item).forEach((y: any) => {
                            const suite = item[y]
                            list.push({
                                test_suite_id: y,
                                case_source: suite
                            })
                        })
                        newFunc.push({
                            name: x,
                            list,
                        })
                    })
                } else {
                    Object.keys(feild).forEach((x: any) => {
                        const item = feild[x]
                        const list: any = []
                        Object.keys(item).forEach((y: any) => {
                            const suite = item[y]
                            list.push({
                                test_suite_id: y,
                                case_source: suite
                            })
                        })
                        newPerf.push({
                            name: x,
                            list
                        })
                    })
                }
            })
            obj['func_item'] = newFunc;
            obj['perf_item'] = newPerf;
            let perData: any = []
            let funData: any = []
            if (JSON.stringify(obj) !== '{}') {
                if (obj.perf_item && !!obj.perf_item.length) {
                    if (!!perf_data_result.length) {
                        for (let res = obj.perf_item, m = 0; m < res.length; m++) { // 自定义domain分组
                            if (res[m].is_group) { // 是否有组
                                let listParent: any = []
                                for (let domain = res[m].list, a = 0; a < domain.length; a++) { //遍历组下面的项
                                    let list: any = []
                                    let conf_list: any = []
                                    for (let suite = domain[a].list, b = 0; b < suite.length; b++) { //遍历项下面的suite
                                        perf_data_result.map((item: any, idx: number) => {
                                            if (Number(item.suite_id) == Number(suite[b].test_suite_id)) {
                                                list.push({
                                                    ...item,
                                                    test_suite_description: suite[b].test_tool,
                                                    rowKey: `${m}-${a}-${b}`
                                                })
                                            }
                                        })

                                        suite[b].case_source.map((conf: any) => {
                                            conf_list.push(conf.test_conf_id || conf)
                                        })
                                    }
                                    for (let j = 0; j < list.length; j++) {
                                        list[j].conf_list = list[j].conf_list.filter(function (conf: any, idx: number) {
                                            return conf_list.includes(Number(conf.conf_id))
                                        });
                                    }
                                    listParent.push({
                                        name: domain[a].name,
                                        rowKey: `${m}-${a}`,
                                        list
                                    })
                                }
                                perData.push({
                                    name: res[m].name,
                                    rowKey: `${m}`,
                                    is_group: true,
                                    list: listParent
                                })

                            } else {
                                let list: any = []
                                let conf_list: any = []
                                for (let suite = res[m].list, b = 0; b < suite.length; b++) { //遍历项下面的suite
                                    perf_data_result.map((item: any, idx: number) => {
                                        if (item.suite_id == suite[b].test_suite_id) {
                                            list.push({
                                                ...item,
                                                test_suite_description: suite[b].test_tool,
                                                rowKey: `${m}-${b}`
                                            })
                                        }
                                    })
                                    suite[b].case_source.map((conf: any) => {
                                        conf_list.push(conf.test_conf_id || conf)
                                    })
                                }
                                for (let j = 0; j < list.length; j++) {
                                    list[j].conf_list = list[j].conf_list.filter(function (conf: any, idx: number) {
                                        return conf_list.includes(Number(conf.conf_id))
                                    });
                                }
                                perData.push({
                                    name: res[m].name,
                                    rowKey: `${m}`,
                                    list
                                })
                            }
                        }
                    }
                }
                if (obj.func_item && !!obj.func_item.length) {
                    if (!!func_data_result.length) {
                        for (let res = obj.func_item, m = 0; m < res.length; m++) { // 自定义domain分组
                            if (res[m].is_group) { // 是否有组
                                let listParent: any = []
                                for (let domain = res[m].list, a = 0; a < domain.length; a++) { //遍历组下面的项
                                    let list: any = []
                                    let conf_list: any = []
                                    for (let suite = domain[a].list, b = 0; b < suite.length; b++) { //遍历项下面的suite
                                        func_data_result.map((item: any, idx: number) => {
                                            if (Number(item.suite_id) === Number(suite[b].test_suite_id)) {
                                                list.push({
                                                    ...item,
                                                    rowKey: `${m}-${b}`
                                                })
                                            }
                                        })
                                        suite[b].case_source.map((conf: any) => {
                                            conf_list.push(conf.test_conf_id || conf)
                                        })
                                    }
                                    for (let j = 0; j < list.length; j++) {
                                        list[j].conf_list = list[j].conf_list.filter(function (conf: any, idx: number) {
                                            return conf_list.includes(Number(conf.conf_id))
                                        });
                                    }
                                    listParent.push({
                                        name: domain[a].name,
                                        rowKey: `${m}-${a}`,
                                        list
                                    })
                                }
                                funData.push({
                                    name: res[m].name,
                                    rowKey: `${m}`,
                                    is_group: true,
                                    list: listParent
                                })
                            } else {
                                let list: any = []
                                let conf_list: any = []
                                for (let suite = res[m].list, b = 0; b < suite.length; b++) { //遍历项下面的suite
                                    func_data_result.map((item: any, idx: number) => {
                                        if (Number(item.suite_id) === Number(suite[b].test_suite_id)) {
                                            list.push({
                                                ...item,
                                                rowKey: `${m}-${b}`
                                            })
                                        }
                                    })
                                    suite[b].case_source.map((conf: any) => {
                                        conf_list.push(conf.test_conf_id || conf)
                                    })
                                }
                                for (let j = 0; j < list.length; j++) {
                                    list[j].conf_list = list[j].conf_list.filter(function (conf: any, idx: number) {
                                        return conf_list.includes(Number(conf.conf_id))
                                    });
                                }
                                funData.push({
                                    name: res[m].name,
                                    rowKey: `${m}`,
                                    list
                                })
                            }
                        }
                    }
                }
                let newObj: any = {
                    ...domainResult,
                    is_default: true,
                    perf_item: perData,
                    func_item: funData
                }
                setDomainResult(newObj)
                setLoading(false)
            }
        } else {
            // setLoading(true)
            getTemplate().then((data: any) => {
                if (data.code === 200) {
                    let perData: any = []
                    let funData: any = []
                    let obj = data.data
                    if (JSON.stringify(obj) !== '{}') {
                        if (obj.perf_item && !!obj.perf_item.length) {
                            for (let res = obj.perf_item, m = 0; m < res.length; m++) { // 自定义domain分组
                                if (res[m].is_group) { // 是否有组
                                    let listParent: any = []
                                    for (let domain = res[m].list, a = 0; a < domain.length; a++) { //遍历组下面的项
                                        let list: any = []
                                        let conf_list: any = []
                                        for (let suite = domain[a].list, b = 0; b < suite.length; b++) { //遍历项下面的suite
                                            perf_data_result?.map((item: any, idx: number) => {
                                                if (Number(item.suite_id) == Number(suite[b].test_suite_id)) {
                                                    list.push({
                                                        ...item,
                                                        test_suite_description: suite[b].test_tool,
                                                        test_env: '',
                                                        test_description: '',
                                                        test_conclusion: '',
                                                        rowKey: `${m}-${a}-${idx}`
                                                    })
                                                }
                                            })

                                            suite[b].case_source.map((conf: any) => {
                                                conf_list.push(conf.test_conf_id || conf)
                                            })
                                        }
                                        for (let j = 0; j < list.length; j++) {
                                            list[j].conf_list = list[j].conf_list.filter(function (conf: any, idx: number) {
                                                return conf_list.includes(Number(conf.conf_id))
                                            });
                                        }
                                        listParent.push({
                                            name: domain[a].name,
                                            rowKey: `${m}-${a}`,
                                            list
                                        })
                                    }
                                    perData.push({
                                        name: res[m].name,
                                        rowKey: `${m}`,
                                        is_group: true,
                                        list: listParent
                                    })

                                } else {
                                    let list: any = []
                                    let conf_list: any = []
                                    for (let suite = res[m].list, b = 0; b < suite.length; b++) { //遍历项下面的suite
                                        perf_data_result?.map((item: any, idx: number) => {
                                            if (item.suite_id == suite[b].test_suite_id) {
                                                list.push({
                                                    ...item,
                                                    test_suite_description: suite[b].test_tool,
                                                    rowKey: `${m}-${b}`
                                                })
                                            }
                                        })
                                        suite[b].case_source.map((conf: any) => {
                                            conf_list.push(conf.test_conf_id || conf)
                                        })
                                    }
                                    for (let j = 0; j < list.length; j++) {
                                        list[j].conf_list = list[j].conf_list.filter(function (conf: any, idx: number) {
                                            return conf_list.includes(Number(conf.conf_id))
                                        });
                                    }
                                    perData.push({
                                        name: res[m].name,
                                        rowKey: `${m}`,
                                        list
                                    })
                                }
                            }
                        }
                        if (obj.func_item && !!obj.func_item.length) {
                            for (let res = obj.func_item, m = 0; m < res.length; m++) { // 自定义domain分组
                                if (res[m].is_group) { // 是否有组
                                    let listParent: any = []
                                    for (let domain = res[m].list, a = 0; a < domain.length; a++) { //遍历组下面的项
                                        let list: any = []
                                        let conf_list: any = []
                                        for (let suite = domain[a].list, b = 0; b < suite.length; b++) { //遍历项下面的suite
                                            func_data_result?.map((item: any, idx: number) => {
                                                if (Number(item.suite_id) === Number(suite[b].test_suite_id)) {
                                                    list.push({
                                                        ...item,
                                                        rowKey: `${m}-${b}`
                                                    })
                                                }
                                            })
                                            suite[b].case_source.map((conf: any) => {
                                                conf_list.push(conf.test_conf_id || conf)
                                            })
                                        }
                                        for (let j = 0; j < list.length; j++) {
                                            list[j].conf_list = list[j].conf_list.filter(function (conf: any, idx: number) {
                                                return conf_list.includes(Number(conf.conf_id))
                                            });
                                        }
                                        listParent.push({
                                            name: domain[a].name,
                                            rowKey: `${m}-${a}`,
                                            list
                                        })
                                    }
                                    funData.push({
                                        name: res[m].name,
                                        rowKey: `${m}`,
                                        is_group: true,
                                        list: listParent
                                    })
                                } else {
                                    let list: any = []
                                    let conf_list: any = []
                                    for (let suite = res[m].list, b = 0; b < suite.length; b++) { //遍历项下面的suite

                                        func_data_result?.map((item: any, idx: number) => {
                                            if (Number(item.suite_id) === Number(suite[b].test_suite_id)) {
                                                list.push({
                                                    ...item,
                                                    rowKey: `${m}-${b}`
                                                })
                                            }
                                        })
                                        suite[b].case_source.map((conf: any) => {
                                            conf_list.push(conf.test_conf_id || conf)
                                        })
                                    }
                                    for (let j = 0; j < list.length; j++) {
                                        list[j].conf_list = list[j].conf_list.filter(function (conf: any, idx: number) {
                                            return conf_list.includes(Number(conf.conf_id))
                                        });
                                    }
                                    funData.push({
                                        name: res[m].name,
                                        rowKey: `${m}`,
                                        list
                                    })
                                }
                            }
                        }
                        let newObj: any = {
                            ...obj,
                            perf_item: perData,
                            func_item: funData
                        }
                        setDomainResult(newObj)
                        setLoading(false)
                    }
                } else {
                    message.error('自定义模版出错')
                }
            })
        }
    }, [domainGroupResult, switchReport, perf_data_result, func_data_result])

    /*
        *** 统计性能测试、功能测试总数据
    */
    const countCase = (data: any, countField: string, inital: any, index: any) => {
        return data.reduce((pre: any, cur: any) => {
            return cur[countField].reduce((p: any, c: any, idx: number) => {
                if (index === idx) for (let x in c) p[x] += c[x]
                return p
            }, inital)
        }, inital)
    }

    const summaryData = useMemo(() => {
        const { compare_groups } = environmentResult
        // console.log(environmentResult)
        const groupArr = compare_groups.reduce((pre: any, cur: any, idx: number) => {
            const { tag, is_job } = cur
            const compare: any = {
                tag,
                is_job,
                func_data: {},
                perf_data: {}
            }
            if (func_data_result && !!func_data_result.length) {
                const funcCount = countCase(func_data_result, 'compare_count', { all_case: 0, success_case: 0, fail_case: 0 }, idx)
                compare.func_data = {
                    funcAll: funcCount?.all_case,
                    success: funcCount?.success_case,
                    fail: funcCount?.fail_case,
                }
            }

            if (perf_data_result && !!perf_data_result.length) {
                const perfAll = perf_data_result.reduce((pa: any, c: any) => {
                    const { all } = c.base_count
                    if (all)
                        return pa + all
                    return pa
                }, 0)

                const perfCount = countCase(perf_data_result, 'compare_count', { all: 0, decline: 0, increase: 0 }, idx)
                compare.perf_data = {
                    perfAll,
                    decline: perfCount.decline,
                    increase: perfCount.increase,
                }
            }
            return pre.concat(compare)
        }, [])

        // console.log(groupArr)
        const newObj: any = {}
        let base_group: any = {
            tag: environmentResult.base_group.tag,
            is_job: 1,
            func_data: {},
            perf_data: {}
        }

        if (func_data_result && !!func_data_result.length) {
            base_group = {
                ...base_group,
                func_data: {
                    ...func_data_result.reduce((pre: any, cur: any) => {
                        const { all_case, success_case, fail_case } = cur.base_count
                        return {
                            funcAll: pre.funcAll + all_case,
                            success: pre.success + success_case,
                            fail: pre.fail + fail_case
                        }
                    }, { funcAll: 0, success: 0, fail: 0 })
                }
            }
        }

        newObj.custom = '-'
        newObj.summary = {
            base_group,
            compare_groups: groupArr
        }
        return newObj
    }, [environmentResult, compareResult])

    useMemo(() => {
        const deep = _.cloneDeep(summaryData)
        const compare = deep?.summary.compare_groups
        const base = deep?.summary.base_group
        compare.splice(baselineGroupIndex, 0, base)
        setLogoData(compare)
    }, [summaryData])

    useMemo(() => {
        const deep = _.cloneDeep(environmentResult)
        const compare = deep.compare_groups
        const base = deep.base_group
        compare.splice(baselineGroupIndex, 0, base)
        if (compare.length > 1 && baselineGroupIndex !== -1) {
            compare[baselineGroupIndex].is_group = true
        }
        setEnvData(compare)
    }, [environmentResult])

    const allGroupList = useMemo(() => {
        return allGroupData.filter((item: any) => item.members.length > 0)
    }, [allGroupData])

    return {
        environmentResult,
        allGroupData: allGroupList,
        baselineGroupIndex: baselineGroupIndex === -1 ? 0 : baselineGroupIndex,
        compareResult,
        compareGroupData,
        domainGroupResult,
        logoData,
        envData,
        summaryData,
        domainResult,
        setDomainResult,
        loading,
        saveReportData,
        isFlag: compareLen !== suiteLen
    }
}

const changeChild = (data: any, index: number) => {
    let list: any = []
    Object.keys(data).map((key: any, idx: number) => (
        list.push({
            name: key,
            rowKey: `${index}-${idx}`,
            list: data[key]?.map((suite: any, id: number) => {
                return {
                    ...suite,
                    rowKey: `${index}-${idx}-${id}`
                }
            })
        })
    ))
    return list
}

export const EditPageData = (props: any) => {
    const [loading, setLoading] = useState<boolean>(true)
    const [dataSource, setDataSource] = useState<any>({})
    const [allGroupData, setAllGroupData] = useState<any>([])
    const [baselineGroupIndex, setBaselineGroupIndex] = useState<number>(0)
    const [creator, setCreator] = useState<any>()
    const [template, setTemplate] = useState<any>({})
    const { report_id } = props.match.params

    const queryReport = async () => {
        setLoading(true)
        const { code, msg, data } = await reportDetail({ report_id })
        if (code == 200) {
            setDataSource(data[0])
            window.document.title = data[0]?.name || 'T-one'
            console.log(data)
            if (data?.length === 0)
                return redirectErrorPage(404)
            const { tmpl_id, ws_id, creator } = data[0]
            setCreator(creator)
            const res = await detailTemplate({ id: tmpl_id, ws_id })
            let perf_item: any = []
            let func_item: any = []
            const { perf_data, func_data } = data[0].test_item
            if (JSON.stringify(perf_data) !== '{}') {
                Object.keys(perf_data).map((i: any, index: number) => {
                    if (_.isArray(perf_data[i])) {
                        perf_item.push({
                            name: i,
                            rowKey: index,
                            list: perf_data[i]?.map((suite: any, id: number) => {
                                return {
                                    ...suite,
                                    rowKey: `${index}-${id}`
                                }
                            })
                        })
                    } else {
                        perf_item.push({
                            name: i,
                            rowKey: index,
                            is_group: true,
                            list: changeChild(perf_data[i], index)
                        })
                    }
                })
            }
            if (JSON.stringify(func_data) !== '{}') {
                Object.keys(func_data).map((i: any, index: number) => {
                    if (_.isArray(func_data[i])) {
                        func_item.push({
                            name: i,
                            rowKey: index,
                            list: func_data[i]
                        })
                    } else {
                        func_item.push({
                            name: i,
                            rowKey: index,
                            is_group: true,
                            list: changeChild(func_data[i], index)
                        })
                    }
                })
            }
            if (res.code == 200) {
                setTemplate({
                    ...res.data,
                    perf_item,
                    func_item
                })
            }
            let test_env = JSON.parse(data[0].test_env)
            if (test_env) {
                let env = test_env?.compare_groups
                let newArr: any = []
                for (let i = 0; i < env.length; i++) {
                    newArr.push(env[i])
                }
                newArr.splice(test_env?.base_index, 0, test_env?.base_group)
                setAllGroupData(newArr)
                setBaselineGroupIndex(test_env?.base_index === undefined ? 0 : test_env?.base_index)
            }
            setLoading(false)
        } else {
            requestCodeMessage(code, msg)
        }
    }
    useEffect(() => {
        queryReport()
    }, [])

    let test_conclusion: any, test_env: any;
    if (dataSource && JSON.stringify(dataSource) !== '{}') {
        test_conclusion = JSON.parse(dataSource.test_conclusion)
        test_env = JSON.parse(dataSource.test_env)
    }

    const saveReportData = {
        creator_name: dataSource?.creator_name,
        description: dataSource?.description,
        gmt_created: dataSource?.gmt_created,
        id: dataSource?.id,
        name: dataSource?.name,
        template: dataSource?.tmpl_id,
        old_report: dataSource?.old_report,
        report_source: dataSource?.report_source,
        test_background: dataSource?.test_background,
        test_method: dataSource?.test_method,
        test_conclusion,
        test_env,
    }

    const logoData = useMemo(() => {
        if (test_conclusion && JSON.stringify(test_conclusion) !== '{}') {
            const deep = _.cloneDeep(test_conclusion)
            let compare = deep?.summary.compare_groups
            let base = deep?.summary.base_group
            compare.splice(baselineGroupIndex, 0, base)
            return compare
        }
    }, [test_conclusion])

    const envData = useMemo(() => {
        if (test_env && JSON.stringify(test_env) !== '{}') {
            const deep = _.cloneDeep(test_env)
            if (test_env?.compare_groups?.length > 0) {
                deep.base_group.is_group = true
            }
            let compare = deep?.compare_groups
            let base = deep?.base_group
            compare.splice(baselineGroupIndex, 0, base)
            return compare
        }
    }, [test_env])

    return {
        environmentResult: test_env,
        allGroupData,
        baselineGroupIndex,
        logoData,
        envData,
        summaryData: test_conclusion,
        domainResult: template,
        setDomainResult: setTemplate,
        loading,
        saveReportData,
        wsId: dataSource?.ws_id,
        queryReport,
        creator
    }
}