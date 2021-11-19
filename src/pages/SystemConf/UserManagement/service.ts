import { request } from 'umi';
import { TableListParams, RoleChangeParams } from './data.d';

//用户角色列表
export async function roleList(params: any) {
    return request('/api/auth/role/', { params });
}

//用户管理列表
export async function userManagementList(params: TableListParams) {
    return request('/api/auth/user/', {
        params
    });
}

//修改用户角色
export async function roleChange(data: RoleChangeParams) {
    return request('/api/auth/user/', {
        method: 'POST',
        data
    });
}

export async function requestResetPassword(data: { user_id: number }) {
    return request('/api/auth/reset_password/', {
        method: 'POST',
        data
    });
}