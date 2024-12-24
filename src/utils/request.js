//导入axios  npm install axios
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useTokenStore } from '@/stores/token.js'


// 创建 axios 实例时不设置 baseURL
const instance = axios.create()

// 在这个地方这种导入路由的方式不可行，因为vue-router是vue2的插件，而vue3中使用的是vue-router4
// import {useRouter} from 'vue-router'
// // 创建 router 实例
// const router = useRouter()

// 导入路由实例
import router from '@/router';

//添加请求拦截器
instance.interceptors.request.use(
    config=>{
        //请求前，获取token
        const tokenStore = useTokenStore();
        //把token添加到请求头中
        if(tokenStore.token){
        config.headers['Authorization'] = tokenStore.token;
        }
        return config;
    },
    err=>{
        //请求失败
        return Promise.reject(err);
    }
)


//添加响应拦截器
instance.interceptors.response.use(
    result=>{
        if(result.data.code === 200){
            return result.data;
        }
        //操作失败
        ElMessage.error(result.data.message ? result.data.message : '服务异常');  
        return Promise.reject(result.data);//异步的状态转化成失败的状态

    },
    err=>{
        //判断响应状态码，若为401，则证明未登录，提示登录，并跳转到登录页面
        if(err.response.status === 401){
            ElMessage.error('未登录，请先登录');
            router.push('/login');
        }else{
            ElMessage.error('服务异常');
        }
        return Promise.reject(err);//异步的状态转化成失败的状态
    }   
)

export default instance;