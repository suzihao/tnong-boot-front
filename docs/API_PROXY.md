# 前后端请求路径配置说明

## 当前配置（正确 ✅）

### 前端配置

#### 1. Vite 代理配置 (vite.config.js)

```javascript
export default defineConfig({
  server: {
    port: 3000,              // 前端运行在 3000 端口
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // 后端地址
        changeOrigin: true                 // 允许跨域
      }
    }
  }
})
```

**作用**：
- 前端访问 `http://localhost:3000/api/*` 
- Vite 自动代理到 `http://localhost:8080/api/*`

#### 2. Axios 配置 (src/utils/request.js)

```javascript
const service = axios.create({
  baseURL: '/api',      // 所有请求前缀
  timeout: 30000
})
```

**作用**：
- 所有 API 请求都会自动加上 `/api` 前缀

#### 3. API 接口定义 (src/api/auth.js)

```javascript
export function login(data) {
  return request({
    url: '/auth/login',   // 相对于 baseURL
    method: 'post',
    data
  })
}
```

### 后端配置

#### 1. Controller 路径 (AuthController.java)

```java
@RestController
@RequestMapping("/api/auth")  // 接口路径前缀
public class AuthController {
    
    @PostMapping("/login")    // 完整路径: /api/auth/login
    public Result<LoginVO> login(@RequestBody LoginDTO loginDTO) {
        // ...
    }
}
```

#### 2. 其他 Controller 路径

- **用户管理**：`@RequestMapping("/api/system/user")`
  - 列表：`GET /api/system/user/page`
  - 详情：`GET /api/system/user/{id}`
  - 新增：`POST /api/system/user`
  - 更新：`PUT /api/system/user`
  - 删除：`DELETE /api/system/user/{id}`

- **租户管理**：`@RequestMapping("/api/system/tenant")`
  - 列表：`GET /api/system/tenant/page`
  - 详情：`GET /api/system/tenant/{id}`
  - 新增：`POST /api/system/tenant`
  - 更新：`PUT /api/system/tenant`
  - 删除：`DELETE /api/system/tenant/{id}`

---

## 完整请求流程

### 示例：用户登录

#### 1. 前端调用

```javascript
// 在组件中调用
import { login } from '@/api/auth'

await login({
  username: 'admin',
  password: '123456',
  tenantCode: 'DEFAULT'
})
```

#### 2. 请求构建过程

```
第1步：API 定义的 URL
  '/auth/login'

第2步：加上 baseURL
  '/api' + '/auth/login' = '/api/auth/login'

第3步：浏览器实际请求
  'http://localhost:3000/api/auth/login'

第4步：Vite 代理转发
  'http://localhost:8080/api/auth/login'

第5步：后端接收
  @RequestMapping("/api/auth")
  @PostMapping("/login")
  最终匹配：/api/auth/login ✅
```

#### 3. 完整流程图

```
┌─────────────────────┐
│  前端组件调用        │
│  login({ ... })     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  API 层封装         │
│  url: '/auth/login' │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Axios 实例         │
│  baseURL: '/api'    │
│  完整URL: '/api/auth/login'
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  浏览器发起请求      │
│  http://localhost:3000/api/auth/login
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Vite 代理          │
│  proxy: '/api' →    │
│  'http://localhost:8080'
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  后端接收请求        │
│  http://localhost:8080/api/auth/login
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Spring Controller  │
│  @RequestMapping("/api/auth")
│  @PostMapping("/login")
│  匹配成功 ✅         │
└─────────────────────┘
```

---

## 为什么不直接访问 8080 端口？

### 问题：跨域限制（CORS）

如果前端直接访问后端 8080 端口：

```javascript
// ❌ 不推荐的做法
const service = axios.create({
  baseURL: 'http://localhost:8080/api'  // 直接访问后端
})
```

**会出现的问题**：

```
Access to XMLHttpRequest at 'http://localhost:8080/api/auth/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 解决方案：使用 Vite 代理

```javascript
// ✅ 推荐的做法
const service = axios.create({
  baseURL: '/api'  // 相对路径，由 Vite 代理
})
```

**优势**：
1. **无跨域问题**：浏览器认为是同源请求（都是 localhost:3000）
2. **简化配置**：不需要后端配置 CORS
3. **开发便捷**：前后端分离开发
4. **生产部署**：生产环境可以用 Nginx 代理替代

---

## 验证配置是否正确

### 1. 启动后端

```bash
cd d:\project\tnong-boot
.\mvnw.cmd spring-boot:run
```

后端应该运行在：`http://localhost:8080`

### 2. 启动前端

```bash
cd d:\project\tnong-boot-front
npm run dev
```

前端应该运行在：`http://localhost:3000`

### 3. 测试登录

打开浏览器访问：`http://localhost:3000`

1. 输入账号密码
2. 点击登录
3. 打开浏览器开发者工具（F12）
4. 查看 Network 标签

**应该看到**：

```
Request URL: http://localhost:3000/api/auth/login  ← 浏览器看到的
Status: 200 OK
Response: { code: 200, data: { token: "..." } }
```

**实际请求**：

```
Vite 代理转发到: http://localhost:8080/api/auth/login  ← 实际到达后端
```

---

## 常见问题排查

### 问题1：404 Not Found

**现象**：
```
POST http://localhost:3000/api/auth/login 404 (Not Found)
```

**可能原因**：
1. 后端没有启动
2. 后端端口不是 8080
3. Controller 路径不匹配

**解决方法**：
```bash
# 检查后端是否运行
curl http://localhost:8080/api/auth/login

# 检查后端端口
netstat -ano | findstr 8080
```

### 问题2：CORS 错误

**现象**：
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**可能原因**：
1. Vite 代理配置错误
2. 前端直接访问了 8080 端口

**解决方法**：
- 确认 `vite.config.js` 中的代理配置正确
- 确认 `request.js` 中 `baseURL: '/api'` 是相对路径

### 问题3：500 Internal Server Error

**现象**：
```
POST http://localhost:3000/api/auth/login 500
```

**可能原因**：
1. 后端代码错误
2. 数据库连接失败
3. 缺少必要的数据

**解决方法**：
- 查看后端控制台日志
- 检查数据库是否启动
- 确认测试数据是否已导入

---

## 生产环境部署

### 前端构建

```bash
cd d:\project\tnong-boot-front
npm run build
```

生成 `dist/` 目录

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /var/www/tnong-boot-front/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理到后端
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**效果**：
- 访问 `http://your-domain.com` → 前端页面
- 访问 `http://your-domain.com/api/*` → 后端 API

---

## 接口列表总结

### 认证接口 (/api/auth)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 用户退出 |
| GET | /api/auth/info | 获取当前用户信息 |

### 用户管理 (/api/system/user)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/system/user/page | 分页查询用户列表 |
| GET | /api/system/user/{id} | 获取用户详情 |
| POST | /api/system/user | 新增用户 |
| PUT | /api/system/user | 更新用户 |
| DELETE | /api/system/user/{id} | 删除用户 |

### 租户管理 (/api/system/tenant)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/system/tenant/page | 分页查询租户列表 |
| GET | /api/system/tenant/{id} | 获取租户详情 |
| POST | /api/system/tenant | 新增租户 |
| PUT | /api/system/tenant | 更新租户 |
| DELETE | /api/system/tenant/{id} | 删除租户 |

---

## 总结

✅ **当前配置完全正确**

- 前端：`http://localhost:3000`
- 后端：`http://localhost:8080`
- 代理：Vite 自动将 `/api/*` 代理到后端

✅ **请求路径完全匹配**

- 前端请求：`/api/auth/login`
- Vite 代理：`http://localhost:8080/api/auth/login`
- 后端接口：`@RequestMapping("/api/auth") + @PostMapping("/login")`

✅ **无需任何修改**

当前配置已经是最佳实践，无需改动！

---

更新时间：2025-12-13
