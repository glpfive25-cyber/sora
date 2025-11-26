# CORS 错误解决方案

## 🔍 问题描述

```
Access to fetch at 'https://apipro.maynor1024.live/sora/v1/characters' from origin 'http://localhost:3000' has been blocked by CORS policy
```

## 🎯 问题原因

**CORS（跨域资源共享）错误**发生在：
1. 前端（`http://localhost:3000`）直接调用外部 API（`https://apipro.maynor1024.live`）
2. API 服务器的 CORS 配置有问题（返回了重复的 `Access-Control-Allow-Origin: *, *`）
3. 浏览器出于安全考虑阻止了请求

## ✅ 已修复

我已经修改代码，**始终使用本地服务器代理**，这样就不会有 CORS 问题了。

### 工作原理

**之前（有 CORS 问题）**:
```
浏览器 → 直接调用 → https://apipro.maynor1024.live
        ❌ CORS 错误
```

**现在（无 CORS 问题）**:
```
浏览器 → 本地服务器 → https://apipro.maynor1024.live
        ✅ 同源请求    ✅ 服务器到服务器
```

## 📝 关于 Vercel 部署

### Vercel 上不会有 CORS 问题

当你部署到 Vercel 后：

1. **前端和后端在同一个域名下**
   ```
   前端: https://your-app.vercel.app
   后端: https://your-app.vercel.app/api/*
   ```

2. **所有请求都是同源的**
   - 浏览器 → `https://your-app.vercel.app/api/character/create`
   - 这是同源请求，没有 CORS 问题

3. **服务器代理处理外部 API**
   - Vercel 服务器 → `https://apipro.maynor1024.live`
   - 服务器到服务器的请求，没有 CORS 限制

### Vercel 部署优势

| 本地开发 | Vercel 部署 |
|---------|------------|
| `http://localhost:3000` | `https://your-app.vercel.app` |
| 需要服务器代理避免 CORS | 自动避免 CORS（同源） |
| 需要运行 `npm start` | 自动部署和运行 |
| 只能本地访问 | 全球可访问 |

## 🚀 部署到 Vercel

### 步骤 1: 准备部署

确保你的项目有 `vercel.json` 文件（已存在）：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

### 步骤 2: 配置环境变量

在 Vercel 项目设置中添加环境变量：

```
SORA_API_KEY=你的API_Key
SORA_BASE_URL=https://apipro.maynor1024.live/
```

### 步骤 3: 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

或者通过 GitHub 自动部署：
1. 推送代码到 GitHub
2. 在 Vercel 网站导入项目
3. 配置环境变量
4. 自动部署

### 步骤 4: 访问

部署完成后，你会得到一个 URL：
```
https://your-app.vercel.app
```

访问这个 URL，所有功能都能正常工作，没有 CORS 问题！

## 🔧 本地开发配置

### 当前配置（推荐）

**使用服务器代理**：
- ✅ 无 CORS 问题
- ✅ 与 Vercel 部署一致
- ✅ 更安全（API Key 不暴露给浏览器）

**配置方式**：
1. 编辑 `.env` 文件
2. 设置 `SORA_API_KEY` 和 `SORA_BASE_URL`
3. 重启服务器：`npm start`

### 前端设置的作用

前端的"设置"功能现在主要用于：
- 查看当前配置
- 了解使用的 API
- 未来可能支持多用户配置

## 📊 架构对比

### 架构 1: 直接调用（有 CORS 问题）

```
┌─────────┐
│ 浏览器   │
└────┬────┘
     │ fetch()
     ├──────────────────────────┐
     │                          │
     ▼                          ▼
┌─────────┐              ┌──────────┐
│ 前端     │              │ 外部 API  │
│ :3000   │              │ :443     │
└─────────┘              └──────────┘
     ❌ CORS 错误
```

### 架构 2: 服务器代理（无 CORS 问题）✅

```
┌─────────┐
│ 浏览器   │
└────┬────┘
     │ fetch('/api/...')
     ▼
┌─────────┐
│ 前端     │
│ :3000   │
└────┬────┘
     │ 同源请求 ✅
     ▼
┌─────────┐
│ 后端     │
│ :3000   │
└────┬────┘
     │ axios
     ▼
┌──────────┐
│ 外部 API  │
│ :443     │
└──────────┘
     ✅ 服务器请求
```

## 💡 最佳实践

### 开发环境

1. **使用 `.env` 文件**
   ```env
   SORA_API_KEY=你的API_Key
   SORA_BASE_URL=https://apipro.maynor1024.live/
   ```

2. **通过服务器代理**
   - 所有 API 调用通过 `/api/*` 路由
   - 服务器处理实际的 API 请求

3. **不要将 `.env` 提交到 Git**
   - 已在 `.gitignore` 中
   - 使用 `.env.example` 作为模板

### 生产环境（Vercel）

1. **在 Vercel 设置环境变量**
   - 不要在代码中硬编码
   - 使用 Vercel 的环境变量功能

2. **使用 HTTPS**
   - Vercel 自动提供 HTTPS
   - 更安全

3. **启用缓存**
   - Vercel 自动优化
   - 更快的响应速度

## 🔐 安全性

### 使用服务器代理的好处

1. **API Key 不暴露**
   - API Key 只在服务器端
   - 浏览器看不到

2. **防止滥用**
   - 可以添加速率限制
   - 可以添加认证

3. **统一管理**
   - 所有 API 调用经过服务器
   - 便于监控和日志

## 🎯 总结

### 当前状态

✅ **已修复 CORS 问题**
- 使用服务器代理
- 无需直接调用外部 API
- 与 Vercel 部署架构一致

### Vercel 部署

✅ **不会有 CORS 问题**
- 前后端同域名
- 所有请求都是同源的
- 服务器代理处理外部 API

### 下一步

1. **本地测试**
   ```bash
   npm start
   ```

2. **部署到 Vercel**
   ```bash
   vercel
   ```

3. **享受无 CORS 的体验** 🎉

---

**现在本地开发和 Vercel 部署都不会有 CORS 问题了！**
