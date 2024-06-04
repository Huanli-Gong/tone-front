import { request } from 'umi'

// 2.分页列表
export async function queryOperationLog(params: any) {
  return request(`/api/sys/operation/log/`, { method: 'GET', params })
}
