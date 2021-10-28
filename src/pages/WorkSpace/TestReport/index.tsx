import React, { useCallback, useState } from 'react';
import { writeDocumentTitle, resizeDocumentHeightHook, resizeDocumentWidthHooks } from '@/utils/hooks';
import { Button, Layout, Tabs } from 'antd';
import { history, useModel, Access, useAccess } from 'umi'

import { ReportBody } from './styled'
import ReportListTable from './components/ReportListTable'
import ReportTemplateTable from './components/ReportTemplateTable'
import { AuthMember } from '@/components/Permissions/AuthMemberCommon';
export default (props: any) => {
    const { match, location } = props
    const { ws_id } = match.params
    const intalMessage = `menu.Workspace.TestReport.${props.route.name}`
    const access = useAccess()
    writeDocumentTitle(intalMessage)
    const layoutWidth = resizeDocumentWidthHooks(),
        layoutHeight = resizeDocumentHeightHook()

    const [tab, setTab] = useState(location.query.t || 'list')
    const handleTabClick = useCallback((t) => {
        setTab(t)
        history.push(location.pathname + `?t=${t}`)
    }, [])

    const handleCreateReport = useCallback(() => {
        history.push(`/ws/${ws_id}/test_report/compare`)
        // window.sessionStorage.setItem('compareData', JSON.stringify([]))
        // window.sessionStorage.setItem('noGroupJobData', JSON.stringify([]))
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
                        <Access
                            accessible={access.wsTouristFilter()}
                        >
                            <AuthMember
                                isAuth={['sys_test_admin', 'user']}
                                children={tab === 'list' ?
                                    <Button type="primary" onClick={handleCreateReport}>新建报告</Button> :
                                    <Button type="primary" onClick={hanldeCreateTemplate}>新建报告模版</Button>}
                                onClick={tab === 'list' ? handleCreateReport : hanldeCreateTemplate}
                            />
                        </Access>
                    }
                >
                    <Tabs.TabPane key="list" tab="测试报告">
                        <ReportListTable ws_id={ws_id} tab={tab} tableHeght={layoutHeight - 80} />
                    </Tabs.TabPane>
                    { access.wsTouristFilter() && 
                        <Tabs.TabPane key="template" tab="报告模版">
                            <ReportTemplateTable ws_id={ws_id} tab={tab} tableHeght={layoutHeight - 80} />
                        </Tabs.TabPane>
                    }
                </Tabs>
            </ReportBody>
        </Layout.Content>
    )
}