import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // 引入 NProgress 进度条库
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

//权限控制与路由守卫：通过路由守卫控制用户访问权限
//根据用户是否登录和角色信息动态加载可访问路由，并处理页面跳转逻辑。

//配置 NProgress 库，禁用默认的加载 spinner进度条。
NProgress.configure({ showSpinner: false });
// 路由白名单，无需登录即可访问的路由（如登录页、注册页等）
const whiteList = ['/login', '/register'];

// 路由守卫，在每次路由跳转前执行(进行权限验证和状态设置)，用于处理页面跳转逻辑。
router.beforeEach((to, from, next) => {
  // 开始加载进度条
  NProgress.start()
  //检查是否存在token，存在则证明用户已登录
  if (getToken()) {
    // ，存在token，则设置页面标题，根据路由meta中的title属性设置
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    if (to.path === '/login') {
      // 如果路径为登录页，则重定向跳转到首页
      next({ path: '/' })
      NProgress.done() // 关闭加载进度条
    } else if (whiteList.indexOf(to.path) !== -1) {
      // 如果路径在白名单中，则直接进入（登录页和注册页）
      next()
    } else {
      // 如果路径不在白名单中，则检查用户角色权限
      if (useUserStore().roles.length === 0) {//如果用户角色为空，则重新获取用户信息
        //显示重新登录模态框
        isRelogin.show = true
        // 获取用户信息（向后端发送请求）
        useUserStore().getInfo().then(() => {
          isRelogin.show = false //关闭重新登录模态框
          usePermissionStore().generateRoutes().then(accessRoutes => {
            // 根据roles权限生成，可访问的路由表（usePermissionStore().generateRoutes()）
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                router.addRoute(route) // 动态添加可访问路由表
              }
            })
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
          })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else { // 如果不存在token，则跳转到登录页
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else { // 否则全部重定向到登录页
      next(`/login?redirect=${to.fullPath}`) 
      NProgress.done() // 关闭加载进度条
    }
  }
})

// 路由跳转后执行，用于处理页面跳转逻辑。
router.afterEach(() => {
  NProgress.done() // 关闭加载进度条
})
