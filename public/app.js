// Chat History
let chatHistory = [];
let currentMode = 'chat'; // 'chat' or 'video'
let videoTasks = {}; // 存储视频任务
let uploadedImageData = null; // 存储上传的图片数据

// DOM Elements
const messagesContainer = document.getElementById('messagesContainer');
const chatForm = document.getElementById('chatForm');
const videoForm = document.getElementById('videoForm');
const userInput = document.getElementById('userInput');
const videoPrompt = document.getElementById('videoPrompt');
const sendBtn = document.getElementById('sendBtn');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const modeToggle = document.getElementById('modeToggle');
const temperatureSlider = document.getElementById('temperature');
const tempValue = document.getElementById('tempValue');
const chatOptions = document.getElementById('chatOptions');
const orientation = document.getElementById('orientation');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImage = document.getElementById('removeImage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
    setupEventListeners();
});

function setupEventListeners() {
    chatForm.addEventListener('submit', handleChatSubmit);
    videoForm.addEventListener('submit', handleVideoSubmit);
    clearBtn.addEventListener('click', clearChat);
    modeToggle.addEventListener('click', toggleMode);
    temperatureSlider.addEventListener('input', (e) => {
        tempValue.textContent = e.target.value;
    });

    // Image upload handlers
    imageUpload.addEventListener('change', handleImageUpload);
    removeImage.addEventListener('click', handleRemoveImage);
}

function toggleMode() {
    currentMode = currentMode === 'chat' ? 'video' : 'chat';

    if (currentMode === 'video') {
        chatForm.classList.add('hidden');
        videoForm.classList.remove('hidden');
        chatOptions.classList.add('hidden');
        modeToggle.innerHTML = '<i class="fas fa-video"></i><span>视频模式</span>';
    } else {
        chatForm.classList.remove('hidden');
        videoForm.classList.add('hidden');
        chatOptions.classList.remove('hidden');
        modeToggle.innerHTML = '<i class="fas fa-comments"></i><span>聊天模式</span>';
    }
}

async function handleChatSubmit(e) {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    // Disable input
    setInputState(false);

    // Add user message
    addMessage('user', message);
    chatHistory.push({ role: 'user', content: message });

    // Clear input
    userInput.value = '';

    // Create placeholder for streaming response
    const messageId = 'msg-' + Date.now();
    const placeholderDiv = createAssistantMessagePlaceholder(messageId);

    try {
        // Call streaming API
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

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullMessage = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log('Stream completed');
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;

                    // Handle both SSE format (data: ...) and direct JSON
                    let jsonStr = line;
                    if (line.startsWith('data: ')) {
                        jsonStr = line.slice(6).trim();
                        if (jsonStr === '[DONE]') {
                            console.log('Received [DONE] signal');
                            continue;
                        }
                    }

                    // Skip non-JSON lines
                    if (!jsonStr.startsWith('{')) continue;

                    try {
                        const parsed = JSON.parse(jsonStr);
                        const content = parsed.choices?.[0]?.delta?.content;

                        if (content) {
                            console.log('Received content:', content.substring(0, 50));
                            fullMessage += content;
                            updateStreamingMessage(messageId, fullMessage);
                        }
                    } catch (e) {
                        console.warn('Failed to parse JSON:', jsonStr.substring(0, 100), e);
                    }
                }
            }
        } catch (readError) {
            console.error('Stream read error:', readError);
            throw readError;
        }

        // Save final message
        if (fullMessage) {
            chatHistory.push({ role: 'assistant', content: fullMessage });
            saveChatHistory();
            console.log('Message saved to history');
        } else {
            throw new Error('No content received from stream');
        }

    } catch (error) {
        console.error('Error:', error);
        removeMessage(messageId);
        addMessage('system', '❌ 发送失败: ' + error.message);
    } finally {
        setInputState(true);
        userInput.focus();
    }
}

async function handleVideoSubmit(e) {
    e.preventDefault();

    const prompt = videoPrompt.value.trim();
    if (!prompt) return;

    // Disable button
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>生成中...</span>';

    try {
        const requestBody = {
            prompt: prompt,
            options: {
                orientation: orientation.value
            }
        };

        // 如果有上传的图片，添加到请求中
        if (uploadedImageData) {
            requestBody.image = uploadedImageData;
        }

        const response = await fetch('/api/video/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Video generation failed');
        }

        const data = await response.json();

        // 显示任务信息
        addVideoTask(data);

        // 清空输入和图片
        videoPrompt.value = '';
        handleRemoveImage();

    } catch (error) {
        console.error('Error:', error);
        addMessage('system', '❌ 视频生成失败: ' + error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-video"></i><span>生成视频</span>';
    }
}

function addVideoTask(taskData) {
    const taskId = taskData.id || taskData.task_id;
    videoTasks[taskId] = taskData;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message flex items-start space-x-3';
    messageDiv.id = `task-${taskId}`;

    const avatar = document.createElement('div');
    avatar.className = 'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-purple-500 text-white';
    avatar.innerHTML = '<i class="fas fa-video"></i>';

    const content = document.createElement('div');
    content.className = 'max-w-2xl px-4 py-3 rounded-2xl bg-blue-50 border border-blue-200';
    content.innerHTML = `
        <div class="flex items-center space-x-2 mb-2">
            <i class="fas fa-clock text-blue-500"></i>
            <span class="font-semibold">视频生成中...</span>
        </div>
        <p class="text-sm text-gray-600 mb-2">任务ID: ${taskId}</p>
        <div class="text-sm">
            <div class="mb-1">提示词: ${taskData.prompt || '无'}</div>
            <div class="status-text">状态: 排队中...</div>
        </div>
    `;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    const welcomeMsg = messagesContainer.querySelector('.text-center');
    if (welcomeMsg) welcomeMsg.remove();

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 开始轮询任务状态
    pollVideoTask(taskId);
}

async function pollVideoTask(taskId) {
    const maxAttempts = 60; // 最多轮询60次
    let attempts = 0;

    const interval = setInterval(async () => {
        attempts++;

        try {
            const response = await fetch(`/api/video/tasks/${taskId}`);
            const data = await response.json();

            updateVideoTaskStatus(taskId, data);

            if (data.status === 'completed' || data.status === 'failed' || attempts >= maxAttempts) {
                clearInterval(interval);
            }

        } catch (error) {
            console.error('Polling error:', error);
            if (attempts >= maxAttempts) {
                clearInterval(interval);
            }
        }
    }, 3000); // 每3秒轮询一次
}

function updateVideoTaskStatus(taskId, data) {
    const taskElement = document.getElementById(`task-${taskId}`);
    if (!taskElement) return;

    const statusText = taskElement.querySelector('.status-text');
    const content = taskElement.querySelector('.max-w-2xl');

    if (data.status === 'completed' && data.video_url) {
        content.className = 'max-w-2xl px-4 py-3 rounded-2xl bg-green-50 border border-green-200';
        content.innerHTML = `
            <div class="flex items-center space-x-2 mb-2">
                <i class="fas fa-check-circle text-green-500"></i>
                <span class="font-semibold">视频生成成功！</span>
            </div>
            <video controls class="w-full rounded-lg mt-2 mb-2">
                <source src="${data.video_url}" type="video/mp4">
            </video>
            <a href="${data.video_url}" target="_blank" class="text-blue-500 hover:underline text-sm">
                <i class="fas fa-download"></i> 下载视频
            </a>
        `;
    } else if (data.status === 'failed') {
        content.className = 'max-w-2xl px-4 py-3 rounded-2xl bg-red-50 border border-red-200';
        statusText.innerHTML = `状态: ❌ 生成失败 - ${data.error || data.reason || '未知错误'}`;
    } else if (data.status === 'processing') {
        statusText.innerHTML = '状态: ⚙️ 处理中...';
    } else {
        statusText.innerHTML = `状态: ${data.status || '等待中'}`;
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
    avatar.innerHTML = isUser ? '<i class="fas fa-user"></i>' : isSystem ? '<i class="fas fa-exclamation"></i>' : '<i class="fas fa-robot"></i>';

    const messageContent = document.createElement('div');
    messageContent.className = `max-w-2xl px-4 py-3 rounded-2xl ${
        isUser ? 'bg-purple-500 text-white' : isSystem ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
    }`;

    // Format message content (support markdown-like formatting)
    const formattedContent = formatMessage(content);
    messageContent.innerHTML = formattedContent;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);

    // Remove welcome message if exists
    const welcomeMsg = messagesContainer.querySelector('.text-center');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatMessage(content) {
    // Check if content contains video generation result
    const videoUrlMatch = content.match(/\[点击这里\]\((https?:\/\/[^\s\)]+\.mp4)\)/);

    if (videoUrlMatch) {
        const videoUrl = videoUrlMatch[1];

        // Extract progress information
        const progressMatches = content.match(/进度[：:]\s*(\d+\.?\d*)%/g);
        let progressHtml = '';

        if (progressMatches) {
            progressHtml = '<div class="space-y-1 mb-3">';
            progressMatches.forEach(p => {
                const percent = p.match(/(\d+\.?\d*)%/)[1];
                progressHtml += `<div class="text-sm text-gray-600">${p}</div>`;
            });
            progressHtml += '</div>';
        }

        // Show video player
        return `
            ${progressHtml}
            <div class="mt-3">
                <div class="flex items-center space-x-2 mb-2 text-green-600">
                    <i class="fas fa-check-circle"></i>
                    <span class="font-semibold">✅ 视频生成成功！</span>
                </div>
                <video controls class="w-full rounded-lg mb-2" style="max-width: 500px;">
                    <source src="${videoUrl}" type="video/mp4">
                </video>
                <a href="${videoUrl}" target="_blank" class="text-blue-500 hover:underline text-sm inline-flex items-center">
                    <i class="fas fa-download mr-1"></i> 下载视频
                </a>
            </div>
        `;
    }

    // Check for progress updates
    if (content.includes('⌛️') || content.includes('🏃')) {
        const lines = content.split('\n').filter(l => l.trim());
        let html = '<div class="space-y-2">';

        for (const line of lines) {
            if (line.includes('```json')) continue;
            if (line.includes('```')) continue;
            if (line.trim() === '') continue;

            if (line.includes('⌛️')) {
                html += `<div class="flex items-center space-x-2 text-blue-600"><i class="fas fa-clock"></i><span>${line.replace(/^>\s*/, '')}</span></div>`;
            } else if (line.includes('🏃')) {
                const percent = line.match(/(\d+\.?\d*)%/)?.[1] || '0';
                html += `
                    <div class="space-y-1">
                        <div class="flex items-center justify-between text-sm">
                            <span>${line.replace(/^>\s*/, '')}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
                        </div>
                    </div>
                `;
            } else {
                html += `<div>${line.replace(/^>\s*/, '')}</div>`;
            }
        }

        html += '</div>';
        return html;
    }

    // Simple formatting: code blocks, bold, italic
    let formatted = content
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-3 rounded mt-2 overflow-x-auto"><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');

    return formatted;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message flex items-start space-x-3';
    typingDiv.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-500 text-white';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';

    const typingContent = document.createElement('div');
    typingContent.className = 'px-4 py-3 rounded-2xl bg-gray-100';
    typingContent.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typingContent);
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return 'typing-indicator';
}

function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
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
    if (confirm('确定要清空对话历史吗？')) {
        chatHistory = [];
        messagesContainer.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-robot text-6xl text-purple-500 mb-4"></i>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">欢迎使用 Sora-2</h2>
                <p class="text-gray-600">开始与 AI 对话吧！</p>
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
        chatHistory.forEach(msg => {
            addMessage(msg.role, msg.content);
        });
    }
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
    if (messageDiv) {
        messageDiv.remove();
    }
}

// Image upload handlers
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过10MB！');
        return;
    }

    // Read file as base64
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
