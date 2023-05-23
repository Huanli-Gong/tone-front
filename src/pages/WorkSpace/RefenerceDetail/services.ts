import { request } from "umi"

export const querySuiteList = (data: any) => {
    return request(`/api/case/ws_case/confirm/`, {
        data,
        method: 'post'
    })
}

export const queryJobTypeList = (data: any) => {
    return request(`/api/job/type/del/`, { method: "post", data })
}

export const querTempDel = (data: any) => {
    return request(`/api/job/template/del/`, { method: "post", data })
}

export const querServerDel = (data: any) => {
    return request(`/api/server/del_confirm/`, { method: "post", data })
}

export const queryFormDate = (params: any) => {
    return request(`/api/case/ws_case/params/`, { params })
}
