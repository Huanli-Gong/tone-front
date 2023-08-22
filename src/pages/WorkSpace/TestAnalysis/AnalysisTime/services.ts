import { request } from 'umi'

export const queryPerfAnalysisList = function (data: any) {
    return request(`/api/job/result/perf/analysis/`, { data, method: 'post' })
}

export const queryFuncAnalysisList = function (data: any) {
    return request(`/api/job/result/func/analysis/`, { data, method: 'post' })
}

export const queryPerfomanceMetrics = function (params: any) {
    return request(`/api/job/result/perf/analysis/`, { params })
}

export const queryFunctionalSubcases = function (params: any) {
    return request(`/api/job/result/func/analysis/`, { params })
}
//项目
export const queryProjectList = function (params: any) {
    return request(`/api/sys/project/`, { params })
}

//job 标签
export const queryTagList = function (params: any) {
    return request(`/api/get/analytics/tags/`, { params })
}

//用例
export const queryTestSuiteCases = function (params: any) {
    return request(`/api/case/workspace/case/`, { params })
}

//mertric 
export const queryMetricList = function (params: any) {
    return request(`/api/case/test_metric/`, { params })
}

//note 
export const updateAnalysisNote = function (data: any) {
    return request(`/api/job/test/editor/note/`, { data, method: 'post' })
}

type SuiteConfsServiceProps = {
    ws_id: string;
    start_time: string;
    end_time: string;
    project_id: number;
    tag: number;
    test_type: string;
    provider_env: string;
}

export const getSelectSuiteConfs = function (data: SuiteConfsServiceProps) {
    return request(`/api/job/result/perf/suite/list/`, { method: "post", data })
}

export const getSelectMetricOrSubcase = function (data: any) {
    return request(`/api/job/result/analysis/metric/list/`, { method: "post", data })
}