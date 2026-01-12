<template>
    <div>
        <div style="min-height: 1000px; justify-content: center; position: relative" id="map" />
    </div>
</template>
<script setup>
import { ImageLayer, PointLayer, Popup, Scene } from "@antv/l7"
import { Map } from "@antv/l7-maps"
import axios from "axios"
import moment from "moment"
import { onMounted } from "vue"
import { classTypes, bookStateText } from "../../util/type"
import { bgUrl } from "../../util/url.config"

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

    //背景图片层
    const imagelayer = new ImageLayer({}).source(bgUrl, {
        parser: {
            type: "image",
            extent: [360, 400, 640, 600],
        },
    })

    // 图片上点击时可以关闭掉 popup 弹窗
    imagelayer.on('click', () => {
        popup && popup.close()  // 如果有 popup 弹窗时才关闭
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
    let list = res.data.map(item => ({  //item会映射到 e.feature 对象中
        x: item.x,
        y: item.y,
        t: item.title,
        id: item.id    //添加id字段映射
    }))
    addTextLayer(list) //添加文字标注
}

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

    bindTextLayer(textlayer) //绑定点击事件，点击弹出 popup 弹窗
    scene.addLayer(textlayer)
}

const bindTextLayer = (textlayer) => {
    popup && popup.close() //绑定事件时也关掉，防止内存溢出
    textlayer.on("click", async (e) => {
        console.log(e); //拿到文本标注对象信息

        //0-预约中、1-已批准 聚合查询：Promise.all([a1, a2])
        let url = `/admin/books/list?labId=${e.feature.id}`
        const res = await Promise.all([
            axios.get(url + `&bookState=0`),
            axios.get(url + `&bookState=1`)
        ])
        //console.log(...res[0].data, ...res[1].data) // res结果是一个数组，对应了 axios 请求的顺序
        let list = [...res[0].data, ...res[1].data]
        //map  [1,2,3].map(item => `<li>${item}</li>`).join("")
        //如果有数据就组装html信息，没有就显示默认信息
        if (list.length) {
            list = list.map(item => `
                <li class="home-item">
                    ${moment(item.bookTime).format("YYYY-MM-DD")}
                    <b>${item.bookUsername}-${classTypes.find(type => type.value === item.bookClass).label}</b>
                    <span class=${item.bookState === 0 ? 'yellow' : 'green'}>${bookStateText[item.bookState]}</span>
                </li>
            `).join("")
        } else {
            list = `<li class="home-item">暂无预约信息</li>`
        }
        console.log(list);

        popup = new Popup({
            offsets: [0, 0],
            closeButton: false,
        })
            .setLnglat(e.lngLat)
            //.setHTML(`<div>位置:(${e.x}, ${e.y})</div>`)
            //单独给一个 class 样式(偷elementplus的按钮样式)，onclick 事件绑定到 window 对象上
            .setHTML(list)
        scene.addPopup(popup)
    })
}

</script>

<style lang="scss" scoped>
:deep(.home-item) {
    list-style: none;
    height: 30px;
    line-height: 30px;
    padding: 5px;
    border: 1px dashed lightgray;

    span.green {
        color: green;
    }

    span.yellow {
        color: orange;
    }
}

//修改默认样式，popup 的宽度不能撑开，因此单独覆盖一个宽度样式
:deep(.l7-popup .l7-popup-content) {
    width: 100%;
}
</style>
