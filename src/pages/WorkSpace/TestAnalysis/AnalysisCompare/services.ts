import { request } from "umi"

export const queryJobList = (params: any) => {
    return request(`/api/job/test/`, { params })
}
export const queryBaelineList = (params: any) => {
    return request(`/api/baseline/list/`, { params })
}
export const queryProductList = (params: any) => {
    return request(`/api/get/product/version/`, { params })
}
export const querySuiteList = (data: any) => {
    return request(`/api/job/result/compare/suite/`, { method: 'post', data })
}
export const queryConfList = (data: any) => {
    return request(`/api/job/result/compare/conf/`, { method: 'post', data })
}
export const queryCompareResultList = (data: any) => {
    return request(`/api/job/result/compare/list/`, { method: 'post', data })
}
export const queryEenvironmentResultList = (data: any) => {
    return request(`/api/job/result/compare/info/`, { method: 'post', data })
}
export const queryPlanViewList = (params: any) => {
    return request(`/api/plan/view/`, { params })
}
export const queryPlanResultList = (params: any) => {
    return request(`/api/plan/result/`, { params })
}
export const queryPlanConstraint = (params: any) => {
    return request(`/api/plan/constraint/`, { params })
}
export const queryDomainGroup = (data: any) => {
    return request(`/api/report/domain/group/`, { method: 'post', data })
}
export const queryProduct = (params: any) => {
    return request(`/api/sys/product/`, { params })
}
export const queryDuplicate = (data: any) => {
    return request(`/api/job/result/compare/duplicate/`, { method: 'post', data })
}


