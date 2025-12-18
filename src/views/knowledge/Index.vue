<template>
  <n-card title="知识库" :bordered="false" class="kb-container">
    <n-layout has-sider>
      <n-layout-sider width="260" bordered content-style="padding: 12px 8px;">
        <div class="kb-sider-header">
          <span class="kb-sider-title">目录</span>
          <n-button quaternary size="tiny" @click="handleAddCategory">新建目录</n-button>
        </div>
        <n-tree
          block-line
          :data="categoryTree"
          key-field="id"
          label-field="name"
          children-field="children"
          draggable
          :selected-keys="selectedCategoryId ? [selectedCategoryId] : []"
          :expanded-keys="expandedKeys"
          @update:selected-keys="onCategorySelect"
          @update:expanded-keys="(keys) => (expandedKeys = keys)"
          @drop="handleCategoryDrop"
        />
      </n-layout-sider>

      <n-layout-content content-style="padding: 0 16px;">
        <div class="kb-main">
          <div class="kb-doc-toolbar">
            <n-input
              v-model:value="searchTitle"
              size="small"
              placeholder="搜索文档标题"
              clearable
              @keyup.enter="handleSearch"
            />
            <n-button size="small" type="primary" @click="handleCreateDocument">新建文档</n-button>
          </div>
          
          <div class="kb-doc-list">
            <n-spin :show="docLoading">
              <n-empty v-if="!documents.length" description="暂无文档" />
              <div v-else class="kb-doc-grid">
                <div
                  v-for="doc in documents"
                  :key="doc.id"
                  class="kb-doc-card"
                  @click="handleEditDocument(doc)"
                >
                  <div class="kb-doc-card-header">
                    <div class="kb-doc-card-title">{{ doc.title }}</div>
                    <n-tag size="small" :type="doc.status === 1 ? 'success' : 'warning'">
                      {{ doc.status === 1 ? '已发布' : '草稿' }}
                    </n-tag>
                  </div>
                  <div class="kb-doc-card-meta">
                    <span>浏览 {{ doc.viewCount || 0 }}</span>
                    <span v-if="doc.tags" class="kb-doc-tags">{{ doc.tags }}</span>
                  </div>
                  <div class="kb-doc-card-time">更新于 {{ formatTime(doc.updateTime) }}</div>
                </div>
              </div>
            </n-spin>
          </div>
        </div>
      </n-layout-content>
    </n-layout>

    <n-modal
      v-model:show="showCategoryModal"
      title="新建目录"
      preset="dialog"
      :positive-text="'确定'"
      :negative-text="'取消'"
      @positive-click="handleCategoryConfirm"
    >
      <n-form :model="categoryForm" label-placement="top">
        <n-form-item label="上级目录">
          <n-input :value="currentParentName" disabled />
        </n-form-item>
        <n-form-item label="目录名称">
          <n-input v-model:value="categoryForm.name" placeholder="请输入目录名称" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input
            v-model:value="categoryForm.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="可选：对目录用途进行简要说明"
          />
        </n-form-item>
      </n-form>
    </n-modal>
  </n-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NTree,
  NInput,
  NButton,
  NTag,
  NSpin,
  NEmpty,
  NModal,
  NForm,
  NFormItem
} from 'naive-ui'
import { useMessage } from 'naive-ui'
import { getCategoryTree, getDocumentList, searchDocument, moveCategory, createCategory } from '@/api/knowledge'

const router = useRouter()
const message = useMessage()

const categoryTree = ref([])
const expandedKeys = ref([])
const selectedCategoryId = ref(null)

const documents = ref([])
const docLoading = ref(false)
const searchTitle = ref('')

const showCategoryModal = ref(false)
const categoryForm = ref({
  parentId: null,
  name: '',
  description: ''
})

const currentParentName = computed(() => {
  if (!categoryForm.value.parentId) return '根目录'
  const findNode = (nodes, id) => {
    for (const node of nodes || []) {
      if (node.id === id) return node
      const child = findNode(node.children, id)
      if (child) return child
    }
    return null
  }
  const node = findNode(categoryTree.value, categoryForm.value.parentId)
  return node?.name || '根目录'
})

const buildTree = (list) => {
  const map = {}
  list.forEach((item) => {
    map[item.id] = { ...item, children: [] }
  })
  const tree = []
  list.forEach((item) => {
    const node = map[item.id]
    if (item.parentId && item.parentId !== 0 && map[item.parentId]) {
      map[item.parentId].children.push(node)
    } else {
      tree.push(node)
    }
  })
  return tree
}

const loadCategories = async () => {
  try {
    const res = await getCategoryTree()
    if (res.code === 200) {
      categoryTree.value = buildTree(res.data || [])
      expandedKeys.value = res.data.map((item) => item.id)
      if (!selectedCategoryId.value && res.data.length) {
        selectedCategoryId.value = res.data[0].id
        await loadDocuments()
      }
    }
  } catch (error) {
    message.error('加载目录失败')
  }
}

const onCategorySelect = async (keys) => {
  selectedCategoryId.value = keys[0] || null
  await loadDocuments()
}

const loadDocuments = async () => {
  if (!selectedCategoryId.value) {
    documents.value = []
    return
  }
  docLoading.value = true
  try {
    const res = await getDocumentList(selectedCategoryId.value)
    if (res.code === 200) {
      documents.value = res.data || []
    }
  } catch (error) {
    message.error('加载文档列表失败')
  } finally {
    docLoading.value = false
  }
}

const handleSearch = async () => {
  if (!searchTitle.value) {
    await loadDocuments()
    return
  }
  docLoading.value = true
  try {
    const res = await searchDocument(searchTitle.value)
    if (res.code === 200) {
      documents.value = res.data || []
    }
  } catch (error) {
    message.error('搜索文档失败')
  } finally {
    docLoading.value = false
  }
}

const handleEditDocument = (doc) => {
  router.push({ path: '/knowledge/editor', query: { id: doc.id } })
}

const handleAddCategory = () => {
  categoryForm.value = {
    parentId: selectedCategoryId.value || 0,
    name: '',
    description: ''
  }
  showCategoryModal.value = true
}

const handleCreateDocument = () => {
  if (!selectedCategoryId.value) {
    message.warning('请先选择左侧目录')
    return
  }
  router.push({ path: '/knowledge/editor', query: { categoryId: selectedCategoryId.value } })
}

const handleCategoryConfirm = async () => {
  if (!categoryForm.value.name) {
    message.warning('请输入目录名称')
    return false
  }
  try {
    await createCategory({
      parentId: categoryForm.value.parentId || 0,
      name: categoryForm.value.name,
      description: categoryForm.value.description,
      status: 1
    })
    message.success('创建成功')
    showCategoryModal.value = false
    await loadCategories()
  } catch (error) {
    message.error('创建目录失败')
    return false
  }
}

const handleCategoryDrop = async ({ node, dragNode, dropPosition }) => {
  const target = node || dragNode
  const dragged = dragNode
  if (!target || !dragged) return

  let parentId
  let sort = 0

  if (dropPosition === 0) {
    // 放入目标节点内部，作为其子节点，排在最后
    parentId = target.id
    const children = (target.children || [])
    sort = (children[children.length - 1]?.sort || children.length) + 1
  } else {
    // 放在目标节点前后，父级与目标相同
    parentId = target.parentId || 0
    const siblings = (categoryTree.value || []).filter((item) => item.parentId === parentId)
    const index = siblings.findIndex((item) => item.id === target.id)
    const baseIndex = dropPosition < 0 ? index - 1 : index + 1
    sort = baseIndex >= 0 ? baseIndex : 0
  }

  try {
    await moveCategory({ id: dragged.id, parentId, sort })
    message.success('目录已调整')
    await loadCategories()
  } catch (error) {
    message.error('调整目录失败')
  }
}

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

onMounted(async () => {
  await loadCategories()
})
</script>

<style scoped>
.kb-container {
  min-height: calc(100vh - 120px);
  background-color: #fff;
  padding: 16px;
  box-sizing: border-box;
}

.kb-main {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.kb-sider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.kb-sider-title {
  font-weight: 600;
}

.kb-doc-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.kb-doc-list {
  flex: 1;
  overflow: auto;
}

.kb-doc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 4px;
}

.kb-doc-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.kb-doc-card:hover {
  border-color: rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
  transform: translateY(-2px);
}

.kb-doc-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.kb-doc-card-title {
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.kb-doc-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.kb-doc-tags {
  color: #666;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.kb-doc-card-time {
  font-size: 12px;
  color: #bbb;
}
</style>