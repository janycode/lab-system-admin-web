<template>
  <!-- Button 按钮组件 -->
  <el-button type="primary" @click="handleAdd">添加用户</el-button>
  <!-- Table 表格组件: 树形展开 row-key="唯一属性" -->
  <el-table :data="tableData" style="width: 100%">
    <!-- <el-table-column prop="roleName" label="角色名称" min-width="200" /> -->
    <el-table-column prop="id" label="编号" />
    <el-table-column prop="username" label="用户名" min-width="200" />
    <el-table-column label="角色名称" min-width="200">
      <template #default="scope">
        <div>{{ scope.row.role.roleName }}</div>
      </template>
    </el-table-column>

    <!-- 按钮也使用：自定义表单 -->
    <el-table-column label="操作" min-width="200">
      <template #default="scope">
        <el-button
          size="small"
          type="primary"
          round
          @click="handleUpdate(scope.row)"
          :disabled="scope.row.isDefault ? true : false"
          >更新</el-button
        >
        <!-- popconfirm 气泡确认框 -->
        <el-popconfirm
          title="你确定要删除吗?"
          @confirm="handleDelete(scope.row.id)"
          confirm-button-text="确定"
          cancel-button-text="取消"
        >
          <template #reference>
            <el-button size="small" type="danger" round :disabled="scope.row.isDefault ? true : false">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>

  <!-- dialog 对话框组件-新增 -->
  <el-dialog v-model="dialogVisible" title="添加用户" width="500px">
    <!-- label-width="100px" 避免左侧宽度太宽 -->
    <el-form ref="addFormRef" :model="addForm" :rules="rules" label-width="100px" class="ruleForm" status-icon>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="addForm.username" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="addForm.password" type="password" />
      </el-form-item>
      <!-- select 选择器组件：用于选择角色下拉框 -->
      <el-form-item label="选择角色" prop="roleId">
        <el-select v-model="addForm.roleId" placeholder="请选择角色" style="width: 100%">
          <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddConfirm"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- dialog 对话框组件-更新 -->
  <el-dialog v-model="dialogUpdateVisible" title="更新用户" width="500px">
    <!-- label-width="100px" 避免左侧宽度太宽 -->
    <el-form ref="updateFormRef" :model="updateForm" :rules="rules" label-width="100px" class="ruleForm" status-icon>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="updateForm.username" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="updateForm.password" type="password" />
      </el-form-item>
      <!-- select 选择器组件：用于选择角色下拉框 -->
      <el-form-item label="选择角色" prop="roleId">
        <el-select v-model="updateForm.roleId" placeholder="请选择角色" style="width: 100%">
          <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogUpdateVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateConfirm"> 更新 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, ref, nextTick } from "vue"
import axios from "axios"
import { ElMessage } from "element-plus"

/* -------------------- 列表 start -------------------- */
const tableData = ref([])
const roleList = ref([])
onMounted(() => {
  getList()
  getRoleList()
})
const getList = async () => {
  let res = await axios.get("/admin/users/list")
  console.log("res.data users->", res.data)
  tableData.value = res.data
}
/* -------------------- 列表 end -------------------- */

/* -------------------- 新增 start -------------------- */
const dialogVisible = ref(false)
const addFormRef = ref()
const addForm = reactive({
  username: "",
  password: "",
  roleId: "",
})
const rules = reactive({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  roleId: [{ required: true, message: "请选择角色", trigger: "blur" }],
})
const handleAdd = () => {
  dialogVisible.value = true
}

const getRoleList = async () => {
  let res = await axios.get("/admin/roles/list")
  console.log("res.data roles->", res.data)
  roleList.value = res.data
}

const handleAddConfirm = () => {
  addFormRef.value.validate(async valid => {
    if (valid) {
      console.log(addForm) //新增的对象，如 {username: 'aaa', password: '123', roleId: 2}
      dialogVisible.value = false //关闭弹窗
      const res = await axios.post("/admin/users/add", addForm)
      if (!res.data.code) {
        addForm.username = ""
        addForm.password = ""
        ElMessage({
          message: "添加成功！",
          type: "success",
        })
        getList()
      }
    } else {
      console.log(valid) //false
    }
  })
}
/* -------------------- 新增 end -------------------- */

/* -------------------- 更新 start -------------------- */
const dialogUpdateVisible = ref(false)
const updateFormRef = ref()
const currentItem = ref({})
const updateForm = reactive({
  username: "",
  password: "",
  roleId: "",
})
// 弹出更新 form dialog 对话框
const handleUpdate = row => {
  //显示更新对话框
  dialogUpdateVisible.value = true
  //updateForm 更新
  updateForm.username = row.username
  updateForm.password = row.password
  updateForm.roleId = row.roleId

  //currentItem id
  currentItem.value = row
}
// 关闭 对话框，请求接口更新数据，刷新列表，弹 message 成功与失败
const handleUpdateConfirm = async () => {
  dialogUpdateVisible.value = false
  const res = await axios.put(`/admin/users/${currentItem.value.id}`, updateForm)
  commonMessage(res)
}
/* -------------------- 更新 end -------------------- */

/* -------------------- 删除 start -------------------- */
const handleDelete = async id => {
  const res = await axios.delete(`/admin/users/${id}`)
  commonMessage(res)
}
/* -------------------- 删除 end -------------------- */
// 通用 Message 组件：成功(+刷新列表) or 失败
const commonMessage = async res => {
  if (!res.data.code) {
    await getList()
    ElMessage({
      message: res.data.msg,
      type: "success",
    })
  } else {
    ElMessage(res.data.msg)
  }
}
</script>
