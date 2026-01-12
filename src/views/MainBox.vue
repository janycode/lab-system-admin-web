<template>
  <div>
    <el-container style="height: 100vh">
      <!-- 侧边栏 Aside -->
      <SideMenu></SideMenu>
      <el-container direction="vertical">
        <!-- 顶部 Header -->
        <TopHeader></TopHeader>
        <el-main>
          <!-- 美观的默认滚动条 - 最好使用它包裹一下 -->
          <el-scrollbar>
            <router-view></router-view>
          </el-scrollbar>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import SideMenu from "../components/MainBox/SideMenu.vue"
import TopHeader from "../components/MainBox/TopHeader.vue"
</script>
