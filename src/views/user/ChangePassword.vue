<script setup>
import { ref } from 'vue'
import { updatePasswordService } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import useTokenStore from '@/stores/token';
const tokenStore = useTokenStore();

import { useUserInfoStore } from '@/stores/userInfo';
const userInfoStore = useUserInfoStore()

import { useRouter } from 'vue-router'
const router = useRouter()


// 表单数据
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单校验规则
const rules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 表单ref
const formRef = ref()

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    await updatePasswordService({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
      confirmPassword: passwordForm.value.confirmPassword
    })
    ElMessage.success('密码修改成功')
    // 清空表单
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    ElMessageBox.alert('密码修改成功，请重新登录', '提示', {
     confirmButtonText: '确定',
     
   }).then(() => {
            //退出登录
            //清空pinia中的token以及个人信息
            tokenStore.removeToken()
            userInfoStore.clearUserInfo()
            //跳转到登录页面
            router.push('/login')
            ElMessage({
                message: '密码修改成功，请重新登录',
                type: 'success'
            })
        })
    } catch (error) {
   ElMessage.error(error.message || '密码修改失败')
 }
}
</script>

<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12" :offset="6">
          <el-form
            ref="formRef"
            :model="passwordForm"
            :rules="rules"
            label-width="100px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                show-password
                placeholder="请输入原密码"
              />
            </el-form-item>
            
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped>
.app-container {
    max-width: 800px;
    margin: 20px auto;
}

.box-card {
  width: 100%;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>