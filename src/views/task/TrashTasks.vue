<script setup>
import { getTrashListService, getTaskDetailService, restoreFromTrashService, emptyTrashService, deleteFromTrashService } from '@/api/task.js'
import { ref, onMounted, onUnmounted } from 'vue'
import { RefreshLeft, Delete, View } from '@element-plus/icons-vue'
import emitter from '@/utils/eventBus'
import { ElMessage, ElMessageBox } from 'element-plus'

const trashTaskList = ref([])
const detailDrawerVisible = ref(false)
const currentTask = ref({
    title: '',
    description: '',
    categoryId: undefined,
    category: null,
    quadrant: '',
    dueDate: '',
    deletedAt: ''
})

const fetchTrashList = async () => {
    try {
        const res = await getTrashListService()
        if (res.data) {
            trashTaskList.value = res.data
        }
    } catch (error) {
        console.error('获取回收站任务列表失败:', error)
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

// 处理恢复任务
const handleRestore = async (row) => {
    try {
        await ElMessageBox.confirm(
            `确认恢复任务"${row.title}"吗？`,
            '恢复确认',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'info'
            }
        )

        await restoreFromTrashService(row.id)
        ElMessage.success('任务已恢复')
        await fetchTrashList()
        emitter.emit('updateTaskList') // 通知其他列表更新
    } catch (error) {
        if (error !== 'cancel') {
            console.error('恢复任务失败:', error)
            ElMessage.error('恢复任务失败')
        }
    }
}

// 清空回收站
const handleEmptyTrash = async () => {
    if (trashTaskList.value.length === 0) {
        ElMessage.warning('回收站已经是空的')
        return
    }

    try {
        await ElMessageBox.confirm(
            '确认清空回收站吗？此操作将永久删除所有在回收站中的任务，不可恢复！',
            '清空回收站',
            {
                confirmButtonText: '确认清空',
                cancelButtonText: '取消',
                type: 'error',
                confirmButtonClass: 'el-button--danger'
            }
        )

        await emptyTrashService()
        ElMessage.success('回收站已清空')
        await fetchTrashList()
        emitter.emit('updateTaskList')
    } catch (error) {
        if (error !== 'cancel') {
            console.error('清空回收站失败:', error)
            ElMessage.error('清空回收站失败')
        }
    }
}

// 处理永久删除单个任务
const handleDeletePermanently = async (row) => {
    try {
        await ElMessageBox.confirm(
            `确认永久删除任务"${row.title}"吗？此操作不可恢复！`,
            '永久删除确认',
            {
                confirmButtonText: '确认删除',
                cancelButtonText: '取消',
                type: 'error',
                confirmButtonClass: 'el-button--danger'
            }
        )

        await deleteFromTrashService(row.id)
        ElMessage.success('任务已永久删除')
        await fetchTrashList()
        emitter.emit('updateTaskList')
    } catch (error) {
        if (error !== 'cancel') {
            console.error('永久删除任务失败:', error)
            ElMessage.error('永久删除任务失败')
        }
    }
}

// 使用函数引用方式监听事件
const handleTaskUpdate = () => {
    fetchTrashList()
}

onMounted(() => {
    fetchTrashList()
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
                <span>回收站</span>
                <el-button 
                    type="danger" 
                    :icon="Delete" 
                    @click="handleEmptyTrash"
                    :disabled="trashTaskList.length === 0"
                >
                    清空回收站
                </el-button>
            </div>
        </template>
        <el-table :data="trashTaskList" style="width: 100%">
            <!-- <el-table-column label="序号" prop="id" width="80"></el-table-column> -->
            <el-table-column label="标题" prop="title" width="200" align="center"   ></el-table-column>
            <el-table-column label="描述" prop="description" width="600" show-overflow-tooltip align="center"></el-table-column>
            <el-table-column label="分类" width="160" align="center">
                <template #default="{ row }">
                    <el-tag :color="row.category?.color" effect="plain">
                        {{ row.category?.name }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="删除时间" prop="deletedAt" width="200" align="center"></el-table-column>
            <el-table-column label="操作" width="240" align="center">
                <template #default="{ row }">
                    <el-button 
                        :icon="View" 
                        circle 
                        plain 
                        type="info" 
                        title="查看"
                        @click.stop="handleView(row)"
                    ></el-button>
                    <el-button 
                        :icon="RefreshLeft" 
                        circle 
                        plain 
                        type="primary" 
                        title="恢复"
                        @click.stop="handleRestore(row)"
                    ></el-button>
                    <el-button 
                        :icon="Delete" 
                        circle 
                        plain 
                        type="danger" 
                        title="永久删除"
                        @click.stop="handleDeletePermanently(row)"
                    ></el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="回收站为空" />
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
                    <el-tag :type="currentTask.quadrant === 'IMPORTANT_URGENT' ? 'danger' : 'warning'">
                        {{ currentTask.quadrant === 'IMPORTANT_URGENT' ? '重要紧急' : '重要不紧急' }}
                    </el-tag>
                </el-form-item>

                <el-form-item label="截止时间">
                    <el-tag type="info">{{ currentTask.dueDate }}</el-tag>
                </el-form-item>

                <el-form-item label="删除时间">
                    <el-tag type="danger">{{ currentTask.deletedAt }}</el-tag>
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