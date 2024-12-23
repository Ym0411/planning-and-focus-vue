import request from '@/utils/request.js'
// import { useTokenStore } from '@/stores/token.js'


//获取未完成任务列表
export const getUncompletedListService = () => {
    // const tokenStore = useTokenStore();
    // tokenStore.token
    // //在pinia定义的响应式数据中，都不需要 .value 
    // return request.get('/api/tasks/uncompletedList',{headers:{'Authorization':tokenStore.token}})
    return request.get('/api/tasks/uncompletedList')
}

//获取已完成任务列表
export const getCompletedListService = () => {
    // const tokenStore = useTokenStore();
    // tokenStore.token
    // return request.get('/api/tasks/completedList',{headers:{'Authorization':tokenStore.token}})
    return request.get('/api/tasks/completedList')
}

//获取已逾期任务列表
export const getOverdueListService = () => {
    // const tokenStore = useTokenStore();
    // tokenStore.token
    // return request.get('/api/tasks/overdueList',{headers:{'Authorization':tokenStore.token}})
    return request.get('/api/tasks/overdueList')
}

//获取回收站任务列表
export const getTrashListService = () => {
    // const tokenStore = useTokenStore();
    // tokenStore.token
    // return request.get('/api/tasks/trashList',{headers:{'Authorization':tokenStore.token}})
    return request.get('/api/tasks/trashList')
}

//获取某个分类下的未完成任务列表
export const getUncompletedListByCategoryService = (categoryId) => {
    if (!categoryId) {
        return Promise.reject(new Error('分类ID不能为空'))
    }
    return request.get(`/api/tasks/${categoryId}/uncompletedListByCategory`)
}



//添加任务
export const createTaskService = (task) => {
    return request.post('/api/tasks/createTask', task)
}


//获取任务详情
export const getTaskDetailService = (taskId) => {
    return request.get(`/api/tasks/${taskId}/detail`)
}

//更新任务
export const updateTaskService = (taskId, task) => {
    return request.put(`/api/tasks/${taskId}/update`, task)
}

//完成任务（修改为已完成状态）
export const completeTaskService = (taskId) => {
    return request.put(`/api/tasks/${taskId}/complete`)
}

//重新规划已逾期任务（更新截止日期，从已逾期改为未逾期）
export const rescheduleTaskService = (taskId, task) => {
    return request.put(`/api/tasks/${taskId}/reschedule`, task)
}

//将任务移入回收站（逻辑删除）
export const moveToTrashService = (taskId) => {
    return request.put(`/api/tasks/${taskId}/moveToTrash`)
}


//从回收站恢复任务
export const restoreFromTrashService = (taskId) => {
    return request.put(`/api/tasks/${taskId}/restoreFromTrash`)
}


//清空回收站（物理删除）
export const emptyTrashService = () => {
    return request.delete('/api/tasks/emptyTrash')
}

//从回收站删除任务（物理删除单个任务）
export const deleteFromTrashService = (taskId) => {
    return request.delete(`/api/tasks/${taskId}/deleteFromTrash`)
}





