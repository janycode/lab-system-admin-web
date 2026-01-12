<template>
  <div>
    <!-- Table 表格组件: 树形展开 row-key="唯一属性" -->
    <el-table :data="filterTableData" style="width: 100%">
      <!-- <el-table-column prop="roleName" label="角色名称" min-width="200" /> -->
      <el-table-column label="实验室名称">
        <template #default="scope">
          <!-- Link 组件，类似a标签进行包装，用于预览实验室 -->
          <el-link type="primary" @click="handlePreview(scope.row)">{{ scope.row.lab.title }}</el-link>
        </template>
      </el-table-column>
      <!-- 使用自定义指令 v-admin 限制管理员才创建(非管理员则移除dom节点) -->
      <el-table-column label="预约人" v-admin>
        <!-- Table 自定义表头：#header -->
        <template #header>
          <el-input v-model="search" size="small" placeholder="请输入预约人" />
        </template>
        <template #default="scope">
          <div>{{ scope.row.bookUsername }}</div>
        </template>
      </el-table-column>
      <el-table-column label="预约时间">
        <template #default="scope">
          <el-tag style="height: 40px; line-height: 20px;">
            {{ moment(scope.row.bookTime).format("YYYY-MM-DD") }}
            <br>
            {{ getClassLabel(scope.row.bookClass) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="预约状态">
        <template #default="scope">
          <el-tag :type="bookStateType[scope.row.bookState]">{{ bookStateText[scope.row.bookState] }}</el-tag>
        </template>
      </el-table-column>

      <!-- 按钮也使用：自定义表单, 使用到自定义指令 v-teacher 限制教师才创建(非教师则移除dom节点) -->
      <el-table-column label="操作" min-width="200" v-teacher>
        <template #default="scope">
          <!-- popconfirm 气泡确认框 -->
          <el-popconfirm title="你确定要撤销吗?" @confirm="handleDelete(scope.row)" confirm-button-text="确定"
            cancel-button-text="取消">
            <template #reference>
              <el-button size="small" type="danger" round :disabled="scope.row.isDefault ? true : false">撤销</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- dialog 对话框组件- v-if 对数据进行完全创建和删除，防止数据残留 -->
    <el-dialog v-model="dialogVisible" title="实验室位置" :fullscreen="true" v-if="dialogVisible">
      <!-- 封装自定义组件 -->
      <LabMap :x="currentItem.x" :y="currentItem.y" :t="currentItem.title"></LabMap>
    </el-dialog>
  </div>
</template>

<script setup>
import axios from "axios"
import { onMounted, ref, computed } from "vue"
import { classTypes, bookStateType, bookStateText } from "../../util/type"
import LabMap from "../../components/lab-manage/LabMap.vue"
import { ElMessage } from "element-plus"
import { useUserStore } from "../../store/useUserStore"
import moment from 'moment'

const userStore = useUserStore()

onMounted(() => {
  getList()
})
const tableData = ref([])
const getList = async () => {
  let url = `/admin/books/list`
  // 管理员(roleType === 1)查看到的是所有数据，其他角色查看是自己的数据
  // console.log(userStore.user.role.roleType)
  if (userStore.user.role.roleType !== 1) {
    url += `?bookUsername=${userStore.user.username}`
  }
  const res = await axios.get(url)
  tableData.value = res.data
}

const getClassLabel = (value) => {
  return classTypes.find(item => item.value === value)?.label
}

const currentItem = ref({})
const dialogVisible = ref(false)
const handlePreview = (item) => {
  dialogVisible.value = true
  currentItem.value = item.lab  //预览的是实验室 lab 不是 item
}

// 撤销操作
const handleDelete = async ({ id }) => {
  const res = await axios.delete(`/admin/books/${id}`)
  commonMessage(res)
}

// 通用 Message 组件：成功(+刷新列表) or 失败
const commonMessage = async res => {
  if (!res.data.code) {
    await getList()
    ElMessage({
      message: "撤销成功",
      type: "success",
    })
  } else {
    ElMessage(res.data.msg)
  }
}

//[列权限控制]自定义指令 vTeacher 对应DOM v-teacher：如果非 2教师 角色，则把【撤销】按钮给移除掉
const vTeacher = {
  mounted(el) {         //el 当前节点信息
    if (userStore.user.role.roleType !== 2) {
      el.remove()
    }
  }
}
//[列权限控制]自定义指令 vAdmin 对应DOM v-admin：如果非 1管理员 角色，则把【预约人】列给移除掉
const vAdmin = {
  mounted(el) {         //el 当前节点信息
    if (userStore.user.role.roleType !== 1) {
      el.remove()
    }
  }
}

// 自定义表头：搜索预约人这一列
const search = ref("")
const filterTableData = computed(() => {
  return tableData.value.filter(item => !search.value ||
    item.bookUsername.toLowerCase().includes(search.value.toLowerCase()))
})

</script>