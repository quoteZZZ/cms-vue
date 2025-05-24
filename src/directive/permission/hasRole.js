//v-hasRole 角色权限处理（角色权限）
//用于根据用户角色权限动态控制页面元素的显示与隐藏。

import useUserStore from '@/store/modules/user'//用户状态管理器，获取用户状态对象

//该指令在mounted钩子函数中执行，当指令绑定的值是一个数组时，会遍历数组中的每个元素，判断当前用户是否具有该角色权限，如果没有则移除该元素。
export default {
  //挂载时执行
  mounted(el, binding, vnode) {
    //获取指令传入的角色数组
    const { value } = binding
    //定义系统管理员的角色标识符
    const super_admin = "admin";
    //获取用户状态管理器中的当前用户的角色数组
    const roles = useUserStore().roles
    //判断角色数组是否存在且长度大于0
    if (value && value instanceof Array && value.length > 0) {
      //提取角色标识符数组
      const roleFlag = value
      //判断当前用户是否具有角色权限，返回true或false
      const hasRole = roles.some(role => {
        return super_admin === role || roleFlag.includes(role)
      })
      //如果用户没有对应角色，则从DOM中移除该元素
      if (!hasRole) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else { //如果角色数组不存在或长度为0，则抛出错误
      throw new Error(`请设置角色权限标签值`)
    }
  }
}
