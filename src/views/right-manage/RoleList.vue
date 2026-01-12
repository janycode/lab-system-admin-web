<template>
  <!-- Table 表格组件: 树形展开 row-key="唯一属性" -->
  <el-table :data="tableData" style="width: 100%">
    <!-- <el-table-column prop="roleName" label="角色名称" min-width="200" /> -->
    <el-table-column label="角色名称" min-width="200">
      <template #default="scope">
        <!-- Popover 弹出框组件：鼠标移入悬浮提示 -->
        <el-popover
          placement="right"
          title="权限详情"
          :width="200"
          trigger="hover"
          @before-enter="handleHover(scope.row)"
        >
          <!-- 表格列内容显示 -->
          <template #reference>
            <el-button class="m-2">{{ scope.row.roleName }}</el-button>
          </template>
          <!-- 默认插槽，参考文档描述 -->
          <template #default>
            <!-- Tree 树形控件：鼠标移入默认显示映射的 props 且默认展开，自定义节点使用 render-content 函数 -->
            <el-tree
              style="max-width: 600px"
              :data="righsList"
              :props="defaultProps"
              :default-expand-all="true"
              :render-content="renderContent"
            />
          </template>
        </el-popover>
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
  <el-dialog v-model="dialogVisible" title="更新角色" width="400px">
    <!-- label-width="80px" 避免左侧宽度太宽 -->
    <el-form ref="updateFormRef" :model="updateForm" :rules="rules" label-width="80px" class="ruleForm" status-icon>
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="updateForm.roleName" />
      </el-form-item>
      <el-form-item label="角色权限" prop="rights">
        <!-- Tree 树形控件：show-checkbox 变成可选节点，做默认选中必须设置node-key值唯一; :check-strictly="true" 父子不关联 -->
        <el-tree
          style="max-width: 600px"
          :data="righsList"
          :props="defaultProps"
          :default-expand-all="true"
          show-checkbox
          node-key="path"
          ref="treeRef"
          :check-strictly="true"
        />
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
import { onMounted, reactive, ref, nextTick } from "vue"
import axios from "axios"
import { ElMessage } from "element-plus"

const tableData = ref([])
const righsList = ref([])
const defaultProps = {
  children: "children",
  label: "title", // rights 中的元素的 title
}
onMounted(() => {
  getList()
  getRightList()
})
const getList = async () => {
  let res = await axios.get("/admin/roles/list")
  console.log(res.data)
  tableData.value = res.data
}
const getRightList = async () => {
  let res = await axios.get("/admin/rights/list")
  console.log(res.data)
  righsList.value = res.data
}

/* -------------------- Tree 树形控件:鼠标移入显示的位置 start -------------------- */
// 进入动画前，解构 rights，就知道当前用户是哪些权限菜单
const currentRights = ref([])
const handleHover = ({ rights }) => {
  //console.log("rights:", rights)
  currentRights.value = rights
}
// Tree 树形控件：自定义节点 的渲染方法
const renderContent = (h, { node, data }) => {
  //console.log("data->", data)  // data 是当前 scope.row 对象，data.path 可以取到权限路径
  return h(
    "span",
    {
      // 判断权限包含添加 active 控制对应权限着色，结合 style 样式
      class: `custom-tree-node ${currentRights.value.includes(data.path) ? "active" : ""}`,
    },
    [h("span", null, node.label)]
  )
}
/* -------------------- Tree 树形控件:鼠标移入显示的位置 end -------------------- */

// 更新 按钮回调
const handleUpdate = item => {
  //console.log(item)
  dialogVisible.value = true
  updateForm.roleName = item.roleName //回显角色名到输入框
  currentItem.value = item //用于请求更新接口传参
  // 设置 rights 权限列表给 tree - 注意：此时 dialog 对话框还未创建出来，使用 nextTick 等其dom渲染后即可
  nextTick(() => {
    treeRef.value.setCheckedKeys(JSON.parse(item.rights)) //json字符串转为json对象
  })
}
// 更新对话框弹窗 form表单所需
const dialogVisible = ref(false)
const updateFormRef = ref()
const currentItem = ref({})
const updateForm = reactive({
  roleName: "",
})
const rules = reactive({
  roleName: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
})
/* -------------------- Tree 树形控件:更新弹窗里的可选树位置 start -------------------- */
const treeRef = ref()
/* -------------------- Tree 树形控件:更新弹窗里的可选树位置 end -------------------- */
const handleConfirm = async () => {
  //getCheckedKeys() 获取选中的节点值，是个数组
  //console.log(updateForm.roleName, treeRef.value.getCheckedKeys());
  let res = await axios.put(`/admin/roles/${currentItem.value.id}`, {
    roleName: updateForm.roleName,
    rights: JSON.stringify(treeRef.value.getCheckedKeys()),
  })
  dialogVisible.value = false //关闭对话框弹窗

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
}

// 删除 按钮回调
const handleDelete = async id => {
  await axios.delete(`/admin/roles/${id}`)
  await getList() //气泡对话框消失再获取并更新一次列表
  ElMessage({
    message: "删除成功！",
    type: "success",
  })
}
</script>

<style lang="scss" scoped>
:deep(.active) {
  color: #c45656;
}
</style>
