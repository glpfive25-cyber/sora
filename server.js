import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Sora2 from './sora2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// 增加请求体大小限制到 50MB (用于处理 Base64 编码的图片)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Sora2 client
const sora = new Sora2();

// API Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, stream, ...otherOptions } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // 合并 options,支持新旧格式
    const options = {
      model: model || req.body.options?.model,
      stream: stream !== undefined ? stream : req.body.options?.stream,
      ...otherOptions,
      ...(req.body.options || {})
    };

    console.log('[Server] Chat request:', { model: options.model, messagesCount: messages.length });
    const response = await sora.chat(messages, options);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Streaming chat endpoint
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { messages, model, stream, ...otherOptions } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // 合并 options,支持新旧格式
    const options = {
      model: model || req.body.options?.model,
      stream: true, // 流式始终为 true
      ...otherOptions,
      ...(req.body.options || {})
    };

    console.log('[Server] Chat stream request:', { model: options.model });

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Forward the stream from Sora API
    await sora.chatStream(messages, options, (chunk) => {
      res.write(chunk);
    });

    res.end();
  } catch (error) {
    console.error('Chat stream error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

app.post('/api/completion', async (req, res) => {
  try {
    const { prompt, options } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await sora.createCompletion(prompt, options);
    res.json(response);
  } catch (error) {
    console.error('Completion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Video generation - Using Chat API format (支持流式和非流式)
app.post('/api/video/generate', async (req, res) => {
  try {
    const { prompt, image, options, model, useStream } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // 将图片数据传递给视频生成选项
    const videoOptions = {
      ...options,
      model: model, // 添加模型参数
      image: image // base64编码的图片数据或URL
    };

    // 如果请求使用流式模式，使用流式生成
    if (useStream) {
      console.log('[Server] Using stream mode for video generation');

      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // 禁用nginx缓冲

      try {
        // 使用流式生成
        const result = await sora.generateVideoStream(prompt, videoOptions, (chunk, fullContent) => {
          // 发送进度更新
          res.write(`data: ${JSON.stringify({
            type: 'progress',
            content: chunk,
            fullContent: fullContent
          })}\n\n`);
        });

        // 发送最终结果
        res.write(`data: ${JSON.stringify({
          type: 'done',
          data: result
        })}\n\n`);
        res.end();
      } catch (streamError) {
        console.error('[Server] Stream error:', streamError);
        res.write(`data: ${JSON.stringify({
          type: 'error',
          error: streamError.message
        })}\n\n`);
        res.end();
      }
    } else {
      // 非流式模式
      console.log('[Server] Using non-stream mode for video generation');
      const response = await sora.generateVideo(prompt, videoOptions);
      res.json(response);
    }
  } catch (error) {
    console.error('Video generation error:', error);

    // 如果是504错误，建议使用流式模式
    if (error.message.includes('504')) {
      res.status(504).json({
        error: error.message,
        suggestion: 'Try enabling stream mode for longer video generation tasks'
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get video task status - 已废弃
// Chat API 直接返回结果，不需要轮询任务状态
app.get('/api/video/tasks/:taskId', async (req, res) => {
  console.warn('[Server] Task polling endpoint is deprecated');
  res.status(410).json({
    error: 'Task polling is no longer supported. The Chat API returns results directly.',
    deprecated: true
  });
});

// Image generation endpoint
app.post('/api/image/generate', async (req, res) => {
  try {
    const { prompt, negative_prompt, size, num_images, model, seed, steps, cfg_scale } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const imageOptions = {
      model: model || 'sora_image',
      size: size || '1024x1024',
      num_images: num_images || 1,
      negative_prompt: negative_prompt || '',
      seed: seed || null,
      steps: steps || 20,
      cfg_scale: cfg_scale || 7
    };

    console.log('[Server] Generating image with options:', imageOptions);
    const response = await sora.generateImage(prompt, imageOptions);
    res.json(response);
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Image edit endpoint
app.post('/api/image/edit', async (req, res) => {
  try {
    const { image, edit_type, prompt, model, mask } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const editOptions = {
      model: model || 'sora_image',
      edit_type: edit_type || 'inpaint',
      prompt: prompt || '',
      image: image,
      mask: mask || null
    };

    console.log('[Server] Editing image with options:', { edit_type, prompt });
    const response = await sora.editImage(editOptions);
    res.json(response);
  } catch (error) {
    console.error('Image edit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route - force serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle /index.html directly
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve static files from public directory (for CSS, JS, images, etc.)
app.use(express.static('public'));

// Start server (only for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Sora-2 MVP Server running at http://localhost:${PORT}`);
    console.log(`📱 Open your browser to start chatting!`);
  });
}

// Export for Vercel
export default app;
