# 前端双 API 配置更新说明

## 更新内容

### 1. 设置界面更新

**新增配置项：**
- **标准 API Key** - 用于视频和图像生成工具
  - 用途：普通视频生成、图像生成、图像编辑
  
- **标准 API URL** - 用于视频和图像生成工具
  - 默认：`https://api.maynor1024.live/`
  - 用途：普通视频生成、图像生成、图像编辑
  
- **Pro API Key** - 用于角色相关功能（独立配置）
  - 用途：角色创建、角色视频生成
  - 留空则使用标准 API Key
  
- **Pro API URL** - 用于角色相关功能
  - 默认：`https://apipro.maynor1024.live/`
  - 用途：角色创建、角色视频生成

**界面改进：**
- 每个配置项都有提示图标，说明用途
- Pro API 配置有独立的分组标题
- Pro API Key 支持显示/隐藏切换
- 更新了信息提示框，解释双 API 配置的作用

### 2. 数据存储更新

**LocalStorage 配置结构：**
```javascript
{
  "apiKey": "your-standard-api-key",
  "baseUrl": "https://api.maynor1024.live/",
  "characterApiKey": "your-pro-api-key",
  "characterBaseUrl": "https://apipro.maynor1024.live/"
}
```

**更新的函数：**
- `getApiConfig()` - 返回包含 `characterApiKey` 和 `characterBaseUrl` 的配置对象
- `saveApiConfig(apiKey, baseUrl, characterApiKey, characterBaseUrl)` - 保存四个配置项
- `loadSettingsToForm()` - 加载配置到表单，包括角色 API Key 和 URL
- `handleSaveSettings()` - 保存时处理四个配置项
- `handleResetSettings()` - 重置时清空四个配置项

### 3. 引导系统更新

**更新的引导内容：**
- API 设置步骤现在提到双 API 配置
- API 配置提醒也说明了双 API 的用途

**引导文本：**
- "系统支持双 API 配置：标准 API 用于视频/图像工具，Pro API 用于角色功能"

### 4. 角色模型选择更新

**新增模型选项：**
- `sora-2` - 基础模型
- `sora-2-characters` - 角色专用模型
- `sora-2-landscape` - 横屏模型
- `sora-2-landscape-hd` - 横屏高清模型（默认）
- `sora-2-portrait` - 竖屏模型
- `sora-2-portrait-hd` - 竖屏高清模型

**默认选择：** `sora-2-landscape-hd`

## 用户体验改进

### 配置灵活性
1. **留空使用默认配置** - 用户不配置时使用内置的双 API 地址
2. **单独配置** - 可以只配置 API 密钥，URL 使用默认值
3. **完全自定义** - 可以配置所有三个字段

### 向后兼容
- 旧的配置数据会自动兼容，只是缺少 `characterBaseUrl` 字段
- 系统会自动使用默认的角色 API 地址

### 清晰的说明
- 每个配置项都有工具提示说明用途
- 信息框清楚说明了双 API 的作用和优势

## 技术细节

### API 路由逻辑

**前端配置传递：**
```javascript
// 用户配置的 API 会通过请求头传递给服务器
headers: {
  'x-api-key': config.apiKey,
  'x-base-url': config.baseUrl || config.characterBaseUrl
}
```

**服务器端处理：**
- 普通视频/图像请求：使用 `baseUrl`
- 角色相关请求：使用 `characterBaseUrl`
- 自定义配置时：创建临时 Sora2 实例

### 默认值处理

**前端默认值：**
- 标准 API：`https://api.maynor1024.live/`
- 角色 API：`https://apipro.maynor1024.live/`

**服务器端默认值：**
- 环境变量 `SORA_BASE_URL`
- 环境变量 `SORA_CHARACTER_BASE_URL`

## 测试建议

1. **测试留空配置** - 不配置任何 URL，验证使用默认值
2. **测试单独配置** - 只配置标准 API URL，验证角色功能使用默认 Pro API
3. **测试完全配置** - 配置所有字段，验证都能正常工作
4. **测试重置功能** - 验证重置后清空所有配置
5. **测试不同模型** - 在角色视频生成中测试不同的模型选项

## 升级步骤

对于现有用户：
1. 刷新页面加载新代码
2. 打开设置界面，会看到新的 Pro API URL 配置项
3. 如果之前配置了 API，现在可以选择：
   - 保持原样（使用默认的 Pro API）
   - 配置独立的 Pro API URL

## 优势

1. **成本优化** - 普通功能使用标准 API，只有角色功能使用 Pro API
2. **灵活性** - 用户可以根据需要配置不同的 API 端点
3. **清晰性** - 界面清楚说明每个 API 的用途
4. **兼容性** - 完全向后兼容旧配置
