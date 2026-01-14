# TNong Boot 前端项目

基于 Vue3 + Vite + Element Plus 的后台管理系统前端

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Naive UI** - Vue 3 UI 组件库
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue 状态管理
- **Axios** - HTTP 客户端

## 功能特性

- ✅ 用户登录认证
- ✅ JWT Token 管理
- ✅ 路由守卫
- ✅ 请求拦截器
- ✅ 响应拦截器
- ✅ 用户管理
- ✅ 租户管理
- ✅ 统一布局
- ✅ 面包屑导航

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:3000

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产构建

```bash
npm run preview
```

## 默认账号

- 用户名：admin
- 密码：123456
- 租户编码：DEFAULT

## 目录结构

```
src/
├── api/              # API 接口
├── assets/           # 静态资源
├── components/       # 公共组件
├── layout/           # 布局组件
├── router/           # 路由配置
├── stores/           # 状态管理
├── utils/            # 工具函数
├── views/            # 页面视图
├── App.vue           # 根组件
└── main.js           # 入口文件
```

## 配置说明

### API 代理

在 `vite.config.js` 中配置了 API 代理，所有 `/api` 请求会被代理到 `http://localhost:8080`

### 请求拦截

- 自动添加 Authorization 请求头
- Token 过期自动跳转登录页
- 统一错误提示

## 开发规范

1. 使用 Composition API
2. 使用 `<script setup>` 语法
3. 组件使用 PascalCase 命名
4. 使用 ES6+ 语法
5. 遵循 Vue 3 最佳实践

## 注意事项

1. 确保后端服务已启动（默认 8080 端口）
2. 登录后 Token 会保存在 localStorage
3. 页面刷新会自动恢复登录状态

---

更新时间：2025-12-13
