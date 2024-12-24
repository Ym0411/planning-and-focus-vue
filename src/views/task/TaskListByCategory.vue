<script setup>
import { getUncompletedListByCategoryService, completeTaskService, moveToTrashService } from '@/api/task.js'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Edit, Delete, Check, Timer } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import emitter from '@/utils/eventBus'
import CountdownTimer from '@/components/CountdownTimer.vue'

const route = useRoute()
const taskList = ref([])
const countdownVisible = ref(false)
const currentTask = ref(null)

const fetchTaskList = async () => {
    try {
        const categoryId = route.query.categoryId
        if (!categoryId) {
            return
        }
        const res = await getUncompletedListByCategoryService(categoryId)
        if (res.data) {
            taskList.value = res.data
        }
    } catch (error) {
        console.error('获取任务列表失败:', error)
    }
}

// 处理编辑按钮点击
const handleEdit = (row) => {
    emitter.emit('editTask', row)
}

// 处理完成任务
const handleComplete = async (row) => {
    try {
        await ElMessageBox.confirm(
            `确认将任务"${row.title}"标记为已完成吗？`,
            '完成确认',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'success'
            }
        )

        await completeTaskService(row.id)
        ElMessage.success('任务已完成')
        await fetchTaskList()
        emitter.emit('updateTaskList') // 通知其他列表更新
    } catch (error) {
        if (error !== 'cancel') {
            console.error('完成任务失败:', error)
            ElMessage.error('完成任务失败')
        }
    }
}

// 处理删除任务（移入回收站）
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm(
            `确认将任务"${row.title}"移入回收站吗？`,
            '删除确认',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )

        await moveToTrashService(row.id)
        ElMessage.success('任务已移入回收站')
        await fetchTaskList()
        emitter.emit('updateTaskList')
    } catch (error) {
        if (error !== 'cancel') {
            console.error('移入回收站失败:', error)
            ElMessage.error('移入回收站失败')
        }
    }
}

// 使用函数引用方式监听事件
const handleTaskUpdate = () => {
    fetchTaskList()
}

// 监听路由参数变化
watch(
    () => route.query.categoryId,
    (newId) => {
        if (newId) {
            fetchTaskList()
        }
    }
)

// 组件挂载时获取任务列表
onMounted(() => {
    fetchTaskList()
    emitter.on('updateTaskList', handleTaskUpdate)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
    emitter.off('updateTaskList', handleTaskUpdate)
})

// 获取任务优先级类型
const getQuadrantType = (quadrant) => {
    switch (quadrant) {
        case 'URGENT_IMPORTANT':
            return 'danger'
        case 'IMPORTANT_NOT_URGENT':
            return 'warning'
        case 'URGENT_NOT_IMPORTANT':
            return 'info'
        case 'NOT_URGENT_NOT_IMPORTANT':
            return ''
        default:
            return 'warning'
    }
}

// 获取任务优先级标签
const getQuadrantLabel = (quadrant) => {
    switch (quadrant) {
        case 'URGENT_IMPORTANT':
            return '重要紧急'
        case 'IMPORTANT_NOT_URGENT':
            return '重要不紧急'
        case 'URGENT_NOT_IMPORTANT':
            return '不重要紧急'
        case 'NOT_URGENT_NOT_IMPORTANT':
            return '不重要不紧急'
        default:
            return '未知'
    }
}

// 添加处理计时器点击的方法
const handleTimer = (row) => {
    currentTask.value = row
    countdownVisible.value = true
}

// 添加计时完成的处理方法
const handleTimerComplete = () => {
    ElMessage.success(`任务"${currentTask.value?.title}"的计时已完成！`)
}
</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>{{ route.query.categoryName }} - 未完成任务</span>
            </div>
        </template>
        <el-table :data="taskList" style="width: 100%">
            <!-- <el-table-column label="序号" prop="id" width="80" align="center"></el-table-column> -->
            <el-table-column label="标题" prop="title" width="200" align="center"></el-table-column>
            <el-table-column label="描述" prop="description" width="500" show-overflow-tooltip align="center"></el-table-column>
            <el-table-column label="分类" prop="category.name" width="120" align="center"></el-table-column>
            <el-table-column label="截止日期" prop="dueDate" width="200" align="center"></el-table-column>
            <el-table-column label="优先级" width="120" align="center">
                <template #default="{ row }">
                    <el-tag :type="getQuadrantType(row.quadrant)">
                        {{ getQuadrantLabel(row.quadrant) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
                <template #default="{ row }">
                    <el-button 
                        :icon="Check"
                        circle 
                        plain 
                        type="success" 
                        title="完成"
                        @click.stop="handleComplete(row)"
                    ></el-button>
                    <el-button 
                        :icon="Timer"
                        circle 
                        plain 
                        type="warning" 
                        title="开始计时"
                        @click.stop="handleTimer(row)"
                    ></el-button>
                    <el-button 
                        :icon="Edit" 
                        circle 
                        plain 
                        type="primary" 
                        title="编辑"
                        @click.stop="handleEdit(row)"
                    ></el-button>
                    <el-button 
                        :icon="Delete" 
                        circle 
                        plain 
                        type="danger" 
                        title="删除"
                        @click.stop="handleDelete(row)"
                    ></el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="暂无未完成任务" />
            </template>
        </el-table>
        <CountdownTimer
            v-model:visible="countdownVisible"
            :task-title="currentTask?.title"
            @timer-complete="handleTimerComplete"
        />
    </el-card>
</template>

<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}
</style>