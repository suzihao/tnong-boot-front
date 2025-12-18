import request from '@/utils/request'

/**
 * 分页查询用户列表
 */
export const getUserPage = (params) => {
  return request.get('/system/user/page', { params })
}

/**
 * 根据ID查询用户详情
 */
export const getUserById = (id) => {
  return request.get(`/system/user/${id}`)
}

/**
 * 新增用户
 */
export const createUser = (data) => {
  return request.post('/system/user', data)
}

/**
 * 更新用户
 */
export const updateUser = (data) => {
  return request.put('/system/user', data)
}

/**
 * 删除用户
 */
export const deleteUser = (id, version) => {
  return request.delete(`/system/user/${id}`, { params: { version } })
}
