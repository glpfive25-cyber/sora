# 📦 Vercel 部署指南

本指南将帮助你快速将 Sora2 AI 生成器部署到 Vercel。

## 🚀 快速部署

### 方式一：通过 Vercel 网站部署（推荐）

1. **准备工作**
   - 将代码推送到 GitHub 仓库
   - 注册/登录 [Vercel](https://vercel.com)

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置项目**
   - 项目名称会自动填充，可以修改
   - Framework Preset: 自动检测为 "Other"
   - Root Directory: 留空（使用根目录）
   - Build Command: 留空或填写 `npm install`
   - Output Directory: 留空

4. **环境变量（可选）**

   如果需要配置服务器端默认 API：

   ```
   SORA_API_KEY=your-api-key-here
   SORA_BASE_URL=https://apipro.maynor1024.live/
   NODE_ENV=production
   ```

   **注意：** 即使不配置这些环境变量，应用仍可正常运行，用户可以在前端配置自己的 API。

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待部署完成（通常 1-2 分钟）
   - 部署成功后会得到一个 `.vercel.app` 域名

### 方式二：通过 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   # 首次部署（开发环境）
   vercel

   # 生产环境部署
   vercel --prod
   ```

4. **配置环境变量（可选）**
   ```bash
   # 添加 API 密钥
   vercel env add SORA_API_KEY

   # 添加 API 基础 URL
   vercel env add SORA_BASE_URL

   # 重新部署使环境变量生效
   vercel --prod
   ```

## 📋 配置说明

### 项目已包含的 Vercel 配置

项目根目录的 `vercel.json` 文件已配置好：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*\\.(js|css|html|png|jpg|jpeg|gif|svg|ico))",
      "dest": "/public/$1"
    },
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 环境变量说明

| 变量名 | 说明 | 是否必需 |
|-------|------|---------|
| `SORA_API_KEY` | 服务器端默认 API 密钥 | ❌ 可选 |
| `SORA_BASE_URL` | 服务器端默认 API 地址 | ❌ 可选 |
| `NODE_ENV` | 运行环境 | ✅ 已在 vercel.json 配置 |

## 🌐 自定义域名

### 添加自定义域名

1. 进入项目设置
2. 点击 "Domains" 标签
3. 输入你的域名（如 `sora.yourdomain.com`）
4. 按照提示配置 DNS 记录
5. 等待 DNS 生效（通常几分钟到几小时）

### DNS 配置示例

对于 `sora.yourdomain.com`：

```
类型: CNAME
名称: sora
值: cname.vercel-dns.com
```

## 🔄 持续部署

连接 GitHub 后，Vercel 会自动监听仓库变化：

- **main 分支** → 自动部署到生产环境
- **其他分支** → 自动部署到预览环境

每次 push 代码时：
```bash
git add .
git commit -m "更新功能"
git push origin main
```

Vercel 会自动触发部署。

## ⚙️ 部署后配置

### 用户端 API 配置

部署后，用户可以通过前端界面配置自己的 API：

1. 访问部署的网站
2. 点击右上角"设置"按钮
3. 配置 API 密钥和服务器地址
4. 保存后即可使用

配置保存在用户浏览器本地，完全私密。

### 服务器端 API 配置

如需配置服务器端默认 API：

1. 进入 Vercel 项目设置
2. 点击 "Environment Variables"
3. 添加 `SORA_API_KEY` 和 `SORA_BASE_URL`
4. 选择环境（Production / Preview / Development）
5. 保存后重新部署

## 🐛 常见问题

### Q: 部署后无法访问？

A: 检查：
- 构建是否成功（查看 Deployment 日志）
- 域名 DNS 是否生效
- 网络连接是否正常

### Q: API 调用失败？

A:
- 如果配置了环境变量，检查是否正确
- 让用户在前端配置自己的 API 密钥
- 查看 Function 日志定位问题

### Q: 如何查看日志？

A:
- Vercel 控制台 → 选择项目 → "Deployments" → 点击部署 → "Functions" 标签
- 或使用 CLI: `vercel logs <deployment-url>`

### Q: 如何回滚部署？

A:
- Vercel 控制台 → "Deployments" → 选择历史版本 → "Promote to Production"

### Q: Server-Sent Events (SSE) 是否支持？

A: ✅ 支持！Vercel 支持 SSE，视频生成进度和流式对话功能都能正常工作。

## 📊 性能优化

### 推荐设置

1. **地区选择**
   - 选择离用户最近的地区
   - 中国用户建议选择 Hong Kong (hkg1)

2. **缓存配置**
   - 静态资源已自动缓存
   - API 响应不缓存（实时数据）

3. **函数超时**
   - Hobby 计划: 10秒
   - Pro 计划: 60秒
   - Enterprise 计划: 900秒

视频生成可能需要较长时间，建议升级到 Pro 计划。

## 💰 费用说明

### Hobby（免费）计划

- ✅ 无限部署
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ⚠️ 函数超时 10秒（视频生成可能超时）
- ⚠️ 每月带宽限制 100GB

### Pro 计划（$20/月）

- ✅ 函数超时 60秒
- ✅ 更多带宽和构建时间
- ✅ 分析功能
- ✅ 密码保护

## 🔗 有用的链接

- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [Vercel 环境变量](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel 限制说明](https://vercel.com/docs/concepts/limits/overview)

## ✅ 部署检查清单

部署前确认：

- [ ] 代码已推送到 GitHub
- [ ] `vercel.json` 配置正确
- [ ] `package.json` 包含所有依赖
- [ ] 测试本地运行正常
- [ ] （可选）准备好环境变量

部署后验证：

- [ ] 网站可以访问
- [ ] 前端页面显示正常
- [ ] 设置功能可以使用
- [ ] API 调用正常
- [ ] 视频/图像生成功能正常

---

**🎉 恭喜！你的 Sora2 AI 生成器已成功部署到 Vercel！**

享受永久免费的 AI 创作之旅吧！ 🚀
