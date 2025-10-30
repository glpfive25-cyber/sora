# 视频生成 API 重构摘要

## 概述

根据接口文档 (`接口文档/1.txt`)，已将视频生成功能从自定义端点重构为使用标准的 **Chat API 格式** (`/v1/chat/completions`)。

## 主要变更

### 1. API 端点变更

**之前：**
- 使用 `/v1/video/generations` 端点
- 需要轮询 `/v1/video/tasks/:taskId` 获取结果
- 异步处理，需要任务 ID 跟踪

**现在：**
- 使用 `/v1/chat/completions` 端点
- 同步返回结果（或长时间等待）
- 不需要任务 ID 和轮询

### 2. 请求格式变更

**之前的格式：**
```javascript
{
  prompt: "视频描述",
  model: "sora_video2",
  orientation: "landscape",
  duration: 5,
  resolution: "1080p",
  image: "base64..." // 可选，用于图生视频
}
```

**新的 Chat API 格式：**
```javascript
{
  model: "sora_video2",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "视频描述"
        },
        {
          type: "image_url",
          image_url: {
            url: "base64..." // 或 URL
          }
        }
      ]
    }
  ],
  stream: false
}
```

### 3. 响应格式变更

**之前的格式：**
```javascript
{
  id: "task_123",
  task_id: "task_123",
  status: "processing"
}
```

**新的 Chat API 格式：**
```javascript
{
  id: "chatcmpl-123",
  object: "chat.completion",
  created: 1677652288,
  choices: [
    {
      index: 0,
      message: {
        role: "assistant",
        content: "✅ 视频生成成功，[点击这里](https://example.com/video.mp4) 查看视频~~~"
      },
      finish_reason: "stop"
    }
  ],
  usage: {
    prompt_tokens: 9,
    completion_tokens: 12,
    total_tokens: 21
  }
}
```

### 4. 模型命名规范

**支持的视频模型（5个）：**

| 模型名称 | 说明 | 时长 | 预计生成时间 | 推荐度 |
|---------|------|------|-------------|--------|
| `sora_video2` | 标准视频模型 | 10秒 | 30-90秒 | ⭐⭐⭐⭐⭐ 最推荐 |
| `sora_video2-landscape` | 横屏视频 | 10秒 | 40-90秒 | ⭐⭐⭐⭐ |
| `sora_video2-portrait` | 竖屏视频 | 10秒 | 40-90秒 | ⭐⭐⭐⭐ |
| `sora_video2-landscape-15s` | 横屏15秒 | 15秒 | 3-5分钟 | ⭐⭐ 易超时 |
| `sora_video2-portrait-15s` | 竖屏15秒 | 15秒 | 3-5分钟 | ⭐⭐ 易超时 |

**⚠️ 重要说明：**
- **不支持** HD（高清）版本模型
- 15秒版本生成时间长，容易遇到 504 超时错误
- 建议优先使用标准10秒版本
- 也可以在提示词中添加要求，如 "竖屏、横屏"

## 代码变更详情

### sora2.js 变更

**文件位置：** `sora2.js:136-189`

- 重写 `generateVideo()` 方法使用 Chat API 格式
- 构建包含文本和图片的 `content` 数组
- 使用 `/v1/chat/completions` 端点
- 增加超时时间至 5 分钟（300000ms）
- 废弃 `getVideoTask()` 方法

### server.js 变更

**文件位置：** `server.js:81-117`

- 更新 `/api/video/generate` 端点处理新响应格式
- 添加注释说明响应格式变更
- 废弃 `/api/video/tasks/:taskId` 端点（返回 410 Gone）

### app.js 变更

**文件位置：** `public/app.js`

主要变更点：

1. **响应处理逻辑** (行 289-341)
   - 从 `choices[0].message.content` 提取视频 URL
   - 使用正则表达式匹配视频链接
   - 处理成功和失败场景

2. **移除轮询逻辑** (行 608-615)
   - 废弃 `pollVideoTask()` 函数
   - 废弃 `updateProgressIndicator()` 函数
   - 废弃 `showProgressWithTaskId()` 函数

3. **简化进度显示** (行 621-647)
   - 移除复杂的进度计算
   - 使用模拟进度动画
   - 显示预估等待时间（30-90秒）

## 文生视频使用示例

### 纯文本生成视频

```javascript
// 请求
{
  model: "sora_video2-landscape",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "横屏，高清，一只猫在花园里奔跑"
        }
      ]
    }
  ],
  stream: false
}

// 响应 - 从 choices[0].message.content 中提取视频 URL
```

## 图生视频使用示例

### 图片+文本生成视频

```javascript
// 请求
{
  model: "sora_video2-portrait",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "竖屏，让图片中的人物动起来"
        },
        {
          type: "image_url",
          image_url: {
            url: "data:image/png;base64,iVBORw0KGgoAAAANS..."
          }
        }
      ]
    }
  ],
  stream: false
}

// 响应格式相同
```

## 支持多个参考图

根据文档，API 支持多个参考图片：

```javascript
content: [
  { type: "text", text: "视频描述" },
  { type: "image_url", image_url: { url: "图片1" } },
  { type: "image_url", image_url: { url: "图片2" } },
  { type: "image_url", image_url: { url: "图片3" } }
]
```

## 审查机制

官方审查涉及三个阶段：

1. **图片审查** - 检查提交的图片是否涉及真人（非常像真人的也不行）
2. **提示词审查** - 检查内容是否违规（暴力、色情、版权、活着的名人）
3. **结果审查** - 生成结果是否合格（这是生成到90%多后失败的原因）

## 兼容性说明

- 保留了旧的函数名但标记为已废弃
- 旧的任务轮询端点返回 410 Gone 状态
- 前端代码包含后向兼容性处理

## 性能优化建议

1. **超时设置：** 视频生成通常需要 30-90 秒，已将超时设置为 5 分钟
2. **用户体验：** 显示预估等待时间和模拟进度条
3. **错误处理：** 从响应内容中提取详细错误信息

## 测试建议

1. **文生视频测试：**
   - 测试不同模型（横屏、竖屏、15秒等）
   - 测试不同提示词长度和复杂度
   - 测试错误场景（违规内容）

2. **图生视频测试：**
   - 测试单张参考图
   - 测试多张参考图
   - 测试不同图片格式和大小
   - 测试真人照片（应被拒绝）

3. **错误处理测试：**
   - 网络超时
   - API 限流
   - 内容审查失败

## 注意事项

⚠️ **重要提醒：**

1. 视频生成时间较长（30-90秒），需要设置合理的超时时间
2. 高清和15秒版本生成时间更长
3. 图片审查严格，避免使用真人照片
4. 提示词需要避免违规内容
5. 生成可能在90%+时因内容审查失败

## 迁移检查清单

- [x] 更新 `sora2.js` 中的 `generateVideo()` 方法
- [x] 更新 `server.js` 中的视频生成端点
- [x] 更新 `app.js` 中的响应处理逻辑
- [x] 移除任务轮询相关代码
- [x] 简化进度显示逻辑
- [x] 添加错误处理和用户提示
- [x] 创建迁移文档
- [ ] 进行端到端测试
- [ ] 更新用户文档

## 504 超时问题处理方案

### 问题原因
504 错误是 **API 网关超时**，通常是因为：
- API 服务器的网关超时限制（通常 1-2 分钟）
- 15秒视频生成时间过长（3-5分钟）超过网关限制
- 服务器负载高

### 解决方案
1. **优先使用标准10秒模型** - 成功率最高
2. **避免使用15秒版本** - 容易超时
3. **简化提示词** - 减少生成复杂度
4. **图生视频使用简单图片** - 降低处理时间

### 用户提示优化
当遇到 504 错误时，系统会显示：
- 清晰的错误原因说明
- 详细的解决建议
- 模型选择指南
- 生成时间参考

## 实时进度显示功能

### 功能说明
系统现已支持**流式响应和实时进度更新**：

#### 前端实现 (app.js)
- `handleStreamResponse()` - 处理 SSE 流式响应
- `handleProgressUpdate()` - 解析进度数据
- `updateRealProgress()` - 更新进度条和百分比
- `updateProgressMessage()` - 更新状态消息

#### 进度数据格式
```json
{
  "type": "progress",
  "content": "正在生成视频... 45%"
}
```

或者标准百分比格式：
```json
{
  "type": "progress",
  "content": "45%"
}
```

#### 支持的进度事件类型
1. **progress** - 进度更新（可包含百分比）
2. **complete** - 生成完成（包含最终结果）
3. **error** - 生成错误

### 进度显示内容
- ✅ 实时进度百分比（0-100%）
- ✅ 进度条动画
- ✅ 当前状态说明
- ✅ 已等待时间（秒/分钟）
- ✅ 预计剩余时间（动态计算）

## 后续工作

1. ✅ 完成 API 格式迁移
2. ✅ 添加详细错误提示
3. ✅ 更新模型列表文档
4. ✅ 实现实时进度显示
5. ⏳ 端到端测试（推荐使用 sora_video2 标准模型）
6. ⏳ 性能监控和优化
7. ⏳ 收集用户反馈
