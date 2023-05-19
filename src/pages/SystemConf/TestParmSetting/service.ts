import { request } from 'umi'

export const queryTestFarm = async () => {
    return request(`/api/sys/test_farm/`)
}

export const updateTestFarm = async (data: any) => {
    return request(`/api/sys/test_farm/`, { method: 'post', data })
}
export const createConfig = async (data: any) => {
    return request(`/api/sys/push_config/`, { method: 'post', data })
}
export const updateConfig = async (data: any) => {
    return request(`/api/sys/push_config/`, { method: 'put', data })
}

export const deleteConfig = async (data: any) => {
    return request(`/api/sys/push_config/`, { method: 'delete', data })
}

export const queryWorkspace = async (params: any) => {
    return request(`/api/sys/workspace/list/`, { params })
}
export const queryProject = async (params: any) => {
    return request(`/api/sys/project/list/`, { params })
}
export const queryTest = async (params?: any) => {
    return request(`/api/sys/portal_test/`, { params })
}
export const queryPushJob = async (params: any) => {
    return request(`/api/sys/push_job/`, { params })
}
export const queryPushJobAdd = async (data: any) => {
    return request(`/api/sys/push_job/`, { method: 'post', data })
}
