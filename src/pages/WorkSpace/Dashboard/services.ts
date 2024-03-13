import { request } from 'umi'

export async function queryWorkspaceProductData(params: any) {
    return request(`/api/sys/ws_data_list/`, { params })
}

export async function queryWorkspaceProjectChart(params: any) {
    return request(`/api/sys/ws_chart/`, { params })
}

export async function queryWorkspaceProductInfo(params: any) {
    return request(`/api/sys/ws_project_data/`, { params })
}

export async function queryWorkspaceJobs(params: any) {
    return request(`/api/sys/ws_project_job/`, { params })
}

export async function postChangeJobProject(data: any) {
    return request(`/api/sys/change_job_project/`, { data, method: 'POST' })
}