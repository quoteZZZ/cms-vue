import useUserStore from '@/store/modules/user'  // 用户状态管理器，获取用户状态对象
//v-hasPermi 操作权限处理（操作权限）
//定义了一个权限检查指令，用于判断用户是否有权限显示某个页面元素。如果没有权限，则自动隐藏该元素；如果未设置权限值，则会抛出错误提示。

//该指令在mounted钩子函数中执行，首先获取指令绑定的值value，然后判断value是否为数组且长度大于0。如果是，则遍历permissions数组，判断是否有权限。如果没有权限，则将元素从DOM中移除。如果未设置权限值，则会抛出错误提示。
export default {
  //挂载时执行
  mounted(el, binding, vnode) {
    //获取指令绑定的值，传入的权限数组
    const { value } = binding
    //定义一个表示所有权限的字符串
    const all_permission = "*:*:*";
    //获取用户权限，从用户状态管理器中获取当前用户的权限集合
    const permissions = useUserStore().permissions
    //检查是否提供了权限值，并且权限值是一个非空数组
    if (value && value instanceof Array && value.length > 0) {
      //提取权限标识符数组
      const permissionFlag = value
      //检查用户是否具有必要的权限（这个按钮的权限），返回true，否则返回false
      const hasPermissions = permissions.some(permission => {
        return all_permission === permission || permissionFlag.includes(permission)
      })
      //如果没有权限，则将元素从DOM中移除，这个按钮页面就不会显示
      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else { //如果未设置权限值，则会抛出错误提示
      throw new Error(`请设置操作权限标签值`)
    }
  }
}
