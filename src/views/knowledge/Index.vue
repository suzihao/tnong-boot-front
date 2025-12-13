<template>
  <div class="knowledge-container">
    <el-container>
      <!-- 左侧目录树 -->
      <el-aside width="280px" class="category-aside">
        <div class="category-header">
          <el-input
            v-model="searchText"
            placeholder="搜索文档"
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
          <el-button type="primary" :icon="Plus" @click="handleAddCategory" style="margin-top: 10px;" class="add-btn">
            新建目录
          </el-button>
        </div>
        
        <el-tree
          ref="treeRef"
          :data="categoryTree"
          :props="treeProps"
          node-key="id"
          highlight-current
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span>
                <el-icon v-if="data.icon"><component :is="data.icon" /></el-icon>
                <span>{{ node.label }}</span>
              </span>
              <span class="node-actions">
                <el-button type="primary" link :icon="Plus" size="small" @click.stop="handleAddSubCategory(data)">
                  子目录
                </el-button>
                <el-button type="primary" link :icon="Edit" size="small" @click.stop="handleEditCategory(data)">
                  编辑
                </el-button>
                <el-button type="danger" link :icon="Delete" size="small" @click.stop="handleDeleteCategory(data)">
                  删除
                </el-button>
              </span>
            </span>
          </template>
        </el-tree>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-main class="main-content">
        <!-- 文档列表 -->
        <div v-if="!currentDocument" class="document-list">
          <div class="list-header">
            <h3>{{ currentCategory ? currentCategory.name : '全部文档' }}</h3>
            <el-button type="primary" :icon="Plus" @click="handleAddDocument">
              新建文档
            </el-button>
          </div>
          
          <el-table :data="documentList" style="width: 100%">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="tags" label="标签" width="200" />
            <el-table-column prop="viewCount" label="浏览次数" width="100" />
            <el-table-column prop="updatedTime" label="更新时间" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link :icon="View" @click="handleViewDocument(row)">查看</el-button>
                <el-button type="primary" link :icon="Edit" @click="handleEditDocument(row)">编辑</el-button>
                <el-button type="danger" link :icon="Delete" @click="handleDeleteDocument(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 文档编辑/查看 -->
        <div v-else class="document-editor">
          <!-- 编辑模式 -->
          <div v-if="editMode" class="edit-mode">
            <div class="editor-header">
              <el-button :icon="ArrowLeft" @click="handleCancelEdit">返回</el-button>
              <div class="header-center">
                <h3>{{ documentForm.title || '未命名文档' }}</h3>
              </div>
              <div class="editor-actions">
                <el-button @click="handleCancelEdit">取消</el-button>
                <el-button type="primary" :icon="Check" @click="handleSaveDocument">保存</el-button>
              </div>
            </div>
            
            <div class="editor-container">
              <!-- 左侧：元数据表单 -->
              <div class="editor-sidebar">
                <el-form :model="documentForm" label-position="top" size="small">
                  <el-form-item label="文档标题">
                    <el-input v-model="documentForm.title" placeholder="请输入文档标题" />
                  </el-form-item>
                  <el-form-item label="所属目录">
                    <el-tree-select
                      v-model="documentForm.categoryId"
                      :data="categoryTree"
                      :props="treeProps"
                      placeholder="请选择目录"
                      check-strictly
                    />
                  </el-form-item>
                  <el-form-item label="标签">
                    <el-input v-model="documentForm.tags" placeholder="多个标签用逗号分隔" />
                  </el-form-item>
                  <el-form-item label="排序">
                    <el-input-number v-model="documentForm.sort" :min="0" style="width: 100%" />
                  </el-form-item>
                  <el-form-item label="状态">
                    <el-radio-group v-model="documentForm.status">
                      <el-radio :value="0">草稿</el-radio>
                      <el-radio :value="1">已发布</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-form>
              </div>
              
              <!-- 右侧：Vditor 编辑器 -->
              <div class="editor-main">
                <div id="vditor"></div>
              </div>
            </div>
          </div>
          
          <!-- 查看模式 -->
          <div v-else class="view-mode">
            <div class="view-header">
              <el-button :icon="ArrowLeft" @click="currentDocument = null">返回</el-button>
              <el-button type="primary" :icon="Edit" @click="enterEditMode">编辑</el-button>
            </div>
            
            <div class="view-content">
              <div class="article-header">
                <h1 class="article-title">{{ currentDocument.title }}</h1>
                <div class="article-meta">
                  <el-tag v-if="currentDocument.status === 0" type="info" size="small">草稿</el-tag>
                  <el-tag v-else type="success" size="small">已发布</el-tag>
                  <span v-if="currentDocument.tags" class="meta-item">
                    <el-icon><PriceTag /></el-icon>
                    {{ currentDocument.tags }}
                  </span>
                  <span class="meta-item">
                    <el-icon><View /></el-icon>
                    {{ currentDocument.viewCount }} 次浏览
                  </span>
                  <span class="meta-item">
                    <el-icon><Clock /></el-icon>
                    {{ currentDocument.updatedTime }}
                  </span>
                </div>
              </div>
              
              <el-divider />
              
              <div class="article-body vditor-reset" v-html="renderedHtml"></div>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>

    <!-- 目录编辑对话框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="categoryForm.id ? '编辑目录' : '新建目录'"
      width="500px"
    >
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="目录名称">
          <el-input v-model="categoryForm.name" placeholder="请输入目录名称" />
        </el-form-item>
        <el-form-item label="父目录">
          <el-tree-select
            v-model="categoryForm.parentId"
            :data="categoryTree"
            :props="treeProps"
            placeholder="请选择父目录（不选则为根目录）"
            check-strictly
            clearable
          />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="categoryForm.icon" placeholder="图标名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="categoryForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, View, ArrowLeft, Check, PriceTag, Clock } from '@element-plus/icons-vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import {
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  getDocumentList,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  searchDocument
} from '@/api/knowledge'

// 目录相关
const categoryTree = ref([])
const currentCategory = ref(null)
const categoryDialogVisible = ref(false)
const categoryForm = ref({
  id: null,
  parentId: null,
  name: '',
  icon: '',
  sort: 0,
  description: '',
  version: 0
})

const treeProps = {
  children: 'children',
  label: 'name'
}

// 文档相关
const documentList = ref([])
const currentDocument = ref(null)
const editMode = ref(false)
const documentForm = ref({
  id: null,
  categoryId: null,
  title: '',
  content: '',
  tags: '',
  sort: 0,
  status: 1,
  version: 0
})

// Vditor 编辑器实例
let vditor = null

// 渲染后的 HTML
const renderedHtml = ref('')

// 搜索
const searchText = ref('')

// 加载目录树
const loadCategoryTree = async () => {
  try {
    const res = await getCategoryTree()
    categoryTree.value = buildTree(res.data)
  } catch (error) {
    ElMessage.error('加载目录失败')
  }
}

// 构建树形结构
const buildTree = (list) => {
  const map = {}
  const tree = []
  
  list.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })
  
  list.forEach(item => {
    if (item.parentId === 0) {
      tree.push(map[item.id])
    } else if (map[item.parentId]) {
      map[item.parentId].children.push(map[item.id])
    }
  })
  
  return tree
}

// 加载文档列表
const loadDocumentList = async (categoryId) => {
  try {
    const res = await getDocumentList(categoryId)
    documentList.value = res.data
  } catch (error) {
    ElMessage.error('加载文档失败')
  }
}

// 搜索文档
const handleSearch = async () => {
  if (!searchText.value.trim()) {
    if (currentCategory.value) {
      loadDocumentList(currentCategory.value.id)
    }
    return
  }
  
  try {
    const res = await searchDocument(searchText.value)
    documentList.value = res.data
  } catch (error) {
    ElMessage.error('搜索失败')
  }
}

// 点击目录节点
const handleNodeClick = (data) => {
  currentCategory.value = data
  currentDocument.value = null
  loadDocumentList(data.id)
}

// 新建根目录
const handleAddCategory = () => {
  categoryForm.value = {
    id: null,
    parentId: null,
    name: '',
    icon: '',
    sort: 0,
    description: '',
    version: 0
  }
  categoryDialogVisible.value = true
}

// 新建子目录
const handleAddSubCategory = (data) => {
  categoryForm.value = {
    id: null,
    parentId: data.id,
    name: '',
    icon: '',
    sort: 0,
    description: '',
    version: 0
  }
  categoryDialogVisible.value = true
}

// 编辑目录
const handleEditCategory = (data) => {
  categoryForm.value = { ...data }
  categoryDialogVisible.value = true
}

// 保存目录
const handleSaveCategory = async () => {
  try {
    if (categoryForm.value.id) {
      await updateCategory(categoryForm.value.id, categoryForm.value)
      ElMessage.success('更新成功')
    } else {
      await createCategory(categoryForm.value)
      ElMessage.success('创建成功')
    }
    categoryDialogVisible.value = false
    loadCategoryTree()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 删除目录
const handleDeleteCategory = async (data) => {
  try {
    await ElMessageBox.confirm('确定要删除这个目录吗？', '提示', {
      type: 'warning'
    })
    await deleteCategory(data.id)
    ElMessage.success('删除成功')
    loadCategoryTree()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 新建文档
const handleAddDocument = async () => {
  documentForm.value = {
    id: null,
    categoryId: currentCategory.value?.id,
    title: '',
    content: '',
    tags: '',
    sort: 0,
    status: 1,
    version: 0
  }
  currentDocument.value = {}
  editMode.value = true
  
  await nextTick()
  initVditor()
}

// 查看文档
const handleViewDocument = async (row) => {
  try {
    const res = await getDocumentById(row.id)
    currentDocument.value = res.data
    editMode.value = false
    
    // 渲染 Markdown
    if (res.data.content) {
      const previewElement = document.createElement('div')
      Vditor.preview(previewElement, res.data.content, {
        mode: 'light',
        after() {
          renderedHtml.value = previewElement.innerHTML
        }
      })
    } else {
      renderedHtml.value = ''
    }
  } catch (error) {
    ElMessage.error('加载文档失败')
  }
}

// 编辑文档
const handleEditDocument = async (row) => {
  try {
    const res = await getDocumentById(row.id)
    currentDocument.value = res.data
    documentForm.value = { ...res.data }
    editMode.value = true
    
    await nextTick()
    initVditor()
  } catch (error) {
    ElMessage.error('加载文档失败')
  }
}

// 从查看模式进入编辑模式
const enterEditMode = async () => {
  documentForm.value = { ...currentDocument.value }
  editMode.value = true
  
  await nextTick()
  initVditor()
}

// 保存文档
const handleSaveDocument = async () => {
  try {
    // 从 Vditor 获取内容
    if (vditor) {
      documentForm.value.content = vditor.getValue()
    }
    
    if (documentForm.value.id) {
      await updateDocument(documentForm.value.id, documentForm.value)
      ElMessage.success('更新成功')
    } else {
      await createDocument(documentForm.value)
      ElMessage.success('创建成功')
    }
    
    // 销毁编辑器
    destroyVditor()
    
    currentDocument.value = null
    editMode.value = false
    if (currentCategory.value) {
      loadDocumentList(currentCategory.value.id)
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 删除文档
const handleDeleteDocument = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文档吗？', '提示', {
      type: 'warning'
    })
    await deleteDocument(row.id)
    ElMessage.success('删除成功')
    if (currentCategory.value) {
      loadDocumentList(currentCategory.value.id)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 取消编辑
const handleCancelEdit = () => {
  destroyVditor()
  editMode.value = false
  if (!documentForm.value.id) {
    currentDocument.value = null
  }
}

// 初始化 Vditor 编辑器
const initVditor = () => {
  destroyVditor()
  
  vditor = new Vditor('vditor', {
    height: 'calc(100vh - 280px)',
    placeholder: '请输入文档内容，支持 Markdown 语法...',
    theme: 'classic',
    mode: 'ir', // 即时渲染模式
    toolbarConfig: {
      pin: true
    },
    cache: {
      enable: false
    },
    after: () => {
      vditor.setValue(documentForm.value.content || '')
    },
    toolbar: [
      'emoji',
      'headings',
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'list',
      'ordered-list',
      'check',
      'outdent',
      'indent',
      '|',
      'quote',
      'line',
      'code',
      'inline-code',
      'insert-before',
      'insert-after',
      '|',
      'upload',
      'table',
      '|',
      'undo',
      'redo',
      '|',
      'fullscreen',
      'edit-mode',
      {
        name: 'more',
        toolbar: [
          'both',
          'code-theme',
          'content-theme',
          'export',
          'outline',
          'preview',
          'devtools',
          'info',
          'help'
        ]
      }
    ]
  })
}

// 销毁 Vditor 编辑器
const destroyVditor = () => {
  if (vditor) {
    vditor.destroy()
    vditor = null
  }
}

onMounted(() => {
  loadCategoryTree()
})

onBeforeUnmount(() => {
  destroyVditor()
})
</script>

<style scoped>
.knowledge-container {
  height: calc(100vh - 60px);
  padding: 0;
  background: #f7f8fa;
}

.category-aside {
  background: #fff;
  border-right: 1px solid #e8eaed;
  padding: 16px 12px;
  overflow-y: auto;
}

.category-header {
  margin-bottom: 16px;
  padding: 0 4px;
}

.add-btn {
  width: 100%;
  border-radius: 6px;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.custom-tree-node:hover {
  background: #f5f7fa;
}

.node-actions {
  display: none;
}

.custom-tree-node:hover .node-actions {
  display: inline-block;
}

.main-content {
  background: transparent;
  padding: 0;
  overflow-y: auto;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 8px;
}

.document-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

/* 编辑模式 */
.edit-mode {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid #e8eaed;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-center {
  flex: 1;
  text-align: center;
  padding: 0 20px;
}

.header-center h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.editor-container {
  display: flex;
  gap: 0;
  height: calc(100% - 60px);
  background: #fafbfc;
}

.editor-sidebar {
  width: 280px;
  padding: 20px 16px;
  background: #fff;
  border-right: 1px solid #e8eaed;
  overflow-y: auto;
}

.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}

#vditor {
  height: 100%;
}

/* 查看模式 - 参考语雀风格 */
.view-mode {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid #e8eaed;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
}

.view-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: #fafbfc;
}

.article-header {
  max-width: 1024px;
  margin: 0 auto;
  padding: 48px 64px 32px;
  background: #fff;
}

.article-title {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.4;
  color: #262626;
  margin: 0 0 24px 0;
  letter-spacing: -0.02em;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #8c8c8c;
  font-size: 14px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.article-body {
  max-width: 1024px;
  margin: 0 auto;
  padding: 32px 64px 80px;
  min-height: 500px;
  background: #fff;
  box-shadow: 0 -1px 0 0 #f0f0f0;
}

/* Vditor 样式覆盖 */
.article-body :deep(.vditor-reset) {
  font-size: 16px;
  line-height: 1.75;
  color: #262626;
}

.article-body :deep(.vditor-reset h1) {
  font-size: 28px;
  font-weight: 600;
  margin: 32px 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #262626;
}

.article-body :deep(.vditor-reset h2) {
  font-size: 24px;
  font-weight: 600;
  margin: 28px 0 14px;
  color: #262626;
}

.article-body :deep(.vditor-reset h3) {
  font-size: 20px;
  font-weight: 600;
  margin: 24px 0 12px;
  color: #262626;
}

.article-body :deep(.vditor-reset p) {
  margin: 16px 0;
  line-height: 1.75;
}

.article-body :deep(.vditor-reset blockquote) {
  margin: 16px 0;
  padding: 16px 20px;
  background: #fafafa;
  border-left: 4px solid #0084ff;
  color: #595959;
  border-radius: 2px;
}

.article-body :deep(.vditor-reset code) {
  background: #f5f5f5;
  padding: 3px 8px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #d73a49;
  border: 1px solid #e8e8e8;
}

.article-body :deep(.vditor-reset pre) {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 16px 0;
  border: 1px solid #e8eaed;
}

.article-body :deep(.vditor-reset pre code) {
  background: none;
  padding: 0;
  border: none;
  color: inherit;
}

.article-body :deep(.vditor-reset table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  font-size: 14px;
}

.article-body :deep(.vditor-reset th),
.article-body :deep(.vditor-reset td) {
  border: 1px solid #e8eaed;
  padding: 12px 16px;
  text-align: left;
}

.article-body :deep(.vditor-reset th) {
  background: #fafafa;
  font-weight: 600;
  color: #262626;
}

.article-body :deep(.vditor-reset tr:hover) {
  background: #fafbfc;
}

.article-body :deep(.vditor-reset img) {
  max-width: 100%;
  border-radius: 4px;
  margin: 24px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.article-body :deep(.vditor-reset a) {
  color: #0084ff;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.article-body :deep(.vditor-reset a:hover) {
  border-bottom-color: #0084ff;
}

.article-body :deep(.vditor-reset ul),
.article-body :deep(.vditor-reset ol) {
  padding-left: 28px;
  margin: 16px 0;
}

.article-body :deep(.vditor-reset li) {
  margin: 8px 0;
  line-height: 1.75;
}

.article-body :deep(.vditor-reset hr) {
  border: none;
  border-top: 1px solid #e8eaed;
  margin: 32px 0;
}

/* 滚动条美化 */
.category-aside::-webkit-scrollbar,
.view-content::-webkit-scrollbar {
  width: 6px;
}

.category-aside::-webkit-scrollbar-thumb,
.view-content::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.category-aside::-webkit-scrollbar-thumb:hover,
.view-content::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

.category-aside::-webkit-scrollbar-track,
.view-content::-webkit-scrollbar-track {
  background: transparent;
}
</style>
