import { request } from 'umi';
import { TableListParams, RemovePrams } from './data.d';

//用户角色列表
export async function workspaceList(params:TableListParams) {
    return request('/api/sys/workspace/',{
        params
    });
}

//用户角色列表
export async function workspaceRemove(params:RemovePrams) {
    return request('/api/sys/workspace/',{
        method: 'DELETE',
        data: {
            id:params.id,
        }
    });
}

//获取workspace页tabs的数量
export async function quantity() {
    return request('/api/sys/workspace/quantity/');
}

//获取workspace详情
export async function info(id:number) {
    return request(`/api/sys/workspace/detail/${id}/`);
}
// ws的角色
export async function authPersonal(params:any) {
    return request(`/api/auth/personal_center/`,{
        params
    });
}