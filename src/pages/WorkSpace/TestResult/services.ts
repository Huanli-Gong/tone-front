import { request } from 'umi'

export const queryJobState = async (params: { job_id: string, ws_id?: string }) => {
    return request(`/api/job/state/`, { params })
}

export const queryTestResultList = async (params: any) => {
    return request(`/api/job/test/`, { params })
}

export const deleteJobTest = async (data: any) => {
    return request(`/api/job/test/`, { method: 'delete', data })
}

export const queryProductList = (params: any) => {
    return request(`/api/sys/product/`, { params })
}

export const addMyCollection = (data: any) => {
    return request(`/api/job/collection/`, { data, method: 'post' })
}

export const deleteMyCollection = (data: any) => {
    return request(`/api/job/collection/`, { data, method: 'delete' })
}

export const queryConfig = async (params: any) => {
    return request(`/api/rerun/config/`, { params })
}

export const queryTag = async (params: any) => {
    return request(`/api/job/tag/`, { params })
}
export const queryTestServer = async (params: any) => {
    return request(`/api/server/test_server/`, { params })
}
export const queryTestCloudServer = async (params: any) => {
    return request(`/api/server/cloud_server/`, { params })
}
export const queryTestSuite = async (params: any) => {
    return request(`/api/case/test_suite/`, { params })
}

export const queryJobType = async (params: any) => {
    return request(`/api/job/type/`, { params })
}
export const queryProjectId = async (params: any) => {
    return request(`/api/sys/project/`, { params })
}
export const querySuiteList = (data: any) => {
    return request(`/api/job/result/compare/suite/`, { method: 'post', data })
}
export const queryCompareResultList = (data: any) => {
    return request(`/api/job/result/compare/list/`, { method: 'post', data })
}
export const queryEenvironmentResultList = (data: any) => {
    return request(`/api/job/result/compare/info/`, { method: 'post', data })
}
export const queryViewReportDatail = async (params: any) => {
    return request(`/api/report/test/report/detail/`, { params })
}
export const queryDomainGroup = (data: any) => {
    return request(`/api/report/domain/group/`, { method: 'post', data })
}
