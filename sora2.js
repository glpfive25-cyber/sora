import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class Sora2 {
  constructor(apiKey = process.env.SORA_API_KEY, baseURL = process.env.SORA_BASE_URL) {
    this.apiKey = apiKey;
    this.baseURL = baseURL || 'https://apipro.maynor1024.live/';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 180000, // 3分钟超时
      validateStatus: (status) => status < 500 // 只重试5xx错误
    });
  }

  async chat(messages, options = {}) {
    const maxRetries = 2;
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`[Sora2] Sending request to ${this.baseURL}/v1/chat/completions`);
        console.log(`[Sora2] Model: ${options.model || 'sora-2'}, Messages:`, messages.length);

        const response = await this.client.post('/v1/chat/completions', {
          model: options.model || 'sora-2',
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 1000,
          stream: false,
          ...options
        });

        console.log(`[Sora2] Success! Response received`);
        return response.data;
      } catch (error) {
        lastError = error;

        console.error(`[Sora2] Error on attempt ${i + 1}:`, {
          code: error.code,
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });

        // 如果是超时或连接错误，重试
        const isNetworkError =
          error.code === 'ECONNRESET' ||
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNABORTED' ||
          error.message.includes('socket hang up') ||
          error.message.includes('timeout');

        if (isNetworkError && i < maxRetries - 1) {
          const delay = 2000 * (i + 1);
          console.log(`[Sora2] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // 其他错误直接抛出
        const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
        throw new Error(`API Error: ${errorMsg}`);
      }
    }

    throw new Error(`API failed after ${maxRetries} retries: ${lastError.message}`);
  }

  async createCompletion(prompt, options = {}) {
    const messages = [
      { role: 'user', content: prompt }
    ];
    return this.chat(messages, options);
  }

  // Streaming chat
  async chatStream(messages, options = {}, onChunk) {
    try {
      console.log(`[Sora2] Starting stream to ${this.baseURL}/v1/chat/completions`);

      const response = await this.client.post('/v1/chat/completions', {
        model: options.model || 'sora-2',
        messages: messages,
        temperature: options.temperature || 1,
        stream: true,
        ...options
      }, {
        responseType: 'stream'
      });

      return new Promise((resolve, reject) => {
        let buffer = '';

        response.data.on('data', (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            // Forward as SSE format
            if (line.startsWith('data: ') || line.startsWith('{')) {
              // Already has data: prefix or is raw JSON
              if (!line.startsWith('data: ')) {
                onChunk(`data: ${line}\n\n`);
              } else {
                onChunk(`${line}\n\n`);
              }
            }
          }
        });

        response.data.on('end', () => {
          console.log('[Sora2] Stream completed');
          onChunk('data: [DONE]\n\n');
          resolve();
        });

        response.data.on('error', (error) => {
          console.error('[Sora2] Stream error:', error);
          reject(error);
        });
      });
    } catch (error) {
      throw new Error(`Stream error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 视频生成
  async generateVideo(prompt, options = {}) {
    try {
      const requestData = {
        prompt: prompt,
        orientation: options.orientation || 'landscape', // landscape, portrait, square
        duration: options.duration || 5,
        resolution: options.resolution || '1080p'
      };

      // 如果有图片，添加到请求中
      if (options.image) {
        requestData.image = options.image;
        console.log('[Sora2] Generating video with reference image');
      }

      // 添加其他选项
      Object.keys(options).forEach(key => {
        if (!['orientation', 'duration', 'resolution', 'image'].includes(key)) {
          requestData[key] = options[key];
        }
      });

      const response = await this.client.post('/v1/video/generations', requestData);

      return response.data;
    } catch (error) {
      throw new Error(`Video generation error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 查询视频任务状态
  async getVideoTask(taskId) {
    try {
      const response = await this.client.get(`/v1/video/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Task query error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

export default Sora2;
