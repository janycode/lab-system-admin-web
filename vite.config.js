import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 解决跨域问题
  server: {
    proxy: {
      "/admin": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  }

})
