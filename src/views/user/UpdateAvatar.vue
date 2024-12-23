<script setup>
import { Plus, Upload } from '@element-plus/icons-vue'
import {ref} from 'vue'
import avatar from '@/assets/default.png'
import { updateAvatarService } from '@/api/user.js'
import { ElMessage } from 'element-plus'
const uploadRef = ref()

import useTokenStore from '@/stores/token';
const tokenStore = useTokenStore();

import { useUserInfoStore } from '@/stores/userInfo';
const userInfoStore = useUserInfoStore()

//用户头像地址
const imgUrl= ref(userInfoStore.userInfo.avatarUrl || avatar)

//上传成功回调函数
const uploadSuccess = (result) =>{  
    imgUrl.value = result.data
    userInfoStore.setUserInfo({
        ...userInfoStore.userInfo,
        avatarUrl: result.data
    })
}

//修改头像
const uploadAvatar = async () =>{
    const res = await updateAvatarService(imgUrl.value)
    if(res.code === 200){
        ElMessage.success(res.message ? res.message : '头像更新成功')
    }
    //修改pinia中的数据
    userInfoStore.userInfo.avatarUrl = imgUrl.value
}


</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>更换头像</span>
            </div>
        </template>
        <el-row>
            <el-col :span="12">
                <el-upload 
                    ref="uploadRef"
                    class="avatar-uploader" 
                    :show-file-list="false"
                    :auto-upload="true"
                    action="/api/file/uploadFile"
                    name="file"
                    :headers="{'Authorization':tokenStore.token}"
                    :on-success="uploadSuccess"
                    >
                    <img v-if="imgUrl" :src="imgUrl" class="avatar" />
                    <img v-else :src="avatar" width="278" />
                </el-upload>
                <br />
                <el-button type="primary" :icon="Plus" size="large"  @click="uploadRef.$el.querySelector('input').click()">
                    选择图片
                </el-button>
                <el-button type="success" :icon="Upload" size="large" @click="uploadAvatar">
                    上传头像
                </el-button>
            </el-col>
        </el-row>
    </el-card>
</template>

<style lang="scss" scoped>
.avatar-uploader {
    :deep() {
        .avatar {
            width: 278px;
            height: 278px;
            display: block;
        }

        .el-upload {
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);
        }

        .el-upload:hover {
            border-color: var(--el-color-primary);
        }

        .el-icon.avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 278px;
            height: 278px;
            text-align: center;
        }
    }
}
</style>