import request from 'umi-request'

export const queryDevOpsConfig = ( params : any ) => {
    return request(`/api/sys/ws_config/` , { params })
}

export const updateDevOpsConfig = ( data : any ) => {
    return request(`/api/sys/ws_config/` , { method : 'put' , data })
}