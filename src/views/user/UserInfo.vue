<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserInfoService } from '@/api/user'
import { useUserInfoStore } from '@/stores/userInfo'

const userInfoStore = useUserInfoStore()
const userInfo = ref({})

const loadUserInfo = async () => {
  try {
    const res = await getUserInfoService()
    if (res.code === 200) {
      userInfo.value = res.data
    } else {
      ElMessage.error(res.msg || '获取用户信息失败')
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<template>
    <el-card class="user-info-card">
        <template #header>
            <div class="card-header">
                <span>个人信息</span>
            </div>
        </template>
        
        <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">
                {{ userInfo?.username || '-' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="昵称">
                {{ userInfo?.nickname || '-' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="邮箱">
                {{ userInfo?.email || '-' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="手机号">
                {{ userInfo?.phone || '-' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="通知方式">
                <el-tag :type="userInfo?.notificationType === 'EMAIL' ? 'success' : 'warning'">
                    {{ userInfo?.notificationType === 'EMAIL' ? '邮件通知' : '短信通知' }}
                </el-tag>
            </el-descriptions-item>
        </el-descriptions>
    </el-card>
</template>

<style lang="scss" scoped>
.user-info-card {
    max-width: 800px;
    margin: 20px auto;
    
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}
</style>