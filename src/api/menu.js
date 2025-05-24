import request from '@/utils/request' // 引入封装好的axios
//向后端请求路由数据，并返回路由数据
// 获取动态路由
export const getRouters = () => {
  return request({
    url: '/getRouters', // 请求地址
    method: 'get'  // 请求方式
  })
}