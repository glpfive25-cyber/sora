// 角色功能模块
(function() {
    'use strict';

    // 角色数据存储
    let characterHistory = JSON.parse(localStorage.getItem('sora2-character-history') || '[]');
    let currentCharacterVideoData = null;

    // 初始化角色功能
    function initializeCharacterFunctionality() {
        console.log('[CHARACTER] Initializing character functionality...');

        // 绑定事件监听器
        setupCharacterEventListeners();

        // 更新角色列表和选择器
        updateCharacterSelect();
        updateCharacterList();

        console.log('[CHARACTER] Character functionality initialized');
    }

    // 设置事件监听器
    function setupCharacterEventListeners() {
        // 角色创建相关
        const characterVideoUpload = document.getElementById('characterVideoUpload');
        const removeCharacterVideo = document.getElementById('removeCharacterVideo');
        const createCharacterBtn = document.getElementById('createCharacterBtn');
        const characterVideoForm = document.getElementById('characterVideoForm');

        if (characterVideoUpload) {
            characterVideoUpload.addEventListener('change', handleCharacterVideoUpload);
        }

        if (removeCharacterVideo) {
            removeCharacterVideo.addEventListener('click', () => {
                characterVideoUpload.value = '';
                document.getElementById('characterVideoPreview').classList.add('hidden');
                document.getElementById('characterPreviewVideo').src = '';
                currentCharacterVideoData = null;
            });
        }

        if (createCharacterBtn) {
            createCharacterBtn.addEventListener('click', handleCreateCharacter);
        }

        if (characterVideoForm) {
            characterVideoForm.addEventListener('submit', handleCharacterVideoGeneration);
        }

        // 模式切换事件
        document.querySelectorAll('[data-mode]').forEach(item => {
            item.addEventListener('click', (e) => {
                const mode = e.currentTarget.getAttribute('data-mode');
                switchMode(mode);
            });
        });
    }

    // 视频上传处理
    async function handleCharacterVideoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            // 视频预览
            const preview = document.getElementById('characterVideoPreview');
            const previewVideo = document.getElementById('characterPreviewVideo');

            if (preview && previewVideo) {
                const videoUrl = URL.createObjectURL(file);
                previewVideo.src = videoUrl;
                preview.classList.remove('hidden');

                await new Promise((resolve) => {
                    previewVideo.onloadedmetadata = resolve;
                    previewVideo.load();
                });
            }

            currentCharacterVideoData = file;
            showMessage('视频上传成功！请设置角色出现的时间范围', 'success');

        } catch (error) {
            console.error('Video upload error:', error);
            showMessage('视频上传失败: ' + error.message, 'error');
        }
    }

    // 创建角色处理
    async function handleCreateCharacter() {
        try {
            console.log('[CHARACTER] Starting character creation...');

            const startTime = document.getElementById('characterStartTime').value;
            const endTime = document.getElementById('characterEndTime').value;
            const createBtn = document.getElementById('createCharacterBtn');
            const resultDiv = document.getElementById('characterResult');

            if (!startTime || !endTime) {
                showMessage('请设置角色出现的时间范围', 'warning');
                return;
            }

            const start = parseFloat(startTime);
            const end = parseFloat(endTime);
            const duration = end - start;

            if (duration < 1 || duration > 3) {
                showMessage('时间范围差值必须在 1-3 秒之间', 'warning');
                return;
            }

            // 禁用按钮并显示加载状态
            createBtn.disabled = true;
            createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>创建中...</span>';

            if (resultDiv) {
                resultDiv.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="fas fa-user-plus fa-3x text-blue-500 mb-3" style="animation: spin 2s linear infinite;"></i>
                        <p>正在创建角色，请稍候...</p>
                    </div>
                `;
            }

            // 优先使用 URL 输入框的值
            const videoUrlInput = document.getElementById('characterVideoUrl');
            const defaultVideoUrl = 'https://upos-sz-mirrorhw.bilivideo.com/upgcxcode/73/02/30711220273/30711220273-1-192.mp4?e=ig8euxZM2rNcNbRVhwdVhwdlhWdVhwdVhoNvNC8BqJIzNbfq9rVEuxTEnE8L5F6VnEsSTx0vkX8fqJeYTj_lta53NCM=&nbs=1&trid=56cbd032d3ee4ec1b19b59c174cb4c2h&uipk=5&platform=html5&oi=1697279245&os=estghw&deadline=1766847707&mid=0&gen=playurlv3&og=hw&upsig=dc925ea429059acca0f7a5bee4ab03ff&uparams=e,nbs,trid,uipk,platform,oi,os,deadline,mid,gen,og&bvc=vod&nettype=0&bw=498080&agrr=0&buvid=&build=0&dl=0&f=h_0_0&orderid=0,1';
            let videoUrl = videoUrlInput && videoUrlInput.value.trim()
                ? videoUrlInput.value.trim()
                : defaultVideoUrl;
            
            // 如果用户上传了本地视频，提示使用 URL
            if (currentCharacterVideoData) {
                console.warn('[CHARACTER] 本地上传的视频无法被 API 访问，请使用视频 URL 输入框');
                showMessage('请使用视频 URL 输入框，本地上传的视频无法被 API 访问', 'warning');
                // 仍然使用 URL 输入框的值或默认值
            }
            
            console.log('[CHARACTER] Using video URL:', videoUrl);
            const timestamps = `${start},${end}`;

            // 根据接口文档，角色功能有两种使用方式：
            // 方式1: 先调用 /sora/v1/characters 创建角色，获得 username，然后在 prompt 中用 @username
            // 方式2: 直接在视频生成时使用 character_url 和 character_timestamps 参数
            //
            // 由于当前 API Key 可能不支持创建角色端点，我们采用方式2：
            // 直接将角色信息保存到本地，在视频生成时使用 character_url 和 character_timestamps

            console.log('[CHARACTER] Saving character info locally for direct use in video generation');

            // 生成本地角色 ID 和用户名
            const localId = 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const localUsername = 'mychar_' + Math.random().toString(36).substr(2, 6);

            // 保存角色数据到本地
            const fullCharacter = {
                id: localId,
                username: localUsername,
                permalink: '#',
                profile_picture_url: '',
                createdAt: Date.now(),
                videoUrl: videoUrl,
                timestamps: timestamps,
                startTime: start,
                endTime: end,
                isLocal: true
            };

            characterHistory.unshift(fullCharacter);
            if (characterHistory.length > 20) {
                characterHistory = characterHistory.slice(0, 20);
            }
            localStorage.setItem('sora2-character-history', JSON.stringify(characterHistory));

            // 更新界面
            updateCharacterSelect();
            updateCharacterList();

            if (resultDiv) {
                resultDiv.innerHTML = `
                    <div style="text-align: center; padding: 1rem;">
                        <i class="fas fa-check-circle fa-4x text-green-500 mb-3"></i>
                        <h3 class="text-lg font-bold mb-2">角色已保存！</h3>
                        <div style="background: #1a1a1a; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
                            <p style="font-size: 0.875rem;"><strong>角色ID:</strong> ${localId}</p>
                            <p style="font-size: 0.875rem;"><strong>角色名称:</strong> @${localUsername}</p>
                            <p style="font-size: 0.875rem;"><strong>视频URL:</strong> ${videoUrl.substring(0, 50)}...</p>
                            <p style="font-size: 0.875rem;"><strong>时间范围:</strong> ${start}s - ${end}s</p>
                            <p style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem;">
                                使用方式：在"角色视频生成"中选择此角色，或在描述中使用 @${localUsername}
                            </p>
                        </div>
                        <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
                            <button onclick="switchMode('character-video')" style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">
                                <i class="fas fa-video"></i>
                                <span>使用此角色生成视频</span>
                            </button>
                            <button onclick="window.copyToClipboard && window.copyToClipboard('@${localUsername}')" style="background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">
                                <i class="fas fa-copy"></i>
                                <span>复制 @${localUsername}</span>
                            </button>
                        </div>
                    </div>
                `;
            }

            // 添加复制到剪贴板的全局函数
            if (!window.copyToClipboard) {
                window.copyToClipboard = function(text) {
                    navigator.clipboard.writeText(text).then(() => {
                        showMessage('已复制: ' + text, 'success');
                    }).catch(() => {
                        // 后备方案
                        const textarea = document.createElement('textarea');
                        textarea.value = text;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        showMessage('已复制: ' + text, 'success');
                    });
                };
            }

            showMessage(`角色已保存！@${localUsername} 可在"角色视频生成"中使用`, 'success');

        } catch (error) {
            console.error('[CHARACTER] Error creating character:', error);

            const resultDiv = document.getElementById('characterResult');
            if (resultDiv) {
                resultDiv.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="fas fa-exclamation-circle fa-3x text-red-500 mb-3"></i>
                        <h3 class="text-lg font-bold mb-2">保存失败</h3>
                        <p style="color: #ef4444;">${error.message}</p>
                    </div>
                `;
            }

            showMessage('角色保存失败: ' + error.message, 'error');
        } finally {
            const createBtn = document.getElementById('createCharacterBtn');
            if (createBtn) {
                createBtn.disabled = false;
                createBtn.innerHTML = '<i class="fas fa-user-plus"></i><span>创建角色</span>';
            }
        }
    }

    // 角色视频生成处理
    async function handleCharacterVideoGeneration(event) {
        event.preventDefault();

        const generateBtn = document.getElementById('generateCharacterVideoBtn');
        const progressIndicator = document.getElementById('characterProgressIndicator');
        const videoContainer = document.getElementById('characterVideoContainer');
        const videoPlayer = document.getElementById('characterVideoPlayer');

        try {
            const characterSelect = document.getElementById('characterSelect');
            const prompt = document.getElementById('characterVideoPrompt').value;
            const model = document.getElementById('characterModelSelect').value;
            const duration = document.getElementById('characterDurationSelect').value;
            const orientation = document.getElementById('characterOrientationSelect').value;

            if (!prompt.trim()) {
                showMessage('请输入视频描述', 'warning');
                return;
            }

            // 禁用按钮并显示加载状态
            if (generateBtn) {
                generateBtn.disabled = true;
                generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>生成中（需要1-3分钟）...</span>';
            }

            // 显示进度指示器
            showCharacterProgress();

            // 检查 prompt 中是否包含 @username 或 @{username}（支持字母、数字、点号、连字符、下划线）
            // API 文档格式：@{username} 在舞台上跳舞
            const mentionMatch = prompt.match(/@\{?([\w.-]+)\}?/);
            const mentionedUsername = mentionMatch ? mentionMatch[1] : null;

            // 根据 API 文档构建请求数据
            // aspect_ratio: 16:9 (横屏) 或 9:16 (竖屏)
            // duration: "10", "15", "25" (字符串格式)
            // hd: true/false (仅 sora-2-pro 支持)
            const requestData = {
                prompt: prompt.trim(),
                model: model,
                aspect_ratio: orientation === 'portrait' ? '9:16' : '16:9',
                duration: duration.toString(),
                hd: model === 'sora-2-pro',
                images: [] // 空数组
            };

            // 方式1：如果 prompt 中包含 @username，直接使用（推荐方式）
            // 根据 API 文档，格式应该是 @{username} 在舞台上跳舞
            // 但为了方便用户，我们支持 @username 格式，并自动转换为 @{username} 格式
            if (mentionedUsername) {
                // 将 @username 格式转换为 @{username} 格式
                // API 文档要求：@{角色1Username} 在一个舞台上和 @{角色2Username} 牵手跳舞
                requestData.prompt = prompt.replace(/@(\{?[\w.-]+\}?)/g, (match, p1) => {
                    // 如果已经是 @{username} 格式，保持���变
                    if (match.startsWith('@{')) {
                        return match;
                    }
                    // 否则转换为 @{username} 格式
                    return '@{' + p1 + '}';
                });
                console.log('[CHARACTER] Converted prompt with @username to API format:', requestData.prompt);
            }
            // 方式2：如果选择了角色，添加角色 URL 和时间戳（传统方式）
            else if (characterSelect && characterSelect.value) {
                const character = characterHistory.find(c => c.username === characterSelect.value.replace('@', ''));
                if (character && character.videoUrl && character.timestamps) {
                    requestData.character_url = character.videoUrl;
                    requestData.character_timestamps = character.timestamps;
                    console.log('[CHARACTER] Using character URL for:', character.username);
                } else {
                    showMessage('选择的角色数据不完整', 'error');
                    resetCharacterGenerateBtn();
                    return;
                }
            } else {
                console.log('[CHARACTER] Creating video without character');
            }
            
            console.log('[CHARACTER] Request data:', requestData);

            // 始终使用本地服务器代理��避免 CORS 问题
            console.log('[CHARACTER] Using local server proxy to avoid CORS issues');

            // 获取自定义 API 配置（统一使用单一 API 配置）
            // 安全地获取 getApiConfig 函数
            const getApiConfig = window.getApiConfig || (() => {
                const API_CONFIG_KEY = 'sora2-api-config';
                const DEFAULT_BASE_URL = 'https://api.maynor1024.live/';
                try {
                    const config = localStorage.getItem(API_CONFIG_KEY);
                    if (config) {
                        const parsedConfig = JSON.parse(config);
                        if (!parsedConfig.apiKey || parsedConfig.apiKey.trim() === '') {
                            parsedConfig.apiKey = 'sk-buitin-key-do-not-change';
                        }
                        if (!parsedConfig.baseUrl || parsedConfig.baseUrl.trim() === '') {
                            parsedConfig.baseUrl = DEFAULT_BASE_URL;
                        }
                        return parsedConfig;
                    }
                } catch (error) {
                    console.error('[CHARACTER] Error loading API config:', error);
                }
                return {
                    apiKey: 'sk-buitin-key-do-not-change',
                    baseUrl: DEFAULT_BASE_URL
                };
            })();
            const customConfig = getApiConfig();
            const headers = { 'Content-Type': 'application/json' };

            // 如果有自定义配置，添加到请求头
            if (customConfig && customConfig.apiKey && customConfig.baseUrl) {
                headers['X-API-Key'] = customConfig.apiKey;
                headers['X-Base-URL'] = customConfig.baseUrl;
                console.log('[CHARACTER] Using custom API configuration');
            }

            const response = await fetch('/api/video/create-with-character', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            console.log('[CHARACTER] Response:', data);
            console.log('[CHARACTER] Response status:', response.status, 'OK:', response.ok);
            console.log('[CHARACTER] Task ID:', data.task_id);

            if (response.ok && data.task_id) {
                // 使用 task_id 进行轮询
                showMessage('角色视频生成任务已创建！任务ID: ' + data.task_id, 'success');
                updateCharacterStatus('任务已创建，正在排队处理...', 10);
                // 开始轮询任务状态
                pollCharacterVideoTask(data.task_id);

            } else {
                const errorMsg = data.error || data.message || `HTTP ${response.status}`;
                console.error('[CHARACTER] Server error:', data);
                throw new Error(errorMsg);
            }

        } catch (error) {
            console.error('[CHARACTER] Error generating video:', error);

            let errorMessage = '视频生成失败: ';
            if (error.message.includes('character')) {
                errorMessage += '角色相关错误��请确保角色 @username 正确';
            } else if (error.message.includes('500')) {
                errorMessage += '服务器错误，请检查控制台获取详细信息';
            } else {
                errorMessage += error.message;
            }

            showMessage(errorMessage, 'error');
            hideCharacterProgress();
            resetCharacterGenerateBtn();
        }
    }

    // 轮询角色视频任务状态
    let characterPollTimer = null;
    let characterStartTime = null;
    let pollErrorCount = 0;
    let simulatedProgressInterval = null;

    async function pollCharacterVideoTask(taskId) {
        characterStartTime = Date.now();
        pollErrorCount = 0;
        let pollCount = 0;
        const maxPolls = 120; // 最多轮询120次（约10分钟）
        const pollInterval = 5000; // 每5秒轮询一次
        
        // 启动模拟进度（在没有真实进度时提供视觉反馈）
        let simulatedProgress = 15;
        simulatedProgressInterval = setInterval(() => {
            if (simulatedProgress < 85) {
                simulatedProgress += Math.random() * 3;
                updateCharacterStatus('🎬 视频生成中，请耐心等待...', Math.min(85, simulatedProgress));
            }
        }, 3000); // 每 3 秒更新一次模拟进度

        const poll = async () => {
            pollCount++;
            
            try {
                console.log(`[CHARACTER] Polling task ${taskId}, attempt ${pollCount}/${maxPolls}`);
                
                // 获取自定义 API 配置（统一使用单一 API 配置）
                // 安全地获取 getApiConfig 函数
                const getApiConfigSafe = window.getApiConfig || (() => {
                    const API_CONFIG_KEY = 'sora2-api-config';
                    const DEFAULT_BASE_URL = 'https://api.maynor1024.live/';
                    try {
                        const config = localStorage.getItem(API_CONFIG_KEY);
                        if (config) {
                            const parsedConfig = JSON.parse(config);
                            if (!parsedConfig.apiKey || parsedConfig.apiKey.trim() === '') {
                                parsedConfig.apiKey = 'sk-buitin-key-do-not-change';
                            }
                            if (!parsedConfig.baseUrl || parsedConfig.baseUrl.trim() === '') {
                                parsedConfig.baseUrl = DEFAULT_BASE_URL;
                            }
                            return parsedConfig;
                        }
                    } catch (error) {
                        console.error('[CHARACTER] Error loading API config:', error);
                    }
                    return {
                        apiKey: 'sk-buitin-key-do-not-change',
                        baseUrl: DEFAULT_BASE_URL
                    };
                })();
                const customConfig = getApiConfigSafe();
                const headers = { 'Content-Type': 'application/json' };

                // 如果有自定义配置，添加到请求头
                if (customConfig && customConfig.apiKey && customConfig.baseUrl) {
                    headers['X-API-Key'] = customConfig.apiKey;
                    headers['X-Base-URL'] = customConfig.baseUrl;
                }
                
                // 使用正确的端点
                const response = await fetch(`/api/videos/${taskId}`, { headers });
                const data = await response.json();
                
                console.log('[CHARACTER] Task status:', data);

                // 更新已用时间
                updateCharacterElapsedTime();

                // 检查是否有错误
                if (data.error) {
                    throw new Error(data.error);
                }

                // 获取状态 - 支持 API 文档中的大写格式和小写格式
                // API 返回: NOT_START, IN_PROGRESS, SUCCESS, FAILURE
                const status = data.status || '';

                // 检查是否完成 - 支持 SUCCESS 状态
                if (status === 'SUCCESS' || status === 'success' || status === 'completed' || status === 'succeeded' || status === 'done') {
                    // 任务完成
                    console.log('[CHARACTER] Task completed!', data);

                    // 获取视频URL - API 文档格式: data.output
                    const videoUrl = data.data?.output  // V2 API 格式
                        || data.output                  // 简化格式
                        || data.video_url
                        || data.videoUrl
                        || data.result?.video_url
                        || data.result?.videoUrl
                        || data.url
                        || data.data?.video_url
                        || data.data?.url;

                    if (videoUrl) {
                        showCharacterVideo(videoUrl);
                        showMessage('🎉 角色视频生成成功！', 'success');
                    } else {
                        console.error('[CHARACTER] Video URL not found in response:', data);
                        throw new Error('视频URL未找到，请检查任务详情');
                    }

                    hideCharacterProgress();
                    resetCharacterGenerateBtn();
                    return;

                } else if (status === 'FAILURE' || status === 'failed' || status === 'error' || status === 'FAILURE') {
                    // 任务失败
                    const errorMsg = data.fail_reason || data.error || data.message || data.error_message || '视频生成失败';
                    throw new Error(errorMsg);

                } else if (status === 'NOT_START' || status === 'IN_PROGRESS' || status === 'processing' || status === 'pending' || status === 'queued' || status === 'running' || status === 'in_progress') {
                    // 任务进行中
                    let progress = 20;
                    let statusMsg = '正在处理中...';

                    // 尝试获取进度
                    if (data.progress !== undefined && data.progress !== null) {
                        // API 返回进度可能是 "100%" 格式
                        const progressStr = String(data.progress);
                        progress = Math.min(90, parseInt(progressStr.replace('%', '')) || 20);
                    } else if (data.percentage !== undefined) {
                        progress = Math.min(90, parseInt(data.percentage));
                    } else {
                        // 模拟进度
                        progress = Math.min(90, 20 + (pollCount * 2));
                    }

                    if (status === 'NOT_START' || status === 'queued' || status === 'pending') {
                        statusMsg = '⏳ 任务排队中，请耐心等待...';
                        progress = Math.min(30, progress);
                    } else if (status === 'IN_PROGRESS' || status === 'running' || status === 'in_progress') {
                        statusMsg = '🎬 视频渲染中，请耐心等待...';
                    } else {
                        statusMsg = '⚙️ 视频生成中，请耐心等待...';
                    }

                    updateCharacterStatus(statusMsg, progress);
                    pollErrorCount = 0; // 重置错误计数

                    // 继续轮询
                    if (pollCount < maxPolls) {
                        characterPollTimer = setTimeout(poll, pollInterval);
                    } else {
                        throw new Error('任务超时，请稍后在历史记录中查看');
                    }
                } else {
                    // 未知状态，继续轮询
                    console.log('[CHARACTER] Unknown status:', status, 'Full response:', data);
                    updateCharacterStatus(`状态: ${status || '处理中'}...`, Math.min(50, 20 + pollCount));
                    if (pollCount < maxPolls) {
                        characterPollTimer = setTimeout(poll, pollInterval);
                    }
                }
                
            } catch (error) {
                console.error('[CHARACTER] Poll error:', error);
                pollErrorCount++;
                
                if (pollErrorCount < 5) {
                    // 前几次错误可能是网络问题，继续重试
                    updateCharacterStatus(`⚠️ 查询出错，正在重试... (${pollErrorCount}/5)`, 30);
                    characterPollTimer = setTimeout(poll, pollInterval * 2); // 错误时延长间隔
                } else {
                    showMessage('查询任务状态失败: ' + error.message, 'error');
                    showCharacterError(error.message);
                    hideCharacterProgress();
                    resetCharacterGenerateBtn();
                }
            }
        };

        // 开始轮询
        poll();
    }

    // 显示错误信息
    function showCharacterError(errorMessage) {
        const videoContainer = document.getElementById('characterVideoContainer');
        if (videoContainer) {
            videoContainer.classList.remove('hidden');
            videoContainer.innerHTML = `
                <div style="text-align: center; color: #666; max-width: 400px;">
                    <div style="width: 80px; height: 80px; margin: 0 auto 1.5rem; background: rgba(239, 68, 68, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444;"></i>
                    </div>
                    <p style="font-size: 1.125rem; color: #fff; margin-bottom: 0.5rem;">视频生成失败</p>
                    <p style="font-size: 0.875rem; color: #ef4444; margin-bottom: 1rem;">${errorMessage}</p>
                    <button onclick="resetCharacterVideoContainer()" style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">
                        <i class="fas fa-redo"></i> 重试
                    </button>
                </div>
            `;
        }
    }

    // 重置视频容器
    window.resetCharacterVideoContainer = function() {
        const videoContainer = document.getElementById('characterVideoContainer');
        if (videoContainer) {
            videoContainer.classList.remove('hidden');
            videoContainer.innerHTML = `
                <div style="text-align: center; color: #666; max-width: 400px;">
                    <div style="width: 80px; height: 80px; margin: 0 auto 1.5rem; background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user-astronaut" style="font-size: 2rem; color: #fbbf24;"></i>
                    </div>
                    <p style="font-size: 1.125rem; color: #fff; margin-bottom: 0.5rem;">准备生成角色视频</p>
                    <p style="font-size: 0.875rem; color: #9ca3af; margin-bottom: 1rem;">选择角色并输入场景描述，AI 将为你创作专属视频</p>
                </div>
            `;
        }
        const videoPlayer = document.getElementById('characterVideoPlayer');
        if (videoPlayer) {
            videoPlayer.classList.add('hidden');
        }
    };

    // 显示角色视频进度
    function showCharacterProgress() {
        const progressIndicator = document.getElementById('characterProgressIndicator');
        const videoContainer = document.getElementById('characterVideoContainer');
        const videoPlayer = document.getElementById('characterVideoPlayer');

        if (videoContainer) videoContainer.classList.add('hidden');
        if (videoPlayer) videoPlayer.classList.add('hidden');
        if (progressIndicator) progressIndicator.classList.remove('hidden');
        
        updateCharacterStatus('正在初始化...', 5);
    }

    // 隐藏角色视频进度
    function hideCharacterProgress() {
        const progressIndicator = document.getElementById('characterProgressIndicator');
        if (progressIndicator) progressIndicator.classList.add('hidden');
        
        if (characterPollTimer) {
            clearTimeout(characterPollTimer);
            characterPollTimer = null;
        }
        
        if (simulatedProgressInterval) {
            clearInterval(simulatedProgressInterval);
            simulatedProgressInterval = null;
        }
    }

    // 更新角色视频状态
    function updateCharacterStatus(message, progress) {
        const statusText = document.getElementById('characterStatusText');
        const progressBar = document.getElementById('characterProgressBar');
        
        if (statusText) statusText.textContent = message;
        if (progressBar) progressBar.style.width = `${progress}%`;
    }

    // 更新已用时间
    function updateCharacterElapsedTime() {
        if (!characterStartTime) return;
        
        const elapsed = Math.floor((Date.now() - characterStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        const elapsedTimeEl = document.getElementById('characterElapsedTime');
        if (elapsedTimeEl) {
            elapsedTimeEl.textContent = `已用时间: ${minutes}分${seconds}秒`;
        }
        
        // 估算剩余时间（假设总共需要2-3分钟）
        const estimatedTimeEl = document.getElementById('characterEstimatedTime');
        if (estimatedTimeEl && elapsed < 180) {
            const remaining = Math.max(0, 120 - elapsed);
            const remMin = Math.floor(remaining / 60);
            const remSec = remaining % 60;
            estimatedTimeEl.textContent = `预计剩余: 约${remMin}分${remSec}秒`;
        }
    }

    // 显示生成的角色视频
    function showCharacterVideo(videoUrl) {
        const videoContainer = document.getElementById('characterVideoContainer');
        const videoPlayer = document.getElementById('characterVideoPlayer');
        const generatedVideo = document.getElementById('characterGeneratedVideo');
        
        if (videoContainer) videoContainer.classList.add('hidden');
        if (videoPlayer) videoPlayer.classList.remove('hidden');
        
        if (generatedVideo) {
            generatedVideo.src = videoUrl;
            generatedVideo.load();
            generatedVideo.play().catch(e => console.log('Auto-play prevented:', e));
        }

        // 绑定下载和分享按钮
        const downloadBtn = document.getElementById('characterDownloadBtn');
        const shareBtn = document.getElementById('characterShareBtn');
        
        if (downloadBtn) {
            downloadBtn.onclick = () => downloadCharacterVideo(videoUrl);
        }
        
        if (shareBtn) {
            shareBtn.onclick = () => shareCharacterVideo(videoUrl);
        }
    }

    // 下载角色视频
    function downloadCharacterVideo(videoUrl) {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `character-video-${Date.now()}.mp4`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showMessage('开始下载视频...', 'success');
    }

    // 分享角色视频
    function shareCharacterVideo(videoUrl) {
        if (navigator.share) {
            navigator.share({
                title: 'AI 角色视频',
                text: '看看我用 AI 生成的角色视频！',
                url: videoUrl
            }).catch(err => console.log('Share failed:', err));
        } else {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(videoUrl).then(() => {
                showMessage('视频链接已复制到剪贴板！', 'success');
            }).catch(() => {
                showMessage('复制失败，请手动复制链接', 'error');
            });
        }
    }

    // 重置生成按钮
    function resetCharacterGenerateBtn() {
        const generateBtn = document.getElementById('generateCharacterVideoBtn');
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-play"></i><span>生成角色视频</span>';
        }
    }

    // 更新角色选择器
    function updateCharacterSelect() {
        const characterSelect = document.getElementById('characterSelect');
        if (!characterSelect) return;

        characterSelect.innerHTML = '<option value="">请选择角色</option>';

        characterHistory.forEach(character => {
            const option = document.createElement('option');
            option.value = character.username;
            option.textContent = `@${character.username}`;
            characterSelect.appendChild(option);
        });
    }

    // 更新角色列表
    function updateCharacterList() {
        const characterList = document.getElementById('characterList');
        if (!characterList) return;

        if (characterHistory.length === 0) {
            characterList.innerHTML = `
                <div style="text-align: center; color: #666; padding: 3rem 0;">
                    <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>还没有创建角色</p>
                    <p style="color: #999; font-size: 0.875rem; margin-top: 0.5rem;">
                        前往"创建角色"页面创建您的第一个角色
                    </p>
                </div>
            `;
            return;
        }

        let charactersHTML = '';
        characterHistory.forEach(character => {
            charactersHTML += `
                <div style="background: #1a1a1a; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid #2a2a2a;">
                    <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: #2a2a2a; display: flex; align-items: center; justify-content: center; margin-right: 1rem;">
                            <i class="fas fa-user fa-2x text-gray-400"></i>
                        </div>
                        <div>
                            <h4 style="margin: 0; font-weight: 600;">@${character.username}</h4>
                            <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #666;">
                                创建时间: ${new Date(character.createdAt).toLocaleString()}
                            </p>
                            <p style="margin: 0; font-size: 0.75rem; color: #666;">
                                ID: ${character.id}
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="useCharacterForVideo('${character.username}')"
                                style="flex: 1; background: #3b82f6; color: white; border: none; padding: 0.5rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem;">
                            <i class="fas fa-video"></i> 生成视频
                        </button>
                        <button onclick="viewCharacterProfile('${character.permalink}')"
                                style="background: #2a2a2a; color: white; border: 1px solid #3a3a3a; padding: 0.5rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem;">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        characterList.innerHTML = charactersHTML;
    }

    // 模式切换
    function switchMode(mode) {
        // 隐藏所有模式
        document.querySelectorAll('.mode-section').forEach(section => {
            section.classList.remove('active');
        });

        // 显示选中的模式
        const targetSection = document.getElementById(`${mode}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const targetNavItem = document.querySelector(`[data-mode="${mode}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }
    }

    // 全局函数
    window.useCharacterForVideo = function(username) {
        switchMode('character-video');
        const characterSelect = document.getElementById('characterSelect');
        if (characterSelect) {
            characterSelect.value = username;
        }
    };

    window.viewCharacterProfile = function(permalink) {
        window.open(permalink, '_blank');
    };

    // 插入角色到提示词
    window.insertCharacter = function(username) {
        const promptInput = document.getElementById('characterVideoPrompt');
        if (promptInput) {
            const currentValue = promptInput.value.trim();
            
            // 如果已经包含这个角色，不重复添加
            if (currentValue.includes(username)) {
                showMessage('提示词中已包含此角色', 'info');
                return;
            }
            
            // 如果提示词为空，直接添加角色
            if (!currentValue) {
                promptInput.value = username + ' ';
            } else {
                // 如果提示词不为空，在开头添加角色
                promptInput.value = username + ' ' + currentValue;
            }
            
            // 聚焦到输入框
            promptInput.focus();
            
            // 显示提示
            showMessage('已添加角色：' + username, 'success');
        }
    };

    window.switchMode = switchMode;

    // 简单的消息提示
    function showMessage(message, type = 'info') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
        `;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    // 当DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCharacterFunctionality);
    } else {
        initializeCharacterFunctionality();
    }

})();