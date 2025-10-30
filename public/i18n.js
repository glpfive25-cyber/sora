// Internationalization Support
const translations = {
    zh: {
        // Header
        appTitle: "Sora2 AI视频生成器",
        aiVideoFeatures: "AI视频功能",
        pricing: "定价计划",
        startCreating: "开始创作视频",
        login: "登录",

        // Main Title
        mainTitle: "AI 视频生成",
        mainSubtitle: "用AI技术将你的想法转化为精彩的视频",

        // Generation Settings
        generationSettings: "生成设置",
        textToVideo: "文字转视频",
        imageToVideo: "图片转视频",

        // Form Labels
        videoDescription: "视频描述",
        videoPromptPlaceholder: "详细描述您想要生成的视频内容...",
        uploadImage: "上传图片",
        clickToUpload: "点击上传参考图片",
        supportsFormats: "支持 JPG, PNG, GIF",
        imagePromptPlaceholder: "描述图片应该如何动画化...",
        model: "模型",
        generateVideo: "生成视频",
        reset: "重置",

        // Model Options
        soraImage: "Sora 图片生成 ($0.020)",
        soraVideo2: "Sora 视频 标准 ($0.020)",
        soraVideo2Landscape: "Sora 视频 横屏 ($0.020)",
        soraVideo2Landscape15s: "Sora 视频 横屏 15秒 ($0.020)",
        soraVideo2Portrait: "Sora 视频 竖屏 ($0.020)",
        soraVideo2Portrait15s: "Sora 视频 竖屏 15秒 ($0.020)",

        // Generated Video Panel
        generatedVideo: "生成的视频",
        enterPromptToGenerate: "输入提示词以生成视频",
        videoWillAppearHere: "您生成的视频将在处理后显示在这里。",
        enterDetailedDescription: "输入详细描述即可开始。",

        // Progress Messages
        initializing: "初始化中...",
        processingVideo: "视频处理中... 这可能需要几分钟",
        queuedForProcessing: "排队等待处理中...",
        status: "状态",
        waiting: "等待中",
        generating: "生成中...",

        // Video Player
        download: "下载",
        share: "分享",

        // Error Messages
        generationFailed: "生成失败",
        tryAgain: "重试",
        pleaseEnterDescription: "请输入视频描述！",
        pleaseUploadImage: "请上传参考图片！",
        pleaseUploadImageFile: "请上传图片文件！",
        imageSizeLimit: "图片大小不能超过10MB！",
        videoGenerationFailed: "视频生成失败",
        videoGenerationTimeout: "视频生成超时，请重试。",
        failedToCheckStatus: "检查视频状态失败",

        // Chat Mode
        chatMode: "聊天模式",
        startChatting: "开始与AI对话！",
        typeMessage: "输入您的消息...",
        send: "发送",
        temperature: "温度",
        clearChat: "清空对话",
        confirmClearChat: "确定要清空对话历史吗？",
        failedToSend: "发送失败",

        // Share Messages
        generatedAIVideo: "生成的AI视频",
        checkOutVideo: "看看这个AI生成的视频！",
        linkCopied: "视频链接已复制到剪贴板！",
        shareFailed: "分享失败",

        // Navigation
        aiFeatures: "AI功能",
        videoGen: "视频生成",
        imageGen: "图像生成",

        // Image Generation
        imageGenTitle: "Sora2 AI图像生成器",
        imageGenMainTitle: "AI 图像生成",
        imageGenSubtitle: "用AI技术将你的想法转化为精美的图像",
        textToImage: "文生图",
        imageEdit: "图像编辑",
        createImage: "创建图像",
        imageDescription: "图像描述",
        imagePromptPlaceholder: "描述您想要生成的图像，越详细越好...",
        negativePrompt: "负向提示词",
        negativePromptPlaceholder: "描述您不希望出现在图像中的内容...",
        imageSize: "图像尺寸",
        numImages: "生成数量",
        advancedSettings: "高级设置",
        seed: "种子值",
        steps: "生成步数",
        generateImage: "生成图像",
        generatedImages: "生成的图像",
        noImagesYet: "还没有生成图像",
        enterPromptToGenerate: "输入提示词开始生成",
        editImage: "编辑图像",
        uploadImage: "上传图像",
        clickToUploadImage: "点击上传图像",
        supportsImageFormats: "支持 JPG, PNG, WebP",
        editType: "编辑类型",
        inpaint: "局部重绘",
        outpaint: "扩展画面",
        variation: "图像变体",
        editPrompt: "编辑提示词",
        editPromptPlaceholder: "描述您想要的修改...",
        uploadMask: "上传蒙版（可选）",
        clickToUploadMask: "点击上传蒙版",
        editImageBtn: "编辑图像",
        editedImages: "编辑后的图像",
        noEditedImagesYet: "还没有编辑图像",
        uploadImageToEdit: "上传图像开始编辑",
        recentCreations: "最近创作",
        downloadImage: "下载图像",
        imageGenerationFailed: "图像生成失败",
        imageEditFailed: "图像编辑失败",
        pleaseEnterDescription: "请输入图像描述！",
        pleaseUploadImage: "请上传图像！",
        generatingImage: "生成中...",
        editingImage: "编辑中..."
    },
    en: {
        // Header
        appTitle: "Sora2 AI Video Generator",
        aiVideoFeatures: "AI Video Features",
        pricing: "Pricing",
        startCreating: "Start Creating Video",
        login: "Login",

        // Main Title
        mainTitle: "AI Video Generation",
        mainSubtitle: "Transform your ideas into stunning videos with AI technology",

        // Generation Settings
        generationSettings: "Generation Settings",
        textToVideo: "Text to Video",
        imageToVideo: "Image to Video",

        // Form Labels
        videoDescription: "Video Description",
        videoPromptPlaceholder: "Describe the video you want to generate in detail...",
        uploadImage: "Upload Image",
        clickToUpload: "Click to upload reference image",
        supportsFormats: "Supports JPG, PNG, GIF",
        imagePromptPlaceholder: "Describe how the image should be animated...",
        model: "Model",
        generateVideo: "Generate Video",
        reset: "Reset",

        // Model Options
        soraImage: "Sora Image Generation ($0.020)",
        soraVideo2: "Sora Video Standard ($0.020)",
        soraVideo2Landscape: "Sora Video Landscape ($0.020)",
        soraVideo2Landscape15s: "Sora Video Landscape 15s ($0.020)",
        soraVideo2Portrait: "Sora Video Portrait ($0.020)",
        soraVideo2Portrait15s: "Sora Video Portrait 15s ($0.020)",

        // Generated Video Panel
        generatedVideo: "Generated Video",
        enterPromptToGenerate: "Enter your prompt to generate video",
        videoWillAppearHere: "Your generated video will appear here after processing.",
        enterDetailedDescription: "Enter a detailed description to get started.",

        // Progress Messages
        initializing: "Initializing...",
        processingVideo: "Processing video... This may take a few minutes",
        queuedForProcessing: "Queued for processing...",
        status: "Status",
        waiting: "Waiting",
        generating: "Generating...",

        // Video Player
        download: "Download",
        share: "Share",

        // Error Messages
        generationFailed: "Generation Failed",
        tryAgain: "Try Again",
        pleaseEnterDescription: "Please enter video description!",
        pleaseUploadImage: "Please upload reference image!",
        pleaseUploadImageFile: "Please upload an image file!",
        imageSizeLimit: "Image size cannot exceed 10MB!",
        videoGenerationFailed: "Video generation failed",
        videoGenerationTimeout: "Video generation timed out. Please try again.",
        failedToCheckStatus: "Failed to check video status",

        // Chat Mode
        chatMode: "Chat Mode",
        startChatting: "Start chatting with AI!",
        typeMessage: "Type your message...",
        send: "Send",
        temperature: "Temperature",
        clearChat: "Clear Chat",
        confirmClearChat: "Are you sure you want to clear the chat history?",
        failedToSend: "Failed to send",

        // Share Messages
        generatedAIVideo: "Generated AI Video",
        checkOutVideo: "Check out this AI-generated video!",
        linkCopied: "Video link copied to clipboard!",
        shareFailed: "Share failed",

        // Navigation
        aiFeatures: "AI Features",
        videoGen: "Video Generation",
        imageGen: "Image Generation",

        // Image Generation
        imageGenTitle: "Sora2 AI Image Generator",
        imageGenMainTitle: "AI Image Generation",
        imageGenSubtitle: "Transform your ideas into stunning images with AI technology",
        textToImage: "Text to Image",
        imageEdit: "Image Edit",
        createImage: "Create Image",
        imageDescription: "Image Description",
        imagePromptPlaceholder: "Describe the image you want to generate in detail...",
        negativePrompt: "Negative Prompt",
        negativePromptPlaceholder: "Describe what you don't want in the image...",
        imageSize: "Image Size",
        numImages: "Number of Images",
        advancedSettings: "Advanced Settings",
        seed: "Seed",
        steps: "Steps",
        generateImage: "Generate Image",
        generatedImages: "Generated Images",
        noImagesYet: "No images generated yet",
        enterPromptToGenerate: "Enter a prompt to start generating",
        editImage: "Edit Image",
        uploadImage: "Upload Image",
        clickToUploadImage: "Click to upload image",
        supportsImageFormats: "Supports JPG, PNG, WebP",
        editType: "Edit Type",
        inpaint: "Inpaint",
        outpaint: "Outpaint",
        variation: "Variation",
        editPrompt: "Edit Prompt",
        editPromptPlaceholder: "Describe the changes you want...",
        uploadMask: "Upload Mask (Optional)",
        clickToUploadMask: "Click to upload mask",
        editImageBtn: "Edit Image",
        editedImages: "Edited Images",
        noEditedImagesYet: "No images edited yet",
        uploadImageToEdit: "Upload an image to start editing",
        recentCreations: "Recent Creations",
        downloadImage: "Download Image",
        imageGenerationFailed: "Image generation failed",
        imageEditFailed: "Image edit failed",
        pleaseEnterDescription: "Please enter image description!",
        pleaseUploadImage: "Please upload an image!",
        generatingImage: "Generating...",
        editingImage: "Editing..."
    }
};

// Language Management
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'zh';
        this.translations = translations;
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            this.updatePageLanguage();
        }
    }

    t(key) {
        return this.translations[this.currentLang][key] || this.translations['en'][key] || key;
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    updatePageLanguage() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            } else {
                // Check if element has icon
                const icon = element.querySelector('i');
                if (icon) {
                    const iconHTML = icon.outerHTML;
                    element.innerHTML = iconHTML + ' ' + translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update document language
        document.documentElement.lang = this.currentLang;

        // Dispatch event for dynamic content
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: this.currentLang }));
    }
}

// Create global instance
window.i18n = new I18n();

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.updatePageLanguage();
});