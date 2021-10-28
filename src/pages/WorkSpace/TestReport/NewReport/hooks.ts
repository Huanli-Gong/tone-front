import React, { useEffect, useMemo, useState } from 'react'
import {  detailTemplate, reportDetail } from '../services';
import { message } from 'antd';
// import { writeDocumentTitle } from '@/utils/hooks';
import { requestCodeMessage } from '@/utils/utils';
import _ from 'lodash';
export const CreatePageData = (props:any) => {
    const [logoData, setLogoData] = useState<Array<{}>>([])
    const [loading, setLoading] = useState<Boolean>(true)
    const [envData, setEnvData] = useState<Array<{}>>([])
    const defaultConf = {
        need_test_suite_description: true,
        need_test_env: true,
        need_test_description: true,
        need_test_conclusion: true,
        show_type: "list",
        test_data: false,
    }
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
    let {
        environmentResult = {},
        allGroupData = [],
        baselineGroupIndex = 0,
        compareResult = {},
        domainGroupResult = {},
        saveReportData = {},
    } = props.history.location.state
    //自定义报告模板
    const getTemplate = async () => {
        setLoading(true)
        const data = await detailTemplate({ id: saveReportData.template, ws_id })
        if (data.code === 200) {
            let perData: any = []
            let funData: any = []
            let obj = data.data
            if(JSON.stringify(obj) !== '{}'){
                if(obj.perf_item && obj.perf_item.length > 0){
                    for (let res = obj.perf_item,m = 0; m < res.length; m++) { // 自定义domain分组
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
                                                test_env:'',
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
                                list:listParent
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
                                func_data_result?.map((item: any, idx: number) => {
                                    if(Number(item.suite_id) === Number(suite[b].test_suite_id)){
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
                            perData.push({
                                name: res[m].name,
                                rowKey: `${m}`,
                                list
                            })
                        }
                    }
                }else{
                    for (let res = obj.func_item,m = 0; m < res.length; m++) { // 自定义domain分组
                        if (res[m].is_group) { // 是否有组
                            let listParent: any = []
                            for (let domain = res[m].list, a = 0; a < domain.length; a++) { //遍历组下面的项
                                let list: any = []
                                let conf_list: any = []
                                for (let suite = domain[a].list, b = 0; b < suite.length; b++) { //遍历项下面的suite
                                    func_data_result?.map((item: any, idx: number) => {
                                        if(Number(item.suite_id) === Number(suite[b].test_suite_id)){
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
                                list:listParent
                            })
                        } else {
                            let list: any = []
                            let conf_list: any = []
                            for (let suite = res[m].list, b = 0; b < suite.length; b++) { //遍历项下面的suite
                                
                                func_data_result?.map((item: any, idx: number) => {
                                    if(Number(item.suite_id) === Number(suite[b].test_suite_id)){
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
                let newObj:any =  {
                    ...obj,
                    perf_item:perData,
                    func_item:funData
                }
                setDomainResult(newObj)
            }
        } else {
            message.error('自定义模版出错')
        }
        setLoading(false)
    }
     /*
        *** 默认和自定义模版的切换
    */
    const switchReport = useMemo(() => {
        if (saveReportData.is_default) {
            return true
        } else {
            getTemplate()
            return false
        }
    }, [saveReportData])

    useEffect(() => {
        setLoading(true)
        if (switchReport) {
            let obj: any = new Object;
            let newFunc: any = []
            let newPerf: any = []
            Object.keys(domainGroupResult).forEach((t: any, idx: number) => {
                const feild = domainGroupResult[t]
                if (t == 'functional') {
                    Object.keys(feild).forEach((x: any) => {
                        const item = feild[x]
                        let list: any = []
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
                        let list: any = []
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
                if (obj.perf_item && obj.perf_item.length > 0) {
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
                                perf_data_result?.map((item: any, idx: number) => {
                                    if (item.suite_id == suite[b].test_suite_id) {
                                        list.push({
                                            ...item,
                                            test_suite_description: suite[b].test_tool,
                                            rowKey: `${m}-${b}`
                                        })
                                    }
                                })
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
                            perData.push({
                                name: res[m].name,
                                rowKey: `${m}`,
                                list
                            })
                        }
                    }
                } else {
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
                    ...domainResult,
                    is_default: true,
                    perf_item: perData,
                    func_item: funData
                }
                setDomainResult(newObj)
                setLoading(false)
            }
        }
    }, [domainGroupResult, switchReport])//

    /*
        *** 统计性能测试、功能测试总数据
    */
    const countCase = ( data : any , countField : string , inital : any , index : any ) => {
        return data.reduce(( pre : any , cur : any  ) => {
            return cur[ countField ].reduce(( p : any  , c : any , idx : number ) => {
                if ( index === idx ) for ( let x in c ) p[ x ] += c[ x ]
                return p
            } , inital )
        } , inital )
    }
    // const countBaseCase = (data: any, countField: string, inital: any, index: any) => {
    //     return data.reduce(( pre : any , cur : any, idx: number ) => {
    //         cur[countField].map((item:any)=>{
    //             pre[ 'all_case' ] += item[ 'all_case' ]
    //             pre[ 'success_case' ] += item[ 'success_case' ]
    //             pre[ 'fail_case' ] += item[ 'fail_case' ]
    //         })
    //         return pre
    //     } , inital )
    // }

    const { func_data_result, perf_data_result } = compareResult
    const summaryData = useMemo(() => {
        const { compare_groups } = environmentResult
       
        const groupArr = compare_groups.reduce((pre: any, cur: any,idx:number) => {
            const { tag, is_job } = cur
            let compare: any = {
                tag,
                is_job,
                func_data: { all: '-', success: '-', fail: '-' },
                perf_data: { all: '-', decline: '-', increase: '-' }
            }
                if (func_data_result && func_data_result.length > 0) {
                    const funcCount = countCase(func_data_result, 'compare_count', { all_case: 0, success_case: 0, fail_case: 0 }, idx)
                    compare.func_data = {
                        all: funcCount?.all_case,
                        success: funcCount?.success_case,
                        fail: funcCount?.fail_case,
                    }
                    // const baseCount = countBaseCase(func_data_result, 'conf_list', { all_case: 0, success_case: 0, fail_case: 0 }, idx)
                    // base_group.func_data = {
                    //     all: baseCount?.all_case,
                    //     success: baseCount.success_case,
                    //     fail: baseCount.fail_case,
                    // }
                }
                if (perf_data_result && perf_data_result.length > 0) {
                    const perfCount = countCase(perf_data_result, 'compare_count', { all: 0, decline: 0, increase: 0 }, idx)
                    compare.perf_data = {
                        all: perfCount.all,
                        decline: perfCount.decline,
                        increase: perfCount.increase,
                    }
                }
            return pre.concat(compare)
        }, [])

        let newObj: any = {}
        let base_group : any = {
            tag: environmentResult.base_group.tag,
            is_job: 1,
            //...{ all_case : 0 , success_case : 0 , fail_case : 0 }
        }

        if ( func_data_result && func_data_result.length > 0 ) {
            base_group = {
                ...base_group,
                ...func_data_result.reduce(( pre : any , cur : any ) => {
                    const { all_case , success_case , fail_case } = cur.base_count
                    return {
                        all : pre.all += all_case,
                        success : pre.success += success_case,
                        fail : pre.fail += fail_case
                    }
                } , { all : 0 , success : 0 , fail : 0 })
            }
        }

        newObj.custom = '-',
        newObj.summary = {
            base_group,
            compare_groups: groupArr
        }
        return newObj
    }, [environmentResult, compareResult])

    //const { compare_groups, base_group } = summaryData?.summary

    useMemo(() => {
        const deep = _.cloneDeep(summaryData)
        let compare = deep?.summary.compare_groups
        let base = deep?.summary.base_group
        compare.splice(baselineGroupIndex, 0, base)
        setLogoData(compare)
    }, [summaryData])

    useMemo(() => {
        const deep = _.cloneDeep(environmentResult)
        let groupArr:any = window.sessionStorage.getItem('compareData')
        const groupLen = JSON.parse(groupArr)
        if(Array.isArray(groupLen) && groupLen.length > 1){
            deep.base_group.is_base = true
        }
        let compare = deep.compare_groups
        let base = deep.base_group
        compare.splice(baselineGroupIndex, 0, base)
        setEnvData(compare)
    }, [environmentResult]) 

    const allGroupList = useMemo(()=>{
        return allGroupData.filter((item:any)=> item.members.length > 0)
    },[allGroupData])
    return {
        environmentResult,
        allGroupData:allGroupList,
        baselineGroupIndex,
        compareResult,
        domainGroupResult,
        saveReportData,
        logoData,
        envData,
        domainResult,
        setDomainResult,
        summaryData,
        loading,
    }
}

export const EditPageData = (props:any) => {
    const [loading, setLoading] = useState<Boolean>(true)
    const [dataSource, setDataSource] = useState<any>({})
    // const [logoData, setLogoData] = useState<Array<{}>>([])
    // const [envData, setEnvData] = useState<Array<{}>>([])
    const [allGroupData, setAllGroupData] = useState<any>([])
    const [baselineGroupIndex, setBaselineGroupIndex] = useState<number>(0)
    const [template, setTemplate] = useState<any>({})
    const { ws_id, report_id } = props.match.params
    
    const queryReport = async () => {
        setLoading(true)
        const { code, msg, data: [data] } = await reportDetail({ report_id })
        if (code == 200) {
            setDataSource(data)
            setLoading(false)
        } else {
            requestCodeMessage( code , msg )
        }
    }
    useEffect(() => {
        queryReport()
    }, [])

    let test_conclusion: any, test_env: any;
    if (JSON.stringify(dataSource) !== '{}') {
        test_conclusion = JSON.parse(dataSource?.test_conclusion)
        test_env = JSON.parse(dataSource?.test_env)
    }
    
    const changeChild = (data: any, index:number) => {
        let list: any = []
        Object.keys(data).map((key: any, idx: number) => (
            list.push({
                name: key,
                rowKey:`${index}-${idx}`,
                list: data[key]?.map((suite:any,id:number)=> { 
                    return {
                        ...suite,
                        rowKey:`${index}-${idx}-${id}`
                    }
                })
            })
        ))
        return list
    }
    const temp = async () => {
        const res = await detailTemplate({ id: dataSource.tmpl_id, ws_id })
        if (res.code == 200)
            if (JSON.stringify(dataSource) !== '{}') {
                let perf_data = dataSource.test_item.perf_data
                let perf_item: any = []
                if (JSON.stringify(perf_data) !== '{}') {
                    Object.keys(perf_data).map((i: any, index: number) => {
                        if (_.isArray(perf_data[i])) {
                            perf_item.push({
                                name: i,
                                rowKey:index,
                                list: perf_data[i]?.map((suite:any,id:number)=> { 
                                    return {
                                        ...suite,
                                        rowKey:`${index}-${id}`
                                    }
                                })
                            })
                        } else {
                            const list = changeChild(perf_data[i],index)
                            perf_item.push({
                                name: i,
                                rowKey:index,
                                is_group: true,
                                list
                            })
                        }
                    })
                }
                let func_data = dataSource.test_item.func_data
                let func_item: any = []
                if (JSON.stringify(func_data) !== '{}') {
                    Object.keys(func_data).map((i: any, index: number) => {
                        if (_.isArray(func_data[i])) {
                            func_item.push({
                                name: i,
                                rowKey:index,
                                list: func_data[i]
                            })
                        } else {
                            const list = changeChild(func_data[i],index)
                            func_item.push({
                                name: i,
                                rowKey:index,
                                is_group: true,
                                list
                            })
                        }
                    })
                }
                setTemplate({
                    ...res.data,
                    perf_item,
                    func_item,
                })
            }
    }
    //更新需要的数据结构
    useEffect(() => {
        dataSource.tmpl_id && temp()
        if (test_env && JSON.stringify(test_env) !== '{}') {
            let env = test_env?.compare_groups
            let newArr: any = []
            newArr.push(test_env?.base_group)
            for (let i = 0; i < env.length; i++) {
                newArr.push(env[i])
            }
            setAllGroupData(newArr)
            setBaselineGroupIndex(test_env?.base_index === undefined ? 0 : test_env?.base_index)
        }
        window.document.title = dataSource?.name || 'T-one'
    }, [dataSource])

    const saveReportData = {
        creator_name:dataSource.creator_name,
        description:dataSource.description,
        gmt_created:dataSource.gmt_created,
        id:dataSource.id,
        name:dataSource.name,
        template:dataSource.tmpl_id,
        report_source:dataSource.report_source,
        test_background:dataSource.test_background,
        test_method:dataSource.test_method,
        test_conclusion,
        test_env,
    }

    const logoData = useMemo(()=>{
        if (test_conclusion && JSON.stringify(test_conclusion) !== '{}') {
            const deep = _.cloneDeep(test_conclusion)
            let compare = deep?.summary.compare_groups
            let base = deep?.summary.base_group
            compare.splice(baselineGroupIndex, 0, base)
            return compare
        }
    },[test_conclusion])

    const envData = useMemo(()=>{
        if (test_env && JSON.stringify(test_env) !== '{}') {
            const deep = _.cloneDeep(test_env)
            if(test_env?.compare_groups?.length > 0){
                deep.base_group.is_base = true
            }
            let compare = deep?.compare_groups
            let base = deep?.base_group
            compare.splice(baselineGroupIndex, 0, base)
            return compare
        }
    },[test_env])
    return {
        saveReportData,
        environmentResult : test_env,
        allGroupData,
        baselineGroupIndex,
        summaryData : test_conclusion ,
        logoData,
        envData,
        domainResult : template,
        setDomainResult : setTemplate,
        loading,
        queryReport
    }
}

