import axios from "axios"
import { ElLoading } from 'element-plus'

let loadingInstance = null
// 请求之前
axios.interceptors.request.use(function (config) {
    console.log("请求之前");

    //创建 loading 框
    //loadingInstance = ElLoading.service({ fullscreen: true })

    //所有请求都携带上 localStorage 中的 token
    const token = localStorage.getItem("token")
    config.headers.token = token  // .token 是与后端约定的 header 中的 key 为 token
    return config;
}, function (error) {
    return Promise.reject(error);
});

// 响应之前
axios.interceptors.response.use(function (response) {
    console.log("then 响应之前", response.data);

    // 响应信息中如果拿到 token，则存入 localStorage，用于 请求之前拦截器
    const res = response.data
    res?.data?.token && localStorage.setItem("token", res?.data?.token)

    // 关闭 loading 框
    //loadingInstance?.close()

    return response;
}, function (error) {
    console.log("catch 响应之前", error.response);
    const { status } = error.response
    if (status === 401) {
        localStorage.removeItem("token")
        window.location.href = "#/login"  //重定向：注意路由模式
    }
    return Promise.reject(error);
});