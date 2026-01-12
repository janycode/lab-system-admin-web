<template>
  <el-aside width="200px">
    <el-scrollbar>
      <!-- height:100vh 必须添加，否则侧边栏滚动不是占满上下位置; :router="true" 基于index进行跳转 -->
      <el-menu :default-active="route.fullPath" class="el-menu-vertical-demo" style="height: 100vh" :router="true">
        <!-- for循环嵌套 -->
        <template v-for="data in datalist" :key="data.path">
          <!-- 有子级的继续遍历子级，同时判断是否拥有权限菜单 -->
          <el-sub-menu :index="data.path" v-if="data.children.length && checkAuth(data.path)">
            <template #title>
              <el-icon>
                <!-- icon图标：使用动态组件的 :is 属性动态绑定图标组件实例对象，不是字符串，因此需要 map 映射取值 -->
                <component :is="mapIcons[data.icon]"></component>
              </el-icon>
              <span>{{ data.title }}</span>
            </template>
            <!-- 子级也使用 template 包裹进行遍历，此时内部可以使用 v-if 来判断是否拥有权限菜单 -->
            <template v-for="item in data.children" :key="item.path">
              <el-menu-item :index="item.path" v-if="checkAuth(item.path)">
                <el-icon>
                  <component :is="mapIcons[item.icon]"></component>
                </el-icon>
                <span>{{ item.title }}</span>
              </el-menu-item>
            </template>
          </el-sub-menu>
          <!-- 没有子级的菜单为【首页】，根据json数据，它是json里第一个数据，因此【首页】在最上面 -->
          <el-menu-item :index="data.path" v-else-if="checkAuth(data.path)">
            <el-icon>
              <component :is="mapIcons[data.icon]"></component>
            </el-icon>
            <span>{{ data.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<script setup>
import { onMounted, ref } from "vue"
import axios from "axios"
import { HomeFilled, Key, OfficeBuilding, UploadFilled, List, User } from "@element-plus/icons-vue"
import { useRoute } from "vue-router"
import { useUserStore } from "../../store/useUserStore"
const route = useRoute()
//route.fullPath 当前相对路径，如 /user-manage/list 用于 :default-active 动态绑定实现当前菜单高亮
console.log(route)

// dom已挂载时就请求权限数据，进行渲染
onMounted(() => {
  getList()
})
const datalist = ref([])
const getList = async () => {
  let res = await axios.get("/admin/rights/list")
  console.log(res.data)
  datalist.value = res.data
}

// 图标实例对象映射，同名简写，如 User: User,
const mapIcons = {
  HomeFilled,
  User,
  Key,
  OfficeBuilding,
  UploadFilled,
  List,
}

// 校验 pinia 中当前登录用户拥有的权限 path 列表，没有权限则不创建菜单
const { user } = useUserStore()
const checkAuth = path => {
  return user.role.rights.includes(path)
}
</script>
