import { request } from 'umi';

export const queryProductList = async ( params : any ) => {
    return request(`/api/get/product/version/`, { params })
}