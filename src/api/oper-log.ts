import request from '@/utils/request'

import type { ApiResponse } from '@/utils/request'

// 操作日志信息
export interface OperLog {
  id?: number
  module?: string
  businessType?: number
  method?: string
  requestMethod?: string
  operatorType?: number
  operName?: string
  operUrl?: string
  operIp?: string
  operLocation?: string
  operParam?: string
  jsonResult?: string
  status?: number
  errorMsg?: string
  operTime?: string
  costTime?: number
}

// 分页查询参数
export interface OperLogPageParams {
  page: number
  size: number
  module?: string
  operName?: string
  businessType?: number
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

/**
 * 分页查询操作日志列表
 */
export function getOperLogPage(params: OperLogPageParams) {
  return request<ApiResponse<PageResponse<OperLog>>>({
    url: '/system/log/oper/page',
    method: 'get',
    params,
  })
}

/**
 * 根据ID查询操作日志详情
 */
export function getOperLogById(id: number) {
  return request<ApiResponse<OperLog>>({
    url: `/system/log/oper/${id}`,
    method: 'get',
  })
}

/**
 * 批量删除操作日志
 */
export function batchDeleteOperLog(ids: number[]) {
  return request<ApiResponse<void>>({
    url: '/system/log/oper/batch-delete',
    method: 'post',
    data: ids,
  })
}

/**
 * 清空操作日志
 */
export function truncateOperLog() {
  return request<ApiResponse<void>>({
    url: '/system/log/oper/truncate',
    method: 'post',
  })
}
