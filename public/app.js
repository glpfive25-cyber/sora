// API Configuration Management
const API_CONFIG_KEY = 'sora2-api-config';
const DEFAULT_BASE_URL = 'https://api.maynor1024.live/';

function getApiConfig() {
    try {
        const config = localStorage.getItem(API_CONFIG_KEY);
        if (config) {
            const parsedConfig = JSON.parse(config);
            // 如果用户清空了API密钥，使用内置密钥
            if (!parsedConfig.apiKey || parsedConfig.apiKey.trim() === '') {
                parsedConfig.apiKey = 'sk-buitin-key-do-not-change';
            }
            if (!parsedConfig.baseUrl || parsedConfig.baseUrl.trim() === '') {
                parsedConfig.baseUrl = DEFAULT_BASE_URL;
            }
            // 迁移旧的 characterApiKey 配置到统一配置
            if (parsedConfig.characterApiKey && !parsedConfig.apiKey) {
                parsedConfig.apiKey = parsedConfig.characterApiKey;
            }
            if (parsedConfig.characterBaseUrl && !parsedConfig.baseUrl) {
                parsedConfig.baseUrl = parsedConfig.characterBaseUrl;
            }
            return parsedConfig;
        }
    } catch (error) {
        console.error('Error loading API config:', error);
    }
    // 内置默认API配置
    return {
        apiKey: 'sk-buitin-key-do-not-change',
        baseUrl: DEFAULT_BASE_URL
    };
}

function saveApiConfig(apiKey, baseUrl) {
    try {
        const config = {
            apiKey: apiKey || '',
            baseUrl: baseUrl || ''
        };
        localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
        console.log('API config saved:', {
            hasKey: !!config.apiKey,
            baseUrl: config.baseUrl
        });
        return true;
    } catch (error) {
        console.error('Error saving API config:', error);
        return false;
    }
}

function resetApiConfig() {
    try {
        localStorage.removeItem(API_CONFIG_KEY);
        console.log('API config reset to default');
        return true;
    } catch (error) {
        console.error('Error resetting API config:', error);
        return false;
    }
}

// Get API base URL (use custom config or default to server)
function getApiBaseUrl() {
    const config = getApiConfig();
    // If custom base URL is set, use it directly for API calls
    if (config.baseUrl && config.baseUrl.trim()) {
        return config.baseUrl.trim();
    }
    // Otherwise use local server
    return window.location.origin;
}

// 获取带API配置的请求头
function getApiHeaders(additionalHeaders = {}) {
    const config = getApiConfig();
    const headers = {
        'Content-Type': 'application/json',
        ...additionalHeaders
    };
    
    // 如果有自定义API配置，添加到请求头
    if (config.apiKey && config.baseUrl) {
        headers['x-api-key'] = config.apiKey;
        headers['x-base-url'] = config.baseUrl;
    }
    
    return headers;
}

// Get API key if custom one is set
function getApiKey() {
    const config = getApiConfig();
    return config.apiKey || '';
}

// Application State
let currentMode = 'text-to-video'; // Current active mode
let chatHistory = [];
let videoTasks = {};
let uploadedImageData = null;
let uploadedMaskData = null;
// Load history and filter out corrupted entries
let imageHistory = [];
try {
    const storedHistory = JSON.parse(localStorage.getItem('sora2-image-history') || '[]');
    // Filter out corrupted entries
    imageHistory = storedHistory.filter(item => {
        return item && item.images && Array.isArray(item.images) && item.images.length > 0;
    });
    // Clean localStorage if we found corrupted data
    if (storedHistory.length !== imageHistory.length) {
        console.log('Cleaning corrupted history entries...');
        localStorage.setItem('sora2-image-history', JSON.stringify(imageHistory));
    }
} catch (error) {
    console.error('Error loading history:', error);
    imageHistory = [];
}

// DOM Elements - Video Mode
const videoForm = document.getElementById('videoForm');
const videoPrompt = document.getElementById('videoPrompt');
const imageVideoPrompt = document.getElementById('imageVideoPrompt');
const modelSelect = document.getElementById('modelSelect');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImage = document.getElementById('removeImage');
const videoContainer = document.getElementById('videoContainer');
const progressIndicator = document.getElementById('progressIndicator');
const progressBar = document.getElementById('progressBar');
const statusText = document.getElementById('statusText');
const videoPlayer = document.getElementById('videoPlayer');
const generatedVideo = document.getElementById('generatedVideo');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const generateImageVideoBtn = document.getElementById('generateImageVideoBtn');

// DOM Elements - Image Mode
const textToImageForm = document.getElementById('textToImageForm');
const imagePrompt = document.getElementById('imagePrompt');
const negativePrompt = document.getElementById('negativePrompt');
const imageSize = document.getElementById('imageSize');
const numImages = document.getElementById('numImages');
const imageModel = document.getElementById('imageModel');
const generateImageBtn = document.getElementById('generateImageBtn');
const imageResults = document.getElementById('imageResults');
const imageEditForm = document.getElementById('imageEditForm');
const editImageUpload = document.getElementById('editImageUpload');
const editImagePreview = document.getElementById('editImagePreview');
const editPreviewImg = document.getElementById('editPreviewImg');
const removeEditImage = document.getElementById('removeEditImage');
const editPrompt = document.getElementById('editPrompt');
const editImageBtn = document.getElementById('editImageBtn');
const editResults = document.getElementById('editResults');

// Legacy elements (may not exist in new layout)
const seed = document.getElementById('seed');
const steps = document.getElementById('steps');
const stepsValue = document.getElementById('stepsValue');
const cfgScale = document.getElementById('cfgScale');
const cfgValue = document.getElementById('cfgValue');
const advancedToggle = document.getElementById('advancedToggle');
const advancedSettings = document.getElementById('advancedSettings');
const maskUpload = document.getElementById('maskUpload');
const historyGrid = document.getElementById('historyGrid');

// Chat elements (may not exist if chat mode is not enabled)
const messagesContainer = document.getElementById('messagesContainer');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadChatHistory();
    loadHistory();
    initializeVideoMode();
    initializeSettings();
});

function setupEventListeners() {
    // Settings Events
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettings = document.getElementById('closeSettings');
    const settingsModal = document.getElementById('settingsModal');
    const saveSettings = document.getElementById('saveSettings');
    const resetSettings = document.getElementById('resetSettings');
    const toggleApiKey = document.getElementById('toggleApiKey');
    const apiKeyInput = document.getElementById('apiKeyInput');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (settingsModal) settingsModal.classList.remove('hidden');
            loadSettingsToForm();
        });
    }

    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            if (settingsModal) settingsModal.classList.add('hidden');
        });
    }

    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });
    }

    if (saveSettings) {
        saveSettings.addEventListener('click', handleSaveSettings);
    }

    if (resetSettings) {
        resetSettings.addEventListener('click', handleResetSettings);
    }

    if (toggleApiKey && apiKeyInput) {
        toggleApiKey.addEventListener('click', () => {
            const icon = toggleApiKey.querySelector('i');
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                if (icon) {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
            } else {
                apiKeyInput.type = 'password';
                if (icon) {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    }

    // Toggle Character API Key visibility
    const toggleCharacterApiKey = document.getElementById('toggleCharacterApiKey');
    const apiCharacterKeyInput = document.getElementById('apiCharacterKeyInput');
    
    if (toggleCharacterApiKey && apiCharacterKeyInput) {
        toggleCharacterApiKey.addEventListener('click', () => {
            const icon = toggleCharacterApiKey.querySelector('i');
            if (apiCharacterKeyInput.type === 'password') {
                apiCharacterKeyInput.type = 'text';
                if (icon) {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
            } else {
                apiCharacterKeyInput.type = 'password';
                if (icon) {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    }

    // Toggle Advanced Settings - 已移除，简化配置界面
    // 如用户需要高级配置，可以后续通过其他方式提供

    // Video Mode Events
    if (videoForm) videoForm.addEventListener('submit', handleVideoSubmit);
    if (resetBtn) resetBtn.addEventListener('click', resetVideoForm);
    if (imageUpload) imageUpload.addEventListener('change', handleImageUpload);
    if (removeImage) removeImage.addEventListener('click', handleRemoveImage);
    if (generateImageVideoBtn) generateImageVideoBtn.addEventListener('click', handleImageToVideo);

    // Image Mode Events
    if (textToImageForm) textToImageForm.addEventListener('submit', handleTextToImage);
    // if (advancedToggle) advancedToggle.addEventListener('click', toggleAdvancedSettings); // 已移除高级设置
    if (steps) steps.addEventListener('input', (e) => { if (stepsValue) stepsValue.textContent = e.target.value; });
    if (cfgScale) cfgScale.addEventListener('input', (e) => { if (cfgValue) cfgValue.textContent = e.target.value; });
    if (imageEditForm) imageEditForm.addEventListener('submit', handleImageEdit);
    if (editImageUpload) editImageUpload.addEventListener('change', handleEditImageUpload);
    if (removeEditImage) removeEditImage.addEventListener('click', handleRemoveEditImage);
    if (maskUpload) maskUpload.addEventListener('change', handleMaskUpload);

    // Edit type change
    document.querySelectorAll('input[name="editType"]').forEach(radio => {
        radio.addEventListener('change', handleEditTypeChange);
    });

    // Video Player Events
    if (downloadBtn) downloadBtn.addEventListener('click', downloadVideo);
    if (shareBtn) shareBtn.addEventListener('click', shareVideo);

    // Image to Video Player Events
    const imageVideoDownloadBtn = document.getElementById('imageVideoDownloadBtn');
    const imageVideoShareBtn = document.getElementById('imageVideoShareBtn');
    if (imageVideoDownloadBtn) imageVideoDownloadBtn.addEventListener('click', downloadImageVideo);
    if (imageVideoShareBtn) imageVideoShareBtn.addEventListener('click', shareImageVideo);

    // 字符计数功能
    setupCharacterCount();
}

// 设置字符计数
function setupCharacterCount() {
    const videoPromptEl = document.getElementById('videoPrompt');
    const charCountEl = document.getElementById('promptCharCount');
    
    if (videoPromptEl && charCountEl) {
        const updateCount = () => {
            const count = videoPromptEl.value.length;
            charCountEl.textContent = `${count} 字`;
            // 根据字数给出颜色提示
            if (count < 10) {
                charCountEl.style.color = '#ef4444'; // 红色 - 太短
            } else if (count < 30) {
                charCountEl.style.color = '#fbbf24'; // 黄色 - 可以更详细
            } else {
                charCountEl.style.color = '#22c55e'; // 绿色 - 很好
            }
        };
        videoPromptEl.addEventListener('input', updateCount);
        updateCount(); // 初始化
    }
}

function initializeVideoMode() {
    // Set initial state for video mode
    currentMode = 'text-to-video';
}

// Settings Functions
function initializeSettings() {
    // Load settings on page load
    const config = getApiConfig();
    updateApiStatusIndicator(config);
}

function loadSettingsToForm() {
    const config = getApiConfig();
    const apiKeyInput = document.getElementById('apiKeyInput');

    // 只处理基础API密钥配置
    if (apiKeyInput) {
        // 如果是内置密钥，显示为空
        if (config.apiKey === 'sk-buitin-key-do-not-change') {
            apiKeyInput.value = '';
        } else {
            apiKeyInput.value = config.apiKey || '';
        }
    }

    updateApiStatusIndicator(config);
}

function handleSaveSettings() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const settingsModal = document.getElementById('settingsModal');

    const apiKey = apiKeyInput.value.trim();

    // 使用内置的API地址
    const DEFAULT_BASE_URL = 'https://api.maynor1024.live/';

    // 如果用户没有输入密钥，使用内置密钥
    const finalApiKey = apiKey || 'sk-buitin-key-do-not-change';
    const finalBaseUrl = DEFAULT_BASE_URL;

    if (saveApiConfig(finalApiKey, finalBaseUrl)) {
        // Show success message
        showNotification('设置已保存', 'success');
        updateApiStatusIndicator({
            apiKey: finalApiKey,
            baseUrl: finalBaseUrl
        });

        // Close modal
        setTimeout(() => {
            settingsModal.classList.add('hidden');
        }, 500);
    } else {
        showNotification('保存失败，请重试', 'error');
    }
}

function handleResetSettings() {
    if (confirm('确定要恢复默认设置吗？这将清除您的自定义 API 配置。')) {
        if (resetApiConfig()) {
            // 清空API密钥输入框（将使用内置密钥）
            const apiKeyInput = document.getElementById('apiKeyInput');
            if (apiKeyInput) apiKeyInput.value = '';

            // 重新加载默认配置（内置配置）
            const config = getApiConfig();
            updateApiStatusIndicator(config);
            showNotification('已恢复默认设置（使用内置免费API）', 'success');
        } else {
            showNotification('重置失败，请重试', 'error');
        }
    }
}

function updateApiStatusIndicator(config) {
    const apiStatus = document.getElementById('apiStatus');

    if (!apiStatus) return;

    // 检查是否使用内置配置
    const isBuiltinConfig = config.apiKey === 'sk-buitin-key-do-not-change';
    const hasUserConfig = config.apiKey && config.apiKey.trim() && config.apiKey !== 'sk-buitin-key-do-not-change';

    if (isBuiltinConfig || hasUserConfig) {
        apiStatus.classList.remove('hidden');
        // 更新状态文本
        const statusText = apiStatus.querySelector('span');
        if (statusText) {
            if (isBuiltinConfig) {
                statusText.textContent = '使用内置免费API';
            } else if (hasUserConfig) {
                statusText.textContent = '已配置个人API';
            }
        }
    } else {
        apiStatus.classList.add('hidden');
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-[100] px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0`;

    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white'
    };

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    notification.className += ` ${colors[type] || colors.info}`;
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <i class="fas ${icons[type] || icons.info} text-xl"></i>
            <span class="font-medium">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Tab Switching
function switchVideoTab(tab) {
    currentVideoTab = tab;

    if (tab === 'text') {
        textToVideoTab.classList.add('tab-active');
        textToVideoTab.classList.remove('tab-inactive');
        imageToVideoTab.classList.add('tab-inactive');
        imageToVideoTab.classList.remove('tab-active');

        textToVideoContent.classList.remove('hidden');
        imageToVideoContent.classList.add('hidden');
    } else {
        imageToVideoTab.classList.add('tab-active');
        imageToVideoTab.classList.remove('tab-inactive');
        textToVideoTab.classList.add('tab-inactive');
        textToVideoTab.classList.remove('tab-active');

        imageToVideoContent.classList.remove('hidden');
        textToVideoContent.classList.add('hidden');
    }
}

function switchImageMode(mode) {
    currentImageTab = mode;

    if (mode === 'text') {
        textToImageTab.classList.add('tab-active');
        textToImageTab.classList.remove('tab-inactive');
        imageEditTab.classList.add('tab-inactive');
        imageEditTab.classList.remove('tab-active');

        textToImageSection.classList.remove('hidden');
        imageEditSection.classList.add('hidden');
    } else {
        imageEditTab.classList.add('tab-active');
        imageEditTab.classList.remove('tab-inactive');
        textToImageTab.classList.add('tab-inactive');
        textToImageTab.classList.remove('tab-active');

        imageEditSection.classList.remove('hidden');
        textToImageSection.classList.add('hidden');
    }
}

// Mode Toggle
function toggleMode() {
    if (currentMode === 'video') {
        currentMode = 'chat';
        if (document.querySelector('main')) document.querySelector('main').classList.add('hidden');
        if (chatMode) chatMode.classList.remove('hidden');
        if (modeToggle) modeToggle.innerHTML = '<i class="fas fa-video text-xl"></i>';
    } else {
        currentMode = 'video';
        if (document.querySelector('main')) document.querySelector('main').classList.remove('hidden');
        if (chatMode) chatMode.classList.add('hidden');
        if (modeToggle) modeToggle.innerHTML = '<i class="fas fa-comments text-xl"></i>';
    }
}

// Video Generation
async function handleVideoSubmit(e) {
    e.preventDefault();

    // Get prompt
    const prompt = videoPrompt ? videoPrompt.value.trim() : '';

    if (!prompt) {
        alert(window.i18n?.t('pleaseEnterDescription') || '请输入描述');
        return;
    }

    // Disable button and show loading
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>生成中（需要1-3分钟）...</span>`;
    }

    // Show progress indicator
    showProgressIndicator();

    try {
        // Parse model selection
        const modelValue = modelSelect ? modelSelect.value : 'sora_video2';

        // Extract model information
        let model = 'sora-2'; // 默认使用 sora-2
        let aspect_ratio = '16:9'; // 默认横屏
        let duration = '10'; // 默认 10 秒（字符串格式）
        let hd = false; // 默认非高清

        // Parse based on model type
        if (modelValue === 'sora_image') {
            // Image generation model
            model = 'sora_image';
        } else if (modelValue.startsWith('sora_video2')) {
            // 提取方向：竖屏 9:16，横屏 16:9
            if (modelValue.includes('portrait')) {
                aspect_ratio = '9:16';
            } else {
                aspect_ratio = '16:9';
            }
            
            // 提取时长并决定使用的模型
            // 10秒、15秒 → sora-2
            // 25秒 → sora-2-pro
            if (modelValue.includes('25s')) {
                duration = '25';
                model = 'sora-2-pro';
            } else if (modelValue.includes('15s')) {
                duration = '15';
                model = 'sora-2';
            } else {
                duration = '10';
                model = 'sora-2';
            }
        }

        const requestBody = {
            prompt: prompt,
            model: model,
            options: {
                aspect_ratio: aspect_ratio,
                duration: duration,
                hd: hd
            }
        };

        // 使用V2 API生成视频（返回task_id）
        const result = await attemptVideoGeneration(requestBody, prompt, model);

        if (!result) {
            throw new Error('Video generation failed after all retry attempts');
        }

        return;

    } catch (error) {
        console.error('Error:', error);
        hideProgressIndicator();

        // Provide more specific error messages
        let errorMessage = '';
        let suggestions = '';

        if (error.message.includes('写实人物') || error.message.includes('真人')) {
            errorMessage = '❌ 内容审核未通过';
            suggestions = `
                <div class="mt-3 text-left text-sm">
                    <p class="font-semibold mb-2">原因：</p>
                    <p class="mb-3">${error.message}</p>
                    <p class="font-semibold mb-2">💡 建议：</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>避免使用真人照片或写实人物图片</li>
                        <li>使用卡通、动漫风格的图片</li>
                        <li>使用风景、物品等非人物内容</li>
                        <li>修改提示词，避免涉及真人或名人</li>
                    </ul>
                </div>
            `;
        } else if (error.name === 'AbortError') {
            errorMessage = '⏱️ 请求超时（超过5分钟）';
            suggestions = '建议：选择较短的视频选项（非15秒版本）或稍后重试';
        } else if (error.message.includes('503')) {
            errorMessage = '⚠️ API 服务暂时不可用 (503)';
            suggestions = `
                <div class="mt-3 text-left text-sm">
                    <p class="font-semibold mb-2">可能的原因：</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>🔑 <strong>API Key 无效或已过期</strong></li>
                        <li>🚫 API 服务暂时维护或过载</li>
                        <li>💳 账户余额不足或配额用尽</li>
                        <li>🌐 上游服务暂时不可用</li>
                    </ul>
                    <p class="font-semibold mt-3 mb-2">💡 推荐解决方案：</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>✅ <strong>检查 API Key</strong>：确认 .env 文件中的 SORA_API_KEY 完整且有效</li>
                        <li>✅ <strong>检查账户状态</strong>：登录 API 提供商网站查看余额和配额</li>
                        <li>✅ <strong>等待重试</strong>：服务可能正在维护，等待 5-10 分钟后重试</li>
                        <li>✅ <strong>联系支持</strong>：如果问题持续，联系 API 提供商技术支持</li>
                    </ul>
                    <p class="mt-3 text-xs text-gray-500">
                        <strong>提示：</strong>503 错误通常是临时性的，表示服务暂时不可用。<br>
                        如果频繁出现此错误，请检查您的 API 配置和账户状态。
                    </p>
                </div>
            `;
        } else if (error.message.includes('504')) {
            errorMessage = '⏱️ 服务器处理超时 (504)';
            suggestions = `
                <div class="mt-3 text-left text-sm">
                    <p class="font-semibold mb-2">可能的原因：</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>15秒视频生成时间过长（通常需要3-5分钟，可能超过服务器限制）</li>
                        <li>服务器当前负载较高</li>
                        <li>API 网关超时限制（通常为1-2分钟）</li>
                    </ul>
                    <p class="font-semibold mt-3 mb-2">💡 推荐解决方案：</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>✅ <strong>首选标准模型</strong>：sora_video2（10秒，成功率最高）</li>
                        <li>✅ <strong>避免15秒版本</strong>：生成时间过长，容易超时</li>
                        <li>✅ <strong>简化提示词</strong>：使用简洁的场景描述</li>
                        <li>✅ <strong>图生视频</strong>：使用清晰简单的参考图</li>
                        <li>⏰ 等待2-3分钟后重试</li>
                    </ul>
                    <p class="mt-3 text-xs text-gray-500">
                        <strong>模型生成时间参考：</strong><br>
                        • sora_video2 / landscape / portrait: ~30-90秒 ✅ 推荐<br>
                        • *-15s 版本: ~3-5分钟 ⚠️ 容易超时
                    </p>
                </div>
            `;
        } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
            errorMessage = '🌐 网络连接错误';
            suggestions = '请检查网络连接后重试';
        } else if (error.message.includes('timeout')) {
            errorMessage = '⏱️ 连接超时';
            suggestions = '服务器响应时间过长，建议选择较短的视频选项';
        } else {
            errorMessage = '❌ 视频生成失败';
            suggestions = error.message || '请重试或联系技术支持';
        }

        showError(errorMessage, suggestions);
    } finally {
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<i class="fas fa-play"></i><span>${window.i18n?.t('generateVideo') || '生成视频'}</span>`;
        }
    }
}

// Image to Video Generation
async function handleImageToVideo(e) {
    e.preventDefault();

    const prompt = imageVideoPrompt ? imageVideoPrompt.value.trim() : '';

    if (!prompt) {
        alert('请输入视频描述！');
        return;
    }

    if (!uploadedImageData) {
        alert('请先上传图像！');
        return;
    }

    // Disable button
    if (generateImageVideoBtn) {
        generateImageVideoBtn.disabled = true;
        generateImageVideoBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>生成中（需要1-3分钟）...</span>`;
    }

    // Show progress indicator for image to video
    showImageVideoProgressIndicator();

    try {
        const requestBody = {
            prompt: prompt,
            model: 'sora-2',
            image: uploadedImageData,
            options: {
                aspect_ratio: '16:9',
                duration: '10',
                hd: false
            }
        };

        const result = await attemptVideoGeneration(requestBody, prompt, 'sora-2');

        if (!result) {
            throw new Error('Video generation failed');
        }

        console.log('[Image to Video] Generation successful:', result);
        
        // Extract video URL from result
        let videoUrl = null;
        if (result && result.choices && result.choices[0] && result.choices[0].message) {
            const content = result.choices[0].message.content;
            
            // Try to extract video URL from content
            const urlMatch = content.match(/(https?:\/\/[^\s\)\]<>"']+)/);
            if (urlMatch) {
                videoUrl = urlMatch[1].replace(/[,;!?.'")\]}>]+$/, '');
            }
        }
        
        if (videoUrl) {
            // Show video result in image to video section
            showImageVideoResult({ video_url: videoUrl, status: 'completed' });
        } else {
            throw new Error('无法从响应中提取视频URL');
        }

    } catch (error) {
        console.error('[Image to Video] Error:', error);
        hideImageVideoProgressIndicator();
        
        // 根据错误类型显示不同的提示
        let errorMessage = '视频生成失败';
        let suggestions = '';
        
        if (error.message.includes('写实人物') || error.message.includes('真人')) {
            errorMessage = '❌ 图片审核未通过';
            suggestions = `
                <div class="text-left">
                    <p class="font-semibold mb-2">原因：</p>
                    <p class="mb-3">${error.message}</p>
                    <p class="font-semibold mb-2">💡 建议：</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>使用卡通、动漫风格的图片</li>
                        <li>使用风景、物品等非人物图片</li>
                        <li>避免使用真人照片或写实人物图片</li>
                    </ul>
                </div>
            `;
        } else if (error.message.includes('503')) {
            errorMessage = '⚠️ API 服务暂时不可用';
            suggestions = '请稍后重试，或检查API配置';
        } else if (error.message.includes('timeout') || error.message.includes('超时')) {
            errorMessage = '⏱️ 请求超时';
            suggestions = '视频生成时间较长，请稍后重试';
        } else {
            errorMessage = '❌ 视频生成失败';
            suggestions = error.message || '请重试';
        }
        
        showImageVideoError(errorMessage, suggestions);
    } finally {
        if (generateImageVideoBtn) {
            generateImageVideoBtn.disabled = false;
            generateImageVideoBtn.innerHTML = `<i class="fas fa-play"></i><span>生成视频</span>`;
        }
        
        // Hide progress indicator
        hideImageVideoProgressIndicator();
    }
}

// 尝试视频生成（使用V2 API，返回task_id）
async function attemptVideoGeneration(requestBody, prompt, model, retryCount = 0) {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 3000 + (retryCount * 2000); // 渐进延迟: 3s, 5s, 7s

    try {
        // 设置超时时间（任务提交应该很快）
        const timeout = 60000; // 1分钟超时
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        console.log(`[Video] Attempt ${retryCount + 1}/${MAX_RETRIES + 1}, Timeout: ${timeout/1000}s`);

        // 显示当前尝试状态
        if (retryCount > 0) {
            updateProgressMessage(`🔄 正在重试... (尝试 ${retryCount + 1}/${MAX_RETRIES + 1})`);
        }

        const response = await fetch('/api/video/generate', {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Network error' }));
            console.log(`[Video] Error response:`, { status: response.status, errorData });

            // 如果是503（服务不可用）且还有重试次数，自动重试
            if (response.status === 503 && retryCount < MAX_RETRIES) {
                console.log(`[Video] 503 Service Unavailable, retrying in ${RETRY_DELAY}ms... (${retryCount + 1}/${MAX_RETRIES})`);
                updateProgressMessage(`⚠️ API 服务暂时不可用 (503)\n等待${Math.round(RETRY_DELAY/1000)}秒后重试...\n(尝试 ${retryCount + 1}/${MAX_RETRIES + 1})`);

                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return await attemptVideoGeneration(requestBody, prompt, model, retryCount + 1);
            }

            // 如果是504且还有重试次数，自动重试
            if (response.status === 504 && retryCount < MAX_RETRIES) {
                console.log(`[Video] 504 timeout, retrying in ${RETRY_DELAY}ms... (${retryCount + 1}/${MAX_RETRIES})`);
                updateProgressMessage(`⏱️ 服务器超时，等待${Math.round(RETRY_DELAY/1000)}秒后重试...\n(尝试 ${retryCount + 1}/${MAX_RETRIES + 1})`);

                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return await attemptVideoGeneration(requestBody, prompt, model, retryCount + 1);
            }

            throw new Error(errorData.error || errorData.message || 'Video generation failed');
        }

        // V2 API 统一返回 JSON 响应（包含 task_id）
        const data = await response.json();
        console.log('[Video] Received V2 API response:', data);

        // 检查是否返回了任务ID
        if (data.task_id) {
            console.log('[Video] Received task_id, starting polling...');
            return await pollVideoTask(data.task_id, prompt, model);
        } else {
            throw new Error('API未返回task_id');
        }

    } catch (error) {
        console.error(`[Video] Attempt ${retryCount + 1} error:`, error);

        // 如果是超时、网络错误或503错误，且还有重试次数，自动重试
        const isRetryable = (
            error.name === 'AbortError' ||
            error.statusCode === 503 ||
            error.statusCode === 504 ||
            error.message.includes('503') ||
            error.message.includes('504') ||
            error.message.includes('timeout') ||
            error.message.includes('ETIMEDOUT') ||
            error.message.includes('ECONNRESET') ||
            error.message.toLowerCase().includes('server took too long') ||
            error.message.toLowerCase().includes('service unavailable')
        );

        if (isRetryable && retryCount < MAX_RETRIES) {
            const retryDelay = 3000 + (retryCount * 2000); // 渐进延迟: 3s, 5s, 7s
            console.log(`[Video] Retryable error detected, retrying in ${retryDelay}ms... (${retryCount + 1}/${MAX_RETRIES})`);

            // 根据错误类型显示不同的提示
            let errorType = '服务错误';
            if (error.statusCode === 503 || error.message.includes('503')) {
                errorType = 'API 服务暂时不可用 (503)';
            } else if (error.statusCode === 504 || error.message.includes('504')) {
                errorType = '服务器超时 (504)';
            } else if (error.message.includes('timeout')) {
                errorType = '请求超时';
            }

            updateProgressMessage(`⚠️ ${errorType}\n\n等待 ${Math.round(retryDelay/1000)} 秒后自动重试...\n(尝试 ${retryCount + 1}/${MAX_RETRIES + 1})`);

            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return await attemptVideoGeneration(requestBody, prompt, model, retryCount + 1);
        }

        // 重试次数用尽或不可重试的错误，抛出
        if (retryCount >= MAX_RETRIES) {
            console.error(`[Video] Max retries (${MAX_RETRIES}) exceeded`);
        }
        throw error;
    }
}

// 更新进度消息
function updateProgressMessage(message) {
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.textContent = message || '正在处理...';
    }
}

// 更新进度百分比
function updateProgressPercent(percent, message = '') {
    // 更新进度条
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
        progressBar.style.transition = 'width 500ms ease-out';
    }

    // 更新百分比显示
    const progressPercent = document.getElementById('progressPercent');
    if (progressPercent) {
        progressPercent.textContent = `${percent}%`;
    }

    // 更新状态消息
    if (message) {
        updateProgressMessage(message);
    }
}

// 轮询视频任务状态（V2 API）
async function pollVideoTask(taskId, prompt, model) {
    const maxPolls = 120; // 最大轮询次数（10分钟，每5秒一次）
    let pollCount = 0;
    const pollInterval = 5000; // 5秒轮询一次

    console.log(`[Video] Starting to poll task ${taskId}, max polls: ${maxPolls}`);

    while (pollCount < maxPolls) {
        try {
            const response = await fetch(`/api/video-task/${taskId}`, {
                method: 'GET',
                headers: getApiHeaders()
            });

            if (!response.ok) {
                throw new Error(`Task status query failed: ${response.status}`);
            }

            const taskData = await response.json();
            console.log(`[Video] Poll ${pollCount + 1}/${maxPolls}:`, taskData);

            // V2 API 状态: NOT_START, IN_PROGRESS, SUCCESS, FAILURE
            const status = taskData.status;
            const progress = taskData.progress || '0%';
            
            // 更新进度消息
            if (status === 'IN_PROGRESS') {
                updateProgressMessage(`🎬 正在生成视频... ${progress} (${pollCount * 5}秒)`);
            } else if (status === 'NOT_START') {
                updateProgressMessage(`⏳ 任务排队中... (${pollCount * 5}秒)`);
            }

            // 检查任务状态
            if (status === 'SUCCESS' && taskData.data && taskData.data.output) {
                console.log('[Video] Task completed, video URL:', taskData.data.output);
                updateProgressMessage('✅ 视频生成完成！');

                // 构造兼容的响应格式
                const result = {
                    choices: [{
                        message: {
                            content: taskData.data.output
                        }
                    }]
                };

                handleVideoResponse(result, prompt, model);
                return result;
            } else if (status === 'FAILURE') {
                const errorMsg = taskData.fail_reason || '视频生成失败';
                console.error('[Video] Task failed:', errorMsg);
                throw new Error(errorMsg);
            }

            // 继续轮询
            pollCount++;
            await new Promise(resolve => setTimeout(resolve, pollInterval));

        } catch (error) {
            console.error(`[Video] Poll ${pollCount + 1} error:`, error);
            
            // 如果是网络错误，继续轮询
            if (error.message.includes('fetch') || error.message.includes('Network')) {
                pollCount++;
                updateProgressMessage(`⚠️ 网络错误，重试中... (${pollCount}/${maxPolls})`);
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                continue;
            } else {
                throw error;
            }
        }
    }

    throw new Error('视频生成超时（超过10分钟），请重试');
}

// 处理视频响应（从流式或非流式）
function handleVideoResponse(data, prompt, model) {
    // 从响应中提取视频 URL
    if (data && data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        console.log('[Video] Processing response content:', content.substring(0, 200));

        // 尝试从内容中提取视频 URL，支持多种格式
        let videoUrl = null;

        // 方法1: 匹配 Markdown 链接格式 [text](URL)
        const markdownMatch = content.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
        if (markdownMatch && markdownMatch[2]) {
            videoUrl = markdownMatch[2];
            console.log('[Video] Found URL in Markdown format:', videoUrl);
        }

        // 方法2: 匹配任何 http/https URL
        if (!videoUrl) {
            const urlMatch = content.match(/(https?:\/\/[^\s\)\]<>"']+)/);
            if (urlMatch) {
                videoUrl = urlMatch[1];
                console.log('[Video] Found URL via general pattern:', videoUrl);
            }
        }

        // 方法3: 匹配特定视频域名的URL（shareoai.com等）
        if (!videoUrl) {
            const videoHostMatch = content.match(/(https?:\/\/(?:videos\.shareoai\.com|[^\/\s]+)[^\s\)\]<>"']*)/);
            if (videoHostMatch) {
                videoUrl = videoHostMatch[1];
                console.log('[Video] Found URL via video host pattern:', videoUrl);
            }
        }

        if (videoUrl) {
            // 清理URL（移除可能的尾随符号）
            videoUrl = videoUrl.replace(/[,;!?.'")\]}>]+$/, '');
            console.log('[Video] Final cleaned video URL:', videoUrl);

            hideProgressIndicator();
            showVideoResult({ video_url: videoUrl, status: 'completed' });

            // 保存到历史记录
            try {
                const recentVideos = JSON.parse(localStorage.getItem('sora2-video-history') || '[]');
                recentVideos.unshift({
                    prompt: prompt,
                    videoUrl: videoUrl,
                    timestamp: Date.now(),
                    model: model
                });
                localStorage.setItem('sora2-video-history', JSON.stringify(recentVideos.slice(0, 10)));
            } catch (e) {
                console.warn('Failed to save video to history:', e);
            }
        } else {
            // 如果没有找到 URL，可能是生成失败或格式不同
            console.warn('[Video] No video URL found in response content:', content);
            hideProgressIndicator();

            // 检查是否有错误信息
            if (content.includes('失败') || content.includes('error') || content.includes('Error')) {
                showError('视频生成失败', content);
            } else {
                // 显示原始内容，可能包含有用信息
                const contentPreview = content.length > 500 ? content.substring(0, 500) + '...' : content;
                showError('视频生成响应异常', `未能提取视频URL:\n${contentPreview}`);
            }
        }
    } else {
        // 响应格式不正确
        console.error('[Video] Invalid response format:', data);
        hideProgressIndicator();
        showError('服务器响应格式异常', '请重试');
    }
}

// Image Generation
async function handleTextToImage(e) {
    e.preventDefault();

    const prompt = imagePrompt.value.trim();
    if (!prompt) {
        alert(window.i18n?.t('pleaseEnterDescription') || '请输入描述');
        return;
    }

    // Disable button and show loading
    generateImageBtn.disabled = true;
    generateImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>生成中（约30-60秒）...</span>';

    // Show loading state with progress indicator
    showImageLoading();

    // Add a progress message
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        generateImageBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>生成中（已等待 ${elapsed} 秒）...</span>`;
    }, 1000);

    try {
        // 构建更详细的提示词
        let fullPrompt = prompt;

        // 安全检查元素是否存在
        if (negativePrompt && negativePrompt.value && negativePrompt.value.trim()) {
            fullPrompt += `. Avoid: ${negativePrompt.value.trim()}`;
        }

        // 添加图片参数到提示词
        let sizeText = 'square'; // 默认值
        if (imageSize && imageSize.value) {
            sizeText = imageSize.value === '1024x1024' ? 'square' :
                      imageSize.value === '1024x1792' ? 'portrait' :
                      imageSize.value === '1792x1024' ? 'landscape' : 'square';
        }
        fullPrompt += `, ${sizeText} format, high quality, detailed`;

        // 使用chat API格式调用图像模型
        const selectedModel = (imageModel && imageModel.value) ? imageModel.value : 'sora_image';
        const requestBody = {
            model: selectedModel,
            messages: [
                {
                    role: 'user',
                    content: fullPrompt
                }
            ],
            stream: false
        };

        console.log('[Image Generation] Using model:', selectedModel);
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            let errorMessage = 'Image generation failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.error?.message || errorMessage;
            } catch (e) {
                // 如果返回的不是 JSON (比如 HTML 错误页面),使用状态文本
                errorMessage = `Server error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('[Image Generation] Full response:', JSON.stringify(data, null, 2));

        // 检查响应格式
        if (!data) {
            throw new Error('服务器返回空响应');
        }

        // 从chat响应中提取图片URL
        let images = [];

        // 检查是否有 choices 数组
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
            console.error('[Image Generation] Invalid response structure - no choices array');
            console.error('[Image Generation] Response keys:', Object.keys(data));
            throw new Error('API返回格式错误: 缺少 choices 数组\n\n完整响应: ' + JSON.stringify(data, null, 2));
        }

        const firstChoice = data.choices[0];
        if (!firstChoice || !firstChoice.message) {
            console.error('[Image Generation] Invalid choice structure:', firstChoice);
            throw new Error('API返回格式错误: choice 中缺少 message\n\n完整响应: ' + JSON.stringify(data, null, 2));
        }

        const content = firstChoice.message.content;
        console.log('[Image Generation] Message content:', content);

        if (!content) {
            console.error('[Image Generation] Message content is empty or null');
            console.error('[Image Generation] Full message object:', firstChoice.message);
            throw new Error('API返回的消息内容为空\n\n完整消息对象: ' + JSON.stringify(firstChoice.message, null, 2));
        }

        // 提取Markdown图片链接
        const imageRegex = /!\[.*?\]\((https?:\/\/[^\)]+)\)/g;
        let match;
        while ((match = imageRegex.exec(content)) !== null) {
            images.push(match[1]);
            console.log('[Image Generation] Found markdown image:', match[1]);
        }

        // 如果没有找到Markdown格式，尝试查找直接的URL
        if (images.length === 0) {
            const urlRegex = /https?:\/\/[^\s\)\]]+\.(png|jpg|jpeg|gif|webp|PNG|JPG|JPEG|GIF|WEBP)/gi;
            const urlMatches = content.match(urlRegex);
            if (urlMatches) {
                images = urlMatches;
                console.log('[Image Generation] Found direct URLs:', urlMatches);
            }
        }

        // 如果还是没找到,尝试查找任何URL(可能没有扩展名)
        if (images.length === 0) {
            const anyUrlRegex = /https?:\/\/[^\s\)\]<>\"\']+/gi;
            const anyUrls = content.match(anyUrlRegex);
            if (anyUrls) {
                console.log('[Image Generation] Found any URLs:', anyUrls);
                images = anyUrls;
            }
        }

        // 检查是否成功提取到图片
        if (images.length === 0) {
            console.error('No images found in response:', data);
            console.error('Response structure:', {
                hasData: !!data,
                hasChoices: !!(data && data.choices),
                choicesLength: data?.choices?.length,
                firstChoice: data?.choices?.[0],
                messageContent: data?.choices?.[0]?.message?.content
            });

            // 提供更详细的错误信息
            const contentPreview = data?.choices?.[0]?.message?.content?.substring(0, 200) || '无内容';
            throw new Error('未能从响应中提取图片URL\n\n响应预览:\n' + contentPreview);
        }

        console.log('[Image Generation] Successfully extracted images:', images);

        clearInterval(progressInterval); // 清除进度计时器
        displayGeneratedImages(images, prompt);

        // Save to history
        saveToHistory({
            type: 'text',
            prompt: prompt,
            images: images,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error:', error);
        showImageError(error.message);
        clearInterval(progressInterval); // 清除进度计时器
    } finally {
        clearInterval(progressInterval); // 清除进度计时器
        generateImageBtn.disabled = false;
        generateImageBtn.innerHTML = `<i class="fas fa-magic"></i><span>${window.i18n.t('generateImage')}</span>`;
    }
}

// Image Editing - 使用 Chat API 格式实现图生图
async function handleImageEdit(e) {
    e.preventDefault();

    const editTypeElement = document.querySelector('input[name="editType"]:checked');
    const editType = editTypeElement ? editTypeElement.value : 'style';
    const prompt = editPrompt.value.trim();

    if (!uploadedImageData) {
        alert(window.i18n?.t('pleaseUploadImage') || '请上传图片');
        return;
    }

    if (!prompt) {
        alert('请输入转换描述！');
        return;
    }

    // Disable button and show loading
    editImageBtn.disabled = true;
    editImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>处理中（约30-60秒）...</span>';

    // Show loading state
    showEditLoading();

    // 添加进度提示
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        editImageBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>处理中（已等待 ${elapsed} 秒）...</span>`;
    }, 1000);

    try {
        // 调用带重试机制的图片编辑函数
        const images = await attemptImageEdit(editType, prompt, uploadedImageData);

        clearInterval(progressInterval);
        displayEditedImages(images, prompt);

        // Save to history
        saveToHistory({
            type: 'edit',
            edit_type: editType,
            prompt: prompt,
            original_image: uploadedImageData,
            images: images,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error:', error);
        showEditError(error.message);
        clearInterval(progressInterval);
    } finally {
        clearInterval(progressInterval);
        editImageBtn.disabled = false;
        editImageBtn.innerHTML = `<i class="fas fa-edit"></i><span>${window.i18n?.t('editImageBtn') || '编辑图像'}</span>`;
    }
}

// 尝试图片编辑（带智能重试机制）
async function attemptImageEdit(editType, prompt, imageData, retryCount = 0) {
    const MAX_RETRIES = 3; // 增加到3次重试以匹配后端
    const RETRY_DELAY = 3000 + (retryCount * 2000); // 渐进延迟: 3s, 5s, 7s, 9s

    try {
        console.log(`[Image Edit] Attempt ${retryCount + 1}/${MAX_RETRIES + 1}, Edit type: ${editType}`);

        let fullPrompt = '';

        // 根据编辑类型构建不同的提示词
        if (editType === 'style') {
            fullPrompt = `Transform this image with the following style: ${prompt}. Keep the main subject and composition, but apply the style transformation.`;
        } else if (editType === 'variation') {
            fullPrompt = `Create a variation of this image. ${prompt}. Maintain similar composition and subject but with creative variations.`;
        } else if (editType === 'enhance') {
            fullPrompt = `Enhance this image. ${prompt}. Improve quality, lighting, and details while keeping the original subject.`;
        } else if (editType === 'inpaint') {
            fullPrompt = `Edit this image according to: ${prompt}. Modify only the specified areas.`;
        } else {
            fullPrompt = prompt;
        }

        // 构建 content 数组,包含文本和图片
        const content = [
            {
                type: 'text',
                text: fullPrompt
            },
            {
                type: 'image_url',
                image_url: {
                    url: imageData
                }
            }
        ];

        // 使用图像模型进行图生图
        const selectedModel = (imageModel && imageModel.value) ? imageModel.value : 'sora_image';

        const requestBody = {
            model: selectedModel,
            messages: [
                {
                    role: 'user',
                    content: content
                }
            ],
            stream: false
        };

        // 设置超时时间，逐次增加超时限制
        // 首次2分钟，第二次3分钟，第三次4分钟
        const timeout = 120000 + (retryCount * 60000);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        console.log('[Image Edit] Request:', { model: selectedModel, editType, timeout: `${timeout/1000}s`, retry: retryCount });

        // 显示当前尝试状态
        if (retryCount > 0) {
            const statusMsg = `🔄 正在重试... (尝试 ${retryCount + 1}/${MAX_RETRIES + 1}，超时限制: ${timeout/1000}秒)`;
            editResults.innerHTML = `
                <div class="flex items-center justify-center h-96">
                    <div class="text-center">
                        <div class="loading-spinner mx-auto mb-4"></div>
                        <p class="text-gray-600">${statusMsg}</p>
                    </div>
                </div>
            `;
        }
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage = 'Image transformation failed';
            let shouldRetry = false;

            try {
                const errorData = await response.json();
                console.log('[Image Edit] Error data:', errorData);

                // 处理嵌套的错误消息
                if (errorData.error) {
                    if (typeof errorData.error === 'string') {
                        errorMessage = errorData.error;
                    } else if (errorData.error.message) {
                        errorMessage = errorData.error.message;
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }

                // 检查错误消息中是否包含504相关内容
                const is504Related =
                    errorMessage.includes('504') ||
                    errorMessage.includes('timeout') ||
                    errorMessage.includes('Gateway Timeout') ||
                    errorMessage.toLowerCase().includes('timed out');

                shouldRetry = (response.status === 504 || response.status === 500) && is504Related;

            } catch (e) {
                console.error('[Image Edit] Failed to parse error:', e);
                errorMessage = `Server error: ${response.status} ${response.statusText}`;
                shouldRetry = response.status === 504 || response.status === 500;
            }

            // 如果是504相关错误且还有重试次数，自动重试
            if (shouldRetry && retryCount < MAX_RETRIES) {
                const retryDelay = RETRY_DELAY + (retryCount * 2000); // 渐进延迟
                console.log(`[Image Edit] Timeout error detected (status: ${response.status}), retrying in ${retryDelay}ms...`);

                // 更新加载状态显示重试信息
                const retryMsg = `⏱️ 服务器超时，${Math.round(retryDelay/1000)}秒后自动重试...\n(尝试 ${retryCount + 1}/${MAX_RETRIES})`;
                editResults.innerHTML = `
                    <div class="flex items-center justify-center h-96">
                        <div class="text-center">
                            <div class="loading-spinner mx-auto mb-4"></div>
                            <p class="text-gray-600 whitespace-pre-line">${retryMsg}</p>
                        </div>
                    </div>
                `;

                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return await attemptImageEdit(editType, prompt, imageData, retryCount + 1);
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('[Image Edit] Full response:', JSON.stringify(data, null, 2));

        // 从 chat 响应中提取图片 URL
        let images = [];
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            const content = data.choices[0].message.content;
            console.log('[Image Edit] Message content:', content);

            // 提取 Markdown 图片链接
            const imageRegex = /!\[.*?\]\((https?:\/\/[^\)]+)\)/g;
            let match;
            while ((match = imageRegex.exec(content)) !== null) {
                images.push(match[1]);
                console.log('[Image Edit] Found markdown image:', match[1]);
            }

            // 如果没有找到 Markdown 格式,尝试查找直接的 URL
            if (images.length === 0) {
                const urlRegex = /https?:\/\/[^\s\)\]]+\.(png|jpg|jpeg|gif|webp|PNG|JPG|JPEG|GIF|WEBP)/gi;
                const urlMatches = content.match(urlRegex);
                if (urlMatches) {
                    images = urlMatches;
                    console.log('[Image Edit] Found direct URLs:', urlMatches);
                }
            }

            // 如果还是没找到,尝试查找任何URL(可能没有扩展名)
            if (images.length === 0) {
                const anyUrlRegex = /https?:\/\/[^\s\)\]<>\"\']+/gi;
                const anyUrls = content.match(anyUrlRegex);
                if (anyUrls) {
                    console.log('[Image Edit] Found any URLs:', anyUrls);
                    images = anyUrls;
                }
            }
        }

        // 检查是否成功提取到图片
        if (images.length === 0) {
            console.error('[Image Edit] No images found in response:', data);

            // 提供更详细的错误信息
            const contentPreview = data?.choices?.[0]?.message?.content?.substring(0, 200) || '无内容';
            throw new Error('未能从响应中提取图片URL\n\n响应预览:\n' + contentPreview);
        }

        console.log('[Image Edit] Successfully extracted images:', images);
        return images;

    } catch (error) {
        console.error(`[Image Edit] Attempt ${retryCount + 1} error:`, error);

        // 如果是超时或网络错误，且还有重试次数，自动重试
        const isRetryable = (
            error.name === 'AbortError' ||
            error.message.includes('504') ||
            error.message.includes('timeout') ||
            error.message.includes('ETIMEDOUT') ||
            error.message.includes('ECONNRESET') ||
            error.message.toLowerCase().includes('timed out')
        );

        if (isRetryable && retryCount < MAX_RETRIES) {
            const retryDelay = 3000 + (retryCount * 2000); // 渐进延迟: 3s, 5s
            console.log(`[Image Edit] Retryable error detected, retrying in ${retryDelay}ms... (${retryCount + 1}/${MAX_RETRIES})`);

            // 更新加载状态显示重试信息
            const errorPreview = error.message.length > 50 ? error.message.slice(0, 50) + '...' : error.message;
            const retryMsg = `⚠️ ${errorPreview}\n\n等待${Math.round(retryDelay/1000)}秒后自动重试...\n(尝试 ${retryCount + 1}/${MAX_RETRIES}，下次超时限制增加到${(120000 + ((retryCount + 1) * 60000))/1000}秒)`;
            editResults.innerHTML = `
                <div class="flex items-center justify-center h-96">
                    <div class="text-center">
                        <div class="loading-spinner mx-auto mb-4"></div>
                        <p class="text-gray-600 whitespace-pre-line">${retryMsg}</p>
                    </div>
                </div>
            `;

            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return await attemptImageEdit(editType, prompt, imageData, retryCount + 1);
        }

        // 重试次数用尽或不可重试的错误，抛出
        if (retryCount >= MAX_RETRIES) {
            console.error(`[Image Edit] Max retries (${MAX_RETRIES}) exceeded`);
        }
        throw error;
    }
}

// Poll Video Task Status - 已废弃
// Chat API 直接返回结果，不需要轮询


// UI Update Functions
let startTime = null;
let progressInterval = null;

function showProgressIndicator() {
    videoContainer.classList.add('hidden');
    progressIndicator.classList.remove('hidden');
    progressBar.style.width = '10%';
    statusText.textContent = window.i18n?.t('processingVideo') || '正在生成视频...';

    const progressPercent = document.getElementById('progressPercent');
    const elapsedTime = document.getElementById('elapsedTime');
    const estimatedTime = document.getElementById('estimatedTime');

    if (progressPercent) progressPercent.textContent = '处理中';
    if (elapsedTime) elapsedTime.textContent = '⏱️ 视频生成通常需要 1-3 分钟，请耐心等待';
    if (estimatedTime) estimatedTime.textContent = '💡 高清和15秒版本可能需要更长时间（3-5分钟）';

    startTime = Date.now();

    // Update elapsed time every second
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(updateElapsedTime, 1000);

    // Simulate progress animation (since we don't have real progress updates)
    let progress = 10;
    const progressAnimation = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 5;
            progressBar.style.width = `${Math.min(progress, 90)}%`;
        }
    }, 2000);

    // Store interval ID to clear it later
    progressIndicator.dataset.progressAnimation = progressAnimation;
}

// showProgressWithTaskId - 已废弃，Chat API 不使用任务 ID
function showProgressWithTaskId(taskId) {
    console.warn('[Video] showProgressWithTaskId is deprecated');
    showProgressIndicator();
}

function updateElapsedTime() {
    if (!startTime) return;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    let elapsedText = '';
    if (minutes > 0) {
        elapsedText = `已等待 ${minutes} 分 ${seconds} 秒`;
    } else {
        elapsedText = `已等待 ${seconds} 秒`;
    }

    document.getElementById('elapsedTime').textContent = elapsedText;
}

// updateProgressIndicator - 已废弃，Chat API 不提供实时进度
function updateProgressIndicator(data, attempts, maxAttempts) {
    console.warn('[Video] updateProgressIndicator is deprecated - Chat API does not provide real-time progress');
}

function hideProgressIndicator() {
    progressIndicator.classList.add('hidden');
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }

    // Clear progress animation interval
    if (progressIndicator.dataset.progressAnimation) {
        clearInterval(parseInt(progressIndicator.dataset.progressAnimation));
        delete progressIndicator.dataset.progressAnimation;
    }

    startTime = null;
}

function showVideoResult(data) {
    // Clear progress tracking
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    startTime = null;

    hideProgressIndicator();
    videoContainer.classList.add('hidden');
    videoPlayer.classList.remove('hidden');

    generatedVideo.src = data.video_url;
    generatedVideo.load();

    // Store video URL for download
    generatedVideo.dataset.videoUrl = data.video_url;
}

function showError(message, suggestions = '') {
    videoContainer.classList.remove('hidden');
    videoContainer.innerHTML = `
        <div class="text-center max-w-2xl mx-auto">
            <div class="text-6xl mb-4">❌</div>
            <h3 class="text-lg font-semibold text-red-600 mb-2">${message}</h3>
            ${suggestions ? `<div class="text-gray-700 mt-4">${suggestions}</div>` : ''}
            <button onclick="resetVideoDisplay()" class="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition shadow-lg">
                <i class="fas fa-redo mr-2"></i>重新尝试
            </button>
        </div>
    `;
}

function resetVideoDisplay() {
    videoContainer.innerHTML = `
        <div class="text-center">
            <div class="text-6xl mb-4">🎬</div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">${window.i18n.t('enterPromptToGenerate')}</h3>
            <p class="text-sm text-gray-600">${window.i18n.t('videoWillAppearHere')}</p>
            <p class="text-sm text-gray-500 mt-2">${window.i18n.t('enterDetailedDescription')}</p>
        </div>
    `;
    videoPlayer.classList.add('hidden');
    hideProgressIndicator();
}

function resetVideoForm() {
    videoPrompt.value = '';
    imageVideoPrompt.value = '';
    handleRemoveImage();
    resetVideoDisplay();
}

// Image to Video Progress and Result Functions
let imageVideoProgressInterval = null;
let imageVideoStartTime = null;

function showImageVideoProgressIndicator() {
    const imageVideoContainer = document.getElementById('imageVideoContainer');
    const imageVideoProgressIndicator = document.getElementById('imageVideoProgressIndicator');
    const imageVideoProgressBar = document.getElementById('imageVideoProgressBar');
    const imageVideoStatusText = document.getElementById('imageVideoStatusText');
    const imageVideoElapsedTime = document.getElementById('imageVideoElapsedTime');
    const imageVideoEstimatedTime = document.getElementById('imageVideoEstimatedTime');

    if (imageVideoContainer) imageVideoContainer.classList.add('hidden');
    if (imageVideoProgressIndicator) imageVideoProgressIndicator.classList.remove('hidden');
    if (imageVideoProgressBar) imageVideoProgressBar.style.width = '10%';
    if (imageVideoStatusText) imageVideoStatusText.textContent = '正在生成视频...';
    if (imageVideoElapsedTime) imageVideoElapsedTime.textContent = '⏱️ 视频生成通常需要 1-3 分钟，请耐心等待';
    if (imageVideoEstimatedTime) imageVideoEstimatedTime.textContent = '💡 图像转视频可能需要更长时间（3-5分钟）';

    imageVideoStartTime = Date.now();

    // Update elapsed time every second
    if (imageVideoProgressInterval) clearInterval(imageVideoProgressInterval);
    imageVideoProgressInterval = setInterval(updateImageVideoElapsedTime, 1000);

    // Simulate progress animation
    let progress = 10;
    const progressAnimation = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 5;
            if (imageVideoProgressBar) {
                imageVideoProgressBar.style.width = `${Math.min(progress, 90)}%`;
            }
        }
    }, 2000);

    // Store interval ID to clear it later
    if (imageVideoProgressIndicator) {
        imageVideoProgressIndicator.dataset.progressAnimation = progressAnimation;
    }
}

function updateImageVideoElapsedTime() {
    if (!imageVideoStartTime) return;

    const elapsed = Math.floor((Date.now() - imageVideoStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    let elapsedText = '';
    if (minutes > 0) {
        elapsedText = `已等待 ${minutes} 分 ${seconds} 秒`;
    } else {
        elapsedText = `已等待 ${seconds} 秒`;
    }

    const imageVideoElapsedTime = document.getElementById('imageVideoElapsedTime');
    if (imageVideoElapsedTime) {
        imageVideoElapsedTime.textContent = elapsedText;
    }
}

function hideImageVideoProgressIndicator() {
    const imageVideoProgressIndicator = document.getElementById('imageVideoProgressIndicator');
    
    if (imageVideoProgressIndicator) {
        imageVideoProgressIndicator.classList.add('hidden');
    }
    
    if (imageVideoProgressInterval) {
        clearInterval(imageVideoProgressInterval);
        imageVideoProgressInterval = null;
    }

    // Clear progress animation interval
    if (imageVideoProgressIndicator && imageVideoProgressIndicator.dataset.progressAnimation) {
        clearInterval(parseInt(imageVideoProgressIndicator.dataset.progressAnimation));
        delete imageVideoProgressIndicator.dataset.progressAnimation;
    }

    imageVideoStartTime = null;
}

function showImageVideoResult(data) {
    const imageVideoContainer = document.getElementById('imageVideoContainer');
    const imageVideoPlayer = document.getElementById('imageVideoPlayer');
    const imageGeneratedVideo = document.getElementById('imageGeneratedVideo');

    // Clear progress tracking
    if (imageVideoProgressInterval) {
        clearInterval(imageVideoProgressInterval);
        imageVideoProgressInterval = null;
    }
    imageVideoStartTime = null;

    hideImageVideoProgressIndicator();
    
    if (imageVideoContainer) imageVideoContainer.classList.add('hidden');
    if (imageVideoPlayer) imageVideoPlayer.classList.remove('hidden');

    if (imageGeneratedVideo) {
        imageGeneratedVideo.src = data.video_url;
        imageGeneratedVideo.load();
        imageGeneratedVideo.dataset.videoUrl = data.video_url;
    }
}

// 显示图生视频错误
function showImageVideoError(message, suggestions = '') {
    const imageVideoContainer = document.getElementById('imageVideoContainer');
    const imageVideoPlayer = document.getElementById('imageVideoPlayer');
    
    // Clear progress tracking
    if (imageVideoProgressInterval) {
        clearInterval(imageVideoProgressInterval);
        imageVideoProgressInterval = null;
    }
    imageVideoStartTime = null;
    
    hideImageVideoProgressIndicator();
    
    if (imageVideoPlayer) imageVideoPlayer.classList.add('hidden');
    if (imageVideoContainer) {
        imageVideoContainer.classList.remove('hidden');
        imageVideoContainer.innerHTML = `
            <div class="text-center max-w-2xl mx-auto p-8">
                <div class="text-6xl mb-4">❌</div>
                <h3 class="text-lg font-semibold text-red-600 mb-2">${message}</h3>
                ${suggestions ? `<div class="text-gray-700 mt-4 text-sm">${suggestions}</div>` : ''}
                <button onclick="resetImageVideoDisplay()" class="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition shadow-lg">
                    <i class="fas fa-redo mr-2"></i>重新尝试
                </button>
            </div>
        `;
    }
}

// 重置图生视频显示
function resetImageVideoDisplay() {
    const imageVideoContainer = document.getElementById('imageVideoContainer');
    if (imageVideoContainer) {
        imageVideoContainer.innerHTML = `
            <div class="text-center">
                <div class="text-6xl mb-4">🎬</div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">上传图片并输入提示词</h3>
                <p class="text-sm text-gray-600">生成的视频将在这里显示</p>
            </div>
        `;
    }
}

// Image Upload Handlers
async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert(window.i18n?.t('pleaseUploadImageFile') || '请上传图片文件');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert(window.i18n?.t('imageSizeLimit') || '图片大小不能超过10MB');
        return;
    }

    // 显示加载提示
    const loadingText = document.createElement('div');
    loadingText.className = 'text-sm text-gray-500 mt-2';
    loadingText.textContent = '处理图片中...';
    imageUpload.parentElement.appendChild(loadingText);

    try {
        // 压缩图片
        const compressedDataUrl = await compressImage(file, 1024, 0.8);

        uploadedImageData = compressedDataUrl;
        previewImg.src = compressedDataUrl;
        imagePreview.classList.remove('hidden');

        // 显示压缩信息
        const originalSize = (file.size / 1024).toFixed(2);
        const compressedSize = (compressedDataUrl.length * 0.75 / 1024).toFixed(2);
        console.log(`[Image Upload] Original: ${originalSize}KB, Compressed: ${compressedSize}KB`);
    } catch (error) {
        console.error('Image compression error:', error);
        alert('图片处理失败,请尝试其他图片');
    } finally {
        // 移除加载提示
        if (loadingText.parentElement) {
            loadingText.remove();
        }
    }
}

function handleRemoveImage() {
    uploadedImageData = null;
    imageUpload.value = '';
    imagePreview.classList.add('hidden');
    previewImg.src = '';
}

async function handleEditImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert(window.i18n?.t('pleaseUploadImageFile') || '请上传图片文件');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert(window.i18n?.t('imageSizeLimit') || '图片大小不能超过10MB');
        return;
    }

    // 显示加载提示
    const loadingText = document.createElement('div');
    loadingText.className = 'text-sm text-gray-500 mt-2';
    loadingText.textContent = '处理图片中...';
    editImageUpload.parentElement.appendChild(loadingText);

    try {
        // 压缩图片
        const compressedDataUrl = await compressImage(file, 1024, 0.8);

        uploadedImageData = compressedDataUrl;
        editPreviewImg.src = compressedDataUrl;
        editImagePreview.classList.remove('hidden');

        // 显示压缩信息
        const originalSize = (file.size / 1024).toFixed(2);
        const compressedSize = (compressedDataUrl.length * 0.75 / 1024).toFixed(2); // Base64 大约是原始大小的 1.33 倍
        console.log(`[Image Upload] Original: ${originalSize}KB, Compressed: ${compressedSize}KB`);
    } catch (error) {
        console.error('Image compression error:', error);
        alert('图片处理失败,请尝试其他图片');
    } finally {
        // 移除加载提示
        if (loadingText.parentElement) {
            loadingText.remove();
        }
    }
}

// 图片压缩函数
function compressImage(file, maxWidth = 1024, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 计算新尺寸
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                // 创建 canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // 转换为 Base64
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function handleRemoveEditImage() {
    uploadedImageData = null;
    editImageUpload.value = '';
    editImagePreview.classList.add('hidden');
    editPreviewImg.src = '';
}

function handleMaskUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        uploadedMaskData = event.target.result;
    };
    reader.readAsDataURL(file);
}

function handleEditTypeChange(e) {
    const editType = e.target.value;

    // Update placeholder based on edit type
    const promptInput = document.getElementById('editPrompt');
    if (editType === 'style') {
        promptInput.placeholder = '例如：油画风格、水彩画风格、梵高风格、动漫风格...';
    } else if (editType === 'variation') {
        promptInput.placeholder = '例如：不同角度、不同光线、不同构图...';
    } else if (editType === 'enhance') {
        promptInput.placeholder = '例如：提升清晰度、改善光照、增强色彩...';
    }
}

// function toggleAdvancedSettings() {
//     advancedSettings.classList.toggle('hidden');
//     advancedIcon.classList.toggle('rotate-180');
// } // 已移除高级设置功能

function showImageLoading() {
    imageResults.innerHTML = `
        <div class="flex items-center justify-center h-96">
            <div class="text-center">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p class="text-gray-600">${window.i18n.t('generatingImage')}</p>
            </div>
        </div>
    `;
}

function showEditLoading() {
    editResults.innerHTML = `
        <div class="flex items-center justify-center h-96">
            <div class="text-center">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p class="text-gray-600">${window.i18n.t('editingImage')}</p>
            </div>
        </div>
    `;
}

function showImageError(message) {
    imageResults.innerHTML = `
        <div class="text-center py-12">
            <div class="text-6xl mb-4">❌</div>
            <h3 class="text-lg font-semibold text-red-600 mb-2">${window.i18n.t('imageGenerationFailed')}</h3>
            <p class="text-sm text-gray-600">${message}</p>
            <button onclick="resetImageResults()" class="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                Try Again
            </button>
        </div>
    `;
}

function showEditError(message) {
    editResults.innerHTML = `
        <div class="text-center py-12">
            <div class="text-6xl mb-4">❌</div>
            <h3 class="text-lg font-semibold text-red-600 mb-2">${window.i18n.t('imageEditFailed')}</h3>
            <p class="text-sm text-gray-600">${message}</p>
            <button onclick="resetEditResults()" class="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                Try Again
            </button>
        </div>
    `;
}

function displayGeneratedImages(images, prompt) {
    // 安全检查：确保images是数组
    if (!images || !Array.isArray(images)) {
        console.error('Invalid images data:', images);
        showImageError('Invalid response from server');
        return;
    }

    if (images.length === 0) {
        showImageError('No images generated');
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'image-grid gap-4';

    images.forEach((imageData, index) => {
        const card = createImageCard(imageData, prompt, `gen-${Date.now()}-${index}`);
        grid.appendChild(card);
    });

    imageResults.innerHTML = '';
    imageResults.appendChild(grid);
}

function displayEditedImages(images, prompt) {
    // 安全检查：确保images是数组
    if (!images || !Array.isArray(images)) {
        console.error('Invalid images data:', images);
        showEditError('Invalid response from server');
        return;
    }

    if (images.length === 0) {
        showEditError('No images edited');
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'image-grid gap-4';

    images.forEach((imageData, index) => {
        const card = createImageCard(imageData, prompt, `edit-${Date.now()}-${index}`);
        grid.appendChild(card);
    });

    editResults.innerHTML = '';
    editResults.appendChild(grid);
}

function createImageCard(imageData, prompt, id) {
    const card = document.createElement('div');
    card.className = 'image-card fade-in';
    card.innerHTML = `
        <img src="${imageData}" alt="Generated image" class="w-full h-full object-cover rounded-lg">
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
            <p class="text-white text-xs truncate">${prompt}</p>
            <div class="flex space-x-2 mt-2">
                <button onclick="downloadImage('${imageData}', '${id}')" class="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs transition">
                    <i class="fas fa-download"></i>
                </button>
                <button onclick="copyImage('${imageData}')" class="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs transition">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        </div>
    `;
    return card;
}

function resetImageResults() {
    imageResults.innerHTML = `
        <div class="text-center py-12 text-gray-400">
            <i class="fas fa-image text-6xl mb-4"></i>
            <h3 class="text-lg font-semibold mb-2">${window.i18n.t('noImagesYet')}</h3>
            <p class="text-sm">${window.i18n.t('enterPromptToGenerate')}</p>
        </div>
    `;
}

function resetEditResults() {
    editResults.innerHTML = `
        <div class="text-center py-12 text-gray-400">
            <i class="fas fa-edit text-6xl mb-4"></i>
            <h3 class="text-lg font-semibold mb-2">${window.i18n.t('noEditedImagesYet')}</h3>
            <p class="text-sm">${window.i18n.t('uploadImageToEdit')}</p>
        </div>
    `;
}

// Image Actions
function downloadImage(imageData, id) {
    const a = document.createElement('a');
    a.href = imageData;
    a.download = `generated-image-${id}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function copyImage(imageData) {
    fetch(imageData)
        .then(res => res.blob())
        .then(blob => {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(() => {
                alert('Image copied to clipboard!');
            });
        });
}

// History Management
function saveToHistory(item) {
    // Validate item structure before saving
    if (!item || !item.images || !Array.isArray(item.images) || item.images.length === 0) {
        console.error('Cannot save invalid item to history:', item);
        return;
    }

    imageHistory.unshift(item);
    // Keep only last 50 items
    if (imageHistory.length > 50) {
        imageHistory = imageHistory.slice(0, 50);
    }
    localStorage.setItem('sora2-image-history', JSON.stringify(imageHistory));
    loadHistory();
}

function loadHistory() {
    if (!historyGrid) return;

    if (imageHistory.length === 0) {
        historyGrid.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-400">
                <i class="fas fa-history text-4xl mb-2"></i>
                <p>No history yet</p>
            </div>
        `;
        return;
    }

    historyGrid.innerHTML = '';
    imageHistory.slice(0, 12).forEach(item => {
        // Skip corrupted entries - validate that images array exists and has content
        if (!item || !item.images || !Array.isArray(item.images) || item.images.length === 0) {
            console.warn('Skipping invalid history item:', item);
            return;
        }

        const card = document.createElement('div');
        card.className = 'image-card cursor-pointer hover:opacity-90 transition';

        if (item.type === 'text') {
            card.innerHTML = `
                <img src="${item.images[0]}" alt="Generated image" class="w-full h-full object-cover rounded-lg">
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                    <p class="text-white text-xs truncate">${item.prompt}</p>
                    <p class="text-white/60 text-xs">${new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
            `;
        } else {
            card.innerHTML = `
                <img src="${item.images[0]}" alt="Edited image" class="w-full h-full object-cover rounded-lg">
                <div class="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                    ${item.edit_type}
                </div>
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                    <p class="text-white text-xs truncate">${item.prompt}</p>
                    <p class="text-white/60 text-xs">${new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
            `;
        }

        card.addEventListener('click', () => {
            // Show full size image in modal
            showImageModal(item.images[0]);
        });

        historyGrid.appendChild(card);
    });
}

function showImageModal(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4';
    modal.onclick = () => modal.remove();

    modal.innerHTML = `
        <img src="${imageSrc}" alt="Full size image" class="max-w-full max-h-full rounded-lg">
        <button class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(modal);
}

// Video Actions
function downloadVideo() {
    const videoUrl = generatedVideo.dataset.videoUrl;
    if (videoUrl) {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'generated-video.mp4';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

function shareVideo() {
    const videoUrl = generatedVideo.dataset.videoUrl;
    if (videoUrl && navigator.share) {
        navigator.share({
            title: window.i18n.t('generatedAIVideo'),
            text: window.i18n.t('checkOutVideo'),
            url: videoUrl
        }).catch(err => console.log(window.i18n.t('shareFailed'), err));
    } else {
        // Copy link to clipboard
        navigator.clipboard.writeText(videoUrl).then(() => {
            alert(window.i18n.t('linkCopied'));
        });
    }
}

// Image to Video Actions
function downloadImageVideo() {
    const imageGeneratedVideo = document.getElementById('imageGeneratedVideo');
    const videoUrl = imageGeneratedVideo ? imageGeneratedVideo.dataset.videoUrl : null;
    if (videoUrl) {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'image-to-video.mp4';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

function shareImageVideo() {
    const imageGeneratedVideo = document.getElementById('imageGeneratedVideo');
    const videoUrl = imageGeneratedVideo ? imageGeneratedVideo.dataset.videoUrl : null;
    if (videoUrl && navigator.share) {
        navigator.share({
            title: '图像转视频 - AI生成',
            text: '看看我用AI把图片变成视频了！',
            url: videoUrl
        }).catch(err => console.log('分享失败', err));
    } else if (videoUrl) {
        // Copy link to clipboard
        navigator.clipboard.writeText(videoUrl).then(() => {
            alert('视频链接已复制到剪贴板');
        });
    }
}

// Chat Mode Functions
async function handleChatSubmit(e) {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    setInputState(false);
    addMessage('user', message);
    chatHistory.push({ role: 'user', content: message });
    userInput.value = '';

    const messageId = 'msg-' + Date.now();
    const placeholderDiv = createAssistantMessagePlaceholder(messageId);

    try {
        const response = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify({
                messages: chatHistory,
                options: {
                    temperature: parseFloat(temperatureSlider.value),
                    stream: true
                }
            })
        });

        if (!response.ok) {
            throw new Error('API request failed: ' + response.statusText);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullMessage = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.trim()) continue;

                let jsonStr = line;
                if (line.startsWith('data: ')) {
                    jsonStr = line.slice(6).trim();
                    if (jsonStr === '[DONE]') continue;
                }

                if (!jsonStr.startsWith('{')) continue;

                try {
                    const parsed = JSON.parse(jsonStr);
                    const content = parsed.choices?.[0]?.delta?.content;

                    if (content) {
                        fullMessage += content;
                        updateStreamingMessage(messageId, fullMessage);
                    }
                } catch (e) {
                    console.warn('Failed to parse JSON:', e);
                }
            }
        }

        if (fullMessage) {
            chatHistory.push({ role: 'assistant', content: fullMessage });
            saveChatHistory();
        }

    } catch (error) {
        console.error('Error:', error);
        removeMessage(messageId);
        addMessage('system', '❌ ' + window.i18n.t('failedToSend') + ': ' + error.message);
    } finally {
        setInputState(true);
        userInput.focus();
    }
}

function addMessage(role, content) {
    // Only add message if messagesContainer exists (chat mode is enabled)
    if (!messagesContainer) {
        console.log('[Chat] Chat mode not available, skipping message add');
        return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message flex items-start space-x-3';

    const isUser = role === 'user';
    const isSystem = role === 'system';

    if (isUser) {
        messageDiv.classList.add('flex-row-reverse', 'space-x-reverse');
    }

    const avatar = document.createElement('div');
    avatar.className = `flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white ${
        isUser ? 'bg-purple-500' : isSystem ? 'bg-red-500' : 'bg-gray-500'
    }`;
    avatar.innerHTML = isUser ? '<i class="fas fa-user"></i>' :
                       isSystem ? '<i class="fas fa-exclamation"></i>' :
                       '<i class="fas fa-robot"></i>';

    const messageContent = document.createElement('div');
    messageContent.className = `max-w-2xl px-4 py-3 rounded-2xl ${
        isUser ? 'bg-purple-500 text-white' :
        isSystem ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
    }`;
    messageContent.innerHTML = formatMessage(content);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);

    const welcomeMsg = messagesContainer.querySelector('.text-center');
    if (welcomeMsg) welcomeMsg.remove();

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function createAssistantMessagePlaceholder(messageId) {
    // Only create placeholder if messagesContainer exists (chat mode is enabled)
    if (!messagesContainer) {
        console.log('[Chat] Chat mode not available, skipping placeholder creation');
        return null;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message flex items-start space-x-3';
    messageDiv.id = messageId;

    const avatar = document.createElement('div');
    avatar.className = 'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-500 text-white';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';

    const messageContent = document.createElement('div');
    messageContent.className = 'max-w-2xl px-4 py-3 rounded-2xl bg-gray-100 text-gray-800';
    messageContent.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);

    const welcomeMsg = messagesContainer.querySelector('.text-center');
    if (welcomeMsg) welcomeMsg.remove();

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return messageDiv;
}

function updateStreamingMessage(messageId, content) {
    const messageDiv = document.getElementById(messageId);
    if (!messageDiv) return;

    const messageContent = messageDiv.querySelector('.max-w-2xl');
    if (messageContent) {
        messageContent.innerHTML = formatMessage(content);
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
}

function removeMessage(messageId) {
    const messageDiv = document.getElementById(messageId);
    if (messageDiv) messageDiv.remove();
}

function formatMessage(content) {
    return content
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-3 rounded mt-2 overflow-x-auto"><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function setInputState(enabled) {
    userInput.disabled = !enabled;
    sendBtn.disabled = !enabled;

    if (enabled) {
        sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        sendBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

function clearChat() {
    // Only clear chat if messagesContainer exists (chat mode is enabled)
    if (!messagesContainer) {
        console.log('[Chat] Chat mode not available, skipping clear');
        return;
    }

    if (confirm(window.i18n.t('confirmClearChat'))) {
        chatHistory = [];
        messagesContainer.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-robot text-6xl text-purple-500 mb-4"></i>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">${window.i18n.t('chatMode')}</h2>
                <p class="text-gray-600">${window.i18n.t('startChatting')}</p>
            </div>
        `;
        saveChatHistory();
    }
}

function saveChatHistory() {
    localStorage.setItem('sora2-chat-history', JSON.stringify(chatHistory));
}

function loadChatHistory() {
    // Only load chat history if messagesContainer exists (chat mode is enabled)
    if (!messagesContainer) {
        console.log('[Chat] Chat mode not available, skipping history load');
        return;
    }

    try {
        const saved = localStorage.getItem('sora2-chat-history');
        if (saved) {
            chatHistory = JSON.parse(saved);
            if (chatHistory.length > 0) {
                chatHistory.forEach(msg => {
                    addMessage(msg.role, msg.content);
                });
            }
        }
    } catch (error) {
        console.error('[Chat] Error loading chat history:', error);
        chatHistory = [];
    }
}

// Function to update dynamic content when language changes
function updateDynamicContent() {
    // Update any dynamic content that might be displayed
    if (videoContainer) {
        // If showing initial state
        if (videoContainer.querySelector('.text-center') && !videoContainer.querySelector('video')) {
            resetVideoDisplay();
        }
    }

    // Update button texts
    if (generateBtn && !generateBtn.disabled) {
        generateBtn.innerHTML = `<i class="fas fa-play"></i><span>${window.i18n.t('generateVideo')}</span>`;
    }
    if (resetBtn) {
        resetBtn.innerHTML = `<i class="fas fa-redo"></i><span>${window.i18n.t('reset')}</span>`;
    }
    // sendBtn removed - no longer in UI
    if (downloadBtn) {
        downloadBtn.innerHTML = `<i class="fas fa-download mr-2"></i><span>${window.i18n.t('download')}</span>`;
    }
    if (shareBtn) {
        shareBtn.innerHTML = `<i class="fas fa-share-alt mr-2"></i><span>${window.i18n.t('share')}</span>`;
    }

    // Update image buttons
    if (generateImageBtn && !generateImageBtn.disabled) {
        generateImageBtn.innerHTML = `<i class="fas fa-magic"></i><span>${window.i18n.t('generateImage')}</span>`;
    }
    if (editImageBtn && !editImageBtn.disabled) {
        editImageBtn.innerHTML = `<i class="fas fa-edit"></i><span>${window.i18n?.t('editImageBtn') || '编辑图像'}</span>`;
    }
}

// Make functions globally accessible
window.resetVideoDisplay = resetVideoDisplay;
window.downloadImage = downloadImage;
window.copyImage = copyImage;
window.resetImageResults = resetImageResults;
window.resetEditResults = resetEditResults;
window.updateDynamicContent = updateDynamicContent;

// Listen for language change events
window.addEventListener('languageChanged', updateDynamicContent);