# API 配置说明

## 双 API 端点配置

为了支持不同功能使用不同的 API 端点，系统现在配置为：

### API 端点分配

1. **标准 API** (`https://api.maynor1024.live/`)
   - 视频生成工具
   - 图像生成工具
   - 图像编辑工具
   - 聊天功能

2. **Pro API** (`https://apipro.maynor1024.live/`)
   - 角色创建功能
   - 带角色的视频生成
   - 视频任务状态查询（角色视频）

### 环境变量配置

在 `.env` 文件中配置：

```env
SORA_API_KEY=your_standard_api_key_here
SORA_BASE_URL=https://api.maynor1024.live/
SORA_CHARACTER_API_KEY=your_pro_api_key_here
SORA_CHARACTER_BASE_URL=https://apipro.maynor1024.live/
```

**注意：** 标准 API 和 Pro API 使用不同的 API Key。如果 `SORA_CHARACTER_API_KEY` 未设置，系统会使用 `SORA_API_KEY`。

### 技术实现

#### Sora2 类修改

- 构造函数现在接受四个参数：
  - `apiKey`: 标准 API 密钥
  - `baseURL`: 标准 API 地址（视频和图像工具）
  - `characterApiKey`: Pro API 密钥（角色工具）
  - `characterBaseURL`: Pro API 地址（角色工具）

- 创建了两个 axios 客户端：
  - `this.client`: 用于标准功能，使用 `apiKey`
  - `this.characterClient`: 用于角色相关功能，使用 `characterApiKey`

#### 功能映射

| 功能 | 使用的客户端 | API 端点 |
|------|------------|---------|
| 视频生成 | `this.client` | 标准 API |
| 图像生成 | `this.client` | 标准 API |
| 图像编辑 | `this.client` | 标准 API |
| 聊天 | `this.client` | 标准 API |
| 创建角色 | `this.characterClient` | Pro API |
| 带角色视频生成 | `this.characterClient` | Pro API |
| 视频任务状态 | `this.characterClient` | Pro API |

### 支持的角色模型

Pro API 支持以下角色视频生成模型：

| 模型名称 | 说明 | 适用场景 |
|---------|------|---------|
| `sora-2` | 基础模型 | 通用场景 |
| `sora-2-characters` | 角色专用模型（推荐） | 角色视频生成 |
| `sora-2-landscape` | 横屏模型 | 横屏视频 |
| `sora-2-landscape-hd` | 横屏高清模型 | 高清横屏视频 |
| `sora-2-portrait` | 竖屏模型 | 竖屏视频 |
| `sora-2-portrait-hd` | 竖屏高清模型 | 高清竖屏视频 |

### 为什么这样配置？

只有 Pro API 支持角色功能，因此：
- 普通的视频和图像生成使用标准 API，成本更低
- 需要角色功能时自动切换到 Pro API
- 用户只需配置一个 API 密钥，系统自动路由到正确的端点

### 自定义 API 配置

前端用户可以通过设置界面配置自定义 API：
- 自定义配置会通过请求头传递：`x-api-key` 和 `x-base-url`
- 服务器会为该请求创建临时的 Sora2 实例
- 自定义配置时，两个 URL 使用相同的值（假设用户的自定义 API 支持所有功能）
