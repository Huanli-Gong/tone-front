import React, { useState, useEffect, useMemo } from 'react';
import { writeDocumentTitle, useClientSize } from '@/utils/hooks';
import { Layout, Tabs, Row, Radio, message, Spin } from 'antd';
import styles from './index.less'
import { useParams, useLocation } from 'umi';
import TabPaneCard from './components/TabPaneCard'
import { ReactComponent as CopyLink } from '@/assets/svg/TestResult/icon_link.svg'
import Clipboard from 'clipboard'
import { stringify } from 'querystring';

const tabData = [{ key: 'performance', tab: '性能分析' }, { key: 'functional', tab: '功能分析' }]

const AnalysisTime: React.FC<any> = (props) => {
    const { ws_id } = useParams() as any
    const { query } = useLocation() as any
    const { route } = props

    const routeIntlName = `Workspace.TestAnalysis.${route.name}`
    writeDocumentTitle(routeIntlName)
    const { height: layoutHeight } = useClientSize()
    const [testType, setTestType] = useState(query.test_type || 'performance')
    // const [ testType, setTestType ] = useState( query.test_type || 'functional' )
    const [provider, setProvider] = useState(query.provider_env || 'aliyun')
    const [showType, setShowType] = useState(query.show_type || 'pass_rate')
    const [loading, setLoading] = useState(false)
    const [instance, setInstance] = useState<any>(null)

    const handleProviderChange = ({ target }: any) => {
        setProvider(target.value)
        setInstance(null)
    }

    const handleTabClick = (tab: string) => {
        setTestType(tab)
        setInstance(null)
    }

    const handleShowTypeChange = ({ target }: any) => {
        setShowType(target.value)
        setInstance(null)
    }

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
            message.success("已复制到剪切板！")
        })
        dom.click()
        cp.destroy()
        document.body.removeChild(dom)
    }

    return (
        <Layout.Content style={{ minHeight: layoutHeight - 40, overflow: 'auto', marginBottom: 20, background: '#fff' }}>
            <Row style={{ background: '#fff' }}>
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
                                        <Radio.Button style={{ width: 88, textAlign: 'center' }} value="aligroup">内网</Radio.Button>
                                        <Radio.Button style={{ width: 88, textAlign: 'center' }} value="aliyun">云上</Radio.Button>
                                    </Radio.Group> :
                                    <Radio.Group value={showType} style={{ marginRight: 20 }} onChange={handleShowTypeChange}>
                                        <Radio.Button style={{ width: 88, textAlign: 'center' }} value="pass_rate">通过率</Radio.Button>
                                        <Radio.Button style={{ width: 90, textAlign: 'center' }} value="result_trend">结果趋势</Radio.Button>
                                    </Radio.Group>
                            }
                        </Row>
                    }
                >
                    {
                        tabData.map((i: any) => {
                            const sub = i.key === 'performance' ? { provider } : { showType }
                            const prop = { ws_id, testType: i.key, ...sub }
                            return (
                                <Tabs.TabPane {...i} >
                                    <Spin spinning={loading}>
                                        <TabPaneCard
                                            {...prop}
                                            onChange={setInstance}
                                            loading={loading}
                                            setLoading={setLoading}
                                        />
                                    </Spin>
                                </Tabs.TabPane>
                            )
                        })
                    }
                </Tabs>
            </Row>
        </Layout.Content>
    )
}

export default AnalysisTime