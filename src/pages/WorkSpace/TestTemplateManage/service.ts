import { request } from 'umi'

export const queryTestTemplateList = async ( params : any ) => {
    return request(`/api/job/template/` , { params })
}

export const queryTemplateDel = async ( params : any ) => {
    return request(`/api/job/template/del/` , { params })
}

export const saveTestTemplate = async ( data : any ) => {
    return request(`/api/job/template/` , { method : 'post' , data })
}

export const updateTestTemplate = async ( data : any ) => {
    return request(`/api/job/template/` , { data , method : 'put' })
}

export const deleteTestTemplate = async ( data : any ) => {
    return request(`/api/job/template/` , { data , method : 'delete' })
}

export const copyTestTemplate = async ( data : any ) => {
    return request(`/api/job/template/copy/` , { method : 'post' , data })
}