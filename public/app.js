// Application State
let currentMode = 'video'; // 'chat' or 'video' or 'image'
let currentVideoTab = 'text'; // 'text' or 'image'
let currentImageTab = 'text'; // 'text' or 'edit'
let chatHistory = [];
let videoTasks = {};
let uploadedImageData = null;
let uploadedMaskData = null;
let imageHistory = JSON.parse(localStorage.getItem('sora2-image-history') || '[]');

// DOM Elements - Video Mode
const videoForm = document.getElementById('videoForm');
const videoPrompt = document.getElementById('videoPrompt');
const imageVideoPrompt = document.getElementById('imageVideoPrompt');
const modelSelect = document.getElementById('modelSelect');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const textToVideoTab = document.getElementById('textToVideoTab');
const imageToVideoTab = document.getElementById('imageToVideoTab');
const textToVideoContent = document.getElementById('textToVideoContent');
const imageToVideoContent = document.getElementById('imageToVideoContent');
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

// DOM Elements - Image Mode
const textToImageTab = document.getElementById('textToImageTab');
const imageEditTab = document.getElementById('imageEditTab');
const textToImageSection = document.getElementById('textToImageSection');
const imageEditSection = document.getElementById('imageEditSection');
const textToImageForm = document.getElementById('textToImageForm');
const imagePrompt = document.getElementById('imagePrompt');
const negativePrompt = document.getElementById('negativePrompt');
const imageSize = document.getElementById('imageSize');
const numImages = document.getElementById('numImages');
const imageModel = document.getElementById('imageModel');
const seed = document.getElementById('seed');
const steps = document.getElementById('steps');
const stepsValue = document.getElementById('stepsValue');
const cfgScale = document.getElementById('cfgScale');
const cfgValue = document.getElementById('cfgValue');
const advancedToggle = document.getElementById('advancedToggle');
const advancedSettings = document.getElementById('advancedSettings');
const advancedIcon = document.getElementById('advancedIcon');
const generateImageBtn = document.getElementById('generateImageBtn');
const imageResults = document.getElementById('imageResults');
const imageEditForm = document.getElementById('imageEditForm');
const editImageUpload = document.getElementById('editImageUpload');
const editImagePreview = document.getElementById('editImagePreview');
const editPreviewImg = document.getElementById('editPreviewImg');
const removeEditImage = document.getElementById('removeEditImage');
const editPrompt = document.getElementById('editPrompt');
const maskUploadSection = document.getElementById('maskUploadSection');
const maskUpload = document.getElementById('maskUpload');
const editImageBtn = document.getElementById('editImageBtn');
const editResults = document.getElementById('editResults');
const historyGrid = document.getElementById('historyGrid');

// DOM Elements - Chat Mode
const chatMode = document.getElementById('chatMode');
const messagesContainer = document.getElementById('messagesContainer');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const temperatureSlider = document.getElementById('temperature');
const tempValue = document.getElementById('tempValue');
const clearChatBtn = document.getElementById('clearChatBtn');

// Mode Toggle
const modeToggle = document.getElementById('modeToggle');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadChatHistory();
    loadHistory();
    initializeVideoMode();
});

function setupEventListeners() {
    // Video Mode Events
    if (videoForm) videoForm.addEventListener('submit', handleVideoSubmit);
    if (resetBtn) resetBtn.addEventListener('click', resetVideoForm);
    if (textToVideoTab) textToVideoTab.addEventListener('click', () => switchVideoTab('text'));
    if (imageToVideoTab) imageToVideoTab.addEventListener('click', () => switchVideoTab('image'));
    if (imageUpload) imageUpload.addEventListener('change', handleImageUpload);
    if (removeImage) removeImage.addEventListener('click', handleRemoveImage);

    // Image Mode Events
    if (textToImageTab) textToImageTab.addEventListener('click', () => switchImageMode('text'));
    if (imageEditTab) imageEditTab.addEventListener('click', () => switchImageMode('edit'));
    if (textToImageForm) textToImageForm.addEventListener('submit', handleTextToImage);
    if (advancedToggle) advancedToggle.addEventListener('click', toggleAdvancedSettings);
    if (steps) steps.addEventListener('input', (e) => { stepsValue.textContent = e.target.value; });
    if (cfgScale) cfgScale.addEventListener('input', (e) => { cfgValue.textContent = e.target.value; });
    if (imageEditForm) imageEditForm.addEventListener('submit', handleImageEdit);
    if (editImageUpload) editImageUpload.addEventListener('change', handleEditImageUpload);
    if (removeEditImage) removeEditImage.addEventListener('click', handleRemoveEditImage);
    if (maskUpload) maskUpload.addEventListener('change', handleMaskUpload);

    // Edit type change
    document.querySelectorAll('input[name="editType"]').forEach(radio => {
        radio.addEventListener('change', handleEditTypeChange);
    });

    // Chat Mode Events
    if (chatForm) chatForm.addEventListener('submit', handleChatSubmit);
    if (clearChatBtn) clearChatBtn.addEventListener('click', clearChat);
    if (temperatureSlider) temperatureSlider.addEventListener('input', (e) => {
        tempValue.textContent = e.target.value;
    });

    // Mode Toggle
    if (modeToggle) modeToggle.addEventListener('click', toggleMode);

    // Video Player Events
    if (downloadBtn) downloadBtn.addEventListener('click', downloadVideo);
    if (shareBtn) shareBtn.addEventListener('click', shareVideo);
}

function initializeVideoMode() {
    // Set initial state for video mode
    currentMode = 'video';
    currentVideoTab = 'text';
    currentImageTab = 'text';
    if (document.querySelector('main')) {
        document.querySelector('main').classList.remove('hidden');
    }
    if (chatMode) chatMode.classList.add('hidden');
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

    // Get prompt based on current tab
    const prompt = currentVideoTab === 'text' ?
        videoPrompt.value.trim() :
        imageVideoPrompt.value.trim();

    if (!prompt) {
        alert(window.i18n.t('pleaseEnterDescription'));
        return;
    }

    // For image to video, require an image
    if (currentVideoTab === 'image' && !uploadedImageData) {
        alert(window.i18n.t('pleaseUploadImage'));
        return;
    }

    // Disable button and show loading
    generateBtn.disabled = true;
    generateBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>${window.i18n.t('generating')}</span>`;

    // Show progress indicator
    showProgressIndicator();

    try {
        // Parse model selection
        const modelValue = modelSelect.value;

        // Extract model information
        let model = modelValue.replace(/_/g, '_');
        let orientation = 'landscape';
        let duration = 10;

        // Parse based on model type
        if (modelValue === 'sora_image') {
            // Image generation model
            model = 'sora_image';
        } else if (modelValue === 'sora_video2') {
            // Standard video model
            model = 'sora_video2';
        } else if (modelValue.includes('landscape')) {
            model = modelValue;
            orientation = 'landscape';
            duration = modelValue.includes('15s') ? 15 : 10;
        } else if (modelValue.includes('portrait')) {
            model = modelValue;
            orientation = 'portrait';
            duration = modelValue.includes('15s') ? 15 : 10;
        }

        const requestBody = {
            prompt: prompt,
            model: model,
            options: {
                orientation: orientation,
                duration: duration,
                resolution: '1080p'
            }
        };

        // Add image data for image to video
        if (currentVideoTab === 'image' && uploadedImageData) {
            requestBody.image = uploadedImageData;
        }

        const response = await fetch('/api/video/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            // Add a reasonable timeout for the initial request
            signal: AbortSignal.timeout(30000) // 30 second timeout for initial request
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Network error' }));
            throw new Error(errorData.error || 'Video generation failed');
        }

        const data = await response.json();
        const taskId = data.id || data.task_id;

        // Store task data
        videoTasks[taskId] = {
            ...data,
            prompt: prompt,
            startTime: Date.now()
        };

        // Save task ID to localStorage for recovery
        try {
            const recentTasks = JSON.parse(localStorage.getItem('sora2-video-tasks') || '[]');
            recentTasks.unshift({
                taskId: taskId,
                prompt: prompt,
                timestamp: Date.now(),
                status: 'processing'
            });
            // Keep only last 10 tasks
            localStorage.setItem('sora2-video-tasks', JSON.stringify(recentTasks.slice(0, 10)));
        } catch (e) {
            console.warn('Failed to save task to localStorage:', e);
        }

        // Show task ID to user
        console.log(`Video task started: ${taskId}`);
        showProgressWithTaskId(taskId);

        // Start polling for task status
        pollVideoTask(taskId);

    } catch (error) {
        console.error('Error:', error);
        hideProgressIndicator();

        // Provide more specific error messages
        if (error.name === 'AbortError') {
            showError('Request timed out. The server may be busy. Please try again.');
        } else if (error.message.includes('Network')) {
            showError('Network error. Please check your connection and try again.');
        } else {
            showError(error.message || 'Video generation failed. Please try again.');
        }
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `<i class="fas fa-play"></i><span>${window.i18n.t('generateVideo')}</span>`;
    }
}

// Image Generation
async function handleTextToImage(e) {
    e.preventDefault();

    const prompt = imagePrompt.value.trim();
    if (!prompt) {
        alert(window.i18n.t('pleaseEnterDescription'));
        return;
    }

    // Disable button and show loading
    generateImageBtn.disabled = true;
    generateImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Generating...</span>';

    // Show loading state
    showImageLoading();

    try {
        const requestBody = {
            prompt: prompt,
            negative_prompt: negativePrompt.value.trim(),
            size: imageSize.value,
            num_images: parseInt(numImages.value),
            model: imageModel.value
        };

        // Add optional parameters
        if (seed.value) {
            requestBody.seed = parseInt(seed.value);
        }
        if (steps.value) {
            requestBody.steps = parseInt(steps.value);
        }
        if (cfgScale.value) {
            requestBody.cfg_scale = parseFloat(cfgScale.value);
        }

        const response = await fetch('/api/image/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Image generation failed');
        }

        const data = await response.json();
        displayGeneratedImages(data.images, prompt);

        // Save to history
        saveToHistory({
            type: 'text',
            prompt: prompt,
            images: data.images,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error:', error);
        showImageError(error.message);
    } finally {
        generateImageBtn.disabled = false;
        generateImageBtn.innerHTML = `<i class="fas fa-magic"></i><span>${window.i18n.t('generateImage')}</span>`;
    }
}

// Image Editing
async function handleImageEdit(e) {
    e.preventDefault();

    const editType = document.querySelector('input[name="editType"]:checked').value;
    const prompt = editPrompt.value.trim();

    if (!uploadedImageData) {
        alert(window.i18n.t('pleaseUploadImage'));
        return;
    }

    // Disable button and show loading
    editImageBtn.disabled = true;
    editImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Editing...</span>';

    // Show loading state
    showEditLoading();

    try {
        const requestBody = {
            image: uploadedImageData,
            edit_type: editType,
            prompt: prompt,
            model: imageModel.value
        };

        // Add mask if available
        if (uploadedMaskData) {
            requestBody.mask = uploadedMaskData;
        }

        const response = await fetch('/api/image/edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Image edit failed');
        }

        const data = await response.json();
        displayEditedImages(data.images, prompt);

        // Save to history
        saveToHistory({
            type: 'edit',
            edit_type: editType,
            prompt: prompt,
            original_image: uploadedImageData,
            images: data.images,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error:', error);
        showEditError(error.message);
    } finally {
        editImageBtn.disabled = false;
        editImageBtn.innerHTML = `<i class="fas fa-edit"></i><span>${window.i18n.t('editImageBtn')}</span>`;
    }
}

// Poll Video Task Status
async function pollVideoTask(taskId) {
    const maxAttempts = 300; // 15 minutes max (increased from 6 minutes)
    let attempts = 0;
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 5;

    const interval = setInterval(async () => {
        attempts++;

        try {
            const response = await fetch(`/api/video/tasks/${taskId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Add timeout for the polling request
                signal: AbortSignal.timeout(10000) // 10 second timeout for status check
            });

            if (!response.ok) {
                consecutiveFailures++;
                console.warn(`Failed to check status (attempt ${attempts}):`, response.status);

                // If we have too many consecutive failures, stop polling
                if (consecutiveFailures >= maxConsecutiveFailures) {
                    clearInterval(interval);
                    hideProgressIndicator();
                    showError('Connection lost. Please refresh and check your task status.');
                    return;
                }
                return; // Skip this attempt but continue polling
            }

            consecutiveFailures = 0; // Reset on successful request
            const data = await response.json();

            updateProgressIndicator(data, attempts, maxAttempts);

            if (data.status === 'completed' && data.video_url) {
                clearInterval(interval);
                showVideoResult(data);
            } else if (data.status === 'failed' || data.status === 'error') {
                clearInterval(interval);
                hideProgressIndicator();
                showError(data.error || data.reason || 'Video generation failed');
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                hideProgressIndicator();
                showError('Video generation is taking longer than expected. The task may still be processing. Please try checking again later.');
            }

        } catch (error) {
            console.error('Polling error:', error);
            consecutiveFailures++;

            if (error.name === 'AbortError') {
                console.warn('Polling request timed out, retrying...');
            }

            if (consecutiveFailures >= maxConsecutiveFailures || attempts >= maxAttempts) {
                clearInterval(interval);
                hideProgressIndicator();
                showError('Failed to check video status. Please try again.');
            }
        }
    }, 3000); // Poll every 3 seconds
}

// UI Update Functions
let startTime = null;
let progressInterval = null;

function showProgressIndicator() {
    videoContainer.classList.add('hidden');
    progressIndicator.classList.remove('hidden');
    progressBar.style.width = '0%';
    statusText.textContent = window.i18n.t('initializing');
    document.getElementById('progressPercent').textContent = '0%';
    document.getElementById('elapsedTime').textContent = '已等待 0 秒';
    document.getElementById('estimatedTime').textContent = '预计剩余时间未知';

    startTime = Date.now();

    // Update elapsed time every second
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(updateElapsedTime, 1000);
}

function showProgressWithTaskId(taskId) {
    showProgressIndicator();

    // Add task ID information to the progress display
    const taskIdElement = document.getElementById('taskIdInfo');
    if (taskIdElement) {
        taskIdElement.textContent = `Task ID: ${taskId}`;
        taskIdElement.classList.remove('hidden');
    } else {
        // Create task ID display if it doesn't exist
        const progressElement = document.querySelector('#progressIndicator .text-center');
        if (progressElement) {
            const taskInfo = document.createElement('div');
            taskInfo.id = 'taskIdInfo';
            taskInfo.className = 'text-sm text-gray-500 mt-2';
            taskInfo.innerHTML = `Task ID: <code class="bg-gray-100 px-2 py-1 rounded">${taskId}</code>`;
            progressElement.appendChild(taskInfo);
        }
    }
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

function updateProgressIndicator(data, attempts, maxAttempts) {
    const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

    // Calculate progress based on different factors
    let progress = 0;
    let statusMsg = '';
    let estimatedRemaining = '';

    if (data.status === 'queued' || data.status === 'pending') {
        // Video is queued
        progress = Math.min(5 + (attempts / maxAttempts) * 10, 15);
        statusMsg = window.i18n.t('videoQueued') || 'Video queued for processing...';
    } else if (data.status === 'processing' || data.status === 'in_progress') {
        // During processing, progress advances more slowly
        progress = Math.min(20 + (attempts / maxAttempts) * 60, 85);
        statusMsg = window.i18n.t('processingVideo') || 'Processing video...';

        // Estimate remaining time based on elapsed time and progress
        if (progress > 20) {
            const rate = elapsed / progress;
            const remaining = Math.floor(rate * (100 - progress));
            const remainingMinutes = Math.floor(remaining / 60);
            const remainingSeconds = remaining % 60;

            if (remainingMinutes > 0) {
                estimatedRemaining = `预计剩余 ${remainingMinutes} 分 ${remainingSeconds} 秒`;
            } else {
                estimatedRemaining = `预计剩余 ${remainingSeconds} 秒`;
            }
        }
    } else if (data.status === 'queued') {
        // During queued phase, progress is very slow
        progress = Math.min((attempts / maxAttempts) * 20, 20);
        statusMsg = window.i18n.t('queuedForProcessing') || '任务已排队，等待处理中...';

        // For queued tasks, estimate based on queue position
        if (data.queue_position) {
            estimatedRemaining = `队列位置: 第 ${data.queue_position} 个`;
        }
    } else if (data.status === 'completed') {
        progress = 100;
        statusMsg = '视频生成完成！';
        estimatedRemaining = '即将显示...';
    } else if (data.status === 'failed') {
        progress = 0;
        statusMsg = '生成失败';
        estimatedRemaining = '';
    } else {
        // Default case
        progress = Math.min((attempts / maxAttempts) * 15, 15);
        statusMsg = `${window.i18n.t('status') || '状态'}: ${data.status || window.i18n.t('waiting') || '等待中'}`;
    }

    // Update UI
    progressBar.style.width = `${progress}%`;
    document.getElementById('progressPercent').textContent = `${Math.floor(progress)}%`;
    statusText.textContent = statusMsg;

    if (estimatedRemaining) {
        document.getElementById('estimatedTime').textContent = estimatedRemaining;
    }

    // Add animation to progress bar
    progressBar.style.transition = 'width 500ms ease-out';
}

function hideProgressIndicator() {
    progressIndicator.classList.add('hidden');
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
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

function showError(message) {
    videoContainer.classList.remove('hidden');
    videoContainer.innerHTML = `
        <div class="text-center">
            <div class="text-6xl mb-4">❌</div>
            <h3 class="text-lg font-semibold text-red-600 mb-2">${window.i18n.t('generationFailed')}</h3>
            <p class="text-sm text-gray-600">${message}</p>
            <button onclick="resetVideoDisplay()" class="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                ${window.i18n.t('tryAgain')}
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

// Image Upload Handlers
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert(window.i18n.t('pleaseUploadImageFile'));
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert(window.i18n.t('imageSizeLimit'));
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        uploadedImageData = event.target.result;
        previewImg.src = event.target.result;
        imagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function handleRemoveImage() {
    uploadedImageData = null;
    imageUpload.value = '';
    imagePreview.classList.add('hidden');
    previewImg.src = '';
}

function handleEditImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert(window.i18n.t('pleaseUploadImageFile'));
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert(window.i18n.t('imageSizeLimit'));
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        uploadedImageData = event.target.result;
        editPreviewImg.src = event.target.result;
        editImagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
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

    // Show/hide mask upload for inpaint
    if (editType === 'inpaint') {
        maskUploadSection.classList.remove('hidden');
    } else {
        maskUploadSection.classList.add('hidden');
        uploadedMaskData = null;
        maskUpload.value = '';
    }
}

function toggleAdvancedSettings() {
    advancedSettings.classList.toggle('hidden');
    advancedIcon.classList.toggle('rotate-180');
}

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
            headers: {
                'Content-Type': 'application/json',
            },
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
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
    const saved = localStorage.getItem('sora2-chat-history');
    if (saved) {
        chatHistory = JSON.parse(saved);
        if (chatHistory.length > 0 && messagesContainer) {
            chatHistory.forEach(msg => {
                addMessage(msg.role, msg.content);
            });
        }
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
    if (sendBtn) {
        sendBtn.innerHTML = `<i class="fas fa-paper-plane mr-2"></i><span>${window.i18n.t('send')}</span>`;
    }
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
        editImageBtn.innerHTML = `<i class="fas fa-edit"></i><span>${window.i18n.t('editImageBtn')}</span>`;
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