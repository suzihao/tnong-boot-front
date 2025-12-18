<template>
  <div class="kb-editor-page">
    <n-spin :show="loading">
      <div class="kb-editor-wrapper">
        <!-- 顶部操作栏 -->
        <div class="kb-editor-topbar">
          <div class="kb-editor-topbar-left">
            <n-button text @click="handleBack">
              <template #icon>
                <n-icon><arrow-back-outline /></n-icon>
              </template>
              返回列表
            </n-button>
          </div>
          <div class="kb-editor-topbar-right">
            <n-space>
              <n-switch v-model:value="form.status" :checked-value="1" :unchecked-value="0">
                <template #checked>已发布</template>
                <template #unchecked>草稿</template>
              </n-switch>
              <n-button @click="handleSave" type="primary" :loading="saving">
                保存
              </n-button>
              <n-button @click="handleDelete" type="error" secondary v-if="documentId">
                删除
              </n-button>
            </n-space>
          </div>
        </div>

        <!-- 标题输入 -->
        <div class="kb-editor-title">
          <n-input
            v-model:value="form.title"
            placeholder="请输入文档标题"
            size="large"
            :bordered="false"
          />
        </div>

        <!-- 标签输入 -->
        <div class="kb-editor-tags">
          <n-input
            v-model:value="form.tags"
            size="small"
            placeholder="标签，逗号分隔，如：后端,Spring Boot,数据库"
            :bordered="false"
          />
        </div>

        <!-- Tiptap 编辑器 -->
        <div class="kb-editor-body">
          <TiptapEditor v-if="editor" :editor="editor" class="tiptap-wrapper">
            <TiptapToolbar :editor="editor" />
            <TiptapContent :editor="editor" />
            <TiptapStatusBar :editor="editor" />
          </TiptapEditor>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import { NSpin, NInput, NButton, NSpace, NSwitch, NIcon } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { TiptapEditor, TiptapToolbar, TiptapContent, TiptapStatusBar } from '@/components/ui/tiptap'
import { getDocumentById, createDocument, updateDocument, deleteDocument } from '@/api/knowledge'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const documentId = ref(route.query.id || null)
const categoryId = ref(route.query.categoryId || null)
const loading = ref(false)
const saving = ref(false)

const form = reactive({
  title: '',
  status: 0,
  tags: '',
  categoryId: null,
  sort: 0,
  version: null
})

const editor = useEditor({
  extensions: [StarterKit],
  content: '',
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[500px] p-8',
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
      form.version = res.data.version
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
    sort: form.sort,
    status: form.status,
    version: form.version
  }

  try {
    if (documentId.value) {
      const res = await updateDocument(documentId.value, payload)
      if (res.code === 200) {
        message.success('更新成功')
        form.version = res.data.version
      }
    } else {
      const res = await createDocument(payload)
      if (res.code === 200) {
        message.success('创建成功')
        documentId.value = res.data.id
        form.version = res.data.version
        // 更新 URL
        router.replace({ query: { id: res.data.id } })
      }
    }
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = () => {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这篇文档吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = await deleteDocument(documentId.value)
        if (res.code === 200) {
          message.success('删除成功')
          handleBack()
        }
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

const handleBack = () => {
  router.push('/knowledge')
}

onMounted(() => {
  loadDocument()
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.kb-editor-page {
  height: 100vh;
  background: #fff;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.kb-editor-topbar-left {
  display: flex;
  align-items: center;
}

.kb-editor-title {
  margin-bottom: 8px;
  padding: 0 16px;
  background: white;
  border-radius: 8px;
}

.kb-editor-title :deep(.n-input) {
  font-size: 32px;
  font-weight: 600;
  padding: 16px 0;
}

.kb-editor-title :deep(.n-input__input-el) {
  font-size: 32px;
  font-weight: 600;
}

.kb-editor-tags {
  margin-bottom: 16px;
  padding: 0 16px;
  background: white;
  border-radius: 8px;
}

.kb-editor-tags :deep(.n-input) {
  padding: 8px 0;
}

.kb-editor-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tiptap-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.kb-editor-body :deep(.tiptap-editor) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
