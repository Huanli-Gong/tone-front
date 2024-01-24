import React from 'react';
import { writeDocumentTitle, useCopyText } from '@/utils/hooks';
import { Layout, Tabs, Row, Radio, Col, Dropdown, Typography, message } from 'antd';
import styles from './index.less'
import { useLocation, useIntl, FormattedMessage, useParams, useRequest } from 'umi';
import TabPaneCard from './components/TabPaneCard'
import { ReactComponent as CopyLink } from '@/assets/svg/TestResult/icon_link.svg'
import { stringify } from 'querystring';
import styled from "styled-components"
import { getSelectSuiteConfs, queryPerfomanceMetrics } from './services'

import { Analysis } from './provider';
import { getShareId } from '../../TestResult/Details/service';

const AnalysisLayout = styled(Layout.Content).attrs((props: any) => ({
    style: {
        minHeight: props?.minHeight,
    }
})) <AnyType>`
    overflow: auto;
    margin-bottom: 10px;
    background: #fff;
`;

const AnalysisTime: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const { query, key } = useLocation() as any
    const { ws_id } = useParams() as any
    const { route } = props
    const handleCopy = useCopyText(formatMessage({ id: "request.copy.success" }))

    const [metrics, setMetrics] = React.useState<any[]>([])
    const tabPaneRef = React.useRef<AnyType>(null)
    const tabName = BUILD_APP_ENV === 'openanolis' ? 'aliyun' : 'aligroup'
    const routeIntlName = `Workspace.TestAnalysis.${route.name}`

    const queryMetricList = async (params: any) => {
        const { data, code, msg } = await queryPerfomanceMetrics(params)
        if (code !== 200) return console.log(msg)
        setMetrics(data || [])
    }

    React.useEffect(() => {
        if (JSON.stringify(query) !== "{}") {
            const { test_suite_id, test_case_id, project_id } = query
            if (test_suite_id && test_case_id && project_id) {
                queryMetricList({ ...query, ws_id })
            }
        }
    }, [query, ws_id])

    writeDocumentTitle(routeIntlName)
    // const { height: layoutHeight } = useClientSize()

    const [info, setInfo] = React.useState<any>({
        test_type: query?.test_type || "performance",
        provider_env: query?.provider_env || tabName,
        show_type: query?.show_type || "pass_rate",

        project_id: query?.project_id || undefined,
        tag: query?.tag || undefined,
        start_time: query?.start_time || undefined,
        end_time: query?.end_time || undefined,
    })

    const { data: suiteList, loading, run } = useRequest(
        getSelectSuiteConfs,
        {
            manual: true,
            debounceInterval: 500,
        }
    )

    React.useEffect(() => {
        const { test_type, provider_env, project_id } = info
        if (test_type && provider_env && project_id)
            run({ ws_id, test_type, provider_env, project_id })
    }, [info?.test_type, info?.provider_env, info?.project_id])

    const clearAndSetFields = (val: any) => {
        const { test_type, provider_env = 'aliyun', show_type = 'pass_rate' } = info

        setInfo({
            test_type,
            provider_env,
            show_type: ['pass_rate', 'result_trend'].includes(show_type) ? show_type : 'pass_rate',
            ...val
        })
        tabPaneRef.current?.reset()
    }

    const handleProviderChange = ({ target }: any) => {
        clearAndSetFields({ provider_env: target?.value })
    }

    const handleTabClick = (tab: string) => {
        clearAndSetFields({ test_type: tab })
    }

    const handleShowTypeChange = ({ target }: any) => {
        clearAndSetFields({ show_type: target?.value })
    }

    const tabData = [
        { key: 'performance', tab: formatMessage({ id: 'analysis.performance' }) },
        { key: 'functional', tab: formatMessage({ id: 'analysis.functional' }) },
    ]

    const handleCopyUri = useCopyText(formatMessage({ id: 'analysis.copy.to.clipboard' }))

    const copy = async ($key: any) => {
        const { origin, pathname } = window.location
        const { test_type, show_type, provider_env, metric, ...rest } = info

        if (!info.project_id) return message.error(formatMessage({ id: 'analysis.selected.error' }))

        const isFunc = test_type === "functional"
        const params = {
            ...rest,
            test_type,
            provider_env,
            show_type,
            [isFunc ? "show_type" : "provider_env"]: isFunc ? show_type : provider_env,
            ws_id,
        }

        if ($key !== '1' && test_type !== "functional" && metric) {
            const metricList = metric?.split(',')
            params.metricList = metricList
            params.fetchData = metricList?.map((i: any) => ({ metric: info?.[i]?.split(',') }))
        }

        if ($key === '1' && test_type === 'performance') {
            params.metric = metric
        }

        if ($key !== '1') {
            const { data } = await getShareId(params)
            handleCopy(`${origin}/share/analysis/${data}`)
            return
        }

        const text = origin + pathname + '?' + stringify(params)
        handleCopyUri(text)
    }

    return (
        <Analysis.Provider
            value={{ metrics, setMetrics, suiteList, suiteListLoading: loading }}
            key={key}
        >
            <AnalysisLayout minHeight={innerHeight - 40}>
                <Row style={{ background: '#fff' }}>
                    <Col span={24}>
                        <Tabs
                            activeKey={info?.test_type}
                            style={{ width: '100%' }}
                            className={styles.timeAnalysisTabs}
                            onTabClick={handleTabClick}
                            tabBarExtraContent={
                                <Row justify="center" align="middle">
                                    <Dropdown
                                        menu={{
                                            onClick(evt) {
                                                copy(evt?.key)
                                            },
                                            items: [{
                                                key: '1',
                                                label: <Typography.Text>
                                                    分享可配置链接
                                                </Typography.Text>
                                            }, {
                                                key: '2',
                                                label: <Typography.Text>
                                                    分享
                                                </Typography.Text>
                                            }]
                                        }}
                                    >
                                        <CopyLink
                                            className="test_analysis_copy_link"
                                            style={{ cursor: 'pointer', marginRight: 20 }}
                                        />
                                    </Dropdown>

                                    {
                                        info?.test_type === 'performance' ?
                                            <Radio.Group
                                                value={info?.provider_env}
                                                style={{ marginRight: 20 }}
                                                onChange={handleProviderChange}
                                            >
                                                <Radio.Button style={{ textAlign: 'center' }} value="aligroup">
                                                    {formatMessage({ id: 'aligroupServer' })}
                                                </Radio.Button>
                                                <Radio.Button style={{ textAlign: 'center' }} value="aliyun">
                                                    {formatMessage({ id: 'aliyunServer' })}
                                                </Radio.Button>
                                            </Radio.Group> :
                                            <Radio.Group
                                                value={info?.show_type}
                                                style={{ marginRight: 20 }}
                                                onChange={handleShowTypeChange}
                                            >
                                                <Radio.Button
                                                    style={{ width: 120, textAlign: 'center' }}
                                                    value="pass_rate"
                                                >
                                                    <FormattedMessage id="analysis.pass_rate" />
                                                </Radio.Button>
                                                <Radio.Button
                                                    style={{ width: 120, textAlign: 'center' }}
                                                    value="result_trend"
                                                >
                                                    <FormattedMessage id="analysis.result_trend" />
                                                </Radio.Button>
                                            </Radio.Group>
                                    }
                                </Row>
                            }
                        >
                            {
                                tabData.map((i: any) => (
                                    <Tabs.TabPane {...i} key={i.key} />
                                ))
                            }
                        </Tabs>
                    </Col>
                    <Col span={24}>
                        <TabPaneCard
                            ref={tabPaneRef}
                            info={info}
                            setInfo={(i: any) => {
                                setInfo((p: any) => ({ ...p, ...i }))
                            }}
                        />
                    </Col>
                </Row>
            </AnalysisLayout>
        </Analysis.Provider>
    )
}

export default AnalysisTime
