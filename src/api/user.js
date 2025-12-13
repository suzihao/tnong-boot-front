import request from '@/utils/request'

/**
 * 获取用户分页列表
 */
export function getUserPage(params) {
  return request({
    url: '/system/user/page',
    method: 'get',
    params
  })
}

/**
 * 获取用户详情
 */
export function getUserDetail(id) {
  return request({
    url: `/system/user/${id}`,
    method: 'get'
  })
}

/**
 * 新增用户
 */
export function createUser(data) {
  return request({
    url: '/system/user',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export function updateUser(data) {
  return request({
    url: '/system/user',
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request({
    url: `/system/user/${id}`,
    method: 'delete'
  })
}
