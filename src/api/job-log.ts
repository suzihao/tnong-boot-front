import request from '@/utils/request'

import type { ApiResponse } from '@/utils/request'

// 任务执行日志
export interface JobLog {
  id?: number
  jobId?: number
  jobName?: string
  jobGroup?: string
  invokeTarget?: string
  jobMessage?: string
  status?: number
  exceptionInfo?: string
  startTime?: string
  endTime?: string
  duration?: number
  createdTime?: string
}

// 分页查询参数
export interface JobLogPageParams {
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

/**
 * 分页查询任务日志列表
 */
export function getJobLogPage(params: JobLogPageParams) {
  return request<ApiResponse<PageResponse<JobLog>>>({
    url: '/system/job-log/page',
    method: 'get',
    params,
  })
}

/**
 * 根据ID查询任务日志详情
 */
export function getJobLogById(id: number) {
  return request<ApiResponse<JobLog>>({
    url: `/system/job-log/${id}`,
    method: 'get',
  })
}
