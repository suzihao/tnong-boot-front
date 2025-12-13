# 前端项目启动说明

## ⚠️ Node.js 版本问题

当前 Node.js 版本：**14.18.2**（太旧）

Vite 5 要求：**Node.js >= 18.0.0**

## 解决方案

### 方案一：升级 Node.js（推荐）

1. 访问 Node.js 官网下载最新 LTS 版本：https://nodejs.org/
2. 推荐下载 **Node.js 20.x LTS** 或更新版本
3. 安装后重启终端
4. 验证版本：`node -v`

### 方案二：降级前端依赖

修改 `package.json`，降级 Vite 版本：

```json
{
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.0.0",
    "vite": "^4.0.0",
    "sass": "^1.72.0"
  }
}
```

然后重新安装：
```bash
cd d:\project\tnong-boot-front
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 项目已创建完成 ✅

所有前端代码文件已创建：

- ✅ 登录页面（美观的紫色渐变）
- ✅ 后台管理布局（侧边栏+顶栏）
- ✅ 首页仪表盘
- ✅ 用户管理页面
- ✅ 租户管理页面
- ✅ JWT Token 认证
- ✅ 路由守卫
- ✅ 请求拦截器
- ✅ Pinia 状态管理
- ✅ Element Plus UI

## 项目特点

1. **完整的登录流程**
   - 用户名/密码验证
   - JWT Token 存储
   - 自动跳转

2. **统一的后台布局**
   - 深色侧边栏
   - 顶部导航栏
   - 面包屑导航
   - 用户信息下拉菜单

3. **API 代理配置**
   - 前端 3000 端口
   - 后端 8080 端口
   - 自动代理 `/api/*`

4. **状态管理**
   - Token 持久化
   - 用户信息缓存
   - 登录状态管理

## 默认账号

- 用户名：**admin**
- 密码：**123456**
- 租户编码：**DEFAULT**

## 启动步骤（升级 Node.js 后）

```bash
# 1. 进入前端目录
cd d:\project\tnong-boot-front

# 2. 安装依赖（如果未安装）
npm install

# 3. 启动开发服务器
npm run dev
```

访问：**http://localhost:3000**

## 技术栈

- Vue 3.4
- Vite 5.x
- Element Plus 2.6
- Vue Router 4
- Pinia 2
- Axios

## 项目结构

```
src/
├── api/              # API 接口
├── layout/           # 布局组件
├── router/           # 路由配置
├── stores/           # 状态管理
├── utils/            # 工具函数
├── views/            # 页面组件
│   ├── Login.vue
│   ├── Dashboard.vue
│   └── system/
│       ├── User.vue
│       └── Tenant.vue
├── App.vue
└── main.js
```

## 如何测试

1. **确保后端运行**：`d:\project\tnong-boot` 后端服务在 8080 端口
2. **升级 Node.js** 到 18+ 版本
3. **启动前端**：`npm run dev`
4. **访问登录页**：http://localhost:3000
5. **输入账号密码**：admin / 123456
6. **点击登录**
7. **进入后台管理界面**

## 核心功能

### 1. 登录认证
- Token 自动存储
- 请求自动携带 Authorization
- Token 过期自动退出

### 2. 路由守卫
- 未登录自动跳转登录页
- 已登录不能访问登录页

### 3. 用户管理
- 列表查询（集成后端 API）
- 分页功能
- 删除操作

### 4. 退出登录
- 清除 Token
- 清除用户信息
- 跳转登录页

## 后续开发

项目框架已搭建完成，可以继续开发：
1. 用户新增/编辑对话框
2. 租户 CRUD 功能
3. 角色权限管理
4. 部门管理
5. 菜单管理

---

**重要提示**：请先升级 Node.js 到 18+ 版本，然后再启动前端项目！

Node.js 下载地址：https://nodejs.org/en/download/
