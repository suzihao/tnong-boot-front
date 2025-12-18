import request from '@/utils/request'

// ==================== 知识库目录 ====================

/**
 * 获取目录树
 */
export function getCategoryTree() {
  return request({
    url: '/kb/category/tree',
    method: 'get'
  })
}

/**
 * 获取目录详情
 */
export function getCategoryById(id) {
  return request({
    url: `/kb/category/${id}`,
    method: 'get'
  })
}

/**
 * 创建目录
 */
export function createCategory(data) {
  return request({
    url: '/kb/category',
    method: 'post',
    data
  })
}

/**
 * 更新目录
 */
export function updateCategory(id, data) {
  return request({
    url: `/kb/category/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除目录
 */
export function deleteCategory(id) {
  return request({
    url: `/kb/category/${id}`,
    method: 'delete'
  })
}

/**
 * 拖动调整目录层级与排序
 */
export function moveCategory(params) {
  return request({
    url: '/kb/category/move',
    method: 'post',
    params
  })
}

/**
 * 根据目录ID获取文档列表
 */
export function getDocumentList(categoryId) {
  return request({
    url: '/kb/document/list',
    method: 'get',
    params: { categoryId }
  })
}

/**
 * 搜索文档（全文：标题、内容、标签）
 */
export function searchDocument(keyword) {
  return request({
    url: '/kb/document/search',
    method: 'get',
    params: { keyword }
  })
}

/**
 * 获取文档详情
 */
export function getDocumentById(id) {
  return request({
    url: `/kb/document/${id}`,
    method: 'get'
  })
}

/**
 * 创建文档
 */
export function createDocument(data) {
  return request({
    url: '/kb/document',
    method: 'post',
    data
  })
}

/**
 * 更新文档
 */
export function updateDocument(id, data) {
  return request({
    url: `/kb/document/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除文档
 */
export function deleteDocument(id) {
  return request({
    url: `/kb/document/${id}`,
    method: 'delete'
  })
}
