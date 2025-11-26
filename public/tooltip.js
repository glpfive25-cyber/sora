// Tooltip functionality
(function() {
    'use strict';

    let activeTooltip = null;
    let hideTimeout = null;

    function initializeTooltips() {
        // 为所有tooltip图标添加事件监听器
        const tooltipIcons = document.querySelectorAll('.tooltip-icon');

        tooltipIcons.forEach(icon => {
            const wrapper = icon.closest('.tooltip-wrapper');
            const tooltip = wrapper.querySelector('.tooltip');

            if (!tooltip) return;

            // 鼠标悬停显示
            icon.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                showTooltip(tooltip);
            });

            icon.addEventListener('mouseleave', (e) => {
                e.stopPropagation();
                hideTooltip(tooltip);
            });

            // 点击也可以显示（移动端友好）
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                if (tooltip.classList.contains('show')) {
                    hideTooltip(tooltip);
                } else {
                    showTooltip(tooltip);
                }
            });
        });

        // 点击页面其他地方隐藏所有tooltip
        document.addEventListener('click', () => {
            hideAllTooltips();
        });

        // 为tooltip内容区域添加悬停保持显示
        const tooltips = document.querySelectorAll('.tooltip');
        tooltips.forEach(tooltip => {
            tooltip.addEventListener('mouseenter', () => {
                clearTimeout(hideTimeout);
            });

            tooltip.addEventListener('mouseleave', () => {
                hideTooltip(tooltip);
            });
        });
    }

    function showTooltip(tooltip) {
        // 隐藏其他所有tooltip
        hideAllTooltips();

        // 清除任何隐藏超时
        clearTimeout(hideTimeout);

        // 显示当前tooltip
        tooltip.classList.add('show');
        activeTooltip = tooltip;

        // 确保tooltip在屏幕范围内
        positionTooltip(tooltip);
    }

    function hideTooltip(tooltip) {
        hideTimeout = setTimeout(() => {
            tooltip.classList.remove('show');
            if (activeTooltip === tooltip) {
                activeTooltip = null;
            }
        }, 100); // 短暂延迟，让用户有时间移动到tooltip内容
    }

    function hideAllTooltips() {
        const tooltips = document.querySelectorAll('.tooltip.show');
        tooltips.forEach(tooltip => {
            tooltip.classList.remove('show');
        });
        activeTooltip = null;
        clearTimeout(hideTimeout);
    }

    function positionTooltip(tooltip) {
        // 检查tooltip是否会超出屏幕边界
        const rect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 如果右侧超出屏幕，显示在左侧
        if (rect.right > viewportWidth) {
            tooltip.classList.remove('right');
            tooltip.classList.add('left');
        }

        // 如果左侧超出屏幕，显示在右侧
        if (rect.left < 0) {
            tooltip.classList.remove('left');
            tooltip.classList.add('right');
        }

        // 如果顶部超出屏幕，显示在下方
        if (rect.top < 0) {
            tooltip.classList.remove('top');
            tooltip.classList.add('bottom');
        }

        // 如果底部超出屏幕，显示在上方
        if (rect.bottom > viewportHeight) {
            tooltip.classList.remove('bottom');
            tooltip.classList.add('top');
        }
    }

    // 当DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTooltips);
    } else {
        initializeTooltips();
    }

    // 导出给外部使用
    window.showTooltip = showTooltip;
    window.hideTooltip = hideTooltip;
    window.hideAllTooltips = hideAllTooltips;

})();