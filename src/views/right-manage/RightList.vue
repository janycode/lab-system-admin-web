<template>
  <!-- Table 表格组件: 树形展开 row-key="唯一属性" -->
  <el-table :data="tableData" style="width: 100%" row-key="path">
    <el-table-column prop="title" label="权限名称" min-width="200" />
    <!-- 图标需使用：自定义表单 -->
    <el-table-column label="图标" min-width="100">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <!-- scope.row 是默认取 tableData 的行数据，因此可以直接 .icon -->
          <el-icon>
            <component :is="mapIcons[scope.row.icon]"></component>
          </el-icon>
        </div>
      </template>
    </el-table-column>
    <!-- 按钮也使用：自定义表单 -->
    <el-table-column label="操作" min-width="200">
      <template #default="scope">
        <el-button size="small" type="primary" round @click="handleUpdate(scope.row)">更新</el-button>
        <!-- popconfirm 气泡确认框 -->
        <el-popconfirm
          title="你确定要删除吗?"
          @confirm="handleDelete(scope.row.id)"
          confirm-button-text="确定"
          cancel-button-text="取消"
        >
          <template #reference>
            <el-button size="small" type="danger" round>删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>

  <!-- dialog 对话框组件 -->
  <el-dialog v-model="dialogVisible" title="更新权限" width="400px">
    <!-- label-width="80px" 避免左侧宽度太宽 -->
    <el-form ref="updateFormRef" :model="updateForm" :rules="rules" label-width="80px" class="ruleForm" status-icon>
      <el-form-item label="权限名称" prop="title">
        <el-input v-model="updateForm.title" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm"> 更新 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue"
import axios from "axios"
import { HomeFilled, Key, OfficeBuilding, UploadFilled, List, User } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"

const tableData = ref([])
onMounted(() => {
  getList()
})
const getList = async () => {
  let res = await axios.get("/admin/rights/list")
  console.log(res.data)
  tableData.value = res.data
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

// 更新对话框弹窗
const dialogVisible = ref(false)
const updateFormRef = ref()
const currentItem = ref({})
const updateForm = reactive({
  title: "",
})
const rules = reactive({
  title: [{ required: true, message: "请输入权限名称", trigger: "blur" }],
})

// 更新 put: /admin/rights/{id} 参数 {title:"", icon:""}
const handleUpdate = row => {
  //console.log(row)
  currentItem.value = row //记录当前点击的对象内容，用于更新时拿id
  updateForm.title = row.title
  dialogVisible.value = true
}
// 点击更新 confirm
const handleConfirm = () => {
  updateFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      // 提交更新
      let res = await axios.put(`/admin/rights/${currentItem.value.id}`, updateForm)
      console.log("update res:", res.data)

      dialogVisible.value = false //对话框消失
      if (!res.data.code) {
        ElMessage({
          //成功提示 Message 消息组件
          message: res.data.msg,
          type: "success",
        })
        getList() //对话框消失再获取并更新一次列表
      } else {
        ElMessage.error(res.data.msg)
      }
    } else {
      console.log("错误提交!", fields)
    }
  })
}

// 删除
const handleDelete = async id => {
  console.log(id)
  await axios.delete(`/admin/rights/${id}`)
  await getList() //气泡对话框消失再获取并更新一次列表
  ElMessage({
    message: "删除成功！",
    type: "success",
  })
}
</script>
