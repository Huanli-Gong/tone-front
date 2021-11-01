import React from 'react'
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

export default ( local : any ) => {
    switch ( local ) {
        case 'menu.home' : return <Home />;
        case 'menu.Dashboard' : return <Dashboard />;
        case 'menu.systemConf' : return <SystemConf />;

        case 'menu.WorkspaceSetting' : return <WorkspaceSetting />;
        case 'menu.Workspace.TestJob' : return <TestJob />;
        case 'menu.Workspace.TestPlan' : return <TestPlan />;
        case 'menu.Workspace.TestAnalysis' : return <TestAnalysis />;
        case 'menu.Workspace.TestReport' : return <TestReport />;
        case 'menu.Workspace.TestSuiteSearch' : return <TestSuiteSearch />;
        case 'menu.Workspace.TestResult' : return <TestResult />;
        case 'menu.Workspace.Upload' : return <div style={{paddingTop: 1}}><CloudUploadOutlined /></div>;
        case 'menu.Workspace.Dashboard' : return <WorkspaceDashboard />
        default : return <></>
    }
}
