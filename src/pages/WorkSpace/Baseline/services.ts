import { request } from 'umi'
import { has } from 'lodash'
// 获取左侧所有集团功能基线分类、根据suite名称搜索suite
export const queryBaselineList = async ( params : any ) => {
    return request(`/api/baseline/list/`, { params })  
}

export const createBaseline = async ( data : any ) => {
    return request(`/api/baseline/list/`, { method : 'post', data })
}

export const updateBaseline = async ( data : any ) => {
    return request(`/api/baseline/list/`, { method : 'put', data })
}

export const deleteBaseline = async ( data : any ) => {
    return request(`/api/baseline/list/`, { method : 'delete', data })
}

// 右侧获取功能（一级、二级、三级）、性能 （一级、二级、三级、四级）基线详情 、根据suite名称搜索suite
export const queryBaselineDetail = async (params: any) => {
    if(has(params, 'test_case_id') && params.test_case_id === undefined){
        return
    }
    if (params.search_suite) return request(`/api/baseline/suite_search/`, { params });
    if (params.test_type === 'performance' && params.baseline_id !== undefined) {
        return request(`/api/baseline/perfs/detail/`, { params })
    } 
    // else {
    //     return request(`/api/baseline/funcs/detail/`, { params })
    // }
    if (params.test_type === 'functional' && params.baseline_id !== undefined) {
        return request(`/api/baseline/funcs/detail/`, { params })
    }
    
}

// 右侧获取功能（一级、二级、三级）、性能 （一级、二级、三级、四级）基线详情 、根据suite名称搜索suite
export const updatefuncsDetail = async (data: any) => {
    return request(`/api/baseline/funcs/detail/`, { method: 'put', data })
}

// 右侧获取功能（一级、二级、三级）、性能 （一级、二级、三级、四级）基线详情 、根据suite名称搜索suite
export const deletefuncsDetail = async (data: any) => {
    return request(`/api/baseline/funcs/detail/`, { method: 'delete', data })
}

export const deletePerfsDetail = async (data: any) => {
    return request(`/api/baseline/perfs/detail/`, { method: 'delete', data })
}



