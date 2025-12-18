<template>
  <div class="tiptap-demo-container">
    <TiptapEditor v-if="editor" :editor="editor">
      <TiptapToolbar :editor="editor" />
      <TiptapContent :editor="editor" />
      <TiptapStatusBar :editor="editor" />
    </TiptapEditor>
    <div v-else class="loading">初始化编辑器...</div>
  </div>
</template>

<script setup>
import { onBeforeUnmount } from 'vue'
import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { TiptapEditor, TiptapToolbar, TiptapContent, TiptapStatusBar } from '@/components/ui/tiptap'

const editor = useEditor({
  extensions: [StarterKit],
  content: '<h1>欢迎使用 tiptap-shadcn-vue 编辑器</h1><p>这是一个功能完整的富文本编辑器示例，包含工具栏、状态栏等完整 UI 组件。</p><p>你可以在这里编辑内容、使用各种格式化工具。</p>',
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] p-4',
    },
  },
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.tiptap-demo-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #f5f5f5;
}

.tiptap-demo-container :deep(.tiptap-editor) {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 16px;
  color: #666;
}
</style>
