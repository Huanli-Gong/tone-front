import { request } from 'umi'

export const querySummaryDetail = (params: any) => {
    return request(`/api/job/test/summary/`, { params })
}

export const queryTestResult = (params: any) => {
    return request(`/api/job/test/result/`, { params })
}

export const queryTestResultSuiteConfList = (params: any) => {
    return request('/api/job/test/conf/result/', { params })
}

//功能
export const queryCaseResult = (params: any) => {
    return request(`/api/job/test/case/result/`, { params })
}

//性能
export const queryCaseResultPerformance = (params: any) => {
    return request(`/api/job/test/case/performance/result/`, { params })
}

//结果文件 
export const queryCaseResultFile = (params: any) => {
    return request(`/api/job/test/case/file/`, { params })
}

export const queryCaseResultVersionInfo = (params: any) => {
    return request(`/api/job/test/case/version/`, { params })
}

//执行过程
export const queryTestResultProcess = (params: any) => {
    return request(`/api/job/test/process/`, { params })
}

//config 数据
export const querySettingConfig = (params: any) => {
    return request(`/api/job/test/config/`, { params })
}

//基线 查询 ws_id
export const queryBaselineList = async (params: any) => {
    return request(`/api/baseline/list/`, { params })
}

//加入基线 功能 单个
export const funcsfJoinBaseline = async (data: any) => {
    return request(`/api/baseline/funcs/detail/`, { data, method: 'post' })
}

//加入基线 性能 单个
export const perfJoinBaseline = async (data: any) => {
    return request(`/api/baseline/perf/add_one/`, { data, method: 'post' })
}
// 批量
export const perfJoinBaselineBatch = async (data: any) => {
    return request(`/api/baseline/perf/batch_add/`, { data, method: 'post' })
}
// job结果执行加入基线详情
export const createFuncsDetail = async (data: any) => {
    return request(`/api/baseline/funcs/detail/`, { data, method: 'post' })
}

//备注编辑
export const updateNode = async (data: any) => {
    return request(`/api/job/test/editor/note/`, { data, method: 'post' })
}
//新增Tag
export const addTag = async (data: any) => {
    return request('/api/job/tag/', { data, method: 'post' })
}
//修改job标签
export const updateJobTags = async (data: any) => {
    return request(`/api/job/tag/relation/`, { data, method: 'post' })
}

// suite case option
export const updateSuiteCaseOption = async (data: any) => {
    return request(`/api/job/test/editor/state/`, { data, method: 'post' })
}

export const queryProcessPrepareList = async (params: any) => {
    return request(`/api/job/test/process/test_prepare/`, { params })
}
// 机器准备或conf状态是fail的情况下，鼠标光标放在错误信息查询
export const queryFailReason = async (params: any) => {
    return request(`/api/sys/chats/query/`, { params })
}
export const queryBuildList = async (params: any) => {
    return request(`/api/job/test/process/build/`, { params })
}

export const queryProcessSuiteList = async (params: any) => {
    return request(`/api/job/test/process/suite/`, { params })
}

export const queryProcessCaseList = async (params: any) => {
    return request(`/api/job/test/process/case/`, { params })
}

//对比基线
export const contrastBaseline = async (data: any) => {
    return request(`/api/baseline/perf/contrast/`, { data, method: 'post' })
}
export const queryMonitorList = async (params: any) => {
    return request(`/api/job/test/process/monitor/job/`, { params })
}

// 机器故障详情
export const queryMachineData = async (params: any) => {
    return request(`/api/job/test_server/machine_fault/`, { params })
}
// 机器跳转链接查询
export const querySeverLink = async (params: any) => {
    return request(`/api/server/get_ssh_link/`, { params })
}
// tid详细信息查询
export const queryTidMessage = async (params: any) => {
    return request(`/api/server/agent_task_info/`, { params })
}

export const queryDownloadLink = async (params: any) => {
    return request(`/api/job/download/query/`, { params })
}

export const startDownloadTask = async (params: any) => {
    return request(`/api/job/download/`, { params })
}

export const getShareId = async (data: any) => {
    return request(`/api/auth/share/`, { method: 'post', data })
}