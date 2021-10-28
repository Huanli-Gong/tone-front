import { request } from 'umi';

export const projectList = async ( params : any ) => {
    return request(`/api/sys/project/`, { params })
}