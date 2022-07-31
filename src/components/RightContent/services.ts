import { request } from 'umi'

export const applyWorkspaceRole = async ( data : any ) => {
    return request(`/api/sys/workspace/member/apply/`, { method : 'post', data })  
}