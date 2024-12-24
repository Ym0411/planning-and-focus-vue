<script setup>
import { User, Lock, Message, Phone } from '@element-plus/icons-vue'
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { userRegisterService, userLoginService } from '@/api/user.js'

// 控制注册与登录表单的显示
const isRegister = ref(false)

// 注册表单数据
const registerData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  notificationType: 'EMAIL'
})

// 表单校验规则
const registerRules = { 
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 12, message: '长度在 4 到 12 个字符', trigger: 'blur' },
    { pattern: /^\w+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' },
    { pattern: /^\w+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerData.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  // 移除 email 和 phone 的必填验证
  email: [
    {
      validator: (rule, value, callback) => {
        if (!value || value.trim() === '') {
          callback() // 如果为空，直接通过验证
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            callback(new Error('请输入正确的邮箱格式'))
          } else {
            callback()
          }
        }
      },
      trigger: 'blur'
    }
  ],
  phone: [
    {
      validator: (rule, value, callback) => {
        if (!value || value.trim() === '') {
          callback() // 如果为空，直接通过验证
        } else {
          const phoneRegex = /^1[3-9]\d{9}$/
          if (!phoneRegex.test(value)) {
            callback(new Error('请输入正确的手机号格式'))
          } else {
            callback()
          }
        }
      },
      trigger: 'blur'
    }
  ]
}

// 注册表单引用
const registerFormRef = ref(null)

// 注册方法
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  // 表单校验
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 处理空值，转换为 null （后端要求）
        const submitData = {
          ...registerData,
          email: registerData.email.trim() || null,
          phone: registerData.phone.trim() || null
        }
        //调用接口，完成注册
        const res = await userRegisterService(submitData)
        ElMessage.success(res.message ? res.message : '注册成功')
        // 注册成功后切换到登录页
        isRegister.value = false
      } catch (error) {
        // 错误已经在响应拦截器中处理
        ElMessage.error('注册失败')
      }
    }
  })
}

// 登录表单数据
const loginData = reactive({
  username: '',
  password: ''
})

// 登录表单校验规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 12, message: '长度在 4 到 12 个字符', trigger: 'blur' },
    { pattern: /^\w+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' },
    { pattern: /^\w+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }
  ]
}

// 登录表单引用
const loginFormRef = ref(null)

// 登录方法
import { useTokenStore } from '@/stores/token.js'
const tokenStore = useTokenStore();

import { useRouter } from 'vue-router'
const router = useRouter()
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await userLoginService(loginData)
        ElMessage.success(res.message ? res.message : '登录成功')
        // 登录成功，把得到的token存储到pinia中
        tokenStore.setToken(res.data)
        // TODO: 跳转到首页，需要配置路由
        router.push('/')
      } catch (error) {
        // 错误已经在响应拦截器中处理
        ElMessage.error('登录失败')
      }
    }
  })
}
</script>

<template>
    <el-row class="login-page">
        <el-col :span="12" class="bg"></el-col>
        <el-col :span="6" :offset="3" class="form">
            <!-- 注册表单 -->
            <el-form 
              ref="registerFormRef"
              :model="registerData"
              :rules="registerRules"
              size="large" 
              autocomplete="off" 
              v-if="isRegister"
            >
                <el-form-item>
                    <h1>注册</h1>
                </el-form-item>
                <el-form-item prop="username">
                    <el-input 
                      v-model="registerData.username"
                      :prefix-icon="User" 
                      placeholder="请输入用户名">
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input 
                      v-model="registerData.password"
                      :prefix-icon="Lock" 
                      type="password" 
                      placeholder="请输入密码">
                    </el-input>
                </el-form-item>
                <el-form-item prop="confirmPassword">
                    <el-input 
                      v-model="registerData.confirmPassword"
                      :prefix-icon="Lock" 
                      type="password" 
                      placeholder="请确认密码">
                    </el-input>
                </el-form-item>
                <el-form-item prop="email">
                    <el-input 
                      v-model="registerData.email"
                      :prefix-icon="Message" 
                      placeholder="请输入邮箱(选填)">
                    </el-input>
                </el-form-item>
                <el-form-item prop="phone">
                    <el-input 
                      v-model="registerData.phone"
                      :prefix-icon="Phone" 
                      placeholder="请输入手机号(选填)">
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button 
                      class="button" 
                      type="primary" 
                      @click="handleRegister"
                      auto-insert-space
                    >
                        注册
                    </el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link 
                      type="info" 
                      :underline="false" 
                      @click="isRegister = false"
                    >
                        ← 返回
                    </el-link>
                </el-form-item>
            </el-form>
            <!-- 登录表单 -->
            <el-form 
              ref="loginFormRef"
              size="large" 
              autocomplete="off" 
              v-else 
              :model="loginData"
              :rules="loginRules"
            >
                <el-form-item>
                    <h1>登录</h1>
                </el-form-item>
                <el-form-item prop="username">
                    <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="loginData.username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码" v-model="loginData.password"></el-input>
                </el-form-item>
                <el-form-item class="flex">
                    <div class="flex">
                        <el-checkbox>记住我</el-checkbox>
                        <el-link type="primary" :underline="false">忘记密码？</el-link>
                    </div>
                </el-form-item>
                <!-- 登录按钮 -->
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="handleLogin">登录</el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" :underline="false" @click="isRegister = true">
                        注册 →
                    </el-link>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
    height: 100vh;
    background-color: #fff;

    .bg {
        background: url('@/assets/logo2.png') no-repeat 70% center / 400px auto,
            url('@/assets/login_bg.jpg') no-repeat center / cover;
        border-radius: 0 20px 20px 0;
    }
 
    .form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        user-select: none;

        .title {
            margin: 0 auto;
        }

        .button {
            width: 100%;
        }

        .flex {
            width: 100%;
            display: flex;
            justify-content: space-between;
        }
    }
}
</style>