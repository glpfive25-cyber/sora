# 前端统一API配置说明

## 更新内容

前端已更新为统一使用 `https://api.maynor1024.live/` API地址，简化配置流程。

## 主要变更

### 1. **统一API地址**

**之前**：
- 标准 API: `https://api.maynor1024.live/`
- Pro API (角色): `https://apipro.maynor1024.live/`

**现在**：
- 统一 API: `https://api.maynor1024.live/`
- 所有功能使用同一个API地址

### 2. **简化配置界面**

**之前的配置项**：
- API Key (标准)
- API URL (标准)
- Pro API Key (角色)
- Pro API URL (角色)

**现在的配置项**：
- API Key (主要)
- API URL (主要) - 默认 `https://api.maynor1024.live/`
- 备用 API Key (可选)
- 备用 API URL (可选) - 默认 `https://api.maynor1024.live/`

### 3. **默认值更新**

所有API URL输入框的默认值都改为：
```
https://api.maynor1024.live/
```

## 配置步骤

### 基础配置（推荐）

1. 打开应用
2. 点击右上角"设置"图标 ⚙️
3. 填写 **API Key**
4. **API URL** 保持默认值 `https://api.maynor1024.live/`
5. 点击"保存配置"

**示例**：
```
API Key: sk-xxxxxxxxxxxxx
API URL: https://api.maynor1024.live/
```

### 备用配置（可选）

如果你有多个API Key，可以配置备用：

1. 填写主要 API Key
2. 填写备用 API Key（可选）
3. 两个URL都保持默认值
4. 点击"保存配置"

**注意**：通常情况下，只需要配置主要API Key即可。

## 功能支持

使用统一API地址后，所有功能正常工作：

### ✅ 视频生成
- 文生视频
- 图生视频
- 故事板视频
- 角色客串视频

### ✅ 图像生成
- 文生图
- 图像编辑

### ✅ 角色功能
- 角色创建
- 角色视频生成

### ✅ 其他功能
- 任务查询
- 进度跟踪

## 界面变化

### 设置页面

**主要配置区域**：
```
┌─────────────────────────────────┐
│ API Key                         │
│ [输入框]                        │
│                                 │
│ API URL                         │
│ [https://api.maynor1024.live/]  │
└─────────────────────────────────┘
```

**备用配置区域**（可选）：
```
┌─────────────────────────────────┐
│ 备用 API Key（可选）            │
│ [留空使用标准 API Key]          │
│                                 │
│ 备用 API URL（可选）            │
│ [https://api.maynor1024.live/]  │
└─────────────────────────────────┘
```

### 提示信息

**新的提示文案**：
```
配置说明：
• 统一使用 https://api.maynor1024.live/ API
• 填写你的 API Key 即可开始使用
• 备用配置为可选项，通常无需填写
```

## 迁移指南

### 从旧版本迁移

如果你之前配置了 Pro API：

1. **自动迁移**
   - 旧的配置会自动保留
   - 系统会优先使用主要API配置

2. **手动清理**（可选）
   - 打开设置页面
   - 点击"恢复默认设置"
   - 重新配置主要API Key

3. **验证配置**
   - 测试视频生成功能
   - 测试角色创建功能
   - 确认所有功能正常

## 常见问题

### Q: 为什么要统一API地址？
A: 根据接口文档，所有功能都使用同一个API地址，统一配置更简单、更不容易出错。

### Q: 旧的Pro API配置还能用吗？
A: 可以，旧配置会自动保留。但推荐使用新的统一配置方式。

### Q: 备用API配置有什么用？
A: 如果你有多个API Key，可以配置备用。通常情况下不需要配置。

### Q: 需要重新配置吗？
A: 不需要。如果你之前已经配置了API Key，会继续使用。只是URL会统一为 `https://api.maynor1024.live/`。

### Q: 角色功能还能用吗？
A: 可以。角色功能现在使用统一的API地址，功能完全正常。

### Q: 如何验证配置是否正确？
A: 保存配置后，尝试生成一个视频或图像。如果成功，说明配置正确。

## 技术细节

### 配置存储

配置保存在浏览器的 localStorage 中：

```javascript
{
  "apiKey": "sk-xxxxx",
  "baseUrl": "https://api.maynor1024.live/",
  "characterApiKey": "",  // 备用，可选
  "characterBaseUrl": "https://api.maynor1024.live/"
}
```

### 默认值处理

```javascript
// 统一使用同一个 API 地址
const DEFAULT_BASE_URL = 'https://api.maynor1024.live/';

// 加载配置时
apiBaseUrlInput.value = config.baseUrl || DEFAULT_BASE_URL;
apiCharacterUrlInput.value = config.characterBaseUrl || DEFAULT_BASE_URL;

// 重置配置时
apiBaseUrlInput.value = DEFAULT_BASE_URL;
apiCharacterUrlInput.value = DEFAULT_BASE_URL;
```

### 请求头传递

```javascript
// 所有API请求都会携带配置
fetch('/api/video/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'x-base-url': baseUrl  // 统一的API地址
  },
  body: JSON.stringify(requestBody)
});
```

## 优势

### ✅ 简化配置
- 只需要配置一个API地址
- 减少配置错误的可能性
- 更容易理解和使用

### ✅ 统一管理
- 所有功能使用同一个API
- 配置更新只需要改一个地方
- 便于维护和升级

### ✅ 用户友好
- 界面更简洁
- 提示更清晰
- 操作更直观

### ✅ 向后兼容
- 旧配置自动保留
- 不影响现有用户
- 平滑升级

## 测试建议

### 功能测试
1. ✅ 配置保存和加载
2. ✅ 文生视频
3. ✅ 图生视频
4. ✅ 角色创建
5. ✅ 角色视频生成
6. ✅ 图像生成
7. ✅ 配置重置

### 界面测试
1. ✅ 设置页面显示正常
2. ✅ 默认值正确显示
3. ✅ 提示信息清晰
4. ✅ 保存成功提示
5. ✅ 重置功能正常

### 兼容性测试
1. ✅ 旧配置自动迁移
2. ✅ 新配置正常工作
3. ✅ 所有功能正常

## 总结

- ✅ **统一API地址**：所有功能使用 `https://api.maynor1024.live/`
- ✅ **简化配置**：只需要配置API Key和统一的URL
- ✅ **向后兼容**：旧配置自动保留，平滑升级
- ✅ **用户友好**：界面更简洁，操作更直观
- ✅ **功能完整**：所有功能正常工作，无需额外配置
