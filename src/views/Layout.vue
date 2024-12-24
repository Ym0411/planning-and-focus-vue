<script setup>
import {
    Management,
    Promotion,
    Folder,
    SwitchButton,
    CaretBottom,
    Delete,
    Plus,
    Setting,
    Files,
    User,
    Crop,
    EditPen
} from '@element-plus/icons-vue'
import avatar from '@/assets/default.png'
import { ref, onMounted, onUnmounted, onBeforeMount, nextTick } from 'vue'
import { createCategoryService, getCategoryListService } from '@/api/category.js'
import { createTaskService, getUncompletedListByCategoryService, updateTaskService } from '@/api/task.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import emitter from '@/utils/eventBus'
//富文本编辑器
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import CountdownTimer from '@/components/CountdownTimer.vue'
import { Timer } from '@element-plus/icons-vue'
import { getUserInfoService, deleteAccountService } from '@/api/user.js'

const categories = ref([
  { id: 'default', name: '未分类', icon: Files }
])



//TODO: 动态添加分类
// const handleAddCategory = () => {
//   // 添加分类的逻辑
//   console.log('添加分类')
// }

// const handleManageCategories = () => {
//   // 管理分类的逻辑
//   console.log('管理分类')
// }


//控制添加分类弹窗
const categoryDialogVisible = ref(false)

//添加分类数据模型
const categoryModel = ref(
    
    {
        "id": 2,
        "name": "工作",   //不为空
        "color": "#FF0000",   //颜色格式：#RRGGBB
        "userId": 1,
        "sortOrder": 1,
        "createdAt": "2024-03-20 10:00:00",
        "updatedAt": "2024-03-20 10:00:00"
    }
)

//添加分类表单校验
const categoryRules = {
    name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
    ],
    color: [    
        { required: true, message: '请输入分类颜色', trigger: 'blur' },
    ]
}

//获取分类列表
const fetchCategoryList = async () => {
  try {
    const res = await getCategoryListService()
    if (res.data) {
      // 直接使用后端返回的分类数据
      categories.value = res.data.map(category => ({
        ...category,
        icon: Files // 这里可以根据category.type等属性动态设置不同图标
      }))
    }
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  }
}

// 添加分类
const createCategory = async () => {
  try {
    const res = await createCategoryService(categoryModel.value)
    ElMessage.success(res.message || '添加分类成功')
    // 刷新分类列表
    await fetchCategoryList()
    // 通知 Category.vue 刷新列表
    emitter.emit('updateCategoryList')
    categoryDialogVisible.value = false
  } catch (error) {
    ElMessage.error('创建分类失败')
  }
}

// 添加任务列表的响应式数据
const taskList = ref([])

// 侧边栏下拉菜单中分类点击事件
const handleCategoryClick = async (category) => {
  try {
    const res = await getUncompletedListByCategoryService(category.id)
    if (res.data) {
      router.push({
        path: '/task/TaskListByCategory',
        query: { 
          categoryId: category.id,
          categoryName: category.name
        }
      })
    }
  } catch (error) {
    console.error('错误:', error)
    ElMessage.error('获取任务列表失败')
  }
}

// 路由
const router = useRouter();

// 在组件挂载时获取分类列表
onMounted(() => {
  fetchCategoryList()
})

// 监听分类列表更新事件
emitter.on('updateCategoryList', () => {
    fetchCategoryList()
})

// 组件卸载时移除事件监听
onUnmounted(() => {
    emitter.off('updateCategoryList')
})




//添加任务数据模型
const taskModel = ref({
    title: '',
    description: '',
    categoryId: undefined,
    quadrant: 'URGENT_IMPORTANT',
    dueDate: ''
})
//添加任务表单校验
const rules = {
    title: [
        { required: true, message: '请输入任务标题', trigger: 'blur' },
    ],
    description: [
        { required: false, message: '请输入任务描述', trigger: 'blur' },
    ],
    categoryId: [
        { required: false, message: '请选择任务分类', trigger: 'blur' },
    ],
    quadrant: [
        { required: true, message: '请选择任务优先级', trigger: 'blur' },
    ],
    dueDate: [
        { required: true, message: '请输入任务截止日期', trigger: 'blur' },
    ]
}


//添加任务弹窗
//控制抽屉是否显示
const visibleDrawer = ref(false)

const createTask = async () => {
    try {
        const res = await createTaskService(taskModel.value)
        ElMessage.success(res.message || '添加任务成功')
        // 重置表单
        taskModel.value = {
            title: '',
            description: '',
            categoryId: undefined,
            quadrant: 'URGENT_IMPORTANT',
            dueDate: ''
        }
        // 关闭抽屉
        visibleDrawer.value = false
        // 通知未完成任务列表更新
        emitter.emit('updateTaskList')
    } catch (error) {
        ElMessage.error('创建任务失败')
    }
}


// 编辑任务抽屉控制
const editDrawerVisible = ref(false)
const editTaskModel = ref({
    id: '',
    title: '',
    description: '',
    categoryId: undefined,
    quadrant: '',
    dueDate: ''
})

// 监听编辑任务事件
emitter.on('editTask', (task) => {
    editTaskModel.value = { ...task }
    editDrawerVisible.value = true
})

// 更新任务
const updateTask = async () => {
    try {
        await updateTaskService(editTaskModel.value.id, editTaskModel.value)
        ElMessage.success('更新任务成功')
        editDrawerVisible.value = false
        // 通知所有任务列表更新
        emitter.emit('updateTaskList')
    } catch (error) {
        ElMessage.error('更新任务失败')
    }
}

// 组件卸载时移除事件监听
onUnmounted(() => {
    emitter.off('editTask')
})


import {useUserInfoStore} from '@/stores/userInfo.js'
import {useTokenStore} from '@/stores/token.js'
const userInfoStore = useUserInfoStore();
const tokenStore = useTokenStore();
//调用函数，获取用户详细信息
const getUserInfo = async () => {
    try {
        //调用接口
        const res = await getUserInfoService()
        //将用户信息设置到pinia中
        userInfoStore.setUserInfo(res.data)
    } catch (error) {
        console.error('获取用户信息失败:', error)
        if (!tokenStore.token) {
            router.push('/login')
        }
    }
}

// 在组件挂载时获取用户信息
onMounted(async () => {
    await getUserInfo()
    await fetchCategoryList()
})



//处理用户命令
const handleCommand = (command) => {
    if (command === 'logout') {
        // ElMessage.success('退出登录成功')
        ElMessageBox.confirm('确定要退出登录吗？', '提示', {    
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            //退出登录
            //清空pinia中的token以及个人信息
            tokenStore.removeToken()
            userInfoStore.clearUserInfo()
            //跳转到登录页面
            router.push('/login')
            ElMessage({
                message: '退出登录成功',
                type: 'success'
            })
        })
        .catch(() => {
            ElMessage({
                message: '已取消',
                type: 'info'
            })
        })
    }
    // else{
    //     router.push('/user/'+command)
    // }


    if (command === 'userInfo') {
        router.push('/user/UserInfo')
    }
    if (command === 'updateProfile') {
        router.push('/user/UpdateProfile')
    }
    if (command === 'changePassword') {
        router.push('/user/ChangePassword')
    }

    
    if (command === 'deactivate') {
        ElMessageBox.confirm('确定要注销账号吗？注销后账号将被锁定且不可恢复登录！', '警告', {
            confirmButtonText: '确定注销',
            cancelButtonText: '取消',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
        }).then(async () => {
            try {
                const res = await deleteAccountService()
                if (res.code === 200) {
                    // 修改顺序：先跳转，再清除数据
                    await nextTick()
                    await router.push('/login')
                    // 然后再清除数据
                    tokenStore.removeToken()
                    userInfoStore.clearUserInfo()
                    ElMessage.success('账号已注销')
                } else {
                    throw new Error(res.message || '注销失败')
                }
            } catch (error) {
                ElMessage.error(error.message || '注销失败，请稍后重试')
                // 失败时，确保用户留在当前页面
                if (router.currentRoute.value.path === '/') {
                    router.push('/task/UncompletedList')
                }
            }
        }).catch(() => {
            ElMessage.info('已取消注销')
            // 取消时，确保用户留在当前页面
            if (router.currentRoute.value.path === '/') {
                router.push('/task/UncompletedList')
            }
        })
    }
    if (command === 'avatar') {
        router.push('/user/UpdateAvatar')
    }
}

// 添加事件监听
emitter.on('updateUserInfo', () => {
    getUserInfo()
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
    emitter.off('updateUserInfo')
    // ... 其他已有的事件清理 ...
})

// 在组件挂载前检查token
onBeforeMount(() => {
  // 如果没有token，跳转到登录页
  if (!tokenStore.token) {
    router.push('/login')
    return
  }
})

// 在其他 ref 变量后添加
const countdownVisible = ref(false)
const currentTask = ref({
  title: '专注时间'  // 默认标题
})

// 添加处理计时器点击的方法
const handleFloatingTimer = () => {
  countdownVisible.value = true
}

// 添加计时完成的处理方法
const handleTimerComplete = () => {
  ElMessage.success('专注时间结束！')
}

</script>

<template>
    <el-container class="layout-container">
        <!-- 左侧菜单 -->
        <el-aside width="200px">
            <div class="el-aside__logo"></div>
            <el-menu active-text-color="#ffd04b" background-color="#698072"  text-color="#fff"
                router>
                <el-menu-item index="/task/UncompletedList">
                    <el-icon>
                        <Management />
                    </el-icon>
                    <span>未完成</span>
                    </el-menu-item>
                <el-sub-menu >
                    <template #title>
                        <el-icon>
                            <Folder />
                        </el-icon>
                        <span>任务分类</span>
                    </template>
                    <!-- 动态渲染所有分类（包括默认分类） -->
                    <el-menu-item 
                      v-for="category in categories" 
                      :key="category.id"
                      @click="handleCategoryClick(category)"
                    >
                        <el-icon>
                            <component :is="category.icon" />
                        </el-icon>
                        <span>{{ category.name }}</span>
                    </el-menu-item>

                    <!-- 添加分类和管理分类按钮放在最后 -->
                    <el-menu-item>
                        <el-icon><Plus /></el-icon>
                        <span type="primary" @click="categoryDialogVisible = true">添加分类</span>
                    </el-menu-item>
                    <el-menu-item index="/category/CategoryList">
                        <el-icon><Setting /></el-icon>
                        <span>分类管理</span>
                    </el-menu-item>
                </el-sub-menu>
                <el-menu-item index="/task/CompletedList">
                    <el-icon>
                        <Promotion />
                    </el-icon>
                    <span>已完成</span>
                </el-menu-item>
                <el-menu-item index="/task/OverdueList">
                    <el-icon>
                        <Promotion />
                    </el-icon>
                    <span>已逾期</span>
                </el-menu-item>
                <el-menu-item index="/task/TrashTasks">
                    <el-icon>
                        <Delete />
                    </el-icon>
                    <span>回收站</span>
                </el-menu-item>
            
            </el-menu>
        </el-aside>
        <!-- 右侧主区域 -->
         <el-container>
            <!-- 头部区域 -->
            <el-header>
                <div class="header-left">
                    <el-button type="primary" @click="visibleDrawer = true">
                        <el-icon><Plus /></el-icon>添加任务
                    </el-button>
                </div>
                <el-dropdown placement="bottom-end" @command="handleCommand">
                    <span class="el-dropdown__box">
                        <el-avatar :src="userInfoStore.userInfo?.avatarUrl || avatar" />
                        <el-icon>
                            <CaretBottom />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="userInfo" :icon="User">基本资料</el-dropdown-item>
                            <el-dropdown-item command="updateProfile" :icon="EditPen">修改信息</el-dropdown-item>
                            <el-dropdown-item command="avatar" :icon="Crop">更换头像</el-dropdown-item>
                            <el-dropdown-item command="changePassword" :icon="EditPen">修改密码</el-dropdown-item>
                            <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
                            <el-dropdown-item command="deactivate" :icon="Delete">注销账号</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-header>
            <!-- 中间区域 -->
            <el-main>
                <!-- <div style="width: 1290px; height: 570px;border: 1px solid red;">
                    内容展示区
                </div> -->
                <router-view></router-view>
            </el-main>
            <!-- 底部区域 -->
            <el-footer>planning-and-focus-assistant</el-footer>

            <!-- 添加分类弹窗 -->
            <el-dialog v-model="categoryDialogVisible" title="添加分类" width="40%">
                <el-form :model="categoryModel" :rules="rules" label-width="100px" style="padding-right: 30px">
                    <el-form-item label="分类名称" prop="name">
                        <el-input v-model="categoryModel.name" minlength="1" maxlength="10"></el-input>
                    </el-form-item>
                    <el-form-item label="分类颜色" prop="color">
                        <el-color-picker
                            v-model="categoryModel.color"
                            :show-alpha="false"
                            format="hex"
                            :predefine="[
                                '#ff4500',
                                '#ff8c00',
                                '#ffd700',
                                '#90ee90',
                                '#00ced1',
                                '#1e90ff',
                                '#c71585',
                                '#ff69b4'
                            ]"
                        />
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="categoryDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="createCategory">确认</el-button>
                    </span>
                </template>
            </el-dialog>
            

            <!-- 添加任务抽屉 -->
            <el-drawer v-model="visibleDrawer" title="添加任务" direction="rtl" size="50%">
                <!-- 添加任务表单 -->
                <el-form :model="taskModel" label-width="100px" >
                    <el-form-item label="任务标题" >
                        <el-input v-model="taskModel.title" placeholder="请输入标题"></el-input>
                    </el-form-item>
                    <el-form-item label="任务分类">
                        <el-select placeholder="请选择" v-model="taskModel.categoryId">
                            <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="任务优先级">
                        <el-select placeholder="请选择" v-model="taskModel.quadrant">  
                            <el-option label="重要紧急" value="URGENT_IMPORTANT"></el-option>
                            <el-option label="重要不紧急" value="IMPORTANT_NOT_URGENT"></el-option>
                            <el-option label="不重要紧急" value="URGENT_NOT_IMPORTANT"></el-option>
                            <el-option label="不重要不紧急" value="NOT_URGENT_NOT_IMPORTANT"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="任务截止日期"> 
                        <el-date-picker 
                            v-model="taskModel.dueDate" 
                            type="datetime" 
                            placeholder="请选择任务截止日期"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            format="YYYY-MM-DD HH:mm:ss"
                        ></el-date-picker>
                    </el-form-item>
                    <el-form-item label="任务描述">
                        <div class="taskModel.description">
                            <quill-editor
                                        theme="snow"
                                        v-model:content="taskModel.description"
                                        contentType="text"
                                        >
                            </quill-editor>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="createTask">添加</el-button>
                    </el-form-item>
                </el-form>
            </el-drawer>


            <!-- 编辑任务抽屉 -->
            <el-drawer v-model="editDrawerVisible" title="编辑任务" direction="rtl" size="50%">
                <el-form :model="editTaskModel" label-width="100px">
                    <el-form-item label="任务标题">
                        <el-input v-model="editTaskModel.title" placeholder="请输入标题"></el-input>
                    </el-form-item>
                    <el-form-item label="任务分类">
                        <el-select placeholder="请选择" v-model="editTaskModel.categoryId">
                            <el-option 
                                v-for="category in categories" 
                                :key="category.id" 
                                :label="category.name" 
                                :value="category.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="任务优先级">
                        <el-select placeholder="请选择" v-model="editTaskModel.quadrant">
                            <el-option label="重要紧急" value="URGENT_IMPORTANT"></el-option>
                            <el-option label="重要不紧急" value="IMPORTANT_NOT_URGENT"></el-option>
                            <el-option label="不重要紧急" value="URGENT_NOT_IMPORTANT"></el-option>
                            <el-option label="不重要不紧急" value="NOT_URGENT_NOT_IMPORTANT"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="任务截止日期">
                        <el-date-picker 
                            v-model="editTaskModel.dueDate" 
                            type="datetime" 
                            placeholder="请选择任务截止日期"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            format="YYYY-MM-DD HH:mm:ss"
                        ></el-date-picker>
                    </el-form-item>
                    <el-form-item label="任务描述">
                        <div class="editTaskModel.description">
                            <quill-editor
                                theme="snow"
                                v-model:content="editTaskModel.description"
                                contentType="text"
                            ></quill-editor>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="updateTask">更新</el-button>
                    </el-form-item>
                </el-form>
            </el-drawer>

            

        </el-container>
    </el-container>

    <div class="floating-timer">
        <el-button
            type="primary"
            :icon="Timer"
            circle
            @click="handleFloatingTimer"
            title="开始专注"
        />
    </div>

    <CountdownTimer
        v-model:visible="countdownVisible"
        :task-title="currentTask.title"
        @timer-complete="handleTimerComplete"
    />
</template>

<style lang="scss" scoped>
.layout-container {
    height: 100vh;

    .el-aside {
        background-color: #4f7d7d;

        &__logo {
            height: 60px;
            background: url('@/assets/logo.png') no-repeat center / 190px auto;
        }

        .el-menu {
            border-right: none;
        }
    }

    .el-header {
        background-color: #4f7d7d;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .el-dropdown__box {
            display: flex;
            align-items: center;

            .el-icon {
                color: #999;
                margin-left: 10px;
            }

            &:active,
            &:focus {
                outline: none;
            } 
        }
    }

    .el-footer {
        background-color: #4f7d7d;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #202020;
    }
}


/* 抽屉样式 */
.avatar-uploader {
    :deep() {
        .avatar {
            width: 178px;
            height: 178px;
            display: block;
        }

        .el-upload {
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);
        }

        .el-upload:hover {
            border-color: var(--el-color-primary);
        }

        .el-icon.avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 178px;
            height: 178px;
            text-align: center;
        }
    }
}
.editor {
  width: 100%;
  :deep(.ql-editor) {
    min-height: 200px;
  }
}

.floating-timer {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 999;

  .el-button {
    background-color: #ff6b6b;
    width: 60px;
    height: 60px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

</style>