<template>
  <div>
    <div style="min-height: 1000px; justify-content: center; position: relative" id="map" />

    <!-- dialog 对话框组件-新增 -->
    <el-dialog v-model="dialogVisible" :title="currentItem.t" width="500px">
      <!-- label-width="100px" 避免左侧宽度太宽 -->
      <el-form ref="addFormRef" :model="addForm" :rules="rules" label-width="100px" class="ruleForm" status-icon>
        <el-form-item label="预约日期" prop="bookTime">
          <!-- DatePicker 日期选择器组件，中文日期涉及国际化配置: https://element-plus.org/zh-CN/guide/i18n -->
          <el-date-picker
            v-model="addForm.bookTime"
            type="date"
            placeholder="请选择日期"
            style="width: 100%"
            :disabled-date="disabledDate"
            @change="handleDateChange"
          />
        </el-form-item>
        <!-- select 选择器组件：用于选择角色下拉框 -->
        <el-form-item label="预约课节" prop="bookClass">
          <el-select v-model="addForm.bookClass" placeholder="请选择预约课节" style="width: 100%">
            <!-- 禁用 :disabled 判断数组包含的选项就禁用掉，禁用的是已被选择的 -->
            <el-option
              v-for="item in classTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="disableSelect.includes(item.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预约原因" prop="bookReason">
          <el-input v-model="addForm.bookReason" type="textarea" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel()">取消</el-button>
          <el-button type="primary" @click="handleAddConfirm"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ImageLayer, PointLayer, Scene } from "@antv/l7"
import { Map } from "@antv/l7-maps"
import axios from "axios"
import { ElMessage } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { classTypes } from "../../util/type"
import { useUserStore } from "../../store/useUserStore"
const userStore = useUserStore()

let scene
onMounted(() => {
  scene = new Scene({
    id: "map",
    // 新增：Canvas 渲染参数，消除 willReadFrequently 警告
    renderer: {
      type: "canvas", // 指定渲染器类型为 Canvas
      options: {
        willReadFrequently: true, // 开启高频读取优化
      },
    },
    map: new Map({
      center: [500, 500], //中心坐标位置，用于计算偏移量
      zoom: 3, //放大倍数
      version: "SIMPLE",
      mapSize: 1000, //地图尺寸 1000
      maxZoom: 5, //放大倍数，最大5倍
      minZoom: 2, //放大备注，最小2倍
      pitchEnabled: false, //捏放禁止
      rotateEnabled: false, //旋转禁止
    }),
  })
  scene.setBgColor("rgb(94, 182, 140)")

  //背景图片层
  const imagelayer = new ImageLayer({}).source("/bg.jpg", {
    parser: {
      type: "image",
      extent: [360, 400, 640, 600],
    },
  })

  scene.on("loaded", () => {
    //获取已创建的数据，显示在图中
    getList()
    scene.addLayer(imagelayer)
  })
})

const getList = async () => {
  const res = await axios.get("/admin/labs/list")
  console.log(res.data)
  //遍历添加文本标注: .map(item => ({...}))  映射为新的结构
  let list = res.data.map(item => ({
    x: item.x,
    y: item.y,
    t: "预约" + item.title,
    id: item.id, // 预约时要知道是哪个实验室（接口中都有），item 是接口返回的，有id值
  }))
  addTextLayer(list) //添加文字标注
}

//添加 - 弹窗
const dialogVisible = ref(false)
const addFormRef = ref()
const defaultForm = {
  bookTime: "",
  bookClass: "",
  bookReason: "",
}
const addForm = reactive({ ...defaultForm })
const rules = reactive({
  bookTime: [{ required: true, message: "请选择日期", trigger: "blur" }],
  bookClass: [{ required: true, message: "请选择课节", trigger: "blur" }],
  bookReason: [{ required: true, message: "请输入原因", trigger: "blur" }],
})

const handleAddConfirm = () => {
  addFormRef.value.validate(async valid => {
    if (valid) {
      dialogVisible.value = false //关闭对话框
      console.log(addForm)
      //发axios请求
      const res = await axios.post(`/admin/books/add`, {
        ...addForm,
        bookUsername: userStore.user.username,
        labId: currentItem.value.id, //实验室id
      })
      if (!res.data.code) {
        ElMessage({
          message: "提交预约成功，审核中...",
          type: "success",
        })
        //还原 reactive 对象类型中所有字段为初始值
        Object.assign(addForm, defaultForm)
      }
    } else {
      console.log("valid failed")
    }
  })
}

const currentItem = ref({})
const addTextLayer = data => {
  //将 textlayer 拿过来，修改 data 属性为 [x:x, y:y, t:小屋]
  const textlayer = new PointLayer({ zIndex: 2 })
    .source(
      data,
      {
        parser: {
          type: "json",
          x: "x",
          y: "y",
        },
      }
    )
    .shape("t", "text")
    .size(16) //字体大小
    .active({
      color: "#00f",
      mix: 0.9,
    })
    .color("rgb(255, 20, 20)") //文本标注的文本颜色
    .style({
      textAnchor: "center", // 文本相对锚点的位置 center|left|right|top|bottom|top-left
      spacing: 2, // 字符间距
      fontWeight: "800",
      padding: [1, 1], // 文本包围盒 padding [水平，垂直]，影响碰撞检测结果，避免相邻文本靠的太近
      stroke: "#ffffff", // 描边颜色
      strokeWidth: 2, // 描边宽度
      textAllowOverlap: true,
      fontSize: "30",
    })

  //绑定一个 dialog 对话框弹窗事件
  textlayer.on("click", e => {
    console.log(e.feature) // x,y,t
    currentItem.value = e.feature //当前点击的字段信息
    dialogVisible.value = true
  })
  scene.addLayer(textlayer)
}

// 禁用日期范围
const disabledDate = time => {
  //只能选择未来 7 天，且不包含今天
  return time.getTime() < Date.now() || time.getTime() > Date.now() + 7 * 24 * 3600 * 1000
}

const handleCancel = () => {
  dialogVisible.value = false
  //还原 reactive 对象类型中所有字段为初始值
  Object.assign(addForm, defaultForm)
}

// 日期改变时回调函数
const disableSelect = ref([])
const handleDateChange = async () => {
  //每次选择都需要重置 form 中的课节字段，防止先选课节再选日期
  addForm.bookClass = ""
  // labId bookTime 实验室id 和 日期（即当前实验室在对应日期的预约列表）
  const res = await axios.post("/admin/books/select", {
    bookTime: addForm.bookTime,
    labId: currentItem.value.id,
  })
  console.log(res.data.map(item => item.bookClass)) //查出来的是已被预约数据，所以 select 选项需要禁用
  disableSelect.value = res.data.map(item => item.bookClass)
}

</script>
