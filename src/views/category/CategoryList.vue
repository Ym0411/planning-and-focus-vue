<script setup>
import { getCategoryListService, deleteCategoryService, moveUpCategoryService, moveDownCategoryService} from '@/api/category.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import emitter from '@/utils/eventBus'
import { ref, onMounted, onUnmounted } from 'vue'

const categoryList = ref([])

// 获取分类列表
const fetchCategoryList = async () => {
    try {
        const res = await getCategoryListService()
        console.log('API返回的原始数据:', res)  // 检查API返回的数据
        if (res.data && Array.isArray(res.data)) {
            categoryList.value = res.data
        } else {
            console.error('API返回的数据格式不正确:', res)
            ElMessage.error('数据格式错误')
        }
    } catch (error) {
        console.error('获取分类列表失败:', error)
        ElMessage.error('获取分类列表失败')
    }
}

// 监听分类列表更新事件
emitter.on('updateCategoryList', () => {
    fetchCategoryList()
})

// 组件卸载时移除事件监听
onUnmounted(() => {
    emitter.off('updateCategoryList')
})

// 删除分类
const handleDelete = async (row) => {
    try {
        // 打印完整的行数据用于调试
        console.log('要删除的完整行数据:', row)
        
        // 严格的类型检查
        const categoryId = parseInt(row.id)
        if (isNaN(categoryId)) {
            ElMessage.error('无效的分类ID')
            return
        }

        await ElMessageBox.confirm(
            `确认删除分类"${row.name}"吗？`,
            '删除确认',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
        
        // 使用数字类型的 ID
        await deleteCategoryService(categoryId)
        ElMessage.success('删除成功')
        await fetchCategoryList()
        // 触发刷新侧边栏事件
        emitter.emit('updateCategoryList')
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除失败:', error)
            ElMessage.error('删除失败')
        }
    }
}

// 上移分类
const moveUp = async (row) => {
    try {
        await  moveUpCategoryService({
            id: row.id,
            direction: 'UP'
        })
        ElMessage.success('上移成功')
        await fetchCategoryList()
        // 触发刷新侧边栏事件
        emitter.emit('updateCategoryList')
    } catch (error) {
        console.error('上移失败:', error)
        ElMessage.error('上移失败')
    }
}

// 下移分类
const moveDown = async (row) => {
    try {
        await moveDownCategoryService({
            id: row.id,
            direction: 'DOWN'
        })
        ElMessage.success('下移成功')
        await fetchCategoryList()
        // 触发刷新侧边栏事件
        emitter.emit('updateCategoryList')
    } catch (error) {
        console.error('下移失败:', error)
        ElMessage.error('下移失败')
    }
}

// 确保在组件挂载时获取数据
onMounted(() => {
    fetchCategoryList()
})
</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>分类列表</span>
                <!-- <div class="extra">
                    <el-button type="primary">添加任务</el-button>
                </div> -->
            </div>
        </template>
        <el-table :data="categoryList" style="width: 100%" @row-click="row => console.log('点击行数据:', row)">
            <el-table-column label="序号" prop="id" width="80"></el-table-column>
            <el-table-column label="分类名称" prop="name"></el-table-column>
            <el-table-column label="颜色" width="100">
                <template #default="{ row }">
                    <div class="color-block" :style="{ backgroundColor: row.color }"></div>
                </template>
            </el-table-column>
            <el-table-column label="排序" prop="sortOrder" width="80"></el-table-column>
            <el-table-column label="创建时间" prop="createdAt"></el-table-column>
            <el-table-column label="操作" width="220">
                <template #default="{ row, $index }">
                    <el-button 
                        :icon="ArrowUp" 
                        circle 
                        plain 
                        type="primary" 
                        title="上移"
                        @click="moveUp(row)"
                        :disabled="$index === 0"
                    ></el-button>
                    <el-button 
                        :icon="ArrowDown" 
                        circle 
                        plain 
                        type="primary" 
                        title="下移"
                        @click="moveDown(row)"
                        :disabled="$index === categoryList.length - 1"
                    ></el-button>
                    <el-button 
                        :icon="Delete" 
                        circle 
                        plain 
                        type="danger" 
                        title="删除"
                        @click="handleDelete(row)"
                        :disabled="!row?.id || isNaN(parseInt(row.id))"
                    ></el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="暂无未完成任务" />
            </template>
        </el-table>
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

.color-block {
    width: 20px;
    height: 20px;
    border-radius: 4px;
}
</style>