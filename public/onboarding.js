// 用户引导系统
(function() {
    'use strict';

    const ONBOARDING_KEY = 'sora2-onboarding-completed';
    const FEATURE_TIPS_KEY = 'sora2-feature-tips-shown';

    // 引导步骤配置
    const onboardingSteps = [
        {
            id: 'welcome',
            title: '👋 欢迎使用 Sora2 Imagine',
            content: '这是一个强大的 AI 创作平台，支持文本生成视频、图像生成视频、文本生成图像等多种功能。',
            position: 'center',
            highlight: null
        },
        {
            id: 'sidebar',
            title: '📋 功能导航',
            content: '左侧边栏包含所有功能入口，点击可切换不同的创作模式。',
            position: 'right',
            highlight: '.sidebar'
        },
        {
            id: 'text-to-video',
            title: '🎬 文本转视频',
            content: '输入文字描述，AI 将为你生成精彩的视频内容。支持多种模型和时长选择。',
            position: 'right',
            highlight: '[data-mode="text-to-video"]'
        },
        {
            id: 'settings',
            title: '⚙️ API 设置',
            content: '点击设置按钮配置你的 API 密钥。留空即可使用内置免费 API，无需配置！如需高级功能，可以配置独立的 Pro API。',
            position: 'right',
            highlight: '#settingsBtn'
        },
        {
            id: 'complete',
            title: '🎉 准备就绪！',
            content: '现在你可以开始创作了。如需帮助，可随时点击右下角的帮助按钮或各功能的提示图标。',
            position: 'center',
            highlight: null
        }
    ];

    // 功能提示配置
    const featureTips = {
        'text-to-video': {
            title: '💡 文本转视频技巧',
            tips: [
                '描述越详细，生成效果越好',
                '包含场景、动作、光线等细节',
                '标准模型(10秒)成功率最高',
                '15秒版本生成时间较长'
            ]
        },
        'image-to-video': {
            title: '💡 图像转视频技巧',
            tips: [
                '上传清晰、高质量的图片',
                '描述图片应该如何动起来',
                '简单场景效果更稳定',
                '避免复杂的多人场景'
            ]
        },
        'text-to-image': {
            title: '💡 文本转图像技巧',
            tips: [
                '使用具体的形容词描述',
                '指定艺术风格和色调',
                '可以参考知名艺术家风格',
                '多次生成选择最佳结果'
            ]
        },
        'character-create': {
            title: '💡 创建角色技巧',
            tips: [
                '⚠️ 视频中不能出现真人',
                '选择角色清晰的片段',
                '时间范围控制在1-3秒',
                '推荐使用动画/卡通角色'
            ]
        }
    };

    let currentStep = 0;
    let overlay = null;
    let tooltip = null;

    // 检查是否需要显示引导
    function shouldShowOnboarding() {
        return !localStorage.getItem(ONBOARDING_KEY);
    }

    // 标记引导完成
    function markOnboardingComplete() {
        localStorage.setItem(ONBOARDING_KEY, 'true');
    }

    // 创建遮罩层
    function createOverlay() {
        overlay = document.createElement('div');
        overlay.id = 'onboarding-overlay';
        overlay.innerHTML = `
            <style>
                #onboarding-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    z-index: 10000;
                    transition: opacity 0.3s ease;
                }
                .onboarding-highlight {
                    position: relative;
                    z-index: 10001 !important;
                    box-shadow: 0 0 0 4px #8b5cf6, 0 0 20px rgba(139, 92, 246, 0.5) !important;
                    border-radius: 8px;
                }
                #onboarding-tooltip {
                    position: fixed;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border: 1px solid #8b5cf6;
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 400px;
                    width: 400px;
                    z-index: 10002;
                    box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);
                    animation: tooltipFadeIn 0.3s ease;
                    opacity: 1;
                    visibility: visible;
                }
                @keyframes tooltipFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .onboarding-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 12px;
                }
                .onboarding-content {
                    color: #a0aec0;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }
                .onboarding-progress {
                    display: flex;
                    gap: 6px;
                    margin-bottom: 16px;
                }
                .onboarding-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #4a5568;
                    transition: all 0.3s;
                }
                .onboarding-dot.active {
                    background: #8b5cf6;
                    width: 24px;
                    border-radius: 4px;
                }
                .onboarding-buttons {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }
                .onboarding-btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                .onboarding-btn-skip {
                    background: transparent;
                    color: #718096;
                }
                .onboarding-btn-skip:hover {
                    color: #fff;
                }
                .onboarding-btn-next {
                    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
                    color: #fff;
                }
                .onboarding-btn-next:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
                }
            </style>
        `;
        document.body.appendChild(overlay);
    }

    // 创建提示框
    function createTooltip() {
        tooltip = document.createElement('div');
        tooltip.id = 'onboarding-tooltip';
        document.body.appendChild(tooltip);
    }

    // 更新提示框内容和位置
    function updateTooltip(step) {
        console.log('[Onboarding] Updating tooltip for step', step);
        const stepData = onboardingSteps[step];
        console.log('[Onboarding] Step data:', stepData);
        
        // 生成进度点
        const dots = onboardingSteps.map((_, i) => 
            `<div class="onboarding-dot ${i === step ? 'active' : ''}"></div>`
        ).join('');

        const isLast = step === onboardingSteps.length - 1;
        
        tooltip.innerHTML = `
            <div class="onboarding-title">${stepData.title}</div>
            <div class="onboarding-content">${stepData.content}</div>
            <div class="onboarding-progress">${dots}</div>
            <div class="onboarding-buttons">
                ${!isLast ? '<button class="onboarding-btn onboarding-btn-skip" onclick="window.skipOnboarding()">跳过引导</button>' : ''}
                <button class="onboarding-btn onboarding-btn-next" onclick="window.nextOnboardingStep()">
                    ${isLast ? '开始使用 🚀' : '下一步 →'}
                </button>
            </div>
        `;

        // 定位提示框
        positionTooltip(stepData);
    }

    // 定位提示框
    function positionTooltip(stepData) {
        // 移除之前的高亮
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });

        // 重置样式
        tooltip.style.transform = '';
        tooltip.style.left = '';
        tooltip.style.top = '';
        tooltip.style.right = '';
        tooltip.style.bottom = '';

        if (stepData.highlight) {
            const target = document.querySelector(stepData.highlight);
            if (target) {
                target.classList.add('onboarding-highlight');
                
                // 使用 setTimeout 确保 DOM 已更新
                setTimeout(() => {
                    const rect = target.getBoundingClientRect();
                    const tooltipRect = tooltip.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    let left, top;
                    
                    if (stepData.position === 'right') {
                        left = rect.right + 20;
                        top = rect.top;
                        
                        // 检查是否超出右边界
                        if (left + tooltipRect.width > viewportWidth) {
                            left = rect.left - tooltipRect.width - 20;
                        }
                    } else if (stepData.position === 'left') {
                        left = rect.left - tooltipRect.width - 20;
                        top = rect.top;
                        
                        // 检查是否超出左边界
                        if (left < 20) {
                            left = rect.right + 20;
                        }
                    } else if (stepData.position === 'bottom') {
                        left = rect.left;
                        top = rect.bottom + 20;
                        
                        // 检查是否超出底部
                        if (top + tooltipRect.height > viewportHeight) {
                            top = rect.top - tooltipRect.height - 20;
                        }
                    }
                    
                    // 确保不超出顶部
                    if (top < 20) {
                        top = 20;
                    }
                    
                    // 确保不超出底部
                    if (top + tooltipRect.height > viewportHeight - 20) {
                        top = viewportHeight - tooltipRect.height - 20;
                    }
                    
                    // 确保不超出左边界
                    if (left < 20) {
                        left = 20;
                    }
                    
                    // 确保不超出右边界
                    if (left + tooltipRect.width > viewportWidth - 20) {
                        left = viewportWidth - tooltipRect.width - 20;
                    }
                    
                    tooltip.style.left = `${left}px`;
                    tooltip.style.top = `${top}px`;
                    
                    console.log('[Onboarding] Positioned tooltip at', { left, top, rect, tooltipRect });
                }, 10);
            } else {
                console.warn('[Onboarding] Target element not found:', stepData.highlight);
            }
        } else {
            // 居中显示
            tooltip.style.left = '50%';
            tooltip.style.top = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
        }
    }

    // 下一步
    window.nextOnboardingStep = function() {
        console.log('[Onboarding] Moving to next step from', currentStep);
        currentStep++;
        console.log('[Onboarding] New step:', currentStep, '/', onboardingSteps.length);
        
        if (currentStep >= onboardingSteps.length) {
            console.log('[Onboarding] Reached end, completing onboarding');
            completeOnboarding();
        } else {
            updateTooltip(currentStep);
        }
    };

    // 跳过引导
    window.skipOnboarding = function() {
        completeOnboarding();
    };

    // 完成引导
    function completeOnboarding() {
        markOnboardingComplete();
        
        // 移除高亮
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });
        
        // 淡出动画
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
        if (tooltip) {
            tooltip.style.opacity = '0';
            setTimeout(() => tooltip.remove(), 300);
        }

        // 显示功能提示
        setTimeout(showFeatureTip, 500);
    }

    // 显示功能提示卡片
    function showFeatureTip() {
        const currentMode = document.querySelector('.nav-item.active')?.getAttribute('data-mode');
        const tipData = featureTips[currentMode];
        
        if (!tipData) return;
        
        // 检查是否已显示过
        const shownTips = JSON.parse(localStorage.getItem(FEATURE_TIPS_KEY) || '[]');
        if (shownTips.includes(currentMode)) return;

        const tipCard = document.createElement('div');
        tipCard.id = 'feature-tip-card';
        tipCard.innerHTML = `
            <style>
                #feature-tip-card {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    background: linear-gradient(135deg, #1e3a5f 0%, #1a1a2e 100%);
                    border: 1px solid #3b82f6;
                    border-radius: 12px;
                    padding: 20px;
                    max-width: 320px;
                    z-index: 9999;
                    box-shadow: 0 10px 40px rgba(59, 130, 246, 0.2);
                    animation: slideUp 0.4s ease;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .tip-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 12px;
                }
                .tip-list {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 16px 0;
                }
                .tip-list li {
                    color: #94a3b8;
                    font-size: 0.875rem;
                    padding: 6px 0;
                    padding-left: 20px;
                    position: relative;
                }
                .tip-list li::before {
                    content: '✓';
                    position: absolute;
                    left: 0;
                    color: #10b981;
                }
                .tip-close {
                    background: transparent;
                    border: 1px solid #4b5563;
                    color: #9ca3af;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                    width: 100%;
                }
                .tip-close:hover {
                    background: #374151;
                    color: #fff;
                }
            </style>
            <div class="tip-title">${tipData.title}</div>
            <ul class="tip-list">
                ${tipData.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
            <button class="tip-close" onclick="this.parentElement.remove()">知道了</button>
        `;
        document.body.appendChild(tipCard);

        // 记录已显示
        shownTips.push(currentMode);
        localStorage.setItem(FEATURE_TIPS_KEY, JSON.stringify(shownTips));

        // 10秒后自动关闭
        setTimeout(() => {
            if (tipCard.parentElement) {
                tipCard.style.opacity = '0';
                tipCard.style.transform = 'translateY(20px)';
                setTimeout(() => tipCard.remove(), 300);
            }
        }, 10000);
    }

    // 启动引导
    function startOnboarding() {
        console.log('[Onboarding] Starting onboarding...');
        
        if (!shouldShowOnboarding()) {
            console.log('[Onboarding] Already completed, skipping');
            // 即使不显示引导，也监听模式切换显示功能提示
            setupModeSwitchListener();
            return;
        }

        console.log('[Onboarding] Creating overlay and tooltip');
        currentStep = 0;
        createOverlay();
        createTooltip();
        updateTooltip(currentStep);
        
        console.log('[Onboarding] Onboarding initialized at step', currentStep);
    }

    // 监听模式切换
    function setupModeSwitchListener() {
        document.querySelectorAll('.nav-item[data-mode]').forEach(item => {
            item.addEventListener('click', () => {
                setTimeout(showFeatureTip, 300);
            });
        });
    }

    // 重置引导（用于测试）
    window.resetOnboarding = function() {
        localStorage.removeItem(ONBOARDING_KEY);
        localStorage.removeItem(FEATURE_TIPS_KEY);
        location.reload();
    };

    // 手动触发引导
    window.startOnboarding = function() {
        localStorage.removeItem(ONBOARDING_KEY);
        startOnboarding();
    };

    // DOM 加载完成后启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startOnboarding);
    } else {
        startOnboarding();
    }

})();


// API 配置提醒
(function() {
    const API_REMINDER_KEY = 'sora2-api-reminder-shown';
    const API_CONFIG_KEY = 'sora2-api-config';

    function checkApiConfig() {
        // 如果已经显示过提醒，跳过
        if (localStorage.getItem(API_REMINDER_KEY)) return;
        
        // 检查是否已配置 API
        try {
            const config = JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}');
            if (config.apiKey && config.apiKey.trim()) return; // 已配置
        } catch (e) {}

        // 延迟显示提醒（等引导完成后）
        setTimeout(showApiReminder, 3000);
    }

    function showApiReminder() {
        // 如果正在显示引导，等待
        if (document.getElementById('onboarding-overlay')) {
            setTimeout(showApiReminder, 2000);
            return;
        }

        const reminder = document.createElement('div');
        reminder.id = 'api-reminder';
        reminder.innerHTML = `
            <style>
                #api-reminder {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    background: linear-gradient(135deg, #1e3a5f 0%, #1a1a2e 100%);
                    border: 1px solid #3b82f6;
                    border-radius: 12px;
                    padding: 20px;
                    max-width: 360px;
                    z-index: 9999;
                    box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);
                    animation: slideIn 0.4s ease;
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(100px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .reminder-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                .reminder-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .reminder-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #fff;
                }
                .reminder-content {
                    color: #94a3b8;
                    font-size: 0.875rem;
                    line-height: 1.6;
                    margin-bottom: 16px;
                }
                .reminder-buttons {
                    display: flex;
                    gap: 10px;
                }
                .reminder-btn {
                    flex: 1;
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    text-align: center;
                }
                .reminder-btn-primary {
                    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
                    color: #fff;
                }
                .reminder-btn-primary:hover {
                    transform: translateY(-2px);
                }
                .reminder-btn-secondary {
                    background: transparent;
                    border: 1px solid #4b5563;
                    color: #9ca3af;
                }
                .reminder-btn-secondary:hover {
                    background: #374151;
                }
                .reminder-close {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: transparent;
                    border: none;
                    color: #6b7280;
                    cursor: pointer;
                    font-size: 1rem;
                    padding: 4px;
                }
                .reminder-close:hover {
                    color: #fff;
                }
            </style>
            <button class="reminder-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="reminder-header">
                <div class="reminder-icon">
                    <i class="fas fa-key" style="color: #78350f; font-size: 1.25rem;"></i>
                </div>
                <div class="reminder-title">配置 API 以开始使用</div>
            </div>
            <div class="reminder-content">
                系统已内置免费 API，无需配置即可使用！如需使用自己的 API 密钥，点击设置按钮进行配置。支持高级双 API 配置。
            </div>
            <div class="reminder-buttons">
                <button class="reminder-btn reminder-btn-secondary" onclick="localStorage.setItem('${API_REMINDER_KEY}', 'true'); this.parentElement.parentElement.remove();">
                    稍后再说
                </button>
                <button class="reminder-btn reminder-btn-primary" onclick="localStorage.setItem('${API_REMINDER_KEY}', 'true'); document.getElementById('settingsBtn').click(); this.parentElement.parentElement.remove();">
                    立即配置
                </button>
            </div>
        `;
        document.body.appendChild(reminder);

        // 30秒后自动关闭
        setTimeout(() => {
            if (reminder.parentElement) {
                reminder.style.opacity = '0';
                reminder.style.transform = 'translateX(100px)';
                setTimeout(() => reminder.remove(), 300);
            }
        }, 30000);
    }

    // 页面加载后检查
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkApiConfig);
    } else {
        setTimeout(checkApiConfig, 1000);
    }
})();
