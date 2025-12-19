import request from '@/utils/request'

/**
 * 获取菜单树
 */
export const getMenuTree = () => {
  return request.get('/system/menu/tree')
}

/**
 * 新增菜单
 */
export const createMenu = (data) => {
  return request.post('/system/menu', data)
}

/**
 * 更新菜单
 */
export const updateMenu = (data) => {
  return request.put('/system/menu', data)
}

/**
 * 删除菜单
 */
export const deleteMenu = (id, version) => {
  return request.delete(`/system/menu/${id}`, { params: { version } })
}

/**
 * 获取当前用户的菜单和权限
 */
export const getMyMenusAndPerms = () => {
  return request.get('/system/menu/my-routes')
}
