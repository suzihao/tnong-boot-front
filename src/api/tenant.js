import request from '@/utils/request'

/**
 * 分页查询租户列表
 */
export const getTenantPage = (params) => {
  return request.get('/system/tenant/page', { params })
}

/**
 * 根据ID查询租户详情
 */
export const getTenantById = (id) => {
  return request.get(`/system/tenant/${id}`)
}

/**
 * 新增租户
 */
export const createTenant = (data) => {
  return request.post('/system/tenant', data)
}

/**
 * 更新租户
 */
export const updateTenant = (data) => {
  return request.put('/system/tenant', data)
}

/**
 * 删除租户
 */
export const deleteTenant = (id, version) => {
  return request.delete(`/system/tenant/${id}`, { params: { version } })
}
