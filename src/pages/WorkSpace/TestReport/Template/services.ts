import { request } from 'umi'

export const createReportTemplate = ( data : any ) => {
    return request(`/api/report/template/list/` , { data , method : 'post' })
}

export const updateReportTemplate = ( data : any ) => {
    return request(`/api/report/template/detail/` , { data , method : 'put' })
}

export const queryReportTemplateDetails = ( params : any ) => {
    return request(`/api/report/template/detail/` , { params })
}