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
          <div class="kb-main-left">
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
                <div v-else>
                  <div
                    v-for="doc in documents"
                    :key="doc.id"
                    :class="['kb-doc-item', { active: currentDocument && doc.id === currentDocument.id }]"
                    @click="handleSelectDocument(doc)"
                  >
                    <div class="kb-doc-title">{{ doc.title }}</div>
                    <div class="kb-doc-meta">
                      <span>浏览 {{ doc.viewCount || 0 }}</span>
                      <n-tag size="small" type="success" v-if="doc.status === 1">已发布</n-tag>
                      <n-tag size="small" type="warning" v-else>草稿</n-tag>
                    </div>
                  </div>
                </div>
              </n-spin>
            </div>
          </div>

          <div class="kb-main-right">
            <n-spin :show="editorLoading">
              <div v-if="currentDocument" :class="['kb-editor-panel', { fullscreen: isFullscreen }]">
                <div class="kb-editor-header">
                  <n-input
                    v-model:value="form.title"
                    placeholder="请输入文档标题"
                    size="large"
                  />
                  <n-space>
                    <n-switch v-model:value="form.status" :checked-value="1" :unchecked-value="0">
                      <template #checked>已发布</template>
                      <template #unchecked>草稿</template>
                    </n-switch>
                    <n-button size="small" quaternary @click="toggleFullscreen">
                      {{ isFullscreen ? '退出全屏' : '全屏编辑' }}
                    </n-button>
                    <n-button size="small" @click="handleDeleteDocument" type="error" secondary>删除</n-button>
                    <n-button size="small" type="primary" @click="handleSave">保存</n-button>
                  </n-space>
                </div>

                <div class="kb-editor-tags">
                  <n-input
                    v-model:value="form.tags"
                    size="small"
                    placeholder="标签，逗号分隔，如：后端,Spring Boot,数据库"
                  />
                </div>

                <div class="kb-editor-toolbar">
                  <n-space size="small">
                    <n-button text @click="toggleBold">
                      <span class="kb-toolbar-button" :class="{ active: isBoldActive }">B</span>
                    </n-button>
                    <n-button text @click="toggleItalic">
                      <span class="kb-toolbar-button" :class="{ active: isItalicActive }">I</span>
                    </n-button>
                    <n-button text @click="setHeading(1)">
                      <span class="kb-toolbar-button">H1</span>
                    </n-button>
                    <n-button text @click="setHeading(2)">
                      <span class="kb-toolbar-button">H2</span>
                    </n-button>
                    <n-button text @click="toggleBulletList">
                      <span class="kb-toolbar-button">• 列表</span>
                    </n-button>
                    <n-button text @click="toggleOrderedList">
                      <span class="kb-toolbar-button">1. 列表</span>
                    </n-button>
                  </n-space>
                </div>

                <div class="kb-editor-content">
                  <EditorContent v-if="editor" :editor="editor" />
                </div>
              </div>
              <n-empty v-else description="请选择左侧文档或新建文档" />
            </n-spin>
          </div>
        </div>
      </n-layout-content>
    </n-layout>
  </n-card>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import {
  NCard,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NTree,
  NInput,
  NButton,
  NTag,
  NSpace,
  NSpin,
  NEmpty,
  NSwitch
} from 'naive-ui'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { useMessage } from 'naive-ui'
import { getCategoryTree, getDocumentList, getDocumentById, createDocument, updateDocument, deleteDocument, searchDocument } from '@/api/knowledge'
import { moveCategory } from '@/api/knowledge'

const message = useMessage()

const categoryTree = ref([])
const expandedKeys = ref([])
const selectedCategoryId = ref(null)

const documents = ref([])
const currentDocument = ref(null)
const docLoading = ref(false)
const editorLoading = ref(false)
const isFullscreen = ref(false)
const searchTitle = ref('')

const form = reactive({
  id: null,
  title: '',
  status: 1,
  categoryId: null,
  tags: '',
  sort: 0,
  version: null
})

let editor = null

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
    currentDocument.value = null
    return
  }
  docLoading.value = true
  try {
    const res = await getDocumentList(selectedCategoryId.value)
    if (res.code === 200) {
      documents.value = res.data || []
      currentDocument.value = null
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
      currentDocument.value = null
    }
  } catch (error) {
    message.error('搜索文档失败')
  } finally {
    docLoading.value = false
  }
}

const handleSelectDocument = async (doc) => {
  editorLoading.value = true
  try {
    const res = await getDocumentById(doc.id)
    if (res.code === 200) {
      currentDocument.value = res.data
      form.id = res.data.id
      form.title = res.data.title
      form.status = res.data.status
      form.categoryId = res.data.categoryId
      form.tags = res.data.tags || ''
      form.sort = res.data.sort || 0
      form.version = res.data.version
      if (editor) {
        editor.commands.setContent(res.data.content || '')
      }
    }
  } catch (error) {
    message.error('加载文档失败')
  } finally {
    editorLoading.value = false
  }
}

const handleAddCategory = () => {
  message.info('目录结构目前支持拖动调整层级与排序，后续再补充可视化目录管理')
}

const handleCreateDocument = () => {
  if (!selectedCategoryId.value) {
    message.warning('请先选择左侧目录')
    return
  }
  currentDocument.value = { id: null }
  form.id = null
  form.title = ''
  form.status = 0
  form.categoryId = selectedCategoryId.value
  form.tags = ''
  form.sort = 0
  form.version = null
  if (editor) {
    editor.commands.clearContent()
  }
}

const handleSave = async () => {
  if (!selectedCategoryId.value) {
    message.warning('请先选择目录')
    return
  }
  if (!form.title) {
    message.warning('请输入文档标题')
    return
  }
  const payload = {
    categoryId: form.categoryId || selectedCategoryId.value,
    title: form.title,
    content: editor ? editor.getHTML() : '',
    tags: form.tags,
    sort: form.sort,
    status: form.status,
    version: form.version
  }
  try {
    if (form.id) {
      const res = await updateDocument(form.id, payload)
      if (res.code === 200) {
        message.success('更新成功')
        await loadDocuments()
      }
    } else {
      const res = await createDocument(payload)
      if (res.code === 200) {
        message.success('创建成功')
        await loadDocuments()
      }
    }
  } catch (error) {
    message.error('保存失败')
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

const handleDeleteDocument = async () => {
  if (!currentDocument.value || !currentDocument.value.id) return
  try {
    const res = await deleteDocument(currentDocument.value.id)
    if (res.code === 200) {
      message.success('删除成功')
      await loadDocuments()
    }
  } catch (error) {
    message.error('删除失败')
  }
}

const toggleBold = () => editor && editor.chain().focus().toggleBold().run()
const toggleItalic = () => editor && editor.chain().focus().toggleItalic().run()
const setHeading = (level) => editor && editor.chain().focus().toggleHeading({ level }).run()
const toggleBulletList = () => editor && editor.chain().focus().toggleBulletList().run()
const toggleOrderedList = () => editor && editor.chain().focus().toggleOrderedList().run()

const isBoldActive = computed(() => editor && editor.isActive('bold'))
const isItalicActive = computed(() => editor && editor.isActive('italic'))

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

onMounted(async () => {
  editor = new Editor({
    extensions: [StarterKit],
    content: ''
  })
  await loadCategories()
})

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
  }
})
</script>

<style scoped>
.kb-container {
  height: calc(100vh - 120px);
  background-color: #f5f5f5;
  padding: 16px;
  box-sizing: border-box;
}

.kb-main {
  display: flex;
  gap: 16px;
  height: 100%;
}

.kb-main-left {
  width: 260px;
  display: flex;
  flex-direction: column;
}

.kb-main-right {
  flex: 1;
  display: flex;
  flex-direction: column;
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
  margin-bottom: 8px;
}

.kb-doc-list {
  flex: 1;
  overflow: auto;
}

.kb-doc-item {
  padding: 8px 4px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 4px;
}

.kb-doc-item.active {
  background-color: #f0f9eb;
}

.kb-doc-title {
  font-size: 14px;
  font-weight: 500;
}

.kb-doc-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.kb-editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.kb-editor-panel.fullscreen {
  position: fixed;
  inset: 16px;
  z-index: 2000;
  background-color: #fff;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.kb-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.kb-editor-header :deep(.n-input) {
  font-size: 24px;
  font-weight: 600;
  border: none;
  box-shadow: none;
  padding-left: 0;
}

.kb-editor-tags {
  margin-bottom: 12px;
}

.kb-editor-toolbar {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background-color: #f7f7f7;
  margin-bottom: 12px;
}

.kb-toolbar-button {
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 13px;
  color: #555;
}

.kb-toolbar-button.active {
  border-color: #18a058;
  color: #18a058;
  background-color: #e6f6ec;
}

.kb-editor-content {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  overflow: auto;
}

.kb-editor-content :deep(.ProseMirror) {
  outline: none;
  min-height: 300px;
}
</style>