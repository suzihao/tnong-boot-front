<script setup lang="ts">
import { NForm, NFormItem, NInput, NButton, NCheckbox, NCarousel, useMessage } from 'naive-ui'
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  useTemplateRef,
} from 'vue'

import topographySvg from '@/assets/topography.svg'
import { useInjection } from '@/composables'
import { mediaQueryInjectionKey } from '@/injection'
import ThemeModePopover from '@/layout/header/action/ThemeModePopover.vue'
import router from '@/router'
import { toRefsPreferencesStore, toRefsUserStore } from '@/stores'
import { useUserStore } from '@/stores/user'
import twc from '@/utils/tailwindColor'

import ThemeColorPopover from './component/ThemeColorPopover.vue'

import type { FormItemRule } from 'naive-ui'

defineOptions({
  name: 'SignIn',
})

const { isMaxSm } = useInjection(mediaQueryInjectionKey)

const { isDark } = toRefsPreferencesStore()
const { token } = toRefsUserStore()
const userStore = useUserStore()
const message = useMessage()

const illustrations = [
  defineAsyncComponent(() => import('./component/Illustration1.vue')),
  defineAsyncComponent(() => import('./component/Illustration2.vue')),
  defineAsyncComponent(() => import('./component/Illustration3.vue')),
]

const loading = ref(false)
const isNavigating = ref(false)
const isRememberMed = ref(false)

const textureMaskParams = reactive({
  size: '666px 666px',
  x: 0,
  y: 0,
})

const textureStyle = computed(() => {
  return {
    filter: isDark.value ? 'invert(0.18)' : 'invert(0.9)',
    maskImage: `radial-gradient(circle 200px at ${textureMaskParams.x}px ${textureMaskParams.y}px, #f0f 0%, transparent 100%)`,
    WebkitMaskImage: `radial-gradient(circle 200px at ${textureMaskParams.x}px ${textureMaskParams.y}px, #f0f 0%, transparent 100%)`,
  }
})

const signInFormRef = useTemplateRef<InstanceType<typeof NForm>>('signInFormRef')

const signInForm = reactive({
  username: 'admin',
  password: '123456',
})

const signInFormRules: Record<string, FormItemRule[]> = {
  username: [{ required: true, message: '请输入账号', trigger: ['input', 'blur'] }],
  password: [{ required: true, message: '请输入密码', trigger: ['input', 'blur'] }],
}

function toLayout() {
  const { r } = router.currentRoute.value.query

  isNavigating.value = true
  router
    .replace({
      path: (r as string) || '/',
    })
    .finally(() => {
      isNavigating.value = false
    })
}

const handleSubmitClick = () => {
  signInFormRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        const success = await userStore.login(signInForm)
        if (success) {
          message.success('登录成功')
          toLayout()
        } else {
          message.error('登录失败，请检查用户名和密码')
        }
      } catch (error: any) {
        message.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 企业微信登录
const handleWecomLogin = () => {
  const corpId = import.meta.env.VITE_WECOM_CORP_ID
  const agentId = import.meta.env.VITE_WECOM_AGENT_ID
  const redirectUri = encodeURIComponent(
    import.meta.env.VITE_WECOM_REDIRECT_URI || `${window.location.origin}/wecom-callback`,
  )
  const state = Date.now().toString()

  if (!corpId || !agentId) {
    message.error('企业微信登录未配置，请联系管理员')
    return
  }

  const url =
    'https://login.work.weixin.qq.com/wwlogin/sso/login' +
    `?login_type=CorpApp` +
    `&appid=${corpId}` +
    `&agentid=${agentId}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}`

  window.location.href = url
}

function updateTexturePosition(x: number, y: number) {
  textureMaskParams.x = x
  textureMaskParams.y = y
}

function onMouseMove(e: MouseEvent) {
  updateTexturePosition(e.clientX, e.clientY)
}

function onTouchMove(e: TouchEvent) {
  if (!e.touches[0]) return
  updateTexturePosition(e.touches[0].clientX, e.touches[0].clientY)
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('touchmove', onTouchMove)
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('touchmove', onTouchMove)
})
</script>
<template>
  <div
    class="relative flex h-svh items-center justify-center overflow-hidden bg-neutral-25 p-6 transition-[background-color] dark:bg-neutral-900"
  >
    <div
      class="absolute top-0 left-0 size-full bg-neutral-200/45 transition-[background-color] dark:bg-neutral-800/50"
      :style="{
        'mask-image': `url(${topographySvg})`,
        '-webkit-mask-image': `url(${topographySvg})`,
        'mask-repeat': 'repeat',
        'mask-size': textureMaskParams.size,
        '-webkit-mask-repeat': 'repeat',
        '-webkit-mask-size': textureMaskParams.size,
      }"
    />
    <div
      class="pointer-events-none absolute inset-0 z-10 transition-[filter]"
      :style="{
        'background-image': `url(${topographySvg})`,
        'background-size': textureMaskParams.size,
        '-webkit-mask-repeat': 'no-repeat',
        'mask-repeat': 'no-repeat',
        ...textureStyle,
      }"
    />
    <div class="relative z-50 flex h-[520px] w-[800px] justify-center rounded shadow-lg">
      <div
        v-if="!isMaxSm"
        class="flex-1 bg-neutral-25 py-6 pl-6 text-primary transition-[background-color] dark:bg-neutral-825"
      >
        <NCarousel draggable :show-dots="false" :show-arrow="false" loop autoplay>
          <div v-for="(illustration, index) in illustrations" :key="index" class="flex h-full items-center p-5">
            <component :is="illustration" />
          </div>
        </NCarousel>
      </div>
      <div
        class="relative flex w-full flex-col bg-white px-10 py-12 transition-[background-color] sm:w-[380px] dark:bg-neutral-800"
      >
        <div class="absolute top-0 left-0 z-50 flex w-full items-center justify-end gap-x-4 p-4">
          <ThemeColorPopover />
          <ThemeModePopover />
        </div>
        <div>
          <div>
            <h2 class="text-2xl">登&nbsp;录</h2>
            <p class="text-neutral-400 transition-[color] dark:text-neutral-500">SIGN IN</p>
          </div>
          <div class="mt-8">
            <NForm
              ref="signInFormRef"
              :model="signInForm"
              :show-require-mark="false"
              :rules="signInFormRules"
            >
              <NFormItem path="username" label="账号">
                <NInput
                  v-model:value="signInForm.username"
                  placeholder="请输入账号"
                  clearable
                  :theme-overrides="
                    isDark
                      ? {
                          color: twc.neutral[750],
                          border: `1px solid ${twc.neutral[700]}`,
                        }
                      : undefined
                  "
                  :input-props="{
                    autocomplete: 'off',
                  }"
                >
                  <template #prefix>
                    <span class="mr-1.5 iconify size-5.5 ph--user-circle" />
                  </template>
                </NInput>
              </NFormItem>
              <NFormItem path="password" label="密码">
                <NInput
                  v-model:value="signInForm.password"
                  placeholder="请输入密码"
                  type="password"
                  show-password-on="click"
                  clearable
                  :theme-overrides="
                    isDark
                      ? {
                          color: twc.neutral[750],
                          border: `1px solid ${twc.neutral[700]}`,
                        }
                      : undefined
                  "
                  :input-props="{
                    autocomplete: 'off',
                  }"
                  @keyup.enter="handleSubmitClick"
                >
                  <template #prefix>
                    <span class="mr-1.5 iconify size-5.5 ph--lock-key" />
                  </template>
                </NInput>
              </NFormItem>
              <div class="flex justify-between">
                <NCheckbox v-model:checked="isRememberMed">记住我</NCheckbox>
                <NButton text size="small">忘记密码</NButton>
              </div>
              <div class="mt-4">
                <NButton
                  type="primary"
                  :loading="loading"
                  attr-type="button"
                  :disabled="isNavigating"
                  block
                  size="medium"
                  @click="handleSubmitClick"
                >
                  登&nbsp;录
                </NButton>
              </div>

              <!-- 分隔线 -->
              <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-neutral-200 dark:border-neutral-700" />
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="bg-white px-2 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                    其他登录方式
                  </span>
                </div>
              </div>

              <!-- 企业微信登录按钮 -->
              <div class="flex justify-center">
                <button
                  type="button"
                  class="group flex size-12 items-center justify-center rounded-full border-2 border-neutral-200 transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-neutral-700 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
                  title="企业微信登录"
                  @click="handleWecomLogin"
                >
                  <!-- 企业微信图标 -->
                  <svg t="1766392820477" class="size-7 text-blue-500 transition-transform group-hover:scale-110" viewBox="0 0 1228 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1669" width="200" height="200">
                    <path d="M1045.84 747.027a153.563 153.563 0 0 0-53.156 21.515 129.094 129.094 0 0 1-58.092 35.1c2.953-19.828 12.783-37.926 27.633-51.3a191.186 191.186 0 0 0 26.452-62.142 56.953 56.953 0 1 1 57.164 56.827zM941.639 610.634a190.814 190.814 0 0 0-61.932-26.747 56.953 56.953 0 1 1 56.953-56.953 155.266 155.266 0 0 0 21.263 53.325 129.666 129.666 0 0 1 34.762 58.346 85.978 85.978 0 0 1-50.878-27.97h-0.21z m-93.826-200.728c-17.17-143.817-166.092-256.5-346.274-256.5-191.954 0-348.132 127.744-348.132 284.85a266.33 266.33 0 0 0 124.369 216.169 351.762 351.762 0 0 0 37.969 24.384l-15.44 61.636c5.568 2.616 10.968 5.4 16.663 7.805l77.963-38.981c11.39 2.953 23.372 4.851 35.268 6.876 7.594 1.35 15.188 2.742 22.993 3.67a401.119 401.119 0 0 0 145.547-8.353 281.011 281.011 0 0 0 11.474 62.185 481.153 481.153 0 0 1-108.675 12.698 472.5 472.5 0 0 1-97.621-10.758L262.46 846.21a31.219 31.219 0 0 1-33.877-3.543 31.64 31.64 0 0 1-10.926-32.316l25.312-101.925A330.075 330.075 0 0 1 90.125 438.256c0-192.29 184.19-348.131 411.413-348.131 215.746 0 392.428 140.653 409.64 319.444a276.919 276.919 0 0 0-29.91-2.953c-11.18 0.422-22.36 1.476-33.456 3.248zM716.399 634.47c18.943-3.797 36.957-11.053 53.157-21.515a129.094 129.094 0 0 1 58.134-35.016 86.358 86.358 0 0 1-27.675 51.216c-12.445 18.984-21.389 40.078-26.451 62.184a56.953 56.953 0 1 1-57.165-56.869z m102.6 137.025c18.816 12.614 39.741 21.727 61.763 27a56.953 56.953 0 1 1-56.953 56.953 154.406 154.406 0 0 0-21.094-53.409 129.558 129.558 0 0 1-34.51-58.514 85.888 85.888 0 0 1 50.794 28.308v-0.338z" p-id="1670">
                    </path></svg>
                </button>
              </div>
            </NForm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
