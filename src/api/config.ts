import request from '@/utils/request'

import type { ApiResponse } from '@/utils/request'

// 系统配置信息
export interface Config {
  id?: number
  configKey: string
  configValue: string
  configName: string
  configType?: string
  remark?: string
  createdTime?: string
  updatedTime?: string
  version?: number
}

// 分页查询参数
export interface ConfigPageParams {
  page: number
  size: number
  configKey?: string
  configName?: string
  configType?: string
}

// 分页响应
export interface PageResponse<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 配置表单
export interface ConfigForm {
  id?: number
  configKey: string
  configValue: string
  configName: string
  configType?: string
  remark?: string
  version?: number
}

/**
 * 分页查询配置列表
 */
export function getConfigPage(params: ConfigPageParams) {
  return request<ApiResponse<PageResponse<Config>>>({
    url: '/system/config/page',
    method: 'get',
    params,
  })
}

/**
 * 根据ID查询配置详情
 */
export function getConfigById(id: number) {
  return request<ApiResponse<Config>>({
    url: `/system/config/${id}`,
    method: 'get',
  })
}

/**
 * 根据key查询配置值
 */
export function getConfigByKey(configKey: string) {
  return request<ApiResponse<string>>({
    url: `/system/config/key/${configKey}`,
    method: 'get',
  })
}

/**
 * 新增配置
 */
export function createConfig(data: ConfigForm) {
  return request<ApiResponse<number>>({
    url: '/system/config',
    method: 'post',
    data,
  })
}

/**
 * 更新配置
 */
export function updateConfig(data: ConfigForm) {
  return request<ApiResponse<void>>({
    url: '/system/config/update',
    method: 'post',
    data,
  })
}

/**
 * 删除配置
 */
export function deleteConfig(id: number, version: number) {
  return request<ApiResponse<void>>({
    url: '/system/config/delete',
    method: 'post',
    data: { id, version },
  })
}
