import { request } from 'umi'

///api/plan/list/
export const queryPlanManageList = ( params : any ) => {
    return request(`/api/plan/list/` , { params })
}

//api/plan/list/
export const creatTestPlan = ( data : any ) => {
    return request(`/api/plan/list/` , { data , method : 'post' })
}

//api/plan/run/
export const runningTestPlan = ( data : any ) => {
    return request(`/api/plan/run/`, { data , method : 'post' })
}

//api/plan/detail/
export const deleteTestPlan = ( data : any ) => {
    return request(`/api/plan/detail/`, { data , method : 'delete' })
}

//api/plan/detail/
export const queryTestPlanDetails = ( params : any ) => {
    return request(`/api/plan/detail/`, { params })
}

//api/plan/detail/
export const updateTestPlan = ( data : any ) => {
    return request(`/api/plan/detail/`, { data , method : 'put'} )
}

///api/plan/check/cron_expression/
export const checkCronExpression = ( data : any ) => {
    return request(`/api/plan/check/cron_expression/`, { data , method : 'post' })
}

//api/plan/copy/
export const copyTestPlan = ( data : any ) => {
    return request(`/api/plan/copy/`, { data , method : 'post'} )
}