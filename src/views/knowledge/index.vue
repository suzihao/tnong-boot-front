<script setup lang="ts">
import {
  NCard,
  NTree,
  NInput,
  NButton,
  NTag,
  NSpin,
  NEmpty,
  NModal,
  NForm,
  NFormItem,
  NDropdown,
  useMessage,
  useDialog,
  type TreeDropInfo,
  type DropdownOption,
} from 'naive-ui'
import { ref, onMounted, computed, h, nextTick } from 'vue'
import { useRouter } from 'vue-router'

import { ScrollContainer } from '@/components'
import {
  getCategoryTree,
  getDocumentList,
  searchDocument,
  moveCategory,
  createCategory,
  deleteCategory,
  type KnowledgeCategory,
  type KnowledgeDocument,
} from '@/api/knowledge'

defineOptions({
  name: 'KnowledgeIndex',
})

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const categoryTree = ref<KnowledgeCategory[]>([])
const expandedKeys = ref<number[]>([])
const selectedCategoryId = ref<number | null>(null)

const documents = ref<KnowledgeDocument[]>([])
const docLoading = ref(false)
const searchTitle = ref('')

const showCategoryModal = ref(false)
const categoryForm = ref({
  parentId: 0,
  name: '',
  description: '',
})

// 右键菜单相关
const showDropdown = ref(false)
const dropdownX = ref(0)
const dropdownY = ref(0)
const contextMenuCategoryId = ref<number | null>(null)

const dropdownOptions = computed<DropdownOption[]>(() => [
  {
    label: '删除目录',
    key: 'delete',
    props: {
      onClick: handleDeleteCategory,
    },
  },
])

const currentParentName = computed(() => {
  if (!categoryForm.value.parentId) return '根目录'
  const findNode = (nodes: KnowledgeCategory[], id: number): KnowledgeCategory | null => {
    for (const node of nodes || []) {
      if (node.id === id) return node
      const child = findNode(node.children || [], id)
      if (child) return child
    }
    return null
  }
  const node = findNode(categoryTree.value, categoryForm.value.parentId)
  return node?.name || '根目录'
})

const buildTree = (list: KnowledgeCategory[]): KnowledgeCategory[] => {
  const map: Record<number, KnowledgeCategory> = {}
  list.forEach((item) => {
    map[item.id] = { ...item, children: [] }
  })
  const tree: KnowledgeCategory[] = []
  list.forEach((item) => {
    const node = map[item.id]
    if (item.parentId && item.parentId !== 0 && map[item.parentId]) {
      map[item.parentId].children!.push(node)
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
      expandedKeys.value = (res.data || []).map((item) => item.id)
      if (!selectedCategoryId.value && res.data && res.data.length) {
        selectedCategoryId.value = res.data[0].id
        await loadDocuments()
      }
    }
  } catch (error) {
    message.error('加载目录失败')
  }
}

const onCategorySelect = async (keys: Array<string | number>) => {
  selectedCategoryId.value = (keys[0] as number) || null
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

const handleEditDocument = (doc: KnowledgeDocument) => {
  router.push({ name: 'knowledgeEditor', params: { id: String(doc.id) } })
}

const handleAddCategory = () => {
  categoryForm.value = {
    parentId: selectedCategoryId.value || 0,
    name: '',
    description: '',
  }
  showCategoryModal.value = true
}

const handleCreateDocument = () => {
  if (!selectedCategoryId.value) {
    message.warning('请先选择左侧目录')
    return
  }
  router.push({
    name: 'knowledgeEditor',
    query: { categoryId: String(selectedCategoryId.value) },
  })
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
      status: 1,
    })
    message.success('创建成功')
    showCategoryModal.value = false
    await loadCategories()
    return true
  } catch (error) {
    message.error('创建目录失败')
    return false
  }
}

const handleCategoryDrop = async (info: TreeDropInfo) => {
  const { node, dragNode, dropPosition } = info
  const target = node || dragNode
  const dragged = dragNode
  if (!target || !dragged) return

  let parentId: number
  let sort = 0

  if (dropPosition === 'inside') {
    parentId = target.id as number
    const children = (target.children || []) as KnowledgeCategory[]
    sort = (children[children.length - 1]?.sort || children.length) + 1
  } else {
    parentId = (target.parentId as number) || 0
    const siblings = (categoryTree.value || []).filter((item) => item.parentId === parentId)
    const index = siblings.findIndex((item) => item.id === target.id)
    const baseIndex = dropPosition === 'before' ? index - 1 : index + 1
    sort = baseIndex >= 0 ? baseIndex : 0
  }

  try {
    await moveCategory({ id: dragged.id as number, parentId, sort })
    message.success('目录已调整')
    await loadCategories()
  } catch (error) {
    message.error('调整目录失败')
  }
}

const formatTime = (time?: string) => {
  if (!time) return '-'
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

// 处理目录右键菜单
const handleCategoryContextMenu = (e: MouseEvent, node: KnowledgeCategory) => {
  e.preventDefault()
  showDropdown.value = false
  nextTick(() => {
    showDropdown.value = true
    dropdownX.value = e.clientX
    dropdownY.value = e.clientY
    contextMenuCategoryId.value = node.id
  })
}

// 自定义渲染树节点标签
const renderTreeLabel = ({ option }: { option: KnowledgeCategory }) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      },
      onContextmenu: (e: MouseEvent) => handleCategoryContextMenu(e, option),
    },
    option.name
  )
}

// 关闭右键菜单
const handleClickOutside = () => {
  showDropdown.value = false
}

// 删除目录
const handleDeleteCategory = () => {
  if (!contextMenuCategoryId.value) return

  dialog.warning({
    title: '确认删除',
    content: '确定要删除这个目录吗？删除后无法恢复。',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = await deleteCategory(contextMenuCategoryId.value!)
        if (res.code === 200) {
          message.success('删除成功')
          // 如果删除的是当前选中的目录，清空选中状态
          if (selectedCategoryId.value === contextMenuCategoryId.value) {
            selectedCategoryId.value = null
            documents.value = []
          }
          await loadCategories()
        }
      } catch (error) {
        message.error('删除失败')
      }
    },
  })
}

onMounted(async () => {
  await loadCategories()
})
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-2">
    <NCard class="flex-1" content-class="flex flex-col">
      <!-- 顶部搜索和按钮 -->
      <div class="mb-2 flex justify-between gap-x-4 max-xl:mb-4 max-xl:flex-wrap">
        <NInput
          v-model:value="searchTitle"
          placeholder="全文检索"
          clearable
          style="width: 300px"
          @keyup.enter="handleSearch"
        />
        <div class="flex gap-2">
          <NButton type="success" @click="handleAddCategory">
            <template #icon>
              <span class="iconify ph--plus-circle" />
            </template>
            新建目录
          </NButton>
          <NButton type="primary" @click="handleCreateDocument">
            <template #icon>
              <span class="iconify ph--plus-circle" />
            </template>
            新建文档
          </NButton>
        </div>
      </div>

      <!-- 主体内容区域 -->
      <div class="flex flex-1 gap-4 overflow-hidden">
        <!-- 左侧目录树 -->
        <div class="kb-sidebar">
          <NTree
            block-line
            :data="categoryTree"
            key-field="id"
            label-field="name"
            children-field="children"
            draggable
            :selected-keys="selectedCategoryId ? [selectedCategoryId] : []"
            :expanded-keys="expandedKeys"
            :render-label="renderTreeLabel"
            @update:selected-keys="onCategorySelect"
            @update:expanded-keys="(keys) => (expandedKeys = keys as number[])"
            @drop="handleCategoryDrop"
          />
        </div>

        <!-- 右键菜单 -->
        <NDropdown
          placement="bottom-start"
          trigger="manual"
          :x="dropdownX"
          :y="dropdownY"
          :options="dropdownOptions"
          :show="showDropdown"
          :on-clickoutside="handleClickOutside"
        />

        <!-- 右侧文档列表 -->
        <div class="kb-content">
          <NSpin :show="docLoading">
            <NEmpty v-if="!documents.length" description="暂无文档" />
            <div v-else class="kb-doc-grid">
              <div
                v-for="doc in documents"
                :key="doc.id"
                class="kb-doc-card"
                @click="handleEditDocument(doc)"
              >
                <div class="kb-doc-card-header">
                  <div class="kb-doc-card-title">{{ doc.title }}</div>
                  <NTag size="small" :type="doc.status === 1 ? 'success' : 'warning'">
                    {{ doc.status === 1 ? '已发布' : '草稿' }}
                  </NTag>
                </div>
                <div class="kb-doc-card-meta">
                  <span>浏览 {{ doc.viewCount || 0 }}</span>
                  <span v-if="doc.tags" class="kb-doc-tags">{{ doc.tags }}</span>
                </div>
                <div class="kb-doc-card-time">
                  更新于 {{ formatTime(doc.updateTime || doc.updatedTime) }}
                </div>
              </div>
            </div>
          </NSpin>
        </div>
      </div>

      <!-- 新建目录弹窗 -->
      <NModal
        v-model:show="showCategoryModal"
        title="新建目录"
        preset="dialog"
        :positive-text="'确定'"
        :negative-text="'取消'"
        @positive-click="handleCategoryConfirm"
      >
        <NForm :model="categoryForm" label-placement="top">
          <NFormItem label="上级目录">
            <NInput :value="currentParentName" disabled />
          </NFormItem>
          <NFormItem label="目录名称">
            <NInput v-model:value="categoryForm.name" placeholder="请输入目录名称" />
          </NFormItem>
          <NFormItem label="描述">
            <NInput
              v-model:value="categoryForm.description"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="可选：对目录用途进行简要说明"
            />
          </NFormItem>
        </NForm>
      </NModal>
    </NCard>
  </ScrollContainer>
</template>

<style scoped>
.kb-sidebar {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid #f0f0f0;
  padding-right: 16px;
  overflow-y: auto;
}

.kb-content {
  flex: 1;
  overflow-y: auto;
  padding-left: 16px;
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
