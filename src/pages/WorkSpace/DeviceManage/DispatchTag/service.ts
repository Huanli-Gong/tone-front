import { request } from 'umi';

//Tag列表查询
export async function tagList(params?:any) {
    return request('/api/server/server_tag/',{
        params
    });
}

//新增Tag
export async function addTag(params:any) {
    return request('/api/server/server_tag/',{
        method: 'POST',
        data: {...params}
    });
}

//编辑Tag
export async function editTag(outId:number,params:any) {
    return request(`/api/server/server_tag/detail/${outId}/`,{
        method: 'PUT',
        data: {...params}
    });
}

//查询成员
export function member ( params:any ) {
    return request('/api/auth/user/' , { 
        params 
    })
}

//删除Tag
export async function delSuite(outId:number,params:any) {
    return request(`/api/server/server_tag/detail/${outId}/`,{
        method: 'DELETE',
        data: { ws_id:params }
    });
}

