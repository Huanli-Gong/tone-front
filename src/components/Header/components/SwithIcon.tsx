import React from 'react'

import styled from 'styled-components'
import { CloudUploadOutlined } from '@ant-design/icons';

import { ReactComponent as Home } from '@/assets/svg/Nav/icon_home.svg'
import { ReactComponent as TestJob } from '@/assets/svg/Nav/icon_new.svg'
import { ReactComponent as TestPlan } from '@/assets/svg/Nav/icon_plan.svg'
import { ReactComponent as TestReport } from '@/assets/svg/Nav/icon_report.svg'
import { ReactComponent as TestResult } from '@/assets/svg/Nav/icon_result.svg'
import { ReactComponent as Dashboard } from '@/assets/svg/Nav/icon_Dashboard.svg'
import { ReactComponent as TestAnalysis } from '@/assets/svg/Nav/icon_analysis.svg'
import { ReactComponent as SystemConf } from '@/assets/svg/Nav/icon_system_system.svg'
import { ReactComponent as WorkspaceSetting } from '@/assets/svg/Nav/icon_ws_setting.svg'
import { ReactComponent as TestSuiteSearch } from '@/assets/svg/Nav/icon_test.svg'
import { ReactComponent as WorkspaceDashboard } from '@/assets/svg/Nav/ws_dashboard.svg'

const MenuIconWrapper = styled.span`
    
    display: inline-block;
    & span {
        margin-right: 0px !important;
    }

`

const navIconsMap = new Map([
    ['menu.home', <Home />],
    ['menu.Dashboard', <Dashboard />],
    ['menu.systemConf', <SystemConf />],
    ['menu.WorkspaceSetting', <WorkspaceSetting />],
    ['menu.Workspace.TestJob', <TestJob />],
    ['menu.Workspace.TestPlan', <TestPlan />],
    ['menu.Workspace.TestAnalysis', <TestAnalysis />],
    ['menu.Workspace.TestReport', <TestReport />],
    ['menu.Workspace.TestSuiteSearch', <TestSuiteSearch />],
    ['menu.Workspace.TestResult', <TestResult />],
    ['menu.Workspace.Upload', <CloudUploadOutlined />],
    ['menu.Workspace.Dashboard', <WorkspaceDashboard />],
])

const switchIcon = (local: any) => {
    return <MenuIconWrapper>{navIconsMap.get(local)}</MenuIconWrapper>
}

export default switchIcon
