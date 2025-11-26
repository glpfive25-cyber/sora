# 文生视频 API 调用流程

## 完整调用链路

### 1. 前端发起请求

**文件**: `public/app.js`

```javascript
const response = await fetch('/api/video/generate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        prompt: "视频描述",
        model: "sora_video2",
        useStream: true,  // 使用流式模式
        options: {}
    })
});
```

**端点**: `/api/video/generate`（本地服务器代理）

---

### 2. 服务器端处理

**文件**: `server.js`

```javascript
app.post('/api/video/generate', async (req, res) => {
    const { prompt, image, options, model, useStream } = req.body;
    
    // 使用标准 API 客户端
    const soraInstance = sora;  // 或自定义配置的实例
    
    if (useStream) {
        // 流式模式
        const result = await soraInstance.generateVideoStream(
            prompt, 
            videoOptions, 
            onProgress
        );
    } else {
        // 非流式模式
        const response = await soraInstance.generateVideo(prompt, videoOptions);
    }
});
```

**使用的客户端**: `this.client`（标准 API 客户端）

---

### 3. Sora2 客户端调用

**文件**: `sora2.js`

#### 标准 API 客户端配置

```javascript
class Sora2 {
  constructor(apiKey, baseURL, characterApiKey, characterBaseURL) {
    this.apiKey = apiKey;
    this.baseURL = baseURL || 'https://api.maynor1024.live/';
    
    // 标准 API 客户端（用于视频和图像工具）
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 600000
    });
  }
}
```

#### 实际 API 调用

```javascript
async generateVideoStream(prompt, options = {}, onProgress) {
    // 构建消息
    const messages = [{
        role: 'user',
        content: [
            { type: 'text', text: prompt },
            // 如果有图片
            { type: 'image_url', image_url: { url: image } }
        ]
    }];
    
    // 调用 Chat API
    const response = await this.client.post('/v1/chat/completions', {
        model: model || 'sora_video2',
        messages: messages,
        stream: true
    }, {
        timeout: 600000,
        responseType: 'stream'
    });
}
```

**实际调用的 API**: `POST /v1/chat/completions`

---

## API 端点详情

### 最终调用的 API

**完整 URL**: 
```
https://api.maynor1024.live/v1/chat/completions
```

**方法**: `POST`

**请求头**:
```
Authorization: Bearer {SORA_API_KEY}
Content-Type: application/json
```

**请求体**:
```json
{
  "model": "sora_video2",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "视频描述文本"
        }
      ]
    }
  ],
  "stream": true
}
```

**响应格式**: Server-Sent Events (SSE) 流式响应

---

## 配置说明

### 环境变量

```env
# 标准 API 配置（用于文生视频）
SORA_API_KEY=your-standard-api-key
SORA_BASE_URL=https://api.maynor1024.live/
```

### 使用的客户端

- **文生视频**: `this.client` (标准 API)
- **图生视频**: `this.client` (标准 API)
- **图像生成**: `this.client` (标准 API)
- **角色创建**: `this.characterClient` (Pro API)
- **角色视频**: `this.characterClient` (Pro API)

---

## 支持的模型

文生视频支持以下模型（通过标准 API）:

1. `sora_video2` - 标准模型（默认）
2. `sora_video2-landscape` - 横屏模型
3. `sora_video2-landscape-15s` - 横屏 15 秒
4. `sora_video2-portrait` - 竖屏模型
5. `sora_video2-portrait-15s` - 竖屏 15 秒

---

## 流程图

```
用户输入描述
    ↓
前端: /api/video/generate
    ↓
服务器: server.js
    ↓
Sora2 客户端: this.client (标准 API)
    ↓
实际 API: https://api.maynor1024.live/v1/chat/completions
    ↓
流式响应 (SSE)
    ↓
服务器转发
    ↓
前端显示进度
    ↓
完成
```

---

## 与角色视频的区别

### 文生视频（标准 API）

- **API 地址**: `https://api.maynor1024.live/`
- **客户端**: `this.client`
- **API Key**: `SORA_API_KEY`
- **端点**: `/v1/chat/completions`
- **模型**: `sora_video2` 系列

### 角色视频（Pro API）

- **API 地址**: `https://apipro.maynor1024.live/`
- **客户端**: `this.characterClient`
- **API Key**: `SORA_CHARACTER_API_KEY`
- **端点**: `/v1/chat/completions`
- **模型**: `sora-2-landscape-hd` 系列

---

## 错误处理

### 503 错误处理流程

1. **API 返回 503**:
   ```json
   {
     "type": "error",
     "error": "Request failed with status code 503",
     "statusCode": 503
   }
   ```

2. **服务器捕获并转发**:
   ```javascript
   res.write(`data: ${JSON.stringify({
     type: 'error',
     error: streamError.message,
     statusCode: 503
   })}\n\n`);
   ```

3. **前端识别并重试**:
   ```javascript
   if (error.statusCode === 503 && retryCount < MAX_RETRIES) {
     // 等待后重试
     await new Promise(resolve => setTimeout(resolve, retryDelay));
     return await attemptVideoGeneration(...);
   }
   ```

---

## 调试技巧

### 查看完整请求

在浏览器控制台:
```javascript
// 查看前端请求
[Video] Sending request: {prompt: "...", model: "sora_video2"}

// 查看服务器日志
[Server] Using stream mode for video generation

// 查看 Sora2 客户端
[Sora2] Using model: sora_video2 (stream mode)
[Sora2] Initialized with baseURL: https://api.maynor1024.live/
```

### 验证 API 配置

```javascript
// 检查使用的 API
console.log('Base URL:', sora.baseURL);
console.log('Has API Key:', !!sora.apiKey);

// 输出:
// Base URL: https://api.maynor1024.live/
// Has API Key: true
```

---

## 总结

**文生视频调用的 API**:
- ✅ 标准 API: `https://api.maynor1024.live/`
- ✅ 端点: `/v1/chat/completions`
- ✅ 使用客户端: `this.client`
- ✅ API Key: `SORA_API_KEY`
- ✅ 支持流式响应
- ✅ 自动重试机制

这与角色视频使用的 Pro API (`https://apipro.maynor1024.live/`) 是分开的。
