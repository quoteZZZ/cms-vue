import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'
//动态路由管理器
//动态生成和管理前端路由，根据用户角色和权限从后端获取路由配置，
//并将其转换为Vue Router的路由对象，同时更新Vuex store中的路由状态。

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue')

//定义一个状态管理存储器，用于处理和存储应用中的权限路由信息
const usePermissionStore = defineStore(
  'permission', // 存储器名称
  {
    state: () => ({ // 状态管理器，存储应用中的权限路由信息，包括各种路由列表
      routes: [],  // 所有路由列表信息
      addRoutes: [], // 动态添加的路由列表
      defaultRoutes: [], // 默认路由列表
      topbarRouters: [], // 顶部导航栏路由列表
      sidebarRouters: [] // 侧边栏路由列表
    }),
    actions: { // 动作管理器，用于处理和更新状态管理器中的状态
      setRoutes(routes) { // 设置路由列表
        this.addRoutes = routes // 动态添加的路由列表（传入的路由列表）
        //将传入的路由列表与常量路由列表合并，并更新状态管理器中的路由列表
        this.routes = constantRoutes.concat(routes) 
      },
      setDefaultRoutes(routes) { // 设置默认路由列表
        //将传入的路由列表与常量路由列表合并，并更新状态管理器中的默认路由列表
        this.defaultRoutes = constantRoutes.concat(routes) 
      },
      setTopbarRoutes(routes) { // 设置顶部导航栏路由列表
        this.topbarRouters = routes // 更新状态管理器中的顶部导航栏路由列表
      },
      setSidebarRouters(routes) { // 设置侧边栏路由列表
        this.sidebarRouters = routes // 更新状态管理器中的侧边栏路由列表
      },
      generateRoutes(roles) { // 根据用户角色生成路由
        return new Promise(resolve => { // 返回一个Promise对象，用于处理异步操作（生成路由）
          // 向后端请求路由数据（调用/api/menu/getRouters）
          getRouters().then(res => {
            //深拷贝响应数据，避免修改原始数据
            const sdata = JSON.parse(JSON.stringify(res.data))//侧边栏路由
            const rdata = JSON.parse(JSON.stringify(res.data))//重写路由
            const defaultData = JSON.parse(JSON.stringify(res.data))//默认路由
            //处理侧边栏路由列表
            const sidebarRoutes = filterAsyncRouter(sdata)
            //处理重写路由列表
            const rewriteRoutes = filterAsyncRouter(rdata, false, true)
            //处理默认路由列表
            const defaultRoutes = filterAsyncRouter(defaultData)
            //处理动态路由列表
            const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
            //将动态路由列表添加到重写路由列表中
            asyncRoutes.forEach(route => { router.addRoute(route) })
            // 更新各种路由状态管理器中的路由列表
            this.setRoutes(rewriteRoutes)//动态添加的路由列表
            this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))//侧边栏路由列表
            this.setDefaultRoutes(sidebarRoutes)//默认路由列表
            this.setTopbarRoutes(defaultRoutes)//顶部导航栏路由列表
            resolve(rewriteRoutes)//返回重写路由列表
          })
        })
      }
    }
  })

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView' && !lastRouter) {
        el.children.forEach(c => {
          c.path = el.path + '/' + c.path
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c))
            return
          }
          children.push(c)
        })
        return
      }
    }
    if (lastRouter) {
      el.path = lastRouter.path + '/' + el.path
      if (el.children && el.children.length) {
        children = children.concat(filterChildren(el.children, el))
        return
      }
    }
    children = children.concat(el)
  })
  return children
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

export const loadView = (view) => {
  let res;
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0];
    if (dir === view) {
      res = () => modules[path]();
    }
  }
  return res;
}

export default usePermissionStore
