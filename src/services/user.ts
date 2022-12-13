import { request } from 'umi';

export async function query() {
    return request<API.CurrentUser[]>('/api/users');
}

/* 20221123 合并权限接口 */
export async function person_auth(params: any) {
    return request(`/api/auth/personal_home_center/`, { params })
}

export async function queryCurrent() {
    return request<API.CurrentUser>('/api/currentUser');
}

export async function queryNotices(): Promise<any> {
    return request<{ data: API.NoticeIconData[] }>('/api/notices');
}