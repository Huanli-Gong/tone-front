import { request } from 'umi'

export const queryTestServerList = async ( params : {
    ws_id : string,
    ip? : string,
    sn? : string,
    description? : string,
    device_type? : string,
    device_mode? : string,
    channel_type? : string,
    app_group? : string,
    state? : string,
    tags? : string,
    page_num? : number,
    page_size? : number,
}) => {
    return request(`/api/server/test_server/` , { params })
}

export const queryServerDel = async( params:any ) => {
    return request('/api/server/del_confirm/', { params })
}

export const queryTestServerNewList = async ( params : {
    ws_id : string,
    ip? : string,
    sn? : string,
    description? : string,
    device_type? : string,
    device_mode? : string,
    channel_type? : string,
    app_group? : string,
    state? : string,
    tags? : string,
    page_num? : number,
    page_size? : number,
}) => {
    return request(`/api/server/specify_test_server/` , { params })
}
export const queryServerTagList = async ( params : {
    ws_id : string
    run_mode ?: string,
    run_environment ?: string,
}) => {
    return request(`/api/server/server_tag/` , { params })
}

export const checkTestServerIps = async ( params : any ) => {
    return request(`/api/server/test_server/check/` , { params })
}
// 集群修改机器
export function editGroupMachine (id:number, params:any={} ) {
    return request(`/api/server/test_cluster/cloud_server/detail/${id}/` , { 
        method: 'PUT',
        data: {...params}
    })
}
//添加集团单机
export const addTestServer = async ( data : {
    ips	: Array<string>,
    state : string, //使用状态：Available, Occpuied, Broken, Reserved
    tags : Array<string>,
    owner : number,
    ws_id : string,
    description ? : string
} ) => {
    return request(`/api/server/test_server/` , { method : 'post' , data })
}
//查询成员
export function queryMember ( params:any={} ) {
    return request('/api/auth/user/' , { 
        params 
    })
}
//集团单机详情查询
export const queryTestServerDetail = async ( id : number | string ) => {
    return request(`/api/server/test_server/detail/${ id }/`)
}

//集团单机详情状态查询
export const queryChannelState = async ( params : any ) => {
    return request(`/api/server/test_server/channel/state/`,{ params})
}
//批量同步更新单机信息
export const batchUpdateTestServer = async ( params : { pks : number[] }) => {
    return request(`/api/server/test_server/update/batch/` , { params })
}

//批量同步编辑单机信息
export const batchPutTestServer = async (params: { ws_id: string, server_ids: number[], description?: string, tags?: number[] }) => {
    return request(`/api/server/test_server/update/batch/`, {
        method: 'post',
        data: params,
    })
}

//集团单机修改 编辑
export const putTestServer = async ( id : number , data : any ) => {
    return request(`/api/server/test_server/detail/${ id }/` , {
        method : 'put',
        data
    })
}

//集团单机删除
export const deleteTestServer = async ( id : number, params:any ) => {
    return request(`/api/server/test_server/detail/${ id }/` , {
        method : 'delete',
        data: params,
    })
}

//集团单机同步
export const updateTestServer = async ( pk : number ) => {
    return request(`/api/server/test_server/update/` , { params : { pk }})
}

//集群列表查询
// name	字符串	否	a	集群名称
// cluster_type	字符串	否	aligroup	集群类型:aligroup(集团), aliyun(云上)
// owner	字符串	否	1	owner，支持多个查询
// description	字符串	否	abc	描述
// tags	字符串	否	1,2,3	标签ID列表，逗号分隔
export const queryServerGroupList = async ( params : any ) => {
    return request(`/api/server/test_cluster/` , { params })
}

//新建集群
export const createServerGroup = async ( data : any ) => {
    return request(`/api/server/test_cluster/` , { method : 'post' , data })
}

//集群添加机器
export const addServerGroup = async ( data : any ) => {
    return request(`/api/server/test_cluster/test_server/` , { method : 'post' , data })
}

//集群详情
export const queryServerGroupDetails = async ( id : string | number ) => {
    return request(`/api/server/test_cluster/detail/${ id }/`)
}

//编辑集群
export const updateServerGroup = async ( id : string | number , data : any ) => {
    return request(`/api/server/test_cluster/detail/${ id }/` , { method : 'put' , data })
}

//删除集群
export const deleteServerGroup = async ( id : string | number ) => {
    return request(`/api/server/test_cluster/detail/${ id }/` , { method : 'delete' })
}

//
export const queryTestServerAppGroup = async ( params:any ) => {
    return request(`/api/server/test_server/group/` ,{ params })
}

//集群下编辑机器
export const updateClusterServer = async ( id : number , data : any ) => {
    return request(`/api/server/test_cluster/test_server/detail/${ id }/` , { method : 'put' , data })
}

//集群下删除机器
export const deleteClusterServer = async ( id : number ,params : any ) => {
    return request(`/api/server/test_cluster/test_server/detail/${ id }/` , { method : 'delete' ,data : params })
}

// 集群下机器列表
export const queryClusterServer = async ( cluster_id : number | string ) => {
    return request(`/api/server/test_cluster/test_server/` , { params : { cluster_id }})
}

//部署机器
export const deployClusterServer = async ( data : {
    deploy_user : string,
    deploy_pass : string,
    server_id : string | number
} ) => {
    return request(`/api/server/test_server/deploy/` , { method : 'post' , data })
}

// -------------start 机器部署开发--------------
// 1.Version版本列表
export async function queryVersionList(
    params: {},
    options?: { [key: string]: any },
  ) {
    return request('/api/server/toneagent_version/', {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    });
  }

// 2. Agent部署
export const agentDeploy = async (data: any) => {
  return request('/api/server/toneagent_deploy/' , { method : 'post' , data })
}
// -------------end 机器部署开发--------------