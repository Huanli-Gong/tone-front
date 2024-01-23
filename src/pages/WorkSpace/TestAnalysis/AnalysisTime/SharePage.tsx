import { Divider, Row, Space, Tooltip, Typography } from "antd"
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

        if (test_type === 'functional') {
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
        <div >
            <div style={{ background: '#fff', padding: '24px 24px 12px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h4 style={{ fontSize: 24 }}>
                    <Space>
                        时序分析<MinusOutlined />{source?.test_type_name}
                    </Space>
                </h4>

                <div>
                    <FieldTooltip hasDivider name='test_type' content={source?.test_type_name} />
                    <FieldTooltip hasDivider name='env' content={source?.provider_name} />
                    <FieldTooltip hasDivider name='project' content={source?.project} />
                    <FieldTooltip hasDivider name='tag' content={source?.tag || formatMessage({ id: `analysis.indistinguishable` })} />
                    <FieldTooltip name='date' content={`${source?.start_time} —— ${source?.end_time}`} />
                </div>

                <Space>
                    <span >Test Suite: </span>
                    {source?.suite_name}
                </Space>

                {
                    source?.test_type === 'performance' ?
                        <Space>
                            <span >Test Case: </span>
                            {source?.case_name}
                        </Space> :
                        <Space>
                            <span >Test Conf: </span>
                            {source?.case_name}
                        </Space>
                }

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
                    <Space>
                        <span >Test Subcase: </span>
                        {source?.sub_case_name}
                    </Space>
                }

            </div>

            {
                cLoading &&
                <LoadingComp />
            }

            <div>
                {
                    (source?.test_type === 'performance' && source?.fetchData?.length > 0) &&
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
                }
            </div>

            <div style={{ marginTop: 10 }}>
                {
                    source?.test_type === 'functional' &&
                    <ChartRender
                        share_id={share_id}
                        dataSource={source?.case_map}
                        {...source}
                    />
                }
            </div>

            <div>
                {
                    tableData?.length > 0 &&
                    <AnalysisTable
                        refresh={() => { }}
                        dataSource={tableData}
                        test_type={source?.test_type}
                        show_type={source?.show_type}
                    />
                }
            </div>

            {
                tableData?.length === 0 &&
                <EmptyComp />
            }
        </div >
    )
}

export default SharePage