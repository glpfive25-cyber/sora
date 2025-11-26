# 视频 API 升级说明 (V1 → V2)

## 更新概述

根据最新的 API 文档，视频生成接口已从 V1 升级到 V2 格式。

---

## 主要变化

### 1. API 端点变化

**旧端点 (V1)**:
```
POST /v1/chat/completions
```

**新端点 (V2)**:
```
POST /v2/videos/generations  # 提交任务
GET  /v2/videos/{task_id}    # 查询状态
```

### 2. 请求格式变化

#### 旧格式 (Chat API)
```json
{
  "model": "sora_video2",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "视频描述" },
        { "type": "image_url", "image_url": { "url": "..." } }
      ]
    }
  ],
  "stream": true
}
```

#### 新格式 (Video API)
```json
{
  "prompt": "视频描述",
  "model": "sora-2",
  "aspect_ratio": "16:9",
  "duration": "10",
  "hd": false,
  "images": ["图片URL或base64"],
  "watermark": false,
  "private": false
}
```

### 3. 模型名称变化

| 旧模型名称 | 新模型名称 | 说明 |
|-----------|-----------|------|
| `sora_video2` | `sora-2` | 标准模型 |
| `sora_video2-landscape` | `sora-2` | 横屏（通过 aspect_ratio 控制） |
| `sora_video2-landscape-15s` | `sora-2-pro` | 横屏 15 秒 |
| `sora_video2-portrait` | `sora-2` | 竖屏（通过 aspect_ratio 控制） |
| `sora_video2-portrait-15s` | `sora-2-pro` | 竖屏 15 秒 |

### 4. 参数变化

#### 新增参数
- `aspect_ratio`: `"16:9"` 或 `"9:16"` (替代 orientation)
- `hd`: `true/false` (高清模式，仅 sora-2-pro 支持)
- `duration`: `"10"`, `"15"`, `"25"` (字符串格式)
- `watermark`: `true/false` (是否添加水印)
- `private`: `true/false` (是否隐藏视频)
- `notify_hook`: 回调 URL

#### 移除参数
- `messages` (改为直接使用 `prompt`)
- `stream` (改为轮询模式)
- `orientation` (改为 `aspect_ratio`)

### 5. 响应格式变化

#### 旧格式 (流式响应)
```json
{
  "choices": [{
    "message": {
      "content": "视频URL或任务信息"
    }
  }]
}
```

#### 新格式 (任务ID)
```json
{
  "task_id": "f0aa213c-c09e-4e19-a0e5-c698fe48acf1"
}
```

然后需要轮询查询状态：
```json
{
  "task_id": "...",
  "status": "completed",
  "progress": 100,
  "video_url": "https://...",
  "error": null
}
```

---

## 代码更新

### 1. Sora2 客户端 (sora2.js)

#### generateVideo 方法
```javascript
// 旧代码
const requestData = {
  model: model,
  messages: messages,
  stream: false
};
await this.client.post('/v1/chat/completions', requestData);

// 新代码
const requestData = {
  prompt: prompt,
  model: model,
  aspect_ratio: options.aspect_ratio || '16:9',
  duration: options.duration || '10',
  hd: options.hd || false,
  images: options.image ? [options.image] : undefined
};
await this.client.post('/v2/videos/generations', requestData);
```

#### generateVideoStream 方法
```javascript
// 旧代码：使用 SSE 流式响应
const response = await this.client.post('/v1/chat/completions', {
  stream: true
}, {
  responseType: 'stream'
});

// 新代码：提交任务后轮询状态
const response = await this.client.post('/v2/videos/generations', requestData);
const taskId = response.data.task_id;

// 轮询任务状态
const poll = async () => {
  const status = await this.client.get(`/v2/videos/${taskId}`);
  if (status.data.status === 'completed') {
    resolve(status.data);
  } else {
    setTimeout(poll, 5000); // 5秒后再次轮询
  }
};
```

### 2. 前端代码 (public/app.js)

#### 模型映射
```javascript
// 旧代码
const requestBody = {
  prompt: prompt,
  model: 'sora_video2',
  options: {
    orientation: 'landscape',
    duration: 10
  }
};

// 新代码
const requestBody = {
  prompt: prompt,
  model: 'sora-2',
  aspect_ratio: '16:9',
  duration: '10',
  hd: false
};
```

### 3. 服务器端 (server.js)

```javascript
// 旧代码
const { prompt, image, options, model } = req.body;
const videoOptions = {
  ...options,
  model: model,
  image: image
};

// 新代码
const { prompt, image, model, aspect_ratio, duration, hd } = req.body;
const videoOptions = {
  model: model || 'sora-2',
  aspect_ratio: aspect_ratio || '16:9',
  duration: duration || '10',
  hd: hd || false,
  image: image
};
```

---

## 轮询机制

### 轮询参数
- **轮询间隔**: 5 秒
- **最大轮询次数**: 120 次（10 分钟）
- **超时处理**: 超过最大次数后返回超时错误

### 任务状态
- `pending`: 等待中
- `processing`: 处理中
- `completed` / `success`: 完成
- `failed` / `error`: 失败

### 进度回调
```javascript
if (onProgress && status.progress !== undefined) {
  const progressText = `生成进度: ${status.progress}%`;
  onProgress(progressText, progressText);
}
```

---

## 支持的功能

### 文生视频
```json
{
  "prompt": "一只可爱的猫咪在玩球",
  "model": "sora-2",
  "aspect_ratio": "16:9",
  "duration": "10"
}
```

### 图生视频
```json
{
  "prompt": "让图片动起来",
  "model": "sora-2",
  "aspect_ratio": "16:9",
  "duration": "10",
  "images": ["https://example.com/image.jpg"]
}
```

### 高清视频 (Pro)
```json
{
  "prompt": "高清视频描述",
  "model": "sora-2-pro",
  "aspect_ratio": "16:9",
  "duration": "15",
  "hd": true
}
```

---

## 注意事项

### 1. 生成时间
- **10秒视频**: 1-3 分钟
- **15秒视频**: +2 分钟
- **高清模式**: +8 分钟
- **25秒视频**: 仅 sora-2-pro 支持，HD 不起作用

### 2. 审查机制
官方审查涉及 3 个阶段：
1. 提交的图片中是否涉及真人
2. 提示词内容是否违规（暴力、色情、版权、活着的名人）
3. 生成结果审查是否合格

### 3. 模型限制
- **sora-2**: 支持 10 秒，不支持 HD
- **sora-2-pro**: 支持 10/15/25 秒，支持 HD
- **25 秒模式**: HD 参数不起作用

### 4. 图片要求
- 支持 URL 或 base64 格式
- 图片访问速度会影响生成时间
- 建议使用美国访问速度较快的图片地址

---

## 兼容性

### 向后兼容
- 前端旧的模型名称会自动映射到新格式
- 服务器端自动转换参数格式
- 用户无需修改现有配置

### 测试建议
1. 测试文生视频（10秒）
2. 测试图生视频
3. 测试 15 秒视频（Pro）
4. 测试高清模式（Pro）
5. 测试不同的 aspect_ratio

---

## 迁移检查清单

- [x] 更新 API 端点 (V1 → V2)
- [x] 更新请求格式
- [x] 更新模型名称映射
- [x] 实现轮询机制
- [x] 更新参数格式
- [x] 更新响应处理
- [x] 保持向后兼容
- [x] 更新错误处理
- [x] 测试所有功能

---

## 总结

✅ **已完成**:
- API 端点升级到 V2
- 请求格式更新
- 模型名称映射
- 轮询机制实现
- 参数格式转换
- 向后兼容支持

🎯 **优势**:
- 更清晰的 API 结构
- 更灵活的参数控制
- 支持更多功能（HD、25秒等）
- 更好的任务管理

⚠️ **注意**:
- 不再支持流式响应，改为轮询
- 生成时间可能更长
- 需要处理任务状态轮询
