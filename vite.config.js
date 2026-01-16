import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载当前环境的.env文件，拿到环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],
    // 基础路径（生产环境可能需要配置，比如部署到子目录）
    base: env.VITE_BASE_URL || '/',
    // 解决跨域问题
    server: {
      proxy: {
        "/admin": {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true
        }
      }
    },
    // 打包配置（test/prod差异化）
    build: {
      // 输出目录
      outDir: mode === 'test' ? 'dist-test' : 'dist',
      // 代码压缩（生产环境更严格）
      minify: env.NODE_ENV === 'production' ? 'terser' : 'esbuild',
      terserOptions: {
        // 生产环境移除console
        compress: env.VITE_OPEN_DEBUG ? {} : { drop_console: true, drop_debugger: true }
      }
    }
  }
})
