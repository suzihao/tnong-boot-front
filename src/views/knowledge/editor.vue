<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import { NSpin, NInput, NButton, NSwitch, NButtonGroup, NTooltip, NDivider } from 'naive-ui'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

import {
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from '@/api/knowledge'
import { useTabsStore } from '@/stores'

defineOptions({
  name: 'KnowledgeEditor',
})

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const tabsStore = useTabsStore()

const documentId = ref<number | null>(route.params.id ? Number(route.params.id) : null)
const categoryId = ref<number | null>(
  route.query.categoryId ? Number(route.query.categoryId) : null,
)
const loading = ref(false)
const saving = ref(false)

const form = reactive({
  title: '',
  status: 0,
  tags: '',
  categoryId: null as number | null,
  sort: 0,
  version: null as number | null,
})

// 初始化 Tiptap 编辑器
const editor = useEditor({
  extensions: [StarterKit],
  content: '',
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[500px] p-8',
    },
  },
})

const loadDocument = async () => {
  if (!documentId.value) {
    // 新建模式
    form.categoryId = categoryId.value
    return
  }

  loading.value = true
  try {
    const res = await getDocumentById(documentId.value)
    if (res.code === 200) {
      form.title = res.data.title
      form.status = res.data.status
      form.tags = res.data.tags || ''
      form.categoryId = res.data.categoryId
      form.sort = res.data.sort || 0
      form.version = res.data.version // 保存 version
      if (editor.value) {
        editor.value.commands.setContent(res.data.content || '')
      }
    }
  } catch (error) {
    message.error('加载文档失败')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!form.title) {
    message.warning('请输入文档标题')
    return
  }
  if (!form.categoryId) {
    message.warning('缺少目录信息')
    return
  }

  saving.value = true
  const payload = {
    categoryId: form.categoryId,
    title: form.title,
    content: editor.value ? editor.value.getHTML() : '',
    tags: form.tags,
    status: form.status,
    sort: form.sort,
    version: form.version, // 传递 version
  }

  try {
    if (documentId.value) {
      const res = await updateDocument(documentId.value, payload)
      if (res.code === 200) {
        message.success('更新成功')
        // 更新 version
        if (res.data && res.data.version) {
          form.version = res.data.version
        }
      }
    } else {
      const res = await createDocument(payload)
      if (res.code === 200) {
        message.success('创建成功')
        // 新建文档保存后关闭当前 Tab
        closeCurrentTab()
      }
    }
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 关闭当前 Tab
const closeCurrentTab = () => {
  // 查找当前路由对应的 Tab
  const currentTab = tabsStore.tabs.find((tab) => tab.path === route.path)
  if (currentTab && currentTab.id) {
    tabsStore.removeTab(currentTab.id)
  }
  // 跳转到知识库列表
  router.push({ name: 'knowledge' })
}

const handleDelete = () => {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这篇文档吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = await deleteDocument(documentId.value!)
        if (res.code === 200) {
          message.success('删除成功')
          // 删除成功后关闭当前 Tab
          closeCurrentTab()
        }
      } catch (error) {
        message.error('删除失败')
      }
    },
  })
}

onMounted(() => {
  loadDocument()
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="kb-editor-page">
    <NSpin :show="loading">
      <div class="kb-editor-wrapper">
        <!-- 顶部操作栏 -->
        <div class="kb-editor-topbar">
          <div class="kb-editor-topbar-right">
            <div class="kb-editor-status">
              <span class="kb-editor-status-label">文档状态</span>
              <NSwitch
                v-model:value="form.status"
                :checked-value="1"
                :unchecked-value="0"
                size="small"
              >
                <template #checked>已发布</template>
                <template #unchecked>草稿</template>
              </NSwitch>
            </div>
            <div class="kb-editor-actions">
              <NButton @click="handleSave" type="primary" :loading="saving"> 保存 </NButton>
              <NButton @click="handleDelete" type="error" secondary v-if="documentId">
                删除
              </NButton>
            </div>
          </div>
        </div>

        <!-- 标题输入 -->
        <div class="kb-editor-title">
          <NInput
            v-model:value="form.title"
            placeholder="请输入文档标题"
            size="large"
            :bordered="false"
          />
        </div>

        <!-- 标签输入 -->
        <div class="kb-editor-tags">
          <NInput
            v-model:value="form.tags"
            size="small"
            placeholder="标签，逗号分隔，如：后端,Spring Boot,数据库"
            :bordered="false"
          />
        </div>

        <!-- 编辑器工具栏 -->
        <div class="kb-editor-toolbar" v-if="editor">
          <NButtonGroup size="small">
            <NTooltip>
              <template #trigger>
                <NButton
                  :type="editor.isActive('bold') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleBold().run()"
                >
                  <span class="iconify ph--text-b-bold" />
                </NButton>
              </template>
              粗体
            </NTooltip>
            <NTooltip>
              <template #trigger>
                <NButton
                  :type="editor.isActive('italic') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleItalic().run()"
                >
                  <span class="iconify ph--text-italic" />
                </NButton>
              </template>
              斜体
            </NTooltip>
            <NTooltip>
              <template #trigger>
                <NButton
                  :type="editor.isActive('strike') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleStrike().run()"
                >
                  <span class="iconify ph--text-strikethrough" />
                </NButton>
              </template>
              删除线
            </NTooltip>
            <NTooltip>
              <template #trigger>
                <NButton
                  :type="editor.isActive('code') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleCode().run()"
                >
                  <span class="iconify ph--code" />
                </NButton>
              </template>
              行内代码
            </NTooltip>
          </NButtonGroup>

          <NDivider vertical />

          <NButtonGroup size="small">
            <NTooltip>
              <template #trigger>
                <NButton
                  :type="editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                >
                  H1
                </NButton>
              </template>
              一级标题
            </NTooltip>
            <NTooltip>
              <template #trigger>
                <NButton
                  :type="editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                >
                  H2
                </NButton>
              </template>
              二级标题
            </NTooltip>
            <NTooltip>
              <template #trigger>
                <NButton
                  :type="editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                >
                  H3
                </NButton>
              </template>
              三级标题
            </NTooltip>
          </NButtonGroup>

          <NDivider vertical />

          <NButtonGroup size="small">
            <NTooltip>
              <template #trigger>
                <NButton
                  :type="editor.isActive('bulletList') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleBulletList().run()"
                >
                  <span class="iconify ph--list-bullets" />
                </NButton>
              </template>
              无序列表
            </NTooltip>
            <NTooltip>
              <template #trigger>
                <NButton
                  :type="editor.isActive('orderedList') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleOrderedList().run()"
                >
                  <span class="iconify ph--list-numbers" />
                </NButton>
              </template>
              有序列表
            </NTooltip>
          </NButtonGroup>

          <NDivider vertical />

          <NButtonGroup size="small">
            <NTooltip>
              <template #trigger>
                <NButton
                  :type="editor.isActive('blockquote') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleBlockquote().run()"
                >
                  <span class="iconify ph--quotes" />
                </NButton>
              </template>
              引用
            </NTooltip>
            <NTooltip>
              <template #trigger>
                <NButton
                  :type="editor.isActive('codeBlock') ? 'primary' : 'default'"
                  @click="editor.chain().focus().toggleCodeBlock().run()"
                >
                  <span class="iconify ph--code-block" />
                </NButton>
              </template>
              代码块
            </NTooltip>
            <NTooltip>
              <template #trigger>
                <NButton @click="editor.chain().focus().setHorizontalRule().run()">
                  <span class="iconify ph--minus" />
                </NButton>
              </template>
              分隔线
            </NTooltip>
          </NButtonGroup>

          <NDivider vertical />

          <NButtonGroup size="small">
            <NTooltip>
              <template #trigger>
                <NButton
                  :disabled="!editor.can().undo()"
                  @click="editor.chain().focus().undo().run()"
                >
                  <span class="iconify ph--arrow-u-up-left" />
                </NButton>
              </template>
              撤销
            </NTooltip>
            <NTooltip>
              <template #trigger>
                <NButton
                  :disabled="!editor.can().redo()"
                  @click="editor.chain().focus().redo().run()"
                >
                  <span class="iconify ph--arrow-u-up-right" />
                </NButton>
              </template>
              重做
            </NTooltip>
          </NButtonGroup>
        </div>

        <!-- Tiptap 编辑器内容 -->
        <div class="kb-editor-body">
          <EditorContent :editor="editor" class="kb-editor-content" />
        </div>
      </div>
    </NSpin>
  </div>
</template>

<style scoped>
.kb-editor-page {
  min-height: 100vh;
  background: #fff;
  color: #111827;
  display: flex;
  flex-direction: column;
}

.kb-editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px 32px;
}

.kb-editor-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  backdrop-filter: blur(8px);
}

.kb-editor-topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.kb-editor-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
}

.kb-editor-status-label {
  font-weight: 500;
}

.kb-editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kb-editor-title {
  margin-bottom: 8px;
  padding: 0 16px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
}

.kb-editor-title :deep(.n-input) {
  font-size: 32px;
  font-weight: 600;
  padding: 16px 0;
}

.kb-editor-title :deep(.n-input__input-el) {
  font-size: 32px;
  font-weight: 600;
  color: #111827;
}

.kb-editor-tags {
  margin-bottom: 16px;
  padding: 0 16px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
}

.kb-editor-tags :deep(.n-input) {
  padding: 8px 0;
}

.kb-editor-tags :deep(.n-input__input-el) {
  color: #111827;
}

.kb-editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.kb-editor-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.kb-editor-content {
  flex: 1;
  background: white;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: auto;
}

/* Tiptap 编辑器样式 */
.kb-editor-content :deep(.ProseMirror) {
  padding: 24px;
  min-height: 500px;
  outline: none;
}

.kb-editor-content :deep(.ProseMirror p) {
  margin: 0.5em 0;
}

.kb-editor-content :deep(.ProseMirror h1) {
  font-size: 2em;
  font-weight: 700;
  margin: 1em 0 0.5em;
}

.kb-editor-content :deep(.ProseMirror h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin: 0.8em 0 0.4em;
}

.kb-editor-content :deep(.ProseMirror h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin: 0.6em 0 0.3em;
}

.kb-editor-content :deep(.ProseMirror ul),
.kb-editor-content :deep(.ProseMirror ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.kb-editor-content :deep(.ProseMirror blockquote) {
  border-left: 3px solid #e5e7eb;
  padding-left: 1em;
  margin: 1em 0;
  color: #6b7280;
}

.kb-editor-content :deep(.ProseMirror code) {
  background: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.kb-editor-content :deep(.ProseMirror pre) {
  background: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
}

.kb-editor-content :deep(.ProseMirror pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.kb-editor-content :deep(.ProseMirror hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 2em 0;
}
</style>
