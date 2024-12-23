<script setup>
import { getOverdueListService, rescheduleTaskService, moveToTrashService } from '@/api/task.js'
import { ref, onMounted, onUnmounted } from 'vue'
import { Calendar, Delete } from '@element-plus/icons-vue'
import emitter from '@/utils/eventBus'
import { ElMessage, ElMessageBox } from 'element-plus'

const overdueTaskList = ref([])
const rescheduleDrawerVisible = ref(false)
const currentTask = ref(null)
const categories = ref([])

// 重新规划表单数据
const rescheduleForm = ref({
    id: '',
    title: '',
    description: '',
    categoryId: undefined,
    quadrant: '',
    dueDate: '',
    category: null
})

const fetchOverdueList = async () => {
    try {
        const res = await getOverdueListService()
        if (res.data) {
            overdueTaskList.value = res.data
        }
    } catch (error) {
        console.error('获取逾期任务列表失败:', error)
    }
}

// 打开重新规划抽屉
const handleReschedule = (row) => {
    rescheduleForm.value = {
        ...row,
        categoryId: row.category?.id
    }
    rescheduleDrawerVisible.value = true
}

// 提交重新规划
const submitReschedule = async () => {
    try {
        if (!rescheduleForm.value.dueDate) {
            ElMessage.warning('请选择新的截止时间')
            return
        }

        await rescheduleTaskService(rescheduleForm.value.id, {
            newDueDate: rescheduleForm.value.dueDate
        })

        ElMessage.success('重新规划成功')
        rescheduleDrawerVisible.value = false
        await fetchOverdueList()
        emitter.emit('updateTaskList')
    } catch (error) {
        console.error('重新规划失败:', error)
        ElMessage.error('重新规划失败')
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
        await fetchOverdueList()
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
    fetchOverdueList()
}

onMounted(() => {
    fetchOverdueList()
    emitter.on('updateTaskList', handleTaskUpdate)
})

onUnmounted(() => {
    emitter.off('updateTaskList', handleTaskUpdate)
})

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


</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>已逾期任务</span>
            </div>
        </template>
        <el-table :data="overdueTaskList" style="width: 100%">
            <!-- <el-table-column label="序号" prop="id" width="80" align="center"></el-table-column> -->
            <el-table-column label="标题" prop="title" width="200" align="center"></el-table-column>
            <el-table-column label="描述" prop="description" width="500" show-overflow-tooltip align="center"></el-table-column>
            <el-table-column label="分类" width="120" align="center">
                <template #default="{ row }">
                    <el-tag :color="row.category.color" effect="plain">
                        {{ row.category.name }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="截止日期" prop="dueDate" width="200" align="center">
                <template #default="{ row }">
                    <el-tag type="danger">{{ row.dueDate }}</el-tag>
                </template>
            </el-table-column>
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
                        :icon="Calendar" 
                        circle 
                        plain 
                        type="warning" 
                        title="重新规划"
                        @click.stop="handleReschedule(row)"
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
                <el-empty description="暂无逾期任务" />
            </template>
        </el-table>

        <!-- 重新规划抽屉 -->
        <el-drawer
            v-model="rescheduleDrawerVisible"
            title="重新规划任务"
            direction="rtl"
            size="45%"
        >
            <el-form :model="rescheduleForm" label-width="100px">
                <el-form-item label="任务标题">
                    <el-input 
                        v-model="rescheduleForm.title" 
                        disabled 
                        :readonly="true"
                        class="fixed-input"
                    ></el-input>
                </el-form-item>

                <el-form-item label="任务分类">
                    <el-tag :color="rescheduleForm.category?.color" effect="plain">
                        {{ rescheduleForm.category?.name }}
                    </el-tag>
                </el-form-item>

                <el-form-item label="任务优先级">
                    <el-tag :type="getQuadrantType(rescheduleForm.quadrant)">
                        {{ getQuadrantLabel(rescheduleForm.quadrant) }}
                    </el-tag>
                </el-form-item>

                <el-form-item label="原截止时间">
                    <el-tag type="danger">{{ rescheduleForm.dueDate }}</el-tag>
                </el-form-item>

                <el-form-item label="新截止时间" required>
                    <el-date-picker
                        v-model="rescheduleForm.dueDate"
                        type="datetime"
                        placeholder="选择新的截止时间"
                        format="YYYY-MM-DD HH:mm"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :min-date="new Date()"
                        class="fixed-input"
                    />
                </el-form-item>

                <el-form-item label="任务描述">
                    <div class="description-container">
                        <div class="readonly-content" v-html="rescheduleForm.description"></div>
                    </div>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="submitReschedule">确认重新规划</el-button>
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

// 固定输入框宽度
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
    justify-content: flex-start; // 让表单项内容左对齐
}
</style>