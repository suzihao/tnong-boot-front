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
          <div class="editor-header">
            <el-button :icon="ArrowLeft" @click="currentDocument = null">返回</el-button>
            <div class="editor-actions">
              <el-button v-if="editMode" @click="handleCancelEdit">取消</el-button>
              <el-button v-if="!editMode" type="primary" :icon="Edit" @click="editMode = true">编辑</el-button>
              <el-button v-if="editMode" type="primary" :icon="Check" @click="handleSaveDocument">保存</el-button>
            </div>
          </div>
          
          <div v-if="editMode" class="edit-form">
            <el-form :model="documentForm" label-width="80px">
              <el-form-item label="标题">
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
              <el-form-item label="内容">
                <el-input
                  v-model="documentForm.content"
                  type="textarea"
                  :rows="20"
                  placeholder="支持 Markdown 格式"
                />
              </el-form-item>
            </el-form>
          </div>
          
          <div v-else class="view-content">
            <h1>{{ currentDocument.title }}</h1>
            <div class="doc-meta">
              <span>标签: {{ currentDocument.tags || '无' }}</span>
              <span>浏览: {{ currentDocument.viewCount }}</span>
              <span>更新: {{ currentDocument.updatedTime }}</span>
            </div>
            <el-divider />
            <div class="markdown-body" v-html="renderedMarkdown"></div>
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, View, ArrowLeft, Check } from '@element-plus/icons-vue'
import { marked } from 'marked'
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

// 搜索
const searchText = ref('')

// Markdown 渲染
const renderedMarkdown = computed(() => {
  if (!currentDocument.value?.content) return ''
  return marked(currentDocument.value.content)
})

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
const handleAddDocument = () => {
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
}

// 查看文档
const handleViewDocument = async (row) => {
  try {
    const res = await getDocumentById(row.id)
    currentDocument.value = res.data
    editMode.value = false
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
  } catch (error) {
    ElMessage.error('加载文档失败')
  }
}

// 保存文档
const handleSaveDocument = async () => {
  try {
    if (documentForm.value.id) {
      await updateDocument(documentForm.value.id, documentForm.value)
      ElMessage.success('更新成功')
    } else {
      await createDocument(documentForm.value)
      ElMessage.success('创建成功')
    }
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
  editMode.value = false
  if (!documentForm.value.id) {
    currentDocument.value = null
  }
}

onMounted(() => {
  loadCategoryTree()
})
</script>

<style scoped>
.knowledge-container {
  height: calc(100vh - 60px);
  padding: 20px;
}

.category-aside {
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 20px;
  overflow-y: auto;
}

.category-header {
  margin-bottom: 20px;
}

.add-btn {
  width: 100%;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 10px;
}

.node-actions {
  display: none;
}

.custom-tree-node:hover .node-actions {
  display: inline-block;
}

.main-content {
  background: #fff;
  padding: 20px;
  overflow-y: auto;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.editor-actions {
  display: flex;
  gap: 10px;
}

.view-content h1 {
  margin-bottom: 10px;
}

.doc-meta {
  color: #999;
  font-size: 14px;
  display: flex;
  gap: 20px;
}

.markdown-body {
  line-height: 1.8;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  margin-top: 24px;
  margin-bottom: 16px;
}

.markdown-body code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
}

.markdown-body pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}
</style>
