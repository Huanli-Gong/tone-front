import { Divider, Space, Tooltip, Typography } from "antd"
import React from "react"
import { useIntl, useParams } from "umi"
import { getShareInfo, queryFuncAnalysisList } from "./services"
import ClusterChart from '@/pages/WorkSpace/TestAnalysis/AnalysisTime/components/PerformanceCharts/Cluster'
import StandaloneChart from '@/pages/WorkSpace/TestAnalysis/AnalysisTime/components/PerformanceCharts/Standalone'
import ChartRender from '@/pages/WorkSpace/TestAnalysis/AnalysisTime/components/RenderChart'
import AnalysisTable from '@/pages/WorkSpace/TestAnalysis/AnalysisTime/components/Table'
import { MinusOutlined } from "@ant-design/icons"
import LoadingComp from "./components/Loading"
import EmptyComp from "./components/EmptyComp"

const PAGE_FIELD_MAP: any = [
    ['test_type', 'ws.result.details.test_type'],
    ['env', 'analysis.env'],
    ['project', 'analysis.project'],
    ['tag', 'analysis.tag'],
    ['date', 'analysis.date'],
]

const fieldMap = new Map(PAGE_FIELD_MAP)
const useFieldMessage = (str: string) => {
    const { formatMessage } = useIntl()
    const id: any = fieldMap.get(str)
    return id ? formatMessage({ id }) : ''
}

const FieldTooltip: React.FC<{ name: string, content: any, hasDivider?: boolean }> = ({ name, content, hasDivider = false }) => {
    const title = useFieldMessage(name)

    if (!content)
        return (
            <>
                -
                {
                    hasDivider &&
                    <Divider type="vertical" />
                }
            </>)
    return (
        <>
            < Tooltip
                title={title}
            >
                <Typography.Text>
                    {content || '-'}
                </Typography.Text>
            </Tooltip >
            {
                hasDivider &&
                <Divider type="vertical" />
            }
        </>
    )
}

const SpaceTitle: React.FC<{ name: string; context: any }> = ({ name, context }) => {
    if (!context) return <></>
    return (
        <Space>
            <span >{name}</span>
            {context}
        </Space>
    )
}

const SharePage: React.FC = () => {
    const { share_id } = useParams() as any
    const { formatMessage } = useIntl()

    const [source, setSource] = React.useState<any>()
    const [loading, setLoading] = React.useState(true)
    const [cLoading, setCLoading] = React.useState(true)
    const [tableData, setTableData] = React.useState<any>([])

    const getFuncChartData = async (params: any) => {
        setCLoading(true)
        const { data, code } = await queryFuncAnalysisList({ ...params, share_id })
        setCLoading(false)
        if (code !== 200) return
        const { case_map, job_list } = data
        setSource((p: any) => ({ ...p, case_map }))
        setTableData(job_list)
    }

    const init = async () => {
        setLoading(true)
        const { data, code } = await getShareInfo({ share_id })
        setLoading(false)

        if (code !== 200) return
        const { provider_env, test_type, metricList } = data

        setSource({
            ...data,
            test_type_name: formatMessage({ id: `analysis.${test_type}` }),
            provider_name: formatMessage({ id: provider_env }),
            metric: metricList
        })

        if (test_type !== 'functional' && !data?.fetchData) {
            setCLoading(false)
        }

        if (test_type === 'functional') {
            if (data?.show_type === 'pass_rate' && !data?.case_name) {
                setCLoading(false)
                return
            }

            if (data?.show_type === 'result_trend' && !data?.sub_case_name) {
                setCLoading(false)
                return
            }

            getFuncChartData(data)
        }
    }

    React.useEffect(() => {
        init()
    }, [])

    const handleValueChange = (list: any[]) => {
        setTableData((p: any) => {
            const ids = list.map(((i: any) => i.id))
            return p.filter((i: any) => !ids.includes(i.id)).concat(list).sort((a: any, b: any) => b.id - a.id)
        })
    }

    if (loading)
        return <LoadingComp />

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#fff', padding: '24px 24px 12px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h4 style={{ fontSize: 24 }}>
                    <Space>
                        时序分析分享<MinusOutlined />{source?.test_type_name}
                    </Space>
                </h4>

                <div>
                    {
                        source?.test_type === 'performance' &&
                        <FieldTooltip hasDivider name='env' content={source?.provider_name} />
                    }
                    <FieldTooltip hasDivider name='project' content={source?.project} />
                    <FieldTooltip hasDivider name='tag' content={source?.tag || formatMessage({ id: `analysis.indistinguishable` })} />
                    <FieldTooltip
                        name='date'
                        content={
                            <Space>
                                {source?.start_time}
                                <MinusOutlined />
                                {source?.end_time}
                            </Space>
                        }
                    />
                </div>

                <SpaceTitle name={'Test Suite: '} context={source?.suite_name} />
                <SpaceTitle name={source?.test_type === 'performance' ? 'Test Case:' : 'Test Conf: '} context={source?.case_name} />

                {
                    (source?.test_type === 'performance' && source?.metric) &&
                    <Space align="start">
                        <span>Metric: </span>
                        <Typography.Paragraph ellipsis={{ rows: 2, tooltip: true }}>
                            {
                                source?.metric?.map((i: any) => (<div key={i}>{i}</div>))
                            }
                        </Typography.Paragraph>
                    </Space>
                }

                {
                    source?.test_type !== 'performance' && source?.show_type !== 'pass_rate' &&
                    <SpaceTitle name="Test Subcase: " context={source?.sub_case_name} />
                }

            </div>

            {
                cLoading &&
                <LoadingComp />
            }

            {
                (source?.test_type === 'performance' && source?.fetchData?.length > 0) &&
                <div style={{ display: 'flex', marginTop: 10 }}>
                    <Space style={{ width: "100%", background: "rgba(0, 0, 0, 0.04)" }} direction="vertical">
                        {
                            source?.fetchData?.map((i: any) => {
                                const _props = {
                                    key: i.metric,
                                    fetchData: { ...i, share_id, },
                                    setLoading: setCLoading,
                                    provider_env: source?.provider_env,
                                    valueChange: handleValueChange
                                }

                                return (
                                    source?.provider_env === "aliyun" ?
                                        <ClusterChart
                                            {..._props}
                                        /> :
                                        <StandaloneChart
                                            {..._props}
                                        />
                                )
                            })
                        }
                    </Space>
                </div>
            }

            {
                (source?.test_type === 'functional' && source?.case_map) &&
                <div style={{ marginTop: 10 }}>
                    <ChartRender
                        share_id={share_id}
                        dataSource={source?.case_map}
                        {...source}
                    />
                </div>
            }

            {
                tableData?.length > 0 &&
                <div>
                    <AnalysisTable
                        refresh={() => { }}
                        dataSource={tableData}
                        test_type={source?.test_type}
                        show_type={source?.show_type}
                    />
                </div>
            }

            {
                tableData?.length === 0 &&
                <div style={{ marginTop: 10, minHeight: 480, background: '#fff' }}>
                    <EmptyComp />
                </div>
            }
        </div >
    )
}

export default SharePage