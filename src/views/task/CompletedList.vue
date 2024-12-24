<script setup>
import { getCompletedListService, getTaskDetailService, moveToTrashService } from '@/api/task.js'
import { ref, onMounted, onUnmounted } from 'vue'
import { View, Delete } from '@element-plus/icons-vue'
import emitter from '@/utils/eventBus'
import { ElMessage, ElMessageBox } from 'element-plus'

const completedTaskList = ref([])
const detailDrawerVisible = ref(false)
const currentTask = ref({
    title: '',
    description: '',
    categoryId: undefined,
    category: null,
    quadrant: '',
    dueDate: '',
    completedAt: ''
})

const fetchCompletedList = async () => {
    try {
        const res = await getCompletedListService()
        if (res.data) {
            completedTaskList.value = res.data
        }
    } catch (error) {
        console.error('获取已完成任务列表失败:', error)
    }
}

// 查看任务详情
const handleView = async (row) => {
    try {
        const res = await getTaskDetailService(row.id)
        if (res.data) {
            currentTask.value = res.data
            detailDrawerVisible.value = true
        }
    } catch (error) {
        console.error('获取任务详情失败:', error)
        ElMessage.error('获取任务详情失败')
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
        await fetchCompletedList()
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
    fetchCompletedList()
}

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

onMounted(() => {
    fetchCompletedList()
    emitter.on('updateTaskList', handleTaskUpdate)
})

onUnmounted(() => {
    emitter.off('updateTaskList', handleTaskUpdate)
})
</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>已完成任务</span>
            </div>
        </template>
        <el-table :data="completedTaskList" style="width: 100%">
            <!-- <el-table-column label="序号" prop="id" width="80" align="center"></el-table-column> -->
            <el-table-column label="标题" prop="title" width="200" align="center"></el-table-column>
            <el-table-column label="描述" prop="description" width="600" show-overflow-tooltip align="center"></el-table-column>
            <el-table-column label="分类" width="160" align="center">
                <template #default="{ row }">
                    <el-tag :color="row.category?.color" effect="plain">
                        {{ row.category?.name }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="完成时间" prop="completedAt" width="200" align="center"></el-table-column>
            <el-table-column label="操作" width="240" align="center">
                <template #default="{ row }">
                    <el-button 
                        :icon="View" 
                        circle 
                        plain 
                        type="primary" 
                        title="查看"
                        @click.stop="handleView(row)"
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
                <el-empty description="暂无已完成任务" />
            </template>
        </el-table>

        <!-- 任务详情抽屉 -->
        <el-drawer
            v-model="detailDrawerVisible"
            title="任务详情"
            direction="rtl"
            size="45%"
        >
            <el-form :model="currentTask" label-width="100px">
                <el-form-item label="任务标题">
                    <el-input 
                        v-model="currentTask.title" 
                        disabled 
                        :readonly="true"
                        class="fixed-input"
                    ></el-input>
                </el-form-item>

                <el-form-item label="任务分类">
                    <el-tag :color="currentTask.category?.color" effect="plain">
                        {{ currentTask.category?.name }}
                    </el-tag>
                </el-form-item>

                <el-form-item label="任务优先级">
                    <el-tag :type="getQuadrantType(currentTask.quadrant)">
                        {{ getQuadrantLabel(currentTask.quadrant) }}
                    </el-tag>
                </el-form-item>

                <el-form-item label="截止时间">
                    <el-tag type="info">{{ currentTask.dueDate }}</el-tag>
                </el-form-item>

                <el-form-item label="完成时间">
                    <el-tag type="success">{{ currentTask.completedAt }}</el-tag>
                </el-form-item>

                <el-form-item label="任务描述">
                    <div class="description-container">
                        <div class="readonly-content" v-html="currentTask.description"></div>
                    </div>
                </el-form-item>
            </el-form>
        </el-drawer>
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

.fixed-input {
    width: 300px !important;
}

.description-container {
    width: 300px;
    height: 150px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 12px;
    overflow-y: auto;
    background-color: #f5f7fa;

    .readonly-content {
        color: #606266;
        line-height: 1.5;
        
        :deep(p) {
            margin: 0;
            padding: 0;
        }
        
        :deep(img) {
            max-width: 100%;
            height: auto;
        }
    }
}

:deep(.el-form-item__content) {
    justify-content: flex-start;
}
</style>