import React from 'react'
import { ReactComponent as Approval } from '@/assets/svg/system/icon_sys_Approval.svg'
import { ReactComponent as Basis } from '@/assets/svg/system/icon_sys_basis.svg'
import { ReactComponent as Kernel } from '@/assets/svg/system/icon_sys_kernel.svg'
import { ReactComponent as Master } from '@/assets/svg/system/icon_sys_master.svg'
import { ReactComponent as Suite } from '@/assets/svg/system/icon_sys_suite.svg'
import { ReactComponent as User } from '@/assets/svg/system/icon_sys_user.svg'
import { ReactComponent as Ws } from '@/assets/svg/system/icon_sys_ws.svg'

import { ReactComponent as Baseline } from '@/assets/svg/ws/icon_ws_baseline.svg'
import { ReactComponent as Device } from '@/assets/svg/ws/icon_ws_ip.svg'
import { ReactComponent as Job } from '@/assets/svg/ws/icon_ws_job.svg'
import { ReactComponent as Operation } from '@/assets/svg/ws/icon_ws_operation.svg'
import { ReactComponent as Product } from '@/assets/svg/ws/icon_ws_product.svg'
import { ReactComponent as WsSuite } from '@/assets/svg/ws/icon_ws_suite.svg'

export const SystemMenuIcon = ( name : any ) => {
    switch (name) {
        case 'joinApprove': return <Approval />
        case 'BasicSetting': return <Basis />
        case 'KernelManage': return <Kernel />
        case 'TestParmSetting': return <Master />
        case 'suiteManagement': return <Suite />
        case 'userManagement': return <User />
        case 'workspaceManagement': return <Ws />
    
        default: return <></>;
    }
}

export const WorkspaceMenuIcon = ( name : any ) => {
    switch (name) {
        case 'baseline': return <Baseline />
        case 'DeviceManage': return <Device />
        case 'JobConfig': return <Job />
        case 'TestParmSetting': return <Operation />
        case 'Product': return <Product />
        case 'TestSuiteManage': return <WsSuite />
        case 'DevOps' : return <Approval />
        case 'WorkspaceConfig': return <Ws />
        case 'Logging': return <WsSuite />
        default: return <></>;
    }
}