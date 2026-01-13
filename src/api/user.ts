import request from '@/utils/request'

import type { ApiResponse } from '@/utils/request'

// 用户信息
export interface User {
  id?: number
  userCode?: string
  username: string
  nickname: string
  mobile?: string
  email?: string
  status: number
  tenantId?: number
  remark?: string
  lastLoginTime?: string
  createdTime?: string
  updatedTime?: string
  version?: number
}

// 分页查询参数
export interface UserPageParams {
  page: number
  size: number
  username?: string
  nickname?: string
  mobile?: string
  status?: number
}

// 分页响应
export interface PageResponse<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 用户表单
export interface UserForm {
  id?: number
  userId?: string
  username: string
  password?: string
  nickname: string
  mobile?: string
  email?: string
  status: number
  remark?: string
  version?: number
}

/**
 * 分页查询用户列表
 */
export function getUserPage(params: UserPageParams) {
  return request<ApiResponse<PageResponse<User>>>({
    url: '/system/user/page',
    method: 'get',
    params,
  })
}

/**
 * 根据userId查询用户详情
 */
export function getUserById(userId: string) {
  return request<ApiResponse<User>>({
    url: `/system/user/${userId}`,
    method: 'get',
  })
}

/**
 * 新增用户
 */
export function createUser(data: UserForm) {
  return request<ApiResponse<User>>({
    url: '/system/user',
    method: 'post',
    data,
  })
}

/**
 * 更新用户
 */
export function updateUser(data: UserForm) {
  return request<ApiResponse<User>>({
    url: '/system/user/update',
    method: 'post',
    data,
  })
}

/**
 * 删除用户
 */
export function deleteUser(userId: string, version: number) {
  return request<ApiResponse<void>>({
    url: '/system/user/delete',
    method: 'post',
    data: { id: userId, version },
  })
}

/**
 * 获取用户已分配的角色ID列表
 */
export function getUserRoles(userId: string) {
  return request<ApiResponse<number[]>>({
    url: `/system/user/${userId}/role-ids`,
    method: 'get',
  })
}

/**
 * 为用户分配角色
 */
export function assignUserRoles(userId: string, roleIds: number[]) {
  return request<ApiResponse<void>>({
    url: `/system/user/${userId}/role-ids`,
    method: 'post',
    data: roleIds,
  })
}
