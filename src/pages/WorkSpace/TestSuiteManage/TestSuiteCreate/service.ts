import { request } from 'umi'

export const queryTestSuiteList = async function (params: {
    scope?: string,
    suite_id?: number,
    test_type?: string,
    run_mode?: string
}) {
    return request('/api/case/test_suite/', {
        params
    })
}

export async function queryWsCaseConfirm(data?: any) {
    return request('/api/case/ws_case/confirm/', { data, method: 'post' })
}

export async function queryWorkspaceSuiteList(params?: any) {
    return request('/api/case/workspace/case/', {
        params
    });
}

export const querySuiteCaseList = async function (params: {
    suite_id: number,
    case_id?: number,
    name?: string,
}) {
    return request('/api/case/test_case/', { params })
}

export const saveSuiteCaseList = async function (data: {
    ws_id: number,
    test_type: string,
    case_id_list: string,
    suite_id_list?: string,
}) {
    return request(`/api/case/workspace/case/batch/add/`, {
        method: 'post',
        data
    })
}