import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { Col, Breadcrumb, Button, message, Spin } from 'antd';
import { ReactComponent as IconEdit } from '@/assets/svg/icon_edit.svg';
import { ReactComponent as IconWarp } from '@/assets/svg/iconEdit.svg';
import { ReactComponent as IconLink } from '@/assets/svg/icon_link.svg'
import ReportHeader from './components/ReportHeader';
import ReportBasicInfo from './components/ReportBasicInfo';
import ReportSummary from './components/ReportSummary';
import ReportTestEnv from './components/ReportTestEnv';
import ReportTestPref from './components/ReportTestPerf';
import { useClientSize } from '@/utils/hooks'
import Catalog from './components/Catalog'
// import { writeDocumentTitle } from '@/utils/hooks';
import { editReport, saveReport, detailTemplate, reportDetail } from '../services';
import { history, useAccess, Access, useParams } from 'umi';
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import { ReportContext } from './Provider';
import Clipboard from 'clipboard';
import _ from 'lodash';
import { ReportTemplate, ReportBodyContainer, ReportWarpper, ReportBread, BreadDetailL, BreadDetailR, Btn } from './ReportUI';
import { CreatePageData, EditPageData } from './hooks';

const Report = (props: any) => {
    const { ws_id } = props.match.params
    // const { report_id, creator_id } = useParams();
    const { report_id } = useParams() as any;
    const [btnState, setBtnState] = useState<Boolean>(false)
    const [btnConfirm, setBtnConfirm ] = useState<boolean>(false)
    const [collapsed, setCollapsed] = useState(false)
    const { height: windowHeight } = useClientSize()
    const access = useAccess();
    const bodyRef = useRef<any>(null)
    const [obj, setObj] = useState<any>({
        test_item:{
            func_data:[],
            perf_data:[]
        }
    })
    
    const routeName = props.route.name
    
    const basicData:any = routeName === 'Report' || routeName === 'EditReport' || routeName === 'ShareReport' ? EditPageData(props) : CreatePageData(props);
    
    const {
        environmentResult,
        allGroupData,
        baselineGroupIndex,
        logoData,
        envData,
        summaryData,
        domainResult,
        setDomainResult,
        loading,
        saveReportData,
        queryReport,
    } = basicData
    
    //writeDocumentTitle(`Workspace.${props.route.name}`)
    window.document.title = saveReportData.name || 'T-one'

    useEffect(() => {
        if (routeName === 'Report') {
            setBtnState(false)
        } else if(routeName === 'ShareReport'){
            setBtnState(false)
        }else {
            setBtnState(true)
            //env?.base_index = baselineGroupIndex
            obj.test_env = _.cloneDeep(environmentResult) 
            obj.test_conclusion = _.cloneDeep(summaryData)
            setObj({
                ...obj
            })
        }
    }, [routeName])

    const handleEdit = () => {
        setBtnState(true)
    }

    // job_li
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
    const creator_id = window.location.search
    // 面包屑
    const BreadcrumbItem: React.FC<any> = () => (
        <ReportBread>
            <Breadcrumb.Item >
                <BreadDetailL onClick={() => history.push(`/ws/${ws_id}/test_report`)}>测试报告</BreadDetailL>
            </Breadcrumb.Item>
            <Breadcrumb.Item >
                <BreadDetailR onClick={() => history.go(0)}>{saveReportData?.name || '-'}</BreadDetailR>
                <Btn btnState={btnState}>
                    {
                        btnState ?
                            routeName !== 'ShareReport' && <Button type="primary" disabled={btnConfirm} onClick={handleSubmit}>{saveReportData?.id ? '更新' : '保存'}</Button>
                            : <>
                                <span style={{ marginRight: 18, cursor: 'pointer' }} className="test_report_copy_link"><IconLink style={{ marginRight: 4 }} />分享</span>
                                {
                                    routeName !== 'ShareReport' && 
                                    <Access accessible={access.WsTourist()}>
                                        <Access
                                            accessible={access.WsMemberOperateSelf(Number(creator_id.substring(5,creator_id.length)))}
                                            fallback={
                                                <span onClick={()=> AccessTootip()}><IconWarp style={{ marginRight: 4 }} />编辑</span>
                                            }
                                        >
                                            <span style={{ cursor: 'pointer' }} onClick={handleEdit}><IconEdit style={{ marginRight: 4 }} />编辑</span>
                                        </Access>
                                    </Access>
                                }
                            </>
                    }
                </Btn>
            </Breadcrumb.Item>
        </ReportBread>
    )

    // 复制功能
    useEffect(() => {
        const clipboard = new Clipboard('.test_report_copy_link', { text: () => location.origin + `/share/report/${report_id}`})
        clipboard.on('success', function (e) {
            message.success('报告链接复制成功')
            e.clearSelection();
        })
        return () => {
            clipboard.destroy()
            window.sessionStorage.clear()
        }
    }, [])
    
    
   
    //保存报告
    const handleSubmit = async () => {
        setBtnConfirm(true)
        obj.product_version = saveReportData.productVersion
        obj.project_id = saveReportData.project
        obj.report_source = 'job'
        obj.tmpl_id = saveReportData.template
        obj.ws_id = ws_id
        obj.job_li = getSelAllJob()
        if (saveReportData.id) {
            obj.report_id = saveReportData.id
            const res = await editReport(obj)
            if (res.code === 200) {
                message.success('更新报告成功')
                queryReport();
                setBtnState(false)
            } else {
                requestCodeMessage(res.code, res.msg)
            }
        } else {
            const data = await saveReport(obj)
            if (data.code === 200) {
                message.success('保存报告成功')
                history.push(`/ws/${ws_id}/test_report?t=list`)
            } else {
                requestCodeMessage(data.code, data.msg)
            }
        }
        setBtnConfirm(false)
    }
    let groupLen = allGroupData?.length
    return (
        <ReportContext.Provider value={{
            btnState,
            obj,
            saveReportData,
            allGroupData,
            logoData,
            envData,
            routeName,
            btnConfirm,
            baselineGroupIndex,
            domainResult,
            setDomainResult,
            summaryData,
            environmentResult,
            collapsed,
            groupLen,
            bodyRef,
            ws_id,
            setCollapsed,
            setObj
        }}>
            <Spin spinning={loading}>
                <ReportTemplate height={windowHeight - 50} >
                    {/* 目录部分 */}
                    <Catalog />
                    {/* 报告内容 */}
                    <ReportBodyContainer id={'report-body-container'} collapsed={collapsed}>
                        <ReportWarpper ref={bodyRef}>
                            <Col span={24}>
                                <BreadcrumbItem />
                                <ReportHeader />
                                <ReportBasicInfo />
                                <div style={{ width: 1200 }}>
                                    {
                                        domainResult?.is_default ?
                                        <>
                                            <ReportSummary /> 
                                            <ReportTestEnv /> 
                                            <ReportTestPref />
                                        </>
                                        :
                                        <>
                                            { domainResult?.need_test_summary && <ReportSummary /> }
                                            { domainResult?.need_test_env && <ReportTestEnv /> }
                                            <ReportTestPref />
                                        </>
                                    }
                                </div>
                            </Col>
                        </ReportWarpper>
                    </ReportBodyContainer>
                </ReportTemplate>
            </Spin>
        </ReportContext.Provider>
    )
}
export default memo(Report);


