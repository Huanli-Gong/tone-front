import { useClientSize } from '@/utils/hooks'
import React, { memo, useEffect, useState, useRef, useLayoutEffect } from 'react'
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
import { history, useParams } from 'umi'
import { ReactComponent as BaseGroupIcon } from '@/assets/svg/TestReport/BaseIcon.svg'
import lodash from 'lodash'
import produce from 'immer'
import styled from 'styled-components'
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

const SettingRow: React.FC<any> = ({ show, title, id, desc }) => (
    show ?
        <CustomRow id={`preview_${id}`}>
            <Space direction="vertical">
                <Typography.Text strong><span className="line"></span>{title}</Typography.Text>
                <span style={{ whiteSpace:'pre-wrap'}}>
                    {desc || "此处内容需生成报告后手动填写"}
                </span>
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
    const { route, dataSet, setIsPreview } = props
    const isCreatePreview = ["TemplateCreate", "TemplateEdit"].includes(route.name)
    const { ws_id, temp_id } = useParams<any>()
    const { height: windowHeight } = useClientSize()
    const [collapsed, setCollapsed] = useState(false)
    const [loading, setLoading] = useState(true)
    const [dataSource, setDataSource] = useState<any>({})

    const groupRowRef = useRef<any>(null)
    const refreshRowkey = (data: any, parentRowkey: any = null) => {
        const rowkey = parentRowkey ? `${parentRowkey}-` : ''
        return data.map((item: any, index: number) => {
            const itemKey = `${rowkey}${index}`

            if (item.list) {
                return {
                    ...item,
                    rowkey: itemKey,
                    list: refreshRowkey(item.list, itemKey)
                }
            }
            return { ...item, rowkey: itemKey }
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
        if (isCreatePreview) {
            setDataSource(dataSet)
            setLoading(false)
        }
        else {
            try {
                setLoading(true)
                const { data } = await queryReportTemplateDetails({ ws_id, id: temp_id })
                const { perf_item, func_item, perf_conf, func_conf, name } = data
                document.title = `${name} - T-One`

                setDataSource(produce(data, (draft: any) => {
                    draft.func_conf = func_conf || defaultConf
                    draft.perf_conf = perf_conf || defaultConf
                    draft.perf_item = refreshRowkey(perf_item)
                    draft.func_item = refreshRowkey(func_item)
                }))

                setLoading(false)
            }
            catch (error) {
                console.log(error)
            }
        }
    }

    const handleBack = () => {
        if (isCreatePreview) return setIsPreview(false)
        history.push(`/ws/${ws_id}/test_report?t=template`)
    }

    const [fixedRow, setFixedRow] = useState({
        left: 0,
        width: 0,
        show: false,
        scrollTop: 0
    })

    const hanldeScrollChange = lodash.debounce(({ target }: any) => {
        setFixedRow({
            left: groupRowRef.current?.offsetLeft,
            width: groupRowRef.current?.offsetWidth,
            show: target.scrollTop > groupRowRef.current.offsetTop,
            scrollTop: target.scrollTop,
        })
    }, 30)

    useEffect(() => {
        setFixedRow({
            ...fixedRow,
            left: groupRowRef.current?.offsetLeft,
            width: groupRowRef.current?.offsetWidth
        })
    }, [groupRowRef.current, collapsed])

    useEffect(() => {
        document.querySelector('#report-body-container-preview').addEventListener('scroll', hanldeScrollChange)
        return () => {
            document.querySelector('#report-body-container-preview').removeEventListener('scroll', hanldeScrollChange)
        }
    }, [])

    const [bodyWidth, setBodyWidth] = useState(1200)
    const bodyRef = useRef<any>(null)

    const hanldePageResize = lodash.debounce(() => setBodyWidth(bodyRef.current.offsetWidth), 30)

    useEffect(() => {
        const targetNode = document.getElementById('report-body-container-preview');
        const config = { attributes: true, childList: true, subtree: true };
        const observer = new MutationObserver(hanldePageResize);
        observer.observe(targetNode, config);
        return () => {
            observer.disconnect();
        }
    }, [])

    return (
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
                <Catalog
                    {...{ dataSource, setDataSource, collapsed, setCollapsed, bodyWidth }}
                    style={{ height: windowHeight - 50 }}
                    prefix={"preview_"}
                />
                <ReportBodyContainer id="report-body-container-preview" collapsed={collapsed} style={{ height: windowHeight - 50 }}>
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

                        {
                            [
                                ["测试背景", "need_test_background", "background_desc"],
                                ["测试方法", "need_test_method", "test_method_desc"],
                                ["测试结论", "need_test_conclusion", "test_conclusion_desc"],
                            ].map((item: any) => {
                                const [title, field, desc] = item
                                return (
                                    <SettingRow
                                        key={field}
                                        title={title}
                                        id={field}
                                        show={dataSource[field]}
                                        desc={dataSource[desc]}
                                    />
                                )
                            })
                        }

                        {
                            dataSource.need_test_summary &&
                            <Summary />
                        }

                        <TestEnv
                            env_description_desc={dataSource?.env_description_desc}
                            need_test_env={dataSource?.need_test_env}
                            need_env_description={dataSource?.need_env_description}
                        />

                        <CustomRow >
                            <div id={'preview_test_data'} style={{ marginBottom: 8 }}><Typography.Text strong>测试数据</Typography.Text></div>
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
                                    <div
                                        id={'preview_perf_item'}
                                        style={{ marginBottom: 8 }}
                                    >
                                        <Typography.Text strong>
                                            性能测试
                                        </Typography.Text>
                                    </div>
                                    <PerformanceTest
                                        is_default={dataSource.is_default}
                                        field={'perf_item'}
                                        perf_conf={dataSource.perf_conf}
                                        perf_item={dataSource.perf_item}
                                    />
                                </>
                            }

                            {
                                (dataSource?.need_func_data) &&
                                <>
                                    <div
                                        id={'preview_func_item'}
                                        style={{ marginBottom: 8 }}
                                    >
                                        <Typography.Text strong>
                                            功能测试
                                        </Typography.Text>
                                    </div>
                                    <FunctionalTest
                                        is_default={dataSource.is_default}
                                        field={'func_item'}
                                        func_conf={dataSource.func_conf}
                                        func_item={dataSource.func_item}
                                    />
                                </>
                            }
                        </CustomRow>
                    </ReportBody>
                </ReportBodyContainer>
            </PreviewContainer>
        </Spin>
    )
}

export default memo(TemplatePreview)