# 角色创建 API 不可用解决方案

## 🔍 错误信息

```
API 返回成功但缺少角色 ID。响应数据: "<!doctype html>..."
```

API 返回了 HTML 页面（"New API" 管理界面）而不是 JSON 数据。

## 🎯 问题原因

这个错误表明：

1. **API 端点不存在**: `/sora/v1/characters` 端点在你的 API 提供商处不可用
2. **API 提供商不支持角色功能**: 你使用的 API 可能不支持 Sora 角色创建
3. **请求被重定向**: 请求被重定向到了管理界面

## ✅ 解决方案

### 方案 1: 确认 API 提供商支持角色功能

**检查步骤**:

1. **查看 API 文档**
   - 登录 https://api.nextaicore.com/
   - 查找"角色创建"或"Character"相关的 API 文档
   - 确认是否支持 `/sora/v1/characters` 端点

2. **联系 API 提供商**
   - 询问是否支持 Sora 角色创建功能
   - 询问正确的 API 端点路径
   - 询问是否需要特殊权限或配置

3. **测试 API 端点**
   ```bash
   curl -X POST "https://api.nextaicore.com/sora/v1/characters" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://filesystem.site/cdn/20251030/javYrU4etHVFDqg8by7mViTWHlMOZy.mp4",
       "timestamps": "1,3"
     }'
   ```

### 方案 2: 切换到支持角色的 API 提供商

根据 `.env.example`，以下 API 支持角色功能：

```env
SORA_API_KEY=你的新API_Key
SORA_BASE_URL=https://apipro.maynor1024.live/
```

**步骤**:

1. **获取新的 API Key**
   - 注册支持角色功能的 API 服务
   - 获取 API Key

2. **更新 .env 文件**
   ```env
   SORA_API_KEY=新的API_Key
   SORA_BASE_URL=https://apipro.maynor1024.live/
   ```

3. **重启服务器**
   ```bash
   npm start
   ```

4. **测试角色创建**

### 方案 3: 使用替代方案（不使用角色功能）

如果你的 API 不支持角色功能，可以使用普通视频生成：

**步骤**:

1. **隐藏角色相关功能**
   - 在界面中隐藏"角色管理"和"角色视频生成"标签
   - 只使用"视频生成"功能

2. **使用普通视频生成**
   - 切换到"视频生成"标签
   - 输入详细的角色描述
   - 生成视频

**示例提示词**:
```
一个穿着蓝色衣服的卡通角色在跳舞，角色有大眼睛和友好的笑容
```

## 🔧 诊断步骤

### 步骤 1: 检查 API 响应

查看浏览器控制台（F12）：

```
[Sora2] Creating character from video: ...
[Sora2] API endpoint: https://api.nextaicore.com/sora/v1/characters
[Sora2] API returned HTML instead of JSON - endpoint may not exist
```

### 步骤 2: 测试 API 端点

```bash
# 测试角色创建端点
curl -v -X POST "https://api.nextaicore.com/sora/v1/characters" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://test.com/video.mp4", "timestamps": "1,3"}'
```

**预期结果**:
- ✅ 如果支持: 返回 JSON 数据
- ❌ 如果不支持: 返回 HTML 或 404 错误

### 步骤 3: 查看 API 文档

访问你的 API 提供商网站，查找：
- API 端点列表
- 支持的功能
- 角色创建相关文档

## 📝 API 提供商对比

### api.nextaicore.com

**支持的功能**:
- ✅ 视频生成 (`/v1/chat/completions`)
- ✅ 图像生成 (`/v1/images/generations`)
- ❓ 角色创建 (`/sora/v1/characters`) - **需要确认**

**检查方法**:
```bash
# 列出所有可用端点
curl https://api.nextaicore.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### apipro.maynor1024.live

**支持的功能**（根据 .env.example）:
- ✅ 视频生成
- ✅ 图像生成
- ✅ 角色创建
- ✅ 角色视频生成

**推荐使用此 API** 如果需要角色功能。

## 🛠️ 代码修改（如果需要）

### 选项 A: 禁用角色功能

如果你的 API 不支持角色，可以在前端隐藏相关功能。

编辑 `public/index.html`，注释掉角色相关的标签：

```html
<!-- 暂时禁用角色功能
<button onclick="switchMode('character')">角色管理</button>
<button onclick="switchMode('character-video')">角色视频生成</button>
-->
```

### 选项 B: 使用备用端点

如果你的 API 使用不同的端点路径，修改 `sora2.js`：

```javascript
// 原来的
const response = await this.client.post('/sora/v1/characters', requestData);

// 改为你的 API 的端点
const response = await this.client.post('/v1/characters', requestData);
// 或
const response = await this.client.post('/api/characters', requestData);
```

## 📊 功能可用性检查表

| 功能 | api.nextaicore.com | apipro.maynor1024.live |
|------|-------------------|----------------------|
| 视频生成 | ✅ | ✅ |
| 图像生成 | ✅ | ✅ |
| 角色创建 | ❓ 需确认 | ✅ |
| 角色视频 | ❓ 需确认 | ✅ |

## 💡 推荐配置

### 配置 1: 仅使用视频生成（当前 API）

```env
SORA_API_KEY=你的API_Key
SORA_BASE_URL=https://api.nextaicore.com/
```

**功能**:
- ✅ 普通视频生成
- ✅ 图像生成
- ❌ 角色功能（不可用）

### 配置 2: 完整功能（切换 API）

```env
SORA_API_KEY=新的API_Key
SORA_BASE_URL=https://apipro.maynor1024.live/
```

**功能**:
- ✅ 普通视频生成
- ✅ 图像生成
- ✅ 角色创建
- ✅ 角色视频生成

## 🔍 错误检测改进

我已经更新了代码，现在会：

1. **检测 HTML 响应**
   ```javascript
   if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
     throw new Error('角色创建 API 端点不可用...');
   }
   ```

2. **显示友好的错误信息**
   ```
   角色创建 API 端点不可用。您的 API 提供商可能不支持角色创建功能。
   请检查 API 文档或联系提供商。
   ```

3. **记录详细的调试信息**
   ```
   [Sora2] API endpoint: https://api.nextaicore.com/sora/v1/characters
   [Sora2] API returned HTML instead of JSON - endpoint may not exist
   ```

## 📞 获取帮助

### 联系 API 提供商

准备以下信息：
- 你的 API Key（前几位和后几位）
- 你想使用的功能（角色创建）
- 错误信息（API 返回 HTML）

**问题模板**:
```
你好，

我在使用你们的 API 时遇到问题：

1. API 端点: /sora/v1/characters
2. 错误: 返回 HTML 而不是 JSON
3. 问题: 是否支持 Sora 角色创建功能？

如果支持，正确的端点路径是什么？
如果不支持，是否有计划添加此功能？

谢谢！
```

### 查找替代 API

如果当前 API 不支持角色功能，可以搜索：
- "Sora API with character support"
- "OpenAI Sora character creation API"
- "Sora 角色创建 API"

## 🎯 快速解决方案

**如果你只需要视频生成**:
1. 忽略角色功能
2. 使用"视频生成"标签
3. 在提示词中详细描述角色

**如果你需要角色功能**:
1. 切换到支持角色的 API（如 apipro.maynor1024.live）
2. 或联系当前 API 提供商询问支持情况

---

**当前状态**: 代码已更新，会检测并友好地提示 API 端点不可用的情况。
