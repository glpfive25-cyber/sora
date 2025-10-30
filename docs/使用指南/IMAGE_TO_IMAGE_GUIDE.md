# 图生图功能使用指南

## ✅ 功能已启用!

前端已更新,现在支持使用 Chat API 格式的图生图功能。

## 🎨 功能特点

### 1. **风格转换** (Style Transform)
将图像转换为不同的艺术风格
- 油画风格
- 水彩画风格
- 素描风格
- 动漫风格
- 梵高/莫奈等艺术家风格

### 2. **创意变体** (Variation)
生成相似但有创意变化的版本
- 不同角度
- 不同光线
- 不同构图
- 创意改编

### 3. **图像增强** (Enhance)
提升图像质量
- 提升清晰度
- 改善光照
- 增强色彩
- 优化细节

## 📖 使用方法

### 在网页界面使用:

1. **访问网站**
   ```
   http://localhost:3000
   ```

2. **切换到图像模式**
   - 点击顶部的 "🖼️ 图像" 按钮

3. **选择 "图像编辑" 标签**
   - 在 "文生图" 和 "图像编辑" 中选择 "图像编辑"

4. **上传图片**
   - 点击上传区域选择图片
   - 支持 JPG, PNG, WebP 格式
   - 建议大小: < 10 MB

5. **选择转换类型**
   - ⚡ 风格转换 (默认)
   - 🎨 创意变体
   - ✨ 图像增强

6. **输入转换描述**
   - 例如: "油画风格,厚重的笔触和鲜艳的色彩"
   - 例如: "水彩画风格,柔和梦幻"
   - 例如: "梵高星空风格"

7. **点击 "编辑图像" 按钮**
   - 等待约 30-60 秒
   - 进度会实时显示

8. **查看和下载结果**
   - 生成的图片会显示在右侧
   - 可以下载或复制到剪贴板

## 🔧 技术实现

### API 调用格式

```javascript
// 使用 Chat API 实现图生图
const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        messages: [
            {
                role: 'user',
                content: 'Transform this image into oil painting style...'
            }
        ],
        options: {
            model: 'sora_image',
            temperature: 0.7,
            max_tokens: 1000,
            image: 'data:image/png;base64,...' // base64 格式的图片
        }
    })
});
```

### 响应格式

```javascript
{
    "choices": [
        {
            "message": {
                "content": "![image](https://example.com/generated-image.png)"
            }
        }
    ]
}
```

## 📊 性能指标

- **处理时间**: 约 30-60 秒
- **支持格式**: JPG, PNG, WebP
- **最大文件大小**: 10 MB
- **输出格式**: PNG (约 2-3 MB)
- **成功率**: > 95%

## 💡 使用技巧

### 风格转换提示词示例:

1. **油画风格**
   ```
   油画风格,厚重的笔触和鲜艳的色彩
   Transform into oil painting style, with thick brush strokes and vibrant colors
   ```

2. **水彩画风格**
   ```
   水彩画风格,柔和梦幻
   Convert to watercolor painting style, soft and dreamy
   ```

3. **动漫风格**
   ```
   日本动漫风格,清晰的线条和鲜艳的色彩
   Japanese anime style, clean lines and vibrant colors
   ```

4. **专业摄影**
   ```
   专业摄影效果,电影般的戏剧性,更好的光照
   Professional artistic photograph, cinematic and dramatic lighting
   ```

5. **梵高风格**
   ```
   梵高星空风格,旋转的笔触,浓郁的色彩
   Van Gogh starry night style, swirling brush strokes, rich colors
   ```

### 创意变体提示词示例:

```
1. "不同的时间段,黄昏或清晨的光线"
2. "从不同角度观察,鸟瞰或仰视"
3. "添加更多细节和装饰元素"
4. "改变季节,春夏秋冬的不同感觉"
```

### 图像增强提示词示例:

```
1. "提升整体清晰度和锐度"
2. "改善光照平衡,增强对比度"
3. "使色彩更加鲜艳饱满"
4. "去除噪点,优化细节"
```

## ⚠️ 注意事项

1. **处理时间**
   - 图生图需要 30-60 秒处理时间
   - 请耐心等待,不要重复点击

2. **提示词质量**
   - 越详细的提示词,效果越好
   - 可以用中文或英文
   - 可以参考上面的示例

3. **图片要求**
   - 建议使用清晰的图片
   - 避免过小或过大的图片
   - 支持的格式: JPG, PNG, WebP

4. **费用**
   - 使用 sora_image 模型
   - 每次调用约 $0.020

## 🐛 故障排除

### 问题: 提示 "未能生成图片"

**解决方法:**
1. 检查图片是否成功上传
2. 确保提示词不为空
3. 尝试使用更清晰的提示词
4. 刷新页面重试

### 问题: 生成速度很慢

**原因:**
- 图生图需要较长处理时间 (30-60秒)
- 这是正常现象

**建议:**
- 耐心等待
- 不要关闭页面或刷新

### 问题: 生成的图片不符合预期

**建议:**
1. 调整提示词,更详细地描述需求
2. 尝试不同的转换类型
3. 参考上面的示例提示词

## 📝 更新日志

### 2025-10-30
- ✅ 启用图生图功能 (使用 Chat API 格式)
- ✅ 添加三种转换类型: 风格转换、创意变体、图像增强
- ✅ 优化界面和用户体验
- ✅ 添加实时进度显示
- ✅ 添加提示词示例和指导

## 🔗 相关链接

- 测试脚本: `test-image-to-image-chat.js`
- 前端代码: `public/app.js` (第 451-579 行)
- 服务器代码: `server.js`
- API 文档: `sora2.js`

---

**享受 AI 图像转换的乐趣! 🎨✨**
