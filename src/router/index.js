import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import MainBox from '../views/MainBox.vue'
import RouteConfig from '../router/config'
import { useRouterStore } from '../store/useRouterStore'
import NotFound from '../views/notfound/NotFound.vue'
import { useUserStore } from '../store/useUserStore'
import NProgress from 'nprogress' //[模块化]引入进度条
import 'nprogress/nprogress.css'  //[模块化]引入进度条样式

const routes = [
    {
        path: '/login',
        name: 'login',
        component: Login
    },
    {
        path: '/mainbox',
        name: 'mainbox',
        component: MainBox
    },
]
const router = createRouter({
    history: createWebHashHistory(),  // 带 # 的路径
    routes
})

// 添加路由
// router.addRoute("mainbox", {
//     path: '/index',   // 访问路径 #/index, 但如果是 'index'，则访问路径为 #/mainbox/index
//     component: Home   // Home 作为 mainbox 的孩子
// })

// 路由拦截
router.beforeEach((to, from, next) => {
    NProgress.start()  // 进入路由前 加载进度条

    const { isGetterRouter } = useRouterStore()
    const { user } = useUserStore()
    // 如果跳转是 login 就放行
    if (to.name === 'login') {
        next()
    } else {
        // 未登录授权：如果未登录则跳转的登陆
        // if (!localStorage.getItem('token')) {
        if (!user.role) {  // 更换为：用持久化 pinia 中的角色对象非空 - 表示登陆了
            next({
                path: '/login'
            })
        } else {
            // 只有第一次进入路由拦截才会进行配置路由 - 引入 pinia 公共状态管理
            if (!isGetterRouter) {
                router.removeRoute("mainbox") //重新登陆时需要将旧的 mianbox 移除掉，确保切换用户时 mainbox 路由始终是空的
                ConfigRouter()
                next({ path: to.fullPath })  //第一次刚配置路由时不会生效，需要强行往路由上走一次
            } else {
                next()
            }
        }
    }
})
router.afterEach(() => {
    NProgress.done()  // 进入路由后 关闭进度条
})

// 在 mainbox 下都写成孩子路由，用数组的方式加入路由
const ConfigRouter = () => {
    // 因为路由拦截中移除掉过，所以重新登陆时要加进来
    router.addRoute({
        path: '/mainbox',
        name: 'mainbox',
        component: MainBox
    })
    const { changeRouter } = useRouterStore()
    RouteConfig.forEach((item) => {
        // 判断用户的路由(即菜单)权限，只有包含的情况下才会添加对应权限的路由
        checkPermission(item.path) && router.addRoute("mainbox", item)
    })

    // 重定向
    router.addRoute("mainbox", {
        path: '/',
        redirect: '/index'
    })

    // 404
    router.addRoute("mainbox", {
        path: '/:pathMatch(.*)*',
        name: 'not found',
        component: NotFound
    })

    console.log(router.getRoutes()); //当前路由对象下有多少个路由
    changeRouter(true)
}

// 检查用户路由权限，包含返回 true，不包含返回 false
const checkPermission = (path) => {
    const { user } = useUserStore()
    return user.role.rights.includes(path)
}

export default router