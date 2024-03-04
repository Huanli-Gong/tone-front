/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { Col, Breadcrumb, Button, message, Spin, Row, Space } from 'antd';
import { ReactComponent as IconEdit } from '@/assets/svg/icon_edit.svg';
import { ReactComponent as IconWarp } from '@/assets/svg/iconEdit.svg';
import { ReactComponent as IconLink } from '@/assets/svg/icon_link.svg'
import ReportHeader from './components/ReportHeader';
import ReportBasicInfo from './components/ReportBasicInfo';
import ReportSummary from './components/ReportSummary';
import ReportTestEnv from './components/ReportTestEnv';
import ReportTestPref from './components/ReportTestPerf';
import { useClientSize, useCopyText } from '@/utils/hooks'
import Catalog from './components/Catalog'
import { editReport, getReportShareID, saveReport } from '../services';
import { history, useAccess, Access, useParams, useIntl, FormattedMessage, useLocation } from 'umi';
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import { ReportContext } from './Provider';
import _ from 'lodash';
import { ReportTemplate, ReportBodyContainer, ReportWarpper, ReportBread, BreadDetailL, BreadDetailR } from './ReportUI';
import { CreatePageData, EditPageData } from './hooks';
import SharePopover from './components/SharePopover';
import styled from "styled-components"

const HoverSpan = styled.span`
    &:hover {
        .ant-space-item {
            color: #1890FF;

            path {
                fill: #1890FF;
            }
        }
    }
`

// 面包屑
const BreadcrumbItem: React.FC<any> = ({ saveReportData, routeName, creator }) => {
    const { report_id, ws_id } = useParams() as any;
    const { formatMessage } = useIntl()

    const { pathname } = useLocation()
    const access = useAccess();
    const handleCopyText = useCopyText(formatMessage({ id: 'report.link.copied.successfully' }))

    const handleCopyOk = async (key: any) => {
        if (key === 1) {
            handleCopyText(location.origin + `/ws/${ws_id}/test_report/${report_id}/share`)
        }
        else {
            const { share_id } = await getReportShareID(report_id)
            handleCopyText(location.origin + `/share/report/${share_id}`)
        }
    }

    return (
        <Row justify={"space-between"} align="middle" style={{ height: 50 }}>
            <ReportBread>
                <Breadcrumb.Item >
                    <BreadDetailL onClick={() => history.push(`/ws/${ws_id}/test_report`)}>
                        <FormattedMessage id="report.test.report" />
                    </BreadDetailL>
                </Breadcrumb.Item>
                <Breadcrumb.Item >
                    <BreadDetailR onClick={() => history.go(0)}>{saveReportData?.name || '-'}</BreadDetailR>
                </Breadcrumb.Item>
            </ReportBread>
            {
                !['EditReport', 'CreateReport'].includes(routeName) &&
                <Space>
                    <SharePopover
                        list={[
                            {
                                value: 1,
                                label: formatMessage({ id: 'analysis.share_link.radio1' })
                            },
                            {
                                value: 2,
                                label: formatMessage({ id: 'analysis.share_link.radio2' })
                            },
                        ]}
                        onCopy={handleCopyOk}
                    >
                        <HoverSpan>
                            <Space size={4} style={{ cursor: 'pointer' }} align="center">
                                <IconLink />
                                <FormattedMessage id="operation.share" />
                            </Space>
                        </HoverSpan>
                    </SharePopover>

                    {
                        routeName !== 'ShareReport' &&
                        <Access
                            accessible={access.WsTourist() && access.WsMemberOperateSelf(creator)}
                            fallback={
                                <span
                                    onClick={() => AccessTootip()}
                                >
                                    <Space size={4} align="center">
                                        <IconWarp />
                                        <FormattedMessage id="operation.edit" />
                                    </Space>
                                </span>
                            }
                        >
                            <HoverSpan
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    const editPath = pathname.lastIndexOf("/") === pathname.length - 1 ? 'edit' : '/edit'
                                    history.push(`${pathname}${pathname !== 'EditReport' ? editPath : ''}`)
                                }}
                            >
                                <Space size={4} align="center">
                                    <IconEdit />
                                    <FormattedMessage id="operation.edit" />
                                </Space>
                            </HoverSpan>
                        </Access>
                    }
                </Space>
            }
        </Row>
    )
}


const templDesc = ['background_desc', 'test_method_desc']
const dataField = ['test_background', 'test_method', 'custom']

const Report: React.FC<AnyType> = (props) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any;
    const routeName = props.route.name
    const [btnState, setBtnState] = useState<boolean>(routeName === 'EditReport')
    const [btnConfirm, setBtnConfirm] = useState<boolean>(false)
    const [collapsed, setCollapsed] = useState(false)
    const { height: windowHeight } = useClientSize()
    const bodyRef = useRef<any>(null)
    const [obj, setObj] = useState<any>({
        test_item: {
            func_data: [],
            perf_data: []
        }
    })

    const basicData: any = ['Report', 'EditReport', 'ShareReport'].includes(routeName) ? EditPageData(props) : CreatePageData(props);

    const {
        environmentResult,
        allGroupData,
        baselineGroupIndex,
        logoData,
        envData,
        summaryData,
        domainResult,
        compareGroupData,
        setDomainResult,
        loading,
        saveReportData,
        wsId,
        queryReport,
        isFlag,
        creator
    } = basicData

    const groupLen = allGroupData?.length

    React.useEffect(() => {
        window.document.title = `${saveReportData.name || ""} - T-one`
    }, [saveReportData.name])

    useEffect(() => {
        if (routeName === 'Report') {
            setBtnState(false)
        } else if (routeName === 'ShareReport') {
            setBtnState(false)
        } else {
            setBtnState(true)
            setObj((draft: any) => {
                draft.test_env = environmentResult
                return draft
            })
        }
    }, [environmentResult])

    React.useEffect(() => {
        if (!saveReportData?.id) {
            if (summaryData && summaryData !== undefined && JSON.stringify(domainResult) !== "{}") {
                setObj((draft: any) => {
                    dataField.forEach((i: any, idx: number) => {
                        if (i === 'custom') {
                            if (summaryData && summaryData !== undefined) {
                                summaryData[i] = saveReportData?.test_conclusion?.custom || domainResult?.test_conclusion_desc
                                draft.test_conclusion = summaryData
                            }
                        }
                        else if (!draft[i] && saveReportData?.[i] || domainResult?.[templDesc[idx]]) {
                            draft[i] = saveReportData?.[i] || domainResult?.[templDesc[idx]]
                        }
                    })
                    return draft
                })
            }
        }
    }, [saveReportData, domainResult, summaryData])

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

    //保存报告
    const handleSubmit = async () => {
        setBtnConfirm(true)
        obj.product_version = saveReportData.productVersion
        obj.project_id = saveReportData.project
        obj.report_source = 'job'
        obj.tmpl_id = saveReportData.template
        obj.ws_id = ws_id
        obj.job_li = getSelAllJob()

        if (Object.prototype.toString.call(baselineGroupIndex) === "[object Number]")
            obj.test_env.base_index = baselineGroupIndex
        if (saveReportData.id) {
            obj.report_id = saveReportData.id

            delete obj.test_env.text

            const res = await editReport(obj)
            if (res.code === 200) {
                message.success(formatMessage({ id: 'report.update.report.succeeded' }))
                queryReport();
                history.push(`/ws/${ws_id}/test_report/${saveReportData.id}`)
            } else {
                requestCodeMessage(res.code, res.msg)
            }
        } else {
            if (!obj.name)
                obj.name = saveReportData.name
            const data = await saveReport(obj)
            if (data.code === 200) {
                message.success(formatMessage({ id: 'report.saved.successfully' }))
                history.push(`/ws/${ws_id}/test_report?t=list`)
            } else {
                requestCodeMessage(data.code, data.msg)
            }
        }
        setBtnConfirm(false)
    }

    const containerRef = React.useRef<HTMLDivElement>(null)

    return (
        <ReportContext.Provider
            value={{
                btnState,
                obj,
                saveReportData,
                allGroupData,
                compareGroupData,
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
                wsId,
                creator,
                isOldReport: saveReportData?.old_report,
                setCollapsed,
                setObj,
                containerRef
            }}
        >
            <Spin spinning={loading}>
                <ReportTemplate
                    height={windowHeight - 50}
                    style={{ paddingBottom: ['EditReport', 'CreateReport'].includes(routeName) ? 50 : 0 }}
                >
                    {/* 目录部分 */}
                    <Catalog />
                    {/* 报告内容 */}
                    <ReportBodyContainer
                        id={'report-body-container'}
                        ref={containerRef}
                        collapsed={collapsed}
                    >
                        <ReportWarpper ref={bodyRef}>
                            <Col span={24}>
                                {!!ws_id && <BreadcrumbItem saveReportData={saveReportData} routeName={routeName} creator={creator} />}
                                <ReportHeader />
                                <ReportBasicInfo />
                                <div style={{ width: 1200 }}>
                                    {domainResult?.is_default && <ReportSummary />}
                                    {domainResult?.is_default && <ReportTestEnv />}
                                    {!domainResult?.is_default && domainResult?.need_test_summary && <ReportSummary />}
                                    {!domainResult?.is_default && domainResult?.need_test_env && <ReportTestEnv />}
                                    <ReportTestPref />
                                </div>
                            </Col>

                            {
                                ['EditReport', 'CreateReport'].includes(routeName) &&
                                <Row
                                    align={'middle'}
                                    justify={'end'}
                                    style={{ height: 50, position: "fixed", bottom: 0, left: 0, width: "100%", backgroundColor: "#fff", paddingRight: 20, boxShadow: '0 0 10px 0 rgba(0,0,0,0.06)' }}
                                >
                                    <Button
                                        type="primary"
                                        disabled={btnConfirm}
                                        onClick={handleSubmit}
                                        loading={isFlag}
                                    >
                                        {
                                            saveReportData?.id ?
                                                <FormattedMessage id="operation.update" /> :
                                                <FormattedMessage id="operation.save" />
                                        }
                                    </Button>
                                </Row>
                            }
                        </ReportWarpper>
                    </ReportBodyContainer>
                </ReportTemplate>
            </Spin>
        </ReportContext.Provider>
    )
}
export default Report;


