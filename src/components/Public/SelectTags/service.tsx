import { request } from 'umi';

//查询标签
export function queryServerTag ( params:any ) {
    return request('/api/server/server_tag/' , { 
        params 
    })
}