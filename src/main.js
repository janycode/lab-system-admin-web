import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import router from './router'  //导入路由
import { createPinia } from 'pinia' //导入 pinia 公共状态管理
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus' //导入 element-plus 样式
import 'element-plus/dist/index.css'   //导入 element-plus 样式
import Particles from "@tsparticles/vue3";
import { loadFull } from "tsparticles";
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import './util/axios.config' //导入 axios 配置（拦截器）

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App)
    .use(router)  // 使用路由
    .use(pinia)   //使用 pinia 公共状态管理
    .use(ElementPlus, {
        locale: zhCn,
    }) //使用 element-plus，并添加国际化
    .use(Particles, {
        init: async engine => {
            await loadFull(engine);
            // await loadSlim(engine);
        },
    })
    .mount('#app')

// 开发/测试环境打印日志（放 main.js 末尾验证 OK）
if (import.meta.env.VITE_OPEN_DEBUG) {
    console.log('当前环境：', import.meta.env.VITE_ENV_NAME)
    console.log('BASE_URL：', import.meta.env.VITE_API_BASE_URL)
}