<script setup lang="ts">
import { NSpin, useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useUserStore } from '@/stores/user'

defineOptions({
  name: 'WecomCallback',
})

const route = useRoute()
const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  const code = route.query.code as string

  if (!code) {
    errorMessage.value = '缺少授权码，请重新登录'
    loading.value = false
    setTimeout(() => {
      router.replace('/sign-in')
    }, 2000)
    return
  }

  try {
    console.log('企业微信回调 - 开始登录，code:', code)
    const result = await userStore.wecomLogin(code)
    console.log('企业微信回调 - 登录结果:', result)
    console.log('企业微信回调 - 当前 token:', userStore.token)
    console.log('企业微信回调 - 当前 user:', userStore.user)

    if (result.success) {
      message.success(result.message)
      console.log('企业微信回调 - 准备跳转到首页')

      // 等待一下，确保 token 已经保存
      await new Promise(resolve => setTimeout(resolve, 100))

      router.replace('/')
    } else {
      errorMessage.value = result.message
      setTimeout(() => {
        router.replace('/sign-in')
      }, 2000)
    }
  } catch (error: any) {
    console.error('企业微信登录失败:', error)
    errorMessage.value = error.message || '登录失败，请重试'
    setTimeout(() => {
      router.replace('/sign-in')
    }, 2000)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex h-svh items-center justify-center bg-neutral-50 dark:bg-neutral-900">
    <div class="text-center">
      <NSpin v-if="loading" size="large" />
      <div v-else>
        <div v-if="errorMessage" class="text-red-500">
          <span class="iconify size-16 ph--warning-circle" />
          <p class="mt-4 text-lg">{{ errorMessage }}</p>
          <p class="mt-2 text-sm text-neutral-500">正在跳转到登录页...</p>
        </div>
      </div>
    </div>
  </div>
</template>
