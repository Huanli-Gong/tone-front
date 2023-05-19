/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState } from 'react';
import { writeDocumentTitle, useClientSize } from '@/utils/hooks';
import { Button, Layout, Tabs } from 'antd';
import { history, useAccess, FormattedMessage } from 'umi';

import { ReportBody } from './styled'
import ReportListTable from './components/ReportListTable'
import ReportTemplateTable from './components/ReportTemplateTable'

export default (props: any) => {
    const { match, location } = props
    const { ws_id } = match.params
    const intalMessage = `menu.Workspace.TestReport.${props.route.name}`
    const access = useAccess()
    writeDocumentTitle(intalMessage)

    const { height: layoutHeight, width: layoutWidth } = useClientSize()

    const [tab, setTab] = useState(location.query.t || 'list')
    const handleTabClick = useCallback((t) => {
        setTab(t)
        history.push(location.pathname + `?t=${t}`)
    }, [])

    const handleCreateReport = useCallback(() => {
        history.push(`/ws/${ws_id}/test_report/compare`)
        // window.sessionStorage.setItem(`${ws_id}-compareData`, JSON.stringify([]))
        // window.sessionStorage.setItem(`${ws_id}-noGroupJobData`, JSON.stringify([]))
        // window.sessionStorage.setItem('originType', 'test_report')
    }, [])

    const hanldeCreateTemplate = useCallback(() => {
        history.push(`/ws/${ws_id}/test_report/template`)
    }, [])

    return (
        <Layout.Content>
            <ReportBody width={layoutWidth - 40} height={layoutHeight - 50}>
                <Tabs
                    defaultActiveKey={tab}
                    onTabClick={handleTabClick}
                    tabBarStyle={{
                        height: 64,
                        background: '#FAFBFC'
                    }}
                    tabBarExtraContent={
                        tab === 'list' ? (
                            access.IsWsSetting() && <Button type="primary" onClick={handleCreateReport}><FormattedMessage id="report.create.report" /></Button>
                        ) : (
                            access.IsWsSetting() && <Button type="primary" onClick={hanldeCreateTemplate}><FormattedMessage id="report.create.template" /></Button>
                        )
                    }
                >
                    <Tabs.TabPane key="list" tab={<FormattedMessage id="report.test.report" />}>
                        <ReportListTable ws_id={ws_id} tab={tab} tableHeght={layoutHeight - 80} />
                    </Tabs.TabPane>
                    {access.IsWsSetting() &&
                        <Tabs.TabPane key="template" tab={<FormattedMessage id="report.template" />}>
                            <ReportTemplateTable ws_id={ws_id} tab={tab} tableHeght={layoutHeight - 80} />
                        </Tabs.TabPane>
                    }
                </Tabs>
            </ReportBody>
        </Layout.Content>
    )
}