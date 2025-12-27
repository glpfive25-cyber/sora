// 故事板功能模块
(function() {
    'use strict';

    // 故事板数据存储
    let storyboardScenes = [];
    let storyboardVideos = [];
    let storyboardPollTimer = null;

    // 初始化故事板功能
    function initializeStoryboardFunctionality() {
        console.log('[STORYBOARD] Initializing storyboard functionality...');

        // 绑定事件监听器
        setupStoryboardEventListeners();

        // 加载保存的故事板数据
        loadStoryboardData();

        console.log('[STORYBOARD] Storyboard functionality initialized');
    }

    // 设置事件监听器
    function setupStoryboardEventListeners() {
        const addSceneBtn = document.getElementById('addSceneBtn');
        const generateStoryboardBtn = document.getElementById('generateStoryboardBtn');

        if (addSceneBtn) {
            addSceneBtn.addEventListener('click', addScene);
        }

        if (generateStoryboardBtn) {
            generateStoryboardBtn.addEventListener('click', generateStoryboard);
        }

        // 模式切换事件
        document.querySelectorAll('[data-mode]').forEach(item => {
            item.addEventListener('click', (e) => {
                const mode = e.currentTarget.getAttribute('data-mode');
                switchMode(mode);
            });
        });
    }

    // 加载故事板数据
    function loadStoryboardData() {
        const saved = localStorage.getItem('sora2-storyboard-scenes');
        if (saved) {
            try {
                storyboardScenes = JSON.parse(saved);
                renderScenes();
            } catch (e) {
                console.error('[STORYBOARD] Failed to load saved scenes:', e);
                storyboardScenes = [];
            }
        }
    }

    // 保存故事板数据
    function saveStoryboardData() {
        localStorage.setItem('sora2-storyboard-scenes', JSON.stringify(storyboardScenes));
    }

    // 添加场景
    function addScene() {
        const sceneNumber = storyboardScenes.length + 1;
        const scene = {
            id: Date.now(),
            number: sceneNumber,
            prompt: '',
            duration: '10',
            orientation: 'landscape'
        };

        storyboardScenes.push(scene);
        saveStoryboardData();
        renderScenes();
    }

    // 删除场景
    function removeScene(sceneId) {
        storyboardScenes = storyboardScenes.filter(s => s.id !== sceneId);
        // 重新编号
        storyboardScenes.forEach((s, index) => s.number = index + 1);
        saveStoryboardData();
        renderScenes();
    }

    // 更新场景
    function updateScene(sceneId, field, value) {
        const scene = storyboardScenes.find(s => s.id === sceneId);
        if (scene) {
            scene[field] = value;
            saveStoryboardData();
        }
    }

    // 渲染场景列表
    function renderScenes() {
        const scenesContainer = document.getElementById('scenesList');
        if (!scenesContainer) return;

        if (storyboardScenes.length === 0) {
            scenesContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <i class="fas fa-film" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>还没有添加场景</p>
                    <p style="color: #999; font-size: 0.875rem; margin-top: 0.5rem;">
                        点击"添加场景"按钮开始创建您的故事板
                    </p>
                </div>
            `;
            return;
        }

        let scenesHTML = '';
        storyboardScenes.forEach((scene, index) => {
            scenesHTML += `
                <div class="card" style="margin-bottom: 1rem;" data-scene-id="${scene.id}">
                    <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 1rem; font-weight: bold; color: white;">
                            ${scene.number}
                        </div>
                        <h3 style="flex: 1; margin: 0;">场景 ${scene.number}</h3>
                        <button onclick="removeScene(${scene.id})" style="background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #999; font-size: 0.875rem;">时长</label>
                            <select class="input-field" onchange="updateScene(${scene.id}, 'duration', this.value)">
                                <option value="5" ${scene.duration === '5' ? 'selected' : ''}>5 秒</option>
                                <option value="10" ${scene.duration === '10' ? 'selected' : ''}>10 秒</option>
                                <option value="15" ${scene.duration === '15' ? 'selected' : ''}>15 秒</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #999; font-size: 0.875rem;">方向</label>
                            <select class="input-field" onchange="updateScene(${scene.id}, 'orientation', this.value)">
                                <option value="landscape" ${scene.orientation === 'landscape' ? 'selected' : ''}>横屏 (16:9)</option>
                                <option value="portrait" ${scene.orientation === 'portrait' ? 'selected' : ''}>竖屏 (9:16)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #999; font-size: 0.875rem;">场景描述</label>
                        <textarea class="input-field" placeholder="描述这个场景的内容..." rows="3" onchange="updateScene(${scene.id}, 'prompt', this.value)">${scene.prompt}</textarea>
                    </div>
                </div>
            `;
        });

        scenesContainer.innerHTML = scenesHTML;
    }

    // 生成故事板
    async function generateStoryboard() {
        const modelSelect = document.getElementById('storyboardModel');
        const model = modelSelect ? modelSelect.value : 'sora-2';

        // 验证场景
        const validScenes = storyboardScenes.filter(s => s.prompt && s.prompt.trim());
        if (validScenes.length === 0) {
            showMessage('请至少添加一个场景描述', 'warning');
            return;
        }

        // 禁用按钮
        const generateBtn = document.getElementById('generateStoryboardBtn');
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>生成中...</span>';
        }

        // 显示进度
        showStoryboardProgress();

        try {
            storyboardVideos = [];
            let completedCount = 0;
            const totalCount = validScenes.length;

            // 依次生成每个场景的视频
            for (let i = 0; i < validScenes.length; i++) {
                const scene = validScenes[i];
                updateStoryboardStatus(`正在生成场景 ${scene.number}/${totalCount}...`, Math.round((completedCount / totalCount) * 100));

                const requestData = {
                    prompt: scene.prompt.trim(),
                    model: model,
                    aspect_ratio: scene.orientation === 'portrait' ? '9:16' : '16:9',
                    duration: scene.duration,
                    hd: model === 'sora-2-pro',
                    images: []
                };

                // 获取自定义 API 配置
                const customConfig = getApiConfig ? getApiConfig() : null;
                const headers = { 'Content-Type': 'application/json' };

                if (customConfig && customConfig.apiKey && customConfig.baseUrl) {
                    headers['X-API-Key'] = customConfig.apiKey;
                    headers['X-Base-URL'] = customConfig.baseUrl;
                }

                // 提交视频生成任务
                const response = await fetch('/api/video/generate', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(requestData)
                });

                const data = await response.json();

                if (response.ok && data.task_id) {
                    // 轮询任务状态
                    const videoUrl = await pollStoryboardVideoTask(data.task_id, scene.number);
                    if (videoUrl) {
                        storyboardVideos.push({
                            sceneNumber: scene.number,
                            prompt: scene.prompt,
                            url: videoUrl
                        });
                        completedCount++;
                    }
                } else {
                    console.error(`[STORYBOARD] Scene ${scene.number} failed:`, data);
                }
            }

            // 显示结果
            if (storyboardVideos.length > 0) {
                showStoryboardResults();
                showMessage(`故事板生成完成！共 ${storyboardVideos.length} 个场景`, 'success');
            } else {
                showMessage('故事板生成失败，请重试', 'error');
                hideStoryboardProgress();
            }

        } catch (error) {
            console.error('[STORYBOARD] Error:', error);
            showMessage('故事板生成失败: ' + error.message, 'error');
            hideStoryboardProgress();
        } finally {
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-film"></i><span>生成故事板</span>';
            }
        }
    }

    // 轮询单个视频任务状态
    async function pollStoryboardVideoTask(taskId, sceneNumber) {
        const maxPolls = 120;
        let pollCount = 0;
        const pollInterval = 5000;

        while (pollCount < maxPolls) {
            try {
                const customConfig = getApiConfig ? getApiConfig() : null;
                const headers = { 'Content-Type': 'application/json' };

                if (customConfig && customConfig.apiKey && customConfig.baseUrl) {
                    headers['X-API-Key'] = customConfig.apiKey;
                    headers['X-Base-URL'] = customConfig.baseUrl;
                }

                const response = await fetch(`/api/video-task/${taskId}`, { headers });

                if (!response.ok) {
                    throw new Error(`Task status query failed: ${response.status}`);
                }

                const taskData = await response.json();
                const status = taskData.status;

                console.log(`[STORYBOARD] Scene ${sceneNumber} poll ${pollCount + 1}:`, status);

                if (status === 'SUCCESS') {
                    const videoUrl = taskData.data?.output;
                    if (videoUrl) {
                        return videoUrl;
                    }
                } else if (status === 'FAILURE') {
                    console.error(`[STORYBOARD] Scene ${sceneNumber} failed:`, taskData.fail_reason);
                    return null;
                }

                pollCount++;
                await new Promise(resolve => setTimeout(resolve, pollInterval));

            } catch (error) {
                console.error(`[STORYBOARD] Scene ${sceneNumber} poll error:`, error);
                pollCount++;
                await new Promise(resolve => setTimeout(resolve, pollInterval));
            }
        }

        console.error(`[STORYBOARD] Scene ${sceneNumber} timeout`);
        return null;
    }

    // 显示故事板进度
    function showStoryboardProgress() {
        const progressDiv = document.getElementById('storyboardProgress');
        const resultsDiv = document.getElementById('storyboardResults');

        if (progressDiv) progressDiv.classList.remove('hidden');
        if (resultsDiv) resultsDiv.classList.add('hidden');

        updateStoryboardStatus('正在初始化...', 0);
    }

    // 隐藏故事板进度
    function hideStoryboardProgress() {
        const progressDiv = document.getElementById('storyboardProgress');
        if (progressDiv) progressDiv.classList.add('hidden');

        if (storyboardPollTimer) {
            clearTimeout(storyboardPollTimer);
            storyboardPollTimer = null;
        }
    }

    // 更新故事板状态
    function updateStoryboardStatus(message, progress) {
        const statusText = document.getElementById('storyboardStatusText');
        const progressBar = document.getElementById('storyboardProgressBar');

        if (statusText) statusText.textContent = message;
        if (progressBar) progressBar.style.width = `${progress}%`;
    }

    // 显示故事板结果
    function showStoryboardResults() {
        const resultsDiv = document.getElementById('storyboardResults');
        const videoList = document.getElementById('storyboardVideoList');

        hideStoryboardProgress();

        if (resultsDiv) resultsDiv.classList.remove('hidden');
        if (videoList) {
            let videosHTML = '';
            storyboardVideos.forEach(video => {
                videosHTML += `
                    <div class="card">
                        <div style="position: relative; padding-top: 56.25%; background: #000; border-radius: 0.5rem; overflow: hidden; margin-bottom: 0.5rem;">
                            <video src="${video.url}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" controls></video>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.875rem; color: #999;">场景 ${video.sceneNumber}</span>
                            <button onclick="downloadStoryboardVideo('${video.url}', ${video.sceneNumber})" style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem;">
                                <i class="fas fa-download"></i> 下载
                            </button>
                        </div>
                        <p style="font-size: 0.75rem; color: #666; margin-top: 0.5rem;">${video.prompt.substring(0, 50)}...</p>
                    </div>
                `;
            });
            videoList.innerHTML = videosHTML;
        }
    }

    // 下载视频
    function downloadStoryboardVideo(url, sceneNumber) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `storyboard-scene-${sceneNumber}-${Date.now()}.mp4`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showMessage('开始下载场景 ' + sceneNumber + '...', 'success');
    }

    // 模式切换
    function switchMode(mode) {
        document.querySelectorAll('.mode-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(`${mode}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const targetNavItem = document.querySelector(`[data-mode="${mode}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }
    }

    // 全局函数
    window.addScene = addScene;
    window.removeScene = removeScene;
    window.updateScene = updateScene;
    window.downloadStoryboardVideo = downloadStoryboardVideo;
    window.switchMode = switchMode;

    // 消息提示
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
        document.addEventListener('DOMContentLoaded', initializeStoryboardFunctionality);
    } else {
        initializeStoryboardFunctionality();
    }

})();
