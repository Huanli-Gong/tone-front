import React, { useState, useEffect, useMemo,useRef } from 'react'
import { Breadcrumb, message, Button } from 'antd';
import { Wrapper, Header, Line, OverView, TestEnv, TestData } from './styled'
import { Scrollbars } from 'react-custom-scrollbars'
import SummaryTable from './components/SummaryTable'
import { writeDocumentTitle } from '@/utils/hooks';
import { UpOutlined } from '@ant-design/icons';
import TestEnvironment from './components/TestEnvironment';
import TestDataPage from './components/TestDataPage';
import { SettingEdit, SettingTextArea } from '@/components/ReportEidt/index';
import Catalog from '../Report/components/Catalog'
import { ReactComponent as IconEdit } from '@/assets/svg/icon_edit.svg';
import { ReactComponent as IconLink } from '@/assets/svg/icon_link.svg'
import { saveReport, detailTemplate } from '../services'
import Clipboard from 'clipboard'
import _ from 'lodash';
import { history } from 'umi';
import { requestCodeMessage } from '@/utils/utils';

const ReportPage = (props: any) => {
    const {
        environmentResult,
        allGroupData,
        baselineGroupIndex,
        compareResult,
        domainGroupResult,
        saveReportData,
        wsId
    } = props.history.location.state
    writeDocumentTitle(`Workspace.${props.route.name}`)
    const defaultConf = {
        need_test_suite_description: true,
        need_test_env: true,
        need_test_description: true,
        need_test_conclusion: true,
        show_type: "list",
        test_data: false,
    }
    const [layoutHeight, setLayoutHeight] = useState(innerHeight)
    const [obj, setObj] = useState<any>({
        name :saveReportData.name,
        description :saveReportData.description
    })
    const [testItem,setTestItem] = useState(false)
    const [domainResult, setDomainResult] = useState<any>({
        name: "",
        is_default: true,
        need_test_background: true,
        need_test_method: true,
        need_test_summary: true,
        need_test_conclusion: true,
        need_test_env: true,
        need_func_data: true,
        need_perf_data: true,
        description: "",
        perf_conf: defaultConf,
        func_conf: defaultConf,
        perf_item: [],
        func_item: [],
    })
    
    const [show,setShow ] = useState(false)
    const scrollbarsRef = useRef<any>(null)
    const [btn, setBtn] = useState(true)
    const [scrollLength, setScrollLength] = useState<number>(0)
    
    const catalogRef: any = useRef()
    const windowHeight = () => setLayoutHeight(innerHeight)
    useEffect(() => {
        window.addEventListener('resize', windowHeight)
        return () => {
            window.removeEventListener('resize', windowHeight)
        }
    }, [])
    
    const { func_data_result , perf_data_result } = compareResult 
    const getTemplate = async () => {
        const data = await detailTemplate({ id: saveReportData.template, ws_id: wsId })
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
    }
     // 默认和自定义模版的切换
     const switchReport = useMemo(() => {
        if (saveReportData.is_default) {
            return false
        } else {
            getTemplate()
            return true
        }
    }, [saveReportData])

    useEffect(() => {
        if (!switchReport) {
            let obj:any = new Object;
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
                    ...domainResult,
                    perf_item:perData,
                    func_item:funData
                }
                setDomainResult(newObj)
            }
        }
    }, [domainGroupResult, switchReport])

    useEffect(() => {
        const clipboard = new Clipboard('.test_report_copy_link' , { text : () => location.href })
        clipboard.on('success', function(e) {
            message.success('复制成功')
            e.clearSelection();
        })
        return () => {
            clipboard.destroy()
            window.sessionStorage.clear()
        }
    },[])

    const setScrollWidth = (num: number) => {
        setScrollLength(num)
    }
   
    const countCase = ( data : any , countField : string , inital : any , index : any ) => {
        return data?.reduce(( pre : any , cur : any  ) => {
            return cur[ countField ]?.reduce(( p : any  , c : any , idx : number ) => {
                if ( index === idx ) for ( let x in c ) p[ x ] += c[ x ]
                return p
            } , inital )
        } , inital )
    }

    const dataSource = useMemo(() => {
        const { compare_groups } = environmentResult
        const groupArr = compare_groups.reduce(( pre : any , cur : any , index : any ) => {
            const { tag , is_job } = cur
            let compare : any = { 
                tag , is_job , 
                func_data : { all : 0 , success : 0 , fail : 0 } , 
                perf_data : { all : 0 , decline : 0 , increase : 0 } 
            }

            if ( func_data_result && func_data_result.length > 0 ) {
                const funcCount = countCase( func_data_result , 'compare_count', { all_case : 0 , success_case : 0 , fail_case : 0 } , index )
                compare.func_data = {
                    all : funcCount.all_case,
                    success : funcCount.success_case,
                    fail : funcCount.fail_case ,
                }
            }

            if ( perf_data_result && perf_data_result.length > 0 ) {
                compare.perf_data = countCase( perf_data_result , 'compare_count', { all : 0 , decline : 0 , increase : 0 } , index )
            }

            return pre.concat( compare )
        } , [])

        let newObj: any = {}

        let base_group : any = {
            tag: environmentResult.base_group.tag,
            is_job: 1,
            ...{ all_case : 0 , success_case : 0 , fail_case : 0 }
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
            compare_groups : groupArr 
        }
        obj.test_conclusion = newObj;
        return newObj
    }, [environmentResult, compareResult])

    const BreadcrumbItem: React.FC<any> = () => (
        <Breadcrumb style={{ height: 62, padding: '20px 0' }}>
            <Breadcrumb.Item >
                <span style={{ cursor: 'pointer' }}>测试报告</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item >
                <span style={{ cursor: 'pointer' }} onClick={() => history.go(0)}>{saveReportData.name}</span>
            </Breadcrumb.Item>
        </Breadcrumb>
    )
    const getSelAllJob = () => {
        let result = []
        if (_.isArray(allGroupData)) {
            result = _.reduce(allGroupData, (arr: any, group: any) => {
                const members = _.isArray(_.get(group, 'members')) ? _.get(group, 'members') : []
                members.forEach((obj: any) => {
                    if (obj && obj.id) arr.push(obj.id)
                })
                return arr
            }, []);
        }
        return result
    }
    const handleChangeVal = (val: any, text: string) => {
        if (text == 'custom') {
            obj.test_conclusion[text] = val
        } else {
            obj[text] = val
        }
        setObj({
            ...obj,
        })
    }
    const handleSubmit = async() => {
        let env:any = window.sessionStorage.getItem('test_env')
        let item:any = window.sessionStorage.getItem('test_item')
        //obj.name = saveReportData.name
        //obj.description = saveReportData.description
        obj.product_version = saveReportData.productVersion
        obj.project_id = saveReportData.project
        obj.report_source = 'job'
        if (env) {
            obj.test_env = JSON.parse(env)
        }
        obj.test_env = environmentResult
        obj.tmpl_id = saveReportData.template
        obj.ws_id = wsId
        obj.test_item = JSON.parse(item)
        obj.job_li = getSelAllJob()
        // const obj = {
        //     name:window.sessionStorage.getItem('report_name'),
        //     product_version:saveReportData.productVersion,
        //     project_id:saveReportData.project,
        //     test_background:window.sessionStorage.getItem('test_background'),
        //     test_method:window.sessionStorage.getItem('test_method'),
        //     test_conclusion:JSON.parse(conclusion),
        //     report_source:'job',
        //     test_env:JSON.parse(env),
        //     description:window.sessionStorage.getItem('description'),
        //     tmpl_id:saveReportData.template,
        //     ws_id:wsId,
        //     test_item:JSON.parse(item),
        //     job_li: getSelAllJob()
        // }
        //obj.test_conclusion.custom = window.sessionStorage.getItem('test_conclusion')
        const data = await saveReport(obj)
        if (data.code === 200) {
            message.success('保存报告成功')
            history.push(`/ws/${wsId}/test_report?t=list`)
        } else {
            requestCodeMessage( data.code , data.msg )
        }
    }
    const handleEdit = () => {
        setBtn(true)
    }
    const backTop = (evt: any) => {
        scrollbarsRef.current.scrollTop(0)
    }
    const handleTop = (evt: any) => {
        let runTop = evt.target.scrollTop
        scrollbarsRef.current.getScrollTop()
        if(runTop > 600){
            setShow(true)
        }else{
            setShow(false)
        }
    }
    const handleScroll = (evt: any) => {
        const runLeft = evt.target.scrollLeft
        const children = document.querySelectorAll('.table_bar .ant-table-content')
        for (let x = 0; x < children.length; x++) {
            children[x].scrollLeft = runLeft
        }
    }
    return (
        <>
        <Wrapper>
            <Scrollbars
                onScroll={handleTop}
                ref={scrollbarsRef}
                style={{
                    width: '100%',
                    height: layoutHeight - 50,
                    position: 'relative'
                }}
            >
                <Header>
                    <BreadcrumbItem />
                    <div className="title">
                        <SettingEdit
                            name={saveReportData.name || '-'}
                            position="center"
                            text=""
                            btn={btn}
                            onOk={(val: any) => handleChangeVal(val, 'name')}
                        />
                        {btn && <Button type="primary" className="btn" onClick={handleSubmit}>保存</Button>}
                    </div>
                    <div className="describe">
                        描述 <SettingEdit
                            name={saveReportData.description || '-'}
                            position="center"
                            text=""
                            btn={btn}
                            onOk={(val: any) => handleChangeVal(val, 'description')}
                        />
                    </div>
                    {!btn && <div className="action">
                        <span className="edit" onClick={handleEdit}><IconEdit style={{ marginRight: 5 }} />编辑报告</span>
                        <span className="link test_report_copy_link"><IconLink style={{ marginRight: 5 }} />分享</span>
                    </div>}
                    {btn && <div className="empty"></div>}
                </Header>
                <Line></Line>
                {
                    !switchReport ? 
                    <>
                            <OverView>
                                <div className="title" id="overView"> <span className="line"></span>概述 </div>
                                    <div className="test_background" id="test_background">
                                        <SettingTextArea
                                            name='-'
                                            position="bottom"
                                            text="测试背景"
                                            btn={btn}
                                            onOk={(val: any) => handleChangeVal(val, 'test_background')}
                                        />
                                    </div>
                                    <div className="test_method" id="test_method">
                                        <SettingTextArea
                                            name='-'
                                            position="bottom"
                                            text="测试方法"
                                            btn={btn}
                                            onOk={(val: any) => handleChangeVal(val, 'test_method')}
                                        />
                                    </div>
                                
                                    <div className="test_result" id="test_result">
                                        <SettingTextArea
                                            name='-'
                                            position="bottom"
                                            text="测试结论"
                                            btn={btn}
                                            onOk={(val: any) => handleChangeVal(val, 'custom')}
                                        />
                                    </div>
                                    <div className="summary" id="summary">
                                        <div className="summary_text">Summary:</div>
                                        <SummaryTable setScrollWidth={setScrollWidth} compareResult={compareResult} data={dataSource} groupData={allGroupData} baseIndex={baselineGroupIndex} />
                                    </div>
                            </OverView>
                            <Line></Line>
                            <TestEnv>
                                <TestEnvironment setScrollWidth={setScrollWidth} domainResult={domainResult} btn={btn} switchReport={switchReport} data={environmentResult} groupData={allGroupData} baseIndex={baselineGroupIndex} />
                            </TestEnv>
                            <Line></Line>
                        </>
                    :
                    <>
                        {
                            !domainResult?.need_test_background &&
                            !domainResult?.need_test_conclusion &&
                            !domainResult?.need_test_summary
                            ? <></> : <>
                                <OverView>
                                    <div className="title" id="overView"> <span className="line"></span>概述 </div>
                                    { domainResult?.need_test_background &&
                                        <div className="test_background" id="test_background">
                                            <SettingTextArea
                                                name='-'
                                                position="bottom"
                                                text="测试背景"
                                                btn={btn}
                                                onOk={(val: any) => handleChangeVal(val, 'test_background')}
                                            />
                                        </div>}
                                    { !switchReport && 
                                        <div className="test_method" id="test_method">
                                            <SettingTextArea
                                                name='-'
                                                position="bottom"
                                                text="测试方法"
                                                btn={btn}
                                                onOk={(val: any) => handleChangeVal(val, 'test_method')}
                                            />
                                        </div>
                                    }
                                    {  domainResult?.need_test_conclusion &&
                                        <div className="test_result" id="test_result">
                                            <SettingTextArea
                                                name='-'
                                                position="bottom"
                                                text="测试结论"
                                                btn={btn}
                                                onOk={(val: any) => handleChangeVal(val, 'custom')}
                                            />
                                        </div>
                                    }
                                    {
                                        domainResult?.need_test_summary &&
                                        <div className="summary" id="summary">
                                            <div className="summary_text">Summary:</div>
                                            <SummaryTable setScrollWidth={setScrollWidth} compareResult={compareResult} data={dataSource} groupData={allGroupData} baseIndex={baselineGroupIndex} />
                                        </div>
                                    }
                                </OverView>
                                <Line></Line>
                            </>
                        }
                        {
                            domainResult?.need_test_env &&
                            <>
                                <TestEnv>
                                    <TestEnvironment setScrollWidth={setScrollWidth} domainResult={domainResult} btn={btn} switchReport={switchReport} data={environmentResult} groupData={allGroupData} baseIndex={baselineGroupIndex} />
                                </TestEnv>
                                <Line></Line>
                            </>
                        }
                    </>
                }
                <TestData>
                    <TestDataPage
                        btn={btn}
                        setTestItem={setTestItem}
                        switchReport={switchReport}
                        //data={compareResult}
                        domain={domainResult}
                        identify={ environmentResult }
                        groupData={allGroupData}
                        baseIndex={baselineGroupIndex}
                    />
                </TestData>
                <Catalog
                    onClick={() => catalogRef.current.open()}
                    dataSource={domainResult}
                    onSourceChange={ setDomainResult }
                    ref={catalogRef}
                /> 
                <Scrollbars
                    autoHeight
                    style={{
                        width: '100%', height: 8, position:'fixed',bottom:10
                    }}
                    onScroll={handleScroll}
                >
                    <p style={{ width: scrollLength + 40, height: 10 }} />
                </Scrollbars>
                <Line></Line>
            </Scrollbars>
        </Wrapper>
        {
            show && <div style={{ width:44,height:44,borderRadius:2,backgroundColor:'rgb(0, 0, 0, 0.1)',position:'fixed',bottom:10,right:20}}
                    onClick={backTop}>
                        <UpOutlined style={{ fontSize:30,padding:7,color:'rgb(0, 0, 0, 0.7)'}}/>
                    </div>
        }
        </>
            
    )
}

export default ReportPage;


// let oldPre = data.data.perf_item
// let newObj:any = new Object();
// for (let i = 0; i < oldPre.length; i++) {
//     if(oldPre[i].is_group){
//         newObj[oldPre[i].name] = {};
//         for (let domain= oldPre[i].list,j = 0; j < domain.length; j++) {
//             newObj[oldPre[i].name][domain[j].name] = {};
//             for (let suite = domain[j].list,l = 0; l < suite.length; l++) {
//                 newObj[oldPre[i].name][domain[j].name][suite[l].test_suite_id] = [];
//                 for (let conf = suite[l].case_source,k = 0; k < conf.length; k++) {
//                     newObj[oldPre[i].name][domain[j].name][suite[l].test_suite_id].push(conf[k].test_conf_id);
//                 }
//             }
//         } 
//     }else{
//         newObj[oldPre[i].name] = {};
//         for (let suite= oldPre[i].list,j = 0; j < suite.length; j++) {
//             newObj[oldPre[i].name][suite[j].test_suite_id] = [];
//             for (let conf = suite[j].case_source,k = 0; k < conf.length; k++) {
//                 newObj[oldPre[i].name][suite[j].test_suite_id].push(conf[k].test_conf_id);
//             }
//         }
//     }
// }
// let oldFuncPre = data.data.func_item
// let newFuncObj:any = new Object();
// for (let i = 0; i < oldFuncPre.length; i++) {
//     if(oldFuncPre[i].is_group){
//         newFuncObj[oldFuncPre[i].name] = {};
//         for (let domain= oldFuncPre[i].list,j = 0; j < domain.length; j++) {
//             newFuncObj[oldFuncPre[i].name][domain[j].name] = {};
//             for (let suite = domain[j].list,l = 0; l < suite.length; l++) {
//                 newFuncObj[oldFuncPre[i].name][domain[j].name][suite[l].test_suite_id] = [];
//                 for (let conf = suite[l].case_source,k = 0; k < conf.length; k++) {
//                     newFuncObj[oldFuncPre[i].name][domain[j].name][suite[l].test_suite_id].push(conf[k].test_conf_id);
//                 }
//             }
//         } 
//     }else{
//         newFuncObj[oldFuncPre[i].name] = {};
//         for (let suite= oldFuncPre[i].list,j = 0; j < suite.length; j++) {
//             newFuncObj[oldFuncPre[i].name][suite[j].test_suite_id] = [];
//             for (let conf = suite[j].case_source,k = 0; k < conf.length; k++) {
//                 newFuncObj[oldFuncPre[i].name][suite[j].test_suite_id].push(conf[k].test_conf_id);
//             }
//         }
//     }
// }
// setDomainResult({
//     functional: newFuncObj,
//     performance: newObj
// })