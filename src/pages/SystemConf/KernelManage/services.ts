import { request } from 'umi'

export const queryKernelList = ( params? : any ) => {
    return request(`/api/sys/kernel/` , { params })
}

export const createKernel = ( data : any ) => {
    return request('/api/sys/kernel/' , { method : 'post' , data })
}

export const updateKernel = ( data : any ) => {
    return request(`/api/sys/kernel/` , { method : 'put' , data })
}

export const deleteKernel = ( data : any ) => {
    return request(`/api/sys/kernel/` , { method : 'delete' , data })
}
export const updateSyncKernel = async ( data : any ) => {
    return request(`/api/sys/sync_kernel/` , { method : 'post' , data })
}