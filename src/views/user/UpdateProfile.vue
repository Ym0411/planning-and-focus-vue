<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { updateUserInfoService } from '@/api/user'
import { useUserInfoStore } from '@/stores/userInfo'
import emitter from '@/utils/eventBus'

const userInfoStore = useUserInfoStore()
const userInfo = ref({
    id: 23,
    username: "test123",
    nickname: "测试用户2更新",
    email: "test2_newnew@example.com",
    phone: "13800138003",
    notificationType: "SMS"
    // id: userInfoStore.userInfo.id,
    // username: userInfoStore.userInfo.username,
    // nickname: userInfoStore.userInfo.nickname,
    // email: userInfoStore.userInfo.email,
    // phone: userInfoStore.userInfo.phone,
    // notificationType: userInfoStore.userInfo.notificationType
})

const submitForm = async () => {
    try {
        const res = await updateUserInfoService(userInfo.value);
        userInfoStore.setUserInfo(res.data)
        ElMessage.success('个人信息更新成功')
        emitter.emit('updateUserInfo')
    } catch (error) {
        console.error('更新失败:', error)
        ElMessage.error('个人信息更新失败')
    }
}

const initUserInfo = () => {
    userInfo.value = {
        id: userInfoStore.userInfo.id,
        username: userInfoStore.userInfo.username,
        nickname: userInfoStore.userInfo.nickname,
        email: userInfoStore.userInfo.email,
        phone: userInfoStore.userInfo.phone,
        notificationType: userInfoStore.userInfo.notificationType
    }
}

initUserInfo()

</script>

<template>
    <el-card class="user-info-card">
        <template #header>
            <div class="card-header">
                <span>个人信息</span>
            </div>
        </template>
        
        <el-form :model="userInfo" label-width="120px">
            <el-form-item label="用户名">
                <el-input v-model="userInfo.username" disabled></el-input>
            </el-form-item>
            
            <el-form-item label="昵称">
                <el-input v-model="userInfo.nickname" maxlength="20" show-word-limit></el-input>
            </el-form-item>
            
            <el-form-item label="邮箱">
                <el-input v-model="userInfo.email" type="email"></el-input>
            </el-form-item>
            
            <el-form-item label="手机号">
                <el-input v-model="userInfo.phone"></el-input>
            </el-form-item>
            
            <el-form-item label="通知方式">
                <el-radio-group v-model="userInfo.notificationType">
                    <el-radio label="EMAIL">邮件通知</el-radio>
                    <el-radio label="SMS">短信通知</el-radio>
                </el-radio-group>
            </el-form-item>
            
            <el-form-item>
                <el-button type="primary" @click="submitForm">保存修改</el-button>
            </el-form-item>
        </el-form>
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
    
    :deep(.el-input) {
        width: 300px;
    }
    
    .el-button {
        margin-left: 120px;
    }
}
</style>