import { request } from 'umi'

export const getUsualProblem = (params: any) => request(`/api/sys/chats/query/`, { params })
export const getSelfServices = (params: any) => request(`/api/sys/chats/check/`, { params })

