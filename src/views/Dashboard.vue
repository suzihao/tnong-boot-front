<template>
  <div class="dashboard">
    <n-grid :x-gap="16" :y-gap="16" :cols="4" responsive="screen">
      <n-gi>
        <n-card :bordered="false" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <n-icon size="32" color="#fff"><people-outline /></n-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">用户总数</div>
              <div class="stat-value">1,234</div>
              <div class="stat-trend">
                <n-icon color="#18a058"><arrow-up-outline /></n-icon>
                <span>12%</span>
              </div>
            </div>
          </div>
        </n-card>
      </n-gi>

      <n-gi>
        <n-card :bordered="false" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <n-icon size="32" color="#fff"><business-outline /></n-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">租户总数</div>
              <div class="stat-value">56</div>
              <div class="stat-trend">
                <n-icon color="#18a058"><arrow-up-outline /></n-icon>
                <span>8%</span>
              </div>
            </div>
          </div>
        </n-card>
      </n-gi>

      <n-gi>
        <n-card :bordered="false" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <n-icon size="32" color="#fff"><eye-outline /></n-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">今日访问</div>
              <div class="stat-value">8,765</div>
              <div class="stat-trend">
                <n-icon color="#18a058"><arrow-up-outline /></n-icon>
                <span>24%</span>
              </div>
            </div>
          </div>
        </n-card>
      </n-gi>

      <n-gi>
        <n-card :bordered="false" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <n-icon size="32" color="#fff"><warning-outline /></n-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">异常告警</div>
              <div class="stat-value">3</div>
              <div class="stat-trend danger">
                <n-icon color="#d03050"><arrow-down-outline /></n-icon>
                <span>需关注</span>
              </div>
            </div>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <n-card :bordered="false" style="margin-top: 16px">
      <template #header>
        <div class="card-title">
          <n-icon size="20" color="#18a058"><sparkles-outline /></n-icon>
          <span>欢迎使用 TNong Boot</span>
        </div>
      </template>

      <div class="welcome-content">
        <n-alert type="success" :bordered="false" style="margin-bottom: 24px">
          <template #icon>
            <n-icon><checkmark-circle-outline /></n-icon>
          </template>
          欢迎，{{ userStore.userInfo.nickname || userStore.userInfo.username }}！
        </n-alert>

        <n-h3 prefix="bar">核心特性</n-h3>
        <n-grid :x-gap="12" :y-gap="12" :cols="3">
          <n-gi v-for="feature in features" :key="feature.title">
            <div class="feature-item">
              <n-icon size="24" :color="feature.color">
                <component :is="feature.icon" />
              </n-icon>
              <div class="feature-text">
                <div class="feature-title">{{ feature.title }}</div>
                <div class="feature-desc">{{ feature.desc }}</div>
              </div>
            </div>
          </n-gi>
        </n-grid>

        <n-divider />

        <n-h3 prefix="bar">功能模块</n-h3>
        <n-space>
          <n-tag type="success" size="large" :bordered="false">用户管理</n-tag>
          <n-tag type="info" size="large" :bordered="false">租户管理</n-tag>
          <n-tag type="warning" size="large" :bordered="false">角色权限</n-tag>
          <n-tag type="error" size="large" :bordered="false">知识库</n-tag>
        </n-space>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { h } from 'vue'
import {
  NCard,
  NGrid,
  NGi,
  NIcon,
  NAlert,
  NH3,
  NDivider,
  NSpace,
  NTag
} from 'naive-ui'
import {
  PeopleOutline,
  BusinessOutline,
  EyeOutline,
  WarningOutline,
  ArrowUpOutline,
  ArrowDownOutline,
  SparklesOutline,
  CheckmarkCircleOutline,
  LockClosedOutline,
  ShieldCheckmarkOutline,
  ServerOutline,
  GitBranchOutline,
  RocketOutline,
  ExtensionPuzzleOutline
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const features = [
  {
    title: '多租户架构',
    desc: '完善的租户数据隔离',
    icon: BusinessOutline,
    color: '#18a058'
  },
  {
    title: 'RBAC权限',
    desc: '灵活的角色权限控制',
    icon: ShieldCheckmarkOutline,
    color: '#2080f0'
  },
  {
    title: 'JWT认证',
    desc: '无状态安全认证',
    icon: LockClosedOutline,
    color: '#f0a020'
  },
  {
    title: 'MyBatis',
    desc: '原生SQL控制',
    icon: ServerOutline,
    color: '#d03050'
  },
  {
    title: 'Vue3 + Vite',
    desc: '现代化前端技术栈',
    icon: RocketOutline,
    color: '#18a058'
  },
  {
    title: '模块化设计',
    desc: '清晰的代码结构',
    icon: ExtensionPuzzleOutline,
    color: '#2080f0'
  }
]
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #18a058;
}

.stat-trend.danger {
  color: #d03050;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.welcome-content {
  padding: 8px 0;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s;
}

.feature-item:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.feature-text {
  flex: 1;
}

.feature-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 12px;
  color: #999;
}
</style>
