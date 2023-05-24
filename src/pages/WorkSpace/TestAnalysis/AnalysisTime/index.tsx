import React from 'react';
import { writeDocumentTitle, useCopyText } from '@/utils/hooks';
import { Layout, Tabs, Row, Radio, Col } from 'antd';
import styles from './index.less'
import { useLocation, useIntl, FormattedMessage, useParams } from 'umi';
import TabPaneCard from './components/TabPaneCard'
import { ReactComponent as CopyLink } from '@/assets/svg/TestResult/icon_link.svg'
import { stringify } from 'querystring';
import styled from "styled-components"
import { queryPerfomanceMetrics } from './services'

import { Analysis } from './provider';

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
    const { query } = useLocation() as any
    const { ws_id } = useParams() as any
    const { route } = props

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

    const clearAndSetFields = (val: any) => {
        const { test_type, provider_env, show_type } = info
        setInfo({ test_type, provider_env, show_type, ...val })
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

    const copy = () => {
        const { origin, pathname } = window.location
        const { test_type, show_type, provider_env, ...rest } = info
        const isFunc = test_type === "functional"
        const text = origin + pathname + '?' + stringify({
            test_type,
            [isFunc ? "show_type" : "provider_env"]: isFunc ? show_type : provider_env,
            ...rest
        })
        handleCopyUri(text)
    }

    return (
        <Analysis.Provider value={{ metrics, setMetrics }}>
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
                                    <CopyLink
                                        className="test_analysis_copy_link"
                                        style={{ cursor: 'pointer', marginRight: 20 }}
                                        onClick={copy}
                                    />
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
