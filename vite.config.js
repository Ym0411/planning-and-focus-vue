import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',    // 后端服务器地址
        changeOrigin: true,           // 允许跨域
        secure: false,            // 添加这行来禁用证书验证
        // rewrite: (path) => path.replace(/^\/api/, '') // 如果后端接口没有 /api 前缀，可以去掉它
      }
    }
  }
})
