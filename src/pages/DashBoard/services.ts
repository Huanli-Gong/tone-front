import { request } from 'umi'

export async function queryLiveData(params?: any) {
    return request(`/api/sys/live_data/`, { params })
}

export async function querySysData(params?: any) {
    return request(`/api/sys/sys_data/`, { params })
}

export async function queryChartData(params?: any) {
    return request(`/api/sys/chart_data/`, { params })
}