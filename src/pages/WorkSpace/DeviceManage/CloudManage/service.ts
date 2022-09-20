import { request } from 'umi';

//查询单机
export async function cloudList(params:any={}) {
    return request('/api/server/cloud_server/',{
        params
    });
}

//新增单机
export async function addCloud(params:any={}) {
    return request('/api/server/cloud_server/',{
        method: 'POST',
        data: {...params}
    });
}


//编辑单机
export async function editCloud(id:number,params:any={}) {
    return request(`/api/server/cloud_server/detail/${id}/`,{
        method: 'PUT',
        data: {...params}
    });
}


//删除单机
export async function delCloud(id:number,params:any) {
    return request(`/api/server/cloud_server/detail/${id}/`,{
        method: 'DELETE',
        data: { ...params }
    });
}

//查询标签
export async function queryTag (params:any={}) {
    return request(`/api/server/server_tag/`,{
        params
    } )
}

//查询成员
export function queryMember ( params:any={} ) {
    return request('/api/auth/user/' , { 
        params 
    })
}

//查询规格
export function queryInstance ( params:any={} ) {
    return request('/api/server/cloud_server/instance_type/' , { 
        params 
    })
}

//查询机器
export function querysServer ( params:any={} ) {
    return request('/api/server/cloud_server/aliyun/' , { 
        params 
    })
}

//查询镜像
export function querysImage ( params:any={} ) {
    return request('/api/server/cloud_server/image/' , { 
        params 
    })
}

//查询磁盘规格
export function queryCategories ( params:any={} ) {
    return request('/api/server/cloud_server/disk/categories/' , { 
        params 
    })
}

// 校验名称是否重复
export function queryName ( params:any={} ) {
    return request('/api/server/check/cloud_name/' , { 
        params 
    })
}

//查询 var_name
export function queryVarName ( params: any={} ) {
    return request('/api/server/check/var_name/' , { 
        method: 'POST',
        data: {...params}
    })
}

//查询集群
export function querysCluster ( params:any={} ) {
    return request('/api/server/test_cluster/' , { 
        params 
    })
}

//添加集群
export function addGroup ( params:any={} ) {
    return request('/api/server/test_cluster/' , { 
        method: 'POST',
        data: {...params}
    })
}

//编辑集群
export function editGroup ( id:number,params:any ) {
    return request(`/api/server/test_cluster/detail/${id}/` , { 
        method: 'PUT',
        data: {...params}
    })
}



//删除集群
export function delGroup ( id:number,params:any ) {
    return request(`/api/server/test_cluster/detail/${id}/` , { 
        method: 'DELETE',
        data: params 
    })
}

//查询AK
export function querysAK ( params:any={} ) {
    return request('/api/server/cloud_ak/' , { 
        params 
    })
}

//查询Region
export function querysRegion ( params:any={} ) {
    return request('/api/server/cloud_server/region/' , { 
        params 
    })
}

//查询Zone
export function queryZone ( params:any={} ) {
    return request('/api/server/cloud_server/zone/' , { 
        params 
    })
}

/**
 * 查询集群云上单机状态
 * 返回参数：0、无单机；1、选择已有；2、立即购买
 * @param id 
 */
export function queryCloudType( id:number ) {
    return request(`/api/server/test_cluster/cloud_type/${id}/`)
}

//集群下查询机器
export function queryClusterMachine ( params:any={} ) {
    return request('/api/server/test_cluster/cloud_server/' , { 
        params
    })
}

//集群添加机器
export function addGroupMachine ( params:any={} ) {
    return request('/api/server/test_cluster/cloud_server/' , { 
        method: 'POST',
        data: {...params}
    })
}

// 集群修改机器
export function editGroupMachine (id:number, params:any={} ) {
    return request(`/api/server/test_cluster/cloud_server/detail/${id}/` , { 
        method: 'PUT',
        data: {...params}
    })
}

//集群删除机器
export function delGroupMachine ( id:number ) {
    return request(`/api/server/test_cluster/cloud_server/detail/${id}/` , { 
        method: 'DELETE'
    })
}

//云上机器同步状态
export const stateRefresh = async (data: any) => {
    return request('/api/server/sync_state/', { method: 'post', data })
}