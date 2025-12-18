<template>
  <n-layout has-sider style="height: 100vh">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="logo">
        <h2 v-if="!collapsed">TNong Boot</h2>
        <h2 v-else>TB</h2>
      </div>
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>

    <n-layout>
      <n-layout-header bordered style="height: 64px; padding: 0 24px; background: #fff; box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06); z-index: 10;">
        <div class="header-container">
          <n-breadcrumb>
            <n-breadcrumb-item @click="router.push('/dashboard')">
              <n-icon><home-outline /></n-icon>
              首页
            </n-breadcrumb-item>
            <n-breadcrumb-item v-if="route.meta.title">
              {{ route.meta.title }}
            </n-breadcrumb-item>
          </n-breadcrumb>

          <div class="header-right">
            <n-space :size="16" align="center">
              <n-dropdown :options="colorOptions" @select="handleColorSelect">
                <n-button text size="small">
                  <n-icon style="margin-right: 4px"><color-palette-outline /></n-icon>
                  <span>主题：{{ currentColorLabel }}</span>
                </n-button>
              </n-dropdown>
          
              <n-button
                text
                @click="themeStore.toggleTheme()"
                :style="{ fontSize: '20px', padding: '4px' }"
              >
                <n-icon>
                  <moon-outline v-if="themeStore.isDark" />
                  <sunny-outline v-else />
                </n-icon>
              </n-button>
          
              <n-dropdown :options="userOptions" @select="handleCommand">
                <div class="user-info">
                  <n-avatar round size="small">
                    {{ userStore.userInfo.nickname?.charAt(0) || 'U' }}
                  </n-avatar>
                  <span class="username">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</span>
                </div>
              </n-dropdown>
            </n-space>
          </div>
        </div>
      </n-layout-header>

      <n-layout-content content-style="padding: 24px; background: #f5f5f5;" style="height: calc(100vh - 64px)">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NIcon, useDialog } from 'naive-ui'
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NBreadcrumb,
  NBreadcrumbItem,
  NDropdown,
  NAvatar,
  NButton,
  NSpace
} from 'naive-ui'
import {
  HomeOutline,
  DocumentTextOutline,
  SettingsOutline,
  PeopleOutline,
  BusinessOutline,
  LogOutOutline,
  SunnyOutline,
  MoonOutline,
  ColorPaletteOutline
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'

const route = useRoute()
const router = useRouter()
const dialog = useDialog()
const userStore = useUserStore()
const themeStore = useThemeStore()

const collapsed = ref(false)
const activeKey = computed(() => route.path)

const colorOptions = [
  { label: '绿色风格', key: 'green' },
  { label: '红色风格', key: 'red' },
  { label: '蓝色风格', key: 'blue' }
]

const currentColorLabel = computed(() => {
  const map = {
    green: '绿色风格',
    red: '红色风格',
    blue: '蓝色风格'
  }
  return map[themeStore.colorScheme] || '绿色风格'
})

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = [
  {
    label: '首页',
    key: '/dashboard',
    icon: renderIcon(HomeOutline)
  },
  {
    label: '知识库',
    key: '/knowledge',
    icon: renderIcon(DocumentTextOutline)
  },
  {
    label: '系统管理',
    key: 'system',
    icon: renderIcon(SettingsOutline),
    children: [
      {
        label: '用户管理',
        key: '/user',
        icon: renderIcon(PeopleOutline)
      },
      {
        label: '租户管理',
        key: '/tenant',
        icon: renderIcon(BusinessOutline)
      }
    ]
  }
]

const userOptions = [
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogOutOutline)
  }
]

const handleMenuSelect = (key) => {
  router.push(key)
}

const handleColorSelect = (key) => {
  themeStore.setColorScheme(key)
}

const handleCommand = (key) => {
  if (key === 'logout') {
    dialog.warning({
      title: '提示',
      content: '确定要退出登录吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        await userStore.logout()
        router.push('/login')
      }
    })
  }
}
</script>

<style scoped>
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f0f0f0;
}

.logo h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #18a058;
}

.header-container {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-right .n-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
}
</style>
