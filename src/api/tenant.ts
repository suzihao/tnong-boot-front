import request from '@/utils/request'

import type { ApiResponse } from '@/utils/request'

// 租户信息
export interface Tenant {
  id?: number
  tenantId?: number
  name: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  status: number
  expireTime?: string
  remark?: string
  createdTime?: string
  updatedTime?: string
  version?: number
}

// 分页查询参数
export interface TenantPageParams {
  page: number
  size: number
  tenantCode?: number
  name?: string
}

// 分页响应
export interface PageResponse<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 租户表单
export interface TenantForm {
  id?: number
  tenantId?: number
  name: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  status: number
  expireTime?: string
  remark?: string
  version?: number
}

/**
 * 分页查询租户列表
 */
export function getTenantPage(params: TenantPageParams) {
  return request<ApiResponse<PageResponse<Tenant>>>({
    url: '/system/tenant/page',
    method: 'get',
    params,
  })
}

/**
 * 根据ID查询租户详情
 */
export function getTenantById(id: number) {
  return request<ApiResponse<Tenant>>({
    url: `/system/tenant/${id}`,
    method: 'get',
  })
}

/**
 * 新增租户
 */
export function createTenant(data: TenantForm) {
  return request<ApiResponse<Tenant>>({
    url: '/system/tenant',
    method: 'post',
    data,
  })
}

/**
 * 更新租户
 */
export function updateTenant(data: TenantForm) {
  return request<ApiResponse<Tenant>>({
    url: '/system/tenant',
    method: 'put',
    data,
  })
}

/**
 * 删除租户
 */
export function deleteTenant(id: number, version: number) {
  return request<ApiResponse<void>>({
    url: `/system/tenant/${id}`,
    method: 'delete',
    params: { version },
  })
}
