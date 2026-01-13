import request from '@/utils/request'

import type { ApiResponse } from '@/utils/request'

// 文件信息
export interface SysFile {
  id?: number
  fileName: string
  fileSize?: number
  fileType?: string
  filePath?: string
  storageType?: number
  bizType?: string
  bizId?: number
  remark?: string
  createdTime?: string
  updatedTime?: string
  version?: number
}

// 分页查询参数
export interface FilePageParams {
  page: number
  size: number
  fileName?: string
  storageType?: number
  bizType?: string
  bizId?: number
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
 * 分页查询文件列表
 */
export function getFilePage(params: FilePageParams) {
  return request<ApiResponse<PageResponse<SysFile>>>({
    url: '/system/file/page',
    method: 'get',
    params,
  })
}

/**
 * 根据ID查询文件详情
 */
export function getFileById(id: number) {
  return request<ApiResponse<SysFile>>({
    url: `/system/file/${id}`,
    method: 'get',
  })
}

/**
 * 上传文件
 */
export function uploadFile(file: File, bizType?: string, bizId?: number, remark?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (bizType) formData.append('bizType', bizType)
  if (bizId) formData.append('bizId', bizId.toString())
  if (remark) formData.append('remark', remark)

  return request<ApiResponse<SysFile>>({
    url: '/system/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 下载文件
 */
export function downloadFile(id: number) {
  return `/api/system/file/download/${id}`
}

/**
 * 删除文件
 */
export function deleteFile(id: number, version: number) {
  return request<ApiResponse<void>>({
    url: '/system/file/delete',
    method: 'post',
    data: { id, version },
  })
}
