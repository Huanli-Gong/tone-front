import { request } from 'umi';

//查询标签
export async function queryTag(params: any = {}) {
    return request(`/api/server/server_tag/`, {
        params
    })
}