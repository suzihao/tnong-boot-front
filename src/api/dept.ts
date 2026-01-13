import request from '@/utils/request'

import type { ApiResponse } from '@/utils/request'

// 部门信息
export interface Dept {
  id?: number
  parentId?: number
  name: string
  leader?: string
  phone?: string
  email?: string
  sort?: number
  status: number
  remark?: string
  createdTime?: string
  updatedTime?: string
  version?: number
}

// 部门树节点
export interface DeptTree {
  id: number
  parentId: number
  name: string
  leader?: string
  phone?: string
  email?: string
  sort?: number
  status: number
  remark?: string
  children?: DeptTree[]
}

// 简单部门信息（用于下拉框）
export interface DeptSimple {
  id: number
  name: string
  parentId: number
}

// 查询参数
export interface DeptQueryParams {
  name?: string
  status?: number
}

// 部门表单
export interface DeptForm {
  id?: number
  parentId?: number
  name: string
  leader?: string
  phone?: string
  email?: string
  sort?: number
  status: number
  remark?: string
  version?: number
}

/**
 * 查询部门列表
 */
export function getDeptList(params?: DeptQueryParams) {
  return request<ApiResponse<Dept[]>>({
    url: '/system/dept/list',
    method: 'get',
    params,
  })
}

/**
 * 查询部门树形结构
 */
export function getDeptTree() {
  return request<ApiResponse<DeptTree[]>>({
    url: '/system/dept/tree',
    method: 'get',
  })
}

/**
 * 查询简单部门列表（用于下拉框）
 */
export function getDeptSimpleList() {
  return request<ApiResponse<DeptSimple[]>>({
    url: '/system/dept/simple',
    method: 'get',
  })
}

/**
 * 根据ID查询部门详情
 */
export function getDeptById(id: number) {
  return request<ApiResponse<Dept>>({
    url: `/system/dept/${id}`,
    method: 'get',
  })
}

/**
 * 新增部门
 */
export function createDept(data: DeptForm) {
  return request<ApiResponse<number>>({
    url: '/system/dept',
    method: 'post',
    data,
  })
}

/**
 * 更新部门
 */
export function updateDept(data: DeptForm) {
  return request<ApiResponse<void>>({
    url: '/system/dept/update',
    method: 'post',
    data,
  })
}

/**
 * 删除部门
 */
export function deleteDept(id: number, version: number) {
  return request<ApiResponse<void>>({
    url: '/system/dept/delete',
    method: 'post',
    data: { id, version },
  })
}
