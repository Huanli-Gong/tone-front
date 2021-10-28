// src/access.ts
export default function (initialState: any) {
    // if (!initialState.authList) return
    const isAdmin = initialState?.authList?.sys_role_title
    // const wsAuth = initialState?.authList.ws_role_title
    // 系统配置权限
    const authList: any = initialState?.authList

    const sys_role_title: string = authList?.sys_role_title || ''
    const ws_role_title: string = authList?.ws_role_title || ''
    const user_id: number | string | never = authList?.user_id || null
    const sys_role_id: any = authList?.sys_role_id || null

    const array: any = []

    if (sys_role_title === 'super_admin' || sys_role_title === 'sys_admin') {
        array.push('/system', '/system/approve', '/system/workspace', '/system/user', '/system/suite', '/system/kernel', '/system/basic', '/system/testfarm') //超级管理员可访问
    }

    if (sys_role_title === 'sys_test_admin') {
        array.push('/system', '/system/suite', '/system/kernel', '/system/basic', '/system/testfarm') // 测试管理员
    }
    
    return {
        sysRouteFilter: (route: any) => array.includes(route.path),
        wsRouteFilter: () => sys_role_title === 'super_admin' || sys_role_title === 'sys_admin' ? true : ws_role_title === 'ws_owner' || ws_role_title === 'ws_admin' ? true : false,
        //wsElementFilter : ( role : string ) => [ 'sys_test_admin', 'user', 'ws_member', 'ws_tourist' , 'sys_admin' ].includes( role ),
        wsOwnerFilter: () => {
            const wsRoleList = ['ws_owner']
            if (wsRoleList.includes(ws_role_title)) return true
            return false
        },
        wsRemoveFilter: () => {
            const sysAdminRoleList = ['sys_admin', 'super_admin']
            const wsRemoveList = ['ws_owner', 'ws_admin']
            if (sysAdminRoleList.includes(sys_role_title)) return true
            if (wsRemoveList.includes(ws_role_title)) return true
            return false
        },
        wsTouristFilter: () => {
            const wsRoleList = ['ws_tourist']
            if (wsRoleList.includes(ws_role_title)) return false
            return true
        },
        isTouristFilter: () => {
            if (ws_role_title === 'ws_tourist') return true
            return false
        },
        wsRoleContrl: (user?: any) => {
            const sysAdminRoleList = ['sys_admin', 'super_admin']
            const wsRoleLst = ['ws_owner', 'ws_admin', 'ws_test_admin'] //sys_test_admin

            if (sysAdminRoleList.includes(sys_role_title)) return true
            if (wsRoleLst.includes(ws_role_title)) return true

            if ('ws_member' === ws_role_title) {
                if (user === user_id) return true
            }
            return false
        },
        hasAdminRole: () => {
            const sysAdminRoleList = ['sys_admin', 'super_admin']
            const wsRoleLst = ['ws_owner', 'ws_admin']

            if (sysAdminRoleList.includes(sys_role_title)) return true
            if (wsRoleLst.includes(ws_role_title)) return true

            return false
        },
        helpDocFilter: () => isAdmin === 'super_admin' || isAdmin === 'sys_admin' || isAdmin === 'sys_test_admin',
        memberSysManageRole: (member_id: number) => sys_role_title === 'super_admin' ? sys_role_id > member_id : sys_role_id >= member_id,
    };
}

