import React, { useState, useEffect, useMemo } from 'react';
import { writeDocumentTitle, useClientSize } from '@/utils/hooks';
import { Layout, Tabs, Row, Radio, message, Col } from 'antd';
import styles from './index.less'
import { useLocation } from 'umi';
import TabPaneCard from './components/TabPaneCard'
import { ReactComponent as CopyLink } from '@/assets/svg/TestResult/icon_link.svg'
import Clipboard from 'clipboard'
import { stringify } from 'querystring';

const TimeAnalysis: React.FC<any> = (props) => {
    const { query } = useLocation() as any
    const { route } = props

    const routeIntlName = `Workspace.TestAnalysis.${route.name}`
    writeDocumentTitle(routeIntlName)
    const { height: layoutHeight } = useClientSize()
    const [testType, setTestType] = useState(query.test_type || 'performance')
    // const [ testType, setTestType ] = useState( query.test_type || 'functional' )
    const [provider, setProvider] = useState(query.provider_env || 'aliyun')
    const [showType, setShowType] = useState(query.show_type || 'pass_rate')
    const [instance, setInstance] = useState<any>(null)

    useEffect(() => {
        const clipboard = new Clipboard('.test_analysis_copy_link')
        clipboard.on('success', function (e) {
            message.success('复制成功')
            e.clearSelection();
        })
        return () => {
            clipboard.destroy()
        }
    }, [])

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

    const tabData = [{ key: 'performance', tab: '性能分析' }, { key: 'functional', tab: '功能分析' }]

    const targetCopyLink = useMemo(() => {
        if (instance) {
            const { origin, pathname } = window.location
            return origin + pathname + '?' + stringify({ test_type: testType, show_type: showType, ...instance })
        }
        return ''
    }, [instance, testType, showType])

    return (
        <Layout.Content style={{ minHeight: layoutHeight - 40, overflow: 'auto', marginBottom: 20, background: '#fff' }}>
            <div
                style={{ height: 0, width: 0, position: "absolute", left: -111111, zIndex: -999 }}
                className="copy_link_target"
            >
                {targetCopyLink}
            </div>
            <Row style={{ background: '#fff' }}>
                <Col span={24}>
                    <Tabs
                        activeKey={testType}
                        style={{ width: '100%' }}
                        className={styles.timeAnalysisTabs}
                        onTabClick={handleTabClick}
                        tabBarExtraContent={
                            <Row justify="center" align="middle">
                                <CopyLink className="test_analysis_copy_link" data-clipboard-target=".copy_link_target" style={{ cursor: 'pointer', marginRight: 20 }} />
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

export default TimeAnalysis