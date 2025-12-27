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
        editingImage: "编辑中...",

        // Navigation
        videoTools: "视频工具",
        imageTools: "图像工具",
        characterTools: "角色工具",
        others: "其他",
        textToVideoNav: "文本转视频",
        imageToVideoNav: "图像转视频",
        textToImageNav: "文本转图像",
        imageToImageNav: "图像转图像",
        createCharacter: "创建角色",
        characterVideo: "角色视频",
        myCharacters: "我的角色",
        settings: "设置",
        help: "使用帮助",
        quickStart: "快速开始",
        limitedTimeFree: "限时免费使用",
        quickStartStep1: "1. 输入描述文字",
        quickStartStep2: "2. 选择模型参数",
        quickStartStep3: "3. 点击生成按钮",

        // Page Titles
        textToVideoTitle: "文本生成视频",
        imageToVideoTitle: "图像转视频",
        textToImageTitle: "文本生成图像",
        imageToImageTitle: "图像转图像",
        createCharacterTitle: "���建角色",
        characterVideoTitle: "角色视频生成",
        myCharactersTitle: "我的角色",

        // Tips and Guidance
        descriptionTips: "描述技巧",
        descriptionSubject: "描述主体：谁/什么在画面中",
        descriptionAction: "描述动作：正在做什么",
        descriptionEnvironment: "描述环境：在哪里、什么时间",
        descriptionAtmosphere: "描述氛围：光线、色调、情绪",
        detailImprovesResults: "越详细效果越好！",
        descriptionHint: "提示：描述越详细，生成效果越好",
        enterVideoDescription: "描述您想要的视频内容",
        videoPromptExample: "例如: 一只可爱的小猫在草地上玩耍，阳光明媚，蝴蝶飞舞...",
        characterCount: "字",

        // Model Options
        selectModel: "选择模型",
        sora2Landscape10s: "Sora-2 横屏 10秒 (推荐)",
        sora2Portrait10s: "Sora-2 竖屏 10秒",
        sora2Landscape15s: "Sora-2-Pro 横屏 15秒",
        sora2Portrait15s: "Sora-2-Pro 竖屏 15秒",
        sora2Landscape25s: "Sora-2-Pro 横屏 25秒",
        sora2Portrait25s: "Sora-2-Pro 竖屏 25秒",

        // UI Elements
        generateBtn: "生成视频",
        resetBtn: "重置",
        downloadBtn: "下载",
        shareBtn: "分享",
        removeBtn: "移除",
        closeBtn: "关闭",

        // Status Messages
        readyToGenerate: "准备生成你的第一个视频",
        enterDetailedScene: "在上方输入详细的场景描述，AI 将为你创作精彩视频",
        readyToAnimate: "准备让图片动起来",
        uploadAndDescribe: "上传图片并描述动作，AI 将为你创作动态视频",
        createArtwork: "创作你的 AI 艺术作品",
        describeImagination: "描述你想象中的画面，AI 将为你绘制",
        styleConversion: "风格转换魔法",
        styleConversionDesc: "上传图片，选择艺术风格，一键转换",

        // Quick Examples
        quickExamples: "点击示例快速填充",
        catPlaying: "小猫玩耍",
        cosmosPlanet: "宇宙星球",
        cherryBlossom: "樱花飘落",
        dreamCastle: "梦幻城堡",
        cyberCity: "赛博城市",
        forestCabin: "森林小屋",

        // Progress and Time
        processing: "处理中...",
        elapsed: "已用时间",
        estimated: "预计剩余时间",

        // Character Related
        uploadCharacterVideo: "上传角色视频",
        characterVideoUrl: "视频 URL（推荐）",
        usePublicVideoUrl: "使用公开视频 URL",
        defaultTestVideo: "留空使用默认测试视频",
        orUploadLocal: "或上传本地视频（仅用于预览时间戳）",
        localVideoWarning: "本地视频无法被 API 访问，请使用上方的 URL 输入",
        characterTimeRange: "角色出现时间范围",
        timeRangeTip: "时间范围差值必须在 1-3 秒之间",
        createCharacterBtn: "创建角色",
        noCharacterCreated: "还没有创建角色",
        characterUsage: "角色使用说明",
        characterSelection: "角色选择",
        selectCreatedCharacter: "👇 请选择已创建的角色",
        recommended: "推荐",
        localCreatedCharacters: "从下拉列表选择本地创建的角色",
        twoUsageMethods: "两种使用方式：",
        usageMethod1: "在描述中直接使用 @username（如 @sama）",
        usageMethod2: "从下拉列表选择本地创建的角色",
        quickAddCharacter: "快速添加角色",

        // Default Characters
        sama: "@sama",
        cow: "奶牛",
        guangTouQiang: "光头强",
        xiongDa: "熊大",

        // Character Settings
        characterModel: "模型",
        duration: "时长",
        orientation: "方向",
        landscape: "横屏",
        portrait: "竖屏",
        generateCharacterVideo: "生成角色视频",
        readyToGenerateCharacterVideo: "准备生成角色视频",
        selectCharacterAndDescribe: "选择角色并输入场景描述，AI 将为你创作专属视频",
        createYourCharacter: "创建你的专属角色",
        characterCreationDesc: "上传角色视频，AI 将学习角色特征，让你可以在任意场景中使用该角色生成视频",
        createFirstCharacter: "创建第一个角色",

        // Notices
        importantNotes: "注意事项",
        noRealPerson: "不能使用真人视频",
        recommendAnime: "推荐动画/卡通角色",

        // Settings
        settingsTitle: "设置与使用指南",
        usageFlow: "本站使用流程",
        rechargeBalance: "充值余额",
        newUserTrial: "新用户可试用",
        loginSystem: "登录系统",
        getApiToken: "获取API令牌",
        usageFlowTip: "获取令牌后，请在下方填入以开始使用AI生成功能",
        apiConfiguration: "API 配置",
        apiKeyLabel: "API 密钥",
        apiKeyPlaceholder: "请输入您的API令牌，留空使用内置密钥",
        apiKeyInstructions: "API密钥获取步骤：\n1. 完成注册和登录\n2. 充值账户余额\n3. 在控制台生成API令牌\n4. 复制令牌到此处填写",
        configurationInstructions: "配置说明：\n• 统一使用 https://api.maynor1024.live/ API\n• 填写你的 API Key 即可开始使用\n• 留空将使用内置免费密钥",
        saveSettings: "保存设置",
        restoreDefaults: "恢复默认",

        // Help Menu
        viewGuideAgain: "重新查看引导",
        apiSettings: "API 设置",
        registerAccount: "注册账号",
        getApiTokenHelp: "获取 API 令牌",

        // Character Video Requirements
        characterVideoRequirements: "角色视频要求：",
        supportedFormats: "支持 MP4、AVI、MOV 格式",
        videoDuration: "视频时长建议 5-30 秒",
        noRealPersonWarning: "不能出现真人",
        characterVisible: "角色要清晰可见",
        recommendAnimated: "推荐动画、卡通、虚拟角色",
        timeSettingsTips: "时间设置技巧：",
        timeTip1: "选择 1-3 秒的清晰片段",
        timeTip2: "角色应该是正面或侧面特写",
        timeTip3: "避免模糊、快速移动的画面",
        timeTip4: "确保角色完整无遮挡",
        timeTip5: "在视频预览中找到最佳画面",
        characterUsageTips: "角色使用说明：",
        usageTip1: "从下拉列表选择已创建的角色",
        usageTip2: "每个角色可以重复使用",
        usageTip3: "角色将用于视频生成中的主体",
        usageTip4: "不同场景可使用相同角色",
        usageTip5: "没有角色？先去"创建角色"",
        characterDescriptionTips: "描述技巧：",
        descTip1: "详细描述场景、动作、环境",
        descTip2: "包含角色的表情和动作",
        descTip3: "指定背景和氛围",
        descTip4: "示例："开心的卡通角色在花园里跳舞"",
        descTip5: "越详细效果越好",

        // Time and Units
        seconds10: "10秒",
        seconds15: "15秒",
        seconds25: "25秒",
        startTime: "开始时间(秒)",
        endTime: "结束时间(秒)",

        // App Title
        appTitle: "Sora2 Imagine - AI 生成器",

        // Update Time
        lastUpdate: "最后更新",

        // Storyboard
        storyboardNav: "故事板",
        storyboardTitle: "故事板创作",
        scenes: "场景列表",
        addScene: "添加场景",
        scene: "场景",
        scenePromptPlaceholder: "描述场景内容，例如：日出时分的海边，海浪轻轻拍打沙滩...",
        generateStoryboard: "生成故事板",
        generatingStoryboard: "生成中...",
        storyboardComplete: "故事板完成",
        storyboardCompleteMsg: "故事板生成完成！",
        downloadAll: "下载全部",
        noVideosToDownload: "没有可下载的视频",
        enterAtLeastOneScene: "请至少添加一个场景描述",
        submitting: "提交中",
        completed: "完成",
        failed: "失败",

        // Batch Generation
        singleGeneration: "单个生成",
        batchGeneration: "批量生成",
        batchPrompts: "批量提示词",
        batchPromptsPlaceholder: "每行一个提示词，例如：\n一只可爱的小猫在草地上玩耍\n宇宙中一颗蓝色星球缓缓旋转\n樱花树下，花瓣随风飘落",
        batchPromptsHint: "每行一个提示词，最多支持 10 个",
        batchProgress: "批量任务进度",
        batchComplete: "批量完成",
        batchGenerateBtn: "批量生成视频",
        uploadImages: "上传��片",
        clickToUploadMultiple: "点击上传多张图片",
        commonPrompt: "通用动作描述",
        commonPromptPlaceholder: "描述图片应该如何动起来（将应用于所有图片）",
        generateBatchVideos: "批量生成视频",
        supportsFormats: "支持 JPG, PNG",
        maxImages: "最多支持10张图片",

        // Storyboard additional
        noScenesYet: "暂无场景",
        moveUp: "上移",
        moveDown: "下移",
        removeScene: "删除场景",
        characters: "字",
        noDescription: "无描述",
        waiting: "等待中",
        queuing: "排队中",
        generating: "生成中",
        retrying: "重试中",
        noVideosGenerated: "没有生成视频",
        download: "下载",
        copyLink: "复制链接",
        linkCopied: "链接已复制",
        copyFailed: "复制失败",
        downloadingAll: "开始下载全部视频",
        generationError: "生成出错",
        atLeastOneScene: "至少保留一个场景"
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
        editingImage: "Editing...",

        // Navigation
        videoTools: "Video Tools",
        imageTools: "Image Tools",
        characterTools: "Character Tools",
        others: "Others",
        textToVideoNav: "Text to Video",
        imageToVideoNav: "Image to Video",
        textToImageNav: "Text to Image",
        imageToImageNav: "Image to Image",
        createCharacter: "Create Character",
        characterVideo: "Character Video",
        myCharacters: "My Characters",
        settings: "Settings",
        help: "Help",
        quickStart: "Quick Start",
        limitedTimeFree: "Limited Time Free",
        quickStartStep1: "1. Enter description text",
        quickStartStep2: "2. Select model parameters",
        quickStartStep3: "3. Click generate button",

        // Page Titles
        textToVideoTitle: "Text to Video Generation",
        imageToVideoTitle: "Image to Video Generation",
        textToImageTitle: "Text to Image Generation",
        imageToImageTitle: "Image to Image",
        createCharacterTitle: "Create Character",
        characterVideoTitle: "Character Video Generation",
        myCharactersTitle: "My Characters",

        // Tips and Guidance
        descriptionTips: "Description Tips",
        descriptionSubject: "Describe subject: Who/what is in the scene",
        descriptionAction: "Describe action: What is happening",
        descriptionEnvironment: "Describe environment: Where and when",
        descriptionAtmosphere: "Describe atmosphere: Lighting, colors, mood",
        detailImprovesResults: "More detail = better results!",
        descriptionHint: "💡 Tip: More detailed descriptions give better results",
        enterVideoDescription: "Describe the video content you want",
        videoPromptExample: "e.g: A cute kitten playing on grass in sunny weather with butterflies flying around...",
        characterCount: "characters",

        // Model Options
        selectModel: "Select Model",
        sora2Landscape10s: "Sora-2 Landscape 10s (Recommended)",
        sora2Portrait10s: "Sora-2 Portrait 10s",
        sora2Landscape15s: "Sora-2-Pro Landscape 15s",
        sora2Portrait15s: "Sora-2-Pro Portrait 15s",
        sora2Landscape25s: "Sora-2-Pro Landscape 25s",
        sora2Portrait25s: "Sora-2-Pro Portrait 25s",

        // UI Elements
        generateBtn: "Generate Video",
        resetBtn: "Reset",
        downloadBtn: "Download",
        shareBtn: "Share",
        removeBtn: "Remove",
        closeBtn: "Close",

        // Status Messages
        readyToGenerate: "Ready to generate your first video",
        enterDetailedScene: "Enter detailed scene description above, AI will create amazing videos for you",
        readyToAnimate: "Ready to animate images",
        uploadAndDescribe: "Upload images and describe actions, AI will create dynamic videos for you",
        createArtwork: "Create your AI artwork",
        describeImagination: "Describe your imagination, AI will draw it for you",
        styleConversion: "Style Conversion Magic",
        styleConversionDesc: "Upload images, select artistic styles, one-click conversion",

        // Quick Examples
        quickExamples: "Click examples for quick fill",
        catPlaying: "Kitten Playing",
        cosmosPlanet: "Cosmos Planet",
        cherryBlossom: "Cherry Blossom",
        dreamCastle: "Dream Castle",
        cyberCity: "Cyber City",
        forestCabin: "Forest Cabin",

        // Progress and Time
        processing: "Processing...",
        elapsed: "Elapsed time",
        estimated: "Estimated remaining time",

        // Character Related
        uploadCharacterVideo: "Upload Character Video",
        characterVideoUrl: "Video URL (Recommended)",
        usePublicVideoUrl: "Use public video URL",
        defaultTestVideo: "Leave empty to use default test video",
        orUploadLocal: "Or upload local video (for timestamp preview only)",
        localVideoWarning: "Local videos cannot be accessed by API, please use the URL input above",
        characterTimeRange: "Character appearance time range",
        timeRangeTip: "Time range difference must be between 1-3 seconds",
        createCharacterBtn: "Create Character",
        noCharacterCreated: "No characters created yet",
        characterUsage: "Character Usage Instructions",
        characterSelection: "Character Selection",
        selectCreatedCharacter: "👇 Please select created character",
        recommended: "Recommended",
        localCreatedCharacters: "Select locally created characters from dropdown",
        twoUsageMethods: "Two usage methods:",
        usageMethod1: "Use @username directly in description (e.g @sama)",
        usageMethod2: "Select locally created characters from dropdown",
        quickAddCharacter: "Quick Add Character",

        // Default Characters
        sama: "@sama",
        cow: "Cow",
        guangTouQiang: "Logger Vick",
        xiongDa: "Briar",

        // Character Settings
        characterModel: "Model",
        duration: "Duration",
        orientation: "Orientation",
        landscape: "Landscape",
        portrait: "Portrait",
        generateCharacterVideo: "Generate Character Video",
        readyToGenerateCharacterVideo: "Ready to generate character video",
        selectCharacterAndDescribe: "Select character and enter scene description, AI will create exclusive video for you",
        createYourCharacter: "Create your exclusive character",
        characterCreationDesc: "Upload character video, AI will learn character features, allowing you to use this character in any scene",
        createFirstCharacter: "Create First Character",

        // Notices
        importantNotes: "Important Notes",
        noRealPerson: "Cannot use real person videos",
        recommendAnime: "Recommend animation/cartoon characters",

        // Settings
        settingsTitle: "Settings & User Guide",
        usageFlow: "Site Usage Flow",
        rechargeBalance: "Recharge Balance",
        newUserTrial: "New user trial available",
        loginSystem: "Login System",
        getApiToken: "Get API Token",
        usageFlowTip: "After getting token, please fill it below to start using AI generation features",
        apiConfiguration: "API Configuration",
        apiKeyLabel: "API Key",
        apiKeyPlaceholder: "Enter your API token, leave empty to use built-in key",
        apiKeyInstructions: "API Key Acquisition Steps:\n1. Complete registration and login\n2. Recharge account balance\n3. Generate API token in console\n4. Copy token to fill here",
        configurationInstructions: "Configuration Instructions:\n• Use unified API: https://api.maynor1024.live/\n• Fill in your API Key to start using\n• Leave empty to use built-in free key",
        saveSettings: "Save Settings",
        restoreDefaults: "Restore Defaults",

        // Help Menu
        viewGuideAgain: "View Guide Again",
        apiSettings: "API Settings",
        registerAccount: "Register Account",
        getApiTokenHelp: "Get API Token",

        // Character Video Requirements
        characterVideoRequirements: "Character Video Requirements:",
        supportedFormats: "Supports MP4, AVI, MOV formats",
        videoDuration: "Recommended video duration 5-30 seconds",
        noRealPersonWarning: "No real people allowed",
        characterVisible: "Character should be clearly visible",
        recommendAnimated: "Recommend animation, cartoon, virtual characters",
        timeSettingsTips: "Time Settings Tips:",
        timeTip1: "Select 1-3 seconds of clear footage",
        timeTip2: "Character should be front or side close-up",
        timeTip3: "Avoid blurry, fast-moving scenes",
        timeTip4: "Ensure character is complete and unobstructed",
        timeTip5: "Find best shots in video preview",
        characterUsageTips: "Character Usage Instructions:",
        usageTip1: "Select created characters from dropdown",
        usageTip2: "Each character can be reused",
        usageTip3: "Character will be used as main subject in video generation",
        usageTip4: "Different scenes can use same character",
        usageTip5: "No character? Go to 'Create Character' first",
        characterDescriptionTips: "Description Tips:",
        descTip1: "Describe scenes, actions, environment in detail",
        descTip2: "Include character expressions and actions",
        descTip3: "Specify background and atmosphere",
        descTip4: "Example: 'Happy cartoon character dancing in garden'",
        descTip5: "More detail = better results",

        // Time and Units
        seconds10: "10s",
        seconds15: "15s",
        seconds25: "25s",
        startTime: "Start time(s)",
        endTime: "End time(s)",

        // App Title
        appTitle: "Sora2 Imagine - AI Generator",

        // Update Time
        lastUpdate: "Last Updated",

        // Storyboard
        storyboardNav: "Storyboard",
        storyboardTitle: "Storyboard Creator",
        scenes: "Scene List",
        addScene: "Add Scene",
        scene: "Scene",
        scenePromptPlaceholder: "Describe the scene, e.g., Seaside at sunrise, waves gently lapping the shore...",
        generateStoryboard: "Generate Storyboard",
        generatingStoryboard: "Generating...",
        storyboardComplete: "Storyboard Complete",
        storyboardCompleteMsg: "Storyboard generation complete!",
        downloadAll: "Download All",
        noVideosToDownload: "No videos to download",
        enterAtLeastOneScene: "Please add at least one scene description",
        submitting: "Submitting",
        completed: "Completed",
        failed: "Failed",

        // Batch Generation
        singleGeneration: "Single Generation",
        batchGeneration: "Batch Generation",
        batchPrompts: "Batch Prompts",
        batchPromptsPlaceholder: "One prompt per line, e.g.:\nA cute kitten playing on grass\nA blue planet rotating in space\nCherry blossoms falling in the wind",
        batchPromptsHint: "One prompt per line, up to 10 prompts",
        batchProgress: "Batch Progress",
        batchComplete: "Batch Complete",
        batchGenerateBtn: "Generate Batch Videos",
        uploadImages: "Upload Images",
        clickToUploadMultiple: "Click to upload multiple images",
        commonPrompt: "Common Action Description",
        commonPromptPlaceholder: "Describe how images should animate (applied to all images)",
        generateBatchVideos: "Generate Batch Videos",
        supportsFormats: "Supports JPG, PNG",
        maxImages: "Up to 10 images",

        // Storyboard additional
        noScenesYet: "No scenes yet",
        moveUp: "Move Up",
        moveDown: "Move Down",
        removeScene: "Remove Scene",
        characters: "chars",
        noDescription: "No description",
        waiting: "Waiting",
        queuing: "Queuing",
        generating: "Generating",
        retrying: "Retrying",
        noVideosGenerated: "No videos generated",
        download: "Download",
        copyLink: "Copy Link",
        linkCopied: "Link copied",
        copyFailed: "Copy failed",
        downloadingAll: "Starting to download all videos",
        generationError: "Generation error",
        atLeastOneScene: "At least one scene required"
    },
    ja: {
        // Header
        appTitle: "Sora2 AI動画生成器",
        aiVideoFeatures: "AI動画機能",
        pricing: "料金プラン",
        startCreating: "動画作成を開始",
        login: "ログイン",

        // Main Title
        mainTitle: "AI 動画生成",
        mainSubtitle: "AI技術であなたのアイデアを素晴らしい動画に変換",

        // Generation Settings
        generationSettings: "生成設定",
        textToVideo: "テキストから動画",
        imageToVideo: "画像から動画",

        // Form Labels
        videoDescription: "動画の説明",
        videoPromptPlaceholder: "生成したい動画を詳しく説明してください...",
        uploadImage: "画像をアップロード",
        clickToUpload: "クリックして参照画像をアップロード",
        supportsFormats: "JPG, PNG, GIF対応",
        imagePromptPlaceholder: "画像をどのようにアニメーション化するか説明してください...",
        model: "モデル",
        generateVideo: "動画を生成",
        reset: "リセット",

        // Model Options
        soraImage: "Sora 画像生成 ($0.020)",
        soraVideo2: "Sora 動画 標準 ($0.020)",
        soraVideo2Landscape: "Sora 動画 横向き ($0.020)",
        soraVideo2Landscape15s: "Sora 動画 横向き 15秒 ($0.020)",
        soraVideo2Portrait: "Sora 動画 縦向き ($0.020)",
        soraVideo2Portrait15s: "Sora 動画 縦向き 15秒 ($0.020)",

        // Generated Video Panel
        generatedVideo: "生成された動画",
        enterPromptToGenerate: "プロンプトを入力して動画を生成",
        videoWillAppearHere: "生成された動画は処理後にここに表示されます。",
        enterDetailedDescription: "詳細な説明を入力して開始してください。",

        // Progress Messages
        initializing: "初期化中...",
        processingVideo: "動画処理中... 数分かかる場合があります",
        queuedForProcessing: "処理待ち...",
        status: "ステータス",
        waiting: "待機中",
        generating: "生成中...",

        // Video Player
        download: "ダウンロード",
        share: "共有",

        // Error Messages
        generationFailed: "生成失敗",
        tryAgain: "再試行",
        pleaseEnterDescription: "動画の説明を入力してください！",
        pleaseUploadImage: "参照画像をアップロードしてください！",
        pleaseUploadImageFile: "画像ファイルをアップロードしてください！",
        imageSizeLimit: "画像サイズは10MBを超えることはできません！",
        videoGenerationFailed: "動画の生成に失敗しました",
        videoGenerationTimeout: "動画の生成がタイムアウトしました。もう一���お試しください。",
        failedToCheckStatus: "動画ステータスの確認に失敗しました",

        // Navigation
        videoTools: "動画ツール",
        imageTools: "画像ツール",
        characterTools: "キャラクターツール",
        others: "その他",
        textToVideoNav: "テキストから動画",
        imageToVideoNav: "画像から動画",
        textToImageNav: "テキストから画像",
        imageToImageNav: "画像から画像",
        createCharacter: "キャラクター作成",
        characterVideo: "キャラクター動画",
        myCharacters: "マイキャラクター",
        settings: "設定",
        help: "ヘルプ",
        quickStart: "クイックスタート",
        limitedTimeFree: "期間限定無料",
        quickStartStep1: "1. 説明文を入力",
        quickStartStep2: "2. モデルパラメータを選択",
        quickStartStep3: "3. 生成ボタンをクリック",

        // Page Titles
        textToVideoTitle: "テキストから動画生成",
        imageToVideoTitle: "画像から動画生成",
        textToImageTitle: "テキストから画像生成",
        imageToImageTitle: "画像から画像",

        // Tips and Guidance
        selectModel: "モデルを選択",
        descriptionHint: "💡 ヒント：詳細な説明ほど良い結果が得られます",
        enterVideoDescription: "望む動画コンテンツを説明してください",
        videoPromptExample: "例: 日当たりの良い草地で可愛らしい子猫が遊び、蝶が周りを飛んでいます...",
        characterCount: "文字",

        // UI Elements
        generateBtn: "動画を生成",
        resetBtn: "リセット",
        downloadBtn: "ダウンロード",
        shareBtn: "共有",

        // App Title
        appTitle: "Sora2 Imagine - AI 生成器",

        // Update Time
        lastUpdate: "最終更新",

        // Storyboard
        storyboardNav: "ストーリーボード",
        storyboardTitle: "ストーリーボード作成",
        scenes: "シーンリスト",
        addScene: "シーンを追加",
        generateStoryboard: "ストーリーボードを生成",
        generatingStoryboard: "生成中...",
        storyboardComplete: "ストーリーボード完了",
        downloadAll: "すべてダウンロード",

        // Batch Generation
        singleGeneration: "単一生成",
        batchGeneration: "バッチ生成",
        batchPrompts: "バッチプロンプト",
        batchProgress: "バッチ進捗",
        batchComplete: "バッチ完了",
        batchGenerateBtn: "バッチ動画を生成",

        // Additional
        readyToGenerate: "最初の動画を生成する準備ができました",
        enterDetailedScene: "上に詳細なシーン説明を入力すると、AIが素晴らしい動画を作成します",
        processing: "処理中...",
        uploadImages: "画像をアップロード"
    },
    ko: {
        // Header
        appTitle: "Sora2 AI 동영상 생성기",
        aiVideoFeatures: "AI 동영상 기능",
        pricing: "가격 플랜",
        startCreating: "동영상 만들기 시작",
        login: "로그인",

        // Main Title
        mainTitle: "AI 동영상 생성",
        mainSubtitle: "AI 기술로 당신의 아이디어를 멋진 동영상으로 변환하세요",

        // Generation Settings
        generationSettings: "생성 설정",
        textToVideo: "텍스트를 동영상으로",
        imageToVideo: "이미지를 동영상으로",

        // Form Labels
        videoDescription: "동영상 설명",
        videoPromptPlaceholder: "생성할 동영상을 자세히 설명하세요...",
        uploadImage: "이미지 업로드",
        clickToUpload: "클릭하여 참조 이미지 업로드",
        supportsFormats: "JPG, PNG, GIF 지원",
        imagePromptPlaceholder: "이미지를 어떻게 애니메이션화할지 설명하세요...",
        model: "모델",
        generateVideo: "동영상 생성",
        reset: "재설정",

        // Video Player
        download: "다운로드",
        share: "공유",

        // Navigation
        videoTools: "동영상 도구",
        imageTools: "이미지 도구",
        characterTools: "캐릭터 도구",
        others: "기타",
        textToVideoNav: "텍스트를 동영상으로",
        imageToVideoNav: "이미지를 동영상으로",
        textToImageNav: "텍스트를 이미지로",
        imageToImageNav: "이미지를 이미지로",
        createCharacter: "캐릭터 생성",
        characterVideo: "캐릭터 동영상",
        myCharacters: "내 캐릭터",
        settings: "설정",
        help: "도움말",
        quickStart: "빠른 시작",
        limitedTimeFree: "기간 한정 무료",
        quickStartStep1: "1. 설명 텍스트 입력",
        quickStartStep2: "2. 모델 매개변수 선택",
        quickStartStep3: "3. 생성 버튼 클릭",

        // Page Titles
        textToVideoTitle: "텍스트를 동영상으로 생성",
        imageToVideoTitle: "이미지를 동영상으로 변환",

        selectModel: "모델 선택",
        generateBtn: "동영상 생성",
        resetBtn: "재설정",
        downloadBtn: "다운로드",
        shareBtn: "공유",
        appTitle: "Sora2 Imagine - AI 생성기",
        lastUpdate: "마지막 업데이트",
        processing: "처리 중...",
        descriptionHint: "💡 팁: 설명이 자세할수록 더 좋은 결과를 얻을 수 있습니다",
        characterCount: "자"
    },
    es: {
        // Header
        appTitle: "Generador de Videos AI Sora2",
        aiVideoFeatures: "Características de Video AI",
        pricing: "Planes de Precios",
        startCreating: "Comenzar a Crear Video",
        login: "Iniciar Sesión",

        // Main Title
        mainTitle: "Generación de Video con IA",
        mainSubtitle: "Transforma tus ideas en videos impresionantes con tecnología de IA",

        // Generation Settings
        generationSettings: "Configuración de Generación",
        textToVideo: "Texto a Video",
        imageToVideo: "Imagen a Video",

        // Form Labels
        videoDescription: "Descripción del Video",
        videoPromptPlaceholder: "Describe en detalle el video que deseas generar...",
        uploadImage: "Subir Imagen",
        clickToUpload: "Haz clic para subir imagen de referencia",
        supportsFormats: "Soporta JPG, PNG, GIF",
        imagePromptPlaceholder: "Describe cómo debe animarse la imagen...",
        model: "Modelo",
        generateVideo: "Generar Video",
        reset: "Restablecer",

        // Video Player
        download: "Descargar",
        share: "Compartir",

        // Navigation
        videoTools: "Herramientas de Video",
        imageTools: "Herramientas de Imagen",
        characterTools: "Herramientas de Personaje",
        others: "Otros",
        textToVideoNav: "Texto a Video",
        imageToVideoNav: "Imagen a Video",
        textToImageNav: "Texto a Imagen",
        imageToImageNav: "Imagen a Imagen",
        createCharacter: "Crear Personaje",
        characterVideo: "Video de Personaje",
        myCharacters: "Mis Personajes",
        settings: "Configuración",
        help: "Ayuda",
        quickStart: "Inicio Rápido",
        limitedTimeFree: "Gratis por Tiempo Limitado",
        quickStartStep1: "1. Ingrese texto de descripción",
        quickStartStep2: "2. Seleccione parámetros del modelo",
        quickStartStep3: "3. Haga clic en el botón generar",

        // Page Titles
        textToVideoTitle: "Generación de Texto a Video",
        imageToVideoTitle: "Conversión de Imagen a Video",

        selectModel: "Seleccionar Modelo",
        generateBtn: "Generar Video",
        resetBtn: "Restablecer",
        downloadBtn: "Descargar",
        shareBtn: "Compartir",
        appTitle: "Sora2 Imagine - Generador AI",
        lastUpdate: "Última Actualización",
        processing: "Procesando...",
        descriptionHint: "💡 Consejo: Descripciones más detalladas dan mejores resultados",
        characterCount: "caracteres"
    },
    fr: {
        // Header
        appTitle: "Générateur Vidéo IA Sora2",
        aiVideoFeatures: "Fonctions Vidéo IA",
        pricing: "Tarifs",
        startCreating: "Commencer à Créer",
        login: "Connexion",

        // Main Title
        mainTitle: "Génération de Vidéo par IA",
        mainSubtitle: "Transformez vos idées en vidéos incroyables grâce à l'IA",

        // Generation Settings
        generationSettings: "Paramètres de Génération",
        textToVideo: "Texte vers Vidéo",
        imageToVideo: "Image vers Vidéo",

        // Form Labels
        videoDescription: "Description de la Vidéo",
        videoPromptPlaceholder: "Décrivez en détail la vidéo que vous souhaitez générer...",
        uploadImage: "Télécharger une Image",
        clickToUpload: "Cliquez pour télécharger une image de référence",
        supportsFormats: "Supporte JPG, PNG, GIF",
        imagePromptPlaceholder: "Décrivez comment l'image doit être animée...",
        model: "Modèle",
        generateVideo: "Générer une Vidéo",
        reset: "Réinitialiser",

        // Video Player
        download: "Télécharger",
        share: "Partager",

        // Navigation
        videoTools: "Outils Vidéo",
        imageTools: "Outils Image",
        characterTools: "Outils Personnage",
        others: "Autres",
        textToVideoNav: "Texte vers Vidéo",
        imageToVideoNav: "Image vers Vidéo",
        textToImageNav: "Texte vers Image",
        imageToImageNav: "Image vers Image",
        createCharacter: "Créer un Personnage",
        characterVideo: "Vidéo de Personnage",
        myCharacters: "Mes Personnages",
        settings: "Paramètres",
        help: "Aide",
        quickStart: "Démarrage Rapide",
        limitedTimeFree: "Gratuit pour une Durée Limitée",
        quickStartStep1: "1. Entrez le texte de description",
        quickStartStep2: "2. Sélectionnez les paramètres du modèle",
        quickStartStep3: "3. Cliquez sur le bouton générer",

        selectModel: "Sélectionner un Modèle",
        generateBtn: "Générer une Vidéo",
        resetBtn: "Réinitialiser",
        downloadBtn: "Télécharger",
        shareBtn: "Partager",
        appTitle: "Sora2 Imagine - Générateur IA",
        lastUpdate: "Dernière Mise à Jour",
        processing: "Traitement...",
        descriptionHint: "💡 Astuce : Des descriptions plus détaillées donnent de meilleurs résultats",
        characterCount: "caractères"
    },
    de: {
        // Header
        appTitle: "Sora2 KI-Videogenerator",
        aiVideoFeatures: "KI-Videofunktionen",
        pricing: "Preise",
        startCreating: "Video Erstellen Starten",
        login: "Anmelden",

        // Main Title
        mainTitle: "KI-Videogenerierung",
        mainSubtitle: "Verwandeln Sie Ihre Ideen mit KI-Technologie in beeindruckende Videos",

        // Generation Settings
        generationSettings: "Generierungseinstellungen",
        textToVideo: "Text zu Video",
        imageToVideo: "Bild zu Video",

        // Form Labels
        videoDescription: "Videobeschreibung",
        videoPromptPlaceholder: "Beschreiben Sie detailliert das Video, das Sie generieren möchten...",
        uploadImage: "Bild Hochladen",
        clickToUpload: "Klicken Sie, um Referenzbild hochzuladen",
        supportsFormats: "Unterstützt JPG, PNG, GIF",
        imagePromptPlaceholder: "Beschreiben Sie, wie das Bild animiert werden soll...",
        model: "Modell",
        generateVideo: "Video Generieren",
        reset: "Zurücksetzen",

        // Video Player
        download: "Herunterladen",
        share: "Teilen",

        // Navigation
        videoTools: "Video-Tools",
        imageTools: "Bild-Tools",
        characterTools: "Charakter-Tools",
        others: "Andere",
        textToVideoNav: "Text zu Video",
        imageToVideoNav: "Bild zu Video",
        textToImageNav: "Text zu Bild",
        imageToImageNav: "Bild zu Bild",
        createCharacter: "Charakter Erstellen",
        characterVideo: "Charakter-Video",
        myCharacters: "Meine Charaktere",
        settings: "Einstellungen",
        help: "Hilfe",
        quickStart: "Schnellstart",
        limitedTimeFree: "Kostenlos für Begrenzte Zeit",
        quickStartStep1: "1. Beschreibungstext eingeben",
        quickStartStep2: "2. Modellparameter auswählen",
        quickStartStep3: "3. Generieren-Button klicken",

        selectModel: "Modell Auswählen",
        generateBtn: "Video Generieren",
        resetBtn: "Zurücksetzen",
        downloadBtn: "Herunterladen",
        shareBtn: "Teilen",
        appTitle: "Sora2 Imagine - KI-Generator",
        lastUpdate: "Letzte Aktualisierung",
        processing: "Verarbeitung...",
        descriptionHint: "💡 Tipp: Detailliertere Beschreibungen yielding bessere Ergebnisse",
        characterCount: "Zeichen"
    }
};

// Language configuration
const languageConfig = {
    zh: { name: '中文', flag: '🇨🇳', direction: 'ltr' },
    en: { name: 'English', flag: '🇺🇸', direction: 'ltr' },
    ja: { name: '日本語', flag: '🇯🇵', direction: 'ltr' },
    ko: { name: '한국어', flag: '🇰🇷', direction: 'ltr' },
    es: { name: 'Español', flag: '🇪🇸', direction: 'ltr' },
    fr: { name: 'Français', flag: '🇫🇷', direction: 'ltr' },
    de: { name: 'Deutsch', flag: '🇩🇪', direction: 'ltr' }
};

// Detect user's browser language
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];

    // Check if detected language is supported
    if (translations[langCode]) {
        return langCode;
    }

    // Default to English for unsupported languages
    return 'en';
}

// Language Management
class I18n {
    constructor() {
        // Try to get saved language, or detect from browser, or default to Chinese
        const savedLang = localStorage.getItem('language');
        this.currentLang = savedLang || detectBrowserLanguage() || 'zh';
        this.translations = translations;
        this.supportedLanguages = Object.keys(translations);
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            this.updatePageLanguage();
            this.updateMetaTags();
        }
    }

    getLanguageConfig(lang) {
        return languageConfig[lang] || languageConfig.en;
    }

    getSupportedLanguages() {
        return this.supportedLanguages.map(lang => ({
            code: lang,
            ...languageConfig[lang]
        }));
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
            } else if (element.tagName === 'TITLE') {
                element.textContent = translation;
            } else {
                // Check if element has icon or other children
                const icon = element.querySelector('i');
                if (icon && element.children.length > 0 && element.tagName !== 'OPTION') {
                    // Preserve icons and other elements, only update text nodes
                    const hasTextNodes = Array.from(element.childNodes).some(node =>
                        node.nodeType === Node.TEXT_NODE && node.textContent.trim()
                    );

                    if (hasTextNodes) {
                        // Update only text nodes
                        Array.from(element.childNodes).forEach(node => {
                            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                                node.textContent = ' ' + translation;
                            }
                        });
                    } else {
                        // If no text nodes, add translation after existing content
                        const existingHTML = element.innerHTML;
                        element.innerHTML = existingHTML + ' ' + translation;
                    }
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update page title if not already handled
        const titleElement = document.querySelector('title');
        if (titleElement && titleElement.getAttribute('data-i18n')) {
            titleElement.textContent = this.t(titleElement.getAttribute('data-i18n'));
        } else if (titleElement && !titleElement.getAttribute('data-i18n')) {
            titleElement.textContent = this.t('appTitle');
        }

        // Update language text display
        const currentLangText = document.getElementById('currentLangText');
        if (currentLangText) {
            currentLangText.textContent = this.currentLang === 'zh' ? '中文' : 'English';
        }

        // Update specific elements without data-i18n attributes
        this.updateStaticElements();

        // Update document language
        document.documentElement.lang = this.currentLang;

        // Dispatch event for dynamic content
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: this.currentLang }));
    }

    updateStaticElements() {
        // Handle special cases that can't be covered by data-i18n attributes
        // Character counter update - handle current count
        const charCounter = document.getElementById('promptCharCount');
        if (charCounter && !charCounter.textContent.match(/^\d+/)) {
            const currentText = charCounter.textContent;
            const count = currentText.match(/\d+/)?.[0] || '0';
            const unitText = this.t('characterCount');
            charCounter.textContent = count + ' ' + unitText;
        }
    }
}

// Create global instance
window.i18n = new I18n();

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.updatePageLanguage();
});