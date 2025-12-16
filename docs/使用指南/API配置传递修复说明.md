# API配置传递修复说明

## 问题描述

用户遇到错误：
```
Video generation error: 无效的令牌 [sk-2zE***XdS]
```

## 根本原因

前端在发送API请求时，没有将用户配置的API Key和Base URL传递给服务端，导致服务端使用了环境变量中的（可能无效的）API Key。

## 修复内容

### 1. 添加辅助函数

在 `public/app.js` 中添加了 `getApiHeaders()` 函数：

```javascript
// 获取带API配置的请求头
function getApiHeaders(additionalHeaders = {}) {
    const config = getApiConfig();
    const headers = {
        'Content-Type': 'application/json',
        ...additionalHeaders
    };
    
    // 如果有自定义API配置，添加到请求头
    if (config.apiKey && config.baseUrl) {
        headers['x-api-key'] = config.apiKey;
        headers['x-base-url'] = config.baseUrl;
    }
    
    return headers;
}
```

### 2. 更新所有API请求

所有前端API请求现在都使用 `getApiHeaders()` 来包含API配置：

#### 视频生成
```javascript
const response = await fetch('/api/video/generate', {
    method: 'POST',
    headers: getApiHeaders(),  // ✅ 添加API配置
    body: JSON.stringify(requestBody),
    signal: controller.signal
});
```

#### 任务查询
```javascript
const response = await fetch(`/api/video-task/${taskId}`, {
    method: 'GET',
    headers: getApiHeaders()  // ✅ 添加API配置
});
```

#### 图像生成
```javascript
const response = await fetch('/api/chat', {
    method: 'POST',
    headers: getApiHeaders(),  // ✅ 添加API配置
    body: JSON.stringify(requestBody)
});
```

#### 图像编辑
```javascript
const response = await fetch('/api/chat', {
    method: 'POST',
    headers: getApiHeaders(),  // ✅ 添加API配置
    body: JSON.stringify(requestBody),
    signal: controller.signal
});
```

#### 流式聊天
```javascript
const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: getApiHeaders(),  // ✅ 添加API配置
    body: JSON.stringify({...})
});
```

### 3. 增强服务端日志

在 `server.js` 的 `getSoraInstance()` 函数中添加了详细日志：

```javascript
function getSoraInstance(req) {
  const customApiKey = req.headers['x-api-key'];
  const customBaseUrl = req.headers['x-base-url'];
  
  // 如果前端提供了自定义配置，使用前端配置
  if (customApiKey && customBaseUrl) {
    console.log('[Server] Using custom API from frontend');
    console.log('[Server] Frontend API Key:', customApiKey ? `${customApiKey.substring(0, 8)}...` : 'none');
    console.log('[Server] Frontend Base URL:', customBaseUrl);
    return new Sora2(customApiKey, customBaseUrl);
  }
  
  // 否则使用环境变量配置（如果有）
  if (process.env.SORA_API_KEY) {
    console.log('[Server] Using API from environment variables');
    console.log('[Server] Env API Key:', process.env.SORA_API_KEY ? `${process.env.SORA_API_KEY.substring(0, 8)}...` : 'none');
    console.log('[Server] Env Base URL:', process.env.SORA_BASE_URL || 'https://api.maynor1024.live/');
    return new Sora2(
      process.env.SORA_API_KEY,
      process.env.SORA_BASE_URL || 'https://api.maynor1024.live/'
    );
  }
  
  // 如果都没有，返回 null
  console.warn('[Server] No API configuration found');
  return null;
}
```

## 工作流程

### 修复前
```
前端 → 服务器（使用环境变量中的无效Key）→ API ❌
```

### 修复后
```
前端（带API配置）→ 服务器（使用前端配置）→ API ✅
```

## 配置优先级

1. **前端配置**（最高优先级）
   - 从 localStorage 读取用户配置
   - 通过请求头 `x-api-key` 和 `x-base-url` 传递
   - 服务端优先使用前端配置

2. **环境变量配置**（备用）
   - 从 `.env` 或 Vercel 环境变量读取
   - 仅在前端未配置时使用

3. **无配置**（报错）
   - 返回 400 错误
   - 提示用户配置API Key

## 验证方法

### 1. 检查浏览器控制台

打开浏览器开发者工具，查看网络请求：

```
Request Headers:
  Content-Type: application/json
  x-api-key: sk-xxxxxxxxxxxxx
  x-base-url: https://api.maynor1024.live/
```

### 2. 检查服务器日志

查看服务器控制台输出：

```
[Server] Using custom API from frontend
[Server] Frontend API Key: sk-2zE***...
[Server] Frontend Base URL: https://api.maynor1024.live/
```

### 3. 测试功能

1. 在前端设置页面配置API Key
2. 生成一个视频
3. 检查是否成功

## 常见问题

### Q: 为什么之前没有传递API配置？
A: 之前的代码遗漏了在请求头中添加API配置，导致服务端无法获取前端配置。

### Q: 环境变量中的API Key无效怎么办？
A: 在前端设置页面配置有效的API Key，前端配置会覆盖环境变量。

### Q: 如何确认使用的是哪个API Key？
A: 查看服务器日志，会显示使用的是前端配置还是环境变量。

### Q: 所有请求都需要传递API配置吗？
A: 是的，所有需要调用外部API的请求都需要传递配置。

### Q: 如果前端没有配置会怎样？
A: 服务端会尝试使用环境变量配置。如果环境变量也没有，会返回400错误。

## 测试清单

- [x] 视频生成请求传递API配置
- [x] 任务查询请求传递API配置
- [x] 图像生成请求传递API配置
- [x] 图像编辑请求传递API配置
- [x] 流式聊天请求传递API配置
- [x] 服务端正确读取请求头
- [x] 服务端日志显示配置来源
- [x] 前端配置优先于环境变量
- [x] 无配置时返回友好错误

## 部署建议

### Vercel部署

1. **清除无效的环境变量**
   - 在 Vercel 项目设置中删除无效的 `SORA_API_KEY`
   - 或者更新为有效的API Key

2. **推荐配置方式**
   - 不在 Vercel 配置环境变量
   - 让用户在前端设置页面配置
   - 这样每个用户可以使用自己的API Key

3. **备用配置**
   - 如果需要提供默认API Key
   - 在 Vercel 配置有效的环境变量
   - 用户可以在前端覆盖

## 总结

- ✅ **修复了API配置传递问题**：所有请求现在都正确传递API配置
- ✅ **添加了辅助函数**：`getApiHeaders()` 统一处理请求头
- ✅ **增强了日志**：便于诊断配置问题
- ✅ **优先级明确**：前端配置 > 环境变量 > 无配置
- ✅ **用户友好**：清晰的错误提示和配置指引
