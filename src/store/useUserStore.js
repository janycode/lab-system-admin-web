import {defineStore} from 'pinia'
import { ref } from 'vue'

// defineStore 第三个参与用于 pinia 持久化插件配置
export const useUserStore = defineStore("user", () => {
    const user = ref({}) //全局可用
    const changeUser = (value) => {
        user.value = value
    }
    return {
        user,
        changeUser
    }
}, {
    persist: true //持久化设置
})