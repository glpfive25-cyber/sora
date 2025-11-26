# Sora-2 AI 对话和视频生成应用

一个基于 Sora-2 API 的现代化 AI 对话和视频生成 Web 应用，支持实时流式对话和视频生成进度显示。

## 🎉 限时免费版本

**本项目已升级为限时免费版本！**

- ✨ **限时免费使用** - 无需注册，无需订阅
- 🔑 **内置免费 API** - 系统已内置免费 API 密钥
- ⚙️ **可选自定义配置** - 支持配置自己的 API 密钥和服务器
- 💾 **本地存储配置** - 所有配置保存在浏览器本地，仅你可见
- 🎨 **全新 Sora2 主题** - 渐变色设计，现代化界面

## ✨ 功能特性

- 🤖 **AI 对话** - 支持流式响应，实时显示 AI 回复内容
- 🎬 **视频生成** - 支持文生视频和图生视频，5个模型可选
- 👤 **角色功能** - 创建自定义角色，生成角色视频（支持6种模型）
- 🔄 **智能重试** - 自动重试机制，显著提升视频生成成功率
- 📊 **实时进度** - 可视化进度条显示视频生成进度（支持 SSE 流式更新）
- 🎥 **视频预览** - 内置视频播放器，直接预览生成的视频
- 🖼️ **图像生成** - AI 图像生成和编辑功能（带重试机制）
- 🔐 **双 API 配置** - 标准 API 和 Pro API 独立配置，成本优化
- 💾 **历史记录** - 本地保存对话和生成历史
- 🎨 **现代化 UI** - 基于 Tailwind CSS 的精美界面
- 🌐 **多语言支持** - 支持中英文界面切换

## 📚 文档中心

完整的使用指南和技术文档，请访问：

### 👉 [文档中心](./docs/README.md)

**快速链接：**
- 📖 [视频生成使用指南](./docs/使用指南/视频生成使用指南.md) - **用户必读**
- 🔧 [504超时问题修复总结](./docs/504-fix-summary.md) - **重要更新**
- 🔄 [视频生成优化方案](./docs/video-generation-optimization.md) - 技术详解
- 📊 [API 重构技术摘要](./docs/技术文档/VIDEO_API_REDESIGN_SUMMARY.md) - **开发者必读**
- 🎯 [实时进度功能说明](./docs/技术文档/实时进度功能说明.md) - 进度功能详解

## 📋 前置要求

- Node.js 20.x 或更高版本
- npm 或 yarn 包管理器
- （可选）MaynorAPIPro 或其他兼容 OpenAI 格式的 API 密钥

## 🚀 快速开始

### 方式一：直接使用（推荐）

1. **克隆并安装**
```bash
git clone https://github.com/xianyu110/sora.git
cd sora
npm install
```

2. **启动应用**
```bash
npm start
# 或
npm run dev
```

3. **开始使用**
   - 应用将在 http://localhost:3000 启动
   - 系统已内置免费 API，无需配置即可使用
   - 如需自定义 API，点击右上角"设置"按钮进行配置

### 方式二：配置自己的 API（可选）

如果你有自己的 API 密钥：

1. 点击页面右上角的"设置"按钮
2. 在弹出的设置面板中配置：
   - **标准 API Key**：用于视频和图像生成（留空使用内置免费密钥）
   - **标准 API URL**：标准 API 服务器地址（默认：https://api.maynor1024.live/）
   - **Pro API Key**：用于角色功能（留空则使用标准 API Key）
   - **Pro API URL**：Pro API 服务器地址（默认：https://apipro.maynor1024.live/）
3. 点击"保存设置"
4. 配置会保存在浏览器本地，仅你可见

**双 API 配置说明：**
- 标准 API 用于普通视频生成、图像生成等功能，成本较低
- Pro API 专门用于角色创建和角色视频生成功能
- 如果只配置标准 API，角色功能会自动使用标准 API
- 支持为不同功能配置不同的 API Key，更灵活更安全

### 环境变量配置（服务器端）

如果需要在服务器端配置默认 API：

复制 `.env.example` 文件并重命名为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 标准 API 配置（用于视频和图像生成）
SORA_API_KEY=your-standard-api-key-here
SORA_BASE_URL=https://api.maynor1024.live/

# Pro API 配置（用于角色功能）
SORA_CHARACTER_API_KEY=your-pro-api-key-here
SORA_CHARACTER_BASE_URL=https://apipro.maynor1024.live/
```

**注意：** 
- 即使不配置 .env 文件，应用仍可使用内置免费 API 正常运行
- 如果不配置 `SORA_CHARACTER_API_KEY`，系统会自动使用 `SORA_API_KEY`
- 标准 API 和 Pro API 可以使用不同的 API Key，实现成本优化

**注意：** 
- 即使不配置 .env 文件，应用仍可使用内置免费 API 正常运行
- 如果不配置 `SORA_CHARACTER_API_KEY`，系统会自动使用 `SORA_API_KEY`
- 标准 API 和 Pro API 可以使用不同的 API Key，实现功能分离

## 📁 项目结构

```
sora/
├── public/              # 前端静态文件
│   ├── index.html      # 主页面
│   └── app.js          # 前端 JavaScript
├── server.js           # Express 服务器
├── sora2.js            # Sora-2 API 客户端
├── package.json        # 项目配置
├── .env.example        # 环境变量示例
└── README.md          # 项目文档
```

## 🎯 使用说明

### 对话模式

1. 在输入框中输入你的问题
2. 点击"发送"按钮或按 Enter 键
3. AI 将实时流式返回回复内容

### 视频生成模式（如果 API 支持）

1. 点击顶部的"模式切换"按钮切换到视频模式
2. 输入视频描述
3. 选择视频方向（横屏/竖屏/方形）
4. 点击"生成视频"
5. 等待视频生成完成，可以看到实时进度

## 🔧 API 说明

### 聊天 API

**端点:** `POST /api/chat/stream`

**请求体:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "你好"
    }
  ],
  "options": {
    "temperature": 1,
    "stream": true
  }
}
```

**响应:** Server-Sent Events (SSE) 流式数据

### 视频生成 API

**端点:** `POST /api/video/generate`

**请求体:**
```json
{
  "prompt": "一只可爱的猫咪在玩球",
  "options": {
    "orientation": "landscape"
  }
}
```

## ⚙️ 配置选项

### 环境变量

| 变量名 | 说明 | 默认值 |
|-------|------|--------|
| `SORA_API_KEY` | 标准 API 密钥（视频/图像） | 无 |
| `SORA_BASE_URL` | 标准 API 基础 URL | `https://api.maynor1024.live/` |
| `SORA_CHARACTER_API_KEY` | Pro API 密钥（角色功能） | 使用 `SORA_API_KEY` |
| `SORA_CHARACTER_BASE_URL` | Pro API 基础 URL | `https://apipro.maynor1024.live/` |
| `PORT` | 服务器端口 | `3000` |

### Temperature 设置

- 范围：0 - 1
- 默认值：0.7
- 说明：控制 AI 回复的随机性和创造性

## 🐛 常见问题

### Q: 如何使用内置免费 API？

A: 无需任何配置！直接启动应用即可使用内置免费 API。

### Q: 如何配置自己的 API 密钥？

A:
1. 点击页面右上角的"设置"（齿轮图标）按钮
2. 在弹出的设置面板中配置：
   - **标准 API Key** 和 **标准 API URL**：用于视频和图像生成
   - **Pro API Key** 和 **Pro API URL**：用于角色功能（可选）
3. 点击"保存设置"即可
4. 设置会保存在浏览器本地，仅你可见

**提示：** 如果只使用视频和图像功能，只需配置标准 API 即可。

### Q: 配置保存在哪里？会泄露吗？

A: 所有配置保存在浏览器的 localStorage 中，仅在你的设备上，不会上传到服务器，完全安全。

### Q: 支持哪些 API 服务？

A: 支持所有兼容 OpenAI 格式的 API 服务，包括但不限于：
- MaynorAPIPro
- OpenAI 官方 API
- 其他兼容 OpenAI 格式的第三方 API

### Q: 提示 "API request failed" 怎么办？

A: 请检查：
1. 如果使用自定义 API，检查 API 密钥是否正确
2. 检查 API 服务器地址是否正确
3. 检查网络连接是否正常
4. 可以尝试恢复默认设置使用内置免费 API

### Q: 视频生成失败 "No available channels"

A: 这通常表示：
1. API 服务暂时不可用
2. 需要升级账号或购买视频生成额度
3. 请联系 MaynorAPIPro 客服确认

### Q: 流式响应显示不正常

A:
1. 打开浏览器开发者工具（F12）查看控制台
2. 检查是否有 JavaScript 错误
3. 确保使用现代浏览器（Chrome、Firefox、Edge 等）

### Q: 什么是双 API 配置？为什么需要两个 API？

A: 
- **标准 API**：用于普通视频生成、图像生成等功能，成本较低
- **Pro API**：专门用于角色创建和角色视频生成，只有 Pro 支持角色功能
- **优势**：可以为不同功能使用不同的 API Key，实现成本优化和独立管理
- **灵活性**：如果只配置一个 API，系统会自动适配所有功能

### Q: 角色功能如何使用？

A:
1. 切换到"角色工具"标签页
2. 上传包含角色的视频（注意：不能是真人）
3. 设置角色出现的时间范围（1-3秒）
4. 点击"创建角色"
5. 创建成功后，可以在"角色视频生成"中使用该角色
6. 支持 6 种角色视频模型，默认推荐使用 sora-2-landscape-hd

## 🚢 部署

本项目需要 Node.js 服务器运行，推荐使用以下平台部署：

### Vercel (推荐)

```bash
npm i -g vercel
vercel login
vercel
```

### Railway

1. 访问 https://railway.app
2. 连接 GitHub 仓库
3. 添加环境变量
4. 自动部署

### Render

1. 访问 https://render.com
2. 创建新的 Web Service
3. 连接 GitHub 仓库
4. 添加环境变量
5. 部署

**注意：** 部署时记得设置环境变量：
- `SORA_API_KEY` 和 `SORA_BASE_URL`（标准 API）
- `SORA_CHARACTER_API_KEY` 和 `SORA_CHARACTER_BASE_URL`（Pro API，可选）
- 留空使用内置免费 API

## 🎨 主题特色

- 🌈 **渐变色设计** - 紫色到蓝色的现代渐变配色
- 💎 **玻璃态效果** - backdrop-blur 毛玻璃质感
- ⚡ **流畅动画** - 所有交互都有平滑过渡动画
- 📱 **响应式布局** - 完美适配各种屏幕尺寸
- 🎯 **直观操作** - 一键式设置，简单易用

## 🔧 前端配置功能

本项目支持完全前端化的双 API 配置：

1. **设置入口**：点击页面右上角的"设置"按钮
2. **配置项**：
   - **标准 API Key**：用于视频和图像生成（可选，留空使用内置免费密钥）
   - **标准 API URL**：标准 API 服务器地址（可选，留空使用默认地址）
   - **Pro API Key**：用于角色功能（可选，留空则使用标准 API Key）
   - **Pro API URL**：Pro API 服务器地址（可选，留空使用默认地址）
3. **存储方式**：使用浏览器 localStorage，数据仅保存在本地
4. **安全性**：配置不会上传到服务器，完全私密

**双 API 优势：**
- 🎯 **成本优化**：普通功能使用标准 API，角色功能使用 Pro API
- 🔐 **独立管理**：两个 API 可以使用不同的密钥，互不影响
- 🔄 **灵活切换**：可以只配置一个 API，系统自动适配
- 💡 **智能回退**：Pro API 未配置时自动使用标准 API

## 📝 开发日志

- ✅ 实现流式对话功能
- ✅ 集成 Sora-2 API
- ✅ 添加视频生成功能
- ✅ 实时进度显示
- ✅ 本地历史记录
- ✅ 美化 UI 界面
- ✅ 限时免费版本
- ✅ 前端 API 配置
- ✅ Sora2 主题设计
- ✅ 角色创建和视频生成
- ✅ 双 API 配置支持
- ✅ 6种角色视频模型

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

- GitHub: [@xianyu110](https://github.com/xianyu110)

## 🙏 鸣谢

- [MaynorAPIPro](https://apipro.maynor1024.live/) - 提供 AI API 服务
- [Tailwind CSS](https://tailwindcss.com/) - UI 框架
- [Express](https://expressjs.com/) - Web 框架
- [Axios](https://axios-http.com/) - HTTP 客户端

---

**🎉 限时免费 · 无限创作 · 本地配置 · 安全可靠**

如果你在使用过程中遇到任何问题，欢迎提交 Issue 或访问文档中心获取帮助。
