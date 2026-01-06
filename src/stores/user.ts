import { useStorage } from '@vueuse/core'
import { acceptHMRUpdate, defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'

import { login as loginApi, logout as logoutApi, wecomCallback as wecomCallbackApi } from '@/api/auth'
import { getMyMenusAndPerms } from '@/api/menu'
import router from '@/router'
import { resolveMenu, resolveRoute } from '@/router/helper'

import { pinia } from '.'

import type { LoginForm, LoginResponse } from '@/api/auth'
import type { MenuItem } from '@/api/menu'
import type { MenuMixedOptions } from '@/router/interface'
import type { MenuOption } from 'naive-ui'
import type { RouteRecordRaw } from 'vue-router'

interface UserInfo {
  userId?: number
  username?: string
  nickname?: string
  tenantId?: number
  avatar?: string
}

export const useUserStore = defineStore('userStore', () => {
  const user = useStorage<UserInfo>('user', {})
  const token = useStorage<string | null>('token', null)
  const menuList = ref<MenuOption[]>([])
  const routeList = ref<RouteRecordRaw[]>([])
  const perms = ref<string[]>([])

  // 登录
  async function login(form: LoginForm) {
    try {
      const res = await loginApi(form)
      debugger
      if (res.code === 200) {
        const data: LoginResponse = res.data
        token.value = data.token
        user.value = {
          userId: data.userId,
          username: data.username,
          nickname: data.nickname,
          tenantId: data.tenantId,
          avatar: data.avatar,
        }

        // 登录后立即拉取菜单和权限
        await fetchMenusAndPerms()

        return true
      }
      return false
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  // 企业微信登录
  async function wecomLogin(code: string) {
    try {
      const res = await wecomCallbackApi(code)
      if (res.code === 200) {
        const data: LoginResponse = res.data
        token.value = data.token
        user.value = {
          userId: data.userId,
          username: data.username,
          nickname: data.nickname,
          tenantId: data.tenantId,
          avatar: data.avatar,
        }

        // 登录后立即拉取菜单和权限
        await fetchMenusAndPerms()

        return { success: true, message: '登录成功' }
      }
      return { success: false, message: res.message || '登录失败' }
    } catch (error: any) {
      console.error('企业微信登录失败:', error)
      return { success: false, message: error.message || '登录失败，请重试' }
    }
  }

  // 获取菜单和权限
  async function fetchMenusAndPerms() {
    try {
      console.log('开始获取菜单和权限...')
      const res = await getMyMenusAndPerms()
      console.log('菜单权限响应:', res)

      if (res.code === 200) {
        const menus = res.data.menus || []
        perms.value = res.data.perms || []

        console.log('后端返回的菜单:', JSON.stringify(menus, null, 2))
        console.log('后端返回的权限:', perms.value)

        // 转换后端菜单为前端路由格式
        const menuOptions = transformMenusToOptions(menus)
        console.log('转换后的菜单选项:', JSON.stringify(menuOptions, null, 2))

        await resolveMenuRoute(menuOptions)
        console.log('路由解析完成，menuList:', menuList.value)
        console.log('路由解析完成，routeList:', JSON.stringify(routeList.value, null, 2))
      }
    } catch (error) {
      console.error('获取菜单权限失败:', error)
    }
  }

  // 转换后端菜单为前端菜单选项
  function transformMenusToOptions(menus: MenuItem[], parentPath = ''): MenuMixedOptions[] {
    return menus
      .filter((menu) => menu.type !== 3 && menu.visible === 1) // 过滤按钮和不可见菜单
      .map((menu) => {
        // 处理路径：统一去掉前导斜杠
        // 一级菜单：/system -> system
        // 子菜单：/user -> user
        let menuPath = menu.path || ''
        if (menuPath.startsWith('/')) {
          menuPath = menuPath.substring(1)
        }

        // 生成完整路径用于路由名称
        const fullPath = parentPath ? `${parentPath}/${menuPath}` : `/${menuPath}`
        // 生成路由名称：去掉路径中的 / 和 -
        const routeName = fullPath.replace(/^\/|\/$/g, '').replace(/[\/\-]/g, '') || `menu_${menu.id}`

        const option: MenuMixedOptions = {
          path: menuPath,
          name: routeName,
          label: menu.name,
          icon: menu.icon || undefined,
          meta: {
            componentName: menu.name,
            showTab: menu.type === 2, // 只有菜单类型才显示标签页
            title: menu.name,
          },
          // 不设置 type 字段，让 resolveMenu 能正确处理
        }

        // 如果有子菜单，递归处理
        if (menu.children && menu.children.length > 0) {
          const childOptions = transformMenusToOptions(menu.children, fullPath)
          if (childOptions.length > 0) {
            option.children = childOptions
            // 目录类型需要重定向到第一个有组件的子菜单
            const firstChildWithComponent = childOptions.find(child => child.component)
            if (firstChildWithComponent) {
              // 使用子菜单的相对路径作为重定向目标
              option.redirect = firstChildWithComponent.path
            }
          }
        } else if (menu.type === 2) {
          // 叶子节点且是菜单类型，设置组件路径
          // 如果后端没有提供 component，根据 path 自动生成
          if (menu.component) {
            option.component = menu.component
          } else if (menuPath) {
            // 根据完整路径生成组件路径，例如 /system/role -> system/role
            option.component = fullPath.replace(/^\//, '')
          }
        }

        console.log('转换菜单项:', {
          name: menu.name,
          path: menuPath,
          fullPath,
          routeName,
          component: option.component,
          hasChildren: !!option.children?.length
        })

        return option
      })
  }

  // 解析菜单和路由
  async function resolveMenuRoute(menuOptions?: MenuMixedOptions[]) {
    const options = menuOptions || []

    const resolvedMenu = resolveMenu(options) || []
    const resolvedRoute = resolveRoute(options) || []

    menuList.value = resolvedMenu
    routeList.value = resolvedRoute

    return {
      menuList: resolvedMenu,
      routeList: resolvedRoute,
    }
  }

  // 退出登录
  async function logout() {
    try {
      await logoutApi()
    } catch (error) {
      console.error('退出失败:', error)
    } finally {
      cleanup()
    }
  }

  // 清理用户数据
  function cleanup(redirectPath?: string) {
    token.value = null
    user.value = {}
    menuList.value = []
    routeList.value = []
    perms.value = []

    if (router.hasRoute('layout')) {
      router.removeRoute('layout')
    }

    router.replace({
      name: 'signIn',
      ...(redirectPath ? { query: { r: redirectPath } } : {}),
    })
  }

  // 检查权限
  function hasPerm(permCode?: string) {
    if (!permCode) return true
    return perms.value.includes(permCode)
  }

  return {
    user,
    token,
    menuList,
    routeList,
    perms,
    login,
    wecomLogin,
    logout,
    fetchMenusAndPerms,
    resolveMenuRoute,
    cleanup,
    hasPerm,
  }
})

export function toRefsUserStore() {
  return {
    ...storeToRefs(useUserStore(pinia)),
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
