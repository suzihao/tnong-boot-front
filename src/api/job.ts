import request from '@/utils/request'

import type { ApiResponse } from '@/utils/request'

// 定时任务信息
export interface Job {
  id?: number
  jobName: string
  jobGroup?: string
  invokeTarget: string
  cronExpression: string
  misfirePolicy?: number
  concurrent?: number
  status?: number
  remark?: string
  createdTime?: string
  updatedTime?: string
  version?: number
}

// 分页查询参数
export interface JobPageParams {
  page: number
  size: number
  jobName?: string
  jobGroup?: string
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

// 任务表单
export interface JobForm {
  id?: number
  jobName: string
  jobGroup?: string
  invokeTarget: string
  cronExpression: string
  misfirePolicy?: number
  concurrent?: number
  status?: number
  remark?: string
  version?: number
}

/**
 * 分页查询任务列表
 */
export function getJobPage(params: JobPageParams) {
  return request<ApiResponse<PageResponse<Job>>>({
    url: '/system/job/page',
    method: 'get',
    params,
  })
}

/**
 * 根据ID查询任务详情
 */
export function getJobById(id: number) {
  return request<ApiResponse<Job>>({
    url: `/system/job/${id}`,
    method: 'get',
  })
}

/**
 * 新增任务
 */
export function createJob(data: JobForm) {
  return request<ApiResponse<number>>({
    url: '/system/job',
    method: 'post',
    data,
  })
}

/**
 * 更新任务
 */
export function updateJob(data: JobForm) {
  return request<ApiResponse<void>>({
    url: '/system/job/update',
    method: 'post',
    data,
  })
}

/**
 * 删除任务
 */
export function deleteJob(id: number, version: number) {
  return request<ApiResponse<void>>({
    url: '/system/job/delete',
    method: 'post',
    data: { id, version },
  })
}

/**
 * 修改任务状态
 */
export function changeJobStatus(id: number, status: number) {
  return request<ApiResponse<void>>({
    url: '/system/job/status',
    method: 'post',
    data: { id, status },
  })
}

/**
 * 立即执行任务
 */
export function runJobOnce(id: number) {
  return request<ApiResponse<void>>({
    url: `/system/job/run/${id}`,
    method: 'post',
  })
}
