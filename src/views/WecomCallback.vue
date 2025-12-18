<template>
  <div class="wecom-callback">
    <n-card :bordered="false" style="background: white; border-radius: 16px; padding: 24px;">
      <n-space vertical align="center" :size="24">
        <n-spin size="large" />
        <div class="callback-title">正在登录</div>
        <div class="callback-subtitle">正在通过企业微信完成登录，请稍候...</div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { NCard, NSpin, NSpace } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { wecomCallback } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

onMounted(async () => {
  const code = route.query.code
  const state = route.query.state

  if (!code) {
    message.error('企业微信登录失败：缺少code')
    router.replace('/login')
    return
  }

  try {
    const res = await wecomCallback({ code, state })
    if (res.code === 200 && res.data) {
      userStore.token = res.data.token
      userStore.userInfo = {
        userId: res.data.userId,
        username: res.data.username,
        nickname: res.data.nickname,
        tenantId: res.data.tenantId
      }
      localStorage.setItem('token', userStore.token)
      localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
      message.success('企业微信登录成功')
      router.replace('/')
    } else {
      message.error(res.message || '企业微信登录失败')
      router.replace('/login')
    }
  } catch (error) {
    console.error('企业微信登录回调失败:', error)
    message.error('企业微信登录失败')
    router.replace('/login')
  }
})
</script>

<style scoped>
.wecom-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);
}

.callback-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-top: 16px;
}

.callback-subtitle {
  font-size: 14px;
  color: #666;
}
</style>
