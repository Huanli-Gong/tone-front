import { request } from 'umi'

export const queryPlanViewList = async ( params : any ) => {
    return request(`/api/plan/view/` , { params })
}

export const queryPlanResult = async ( params : any ) => {
    return request(`/api/plan/result/` , { params })
}

export const queryPlanResultDetail = async ( params : any ) => {
    return request(`/api/plan/result/detail/` , { params })
}

export const deletePlanInstance = async ( data : any ) => {
    return request(`/api/plan/result/` , { data , method : 'delete' })
}
export const queryPlanConstraint = ( params : any ) => {
    return request(`/api/plan/constraint/` ,  { params })
}