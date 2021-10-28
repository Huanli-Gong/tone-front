import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Breadcrumb, message, Button, Spin, Space } from 'antd';
import { editReport, detailTemplate, reportDetail } from '../services'
import { Wrapper, Header, Line, OverView, TestEnv, TestData } from './styled'
import { AuthMemberForm } from '@/components/Permissions/AuthMemberCommon';
import SummaryTable from './components/SummaryTable'
import TestEnvironment from './components/TestEnvironment';
import TestDataPage from '../Report/components/TestDataPage';
import { Scrollbars } from 'react-custom-scrollbars'
import { SettingEdit,SettingTextArea } from '@/components/ReportEidt/index';
import { UpOutlined } from '@ant-design/icons';
import Catalog from '../Report/components/Catalog';
import { ReactComponent as IconEdit } from '@/assets/svg/icon_edit.svg';
import { ReactComponent as IconLink } from '@/assets/svg/icon_link.svg'
import { isArray } from 'lodash';
import Clipboard from 'clipboard'
import { history, useAccess } from 'umi'
import { requestCodeMessage } from '@/utils/utils';

const ReportPage = (props: any) => {
    const { ws_id, report_id } = props.match.params
    const { pathname } = location;
    // const defaultConf = {
    //     need_test_suite_description: true,
    //     need_test_env: true,
    //     need_test_description: true,
    //     need_test_conclusion: true,
    //     show_type: "list",
    //     test_data: false,
    // }
    const [dataSource, setDataSource] = useState<any>({})
    const [baselineGroupIndex, setBaselineGroupIndex] = useState(0)
    const [layoutHeight, setLayoutHeight] = useState(innerHeight)
    const [loading, setLoading] = useState(false)
    const [btnState, setBtnState] = useState(false)
    const [scrollLength, setScrollLength] = useState<number>(0)
    const [groupData, setGroupData] = useState([])
    const [testItem,setTestItem] = useState(false)
    const [template, setTemplate] = useState<any>({
        // name: "",
        // is_default: true,
        // need_test_background: true,
        // need_test_method: true,
        // need_test_summary: true,
        // need_test_conclusion: true,
        // need_test_env: true,
        // need_func_data: true,
        // need_perf_data: true,
        // description: "",
        // perf_conf: defaultConf,
        // perf_item: [],
        // func_item: [],
    })
    const [obj, setObj] = useState<any>({})
    const [btn, setBtn] = useState(true)
    const [show,setShow ] = useState(false)
    const scrollbarsRef = useRef<any>(null)
    const access = useAccess()
    const catalogRef: any = useRef()
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
    const handleTop = (evt: any) => {
        let runTop = evt.target.scrollTop
        scrollbarsRef?.current?.getScrollTop()
        if(runTop > 600){
            setShow(true)
        }else{
            setShow(false)
        }
    }
    const backTop = (evt: any) => {
        scrollbarsRef.current.scrollTop(0)
    }
    useEffect(() => {
        if (pathname.indexOf('edit') !== -1) {
            setBtn(true)
        } else if(pathname.indexOf('test_create_report') !== -1){
            setBtn(true)
        }else {
            setBtn(false)
        }
        window.sessionStorage.clear()
    }, [pathname])

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
                        if (isArray(perf_data[i])) {
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
                        if (isArray(func_data[i])) {
                            func_item.push({
                                name: i,
                                list: func_data[i]
                            })
                        } else {
                            const list = changeChild(func_data[i],index)
                            func_item.push({
                                name: i,
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
    useEffect(() => {
        const clipboard = new Clipboard('.test_report_copy_link', { text: () => location.href })
        clipboard.on('success', function (e) {
            message.success('复制成功')
            e.clearSelection();
        })
        return () => {
            clipboard.destroy()
            window.sessionStorage.clear()
        }
    }, [])

    // 默认和自定义模版的切换
    const switchReport = useMemo(() => {
        if (template.is_default) {
            return false
        } else {
            return true
        }
    }, [template])

    let test_conclusion: any, test_env: any;
    if (JSON.stringify(dataSource) !== '{}') {
        test_conclusion = JSON.parse(dataSource?.test_conclusion)
        test_env = JSON.parse(dataSource?.test_env)
    }
    //更新需要的数据结构
    useEffect(() => {
        dataSource.tmpl_id && temp()
        if (test_conclusion && JSON.stringify(test_conclusion) !== '{}') {
            let conclusion = test_conclusion.summary?.compare_groups
            let newArr: any = []
            newArr.push(test_conclusion.summary?.base_group)
            for (let i = 0; i < conclusion.length; i++) {
                newArr.push(conclusion[i])
            }
            setGroupData(newArr)
            setBaselineGroupIndex(test_env?.base_index === undefined ? 0 : test_env?.base_index)
        }
        setObj({
            report_id: dataSource.id,
            name: dataSource.name,
            description: dataSource.description,
            test_background: dataSource.test_background,
            test_method: dataSource.test_method,
            report_source: 'job',
            test_conclusion: dataSource.test_conclusion,
            test_env: dataSource.test_env,
            //test_item: dataSource.test_item
        })
        window.document.title = dataSource.name || 'T-one'
    }, [dataSource])
    // 获取屏幕高度
    const windowHeight = () => setLayoutHeight(innerHeight)
    useEffect(() => {
        window.addEventListener('resize', windowHeight)
        return () => {
            window.removeEventListener('resize', windowHeight)
        }
    }, [])
    

    const setScrollWidth = (num: number) => {
        setScrollLength(num)
    }

    const BreadcrumbItem: React.FC<any> = () => (
        <Breadcrumb style={{ height: 62, padding: '20px 0' }}>
            <Breadcrumb.Item >
                <span style={{ cursor: 'pointer' }} onClick={() => history.push(`/ws/${ws_id}/test_report`)}>测试报告</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item >
                <span style={{ cursor: 'pointer' }} onClick={() => history.go(0)}>{dataSource.name}</span>
            </Breadcrumb.Item>
        </Breadcrumb>
    )
    
    const handleChangeVal = (val: any, text: string) => {
        if (text == 'custom') {
            let custom: any = obj.test_conclusion
            let parse_custom = JSON.parse(custom)
            parse_custom[text] = val
            setObj({
                ...obj,
                test_conclusion: JSON.stringify(parse_custom)
            })
        } else {
            obj[text] = val
            setObj({
                ...obj,
            })
        }
    }
    const handleSubmit = async () => {
        setBtnState(true)
        if (window.sessionStorage.getItem('test_env')) {
            obj.test_env = window.sessionStorage.getItem('test_env')
        }
        if(testItem){
            let item: any = window.sessionStorage.getItem('test_item')
            obj.test_item = JSON.parse(item)
        }
        const res = await editReport(obj)
        if (res.code === 200) {
            message.success('更新报告成功')
            setBtnState(false)
            setBtn(false)
            queryReport()
        } else {
            requestCodeMessage( res.code , res.msg )
        }
    }

    const handleEdit = () => {
        setBtn(true)
    }
  
    const handleScroll = (evt: any) => {
        const runLeft = evt.target.scrollLeft
        const children = document.querySelectorAll('.table_bar .ant-table-content')
        for (let x = 0; x < children.length; x++) {
            children[x].scrollLeft = runLeft
        }
    }
    return (
        <Spin spinning={loading}>
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
                                name={dataSource.name || '-'}
                                position="center"
                                text=""
                                btn={btn}
                                onOk={(val: any) => handleChangeVal(val, 'name')}
                            />
                            {btn && <Button type="primary" className="btn" onClick={handleSubmit} disabled={btnState}>更新</Button>}
                        </div>
                        <div className="describe">
                            描述  <SettingEdit
                                name={dataSource.description || '-'}
                                position="center"
                                text=""
                                btn={btn}
                                onOk={(val: any) => handleChangeVal(val, 'description')}
                            />
                        </div>
                        <div className="report">
                            报告创建于 {dataSource.gmt_created}
                        </div>
                        {!btn && access.wsTouristFilter() && 
                        <div className="action">
                            <AuthMemberForm 
                                isAuth={['sys_test_admin', 'user', 'ws_member']}
                                children={ 
                                    <span className="edit"><IconEdit style={{ marginRight: 5 }} />编辑报告</span>
                                }
                                onFirm={ <span className="edit" onClick={handleEdit}><IconEdit style={{ marginRight: 5 }} />编辑报告</span>}
                                creator_id={dataSource.creator}
                            />
                            <span className="link test_report_copy_link" ><IconLink style={{ marginRight: 5 }} />分享</span>
                        </div>}
                        {btn && <div className="empty"></div>}
                    </Header>
                    <Line></Line>
                    {
                        !template?.need_test_background &&
                            !template?.need_test_conclusion &&
                            !template?.need_test_summary
                            ? <></> : <>
                                <OverView>
                                    <div className="title" id="overView"> <span className="line"></span>概述 </div>
                                    {template?.need_test_background &&
                                        <div className="test_background" id="test_background">
                                            <SettingTextArea
                                                name={dataSource.test_background || '-'}
                                                position="bottom"
                                                text="测试背景"
                                                btn={btn}
                                                onOk={(val: any) => handleChangeVal(val, 'test_background')}
                                            />
                                        </div>
                                    }
                                    {
                                        template?.is_default && <div className="test_method" id="test_method">
                                            <SettingTextArea
                                                name={dataSource.test_method || '-'}
                                                position="bottom"
                                                text="测试方法"
                                                btn={btn}
                                                onOk={(val: any) => handleChangeVal(val, 'test_method')}
                                            />
                                        </div>
                                    }
                                    {template?.need_test_conclusion &&
                                        <div className="test_result" id="test_result">
                                            <SettingTextArea
                                                name={test_conclusion?.custom || '-'}
                                                position="bottom"
                                                text="测试结论"
                                                btn={btn}
                                                onOk={(val: any) => handleChangeVal(val, 'custom')}
                                            />
                                        </div>
                                    }
                                    {template?.need_test_summary &&
                                        <div className="summary" id="summary">
                                            <div className="summary_text">Summary:</div>
                                            <SummaryTable setScrollWidth={setScrollWidth} result={dataSource.test_item} data={test_conclusion} groupData={groupData} baseIndex={baselineGroupIndex} />
                                        </div>
                                    }
                                </OverView>
                                <Line></Line>
                            </>
                    }
                    {template?.need_test_env &&
                        <>
                            <TestEnv >
                                <TestEnvironment setScrollWidth={setScrollWidth} template={template} btn={btn} data={test_env} groupData={groupData} baseIndex={baselineGroupIndex}/>
                            </TestEnv>
                            <Line></Line>
                        </>
                    }
                    <TestData >
                        {/* <TestDataPage 
                        btn={btn} 
                        data={dataSource.test_item} 
                        template={template} 
                        identify={ test_env }
                        groupData={groupData} 
                        source={ dataSource }
                        baseIndex={baselineGroupIndex} 
                        onSourceChange={ setDataSource }
                    /> */}
                        <TestDataPage
                            btn={btn}
                            setTestItem={setTestItem}
                            switchReport={switchReport}
                            domain={template}
                            identify={test_env}
                            groupData={groupData}
                            baseIndex={baselineGroupIndex}
                        />
                    </TestData>
                    <Catalog
                        onClick={() => catalogRef.current.open()}
                        dataSource={template}
                        onSourceChange={setTemplate}
                        ref={catalogRef}
                    />
                    <Scrollbars
                        autoHeight
                        style={{
                            width: '100%', height: 8,position:'fixed',bottom:10
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
        </Spin>
    )
}

export default ReportPage;