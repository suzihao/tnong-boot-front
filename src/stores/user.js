import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import { getMyMenusAndPerms } from '@/api/menu'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    menus: JSON.parse(localStorage.getItem('menus') || '[]'),
    perms: JSON.parse(localStorage.getItem('perms') || '[]')
  }),

  getters: {
    isLogin: (state) => !!state.token,
    hasPerm: (state) => {
      return (permCode) => {
        if (!permCode) return true
        return state.perms.includes(permCode)
      }
    }
  },

  actions: {
    // 登录
    async login(loginForm) {
      try {
        const res = await loginApi(loginForm)
        if (res.code === 200) {
          this.token = res.data.token
          this.userInfo = {
            userId: res.data.userId,
            username: res.data.username,
            nickname: res.data.nickname,
            tenantId: res.data.tenantId
          }
          
          // 保存到本地存储
          localStorage.setItem('token', this.token)
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          
          // 登录后立即拉取菜单和权限
          await this.fetchMenusAndPerms()
          
          return true
        }
        return false
      } catch (error) {
        console.error('登录失败:', error)
        return false
      }
    },

    // 拉取当前用户的菜单和权限
    async fetchMenusAndPerms() {
      try {
        const res = await getMyMenusAndPerms()
        if (res.code === 200) {
          this.menus = res.data.menus || []
          this.perms = res.data.perms || []
          localStorage.setItem('menus', JSON.stringify(this.menus))
          localStorage.setItem('perms', JSON.stringify(this.perms))
        }
      } catch (error) {
        console.error('获取菜单权限失败:', error)
      }
    },

    // 退出登录
    async logout() {
      try {
        await logoutApi()
      } catch (error) {
        console.error('退出失败:', error)
      } finally {
        this.token = ''
        this.userInfo = {}
        this.menus = []
        this.perms = []
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('menus')
        localStorage.removeItem('perms')
      }
    }
  }
})
