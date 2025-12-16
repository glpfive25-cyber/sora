# API配置优先级说明

## 更新内容

服务端已移除内置的API Key，改为优先使用前端配置，提供更灵活的配置方式。

## 配置优先级

系统按以下优先级获取API配置：

1. **前端配置**（最高优先级）
   - 在前端"设置"页面配置的 API Key 和 Base URL
   - 通过请求头 `x-api-key` 和 `x-base-url` 传递

2. **环境变量配置**（备用）
   - `.env` 文件中的 `SORA_API_KEY` 和 `SORA_BASE_URL`
   - 仅在前端未配置时使用

3. **无配置**
   - 如果两者都未配置，API请求将返回错误

## 推荐配置方式

### 方式一：前端配置（推荐）✅

**优点**：
- ✅ 无需重启服务器
- ✅ 可以随时切换不同的API
- ✅ 支持多用户使用不同的API Key
- ✅ 配置保存在浏览器本地，更安全

**步骤**：
1. 打开应用
2. 点击右上角"设置"图标
3. 输入 API Key 和 Base URL
4. 点击"保存配置"

**配置示例**：
```
API Key: sk-xxxxxxxxxxxxx
Base URL: https://api.maynor1024.live/
```

### 方式二：环境变量配置（备用）

**优点**：
- ✅ 适合单用户部署
- ✅ 配置一次，永久生效
- ✅ 适合服务器端部署

**缺点**：
- ❌ 修改后需要重启服务器
- ❌ 所有用户共用同一个API Key
- ❌ 配置文件可能被意外提交到代码仓库

**步骤**：
1. 复制 `.env.example` 为 `.env`
2. 取消注释并填写配置：
   ```bash
   SORA_API_KEY=your_api_key_here
   SORA_BASE_URL=https://api.maynor1024.live/
   ```
3. 重启服务器

## 配置流程图

```
请求到达
  ↓
检查请求头中的 x-api-key 和 x-base-url
  ↓
有前端配置？
  ├─ 是 → 使用前端配置 ✅
  └─ 否 → 检查环境变量
           ↓
         有环境变量配置？
           ├─ 是 → 使用环境变量配置 ✅
           └─ 否 → 返回错误 ❌
```

## 错误处理

### 错误：API配置缺失

**错误信息**：
```json
{
  "error": "API配置缺失，请在前端设置API Key和Base URL"
}
```

**解决方案**：
1. 在前端设置页面配置 API Key 和 Base URL
2. 或者在 `.env` 文件中配置环境变量

### 错误：API Key 无效

**错误信息**：
```json
{
  "error": "Request failed with status code 401"
}
```

**解决方案**：
1. 检查 API Key 是否正确
2. 检查 API Key 是否已过期
3. 联系 API 提供商确认账户状态

## 安全建议

### ✅ 推荐做法

1. **使用前端配置**
   - 配置保存在浏览器本地存储
   - 不会被提交到代码仓库

2. **保护 .env 文件**
   - 确保 `.env` 在 `.gitignore` 中
   - 不要将 `.env` 提交到代码仓库

3. **定期更换 API Key**
   - 定期更换 API Key 提高安全性
   - 如果 API Key 泄露，立即更换

### ❌ 不推荐做法

1. **不要硬编码 API Key**
   - 不要在代码中直接写入 API Key
   - 不要在前端代码中暴露 API Key

2. **不要共享 API Key**
   - 不要将 API Key 分享给他人
   - 不要在公开场合展示 API Key

3. **不要提交配置文件**
   - 不要将 `.env` 提交到 Git
   - 不要在截图中包含 API Key

## 多用户场景

### 场景一：个人使用

**推荐配置**：前端配置或环境变量配置

```
用户 → 前端配置 → 服务器 → API
```

### 场景二：团队共享部署

**推荐配置**：每个用户使用自己的前端配置

```
用户A → 前端配置A → 服务器 → API (使用A的Key)
用户B → 前端配置B → 服务器 → API (使用B的Key)
```

### 场景三：公共服务

**推荐配置**：环境变量配置（统一的API Key）

```
所有用户 → 服务器(环境变量) → API (统一Key)
```

## 迁移指南

### 从旧版本迁移

如果你之前在 `.env` 中配置了 API Key：

1. **保持不变**（推荐）
   - 旧的环境变量配置仍然有效
   - 作为备用配置使用

2. **迁移到前端**（可选）
   - 在前端设置页面配置 API Key
   - 删除 `.env` 中的配置
   - 重启服务器

## 常见问题

### Q: 前端配置和环境变量都配置了，使用哪个？
A: 优先使用前端配置。前端配置会覆盖环境变量配置。

### Q: 可以不配置 API Key 吗？
A: 不可以。必须至少配置一种方式（前端或环境变量）。

### Q: 前端配置保存在哪里？
A: 保存在浏览器的 localStorage 中，清除浏览器数据会丢失配置。

### Q: 环境变量配置需要重启服务器吗？
A: 是的。修改 `.env` 文件后需要重启服务器才能生效。

### Q: 前端配置安全吗？
A: 相对安全。配置保存在用户本地浏览器，不会被其他用户访问。但请注意不要在公共电脑上保存敏感配置。

### Q: 可以同时使用多个 API Key 吗？
A: 可以。不同用户可以在前端配置不同的 API Key。

## 技术实现

### 服务端代码

```javascript
// 辅助函数：从请求中获取或创建 Sora 实例
function getSoraInstance(req) {
  const customApiKey = req.headers['x-api-key'];
  const customBaseUrl = req.headers['x-base-url'];
  
  // 优先使用前端配置
  if (customApiKey && customBaseUrl) {
    return new Sora2(customApiKey, customBaseUrl);
  }
  
  // 备用：使用环境变量
  if (process.env.SORA_API_KEY) {
    return new Sora2(
      process.env.SORA_API_KEY,
      process.env.SORA_BASE_URL || 'https://api.maynor1024.live/'
    );
  }
  
  // 无配置
  return null;
}
```

### 前端代码

```javascript
// 从本地存储获取配置
const apiKey = localStorage.getItem('apiKey');
const baseUrl = localStorage.getItem('baseUrl');

// 在请求头中传递配置
fetch('/api/video/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'x-base-url': baseUrl
  },
  body: JSON.stringify(requestBody)
});
```

## 总结

- ✅ **推荐使用前端配置**：灵活、安全、易用
- ✅ **环境变量作为备用**：适合单用户或服务器部署
- ✅ **优先级明确**：前端配置 > 环境变量 > 无配置
- ✅ **安全第一**：不要泄露 API Key，定期更换
