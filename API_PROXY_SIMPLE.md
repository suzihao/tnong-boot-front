# 前后端请求流程说明（简化版）

## ✅ 当前配置是正确的！

你的前端项目已经正确配置了与后端 8080 端口的交互。

### 配置概览

```
前端地址：http://localhost:3000
后端地址：http://localhost:8080
代理配置：Vite 自动将 /api/* 转发到后端
```

### 请求流程

```
1. 用户在浏览器访问前端
   http://localhost:3000
   
2. 前端发起登录请求
   fetch('/api/auth/login')
   
3. 浏览器实际请求
   http://localhost:3000/api/auth/login
   
4. Vite 代理自动转发
   → http://localhost:8080/api/auth/login
   
5. 后端处理请求
   @RequestMapping("/api/auth")
   @PostMapping("/login")
   ✅ 匹配成功！
```

### 为什么看起来不是 8080？

**在浏览器开发者工具（F12）的 Network 标签中，你会看到：**

```
Request URL: http://localhost:3000/api/auth/login
```

**这是正常的！** 因为：

1. **浏览器视角**：请求发送到前端服务器（3000 端口）
2. **Vite 代理**：在后台自动转发到后端（8080 端口）
3. **无跨域问题**：浏览器认为是同源请求

### 验证方法

#### 方法1：查看浏览器控制台

```javascript
// 在浏览器控制台输入
console.log(import.meta.env.DEV ? 'http://localhost:3000/api' : '/api')
```

#### 方法2：查看 Vite 启动日志

启动前端时，会显示：

```bash
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
➜  press h + enter to show help

Proxy configured:
  /api -> http://localhost:8080  ✅ 这里显示代理配置
```

#### 方法3：直接测试后端

```bash
# 在命令行测试后端是否正常
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456","tenantCode":"DEFAULT"}'
```

### 配置文件位置

1. **Vite 代理配置**
   - 文件：`d:\project\tnong-boot-front\vite.config.js`
   - 配置：`proxy: { '/api': { target: 'http://localhost:8080' } }`

2. **Axios 基础配置**
   - 文件：`d:\project\tnong-boot-front\src\utils\request.js`
   - 配置：`baseURL: '/api'`

3. **后端接口路径**
   - 文件：`d:\project\tnong-boot\src\main\java\...\AuthController.java`
   - 配置：`@RequestMapping("/api/auth")`

### 完整示例

**前端代码**：
```javascript
// src/api/auth.js
export function login(data) {
  return request({
    url: '/auth/login',  // 相对于 baseURL
    method: 'post',
    data
  })
}

// 最终请求：/api + /auth/login = /api/auth/login
// Vite 代理：/api/auth/login → http://localhost:8080/api/auth/login
```

**后端代码**：
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/login")  // 完整路径：/api/auth/login
    public Result<LoginVO> login(@RequestBody LoginDTO loginDTO) {
        // 处理登录
    }
}
```

### 如何确认配置正确？

1. ✅ **启动后端**：`.\mvnw.cmd spring-boot:run`
2. ✅ **启动前端**：`npm run dev`
3. ✅ **访问前端**：`http://localhost:3000`
4. ✅ **尝试登录**：输入 admin / 123456
5. ✅ **查看控制台**：应该看到登录成功

### 如果登录失败？

检查清单：

- [ ] 后端是否正常运行（检查 8080 端口）
- [ ] 数据库是否启动
- [ ] 测试数据是否已导入（init.sql）
- [ ] 浏览器控制台是否有错误信息
- [ ] 后端控制台是否有异常日志

### 总结

**你的配置已经是最佳实践！** 

✅ 前端使用 Vite 代理，避免跨域问题
✅ 后端接口路径规范，统一使用 /api 前缀
✅ 所有请求都会正确转发到后端 8080 端口

**无需修改任何配置！** 直接启动测试即可。

---

详细文档：`docs/API_PROXY.md`
