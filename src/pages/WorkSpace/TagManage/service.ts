import { request } from 'umi';

//Tag列表查询
export async function tagList(params?:any) {
    return request('/api/job/tag/',{
        params
    });
}

//新增Tag
export async function addTag(params:any) {
    return request('/api/job/tag/',{
        method: 'POST',
        data: {...params}
    });
}

//编辑Tag
export async function editTag(outId:number,params:any) {
    return request(`/api/job/tag/`,{
        method: 'PUT',
        data: {...params,...{tag_id:outId}}
    });
}

//删除Tag
export const delSuite = async ( data : { tag_id : number, ws_id:number }) => {
    return request(`/api/job/tag/` , { method : 'DELETE' , data })
}
