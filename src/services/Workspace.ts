import { request } from 'umi';

export async function queryWorkspace ( params : any ) {
    return request ('/api/sys/workspace/' , { params })
}

export async function queryWorkspaceHistory ( params ? : any ) {
    return request ('/api/sys/workspace/history/' , { params })
}
export async function queryHomeWorkspace ( params: any ) {
    return request ('/api/sys/workspace/list/' , { params })
}

export async function createWorkspace ( params : any ) {
    return request(
        '/api/sys/workspace/',
        {
            method : 'post',
            data : params
        }
    )
}
// 查询当前用户角色
export async function person_auth( params:any ) {
    return request('/api/auth/personal_center/',{
        params
    });
}
// 非workspace下成员的404信息
export async function auth_admin( params:any ) {
    return request('/api/auth/ws_admin/',{
        params
    });
}
export async function queryWorkspaceDetail ( id : string ) {
    return request(`/api/sys/workspace/detail/${ id }/`)
}

export async function applyWorkspaceMember ( data : {
    ws_id : number,
    reason? : string,
    is_admin? : number ,
}) {
    return request(`/api/sys/workspace/member/apply/`,
        {
            method : 'post',
            data
        }
    )
}

export async function queryWorkspaceMember ( params : {
    ws_id : number,
    role? : string ,
    page_num? : number,
    page_size? : number
    keyword?:string,
}) {
    return request(`/api/sys/workspace/member/` , { params })
}

export async function updateWorkspaceMember ( data : {
    ws_id : number,
    user_id ? : number ,
    role_id ? : number,
    //is_admin ? : boolean,
    //owner ? : number,
    //role_list? : Array<number|string>
} ) {
    return request(`/api/sys/workspace/member/` , {
        method : 'put',
        data
    })
}

export async function deleteWorkspace ( data : {
    id : number,
    reason : string,
}) {
    return request(`/api/sys/workspace/` , {
        method : 'delete',
        data
    })
}

export async function deleteWorkspaceMember ( data : {
    ws_id : number , 
    user_id : number ,
    reason? : string,
} ) {
    return request(`/api/sys/workspace/member/` , {
        method : 'delete',
        data
    })
}

export async function addWorkspaceMember ( data : {
    ws_id : number,
    user_id? : number,
    user_id_list? :number[],
    user_empid_list?:any,
    is_admin? : boolean,
    role_list?:number[]
}) {
    return request(`/api/sys/workspace/member/` , {
        method : 'post',
        data,
    })
}

export async function enterWorkspaceHistroy ( data:{ ws_id : number} ) {
    return request(`/api/sys/workspace/history/` , {
        method : 'post',
        data,
    })
}
export async function checkWorkspace ( params:any ) {
    return request(`/api/sys/workspace/check/` , { params })
}
export async function workspaceHistroy ( params:any ) {
    return request(`/api/sys/workspace/history/` , {
        method : 'post',
        data:params,
    })
}
export async function saveWorkspaceConfig ( data : {
    id : number | string,
    name ? : string,
    show_name ? : string,
    description ? : string,
    is_public ? : string,
    logo ? : string,
    owner ? : number,
}) {
    return request(`/api/sys/workspace/` , {
        method : 'put',
        data
    })
}

export function queryWorkspaceApproveQuantity ( params : {
    ws_id : number ,
    action? : string,
}) {
    return request(`/api/sys/approve/quantity/` , { params })
}

export function queryMember ( params : any ) {
    return request(`/api/auth/user/` , { params })
}

export function queryWorkspaceApproveList ( params : {
    status : number | string,
    object_type ? : string,
    ws_id ? : string,
    object_id ? : string | number,
    action ? : string
}) {
    return request(`/api/sys/approve/` , { params })
}

export function optWorkspaceApprove ( data : {
    ws_id : string,
    action : string,
    id? : number,
    id_list? : number[]
} ) {
    return request(`/api/sys/approve/` ,{
        method : 'post',
        data
    })
}

export function queryWorkspaceMemberCounts ( params : { ws_id : number }) {
    return request(`/api/sys/workspace/member/quantity/` , { params })
}
// 消息通知的数量
export function queryMsgNum () {
    return request('/api/auth/msg_state/')
}
// 查询任务通知
export function queryTaskMsg ( params:any ) {
    return request('/api/auth/task_msg/',{ params })
}
// 获取系统通知信息
export function queryApplyMsg ( params:any ) {
    return request('/api/auth/apply_msg/',{ params })
}
// 全部任务通知标记已读
export function allTagRead () {
    return request('/api/auth/task_msg/',{ 
        method:'POST',
    })
}
// 单条任务通知标记已读
export function singleTagRead (params:any) {
    return request('/api/auth/task_msg/',{ 
        method:'PUT',
        data:params
    })
}
// 单条系统通知标记已读
export function singleSystemRead (params:any) {
    return request('/api/auth/apply_msg/',{ 
        method:'PUT',
        data:params
    })
}
// 全部系统通知标记已读
export function allTagApplyRead () {
    return request('/api/auth/apply_msg/',{ 
        method:'POST',
    })
}