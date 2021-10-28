import { request } from 'umi';

//用户角色列表
export async function workspaceList(params:any) {
    return request('/api/sys/workspace/',{
        params
    });
}
// 获取结果对比图表数据
export async function compareChart(data:any) {
    return request('/api/job/result/compare/chart/',{
        data,
        method : 'post',
    })
}

// 保存对比分析结果数据
export async function compareForm(data:any) {
    return request('/api/job/result/compare/form/',{
        data,
        method : 'post',
    })
}
//查看对比分析结果
export async function queryForm(params:any) {
    return request('/api/job/result/compare/form/',{ 
        params 
    })
}