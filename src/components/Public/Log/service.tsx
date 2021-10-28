import { request } from 'umi';

//查询日志
export function queryServerHistory(params: any) {
    return request(`/api/sys/operation/log/`, {
        params
    })
}