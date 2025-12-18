<template>
  <n-config-provider :theme="isDark ? darkTheme : null" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <transition name="page-fade" mode="out-in">
          <router-view />
        </transition>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import { NConfigProvider, NMessageProvider, NDialogProvider, darkTheme } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)
const themeOverrides = computed(() => themeStore.themeOverrides)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

html.dark body {
  background-color: #101014;
}

html.dark .n-layout-content {
  background-color: #101014 !important;
}

html.dark .n-layout-header {
  background-color: #18181c !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6) !important;
}

html.dark .kb-container,
html.dark .kb-editor-page,
html.dark .kb-doc-card {
  background-color: #18181c;
  border-color: #2f2f33;
}

html.dark .kb-doc-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
}

html.dark .n-layout-scroll-container,
html.dark .layout-scroll-container {
  background-color: #101014 !important;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.n-button {
  transition: box-shadow 0.15s ease-out, transform 0.15s ease-out, background-color 0.15s ease-out,
    border-color 0.15s ease-out;
}

.n-button:active {
  transform: scale(0.97);
}

.n-card,
.kb-doc-card {
  transition: box-shadow 0.18s ease-out, transform 0.18s ease-out;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.18s ease-out, transform 0.18s ease-out;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

html.dark .n-layout-scroll-container,
html.dark .layout-scroll-container {
  background-color: #101014 !important;
}
</style>
