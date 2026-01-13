import request from '@/utils/request'

import type { ApiResponse } from '@/utils/request'

// 字典类型信息
export interface DictType {
  id?: number
  dictCode: string
  dictName: string
  status?: number
  remark?: string
  createdTime?: string
  updatedTime?: string
  version?: number
}

// 分页查询参数
export interface DictTypePageParams {
  page: number
  size: number
  dictCode?: string
  dictName?: string
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

// 字典类型表单
export interface DictTypeForm {
  id?: number
  dictCode: string
  dictName: string
  status?: number
  remark?: string
  version?: number
}

/**
 * 分页查询字典类型列表
 */
export function getDictTypePage(params: DictTypePageParams) {
  return request<ApiResponse<PageResponse<DictType>>>({
    url: '/system/dict/type/page',
    method: 'get',
    params,
  })
}

/**
 * 根据ID查询字典类型详情
 */
export function getDictTypeById(id: number) {
  return request<ApiResponse<DictType>>({
    url: `/system/dict/type/${id}`,
    method: 'get',
  })
}

/**
 * 新增字典类型
 */
export function createDictType(data: DictTypeForm) {
  return request<ApiResponse<number>>({
    url: '/system/dict/type',
    method: 'post',
    data,
  })
}

/**
 * 更新字典类型
 */
export function updateDictType(data: DictTypeForm) {
  return request<ApiResponse<void>>({
    url: '/system/dict/type/update',
    method: 'post',
    data,
  })
}

/**
 * 删除字典类型
 */
export function deleteDictType(id: number, version: number) {
  return request<ApiResponse<void>>({
    url: '/system/dict/type/delete',
    method: 'post',
    data: { id, version },
  })
}
