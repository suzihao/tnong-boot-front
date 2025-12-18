<template>
  <div class="wecom-callback">
    <el-result
      icon="success"
      title="正在登录"
      sub-title="正在通过企业微信完成登录，请稍候..."
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { wecomCallback } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  const code = route.query.code
  const state = route.query.state

  if (!code) {
    ElMessage.error('企业微信登录失败：缺少code')
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
      ElMessage.success('企业微信登录成功')
      router.replace('/')
    } else {
      ElMessage.error(res.message || '企业微信登录失败')
      router.replace('/login')
    }
  } catch (error) {
    console.error('企业微信登录回调失败:', error)
    ElMessage.error('企业微信登录失败')
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
}
</style>
