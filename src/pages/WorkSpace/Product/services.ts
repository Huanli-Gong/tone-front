import { request } from 'umi'
// 产品列表查询
export const queryProductList = async ( params : any ) => {
    return request(`/api/sys/product/` , { params })
}
// 产品删除接口
export const deleteProduct = async ( data : any ) => {
    return request(`/api/sys/product/` , { method : 'delete' , data })
}
// 新增产品
export const createProduct = async ( data : any ) => {
    return request(`/api/sys/product/` , { method : 'post' , data })
}
// 修改产品
export const updateProduct = async ( data : any ) => {
    return request(`/api/sys/product/` , { method : 'put' , data })
}
// 拖拽产品
export const dropProduct = async ( data : any ) => {
    return request(`/api/sys/product/drag/` , { method : 'put' , data })
}
// 拖拽产品的查询
export const queryDropProduct = async ( params : any ) => {
    return request(`/api/sys/product/drag/` , { params })
}
// 拖拽项目
export const dropProject = async ( data : any ) => {
    return request(`/api/sys/project/drag/` , { method : 'put' , data })
}
// 拖拽项目的查询
export const queryDropProject = async ( params : any ) => {
    return request(`/api/sys/project/drag/` , { params })
}
// 创建项目
export const createProject = async ( data : any ) => {
    return request(`/api/sys/project/` , { method : 'post' , data })
}
// 查询项目
export const queryProjectList = async ( params : any ) => {
    return request(`/api/sys/project/` , { params })
}
// 更新项目
export const updateProject = async ( data : any ) => {
    return request(`/api/sys/project/` , { method : 'put' , data })
}
// 删除项目
export const deleteProject = async ( data : any ) => {
    return request(`/api/sys/project/` , { method : 'delete' , data })
}

// 查询仓库列表
export const queryRepositoryList = async ( params : any ) => {
    return request(`/api/sys/repository/` , { params })
}
export const queryRepositoryProject = async ( params : any ) => {
    return request(`/api/sys/repository/project/` , { params })
}

// 新增仓库
export const createRepository = async ( data : any ) => {
    return request(`/api/sys/repository/` , { method : 'post' , data })
}
// 编辑仓库
export const updateRepository = async ( data : any ) => {
    return request(`/api/sys/repository/` , { method : 'put' , data })
}
// 删除仓库
export const deleteRepository = async ( data : any ) => {
    return request(`/api/sys/repository/` , { method : 'delete' , data })
}
// 查询项目下的branch
export const queryProjectBranch = async ( params : any ) => {
    return request(`/api/sys/branch/relation/` , { params })
}
// 创建产品和代码的关联
export const createBranchAndRelation = async ( data : any ) => {
    return request(`/api/sys/branch/relation/` , { method : 'post' , data })
}
// 编辑主仓库
export const updateBranchAndRelation = async ( data : any ) => {
    return request(`/api/sys/branch/relation/` , { method : 'put' , data })
}
// 删除代码
export const deleteBranchAndRelation = async ( data : any ) => {
    return request(`/api/sys/branch/relation/` , { method : 'delete' , data })
}

// 查询分支
export const queryBranchList = async ( params : any ) => {
    return request(`/api/sys/branch/` , { params })
}
//创建分支
export const createBranch = async ( data : any ) => {
    return request(`/api/sys/branch/` , { method : 'post' , data })
}
// 更新分支
export const updateBranch = async ( data : any ) => {
    return request(`/api/sys/branch/` , { method : 'put' , data })
}
// 删除分支
export const deleteBranch = async ( data : any ) => {
    return request(`/api/sys/branch/` , { method : 'delete' , data })
}

// 校验url
export const checkGitlab = async ( data : any ) => {
    return request(`/api/sys/check/gitlab/` , { method : 'post' , data })
}
