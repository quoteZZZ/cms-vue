import request from '@/utils/request' // 引入request工具类，封装好的axios请求

// 登录方法，传入账号，密码，输入验证码，正确验证码uuid
export function login(username, password, code, uuid) {
  // 封装请求数据，包含所有需要提交的参数的json对象
  const data = {
    username,
    password,
    code,
    uuid
  }
  // 发送post请求，传入封装好的data
  return request({  // 封装的axios请求
    url: '/login', // 请求地址
    headers: { // 请求头信息
      isToken: false, // 是否携带token，不需要token验证
      repeatSubmit: false // 是否重复提交，该请求不需要重复提交
    },
    method: 'post', // 请求方法post
    data: data // 请求参数
  })
}

// 注册方法
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}