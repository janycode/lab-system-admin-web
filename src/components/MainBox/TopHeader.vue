<template>
  <el-header>
    <div>实验室管理系统</div>
    <div>
      <span style="line-height:40px">欢迎 {{ user.username }} 回来</span>
      <el-dropdown>
        <!-- 头像 -->
        <el-avatar :size="40" :src="circleUrl" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>{{ user.role.roleName }}</el-dropdown-item>
            <el-dropdown-item @click="handleExit">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup>
import { useRouter } from "vue-router"
import { useUserStore } from "../../store/useUserStore"
import { useRouterStore } from "../../store/useRouterStore"

const router = useRouter()
const { user, changeUser } = useUserStore()
const { changeRouter } = useRouterStore()

const handleExit = () => {
  changeUser({}) //清空
  changeRouter(false) //重置路由权限的获取状态
  router.push("/login") //跳转到登陆
}

// ① 头像位置: public/avatar.png
// const circleUrl = "/avatar.png"
// ② webpack: src/assets/  使用 require("../../assets/avatar.png") 引入
// const circleUrl = "/avatar.png"
// Vite项目 asstes/avatar.png  使用 new URL(path, import.meta.url).href 引入
const circleUrl = new URL('../../assets/avatar.png', import.meta.url).href

</script>

<style lang="scss" scoped>
.el-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: blue;
  color: white;
}
</style>