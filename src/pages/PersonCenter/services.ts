import { request } from 'umi'

// 获取左侧所有集团功能基线分类、根据suite名称搜索suite
export const queryWorkspace = async ( ) => {
    return request(`/api/auth/personal_workspace/`)  
}

export const queryApprove = async () => {
    return request(`/api/auth/personal_approve/`)
}
export const reApprove = async (data:any) => {
    return request(`/api/auth/re_apply/`,{ data , method : 'post' })
}

export const queryGetToken = async (  ) => {
    return request(`/api/auth/personal_token/`)
}
export const updatePutToken = async ( ) => {
    return request(`/api/auth/personal_token/`, { method : 'put' })
}

export const queryLogout = async (  ) => {
    return request(`/api/auth/logout/`)
}