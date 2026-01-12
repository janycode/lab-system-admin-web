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
            <el-dropdown-item v-if="user.username === 'admin'" @click="handleUpload">更新平面图</el-dropdown-item>
            <el-dropdown-item @click="handleExit">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>

  <el-dialog v-model="dialogVisible" title="更新平面图" width="50%">
    <!-- Upload 上传器：带拖拽的上传组件； multiple 属性支持传多张； 接口 /admin/upload 有反向代理所以可以直接写相对路径 -->
    <!-- :data 字段，可以在上传时附带额外的参数，如 token 等 -->
    <el-upload class="upload-demo" drag action="/admin/upload" :data="data" :on-success="handleUploadSuccess">
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处或 <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          <span style="color:red;">*</span> 文件格式要求：jpg/png； 文件大小限制：500kb
        </div>
      </template>
    </el-upload>
  </el-dialog>
</template>

<script setup>
import { useRouter } from "vue-router"
import { useUserStore } from "../../store/useUserStore"
import { useRouterStore } from "../../store/useRouterStore"
import { ref } from "vue"
import { UploadFilled } from '@element-plus/icons-vue'

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

// 更新上传平面图
const dialogVisible = ref(false)
const handleUpload = () => {
  dialogVisible.value = true
}

// 上传时携带的 data 数据，里面放的是 token
const data = {
  "token": localStorage.getItem("token")
}
// 图片上传成功事件
const handleUploadSuccess = () => {
  dialogVisible.value = false
  //让页面 reload 一遍
  window.location.reload()
}
</script>

<style lang="scss" scoped>
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: blue;
  color: white;
}
</style>