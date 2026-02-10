/**
 * 模式选择器组件
 * 用于切换不同的火柴棒显示模式
 */

export class ModeSelector {
    constructor(modes, currentMode, onModeChange) {
        this.modes = modes;
        this.currentMode = currentMode;
        this.onModeChange = onModeChange;
        this.element = null;
    }

    /**
     * 渲染模式选择器
     * @returns {HTMLElement}
     */
    render() {
        const container = document.createElement('div');
        container.className = 'mode-selector';
        container.style.display = 'flex';
        container.style.gap = 'var(--spacing-md)';
        container.style.flexWrap = 'wrap';

        this.modes.forEach(mode => {
            const button = this.createModeButton(mode);
            container.appendChild(button);
        });

        this.element = container;
        return container;
    }

    /**
     * 创建模式按钮
     * @param {Object} mode - 模式信息 {name, displayName, description}
     * @returns {HTMLElement}
     */
    createModeButton(mode) {
        const button = document.createElement('button');
        button.className = mode.name === this.currentMode ? 'btn btn-primary' : 'btn btn-secondary';
        button.dataset.mode = mode.name;
        button.title = mode.description; // 悬停提示显示描述
        button.textContent = mode.displayName;
        button.style.fontFamily = "'matchstick', 'Courier New', monospace";

        button.addEventListener('click', () => {
            this.switchMode(mode.name);
        });

        return button;
    }

    /**
     * 切换模式
     * @param {string} modeName - 模式名称
     */
    switchMode(modeName) {
        this.currentMode = modeName;
        this.updateButtons();
        if (this.onModeChange) {
            this.onModeChange(modeName);
        }
    }

    /**
     * 更新按钮状态
     */
    updateButtons() {
        if (!this.element) return;

        const buttons = this.element.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.dataset.mode === this.currentMode) {
                button.className = 'btn btn-primary';
            } else {
                button.className = 'btn btn-secondary';
            }
        });
    }

    /**
     * 获取当前模式
     * @returns {string}
     */
    getCurrentMode() {
        return this.currentMode;
    }
}
