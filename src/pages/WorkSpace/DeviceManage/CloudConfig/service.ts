import { request } from 'umi';

// get region by ak_id
export async function queryRegionCloudAk (params: any) {
    return request(`/api/server/cloud_server/region/`, { params })
}

// get Ak list
export async function queryCloudAk (params : any) {
    if(params) return request(`/api/server/cloud_ak/` , { params })
    return request(`/api/server/cloud_ak/`)
}
//create  Ak
export async function createCloudAk (data: any) {
    return request(`/api/server/cloud_ak/`, { method: 'post', data })
}

//update  Ak 
export async function updateCloudAk (data: any) {
    return request(`/api/server/cloud_ak/`, { method: 'put', data })
}

//delete  Ak 
export async function deleteCloudAk (data: any) {
    return request(`/api/server/cloud_ak/`, { method: 'delete', data })
}

// get image list
export async function queryCloudImage (params : any) {
    if(params) return request(`/api/server/cloud_image/` , { params })
    return request(`/api/server/cloud_image/`)
}
//create  image
export async function createCloudImage (data: any) {
    return request(`/api/server/cloud_image/`, { method: 'post', data })
}

//update  image 
export async function updateCloudImage (data: any) {
    return request(`/api/server/cloud_image/`, { method: 'put', data })
}

//delete  image 
export async function deleteCloudImage (data: any) {
    return request(`/api/server/cloud_image/`, { method: 'delete', data })
}


// get domain list
export async function getDomain (params : any) {
    if(params) return request(`/api/case/test_domain/` , { params })
    return request(`/api/case/test_domain/`)
}

//查询成员
export async function member ( params:any ) {
    return request('/api/auth/user/' , { 
        params 
    })
}