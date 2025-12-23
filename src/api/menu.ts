import request from '@/utils/request'
import type { ApiResponse } from '@/utils/request'

// 菜单项
export interface MenuItem {
  id: number
  parentId: number
  type: number // 1目录/2菜单/3按钮
  name: string
  path?: string
  component?: string
  perms?: string
  icon?: string
  sort: number
  visible: number
  status: number
  remark?: string
  version?: number
  children?: MenuItem[]
}

// 菜单表单
export interface MenuForm {
  id?: number
  parentId: number
  type: number
  name: string
  path?: string
  component?: string
  perms?: string
  icon?: string
  sort: number
  visible: number
  status: number
  remark?: string
  version?: number
}

// 菜单和权限响应
export interface MenuPermsResponse {
  menus: MenuItem[]
  perms: string[]
}

// 获取当前用户的菜单和权限
export function getMyMenusAndPerms() {
  return request<ApiResponse<MenuPermsResponse>>({
    url: '/system/menu/my-routes',
    method: 'get',
  })
}

// 获取菜单树
export function getMenuTree() {
  return request<ApiResponse<MenuItem[]>>({
    url: '/system/menu/tree',
    method: 'get',
  })
}

// 新增菜单
export function createMenu(data: MenuForm) {
  return request<ApiResponse<MenuItem>>({
    url: '/system/menu',
    method: 'post',
    data,
  })
}

// 更新菜单
export function updateMenu(data: MenuForm) {
  return request<ApiResponse<MenuItem>>({
    url: '/system/menu',
    method: 'put',
    data,
  })
}

// 删除菜单
export function deleteMenu(id: number, version: number) {
  return request<ApiResponse<void>>({
    url: `/system/menu/${id}`,
    method: 'delete',
    params: { version },
  })
}
