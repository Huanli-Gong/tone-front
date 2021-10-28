import { request } from "umi"

interface UpdateJobTypeProps {
    jt_id : number , 
    enable? : boolean , 
    priority? : number , 
    is_first? : boolean,
    ws_id? :number,
}
export const queryJobTypeDel = ( params : any ) => {
    return request(`/api/job/type/del/` , { params })
}

export const queryJobTypeList = ( params : any ) => {
    return request(`/api/job/type/` , { params })
}
export const queryConfirm = ( params : any ) => {
    return request(`/api/case/sys_case/confirm/` , { params })
}
//jobType 开关 启用/停用
export const jobSwitch = async ( data : UpdateJobTypeProps ) => {
    return request(`/api/job/type/` , { method : 'put' , data })
}

//删除 job
export const deleteJob = async ( data : { jt_id : number, ws_id:number }) => {
    return request(`/api/job/type/` , { method : 'delete' , data })
}
