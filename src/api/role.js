import request from '@/utils/request'

/**
 * 获取角色列表
 */
export const getRoleList = () => {
  return request.get('/system/role/list')
}

/**
 * 新增角色
 */
export const createRole = (data) => {
  return request.post('/system/role', data)
}

/**
 * 更新角色
 */
export const updateRole = (data) => {
  return request.put('/system/role', data)
}

/**
 * 删除角色
 */
export const deleteRole = (id, version) => {
  return request.delete(`/system/role/${id}`, { params: { version } })
}

/**
 * 获取角色已分配的菜单ID列表
 */
export const getRoleMenus = (roleId) => {
  return request.get(`/system/role/${roleId}/menu-ids`)
}

/**
 * 为角色分配菜单
 */
export const assignRoleMenus = (roleId, menuIds) => {
  return request.post(`/system/role/${roleId}/menu-ids`, { menuIds })
}
