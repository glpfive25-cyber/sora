# 统一API配置说明

## 更新内容

根据接口文档，已将所有API调用统一使用 `https://api.maynor1024.live/`。

## 主要变更

### 1. 统一API地址
**之前**: 使用两个不同的API地址
- 标准API: `https://api.maynor1024.live/`
- 角色API: `https://apipro.maynor1024.live/`

**现在**: 统一使用一个API地址
- 所有功能: `https://api.maynor1024.live/`

### 2. 移除流式模式
根据接口文档，API不支持流式响应，统一使用V2 API格式：
- 提交任务 → 返回 `task_id`
- 轮询任务状态 → 获取进度和结果

### 3. 简化配置

**环境变量** (.env):
```bash
SORA_API_KEY=your_api_key_here
SORA_BASE_URL=https://api.maynor1024.live/
```

**移除的环境变量**:
- `SORA_CHARACTER_API_KEY` (不再需要)
- `SORA_CHARACTER_BASE_URL` (不再需要)

### 4. API端点

#### 视频生成
- **端点**: `POST /v2/videos/generations`
- **返回**: `{ task_id: "xxx" }`
- **支持功能**:
  - 文生视频
  - 图生视频
  - 故事板视频
  - 角色客串视频

#### 任务查询
- **端点**: `GET /v2/videos/generations/{task_id}`
- **返回**: 任务状态和结果

#### 角色创建
- **端点**: `POST /sora/v1/characters`
- **参数**: 
  - `url` 或 `from_task` (二选一)
  - `timestamps` (必需)

## 可用模型

### sora-2 (标准模型)
- 视频时长: 10秒
- 分辨率: 标准
- 适用场景: 快速生成

### sora-2-pro (专业模型)
- 视频时长: 10秒、15秒、25秒
- 分辨率: 支持HD高清
- 适用场景: 高质量视频

## 视频生成参数

```json
{
  "prompt": "视频描述",
  "model": "sora-2",
  "aspect_ratio": "16:9",  // 或 "9:16"
  "duration": "10",         // "10", "15", "25"
  "hd": false,              // 仅 sora-2-pro 支持
  "watermark": false,
  "private": false,
  "images": ["图片URL"],    // 可选，图生视频
  "character_url": "视频URL",      // 可选，角色客串
  "character_timestamps": "1,3"    // 可选，角色时间范围
}
```

## 任务状态

- `NOT_START`: 未开始
- `IN_PROGRESS`: 生成中
- `SUCCESS`: 完成
- `FAILURE`: 失败

## 生成时间预估

- 10秒视频: 1-3分钟
- 15秒视频: +2分钟
- HD高清: +8分钟

## 注意事项

### 审查机制
官方审查涉及3个阶段：
1. **图片审查**: 不能包含真人或非常像真人的图片
2. **提示词审查**: 不能包含暴力、色情、版权、活着的名人
3. **结果审查**: 生成结果需符合规范（这是90%+后失败的常见原因）

### 角色功能
- 角色指的是物品，不是人物
- 人物需要使用 face id 录入（暂不支持上传）
- 时间范围差值: 最小1秒，最大3秒

### 图生视频
- 图片访问速度会影响生成时间
- 建议使用美国访问速度较快的图片地址

## 迁移指南

如果你之前使用了旧的配置，请按以下步骤更新：

1. **更新 .env 文件**
   ```bash
   # 删除这些行
   # SORA_CHARACTER_API_KEY=xxx
   # SORA_CHARACTER_BASE_URL=xxx
   
   # 保留这些
   SORA_API_KEY=your_api_key_here
   SORA_BASE_URL=https://api.maynor1024.live/
   ```

2. **重启服务器**
   ```bash
   npm start
   ```

3. **测试功能**
   - 文生视频
   - 图生视频
   - 角色创建
   - 角色客串视频

## 常见问题

### Q: 为什么移除了流式模式？
A: 根据接口文档，API不支持流式响应，统一使用任务轮询模式更稳定可靠。

### Q: 角色功能还能用吗？
A: 可以，角色功能现在使用统一的API地址，功能完全正常。

### Q: 需要更新前端代码吗？
A: 不需要，前端代码会自动适配新的API格式。

### Q: 旧的 task_id 还能查询吗？
A: 可以，任务查询端点保持兼容。
