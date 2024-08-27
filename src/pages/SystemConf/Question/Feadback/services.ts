import { request } from "umi"

/* feedback */

export const getFeedback = (params: any) => request(`/api/sys/chats/collect/`, { params })

export const postFeedback = (data: any) => request(`/api/sys/chats/collect/`, { data, method: 'post' })

export const putFeedback = (data: any) => request(`/api/sys/chats/collect/`, { data, method: 'put' })

export const deleteFeedback = (data: any) => request(`/api/sys/chats/collect/`, { data, method: 'delete' })