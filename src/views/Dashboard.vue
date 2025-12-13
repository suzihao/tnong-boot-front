<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff">
              <el-icon size="30"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">用户总数</div>
              <div class="stat-value">1,234</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon size="30"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">租户总数</div>
              <div class="stat-value">56</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon size="30"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">今日访问</div>
              <div class="stat-value">8,765</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c">
              <el-icon size="30"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">异常告警</div>
              <div class="stat-value">3</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>欢迎使用 TNong Boot 后台管理系统</span>
            </div>
          </template>
          <div class="welcome-content">
            <h2>🎉 欢迎，{{ userStore.userInfo.nickname || userStore.userInfo.username }}！</h2>
            <p>这是一个基于 Spring Boot + Vue3 + Element Plus 的企业级脚手架项目</p>
            
            <el-divider />
            
            <h3>✨ 核心特性</h3>
            <ul>
              <li>✅ 多租户架构 - 完善的租户数据隔离</li>
              <li>✅ RBAC 权限模型 - 灵活的角色权限控制</li>
              <li>✅ JWT 认证 - 无状态的安全认证</li>
              <li>✅ 乐观锁控制 - 保障数据并发安全</li>
              <li>✅ MyBatis 持久层 - 原生 SQL 控制</li>
              <li>✅ Vue3 + Vite - 现代化前端技术栈</li>
            </ul>
            
            <el-divider />
            
            <h3>📚 功能模块</h3>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-tag type="success" size="large">用户管理</el-tag>
              </el-col>
              <el-col :span="8">
                <el-tag type="primary" size="large">租户管理</el-tag>
              </el-col>
              <el-col :span="8">
                <el-tag type="warning" size="large">角色权限</el-tag>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
}

.welcome-content h2 {
  color: #409eff;
  margin-bottom: 10px;
}

.welcome-content h3 {
  color: #303133;
  margin: 15px 0;
}

.welcome-content ul {
  list-style: none;
  padding: 0;
}

.welcome-content li {
  padding: 8px 0;
  font-size: 14px;
  color: #606266;
}

.el-tag {
  width: 100%;
  justify-content: center;
  margin: 5px 0;
}
</style>
