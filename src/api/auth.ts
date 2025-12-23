import request from '@/utils/request'
import type { ApiResponse } from '@/utils/request'

// 登录表单
export interface LoginForm {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  token: string
  userId: number
  username: string
  nickname: string
  tenantId: number
  avatar?: string
}

// 账号密码登录
export function login(data: LoginForm) {
  return request<ApiResponse<LoginResponse>>({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post',
  })
}

// 企业微信登录回调
export function wecomCallback(code: string) {
  return request<ApiResponse<LoginResponse>>({
    url: '/auth/wecom/callback',
    method: 'get',
    params: { code },
  })
}
