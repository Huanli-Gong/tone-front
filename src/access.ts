// // src/access.ts

// const wsAdmin = ['ws_owner', 'ws_admin', 'ws_tester_admin']
// const anolisSys = ['sys_admin', 'user'] // 社区登录
// const sysAdminIncludeTest = ['super_admin', 'sys_admin', 'sys_test_admin']
// const wsAdminIncludeTest = ['ws_owner', 'ws_admin', 'ws_test_admin'] //sys_test_admin
// export default function (initialState: any) {
//     // 系统配置权限
//     const authList: any = initialState?.authList

//     const sys_role_title: string = authList?.sys_role_title || ''
//     const ws_role_title: string = authList?.ws_role_title || ''
//     const user_id: number | string | never = authList?.user_id || null
//     const sys_role_id: any = authList?.sys_role_id || null

//     const canSuperAdmin = () => sysAdminIncludeTest.includes(sys_role_title)
//     const isWsAdmin = () => wsAdmin.includes(ws_role_title)

//     const canSysTestAdmin = () => sysAdminIncludeTest.includes(sys_role_title)
//     const canWsTestAdmin = () => wsAdminIncludeTest.includes(ws_role_title)
//     const canWsAdmin = () => canSuperAdmin() || isWsAdmin()   // 等同于wsBtnAccess 设置ws按钮  创建ws类型  存为模板

//     return {
//         canWsAdmin,
//         canSuperAdmin,
//         canSysTestAdmin,
//         // 判断登录按钮是否显示
//         loginBtn: () => anolisSys.includes(sys_role_title),
//         hiddenRoute: () => false, // 隐藏申请审批
//         wsOwnerFilter: () => ['ws_owner'].includes(ws_role_title),
//         wsTouristFilter: () => !['ws_tourist', ''].includes(ws_role_title) || !['sys_tourist', ''].includes(sys_role_title),
//         // ws配置页面权限
//         wsBasicContrl: () => {
//             if(BUILD_APP_ENV){
//                return sys_role_title === 'sys_admin'
//             }else{
//                 return sys_role_title === 'super_admin' || ws_role_title === 'ws_owner'
//             }
//         },
//         wsRoleContrl: (user?: any) => {
//             if (canSuperAdmin() || canWsTestAdmin()) return true
//             if (BUILD_APP_ENV) {
//                 if(ws_role_title === 'ws_tester'){
//                     if (user) return user == user_id
//                     return true
//                 }
//                 return canWsAdmin()
//             }
//             return 'ws_member' === ws_role_title && user === user_id
//         },
//         hasAdminRole: () => canSuperAdmin() || wsAdmin.includes(ws_role_title),
//         memberSysManageRole: (member_id: number) => sys_role_title === 'super_admin' ? sys_role_id > member_id : sys_role_id >= member_id,
//     };
// }

// 权限限制文件

export default function (initialState: any) {
    const AuthList: any = initialState?.AuthList
    const sys_role_title: string = AuthList?.sys_role_title || ''
    const ws_role_title: string = AuthList?.ws_role_title || ''
    const user_id: number | string | never = AuthList?.user_id || null

    // 系统管理员权限 & 帮助文档
    const IsAdmin = () => ['sys_admin'].includes(sys_role_title)
    // 系统测试管理员权限
    const IsSysTestAdmin = () => ['sys_admin','sys_test_admin'].includes(sys_role_title)
    // 申请加入私密ws & 创建ws
    const IsCommunity = BUILD_APP_ENV ? IsAdmin : true
    const ApplyPrivate = () => IsCommunity
    // ws设置入口 || job模版(查看、预览)
    const WsSetUp = ['ws_owner','ws_admin','ws_test_admin','ws_member']
    const IsWsSetting = () => IsAdmin || WsSetUp.includes(ws_role_title)
    // ws基础配置(更改封面，显示名，介绍，是否公开) || 成员管理(添加成员) || 移除 || 审批管理
    const WsBtnPermission = () => IsAdmin || ['ws_owner','ws_admin'].includes(ws_role_title)
    // ws所有权转交、注销  
    const WsTransfer = () => IsAdmin || ['ws_owner'].includes(ws_role_title)
    // ws job类型 job模版 job标签 基线管理 机器管理 调度标签 云上测试配置 TestSuite管理 产品管理 ws系统配置
    // ws成员无权限
    const WsMemberNoPermission = () => IsAdmin || ['ws_owner','ws_admin','ws_test_admin'].includes(ws_role_title)
    // ws成员仅可操作自己 
    const WsMemberOperateSelf = (userId?: any) => {
        if(WsMemberNoPermission()) return true
        return ws_role_title === 'ws_member' && userId === user_id
    }

    return {
        IsAdmin,
        IsSysTestAdmin,
        ApplyPrivate,
        IsWsSetting,
        WsBtnPermission,
        WsTransfer,
        WsMemberNoPermission,
        WsMemberOperateSelf,
    }


}