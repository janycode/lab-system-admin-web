<template>
  <div>
    <div style="min-height: 1000px; justify-content: center; position: relative" id="map" />

    <!-- dialog 对话框组件-新增 -->
    <el-dialog v-model="dialogVisible" title="添加实验室" width="500px">
      <!-- label-width="100px" 避免左侧宽度太宽 -->
      <el-form ref="addFormRef" :model="addForm" :rules="rules" label-width="100px" class="ruleForm" status-icon>
        <el-form-item label="实验室名称" prop="title">
          <el-input v-model="addForm.title" />
        </el-form-item>
        <el-form-item label="容纳人数" prop="capacity">
          <el-input v-model="addForm.capacity" type="number" />
        </el-form-item>
        <!-- select 选择器组件：用于选择角色下拉框 -->
        <el-form-item label="实验室类型" prop="labType">
          <el-select v-model="addForm.labType" placeholder="请选择实验室类型" style="width: 100%">
            <el-option v-for="item in labTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <!-- select 选择器组件：用于选择角色下拉框 -->
        <el-form-item label="所属学院" prop="collegeType">
          <el-select v-model="addForm.collegeType" placeholder="请选择所属学院" style="width: 100%">
            <el-option v-for="item in collegeTypes" :key="item.value" :label="item.label" :value="item.value" />
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
  </div>
</template>
<script setup>
import { onMounted, ref, reactive } from "vue"
import { ImageLayer, Scene, Popup, PointLayer } from "@antv/l7"
import { Map } from "@antv/l7-maps"
import { collegeTypes, labTypes } from "../../util/type"
import axios from "axios"
import { ElMessage } from "element-plus"

let scene, popup
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

  //L7 v2.x 用 scene.map 获取地图实例，v3.x 兼容写法
  const mapInstance = scene.getMap ? scene.getMap() : scene.map

  //背景图片层
  const imagelayer = new ImageLayer({}).source("/bg.jpg", {
    parser: {
      type: "image",
      extent: [360, 400, 640, 600],
    },
  })

  // imagelayer 图片层添加信息 Popup 信息窗，绑定 click 事件
  imagelayer.on("click", e => {
    console.log(e) //坐标: (e.x, e.y)  经纬: (e.lngLat.lng, e.lngLat.lat)
    let { lng, lat } = e.lngLat
    popup = new Popup({
      offsets: [0, 0],
      closeButton: false,
    })
      .setLnglat(e.lngLat)
      //.setHTML(`<div>位置:(${e.x}, ${e.y})</div>`)
      //单独给一个 class 样式(偷elementplus的按钮样式)，onclick 事件绑定到 window 对象上
      .setHTML(`<button class="el-button el-button--primary" onclick="add_popup(${lng}, ${lat})">选择位置</button>`)
    scene.addPopup(popup)
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
    t: item.title,
  }))
  addTextLayer(list) //添加文字标注
}

window.add_popup = (lng, lat) => {
  console.log("经纬:", lng, lat)
  //显示输入的对话框
  dialogVisible.value = true
  //关闭 Popup 信息窗
  popup.close()
  // x,y
  addForm.x = 500 + 2.8 * lng
  addForm.y = 500 + 2.8 * lat
}

//添加 - 弹窗
const dialogVisible = ref(false)
const addFormRef = ref()
const defaultForm = {
  title: "",
  capacity: "",
  labType: "",
  collegeType: "",
  x: 0,
  y: 0,
}
const addForm = reactive({ ...defaultForm })
const rules = reactive({
  title: [{ required: true, message: "请输入实验室名称", trigger: "blur" }],
  capacity: [{ required: true, message: "请输入容纳人数", trigger: "blur" }],
  labType: [{ required: true, message: "请选择实验室类型", trigger: "blur" }],
  collegeType: [{ required: true, message: "请选择学院类型", trigger: "blur" }],
})

const handleAddConfirm = () => {
  addFormRef.value.validate(async valid => {
    if (valid) {
      dialogVisible.value = false //关闭对话框
      console.log(addForm)
      //发axios请求
      const res = await axios.post(`/admin/labs/add`, addForm)
      if (!res.data.code) {
        ElMessage({
          message: "添加成功！",
          type: "success",
        })
        addTextLayer([
          {
            x: addForm.x,
            y: addForm.y,
            t: addForm.title,
          },
        ]) //添加文字标注
        //还原 reactive 对象类型中所有字段为初始值
        Object.assign(addForm, defaultForm)
      }
    } else {
      console.log("valid failed")
    }
  })
}

const addTextLayer = data => {
  //将 textlayer 拿过来，修改 data 属性为 [x:x, y:y, t:小屋]
  const textlayer = new PointLayer({ zIndex: 2 })
    .source(
      data,
      // data 的单个数组元素
      // [
      //   {
      //     x: addForm.x, // 2.8倍的计算方法: (x轴最长640 - 中心点500) / 画布最右纬度值 50 ≈ 2.8
      //     y: addForm.y, // 2.8倍的计算方法: (y轴最长400 - 中心点500) / 画布最右经度值-35 ≈ 2.8
      //     t: addForm.title,
      //   },
      // ],
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
  scene.addLayer(textlayer)
}
</script>
