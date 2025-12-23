<script setup lang="ts">
import { NButton, NCard } from 'naive-ui'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores/user'

defineOptions({
  name: 'NoPermission',
})

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
}

const handleRefresh = () => {
  window.location.reload()
}
</script>

<template>
  <div class="flex h-svh items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-900">
    <NCard class="w-full max-w-2xl" :bordered="false">
      <div class="flex flex-col items-center text-center">
        <!-- 图标 -->
        <div class="mb-6 flex items-center justify-center">
          <span class="iconify ph--lock-key text-9xl text-neutral-300 dark:text-neutral-700" />
        </div>

        <!-- 标题 -->
        <h1 class="mb-2 text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
          暂无访问权限
        </h1>

        <!-- 用户信息 -->
        <div class="mb-6 text-neutral-600 dark:text-neutral-400">
          <p class="text-lg">您好，<span class="font-medium text-neutral-800 dark:text-neutral-200">{{ userStore.user.nickname || userStore.user.username }}</span></p>
          <p class="mt-2">您的账号暂未分配任何菜单权限</p>
          <p class="mt-1 text-sm">请联系系统管理员为您分配相应的访问权限</p>
        </div>

        <!-- 操作按钮 -->
        <div class="mb-8 flex gap-4">
          <NButton type="primary" size="large" @click="handleRefresh">
            <template #icon>
              <span class="iconify ph--arrow-clockwise" />
            </template>
            刷新页面
          </NButton>
          <NButton size="large" @click="handleLogout">
            <template #icon>
              <span class="iconify ph--sign-out" />
            </template>
            退出登录
          </NButton>
        </div>

        <!-- 提示信息 -->
        <div class="w-full rounded-lg bg-blue-50 p-6 text-left dark:bg-blue-950/30">
          <div class="flex items-start gap-3">
            <span class="iconify ph--info mt-0.5 text-xl text-blue-600 dark:text-blue-400" />
            <div class="flex-1">
              <p class="mb-3 font-medium text-blue-900 dark:text-blue-300">使用说明</p>
              <ul class="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                <li class="flex items-start gap-2">
                  <span class="mt-1 size-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span>新注册用户需要管理员分配权限后才能访问系统</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="mt-1 size-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span>如果您已获得权限，请点击"刷新页面"按钮重新加载</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="mt-1 size-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span>如有疑问，请联系系统管理员</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </NCard>
  </div>
</template>
