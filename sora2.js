import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class Sora2 {
  constructor(
    apiKey = process.env.SORA_API_KEY, 
    baseURL = process.env.SORA_BASE_URL, 
    characterApiKey = process.env.SORA_CHARACTER_API_KEY,
    characterBaseURL = process.env.SORA_CHARACTER_BASE_URL
  ) {
    this.apiKey = apiKey;
    this.characterApiKey = characterApiKey || apiKey; // 如果没有提供角色 API Key，使用标准 API Key
    this.baseURL = baseURL || 'https://api.maynor1024.live/';
    this.characterBaseURL = characterBaseURL || 'https://apipro.maynor1024.live/';
    
    // 标准 API 客户端（用于视频和图像工具）
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 600000, // 10分钟超时（图像和视频生成需要较长时间）
      validateStatus: (status) => status < 500 // 只重试5xx错误
    });
    
    // Pro API 客户端（用于角色工具）
    this.characterClient = axios.create({
      baseURL: this.characterBaseURL,
      headers: {
        'Authorization': `Bearer ${this.characterApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 600000,
      validateStatus: (status) => status < 500
    });
    
    console.log(`[Sora2] Initialized with baseURL: ${this.baseURL}`);
    console.log(`[Sora2] Character API baseURL: ${this.characterBaseURL}`);
    console.log(`[Sora2] Using separate API keys: ${this.apiKey !== this.characterApiKey}`);
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

  // 视频生成 - 使用 V2 API 格式
  async generateVideo(prompt, options = {}) {
    const startTime = Date.now();
    try {
      console.log(`[Sora2] Generating video with V2 API`);
      console.log(`[Sora2] Using V2 API format for video generation`);
      console.log(`[Sora2] Using character API endpoint: ${this.characterBaseURL}`);

      // 使用指定的模型或默认模型
      const model = options.model || 'sora-2';

      // 构建请求数据（V2 API 格式）
      const requestData = {
        prompt: prompt,
        model: model,
        aspect_ratio: options.aspect_ratio || options.orientation === 'portrait' ? '9:16' : '16:9',
        duration: options.duration || '10',
        hd: options.hd || false,
        watermark: options.watermark || false,
        private: options.private || false
      };

      // 如果有图片，添加到 images 数组
      if (options.image) {
        requestData.images = [options.image];
        console.log('[Sora2] Added reference image to request');
      }

      console.log(`[Sora2] Using model: ${model}`);
      console.log(`[Sora2] Request data:`, requestData);

      // 使用新的 V2 API 端点
      const response = await this.characterClient.post('/v2/videos/generations', requestData, {
        timeout: 60000 // 1分钟超时，任务提交应该很快
      });

      if (response.data && response.data.error) {
        console.error('API returned error:', response.data.error);
        throw new Error(response.data.error.message || response.data.error.message_zh || 'Video generation failed');
      }

      const taskId = response.data.task_id;
      if (!taskId) {
        throw new Error('No task_id returned from API');
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[Sora2] Video task submitted in ${elapsed}s, ID: ${taskId}`);

      // 返回任务ID，以便后续查询
      return {
        task_id: taskId,
        status: 'pending',
        model: model,
        prompt: prompt,
        data: response.data
      };
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
          console.log(`[Sora2] Stream completed in ${elapsed}s, content length: ${fullContent.length}`);

          // 即使没有内容，也返回一个响应，让前端能够处理
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
            // 对于视频生成，空流可能意味着API返回了错误或者正在处理中
            // 返回一个空响应而不是抛出错误，让前端能够处理这种情况
            console.warn('[Sora2] Stream ended without content, returning empty response');
            resolve({
              choices: [{
                message: {
                  role: 'assistant',
                  content: ''
                }
              }]
            });
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
      console.error(`[Sora2] Video generation error after ${elapsed}s:`, {
        status: error.response?.status,
        code: error.code,
        message: error.message
      });

      // 提供更有用的错误信息，包含状态码
      if (error.response?.status === 503) {
        throw new Error('Request failed with status code 503');
      }

      if (error.response?.status === 504) {
        throw new Error('Video generation timeout (504). API gateway timeout - the upstream service may be overloaded.');
      }

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error(`Request timeout after ${elapsed}s. The video generation is taking longer than expected.`);
      }

      throw new Error(`Video generation error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'NOT_START': '等待开始',
      'IN_PROGRESS': '生成中',
      'SUCCESS': '完成',
      'FAILURE': '失败'
    };
    return statusMap[status] || status;
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

  // 创建角色
  async createCharacter(videoUrl, timestamps) {
    try {
      console.log(`[Sora2] Creating character from video: ${videoUrl}, timestamps: ${timestamps}`);
      console.log(`[Sora2] API endpoint: ${this.characterBaseURL}sora/v1/characters`);

      const requestData = {
        url: videoUrl,
        timestamps: timestamps
      };

      const response = await this.characterClient.post('/sora/v1/characters', requestData);

      // 检查响应是否为 HTML（表示端点错误）
      if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
        console.error('[Sora2] API returned HTML instead of JSON - endpoint may not exist');
        throw new Error('角色创建 API 端点不可用。您的 API 提供商可能不支持角色创建功能。请检查 API 文档或联系提供商。');
      }

      if (response.data && response.data.error) {
        console.error('API returned error:', response.data.error);
        throw new Error(response.data.error.message || response.data.error.message_zh || 'Character creation failed');
      }

      console.log('[Sora2] Character created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Sora2] Character creation error:', {
        message: error.message,
        status: error.response?.status,
        contentType: error.response?.headers['content-type'],
        dataType: typeof error.response?.data
      });

      // 如果错误消息已经是我们自定义的，直接抛出
      if (error.message.includes('API 端点不可用') || error.message.includes('不支持角色创建')) {
        throw error;
      }

      throw new Error(`Character creation error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 带角色创建视频 - 使用新的 V2 API
  async createVideoWithCharacter(options = {}) {
    try {
      console.log(`[Sora2] Creating video with character`);
      console.log(`[Sora2] Using V2 API format for character video`);
      console.log(`[Sora2] Using character API endpoint: ${this.characterBaseURL}`);

      // 使用指定的模型或默认模型
      const model = options.model || 'sora-2-pro';
      
      // 构建请求数据（V2 API 格式）
      const requestData = {
        prompt: options.prompt || '',
        model: model,
        aspect_ratio: options.aspect_ratio || options.orientation === 'portrait' ? '9:16' : '16:9',
        duration: options.duration || '10',
        hd: options.hd || false,
        watermark: options.watermark || false,
        private: options.private || false
      };

      // 添加角色信息
      if (options.character_url && options.character_timestamps) {
        requestData.character_url = options.character_url;
        requestData.character_timestamps = options.character_timestamps;
        console.log('[Sora2] Added character info:', {
          url: options.character_url,
          timestamps: options.character_timestamps
        });
      }

      // 如果有图片，添加到 images 数组
      if (options.images && options.images.length > 0) {
        requestData.images = options.images;
        console.log('[Sora2] Added', options.images.length, 'images to request');
      }

      console.log(`[Sora2] Using model: ${model}`);
      console.log(`[Sora2] Request data:`, requestData);

      // 使用新的 V2 API 端点
      const response = await this.characterClient.post('/v2/videos/generations', requestData, {
        timeout: 60000 // 1分钟超时，任务提交应该很快
      });

      if (response.data && response.data.error) {
        console.error('API returned error:', response.data.error);
        throw new Error(response.data.error.message || response.data.error.message_zh || 'Video creation with character failed');
      }

      const taskId = response.data.task_id;
      if (!taskId) {
        throw new Error('No task_id returned from API');
      }

      console.log('[Sora2] Video with character task submitted, ID:', taskId);
      
      return {
        task_id: taskId,
        status: 'pending',
        data: response.data
      };
    } catch (error) {
      console.error('[Sora2] Video with character creation error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });
      
      // 提供更详细的错误信息
      let errorMessage = 'Video with character creation error: ';
      
      if (error.response?.data?.error?.message) {
        errorMessage += error.response.data.error.message;
      } else if (error.response?.data?.error) {
        errorMessage += JSON.stringify(error.response.data.error);
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message.includes('Invalid URL')) {
        errorMessage += `Invalid URL - 请检查 API 端点配置。尝试访问: ${this.baseURL}v1/video/create`;
      } else {
        errorMessage += error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // 查询视频任务状态（支持标准 API 和角色 API）
  async getVideoTaskStatus(taskId, useCharacterAPI = false) {
    try {
      console.log(`[Sora2] Querying video task status: ${taskId}`);
      
      // 根据参数选择使用哪个客户端
      const client = useCharacterAPI ? this.characterClient : this.client;
      const apiUrl = useCharacterAPI ? this.characterBaseURL : this.baseURL;
      
      console.log(`[Sora2] Using API: ${apiUrl}`);

      // 使用新的 V2 API 端点
      const response = await client.get(`/v2/videos/${taskId}`);

      if (response.data && response.data.error) {
        console.error('API returned error:', response.data.error);
        throw new Error(response.data.error.message || response.data.error.message_zh || 'Task status query failed');
      }

      return response.data;
    } catch (error) {
      console.error('[Sora2] Task status query error:', error);
      throw new Error(`Task status query error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

export default Sora2;
