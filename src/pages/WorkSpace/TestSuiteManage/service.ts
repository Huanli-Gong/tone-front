import { request } from 'umi';

//Suite列表查询
export async function querySuiteList(params?:any) {
    return request('/api/case/workspace/case/',{
        params
    });
}

//查询成员
export async function member ( params:any ) {
    return request('/api/auth/user/' , { 
        params 
    })
}

//是否为新ws

export async function queryWorkspaceHasRecord ( params : any ) {
    return request(`/api/case/workspace/has_record/` , { params })
}

//domain list
export async function queryDomains (params:any={page_size: 100}) {
    return request(`/api/case/test_domain/`,{params} )
}


/*************** 业务测试接口 ********************/
// 1.业务测试列表
export async function queryBusinessList(params: any) {
    // 过滤为空的参数
    let tempParams = {}
    for (let key in params) {
      if (params[key] || params[key]=== 0) {
        tempParams[key] = params[key]
      }
    }
    return request('/api/case/workspace/business/brief/', { method: 'GET', params: tempParams });
}

// 2. TestSuite管理：系统级业务suite获取（右侧）
export async function queryBusinessSuite(params: any) {
    // 过滤为空的参数
    let tempParams = {}
    for (let key in params) {
      if (params[key] || params[key]=== 0) {
        tempParams[key] = params[key]
      }
    }
    return request('/api/case/business/brief/', { method: 'GET', params: tempParams });
}

// 3. TestSuite管理：当前WS已添加业务suite获取（左侧）
export async function queryWorkspaceBusinessSuite(params: any) {
    return request('/api/case/workspace/business/brief/', { method: 'GET', params });
}
