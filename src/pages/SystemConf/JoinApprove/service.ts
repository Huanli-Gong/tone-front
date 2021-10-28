import { request } from 'umi';
import { TableListParams,ApproveParams } from './data.d';

//加入申请列表
export async function joinList(params:TableListParams) {
    return request('/api/sys/approve/',{
        params
    });
}

//修改用户角色
export async function approve(params:ApproveParams) {
    return request('/api/sys/approve/ ',{
        method: 'POST',
        data: {
            ...params
        },
    });
}

//获取审批数量
export async function quantity() {
    return request('/api/sys/approve/quantity/');
}

//获取审批详情
export async function info(id:number) {
    return request(`/api/sys/approve/detail/${id}/`);
}