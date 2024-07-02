import { request } from 'umi';

export const queryProductList = async ( params : any ) => {
    return request(`/api/report/test/report/product/version/`, { params })
}