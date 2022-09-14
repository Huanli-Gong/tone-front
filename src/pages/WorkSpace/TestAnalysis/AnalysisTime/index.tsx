import React, { useState, useEffect, useMemo } from 'react';
import { writeDocumentTitle, useClientSize } from '@/utils/hooks';
import { Layout, Tabs, Row, Radio, message, Col } from 'antd';
import styles from './index.less'
import { useLocation, useParams, useIntl, FormattedMessage  } from 'umi';
import TabPaneCard from './components/TabPaneCard'
import { ReactComponent as CopyLink } from '@/assets/svg/TestResult/icon_link.svg'
import Clipboard from 'clipboard'
import { stringify } from 'querystring';
import { aligroupServer, aliyunServer } from '@/utils/utils';

const AnalysisTime: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const { query } = useLocation() as any
    const { route } = props
    const tabName = BUILD_APP_ENV === 'openanolis' ? 'aliyun' : 'aligroup'
    const routeIntlName = `Workspace.TestAnalysis.${route.name}`
    writeDocumentTitle(routeIntlName)
    const { height: layoutHeight } = useClientSize()
    const [testType, setTestType] = useState(query.test_type || 'performance')
    // const [ testType, setTestType ] = useState( query.test_type || 'functional' )
    const [provider, setProvider] = useState(query.provider_env || tabName)
    const [showType, setShowType] = useState(query.show_type || 'pass_rate')
    const [instance, setInstance] = useState<any>(null)

    const clearModalProvider = () => {
        if (!instance) return
        const { project_id, tag, start_time, end_time } = instance
        setInstance((p: any) => ({ project_id, tag, start_time, end_time }))
    }

    const handleProviderChange = ({ target }: any) => {
        setProvider(target.value)
        clearModalProvider()
    }

    const handleTabClick = (tab: string) => {
        setTestType(tab)
        clearModalProvider()
    }

    const handleShowTypeChange = ({ target }: any) => {
        setShowType(target.value)
        clearModalProvider()
    }

    const tabData = [
        { key: 'performance', tab: formatMessage({id: 'analysis.performance'}) }, 
        { key: 'functional', tab: formatMessage({id: 'analysis.functional'}) },
    ]

    const copy = () => {
        const dom = document.createElement("a")
        dom.style.width = "0px";
        dom.style.height = "0px"
        document.body.appendChild(dom)
        const { origin, pathname } = window.location
        const isFunc = testType === "functional"
        const text = origin + pathname + '?' + stringify({
            test_type: testType,
            [isFunc ? "show_type" : "provider_env"]: isFunc ? showType : provider,
            ...instance
        })
        const cp = new Clipboard(dom, {
            text: () => text
        })
        cp.on("success", () => {

            message.success(formatMessage({id: 'analysis.copy.to.clipboard'}) )
        })
        dom.click()
        cp.destroy()
        document.body.removeChild(dom)
    }

    return (
        <Layout.Content style={{ minHeight: layoutHeight - 40, overflow: 'auto', marginBottom: 20, background: '#fff' }}>
            <Row style={{ background: '#fff' }}>
                <Col span={24}>
                    <Tabs
                        activeKey={testType}
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
                                    testType === 'performance' ?
                                        <Radio.Group value={provider} style={{ marginRight: 20 }} onChange={handleProviderChange}>
                                            <Radio.Button style={{ textAlign: 'center' }} value="aligroup">
                                                {formatMessage({id: 'aligroupServer'})}
                                            </Radio.Button>
                                            <Radio.Button style={{ textAlign: 'center' }} value="aliyun">
                                                {formatMessage({id: 'aliyunServer'})}
                                            </Radio.Button>
                                        </Radio.Group> :
                                        <Radio.Group value={showType} style={{ marginRight: 20 }} onChange={handleShowTypeChange}>
                                            <Radio.Button style={{ width: 120, textAlign: 'center' }} value="pass_rate"><FormattedMessage id="analysis.pass_rate"/></Radio.Button>
                                            <Radio.Button style={{ width: 120, textAlign: 'center' }} value="result_trend"><FormattedMessage id="analysis.result_trend"/></Radio.Button>
                                        </Radio.Group>
                                }
                            </Row>
                        }
                    >
                        {
                            tabData.map((i: any) => (
                                <Tabs.TabPane {...i} />
                            ))
                        }
                    </Tabs>
                </Col>
                <Col span={24}>
                    <TabPaneCard
                        testType={testType}
                        {...testType === 'performance' ? { provider } : { showType }}
                        onChange={setInstance}
                    />
                </Col>
            </Row>
        </Layout.Content>
    )
}

export default AnalysisTime
