<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">TNong Boot</h1>
      <p class="subtitle">后台管理系统</p>
      
      <el-form ref="formRef" :model="loginForm" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item prop="tenantCode">
          <el-input
            v-model="loginForm.tenantCode"
            placeholder="租户编码(可选，默认DEFAULT)"
            size="large"
            prefix-icon="Office-Building"
          />
        </el-form-item>
        
        <el-button
          type="primary"
          size="large"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          登 录
        </el-button>

        <el-button
          type="success"
          size="large"
          class="login-btn wecom-btn"
          @click="handleWecomLogin"
        >
          使用企业微信登录
        </el-button>
      </el-form>
      
      <div class="tips">
        <p>默认账号：admin</p>
        <p>默认密码：123456</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '123456',
  tenantCode: 'DEFAULT'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const success = await userStore.login(loginForm)
        if (success) {
          ElMessage.success('登录成功')
          router.push('/')
        } else {
          ElMessage.error('登录失败，请检查用户名和密码')
        }
      } catch (error) {
        console.error('登录错误:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleWecomLogin = () => {
  const corpId = import.meta.env.VITE_WECOM_CORP_ID
  const agentId = import.meta.env.VITE_WECOM_AGENT_ID
  const redirectUri = encodeURIComponent(
    import.meta.env.VITE_WECOM_REDIRECT_URI || `${window.location.origin}/wecom-callback`
  )
  const state = Date.now().toString()

  if (!corpId || !agentId) {
    ElMessage.error('企业微信登录未配置，请联系管理员')
    return
  }

  const url =
    'https://login.work.weixin.qq.com/wwlogin/sso/login' + `?login_type=CorpApp` +
    `&appid=${corpId}` +
    `&agentid=${agentId}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}`

  window.location.href = url
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  color: #333;
}

.subtitle {
  font-size: 14px;
  text-align: center;
  color: #999;
  margin-bottom: 30px;
}

.login-form {
  margin-top: 20px;
}

.login-btn {
  width: 100%;
  margin-top: 10px;
}

.wecom-btn {
  margin-top: 12px;
}

.tips {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.tips p {
  margin: 5px 0;
}
</style>
