import { createRouter, createWebHistory } from 'vue-router'

// 导入路由组件
import LoginVue from '@/views/Login.vue'
import LayoutVue from '@/views/Layout.vue'
import UncompletedListVue from '@/views/task/UncompletedList.vue'
import CompletedListVue from '@/views/task/CompletedList.vue'
import OverdueListVue from '@/views/task/OverdueList.vue'
import TrashTasksVue from '@/views/task/TrashTasks.vue'
import TaskListByCategoryVue from '@/views/task/TaskListByCategory.vue'
import CategoryListVue from '@/views/category/CategoryList.vue'
import UserInfoVue from '@/views/user/UserInfo.vue'
import UpdateProfileVue from '@/views/user/UpdateProfile.vue'
import ChangePasswordVue from '@/views/user/ChangePassword.vue'
import UpdateAvatarVue from '@/views/user/UpdateAvatar.vue'


//定义路由
const routes = [
    {path: '/login',component: LoginVue},
    {path: '/', component: LayoutVue, redirect: '/task/UncompletedList', children:[
        {path:'/task/UncompletedList', component: UncompletedListVue},
        {path:'/task/CompletedList', component: CompletedListVue},
        {path:'/task/OverdueList', component: OverdueListVue},
        {path:'/task/TrashTasks', component: TrashTasksVue},
        {path:'/task/TaskListByCategory', component: TaskListByCategoryVue},
        {path:'/category/CategoryList', component: CategoryListVue},
        {path:'/user/UserInfo', component: UserInfoVue},
        {path:'/user/UpdateProfile', component: UpdateProfileVue},
        {path:'/user/ChangePassword', component: ChangePasswordVue},
        {path:'/user/UpdateAvatar', component: UpdateAvatarVue},
    ]}
]

//创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

// 导出路由
export default router