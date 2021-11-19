// src/access.ts

const superAdmins = ['super_admin', 'sys_admin']
const wsAdmin = ['ws_owner', 'ws_admin','ws_tester_admin']  
const anolisList = ['ws_tester','ws_tester_admin'] // 社区twoMember
const anolisWs = ['ws_member','ws_tester','ws_tester_admin']  // 社区tourists
const anolisSys = ['sys_admin','user'] // 社区登录
const sysAdminIncludeTest = ['super_admin', 'sys_admin', 'sys_test_admin']
const wsAdminIncludeTest = ['ws_owner', 'ws_admin', 'ws_test_admin'] //sys_test_admin

export default function (initialState: any) {
    console.log( initialState )
    // 系统配置权限
    const authList: any = initialState?.authList

    const sys_role_title: string = authList?.sys_role_title || ''
    const ws_role_title: string = authList?.ws_role_title || ''
    const user_id: number | string | never = authList?.user_id || null
    const sys_role_id: any = authList?.sys_role_id || null

    const canSuperAdmin = () => superAdmins.includes(sys_role_title)
    const isWsAdmin = () => wsAdmin.includes(ws_role_title)

    const canSysTestAdmin = () => sysAdminIncludeTest.includes(sys_role_title)
    const canWsTestAdmin = () => wsAdminIncludeTest.includes(ws_role_title)
    const canAnolisWs = () => anolisWs.includes(ws_role_title)
    return {
        canWsAdmin: () => canSuperAdmin() || isWsAdmin(),   // 等同于wsBtnAccess 设置ws按钮  创建ws类型  存为模板
        // 判断登录按钮是否显示
        loginBtn:() => anolisSys.includes(sys_role_title),
        // 登录状态和消息通知
        loginAndMsgAccess:() => canSuperAdmin() || canAnolisWs(),
        testerAccess:( user?:any ) => {
            if(sys_role_title === 'sys_admin') return true;
            if( user !== undefined ){
                if ( ws_role_title === 'ws_tester') {
                    if ( user === user_id ) return true
                    return false
                }
            }
            if(anolisList.includes(ws_role_title)) return true;
            return false;
        },
        hiddenRoute:() => false, // 隐藏申请审批
        canSuperAdmin,
        canSysTestAdmin,
        wsOwnerFilter: () => ['ws_owner'].includes(ws_role_title),
        wsTouristFilter: () => !['ws_tourist'].includes(ws_role_title),
        wsRoleContrl: (user?: any) => {
            if (canSuperAdmin() || canWsTestAdmin()) return true
            return 'ws_member' === ws_role_title && user === user_id
        },
        hasAdminRole: () => canSuperAdmin() || wsAdmin.includes(ws_role_title),
        memberSysManageRole: (member_id: number) => sys_role_title === 'super_admin' ? sys_role_id > member_id : sys_role_id >= member_id,
    };
}




