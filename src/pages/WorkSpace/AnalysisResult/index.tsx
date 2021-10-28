import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layout, Breadcrumb, message, Spin } from 'antd';
import { UpOutlined } from '@ant-design/icons';
import { writeDocumentTitle } from '@/utils/hooks';
import TestEnvironment from './components/TestEnvironment';
import PerformanceTest from './components/PerformanceTest';
import FunctionalTest from './components/FunctionalTest';
import { Scrollbars } from 'react-custom-scrollbars';
import { queryForm } from './service';
import { queryCompareResultList, queryEenvironmentResultList } from '../TestAnalysis/AnalysisCompare/services'
import styles from './index.less'
export default (props: any) => {
    const local = props.history.location
    const id = local.query.form_id
    const [ testDataParam,setTestDataParam ] = useState({})
    const [ paramEenvironment,setParamEenvironment ] = useState({})
    const [ allGroupData,setAllGroupData ] = useState([])
    const [ baselineGroupIndex,setBaselineGroupIndex ] = useState(0)
    const [ loading,setLoading ] = useState(false)
    const queryCompareForm = async() => {
        const data = await queryForm({ form_id: id })
        if(data.code == 200){
            const shareData = JSON.parse(data.data.req_form)
            setTestDataParam(shareData.testDataParam)
            setParamEenvironment(shareData.envDataParam)
            setAllGroupData(shareData.allGroupData)
            setBaselineGroupIndex(shareData.baselineGroupIndex)
        }
    }
    useEffect(()=>{
        if(JSON.stringify(id) !== '{}' && id !== undefined){
            queryCompareForm()
        }else{
            setTestDataParam(local.state.testDataParam)
            setParamEenvironment(local.state.envDataParam)
            setAllGroupData(local.state.allGroupData)
            setBaselineGroupIndex(local.state.baselineGroupIndex)
        }
    },[id])
    
    const [ compareResult,setCompareResult ] = useState({})
    const [ environmentResult,setEnvironmentResult ] = useState({})

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
        .then(res=>{
            if(res[0].code == 200 && res[1].code == 200){
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
        if(JSON.stringify(testDataParam) !== '{}' && JSON.stringify(paramEenvironment) !== '{}'){
            handleData()
        }   
    }, [testDataParam,paramEenvironment])
    const { ws_id } = props.match.params
    writeDocumentTitle(`Workspace.TestAnalysis.${props.route.name}`)
    const [layoutHeight, setLayoutHeight] = useState(innerHeight)
    const [scrollLength, setScrollLength] = useState<number>(0)
    const [show,setShow ] = useState(false)
    const scrollbarsRef = useRef<any>(null)
    const windowHeight = () => setLayoutHeight(innerHeight)
    useEffect(() => {
        window.addEventListener('resize', windowHeight)
        return () => {
            window.removeEventListener('resize', windowHeight)
        }
    }, [])
    const handleTop = (evt: any) => {
        let runTop = evt.target.scrollTop
        scrollbarsRef.current.getScrollTop()
        if(runTop > 600){
            setShow(true)
        }else{
            setShow(false)
        }
    }
    const backTop = (evt: any) => {
        scrollbarsRef.current.scrollTop(0)
    }

    const handleScroll = (evt: any) => {
        const runLeft = evt.target.scrollLeft
        const children = document.querySelectorAll('.table_bar .ant-table-content')
        for (let x = 0; x < children.length; x++) {
            children[x].scrollLeft = runLeft
        }
    }
    
    const setScrollWidth = (num: number) => {
        setScrollLength(num)
    }
    return (
        <div className={styles.layoutwarp}>
            <Scrollbars
                onScroll={handleTop}
                ref={scrollbarsRef}
                style={{
                    width: '100%',
                    height: layoutHeight - 50,
                    position:'relative'
                }}
            >
                <Layout style={{ overflow: 'hidden' }} >
                    <Layout.Content style={{ background: '#fff' }}>
                        <Spin spinning={loading}>
                            { environmentResult && JSON.stringify(environmentResult) !== '{}' &&
                                <TestEnvironment 
                                    {...props.history.location.state}
                                    ws_id={ws_id}
                                    setScrollWidth={setScrollWidth}  
                                    data={ environmentResult } 
                                    groupData={ allGroupData } 
                                    baseIndex={ baselineGroupIndex }
                                />
                            }   
                            <div style={{ height: 10, backgroundColor: '#fafafa' }}></div>
                            <div className={styles.data_title}>测试数据</div>
                            { environmentResult && JSON.stringify(environmentResult) !== '{}' && JSON.stringify(compareResult) !== '{}' &&
                                <PerformanceTest 
                                    data={ compareResult } 
                                    //compareData={ compareGroupData } 
                                    groupData={ allGroupData } 
                                    baseIndex={ baselineGroupIndex }
                                    identify={ environmentResult }
                                />
                            }
                            {
                                JSON.stringify(compareResult) !== '{}' && 
                                <FunctionalTest data={ compareResult } groupData={ allGroupData } baseIndex={ baselineGroupIndex }/>
                            }
                        </Spin>
                        <div style={{ height: 10, backgroundColor: '#fafafa' }}></div>
                        <Scrollbars
                            autoHeight
                            style={{
                                width: '100%', height: 8,position:'fixed',bottom:10
                            }}
                            onScroll={handleScroll}
                        >
                            <p style={{ width: scrollLength + 40 , height: 10 }} />
                        </Scrollbars>
                    </Layout.Content>
                </Layout>
                {
                    show && <div style={{ width:44,height:44,borderRadius:2,backgroundColor:'rgb(0, 0, 0, 0.1)',position:'fixed',bottom:10,right:20}}
                            onClick={backTop}>
                                <UpOutlined style={{ fontSize:30,padding:7,color:'rgb(0, 0, 0, 0.7)'}}/>
                            </div>
                }
                
            </Scrollbars>
        </div>
    )
}


// const BreadcrumbItem: React.FC<any> = () => (
    //     <Breadcrumb style={{ height: 62, padding: 20 }}>
    //         <Breadcrumb.Item >
    //             <span style={{ cursor: 'pointer' }} onClick={() => {
    //                 history.push(props.breadcrumbType().href)
    //                 window.sessionStorage.removeItem('compareData')
    //                 window.sessionStorage.removeItem('originType')
    //             }}>{props.breadcrumbType().text}</span>
    //         </Breadcrumb.Item>
    //         <Breadcrumb.Item >
    //             <span style={{ cursor: 'pointer' }} onClick={() => history.go(0)}>配置页</span>
    //         </Breadcrumb.Item>
    //         <Breadcrumb.Item>分析结果</Breadcrumb.Item>
    //     </Breadcrumb>
    // )