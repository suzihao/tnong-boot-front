import request from '@/utils/request'
import type { ApiResponse } from '@/utils/request'

// 角色信息
export interface Role {
  id: number
  name: string
  code: string
  dataScope?: number
  sort?: number
  status: number
  isSystem?: number
  remark?: string
  createdTime?: string
  updatedTime?: string
  version?: number
}

/**
 * 获取角色列表
 */
export function getRoleList() {
  return request<ApiResponse<Role[]>>({
    url: '/system/role/list',
    method: 'get',
  })
}

/**
 * 新增角色
 */
export function createRole(data: Partial<Role>) {
  return request<ApiResponse<Role>>({
    url: '/system/role',
    method: 'post',
    data,
  })
}

/**
 * 更新角色
 */
export function updateRole(data: Partial<Role>) {
  return request<ApiResponse<Role>>({
    url: '/system/role',
    method: 'put',
    data,
  })
}

/**
 * 删除角色
 */
export function deleteRole(id: number, version: number) {
  return request<ApiResponse<void>>({
    url: `/system/role/${id}`,
    method: 'delete',
    params: { version },
  })
}

/**
 * 获取角色已分配的菜单ID列表
 */
export function getRoleMenus(roleId: number) {
  return request<ApiResponse<number[]>>({
    url: `/system/role/${roleId}/menu-ids`,
    method: 'get',
  })
}

/**
 * 为角色分配菜单
 */
export function assignRoleMenus(roleId: number, menuIds: number[]) {
  return request<ApiResponse<void>>({
    url: `/system/role/${roleId}/menu-ids`,
    method: 'post',
    data: { menuIds },
  })
}
