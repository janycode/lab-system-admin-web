<template>
  <div>
    <div style="min-height: 1000px; justify-content: center; position: relative" id="map" />
  </div>
</template>

<script setup>
import { onMounted, nextTick, ref, computed } from "vue"
import { ImageLayer, Scene, PointLayer } from "@antv/l7"
import { Map } from "@antv/l7-maps"

//接收父传子字段
const props = defineProps(["x", "y", "t"])
console.log(props)

let scene
onMounted(() => {
  //因为在 dialog 对话框中弹窗出来的，所以此时还不能获取到宽度，会导致变形，需要 nextTick()渲染完就不会有问题
  console.log(document.getElementById("map").clientWidth) //0
  nextTick(() => {
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
        center: [props.x, props.y], //中心坐标位置，用于计算偏移量
        zoom: 5, //放大倍数
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
      //loaded完直接添加上来当前的这个实验室信息
      addTextLayer([
        {
          x: props.x,
          y: props.y,
          t: props.t,
        },
      ])
      scene.addLayer(imagelayer)
    })
  })
})

const addTextLayer = data => {
  //将 textlayer 拿过来，修改 data 属性为 [x:x, y:y, t:小屋]
  const textlayer = new PointLayer({ zIndex: 2 })
    .source(data, {
      parser: {
        type: "json",
        x: "x",
        y: "y",
      },
    })
    .shape("t", "text")
    .size(30) //字体大小
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
