//导入request.js请求工具
import request from '@/utils/request'

// 注册接口
export const userRegisterService = async (registerData) => {
  const res = await request.post('/api/users/register', registerData)
  return res
}

// 登录接口 
export const userLoginService = async (loginData) => {
  const res = await request.post('/api/users/login', loginData)
  return res
}

// 获取用户信息
export const getUserInfoService = async () => {
  return await request.get('/api/users/userInfo')
}

// 修改用户信息
export const updateUserInfoService = async (updateProfileData) => {
  return await request.put('/api/users/updateProfile', updateProfileData)
}

// 修改头像
export const updateAvatarService = async (avatarUrl) => {
    const params = new URLSearchParams();
    params.append('avatarUrl', avatarUrl)
    return await request.patch('/api/users/updateAvatar', params)
}   

// 修改密码
export const updatePasswordService = async (changePasswordData) => {
    return await request.put('/api/users/changePassword', changePasswordData)
  }

// 退出登录
export const logoutService = async () => {
  return await request.post('/api/users/logout')
}

// 注销账号
export const deleteAccountService = async () => {
  return await request.delete('/api/users/deactivate')
}

