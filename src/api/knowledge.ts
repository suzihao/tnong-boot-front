import request from '@/utils/request'

import type { ApiResponse } from '@/utils/request'

// 知识库目录
export interface KnowledgeCategory {
  id: number
  parentId: number
  name: string
  description?: string
  sort: number
  status: number
  createdTime?: string
  updatedTime?: string
  children?: KnowledgeCategory[]
}

// 知识库文档
export interface KnowledgeDocument {
  id: number
  categoryId: number
  title: string
  content?: string
  tags?: string
  status: number
  viewCount?: number
  createdTime?: string
  updatedTime?: string
  updateTime?: string
}

// 目录表单
export interface CategoryForm {
  id?: number
  parentId: number
  name: string
  description?: string
  status: number
}

// 文档表单
export interface DocumentForm {
  id?: number
  categoryId: number
  title: string
  content?: string
  tags?: string
  status: number
}

/**
 * 获取目录树
 */
export function getCategoryTree() {
  return request<ApiResponse<KnowledgeCategory[]>>({
    url: '/kb/category/tree',
    method: 'get',
  })
}

/**
 * 获取目录详情
 */
export function getCategoryById(id: number) {
  return request<ApiResponse<KnowledgeCategory>>({
    url: `/kb/category/${id}`,
    method: 'get',
  })
}

/**
 * 创建目录
 */
export function createCategory(data: CategoryForm) {
  return request<ApiResponse<KnowledgeCategory>>({
    url: '/kb/category',
    method: 'post',
    data,
  })
}

/**
 * 更新目录
 */
export function updateCategory(id: number, data: CategoryForm) {
  return request<ApiResponse<KnowledgeCategory>>({
    url: `/kb/category/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除目录
 */
export function deleteCategory(id: number) {
  return request<ApiResponse<void>>({
    url: `/kb/category/${id}`,
    method: 'delete',
  })
}

/**
 * 拖动调整目录层级与排序
 */
export function moveCategory(params: { id: number; parentId: number; sort: number }) {
  return request<ApiResponse<void>>({
    url: '/kb/category/move',
    method: 'post',
    params,
  })
}

/**
 * 根据目录ID获取文档列表
 */
export function getDocumentList(categoryId: number) {
  return request<ApiResponse<KnowledgeDocument[]>>({
    url: '/kb/document/list',
    method: 'get',
    params: { categoryId },
  })
}

/**
 * 搜索文档（全文：标题、内容、标签）
 */
export function searchDocument(keyword: string) {
  return request<ApiResponse<KnowledgeDocument[]>>({
    url: '/kb/document/search',
    method: 'get',
    params: { keyword },
  })
}

/**
 * 获取文档详情
 */
export function getDocumentById(id: number) {
  return request<ApiResponse<KnowledgeDocument>>({
    url: `/kb/document/${id}`,
    method: 'get',
  })
}

/**
 * 创建文档
 */
export function createDocument(data: DocumentForm) {
  return request<ApiResponse<KnowledgeDocument>>({
    url: '/kb/document',
    method: 'post',
    data,
  })
}

/**
 * 更新文档
 */
export function updateDocument(id: number, data: DocumentForm) {
  return request<ApiResponse<KnowledgeDocument>>({
    url: `/kb/document/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除文档
 */
export function deleteDocument(id: number) {
  return request<ApiResponse<void>>({
    url: `/kb/document/${id}`,
    method: 'delete',
  })
}
