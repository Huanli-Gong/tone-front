import { request } from "umi"

/* Problem */

export const getKnowlegeProblems = (params: any) => request(`/api/sys/chats/problem/`, { params })

export const postProblem = (data: any) => request(`/api/sys/chats/problem/`, { data, method: 'post' })

export const putProblem = (data: any) => request(`/api/sys/chats/problem/`, { data, method: 'put' })

export const deleteProblem = (data: any) => request(`/api/sys/chats/problem/`, { data, method: 'delete' })

/* Answer */

export const getKnowlegeAnswers = (params: any) => request(`/api/sys/chats/answer/`, { params })

export const postKnowlegeAnswers = (data: any) => request(`/api/sys/chats/answer/`, { data, method: 'post' })

export const putKnowlegeAnswers = (data: any) => request(`/api/sys/chats/answer/`, { data, method: 'put' })

export const deleteKnowlegeAnswers = (data: any) => request(`/api/sys/chats/answer/`, { data, method: 'delete' })