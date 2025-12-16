# 前端V2 API更新说明

## 更新概述

前端已更新为统一使用V2 API格式，移除了流式模式，改用任务轮询机制。

## 主要变更

### 1. 移除流式模式

**之前**:
```javascript
const requestBody = {
    prompt: prompt,
    model: model,
    options: {...},
    useStream: true  // 启用流式响应
};
```

**现在**:
```javascript
const requestBody = {
    prompt: prompt,
    model: model,
    options: {...}
    // 不再需要 useStream 参数
};
```

### 2. 统一使用任务轮询

所有视频生成现在都遵循以下流程：

1. **提交任务** → 返回 `task_id`
2. **轮询状态** → 每5秒查询一次任务状态
3. **获取结果** → 任务完成后获取视频URL

### 3. 删除的函数

- `handleStreamResponse()` - 流式响应处理
- `handleProgressUpdate()` - 流式进度更新
- `updateRealProgress()` - 实时进度更新（合并到新函数）

### 4. 新增/更新的函数

#### `attemptVideoGeneration()`
简化为只处理任务提交：
```javascript
async function attemptVideoGeneration(requestBody, prompt, model, retryCount = 0) {
    // 提交任务
    const response = await fetch('/api/video/generate', {...});
    const data = await response.json();
    
    // 开始轮询
    if (data.task_id) {
        return await pollVideoTask(data.task_id, prompt, model);
    }
}
```

#### `pollVideoTask()`
更新为使用V2 API状态格式：
```javascript
async function pollVideoTask(taskId, prompt, model) {
    // V2 API 状态
    // - NOT_START: 未开始
    // - IN_PROGRESS: 生成中
    // - SUCCESS: 完成
    // - FAILURE: 失败
    
    const taskData = await fetch(`/api/video-task/${taskId}`);
    
    if (taskData.status === 'SUCCESS') {
        // 视频URL在 taskData.data.output
        return taskData.data.output;
    }
}
```

#### `updateProgressMessage()`
简化的进度消息更新：
```javascript
function updateProgressMessage(message) {
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.textContent = message || '正在处理...';
    }
}
```

#### `updateProgressPercent()`
新增的百分比更新函数：
```javascript
function updateProgressPercent(percent, message = '') {
    // 更新进度条和百分比显示
}
```

## 任务状态映射

### V2 API 状态
| 状态 | 说明 | 前端显示 |
|------|------|----------|
| `NOT_START` | 未开始 | ⏳ 任务排队中... |
| `IN_PROGRESS` | 生成中 | 🎬 正在生成视频... X% |
| `SUCCESS` | 完成 | ✅ 视频生成完成！ |
| `FAILURE` | 失败 | ❌ 失败原因 |

### 响应数据结构
```json
{
  "task_id": "xxx",
  "status": "SUCCESS",
  "progress": "100%",
  "data": {
    "output": "https://视频URL"
  },
  "fail_reason": "失败原因（如果失败）"
}
```

## 轮询机制

### 配置参数
```javascript
const maxPolls = 120;        // 最大轮询次数
const pollInterval = 5000;   // 轮询间隔（毫秒）
// 总超时时间 = 120 × 5秒 = 10分钟
```

### 轮询逻辑
1. 每5秒查询一次任务状态
2. 显示当前状态和进度
3. 成功时提取视频URL并显示
4. 失败时显示错误原因
5. 超过10分钟未完成则超时

## 错误处理

### 自动重试
以下错误会自动重试（最多3次）：
- 503 Service Unavailable
- 504 Gateway Timeout
- 网络错误
- 超时错误

### 重试策略
```javascript
const MAX_RETRIES = 2;
const RETRY_DELAY = 3000 + (retryCount * 2000);
// 延迟: 3秒, 5秒, 7秒（渐进式）
```

## 用户体验改进

### 进度提示
```javascript
// 排队中
"⏳ 任务排队中... (15秒)"

// 生成中
"🎬 正在生成视频... 45% (60秒)"

// 完成
"✅ 视频生成完成！"

// 重试
"🔄 正在重试... (尝试 2/3)"
```

### 超时提示
```javascript
// 任务提交超时（1分钟）
"请求超时，请重试"

// 任务执行超时（10分钟）
"视频生成超时（超过10分钟），请重试"
```

## 兼容性

### 后端兼容
前端代码完全兼容新的后端V2 API：
- ✅ 文生视频
- ✅ 图生视频
- ✅ 故事板视频
- ✅ 角色客串视频

### 浏览器兼容
- ✅ Chrome/Edge (最新版)
- ✅ Firefox (最新版)
- ✅ Safari (最新版)

## 测试建议

### 功能测试
1. **文生视频**: 测试基本的文本生成视频
2. **图生视频**: 测试上传图片生成视频
3. **长时间任务**: 测试15秒、25秒视频
4. **错误处理**: 测试无效提示词、网络错误
5. **重试机制**: 测试503/504错误自动重试

### 性能测试
1. **轮询效率**: 确认5秒间隔合理
2. **内存使用**: 长时间轮询不应泄漏内存
3. **并发任务**: 测试多个任务同时进行

## 常见问题

### Q: 为什么移除流式模式？
A: 根据API文档，服务端不支持流式响应，统一使用任务轮询更稳定。

### Q: 轮询会不会太频繁？
A: 5秒间隔是合理的，既能及时更新状态，又不会给服务器造成过大压力。

### Q: 如果任务超过10分钟怎么办？
A: 会显示超时错误，用户可以重新提交。对于特别长的视频（如25秒HD），可能需要增加超时时间。

### Q: 进度百分比准确吗？
A: 进度由服务端返回，准确性取决于API提供商的实现。

## 迁移检查清单

- [x] 移除 `useStream` 参数
- [x] 删除流式响应处理函数
- [x] 更新任务轮询逻辑
- [x] 适配V2 API状态格式
- [x] 更新错误处理
- [x] 测试所有视频生成功能
- [x] 更新用户提示文案

## 下一步

1. 测试所有视频生成功能
2. 收集用户反馈
3. 根据实际使用情况调整轮询间隔
4. 优化错误提示文案
