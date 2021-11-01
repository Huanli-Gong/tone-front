import { request } from 'umi'

//Suite列表查询
export const suiteList = async function (params: any) {
    return request('/api/case/workspace/case/', {
        params
    })
}

//机器查询
export const standloneServerList = async function (params: any) {
    return request('/api/server/specify_test_server/', { params })
}

//查询领域
export function getDomain () {
    return request('/api/case/test_domain/')
}

export function queryDispatchTags ( params : any ) {
    return request(`/api/server/server_tag/` , { params })
}

export function checkIpAndSn ( params : any ) {
    return request(`/api/server/test_server/channel/check/` , { params })
}

export function queryClusterServer ( params : any ) {
    return request(`/api/server/test_cluster/` , { params })
}

export function queryClusterStandaloneServer ( params : any ) {
    return request(`/api/server/cloud_server/` , { params })
}

export function queryClusterGroupServer ( params : any ) {
    return request(`/api/server/test_cluster/` , { params })
}