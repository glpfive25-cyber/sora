# API 混合模式说明

## 概述

系统现在采用混合 API 模式，不同功能使用不同的 API 版本：

- **视频工具和图像工具**：使用 V1 API (Chat API / Image API)
- **角色工具**：使用 V2 API (Video API)

---

## API 分配详情

### 视频工具（V1 Chat API）

**端点**: `/v1/chat/completions`

**功能**:
- 文生视频
- 图生视频

**请求格式**:
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

**支持的模型**:
- `sora_video2` - 标准模型
- `sora_video2-landscape` - 横屏
- `sora_video2-landscape-15s` - 横屏 15 秒
- `sora_video2-portrait` - 竖屏
- `sora_video2-portrait-15s` - 竖屏 15 秒

**响应方式**: 流式响应 (SSE)

---

### 图像工具（V1 Image API）

**端点**: `/v1/images/generations`

**功能**:
- 图像生成
- 图像编辑

**请求格式**:
```json
{
  "prompt": "图像描述",
  "model": "sora_image",
  "size": "1024x1024",
  "n": 1,
  "response_format": "b64_json"
}
```

**响应方式**: 直接返回 base64 图像

---

### 角色工具（V2 Video API）

**端点**: 
- 创建角色: `/sora/v1/characters`
- 角色视频: `/v2/videos/generations`
- 查询状态: `/v2/videos/generations/{task_id}`

**功能**:
- 角色创建
- 角色视频生成

**请求格式**:
```json
{
  "prompt": "视频描述",
  "model": "sora-2-pro",
  "aspect_ratio": "16:9",
  "duration": "10",
  "hd": false,
  "character_url": "https://...",
  "character_timestamps": "1,3"
}
```

**支持的模型**:
- `sora-2` - 标准模型
- `sora-2-pro` - Pro 模型
- `sora-2-landscape-hd` - 横屏高清
- `sora-2-portrait-hd` - 竖屏高清
- `sora-2-characters` - 角色专用

**响应方式**: 任务提交 + 轮询状态

---

## 为什么采用混合模式？

### 视频工具使用 V1 的原因
1. ✅ **实时反馈**: 流式响应提供即时进度
2. ✅ **成熟稳定**: V1 API 已经过充分测试
3. ✅ **用户体验**: 无需等待轮询，响应更快
4. ✅ **兼容性好**: 现有代码无需大改

### 角色工具使用 V2 的原因
1. ✅ **功能支持**: 只有 V2 支持角色参数
2. ✅ **任务管理**: V2 提供更好的任务状态追踪
3. ✅ **参数丰富**: 支持更多配置选项（HD、时长等）
4. ✅ **未来扩展**: V2 是未来的发展方向

---

## 代码实现

### Sora2 类结构

```javascript
class Sora2 {
  constructor(apiKey, baseURL, characterApiKey, characterBaseURL) {
    // 标准 API 客户端（用于视频和图像）
    this.client = axios.create({
      baseURL: this.baseURL,  // https://api.maynor1024.live/
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    
    // Pro API 客户端（用于角色）
    this.characterClient = axios.create({
      baseURL: this.characterBaseURL,  // https://apipro.maynor1024.live/
      headers: { 'Authorization': `Bearer ${this.characterApiKey}` }
    });
  }

  // V1 Chat API - 视频生成
  async generateVideo(prompt, options) {
    return await this.client.post('/v1/chat/completions', {
      model: options.model || 'sora_video2',
      messages: [...],
      stream: false
    });
  }

  // V1 Chat API - 流式视频生成
  async generateVideoStream(prompt, options, onProgress) {
    return await this.client.post('/v1/chat/completions', {
      model: options.model || 'sora_video2',
      messages: [...],
      stream: true
    }, {
      responseType: 'stream'
    });
  }

  // V1 Image API - 图像生成
  async generateImage(prompt, options) {
    return await this.client.post('/v1/images/generations', {
      prompt: prompt,
      model: options.model || 'sora_image',
      ...
    });
  }

  // V1 Character API - 角色创建
  async createCharacter(videoUrl, timestamps) {
    return await this.characterClient.post('/sora/v1/characters', {
      url: videoUrl,
      timestamps: timestamps
    });
  }

  // V2 Video API - 角色视频生成
  async createVideoWithCharacter(options) {
    return await this.characterClient.post('/v2/videos/generations', {
      prompt: options.prompt,
      model: options.model || 'sora-2-pro',
      aspect_ratio: options.aspect_ratio || '16:9',
      character_url: options.character_url,
      character_timestamps: options.character_timestamps,
      ...
    });
  }

  // V2 Video API - 查询任务状态
  async getVideoTaskStatus(taskId, useCharacterAPI = false) {
    const client = useCharacterAPI ? this.characterClient : this.client;
    return await client.get(`/v2/videos/generations/${taskId}`);
  }
}
```

---

## 功能对比表

| 功能 | API 版本 | 端点 | 响应方式 | 客户端 |
|------|---------|------|---------|--------|
| 文生视频 | V1 | `/v1/chat/completions` | 流式 SSE | `this.client` |
| 图生视频 | V1 | `/v1/chat/completions` | 流式 SSE | `this.client` |
| 图像生成 | V1 | `/v1/images/generations` | 直接返回 | `this.client` |
| 图像编辑 | V1 | `/v1/images/edits` | 直接返回 | `this.client` |
| 角色创建 | V1 | `/sora/v1/characters` | 直接返回 | `this.characterClient` |
| 角色视频 | V2 | `/v2/videos/generations` | 任务+轮询 | `this.characterClient` |
| 任务查询 | V2 | `/v2/videos/generations/{id}` | 直接返回 | `this.characterClient` |

---

## 环境变量配置

```env
# 标准 API（用于视频和图像工具）
SORA_API_KEY=your-standard-api-key
SORA_BASE_URL=https://api.maynor1024.live/

# Pro API（用于角色工具）
SORA_CHARACTER_API_KEY=your-pro-api-key
SORA_CHARACTER_BASE_URL=https://apipro.maynor1024.live/
```

---

## 前端参数格式

### 视频工具（V1）
```javascript
const requestBody = {
  prompt: "视频描述",
  model: "sora_video2",
  options: {
    orientation: "landscape",
    duration: 10,
    resolution: "1080p"
  },
  useStream: true
};
```

### 角色工具（V2）
```javascript
const requestData = {
  prompt: "视频描述",
  model: "sora-2-landscape-hd",
  size: "1920x1080",
  orientation: "landscape",
  duration: "10",
  character_url: "https://...",
  character_timestamps: "1,3"
};
```

---

## 优势总结

### 混合模式的优势
1. ✅ **最佳体验**: 每个功能使用最适合的 API
2. ✅ **灵活性高**: 可以独立升级不同功能
3. ✅ **稳定可靠**: 视频工具使用成熟的 V1 API
4. ✅ **功能完整**: 角色工具使用功能丰富的 V2 API
5. ✅ **向后兼容**: 保持现有功能不受影响

### 用户体验
- **视频生成**: 实时流式反馈，体验流畅
- **图像生成**: 快速直接返回，无需等待
- **角色功能**: 完整的任务管理，状态清晰

---

## 注意事项

### 视频工具（V1）
- ⚠️ 不支持 HD 参数
- ⚠️ 不支持 25 秒时长
- ⚠️ 模型名称使用下划线（`sora_video2`）

### 角色工具（V2）
- ⚠️ 需要轮询任务状态
- ⚠️ 生成时间可能更长
- ⚠️ 模型名称使用连字符（`sora-2-pro`）
- ⚠️ 视频中不能出现真人

---

## 测试建议

### 视频工具测试
- [ ] 文生视频（10秒）
- [ ] 文生视频（15秒）
- [ ] 图生视频
- [ ] 流式响应显示
- [ ] 错误重试机制

### 图像工具测试
- [ ] 图像生成
- [ ] 图像编辑
- [ ] 不同尺寸
- [ ] 负向提示词

### 角色工具测试
- [ ] 角色创建
- [ ] 角色视频生成
- [ ] 任务状态轮询
- [ ] 不同模型选择
- [ ] 进度显示

---

## 总结

✅ **已实现**:
- 视频工具使用 V1 Chat API（流式响应）
- 图像工具使用 V1 Image API（直接返回）
- 角色工具使用 V2 Video API（任务轮询）
- 双 API 配置支持
- 完整的错误处理

🎯 **优势**:
- 每个功能使用最适合的 API 版本
- 保持最佳用户体验
- 功能完整且稳定
- 易于维护和扩展

⚠️ **注意**:
- 不同功能使用不同的 API 格式
- 需要维护两套 API 逻辑
- 文档需要清晰说明差异

---

**混合模式已成功实现！系统现在同时支持 V1 和 V2 API。** 🎉
