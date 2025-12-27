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

// 辅助函数：从请求中获取或创建 Sora 实例
function getSoraInstance(req) {
  const customApiKey = req.headers['x-api-key'];
  const customBaseUrl = req.headers['x-base-url'];

  // 默认 Base URL 和 API Key
  const DEFAULT_BASE_URL = 'https://api.maynor1024.live/';
  const DEFAULT_API_KEY = 'sk-buitin-key-do-not-change';

  // 确定使用的 API Key 和 Base URL（优先级：前端 > 环境变量 > 默认值）
  let apiKey = customApiKey || process.env.SORA_API_KEY || DEFAULT_API_KEY;
  let baseUrl = customBaseUrl || process.env.SORA_BASE_URL || DEFAULT_BASE_URL;

  const source = customApiKey ? 'frontend' : (process.env.SORA_API_KEY ? 'environment' : 'default');

  console.log('[Server] API configuration:', {
    source: source,
    apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'none',
    baseUrl: baseUrl
  });

  return new Sora2(apiKey, baseUrl);
}

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

    const soraInstance = getSoraInstance(req);
    if (!soraInstance) {
      return res.status(400).json({ error: 'API配置缺失，请在前端设置API Key和Base URL' });
    }

    console.log('[Server] Chat request:', { model: options.model, messagesCount: messages.length });
    const response = await soraInstance.chat(messages, options);
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

    const soraInstance = getSoraInstance(req);
    if (!soraInstance) {
      return res.status(400).json({ error: 'API配置缺失，请在前端设置API Key和Base URL' });
    }

    // Forward the stream from Sora API
    await soraInstance.chatStream(messages, options, (chunk) => {
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

    const soraInstance = getSoraInstance(req);
    if (!soraInstance) {
      return res.status(400).json({ error: 'API配置缺失，请在前端设置API Key和Base URL' });
    }

    const response = await soraInstance.createCompletion(prompt, options);
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

    // 获取 Sora 实例（优先使用前端配置）
    const soraInstance = getSoraInstance(req);
    if (!soraInstance) {
      return res.status(400).json({ error: 'API配置缺失，请在前端设置API Key和Base URL' });
    }

    // 将图片数据传递给视频生成选项
    const videoOptions = {
      ...options,
      model: model, // 添加模型参数
      image: image // base64编码的图片数据或URL
    };

    // 统一使用 V2 API（返回 task_id）
    console.log('[Server] Using V2 API for video generation');
    const response = await soraInstance.generateVideo(prompt, videoOptions);
    res.json(response);
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

// Get video task status - 支持 V2 API 任务轮询
app.get('/api/video-task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const soraInstance = getSoraInstance(req);
    if (!soraInstance) {
      return res.status(400).json({ error: 'API配置缺失，请在前端设置API Key和Base URL' });
    }

    console.log(`[Server] Querying video task status: ${taskId}`);
    const taskStatus = await soraInstance.getVideoTaskStatus(taskId);

    console.log(`[Server] Task status response:`, taskStatus);
    res.json(taskStatus);
  } catch (error) {
    console.error('Task status query error:', error);
    res.status(500).json({
      error: error.message,
      status: 'error'
    });
  }
});

// 保留旧的API端点以防兼容性问题
app.get('/api/video/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const soraInstance = getSoraInstance(req);
    if (!soraInstance) {
      return res.status(400).json({ error: 'API配置缺失，请在前端设置API Key和Base URL' });
    }

    console.log(`[Server] Querying video task status (legacy): ${taskId}`);
    const taskStatus = await soraInstance.getVideoTaskStatus(taskId);

    res.json(taskStatus);
  } catch (error) {
    console.error('Task status query error (legacy):', error);
    res.status(500).json({
      error: error.message,
      status: 'error'
    });
  }
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

    const soraInstance = getSoraInstance(req);
    if (!soraInstance) {
      return res.status(400).json({ error: 'API配置缺失，请在前端设置API Key和Base URL' });
    }

    console.log('[Server] Generating image with options:', imageOptions);
    const response = await soraInstance.generateImage(prompt, imageOptions);
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

    const soraInstance = getSoraInstance(req);
    if (!soraInstance) {
      return res.status(400).json({ error: 'API配置缺失，请在前端设置API Key和Base URL' });
    }

    console.log('[Server] Editing image with options:', { edit_type, prompt });
    const response = await soraInstance.editImage(editOptions);
    res.json(response);
  } catch (error) {
    console.error('Image edit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create character endpoint
app.post('/api/character/create', async (req, res) => {
  try {
    const { videoUrl, timestamps } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    if (!timestamps) {
      return res.status(400).json({ error: 'Timestamps are required' });
    }

    // 获取 Sora 实例（优先使用前端配置）
    const soraInstance = getSoraInstance(req);
    if (!soraInstance) {
      return res.status(400).json({ error: 'API配置缺失，请在前端设置API Key和Base URL' });
    }

    console.log('[Server] Creating character with video:', videoUrl, 'timestamps:', timestamps);
    
    const response = await soraInstance.createCharacter(videoUrl, timestamps);
    res.json(response);
  } catch (error) {
    console.error('Character creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create video with character endpoint
app.post('/api/video/create-with-character', async (req, res) => {
  try {
    const {
      prompt,
      model,
      size,
      orientation,
      duration,
      character_url,
      character_timestamps,
      images
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!model) {
      return res.status(400).json({ error: 'Model is required' });
    }

    // 提取 @username 如果存在
    const mentionMatch = prompt.match(/@([\w.]+)/);
    const characterUsername = mentionMatch ? mentionMatch[1] : null;

    // 根据 API 文档构建视频选项
    const videoOptions = {
      prompt: prompt,
      model: model,
      aspect_ratio: orientation === 'portrait' ? '9:16' : '16:9',
      duration: duration,
      hd: model === 'sora-2-pro',
      images: images || [],
      character_url: character_url,
      character_timestamps: character_timestamps
    };

    // 获取 Sora 实例（优先使用前端配置）
    const soraInstance = getSoraInstance(req);
    if (!soraInstance) {
      return res.status(400).json({ error: 'API配置缺失，请在前端设置API Key和Base URL' });
    }

    console.log('[Server] Creating video with character:', { 
      model, 
      prompt: prompt.substring(0, 50) + '...', 
      characterUsername: characterUsername,
      hasCharacterUrl: !!character_url,
      hasCharacterTimestamps: !!character_timestamps
    });
    
    const response = await soraInstance.createVideoWithCharacter(videoOptions);
    res.json(response);
  } catch (error) {
    console.error('Video with character creation error:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    // 返回更详细的错误信息
    const errorMessage = error.response?.data?.error?.message 
      || error.response?.data?.error?.message_zh 
      || error.message 
      || 'Unknown error';
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.response?.data || null
    });
  }
});

// Get video task status endpoint (for character videos)
app.get('/api/video/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const soraInstance = getSoraInstance(req);
    if (!soraInstance) {
      return res.status(400).json({ error: 'API配置缺失，请在前端设置API Key和Base URL' });
    }

    console.log('[Server] Querying video task status:', taskId);
    const response = await soraInstance.getVideoTaskStatus(taskId);
    res.json(response);
  } catch (error) {
    console.error('Video task status query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get video status endpoint (new corrected path)
app.get('/api/videos/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    // 检查是否有自定义 API 配置（从请求头）
    const customApiKey = req.headers['x-api-key'];
    const customBaseUrl = req.headers['x-base-url'];

    // 获取 Sora 实例（优先使用前端配置）
    const soraInstance = getSoraInstance(req);
    if (!soraInstance) {
      return res.status(400).json({ error: 'API配置缺失，请在前端设置API Key和Base URL' });
    }

    console.log('[Server] Querying video status:', taskId);
    const response = await soraInstance.getVideoTaskStatus(taskId);
    res.json(response);
  } catch (error) {
    console.error('Video status query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Video upload endpoint for character creation
app.post('/api/upload/video', async (req, res) => {
  try {
    // Note: This is a simplified implementation
    // In a production environment, you would want to:
    // 1. Use proper file upload handling (multer)
    // 2. Store files in cloud storage (AWS S3, etc.)
    // 3. Validate video files
    // 4. Handle file size limits

    // For now, we'll return a placeholder URL
    // In a real implementation, you would upload the video and return the actual URL

    // Placeholder response - in reality this would upload the video file
    const placeholderUrl = 'https://filesystem.site/cdn/20251030/javYrU4etHVFDqg8by7mViTWHlMOZy.mp4';

    res.json({
      url: placeholderUrl,
      message: 'Video uploaded successfully'
    });
  } catch (error) {
    console.error('Video upload error:', error);
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
