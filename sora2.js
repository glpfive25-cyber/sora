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
      timeout: 600000, // 10分钟超时（图像和视频生成需要较长时间）
      validateStatus: (status) => status < 500 // 只重试5xx错误
    });
  }

  async chat(messages, options = {}) {
    const maxRetries = 3; // 增加到3次重试
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

        console.error(`[Sora2] Error on attempt ${i + 1}/${maxRetries}:`, {
          code: error.code,
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });

        // 检查是否是需要重试的错误
        const isNetworkError =
          error.code === 'ECONNRESET' ||
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNABORTED' ||
          error.message.includes('socket hang up') ||
          error.message.includes('timeout');

        const is504Error = error.response?.status === 504;

        // 对于504或网络错误，重试
        if ((isNetworkError || is504Error) && i < maxRetries - 1) {
          const delay = 3000 + (i * 2000); // 渐进延迟: 3s, 5s, 7s
          console.log(`[Sora2] Retrying in ${delay}ms... (${i + 2}/${maxRetries})`);
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

  // 视频生成 - 使用 Chat API 格式（支持流式和非流式）
  async generateVideo(prompt, options = {}) {
    const startTime = Date.now();
    try {
      // 构建消息内容数组
      const contentArray = [];

      // 添加文本提示词
      contentArray.push({
        type: 'text',
        text: prompt
      });

      // 如果有图片，添加图片URL到内容中
      if (options.image) {
        contentArray.push({
          type: 'image_url',
          image_url: {
            url: options.image
          }
        });
        console.log('[Sora2] Generating video with reference image');
      }

      // 构建消息数组
      const messages = [
        {
          role: 'user',
          content: contentArray
        }
      ];

      // 使用指定的模型或默认模型
      const model = options.model || 'sora_video2';

      console.log(`[Sora2] Using model: ${model}`);
      console.log(`[Sora2] Prompt: ${prompt}`);
      console.log(`[Sora2] Non-stream mode, timeout: 300s`);

      // 使用 Chat API 格式调用
      const requestData = {
        model: model,
        messages: messages,
        stream: false // 非流式模式
      };

      // Video generation typically takes longer, so use extended timeout
      const response = await this.client.post('/v1/chat/completions', requestData, {
        timeout: 300000 // 5 minutes timeout for video generation
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[Sora2] Video generation completed in ${elapsed}s`);

      return response.data;
    } catch (error) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(`[Sora2] Video generation failed after ${elapsed}s:`, {
        status: error.response?.status,
        code: error.code,
        message: error.message
      });

      // 如果是504错误，提供更详细的错误信息
      if (error.response?.status === 504) {
        throw new Error('Video generation timeout (504). The server took too long to respond. Try using stream mode or a shorter video option.');
      }

      // 如果是客户端超时
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error(`Request timeout after ${elapsed}s. Try using stream mode for longer videos.`);
      }

      throw new Error(`Video generation error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 视频生成 - 流式版本（用于处理长时间生成）
  async generateVideoStream(prompt, options = {}, onProgress) {
    const startTime = Date.now();
    try {
      // 构建消息内容数组
      const contentArray = [];

      // 添加文本提示词
      contentArray.push({
        type: 'text',
        text: prompt
      });

      // 如果有图片，添加图片URL到内容中
      if (options.image) {
        contentArray.push({
          type: 'image_url',
          image_url: {
            url: options.image
          }
        });
        console.log('[Sora2] Generating video with reference image (stream mode)');
      }

      // 构建消息数组
      const messages = [
        {
          role: 'user',
          content: contentArray
        }
      ];

      // 使用指定的模型或默认模型
      const model = options.model || 'sora_video2';

      console.log(`[Sora2] Using model: ${model} (stream mode)`);
      console.log(`[Sora2] Prompt: ${prompt}`);
      console.log(`[Sora2] Stream mode enabled, timeout: 600s`);

      // 使用 Chat API 格式调用（流式）
      const requestData = {
        model: model,
        messages: messages,
        stream: true // 启用流式响应
      };

      const response = await this.client.post('/v1/chat/completions', requestData, {
        timeout: 600000, // 10 minutes for stream
        responseType: 'stream'
      });

      return new Promise((resolve, reject) => {
        let buffer = '';
        let fullContent = '';

        response.data.on('data', (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || line.trim() === 'data: [DONE]') continue;

            const jsonStr = line.startsWith('data: ') ? line.slice(6) : line;
            if (!jsonStr.startsWith('{')) continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.message?.content;

              if (content) {
                fullContent += content;
                // 调用进度回调
                if (onProgress) {
                  onProgress(content, fullContent);
                }
              }

              // 检查是否完成
              if (parsed.choices?.[0]?.finish_reason === 'stop') {
                resolve({
                  id: parsed.id,
                  object: parsed.object,
                  created: parsed.created,
                  choices: [{
                    message: {
                      role: 'assistant',
                      content: fullContent
                    },
                    finish_reason: 'stop'
                  }]
                });
              }
            } catch (e) {
              console.warn('[Sora2] Failed to parse stream chunk:', e);
            }
          }
        });

        response.data.on('end', () => {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
          console.log(`[Sora2] Stream completed in ${elapsed}s`);
          if (fullContent) {
            resolve({
              choices: [{
                message: {
                  role: 'assistant',
                  content: fullContent
                }
              }]
            });
          } else {
            reject(new Error('Stream ended without content'));
          }
        });

        response.data.on('error', (error) => {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
          console.error(`[Sora2] Stream error after ${elapsed}s:`, error);
          reject(error);
        });
      });
    } catch (error) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(`[Sora2] Video stream error after ${elapsed}s:`, {
        status: error.response?.status,
        code: error.code,
        message: error.message
      });

      // 提供更有用的错误信息
      if (error.response?.status === 504) {
        throw new Error('Video stream timeout (504). API gateway timeout - the upstream service may be overloaded.');
      }

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error(`Stream timeout after ${elapsed}s. The video generation is taking longer than expected.`);
      }

      throw new Error(`Video stream error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 查询视频任务状态 - 已废弃，Chat API 直接返回结果
  // 保留此方法以兼容旧代码
  async getVideoTask(taskId) {
    console.warn('[Sora2] getVideoTask is deprecated - Chat API returns results directly');
    throw new Error('Task polling is no longer supported. Use the chat API which returns results directly.');
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

      // 检查是否有错误响应
      if (response.data && response.data.error) {
        console.error('API returned error:', response.data.error);
        throw new Error(response.data.error.message || response.data.error.message_zh || 'Image generation failed');
      }

      // 转换返回的数据格式
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
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

      // 如果响应格式不符合预期，记录并抛出错误
      console.warn('Unexpected response format from API:', response.data);
      throw new Error('Invalid response format from API');
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

        // 检查是否有错误响应
        if (response.data && response.data.error) {
          console.error('API returned error:', response.data.error);
          throw new Error(response.data.error.message || response.data.error.message_zh || 'Image variation failed');
        }

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
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
        // 如果响应格式不符合预期，抛出错误
        console.warn('Unexpected variation response format from API:', response.data);
        throw new Error('Invalid response format from API');
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

        // 检查是否有错误响应
        if (response.data && response.data.error) {
          console.error('API returned error:', response.data.error);
          throw new Error(response.data.error.message || response.data.error.message_zh || 'Outpaint failed');
        }

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
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
        // 如果响应格式不符合预期，抛出错误
        console.warn('Unexpected outpaint response format from API:', response.data);
        throw new Error('Invalid response format from API');
      }

      // 默认使用inpaint
      if (options.mask) {
        console.log(`[Sora2] Inpainting image`);
        const response = await this.client.post('/v1/images/edits', requestData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // 检查是否有错误响应
        if (response.data && response.data.error) {
          console.error('API returned error:', response.data.error);
          throw new Error(response.data.error.message || response.data.error.message_zh || 'Inpaint failed');
        }

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
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
        // 如果响应格式不符合预期，抛出错误
        console.warn('Unexpected inpaint response format from API:', response.data);
        throw new Error('Invalid response format from API');
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
