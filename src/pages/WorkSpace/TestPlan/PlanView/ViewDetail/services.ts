import { request } from 'umi'

// 11.获取计划实例结果详情信息
export const queryPlanResultDetail = ( params : any ) => {
    return request(`/api/plan/result/detail/` , { params })
}

// 12.修改计划实例基础配置备注信息
export const editPlanNote = ( data : any ) => {
    return request(`/api/plan/result/detail/` , { data , method : 'post' })
}
