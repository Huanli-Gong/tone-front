import React from 'react';

const handleRole = ( name ) => {
    const dict = {
        user: '普通用户',
        sys_test_admin: '测试管理员',
        sys_admin: '系统管理员',
        super_admin: '超级管理员',
        ws_tourist:'游客',
        ws_member: 'workspace成员',
        ws_test_admin: '测试管理员',
        ws_admin: '管理员',
        all:'全部',
        ws_owner: '所有者'
    }
    return dict[name]
}



export { handleRole };