import { request } from 'umi'

export const queryReportTemplateList = async (params: any) => {
    return request(`/api/report/template/list/`, { params })
}

export const copyReportTemplateList = async (data: any) => {
    return request(`/api/report/template/copy/`, { method: 'post', data })
}

export const delReportTemplateList = async (data: any) => {
    return request(`/api/report/template/detail/`, { method: 'delete', data })
}

export const queryReportList = async (params: any) => {
    return request(`/api/report/test/report/`, { params })
}

export const delReportList = async (data: any) => {
    return request(`/api/report/test/report/`, { method: 'delete', data })
}

export const projectList = async (params: any) => {
    return request(`/api/sys/project/`, { params })
}

export const productVersionList = async (params: any) => {
    return request(`/api/get/product/version/`, { params })
}

export const creatReport = async (data: any) => {
    return request(`/api/report/template/copy/`, { method: 'post', data })
}

export const saveReport = async (data: any) => {
    return request(`/api/report/test/report/`, { method: 'post', data })
}

export const detailTemplate = async (params: any) => {
    return request(`/api/report/template/detail/`, { params })
}

// 查询报告详情
export const reportDetail = async (params: any) => {
    return request(`/api/report/test/report/detail/`, { params })
}

export const editReport = async (data: any) => {
    return request(`/api/report/test/report/`, { method: 'put', data })
}

//查询成员
export async function member(params: any) {
    return request('/api/auth/user/', {
        params
    })
}

// 获取结果对比图表数据
export async function compareChart(data: any) {
    return request('/api/job/result/compare/chart/', {
        data,
        method: 'post',
    })
}

export async function saveReportDesc(data: any) {
    return request('/api/report/test/report/item_suite/', {
        data,
        method: 'post'
    })
}

export async function editReportInfo(data: any) {
    return request('/api/report/test/report/update_desc/', {
        data,
        method: 'post'
    })
}

type editGroupDescProps = {
    item_name: string;
    report_id: string | number;
    desc: string | undefined;
    item_id: number | string;
}

export async function editReportGroupDesc(data: editGroupDescProps) {
    return request(`/api/report/test/report/item/update_desc/`, { method: 'post', data })
}