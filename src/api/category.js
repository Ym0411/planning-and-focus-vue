import request from '@/utils/request.js'
// import { useTokenStore } from '@/stores/token.js'


// //获取某个分类下的未完成任务列表
// export const getUncompletedListByCategoryService = (categoryId) => {
//     // const tokenStore = useTokenStore();
//     // tokenStore.token
//     // return request.get('/api/tasks/{categoryId}/uncompletedListByCategory',{headers:{'Authorization':tokenStore.token}})
//     return request.get(`/api/tasks/${categoryId}/uncompletedListByCategory`)
// }


//创建分类
export const createCategoryService = (categoryData) => {
    // return request.post('/api/categories/createCategory',data,{headers:{'Authorization':tokenStore.token}})
    return request.post('/api/categories/createCategory',categoryData)
}

//获取分类列表
export const getCategoryListService = () => {
    return request.get('/api/categories/list')
}

//更新分类
export const updateCategoryService = (categoryData) => {
    return request.put(`/api/categories/${categoryData.id}/updateCategory`,categoryData)
}

//上移分类
export const moveUpCategoryService = (categoryData) => {
    return request.put(`/api/categories/${categoryData.id}/moveUp`,categoryData)
}

//下移分类
export const moveDownCategoryService = (categoryData) => {
    return request.put(`/api/categories/${categoryData.id}/moveDown`,categoryData)
}

//删除分类
export const deleteCategoryService = (categoryId) => {
    return request.delete(`/api/categories/${categoryId}/deleteCategory`)
}

