# V2 API 升级完成总结

## 升级概述

已成功将视频生成 API 从 V1 (Chat API) 升级到 V2 (Video API)，并完成所有相关功能的适配。

---

## 完成的工作

### 1. 核心 API 升级

#### 文生视频 & 图生视频
- ✅ 端点更新：`/v1/chat/completions` → `/v2/videos/generations`
- ✅ 请求格式更新：从 Chat 格式改为 Video 格式
- ✅ 参数更新：
  - `aspect_ratio`: `16:9` 或 `9:16`
  - `duration`: `10`, `15`, `25`
  - `hd`: boolean
  - `model`: `sora-2` 或 `sora-2-pro`
- ✅ 响应处理：从流式改为任务提交 + 轮询

#### 角色视频生成
- ✅ 端点更新：使用相同的 `/v2/videos/generations`
- ✅ 添加角色参数：
  - `character_url`: 角色视频 URL
  - `character_timestamps`: 时间范围（如 `1,3`）
- ✅ 保持角色创建接口不变：`/sora/v1/characters`

#### 任务状态查询
- ✅ 端点：`/v2/videos/generations/{task_id}`
- ✅ 状态枚举：
  - `NOT_START`: 未开始
  - `IN_PROGRESS`: 正在执行
  - `SUCCESS`: 执行完成
  - `FAILURE`: 失败
- ✅ 进度显示：`progress` 字段（如 `100%`）

### 2. 轮询机制实现

```javascript
// 轮询参数
const maxPolls = 120;        // 最多 120 次
const pollInterval = 5000;   // 每 5 秒一次
// 总时长：10 分钟
```

**轮询逻辑：**
1. 提交任务获取 `task_id`
2. 每 5 秒查询一次状态
3. 根据状态决定：
   - `SUCCESS` → 返回视频 URL
   - `FAILURE` → 抛出错误
   - `NOT_START` / `IN_PROGRESS` → 继续轮询
4. 超过 120 次 → 超时错误

### 3. 模型名称映射

| 前端模型名 | API 模型名 | 说明 |
|-----------|-----------|------|
| `sora_video2` | `sora-2` | 标准模型 |
| `sora_video2-landscape` | `sora-2` | 横屏（通过 aspect_ratio） |
| `sora_video2-landscape-15s` | `sora-2-pro` | 横屏 15 秒 |
| `sora_video2-portrait` | `sora-2` | 竖屏（通过 aspect_ratio） |
| `sora_video2-portrait-15s` | `sora-2-pro` | 竖屏 15 秒 |

### 4. 双 API 配置

**标准 API** (`https://api.maynor1024.live/`):
- 文生视频
- 图生视频
- 图像生成
- 图像编辑

**Pro API** (`https://apipro.maynor1024.live/`):
- 角色创建
- 角色视频生成
- 查询角色视频状态

### 5. 前端优化

#### 设置界面简化
- ✅ 默认显示简单模式（只有一个 API Key）
- ✅ 高级选项可展开（显示所有 URL 和 Pro API）
- ✅ 智能提示根据模式切换

#### 错误处理增强
- ✅ 503 错误自动重试（最多 3 次）
- ✅ 504 错误自动重试
- ✅ 错误包含 `statusCode` 属性
- ✅ 友好的错误提示信息

#### 引导系统更新
- ✅ 简化 API 配置说明
- ✅ 强调"无需配置即可使用"
- ✅ 淡化复杂的双 API 概念

---

## 代码变更

### sora2.js

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
// 旧代码：SSE 流式响应
const response = await this.client.post('/v1/chat/completions', {
  stream: true
}, {
  responseType: 'stream'
});

// 新代码：任务提交 + 轮询
const response = await this.client.post('/v2/videos/generations', requestData);
const taskId = response.data.task_id;

// 轮询状态
const poll = async () => {
  const status = await this.client.get(`/v2/videos/generations/${taskId}`);
  if (status.data.status === 'SUCCESS') {
    resolve(status.data);
  } else {
    setTimeout(poll, 5000);
  }
};
```

#### createVideoWithCharacter 方法
```javascript
// 新代码：使用 V2 API
const requestData = {
  prompt: options.prompt,
  model: model,
  aspect_ratio: options.aspect_ratio || '16:9',
  duration: options.duration || '10',
  hd: options.hd || false,
  character_url: options.character_url,
  character_timestamps: options.character_timestamps
};
await this.characterClient.post('/v2/videos/generations', requestData);
```

#### getVideoTaskStatus 方法
```javascript
// 新代码：支持标准 API 和角色 API
async getVideoTaskStatus(taskId, useCharacterAPI = false) {
  const client = useCharacterAPI ? this.characterClient : this.client;
  const response = await client.get(`/v2/videos/generations/${taskId}`);
  return response.data;
}
```

#### 新增方法
```javascript
// 获取状态文本
getStatusText(status) {
  const statusMap = {
    'NOT_START': '等待开始',
    'IN_PROGRESS': '生成中',
    'SUCCESS': '完成',
    'FAILURE': '失败'
  };
  return statusMap[status] || status;
}
```

### public/app.js

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
let model = 'sora-2';
let aspect_ratio = '16:9';
let duration = '10';
let hd = false;

if (modelValue === 'sora_video2-landscape-15s') {
  model = 'sora-2-pro';
  aspect_ratio = '16:9';
  duration = '15';
}

const requestBody = {
  prompt: prompt,
  model: model,
  aspect_ratio: aspect_ratio,
  duration: duration,
  hd: hd
};
```

### server.js

#### 参数处理
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

## 测试建议

### 基础功能测试
- [ ] 文生视频（10秒）
- [ ] 文生视频（15秒，Pro）
- [ ] 图生视频
- [ ] 高清模式（Pro）
- [ ] 不同的 aspect_ratio

### 角色功能测试
- [ ] 创建角色
- [ ] 角色视频生成
- [ ] 角色视频状态查询

### 错误处理测试
- [ ] 503 错误自动重试
- [ ] 504 错误自动重试
- [ ] 轮询超时处理
- [ ] 任务失败处理

### 配置测试
- [ ] 简单模式（一个 API Key）
- [ ] 高级模式（双 API 配置）
- [ ] 自定义 API 配置
- [ ] 配置重置

---

## 已知限制

### 生成时间
- **10秒视频**: 1-3 分钟
- **15秒视频**: +2 分钟
- **高清模式**: +8 分钟
- **25秒视频**: 仅 sora-2-pro 支持，HD 不起作用

### 审查机制
1. 提交的图片中是否涉及真人
2. 提示词内容是否违规（暴力、色情、版权、活着的名人）
3. 生成结果审查是否合格

### 模型限制
- **sora-2**: 支持 10 秒，不支持 HD
- **sora-2-pro**: 支持 10/15/25 秒，支持 HD
- **25 秒模式**: HD 参数不起作用

---

## 向后兼容

✅ **完全兼容**:
- 前端旧的模型名称自动映射
- 服务器端自动转换参数格式
- 用户无需修改现有配置
- 保持相同的用户体验

---

## 文档更新

### 新增文档
1. ✅ `503错误自动重试说明.md`
2. ✅ `视频API升级说明.md`
3. ✅ `文生视频API调用流程.md`
4. ✅ `快速开始指南.md`
5. ✅ `前端双API配置更新说明.md`
6. ✅ `V2_API_升级完成总结.md` (本文档)

### 更新文档
1. ✅ `README.md` - 添加双 API 配置说明
2. ✅ `API配置说明.md` - 更新环境变量
3. ✅ `.env.example` - 添加新的环境变量

---

## Git 提交

```bash
git commit -m "feat: 升级视频API到V2格式并优化配置"
```

**提交内容**:
- 48 个文件变更
- 10,449 行新增
- 451 行删除

---

## 下一步建议

### 短期
1. 测试所有功能确保正常工作
2. 监控 API 调用和错误率
3. 收集用户反馈

### 中期
1. 优化轮询机制（可考虑 WebSocket）
2. 添加更多错误处理场景
3. 改进进度显示（更精确的百分比）

### 长期
1. 支持更多模型和参数
2. 添加视频编辑功能
3. 实现批量生成

---

## 总结

✅ **成功完成**:
- API 端点升级到 V2
- 实现任务轮询机制
- 双 API 配置支持
- 前端界面优化
- 错误处理增强
- 完整的文档更新

🎯 **优势**:
- 更清晰的 API 结构
- 更灵活的参数控制
- 支持更多功能（HD、25秒等）
- 更好的任务管理
- 更友好的用户体验

⚠️ **注意**:
- 不再支持流式响应，改为轮询
- 生成时间可能更长
- 需要处理任务状态轮询
- 轮询会增加 API 调用次数

---

**升级完成！系统已准备好使用新的 V2 API。** 🎉
