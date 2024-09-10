import { request } from 'umi';

interface JobTypeProps {
    name: string;
    is_default: boolean;
    test_type: string;
    server_type: string;
    ws_id: string;
    description: string;
    item_dict: any;
    is_first: number;
    enable: boolean;
}

//获取所有job类型
export const queryBasicJobItms = async (params: any) => {
    return request(`/api/job/items/`, { data: params });
};

//新建job类型
export const createJobType = async (data: JobTypeProps) => {
    return request(`/api/job/type/`, { method: 'post', data });
};

//获取单个jobType详情
export const queryJobTypeDetail = async (params: { jt_id: number }) => {
    return request(`/api/job/type/`, { params });
};

//jobType 编辑
export const updateJobType = async (data: any) => {
    return request(`/api/job/type/`, { method: 'put', data });
};

//
export const queryJobTypeItems = async (params: { jt_id: number; ws_id?: string }) => {
    return request(`/api/job/relation/`, { params });
};
