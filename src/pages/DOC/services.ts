import { request } from 'umi'
import _ from 'lodash'
// 获取左侧所有集团功能基线分类、根据suite名称搜索suite
export const queryDocList = async (params?: any) => {
    return request(`/api/sys/help_doc/`, { params })
}

export const createDoc = (data: any) => {
    return request(`/api/sys/help_doc/`, { method: 'post', data })
}

export const updateDoc = async (data: any) => {
    return request(`/api/sys/help_doc/`, { method: 'put', data })
}

export const deleteDoc = async (data: any) => {
    return request(`/api/sys/help_doc/`, { method: 'delete', data })
}
export const uploadFile = async (data: any) => request(`/api/sys/upload/`, { method: 'post', data })