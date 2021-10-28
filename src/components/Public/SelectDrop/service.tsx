import { request } from 'umi';

//查询成员
export function member ( params:any ) {
    return request('/api/auth/user/' , { 
        params 
    })
}