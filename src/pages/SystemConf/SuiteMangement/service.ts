import { request } from 'umi';

//Suite列表查询
export async function suiteList(params?:any) {
    return request('/api/case/test_suite/',{
        params
    });
}

//新增Suite
export async function addSuite(params:any) {
    return request('/api/case/test_suite/',{
        method: 'POST',
        data: {...params}
    });
}

//编辑Suite
export async function editSuite(outId:number, params:any) {
    return request(`/api/case/test_suite/detail/${outId}/`,{
        method: 'PUT',
        data: {...params}
    });
}
// 同步
export function manual () {
    return request('/api/case/manual_sync/')
}
// 最后一次同步时间
export function lastSync () {
    return request('/api/case/last_sync/')
}
//查询成员
export function member ( params:any ) {
    return request('/api/auth/user/' , { 
        params 
    })
}

//创建test metric name list
export function queryTestMetric( params : any ) {
    return request( `/api/case/test_metric_list/` , { params })
}

//删除Suite
export async function delSuite(outId:number) {
    return request(`/api/case/test_suite/detail/${outId}/`,{
        method: 'DELETE'
    });
}
// 同步Suite
export async function syncSuite(id:number) {
    return request(`/api/case/test_suite/sync/${id}/`);
}

// 展开Suite
export async function openSuite(params:any) {
    return request('/api/case/test_case/',{
        params
    });
}

// 新增Case
export async function addCase(params:any) {
    return request('/api/case/test_case/ ',{
        method: 'POST',
        data: {...params}
    });
}

//编辑Case
export async function editCase(innerId:any,params:any) {
    return request(`/api/case/test_case/detail/${innerId}/`,{
        method: 'PUT',
        data: {...params}
    });
}

//删除Case
export async function delCase(innerId:number) {
    return request(`/api/case/test_case/detail/${innerId}/`,{
        method: 'DELETE',
    });
}

//批量删除Case
export async function delBentch(data:any) {
    return request('/api/case/test_case/batch/',{
        method: 'DELETE',
        data
    });
}

//批量Case编辑
export async function editBentch(data:any) {
    return request('/api/case/test_case/batch/',{
        method : 'put',
        data
    });
}

//获取metric
export async function metricList(params:any) {
    return request('/api/case/test_metric/',{
        params
    });
}

//新增metric
export async function addMetric(params:any) {
    return request('/api/case/test_metric/ ',{
        method: 'POST',
        data: {...params}
    });
}

//编辑metric
export async function editMetric(metricId:number,params:any) {
    return request(`/api/case/test_metric/${metricId}/`,{
        method: 'PUT',
        data: {...params}
    });
}

//删除metric
export async function delMetric(metricId:number , data? : any ) {
    return request(`/api/case/test_metric/${metricId}/`,{
        method: 'DELETE',
        data
    });
}

//校验suite
export function validateSuite ( params : any ) {
    return request(`/api/case/test_suite/exist/` , { params })
}

// get domain list
export async function getDomain (params : any) {
    if(params) return request(`/api/case/test_domain/` , { params })
    return request(`/api/case/test_domain/`)
}
//create  domain
export function createDomains (data: any) {
    return request(`/api/case/test_domain/`, { method: 'post', data })
}

//update  domain 
export function updateDomains (data: any) {
    return request(`/api/case/test_domain/`, { method: 'put', data })
}

//delete  domain 
export async function deleteDomains (data: any) {
    return request(`/api/case/test_domain/`, { method: 'delete', data })
}

/*************** 业务测试接口 ********************/
// 1.业务测试列表。
export async function queryBusinessList(params: any) {
    let tempParams = {}
    for (let key in params) {
      if (params[key] || params[key]=== 0) {
        tempParams[key] = params[key]
      }
    }
    return request('/api/case/test_business/', { method: 'GET', params: tempParams });
}

// 2.添加业务
export function addBusiness(data: any) {
    return request(`/api/case/test_business/`, { method: 'post', data })
}

// 3.查询业务项下suite列表
export async function querySuiteList(params: any) {
  const { business_id } = params
  return request(`/api/case/test_business/detail/${business_id}/`, { method: 'GET', });
}

// 4.修改业务
export async function editBusiness(data:any) {
  const { id } = data
  return request(`/api/case/test_business/detail/${id}/`,{ method : 'PUT', data });
}

// 5.删除业务项
export async function deleteBusiness(data:any) {
  const { id } = data
  return request(`/api/case/test_business/detail/${id}/`,{ method : 'DELETE', });
}

// 6.业务项下(新增  / 删除)suite
// 6.1.新增suite
export function addSuite2 (data: any) {
  return request(`/api/case/test_suite/`, { method: 'POST', data })
}

// 6.2.删除suite
export async function deleteSuite(data:any) {
    const { id } = data
    return request(`/api/case/test_suite/${id}/`,{ method : 'DELETE', data });
  }

// 7.编辑suite
// ????  

// 8.校验suite
export async function checkSuite(params: any) {
    return request(`/api/case/test_suite/exist/`, { method: 'GET', params });
  }

// 9.Conf展开  
export function queryConf(params: any) {
   // 展开Suite 
   return openSuite(params)
}

// 10.新增接入测试类型conf
export function addConf(params: any) {
    return addCase(params)
 }
  // 编辑接入测试类型conf
 export function editConf(params: any) {
    const { id, ...other } = params
    return editCase(id, other)
 }

// 11.1 批量删除前进行查询
export async function queryDelSuiteAll(params:any) {
    return request(`/api/case/sys_case/confirm/`,{ method : 'GET', params });
}
// 11.2 批量删除suite级
export async function deleteBusinessSuiteAll(data:any) {
    return request(`/api/case/test_suite/batch/`,{ method : 'DELETE', data });
}
// 12.conf级-批量修改
export async function deleteBusinessConfEditAll(data:any) {
    return request(`/api/case/test_case/batch/`,{ method : 'PUT', data });
}