import { request } from 'umi';
import { stringify } from 'querystring'

export async function query() {
    return request<API.CurrentUser[]>('/api/users');
}
// 查询当前用户角色
export async function person_auth(params: any) {
    return request('/api/auth/personal_center/', { params });
}
// 查询当前用户基本信息
export async function person_auth_info() {
    return request('/api/auth/personal_home/');
}
export async function queryCurrent() {
    return request<API.CurrentUser>('/api/currentUser');
}

export async function queryNotices(): Promise<any> {
    return request<{ data: API.NoticeIconData[] }>('/api/notices');
}

export async function goldmineAnalysis(params: any) {
    if (window.location.hostname === 'tone.aliyun-inc.com') {
        const strifyParam = stringify(params)
        let goldmine_api_hostname = 'https://goldmine.aliyun-inc.com'
        // goldmine_api_hostname = 'https://goldmine.aliyun.test'
        fetch(`${goldmine_api_hostname}/sys/goldmine_access_info/?${strifyParam}`)
    }
}