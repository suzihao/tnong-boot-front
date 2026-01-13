import request from '@/utils/request'

import type { ApiResponse } from '@/utils/request'

// 字典项信息
export interface DictItem {
  id?: number
  dictTypeId?: number
  dictCode: string
  itemLabel: string
  itemValue: string
  sort?: number
  status?: number
  remark?: string
  createdTime?: string
  updatedTime?: string
  version?: number
}

// 分页查询参数
export interface DictItemPageParams {
  page: number
  size: number
  dictCode?: string
  itemLabel?: string
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

// 字典项表单
export interface DictItemForm {
  id?: number
  dictTypeId?: number
  dictCode: string
  itemLabel: string
  itemValue: string
  sort?: number
  status?: number
  remark?: string
  version?: number
}

/**
 * 分页查询字典项列表
 */
export function getDictItemPage(params: DictItemPageParams) {
  return request<ApiResponse<PageResponse<DictItem>>>({
    url: '/system/dict/item/page',
    method: 'get',
    params,
  })
}

/**
 * 根据ID查询字典项详情
 */
export function getDictItemById(id: number) {
  return request<ApiResponse<DictItem>>({
    url: `/system/dict/item/${id}`,
    method: 'get',
  })
}

/**
 * 根据字典类型编码查询字典项列表
 */
export function getDictItemsByTypeCode(typeCode: string) {
  return request<ApiResponse<DictItem[]>>({
    url: `/system/dict/item/list/${typeCode}`,
    method: 'get',
  })
}

/**
 * 新增字典项
 */
export function createDictItem(data: DictItemForm) {
  return request<ApiResponse<number>>({
    url: '/system/dict/item',
    method: 'post',
    data,
  })
}

/**
 * 更新字典项
 */
export function updateDictItem(data: DictItemForm) {
  return request<ApiResponse<void>>({
    url: '/system/dict/item/update',
    method: 'post',
    data,
  })
}

/**
 * 删除字典项
 */
export function deleteDictItem(id: number, version: number) {
  return request<ApiResponse<void>>({
    url: '/system/dict/item/delete',
    method: 'post',
    data: { id, version },
  })
}
