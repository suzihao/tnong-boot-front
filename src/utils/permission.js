import { useUserStore } from '@/stores/user'

/**
 * 检查当前用户是否拥有指定权限
 * @param {string} permCode - 权限标识，如 'user:create'
 * @returns {boolean}
 */
export function hasPerm(permCode) {
  const userStore = useUserStore()
  return userStore.hasPerm(permCode)
}

/**
 * v-perm 自定义指令
 * 用法: <n-button v-perm="'user:create'">新增</n-button>
 */
export const permDirective = {
  mounted(el, binding) {
    const permCode = binding.value
    if (!hasPerm(permCode)) {
      el.style.display = 'none'
    }
  },
  updated(el, binding) {
    const permCode = binding.value
    if (!hasPerm(permCode)) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  }
}
