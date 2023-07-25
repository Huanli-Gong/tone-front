import { request } from 'umi'

//获取WorkSpace下JobTest
export const queryWsJobTest = async (params: any) => {
    return request(`/api/job/test/`, { params })
}

//创建job test
export const createWsJobTest = async (data: any) => {
    return request(`/api/job/test/`, { data, method: 'post' })
}

//获取Template源子项
export const queryTestTemplateItems = async (params: any) => {
    return request(`/api/job/template/items/`, { params })
}

//获取Test Template数据
export const queryTestTemplateData = async (params: any) => {
    return request(`/api/job/template/detail/`, { params })
}

//project 查询 ws_id
export const queryProjectList = async (params: any) => {
    return request(`/api/sys/project/`, { params })
}

//基线 查询 ws_id
export const queryBaselineList = async (params: any) => {
    return request(`/api/baseline/list/`, { params })
}

export const queryTestExportValues = async (params: any) => {
    return request(`/api/rerun/config/`, { params })
}

export const queryReportTemplateList = async (params: any) => {
    return request(`/api/report/template/list/`, { params })
}
//创建job test
export const testYaml = async (data: any) => {
    return request(`/api/job/yaml_data_verify/`, { data, method: 'post' })
}
//创建job test
export const formatYamlToJson = async (data: any) => {
    return request(`/api/job/data_conversion/`, { data, method: 'post' })
}

//查询cbp产品列表
export const queryCbpProduct = async () => {
    return request(`/api/job/test/product`)
}

// 检查job模板是否在测试计划中运行
export const queryCheckJobTemplate = async (params:any) => {
    return request(`/api/job/template/check/`, { params })
}