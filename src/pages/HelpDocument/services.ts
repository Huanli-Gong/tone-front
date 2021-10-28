import { request } from 'umi'
import _ from 'lodash'
// 获取左侧所有集团功能基线分类、根据suite名称搜索suite
export const queryHelpDocList = async ( params ? : any ) => {
    const id = params && params.id
    if(_.isNaN(id)) return;
    return request(`/api/sys/help_doc/`, { params })  
}

export const createHelpDoc =  ( data : any ) => {
    return request(`/api/sys/help_doc/`, { method : 'post', data })
}

export const updateHelpDoc = async ( data : any ) => {
    return request(`/api/sys/help_doc/`, { method : 'put', data })
}

export const deleteHelpDoc = async ( data : any ) => {
    return request(`/api/sys/help_doc/`, { method : 'delete', data })
}




