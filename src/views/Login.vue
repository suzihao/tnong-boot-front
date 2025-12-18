<template>
  <div class="login-container">
    <n-config-provider :theme="null">
      <div class="login-content">
        <!-- 左侧品牌区 -->
        <div class="brand-section">
          <div class="brand-content">
            <h1 class="brand-title">TNong Boot</h1>
            <p class="brand-subtitle">企业级SaaS快速开发脚手架</p>
            <div class="brand-features">
              <div class="feature-item">
                <n-icon size="20" color="#fff"><checkmark-circle-outline /></n-icon>
                <span>多租户架构</span>
              </div>
              <div class="feature-item">
                <n-icon size="20" color="#fff"><shield-checkmark-outline /></n-icon>
                <span>RBAC权限体系</span>
              </div>
              <div class="feature-item">
                <n-icon size="20" color="#fff"><flash-outline /></n-icon>
                <span>开箱即用</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧登录区 -->
        <div class="login-section">
          <div class="login-box">
            <div class="login-header">
              <h2>欢迎登录</h2>
              <p>请输入您的账号信息</p>
            </div>

            <n-tabs v-model:value="activeTab" type="segment" animated>
              <n-tab-pane name="account" tab="账号登录">
                <n-form
                  ref="formRef"
                  :model="loginForm"
                  :rules="rules"
                  size="large"
                  label-placement="left"
                  style="margin-top: 24px"
                >
                  <n-form-item path="username" :show-label="false">
                    <n-input
                      v-model:value="loginForm.username"
                      placeholder="用户名"
                      clearable
                    >
                      <template #prefix>
                        <n-icon><person-outline /></n-icon>
                      </template>
                    </n-input>
                  </n-form-item>

                  <n-form-item path="password" :show-label="false">
                    <n-input
                      v-model:value="loginForm.password"
                      type="password"
                      placeholder="密码"
                      show-password-on="click"
                      @keyup.enter="handleLogin"
                    >
                      <template #prefix>
                        <n-icon><lock-closed-outline /></n-icon>
                      </template>
                    </n-input>
                  </n-form-item>

                  <n-button
                    type="primary"
                    size="large"
                    block
                    :loading="loading"
                    @click="handleLogin"
                  >
                    登录
                  </n-button>
                </n-form>

                <div class="tips-box">
                  <n-alert type="info" :bordered="false">
                    <template #header>测试账号</template>
                    用户名: admin | 密码: 123456
                  </n-alert>
                </div>
              </n-tab-pane>

              <n-tab-pane name="wecom" tab="企业微信">
                <div class="wecom-login">
                  <div class="wecom-icon-wrapper">
                    <n-icon size="64" color="#18a058">
                      <logo-wechat />
                    </n-icon>
                  </div>
                  <p class="wecom-tip">使用企业微信扫码登录</p>
                  <n-button
                    type="success"
                    size="large"
                    block
                    @click="handleWecomLogin"
                  >
                    <template #icon>
                      <n-icon><qr-code-outline /></n-icon>
                    </template>
                    企业微信登录
                  </n-button>
                </div>
              </n-tab-pane>
            </n-tabs>
          </div>
        </div>
      </div>
    </n-config-provider>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  NConfigProvider,
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NIcon,
  NAlert
} from 'naive-ui'
import {
  PersonOutline,
  LockClosedOutline,
  BusinessOutline,
  CheckmarkCircleOutline,
  ShieldCheckmarkOutline,
  FlashOutline,
  LogoWechat,
  QrCodeOutline
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)
const activeTab = ref('account')

const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true
    const success = await userStore.login(loginForm)
    if (success) {
      message.success('登录成功')
      router.push('/')
    } else {
      message.error('登录失败，请检查用户名和密码')
    }
  } catch (error) {
    if (error?.errors) {
      // 表单验证错误
      return
    }
    console.error('登录错误:', error)
    message.error('登录失败')
  } finally {
    loading.value = false
  }
}

const handleWecomLogin = () => {
  const corpId = import.meta.env.VITE_WECOM_CORP_ID
  const agentId = import.meta.env.VITE_WECOM_AGENT_ID
  const redirectUri = encodeURIComponent(
    import.meta.env.VITE_WECOM_REDIRECT_URI || `${window.location.origin}/wecom-callback`
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
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-content {
  width: 900px;
  height: 560px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  overflow: hidden;
}

/* 左侧品牌区 */
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, #18a058 0%, #0e7a3e 100%);
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-content {
  text-align: center;
}

.brand-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  letter-spacing: 1px;
}

.brand-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 48px 0;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

/* 右侧登录区 */
.login-section {
  flex: 1;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-box {
  width: 100%;
}

.login-header {
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.login-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.tips-box {
  margin-top: 20px;
}

/* 企业微信登录 */
.wecom-login {
  padding: 40px 0 20px;
  text-align: center;
}

.wecom-icon-wrapper {
  margin-bottom: 24px;
}

.wecom-tip {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-content {
    width: 90vw;
    height: auto;
    flex-direction: column;
  }

  .brand-section {
    padding: 32px;
  }

  .brand-features {
    display: none;
  }

  .login-section {
    padding: 32px 24px;
  }
}
</style>
