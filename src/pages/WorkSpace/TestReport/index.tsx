import React, { useCallback, useState } from 'react';
import { writeDocumentTitle, resizeDocumentHeightHook, resizeDocumentWidthHooks } from '@/utils/hooks';
import { Button, Layout, Tabs } from 'antd';
import { history, Access, useAccess } from 'umi';

import { ReportBody } from './styled'
import ReportListTable from './components/ReportListTable'
import ReportTemplateTable from './components/ReportTemplateTable'
// import { matchRoleEnum } from '@/utils/utils';

export default (props: any) => {
    const { match, location } = props
    const { ws_id } = match.params
    const intalMessage = `menu.Workspace.TestReport.${props.route.name}`
    // 权限
    //const { currentRole } = matchRoleEnum();
    //const limitAuthority =['ws_tester', 'ws_tester_admin', 'sys_admin'].includes(currentRole);
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
                        tab === 'list' ? (
                            access.testerAccess() && <Button type="primary" onClick={handleCreateReport}>新建报告</Button> 
                        ) : (
                            access.testerAccess() && <Button type="primary" onClick={hanldeCreateTemplate}>新建模版</Button>
                        )
                    }
                >
                    <Tabs.TabPane key="list" tab="测试报告">
                        <ReportListTable ws_id={ws_id} tab={tab} tableHeght={layoutHeight - 80} />
                    </Tabs.TabPane>
                    {access.testerAccess() &&
                        <Tabs.TabPane key="template" tab="报告模版">
                            <ReportTemplateTable ws_id={ws_id} tab={tab} tableHeght={layoutHeight - 80} />
                        </Tabs.TabPane>
                    }
                </Tabs>
            </ReportBody>
        </Layout.Content>
    )
}