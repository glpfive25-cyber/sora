import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class Sora2 {
  constructor(apiKey = process.env.SORA_API_KEY, baseURL = process.env.SORA_BASE_URL) {
    this.apiKey = apiKey;
    this.baseURL = baseURL || 'https://api.nextai.trade/';
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
        model: options.model || 'sora_video2', // 使用指定的模型或默认模型
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
        if (!['orientation', 'duration', 'resolution', 'image', 'model'].includes(key)) {
          requestData[key] = options[key];
        }
      });

      console.log(`[Sora2] Using model: ${requestData.model}`);
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

  // 图像生成
  async generateImage(prompt, options = {}) {
    try {
      const requestData = {
        prompt: prompt,
        model: options.model || 'sora_image',
        size: options.size || '1024x1024',
        n: options.num_images || 1,
        response_format: 'b64_json',
        quality: 'standard'
      };

      // 添加负向提示词
      if (options.negative_prompt) {
        requestData.negative_prompt = options.negative_prompt;
      }

      // 添加种子值
      if (options.seed) {
        requestData.seed = options.seed;
      }

      // 添加步数和CFG Scale（如果API支持）
      if (options.steps) {
        requestData.steps = options.steps;
      }
      if (options.cfg_scale) {
        requestData.cfg_scale = options.cfg_scale;
      }

      console.log(`[Sora2] Generating image with model: ${requestData.model}`);
      const response = await this.client.post('/v1/images/generations', requestData);

      // 转换返回的数据格式
      if (response.data && response.data.data) {
        const images = response.data.data.map(img => {
          if (img.b64_json) {
            return `data:image/png;base64,${img.b64_json}`;
          } else if (img.url) {
            return img.url;
          }
          return null;
        }).filter(img => img !== null);

        return { images: images };
      }

      // 如果响应格式不符合预期，返回空数组
      console.warn('Unexpected response format from API:', response.data);
      return { images: [] };
    } catch (error) {
      throw new Error(`Image generation error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 图像编辑
  async editImage(options = {}) {
    try {
      const requestData = {
        image: options.image,
        prompt: options.prompt || '',
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      };

      // 添加编辑类型
      if (options.edit_type === 'inpaint' && options.mask) {
        requestData.mask = options.mask;
      } else if (options.edit_type === 'variation') {
        // 使用variation endpoint
        const variationData = {
          image: options.image,
          n: 1,
          response_format: 'b64_json'
        };
        console.log(`[Sora2] Creating image variation`);
        const response = await this.client.post('/v1/images/variations', variationData);

        if (response.data && response.data.data) {
          const images = response.data.data.map(img => {
            if (img.b64_json) {
              return `data:image/png;base64,${img.b64_json}`;
            } else if (img.url) {
              return img.url;
            }
            return null;
          }).filter(img => img !== null);

          return { images: images };
        }
        // 如果响应格式不符合预期，返回空数组
        console.warn('Unexpected variation response format from API:', response.data);
        return { images: [] };
      } else if (options.edit_type === 'outpaint') {
        // 使用outpaint endpoint
        const outpaintData = {
          image: options.image,
          prompt: options.prompt || '',
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json'
        };
        console.log(`[Sora2] Outpainting image`);
        const response = await this.client.post('/v1/images/outpaint', outpaintData);

        if (response.data && response.data.data) {
          const images = response.data.data.map(img => {
            if (img.b64_json) {
              return `data:image/png;base64,${img.b64_json}`;
            } else if (img.url) {
              return img.url;
            }
            return null;
          }).filter(img => img !== null);

          return { images: images };
        }
        // 如果响应格式不符合预期，返回空数组
        console.warn('Unexpected variation response format from API:', response.data);
        return { images: [] };
      }

      // 默认使用inpaint
      if (options.mask) {
        console.log(`[Sora2] Inpainting image`);
        const response = await this.client.post('/v1/images/edits', requestData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data && response.data.data) {
          const images = response.data.data.map(img => {
            if (img.b64_json) {
              return `data:image/png;base64,${img.b64_json}`;
            } else if (img.url) {
              return img.url;
            }
            return null;
          }).filter(img => img !== null);

          return { images: images };
        }
        // 如果响应格式不符合预期，返回空数组
        console.warn('Unexpected variation response format from API:', response.data);
        return { images: [] };
      } else {
        // 如果没有mask，使用生成功能
        return await this.generateImage(options.prompt, { ...options });
      }
    } catch (error) {
      throw new Error(`Image edit error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

export default Sora2;
