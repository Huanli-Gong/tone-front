import { request } from 'umi'

// 1.默认列表页
// 1.1 获取数量
export const queryTotalNum = async ( params : any ) => {
  return request(`/api/case/test_suite/retrieve/`, { params })
}
// 1.2 获取默认列表数据
export const queryTestSuiteList = async ( params : any ) => {
    return request(`/api/case/test_suite/retrieve/` , { method : 'GET', params })
}


// 2.搜索结果列表页
// 2.1 获取数量
export const querySearchListQuantity = async ( params : any ) => {
  return request(`/api/case/retrieve/quantity/` , { method : 'GET', params })
}
// 2.2 列表数据
export const querySearchList = async ( params : any ) => {
  const { search_key, search_type, page_num, page_size } = params
  return request(`/api/case/test_suite/retrieve/` , { method : 'POST', 
    params: { page_num, page_size },
    data: { search_key, search_type},
  })
}


// 3.suite详情页
// 3.1 suite基本信息 + Test conf信息
export const queryTestSuiteDetails = async ( params : any ) => {
  return request(`/api/case/test_suite/` , { method : 'GET', params })
}
// 3.2 指标信息
export const queryTestMetricDetails = async ( params : any ) => {
  return request(`/api/case/test_metric/` , { method : 'GET', params })
}


// 4.conf详情页信息获取
// 4.1 Test conf基本信息
export const queryTestConf = async ( params : any ) => {
  const { case_id, ws_id } = params
  return request(`/api/case/test_case/detail/${case_id}/` , {
    method : 'GET',
    params: { retrieve: 1, ws_id },
  })
}
// 4.2 同级Test conf信息
export const queryTestConfRetrieve = async ( params : any ) => {
  return request(`/api/case/test_suite/retrieve/` , { method : 'GET', params })
}
// 4.3 评价指标
export const queryTestConfMetric = async ( params : any ) => {
  return request(`/api/case/test_metric/` , { method : 'GET', params  })
}
