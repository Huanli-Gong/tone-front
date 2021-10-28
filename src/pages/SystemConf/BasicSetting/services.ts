import { request } from 'umi'

export const queryConfigList = async ( params : any ) => {
    return request(`/api/sys/config/` , { params })
}

export const createCongfig = async ( data : any ) => {
    return request(`/api/sys/config/` , { method : 'post' , data })
}

export const updateConfig = async ( data : any ) => {
    return request(`/api/sys/config/` , { method : 'put' , data })
}

export const deleteConfig = async ( data : any ) => {
    return request(`/api/sys/config/` , { method : 'delete' , data })
}

export const queryHistroyVersion = async ( params : any ) => {
    return request(`/api/sys/config/history/` , { params })
}