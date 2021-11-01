import { request } from 'umi'

// 1.查询total
export async function querySummary(params: any) {
  return request(`/api/user/summary`, { method: 'GET', params});
}

// 2.分页列表
export async function queryTableData(params: any) {
  return request(`/api/job/test/upload/offline/` , { method: 'GET', params })
}

// 3.删除接口
export async function queryDelete(params: any) {
  return request(`/api/job/test/upload/offline/`, {
    method: 'DELETE',
    data: params,
  });
}

// 4.创建接口
export async function createProject(params = {}) {
  const formData = new FormData();
  Object.keys(params).forEach(key => {
    if (params[key]) { // 过滤掉无效参数
      formData.append(key, params[key]);
    }
  })
	return request(`/api/job/test/upload/offline/`, {
    method: 'post',
    data: formData,
	});
}

// ---------------------------------------------
// 4.1 查询product列表接口
export async function queryProduct() {
	return request(`/api/product_list`, {
    method: 'GET',
	});
}
// 4.1.2 根据 product 查询 project列表接口
export async function queryProject(params = {}) {
  const { parentId, searchKeyword }: any  = params;
  const url = searchKeyword ? `/api/project_list/${parentId}/${searchKeyword}` : `/api/project_list/${parentId}`;
	return request(url, {
    method: 'GET',
	});
}
// ---------------------------------------------

// 4.2 查询baseline列表接口
export async function queryBaseline(params = {}) {
  const { page, pageSize, parentId, searchKeyword }: any = params;
  // 判断有无搜素内容
  const url = searchKeyword ? `/api/baseline/${searchKeyword}/${parentId}/${page}/${pageSize}` : `/api/baseline/${parentId}/${page}/${pageSize}`;
	return request(url, {
    method: 'GET',
	});
}

// 4.3 biz列表接口
export async function queryBizList(params = {}) {
  const { searchKeyword, page, pageSize }: any  = params;
  const url = searchKeyword ? `/api/biz_list/${searchKeyword}/${page}/${pageSize}` : `/api/biz_list/${page}/${pageSize}`;
	return request(url, {
    method: 'GET',
	});
}

// 4.4 upload上传文件接口
export async function uploadTar(params = {}) {
  const formData = new FormData();
  Object.keys(params).forEach(key => {
    formData.append(key, params[key]);
  })
	return request(`/api/job/test/upload/tar/`, {
    method: 'post',
    data: formData,
	});
}