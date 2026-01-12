<template>
  <div>
    <!-- Table 表格组件: 树形展开 row-key="唯一属性" -->
    <el-table :data="tableData" style="width: 100%">
      <!-- <el-table-column prop="roleName" label="角色名称" min-width="200" /> -->
      <el-table-column label="实验室名称">
        <template #default="scope">
          <!-- Link 组件，类似a标签进行包装，用于预览实验室 -->
          <el-link type="primary" @click="handlePreview(scope.row)">{{ scope.row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="所属学院" min-width="200">
        <template #default="scope">
          <!-- Tag 组件，可以传入不同的 color 值，让显示不一样 -->
          <el-tag :color="collegeMethod(scope.row.collegeType).color">{{ collegeMethod(scope.row.collegeType).label
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="实验室类型" min-width="200">
        <template #default="scope">
          <el-tag :color="labMethod(scope.row.labType).color">{{ labMethod(scope.row.labType).label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="capacity" label="容纳人数" />

      <!-- 按钮也使用：自定义表单 -->
      <el-table-column label="操作" min-width="200">
        <template #default="scope">
          <el-button size="small" type="primary" round @click="handleUpdate(scope.row)"
            :disabled="scope.row.isDefault ? true : false">更新</el-button>
          <!-- popconfirm 气泡确认框 -->
          <el-popconfirm title="你确定要删除吗?" @confirm="handleDelete(scope.row.id)" confirm-button-text="确定"
            cancel-button-text="取消">
            <template #reference>
              <el-button size="small" type="danger" round :disabled="scope.row.isDefault ? true : false">删除</el-button>
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

    <!-- dialog 对话框组件-新增 -->
    <el-dialog v-model="dialogUpdateVisible" title="更新实验室" width="500px">
      <!-- label-width="100px" 避免左侧宽度太宽 -->
      <el-form ref="updateFormRef" :model="updateForm" :rules="rules" label-width="100px" class="ruleForm" status-icon>
        <el-form-item label="实验室名称" prop="title">
          <el-input v-model="updateForm.title" />
        </el-form-item>
        <el-form-item label="容纳人数" prop="capacity">
          <!-- 注意：v-model.number 修饰符可以让字段转为 数字 类型 -->
          <el-input v-model.number="updateForm.capacity" type="number" />
        </el-form-item>
        <!-- select 选择器组件：用于选择角色下拉框 -->
        <el-form-item label="实验室类型" prop="labType">
          <el-select v-model="updateForm.labType" placeholder="请选择实验室类型" style="width: 100%">
            <el-option v-for="item in labTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <!-- select 选择器组件：用于选择角色下拉框 -->
        <el-form-item label="所属学院" prop="collegeType">
          <el-select v-model="updateForm.collegeType" placeholder="请选择所属学院" style="width: 100%">
            <el-option v-for="item in collegeTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogUpdateVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateConfirm"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import axios from "axios"
import { onMounted, ref, reactive } from "vue"
import { collegeTypes, labTypes } from "../../util/type"
import LabMap from "../../components/lab-manage/LabMap.vue"
import { ElMessage } from "element-plus"

onMounted(() => {
  getList()
})
const tableData = ref([])
const getList = async () => {
  const res = await axios.get("/admin/labs/list")
  tableData.value = res.data
}

const collegeMethod = value => {
  return collegeTypes.find(item => item.value === value)
}
const labMethod = value => {
  return labTypes.find(item => item.value === value)
}

/* -------------------- 预览 start -------------------- */
//使用 el-link 包裹，弹出一个 el-dialog，进行父传子属性传值，v-if 让 dialog 创建和删除来确保每次数据是全新的
const currentItem = ref({})
const dialogVisible = ref(false)
const handlePreview = row => {
  console.log("row->", row)

  dialogVisible.value = true
  currentItem.value = row
}
/* -------------------- 预览 end -------------------- */

/* -------------------- 更新 start -------------------- */
const dialogUpdateVisible = ref(false)
const updateFormRef = ref()
const defaultForm = {
  title: "",
  capacity: "",
  labType: "",
  collegeType: "",
}
const updateForm = reactive({ ...defaultForm })
const rules = reactive({
  title: [{ required: true, message: "请输入实验室名称", trigger: "blur" }],
  capacity: [{ required: true, message: "请输入容纳人数", trigger: "blur" }],
  labType: [{ required: true, message: "请选择实验室类型", trigger: "blur" }],
  collegeType: [{ required: true, message: "请选择学院类型", trigger: "blur" }],
})

const handleUpdate = row => {
  dialogUpdateVisible.value = true

  updateForm.title = row.title
  updateForm.capacity = row.capacity
  updateForm.labType = row.labType
  updateForm.collegeType = row.collegeType

  currentItem.value = row
}

const handleUpdateConfirm = () => {
  updateFormRef.value.validate(async valid => {
    if (valid) {
      dialogUpdateVisible.value = false //关闭对话框
      console.log(updateForm)
      //发axios请求
      const res = await axios.put(`/admin/labs/${currentItem.value.id}`, updateForm)
      commonMessage(res)
    } else {
      console.log("valid failed")
    }
  })
}
/* -------------------- 更新 end -------------------- */

/* -------------------- 删除 start -------------------- */
const handleDelete = async id => {
  const res = await axios.delete(`/admin/labs/${id}`)
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

<style lang="scss" scoped>
:deep(.el-tag) {
  color: white;
}
</style>
