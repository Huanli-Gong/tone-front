import { request } from "umi"

export const querySuiteList = ( data : any ) => {
    return request(`/api/case/ws_case/confirm/` , { 
        data,
        method:'post'
    })
}

export const queryJobTypeList = ( params : any ) => {
    return request(`/api/job/type/del/` , { params })
}

export const querTempDel = ( params : any ) => {
    return request(`/api/job/template/del/` , { params })
}

export const querServerDel = ( params : any ) => {
    return request(`/api/server/del_confirm/` , { params })
}

