import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'

// 定义用户信息存储仓库
const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      id: '',
      name: '',
      avatar: '',
      roles: [],
      permissions: []
    }),
    actions: {
      // 登录方法
      login(userInfo) {
        //移除用户名前后空格，获取用户名、密码、验证码、验证码标识uuid
        const username = userInfo.username.trim()
        const password = userInfo.password
        const code = userInfo.code
        const uuid = userInfo.uuid //存储正确验证码的key，获取redis当中的验证码，然后与验证码code进行比对
        //返回一个新的异步操作对象：Promise ，处理登录操作
        return new Promise((resolve, reject) => {
          //调用登录接口api（api/login.js中的login方法），传入用户名、密码、验证码、验证码标识uuid
          login(username, password, code, uuid).then(res => {
            //登录成功，将后端传入的token存储到本地cookie，并存储到仓库当中
            setToken(res.token)
            //将token存储到仓库/实例的token属性中，方便其他地方使用，如路由拦截器中，判断用户是否登录，如果登录了，则获取用户信息，否则跳转到登录页，并清空token，仓库/实例的token属性当中
            this.token = res.token
            //登录成功，调用resolve方法，结束promise
            resolve()
          }).catch(error => {
            // 登录失败，调用reject方法，传递错误信息，结束promise
            reject(error)
          })
        })
      },
      // 获取用户信息：返回一个异步操作对象：Promise
      getInfo() {
        return new Promise((resolve, reject) => {
          //调用获取用户信息接口api（api/login.js中的getInfo方法），传入token
          getInfo().then(res => {
            //获取用户信息成功，将用户信息存储到仓库/实例的属性中
            const user = res.user
            //如果用户头像为空，则使用默认头像，否则使用用户头像，构造完整的头像URL
            const avatar = (user.avatar == "" || user.avatar == null) ? defAva : import.meta.env.VITE_APP_BASE_API + user.avatar;
            //如果用户角色为空，则使用默认角色，否则使用用户角色
            if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              this.roles = res.roles //将用户角色存储到仓库/实例的roles属性中
              this.permissions = res.permissions //将用户权限存储到仓库/实例的permissions属性中
            } else { //如果用户角色为空，则使用默认角色
              this.roles = ['ROLE_DEFAULT'] //将默认角色存储到仓库/实例的roles属性中
            }
            this.id = user.userId //将用户ID存储到仓库/实例的id属性中
            this.name = user.userName //将用户名存储到仓库/实例的name属性中
            this.avatar = avatar //将用户头像存储到仓库/实例的avatar属性中
            resolve(res) //登录成功，调用resolve方法，结束promise
          }).catch(error => {
            reject(error) //登录失败，调用reject方法，传递错误信息，结束promise
          })
        })
      },
      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          logout(this.token).then(() => {
            this.token = ''
            this.roles = []
            this.permissions = []
            removeToken()
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      }
    }
  })

export default useUserStore
