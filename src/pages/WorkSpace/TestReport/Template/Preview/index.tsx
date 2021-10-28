import { resizeClientSize } from '@/utils/hooks'
import React, { memo, useEffect, useState, useRef } from 'react'
import { ReportTemplateContext } from '../Provider'
import { ReportBodyContainer, ReportBody } from '../styled'
import Catalog from '@/pages/WorkSpace/TestReport/Template/components/TemplateCatalog'
// import TemplateBreadcrumb from '@/pages/WorkSpace/TestReport/Template/components/TemplateBreadcrumb'
import { ArrowLeftOutlined } from '@ant-design/icons'
// LinkOutlined, FormOutlined 
import { Row, Space, Typography, Spin } from 'antd'
import { CustomRow, FullRow } from '@/pages/WorkSpace/TestReport/Template/Preview/styled'
import Summary from './components/Summary'
import TestEnv from './components/TestEnv'
import FunctionalTest from './components/FunctionalTest'
import PerformanceTest from './components/Performance'
import { queryReportTemplateDetails } from '../services'
import { history } from 'umi'
import { ReactComponent as BaseGroupIcon } from '@/assets/svg/TestReport/BaseIcon.svg'

import styled from 'styled-components'
import { useParams } from 'dva'

interface PreviewContainerProps {
    height: number;
}

const PreviewContainer = styled(Row) <PreviewContainerProps>`
    padding-bottom:0;
    padding-top:50px;
    background:#f5f5f5;
    width: 100%;
    height: ${({ height }) => height}px;
    position: relative;
`

const PreviewBar = styled.div`
    position:fixed;
    left:0;
    right:0;
    top:0;
    z-index:10;
    width:100%;
    padding:0 20px;
    height:50px;
    line-height:50px;
    background:#fff;
    .ant-typography { margin-bottom : 0;}
`

const TemplateName = styled.div`
    h3 { margin-bottom:0;}
`

const Description = styled.div`
    margin-top:8px;
`

const SettingRow: React.FC<any> = ({ show, title, id }) => (
    show ?
        <CustomRow id={id}>
            <Space direction="vertical">
                <Typography.Text strong><span className="line"></span>{title}</Typography.Text>
                <span>此处内容需生成报告后手动填写</span>
            </Space>
        </CustomRow> :
        <></>
)

const GroupTableRow = styled(FullRow)`
    margin-bottom:8px;
    height:48px;
    border-bottom:1px solid rgba(0,0,0,.10);
    border-right:1px solid rgba(0,0,0,.10);
    border-top:1px solid rgba(0,0,0,.10);
    &>div{display:flex;padding-left:8px;align-items:center;}
    &>div:first-child {width: 359px;}
    &>div:nth-child(n+2) {width: calc( ( 100% - 360px ) / 3 );border-left:1px solid rgba(0,0,0,.10);}
`

const { document }: any = window

const TemplatePreview = (props: any) => {
    const { ws_id, temp_id } = useParams<any>()
    const { windowHeight } = resizeClientSize()
    const [collapsed, setCollapsed] = useState(false)
    const [loading, setLoading] = useState(true)
    const [dataSource, setDataSource] = useState<any>({})

    const groupRowRef = useRef<any>(null)
    const refreshRowkey = (data: any, parentRowkey: any = null) => {
        const rowkey = parentRowkey ? `${parentRowkey}-` : ''

        return data.map((item: any, index: number) => {
            if (item.list) {
                return {
                    ...item,
                    rowkey: `${rowkey}${index}`,
                    list: refreshRowkey(item.list, `${rowkey}${index}`)
                }
            }
            return { ...item, rowkey: `${rowkey}${index}` }
        })
    }

    const defaultConf = {
        need_test_suite_description: true,
        need_test_env: true,
        need_test_description: true,
        need_test_conclusion: true,
        show_type: "list",
        test_data: false,
    }

    useEffect(() => {
        initData()
    }, [])

    const initData = async () => {
        setLoading(true)
        const { data } = await queryReportTemplateDetails({ ws_id, id: temp_id })
        const { perf_item, func_item, perf_conf, func_conf } = data

        const params: any = {
            func_conf: func_conf || defaultConf,
            perf_conf: perf_conf || defaultConf,
            perf_item: refreshRowkey(perf_item),
            func_item: refreshRowkey(func_item)
        }

        // console.log(params)
        document.title = `${data.name} - T-One`
        setDataSource(Object.assign(data, params))

        setLoading(false)
    }

    const handleBack = () => {
        history.push(`/ws/${ws_id}/test_report?t=template`)
    }

    const [fixedRow, setFixedRow] = useState({
        left: 0,
        width: 0,
        show: false
    })

    const hanldeScrollChange = ({ target }: any) => {
        setFixedRow({
            left: groupRowRef.current?.offsetLeft,
            width: groupRowRef.current?.offsetWidth,
            show: target.scrollTop > groupRowRef.current.offsetTop
        })
    }

    useEffect(() => {
        setFixedRow({
            ...fixedRow,
            left: groupRowRef.current?.offsetLeft,
            width: groupRowRef.current?.offsetWidth
        })
    }, [groupRowRef.current, collapsed])

    useEffect(() => {
        document.querySelector('#report-body-container').addEventListener('scroll', hanldeScrollChange)
        return () => {
            document.querySelector('#report-body-container').removeEventListener('scroll', hanldeScrollChange)
        }
    }, [])

    const [bodyWidth, setBodyWidth] = useState(1200)
    const bodyRef = useRef<any>(null)

    const hanldePageResize = () => setBodyWidth(bodyRef.current.offsetWidth)

    useEffect(() => {
        const targetNode = document.getElementById('report-body-container');
        const config = { attributes: true, childList: true, subtree: true };
        const observer = new MutationObserver(hanldePageResize);
        observer.observe(targetNode, config);
        return () => {
            observer.disconnect();
        }
    }, [])

    return (
        <ReportTemplateContext.Provider value={{ dataSource, setDataSource, collapsed, setCollapsed, bodyWidth }}>
            <Spin spinning={loading}>
                <PreviewContainer height={windowHeight}>
                    <PreviewBar>
                        <Row align="middle">
                            <Space>
                                <span onClick={handleBack} ><ArrowLeftOutlined style={{ fontSize: 20 }} /></span>
                                <Space size={0}>
                                    <Typography.Title level={4} >报告模板预览</Typography.Title>
                                    <span style={{ color: 'rgba(0,0,0,0.45)' }}>（以3个对比组为例）</span>
                                </Space>
                            </Space>
                        </Row>
                    </PreviewBar>
                    <Catalog style={{ height: windowHeight - 50 }} />
                    <ReportBodyContainer id="report-body-container" collapsed={collapsed} style={{ height: windowHeight - 50 }}>
                        <ReportBody ref={bodyRef}>
                            {/* <TemplateBreadcrumb {...props} /> */}

                            <CustomRow style={{ marginTop: 20 }}>
                                <TemplateName >
                                    <Typography.Title level={3}>{dataSource?.name}</Typography.Title>
                                </TemplateName>
                                <Description>
                                    {dataSource?.description}
                                </Description>
                            </CustomRow>

                            <SettingRow title="测试背景" id={'need_test_background'} show={dataSource?.need_test_background} />
                            <SettingRow title="测试方法" id={'need_test_method'} show={dataSource?.need_test_method} />
                            <SettingRow title="测试结论" id={'need_test_conclusion'} show={dataSource?.need_test_conclusion} />

                            {
                                dataSource.need_test_summary &&
                                <Summary />
                            }

                            <TestEnv
                                need_test_env={dataSource?.need_test_env}
                                need_env_description={dataSource?.need_env_description}
                            />

                            <CustomRow >
                                <div id={'test_data'} style={{ marginBottom: 8 }}><Typography.Text strong>测试数据</Typography.Text></div>
                                <GroupTableRow ref={groupRowRef} >
                                    <div><Typography.Text strong>对比组</Typography.Text></div>
                                    <div>
                                        <Space>
                                            <BaseGroupIcon style={{ transform: 'translateY(2px)' }} />
                                            <Typography.Text strong>基准组</Typography.Text>
                                        </Space>
                                    </div>
                                    <div><Typography.Text strong>对比组1</Typography.Text></div>
                                    <div><Typography.Text strong>对比组2</Typography.Text></div>
                                </GroupTableRow>
                                {
                                    fixedRow.show &&
                                    <div style={{ width: fixedRow.width, background: '#fff', position: 'fixed', top: 50, height: 50, border: '1px solid rgba(0,0,0,0.10)', zIndex: 5, }}>
                                        <GroupTableRow style={{ border: 'none', paddingLeft: 32, paddingRight: 32 }} >
                                            <div><Typography.Text strong>对比组</Typography.Text></div>
                                            <div>
                                                <Space>
                                                    <BaseGroupIcon style={{ transform: 'translateY(2px)' }} />
                                                    <Typography.Text strong>基准组</Typography.Text>
                                                </Space>
                                            </div>
                                            <div><Typography.Text strong>对比组1</Typography.Text></div>
                                            <div><Typography.Text strong>对比组2</Typography.Text></div>
                                        </GroupTableRow>
                                    </div>
                                }

                                {
                                    (dataSource?.need_perf_data) &&
                                    <>
                                        <div id={'perf_item'} style={{ marginBottom: 8 }}><Typography.Text strong>性能测试</Typography.Text></div>
                                        <PerformanceTest is_default={dataSource.is_default} field={'perf_item'} perf_conf={dataSource.perf_conf} perf_item={dataSource.perf_item} />
                                    </>
                                }

                                {
                                    (dataSource?.need_func_data) &&
                                    <>
                                        <div id={'func_item'} style={{ marginBottom: 8 }}><Typography.Text strong>功能测试</Typography.Text></div>
                                        <FunctionalTest is_default={dataSource.is_default} field={'func_item'} func_conf={dataSource.func_conf} func_item={dataSource.func_item} />
                                    </>
                                }
                            </CustomRow>
                        </ReportBody>
                    </ReportBodyContainer>
                </PreviewContainer>
            </Spin>
        </ReportTemplateContext.Provider >
    )
}

export default memo(TemplatePreview)


{/* <Row justify="space-between">
                                <Space>
                                    <Space>
                                        <LinkOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
                                        <Typography.Text disabled style={{ cursor: 'default' }}>分享</Typography.Text>
                                    </Space>
                                    <Space>
                                        <FormOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
                                        <Typography.Text disabled style={{ cursor: 'default' }}>编辑</Typography.Text>
                                    </Space>
                                </Space>
                            </Row> */}