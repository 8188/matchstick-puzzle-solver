/**
 * 结果列表组件
 * 显示求解结果，支持SVG和字体两种显示方式
 */

import { MatchstickDisplay } from './MatchstickDisplay.js';

export class ResultList {
    constructor(onItemClick, i18n = null) {
        this.onItemClick = onItemClick;
        this.matchstickDisplay = new MatchstickDisplay();
        this.useSVGDisplay = false; // 默认使用字体显示
        this.useHandwritten = false; // 默认为标准模式
        this.i18n = i18n; // 国际化支持
        this.debugMode = false; // 调试模式，默认关闭
    }

    /**
     * 渲染解列表
     * @param {Array<string>} solutions - 解的数组
     * @param {boolean} isSuccess - 是否为成功的解
     * @returns {HTMLElement}
     */
    renderSolutions(solutions, isSuccess = true) {
        const container = document.createElement('div');
        container.className = 'result-container';

        if (solutions.length === 0) {
            const empty = document.createElement('p');
            empty.textContent = this.i18n ? this.i18n.t('noSolutions') : '没有找到解';
            empty.style.color = 'var(--text-secondary)';
            empty.style.fontStyle = 'italic';
            container.appendChild(empty);
            return container;
        }

        const list = document.createElement('ul');
        list.className = 'result-list';

        solutions.forEach((solution, index) => {
            const item = this.createResultItem(solution, index, isSuccess);
            list.appendChild(item);
        });

        container.appendChild(list);
        return container;
    }

    /**
     * 创建结果项
     * @param {string} solution - 解的字符串
     * @param {number} index - 索引
     * @param {boolean} isSuccess - 是否为成功的解
     * @returns {HTMLElement}
     */
    createResultItem(solution, index, isSuccess) {
        const li = document.createElement('li');
        li.className = 'result-item';
        li.dataset.solution = solution;

        // 所有模式都使用SVG显示
        const svgDisplay = this.matchstickDisplay.createEquationDisplay(solution, this.useHandwritten);
        li.appendChild(svgDisplay);

        // 如果是成功的解，可以设置特定颜色（如绿色），但不再添加徽章
        if (isSuccess) {
            li.style.color = 'var(--success)';
            li.style.fontWeight = '600';
        }

        // 添加动画延迟
        li.style.animationDelay = `${index * 0.05}s`;

        return li;
    }

    /**
     * 渲染分组结果
     * @param {Object} results - 结果对象 {solutions, others}
     * @param {boolean} isOriginalValid - 原等式是否成立
     * @returns {HTMLElement}
     */
    renderGroupedResults(results, isOriginalValid) {
        const container = document.createElement('div');
        container.className = 'grouped-results';

        // 解的部分
        if (results.solutions.length > 0) {
            const solutionsSection = document.createElement('div');
            solutionsSection.className = 'card fade-in';
            solutionsSection.style.marginBottom = 'var(--spacing-lg)';

            const header = document.createElement('h3');
            const foundText = this.i18n ? this.i18n.t('foundSolutions') : '发现';
            const solutionsText = this.i18n ? this.i18n.t('solutions') : '个解';
            header.innerHTML = `▸ ${foundText} <span style="color: var(--success);">${results.solutions.length}</span> ${solutionsText}`;
            header.style.fontSize = '0.9rem';
            solutionsSection.appendChild(header);

            const solutionsList = this.renderSolutions(results.solutions, true);
            solutionsSection.appendChild(solutionsList);

            container.appendChild(solutionsSection);
        }

        // 其他变换（仅在debug模式显示）
        if (results.others.length > 0 && this.debugMode) {
            const othersSection = document.createElement('div');
            othersSection.className = 'card fade-in';

            const header = document.createElement('h3');
            const transformText = this.i18n ? 
                (isOriginalValid ? this.i18n.t('possibleTransforms') : this.i18n.t('invalidTransforms')) :
                (isOriginalValid ? '个可能的谜题变换' : '个不成立的变换');
            header.innerHTML = `▸ ${results.others.length} ${transformText}`;
            header.style.fontSize = '0.9rem';
            othersSection.appendChild(header);

            // 只显示前20个
            const displayOthers = results.others.slice(0, 20);
            const othersList = this.renderSolutions(displayOthers, false);
            othersSection.appendChild(othersList);

            if (results.others.length > 20) {
                const more = document.createElement('p');
                const moreText = this.i18n ? 
                    `${this.i18n.t('moreTransforms')} ${results.others.length - 20} ${this.i18n.t('moreTransformsEnd')}` :
                    `... 还有 ${results.others.length - 20} 个变换`;
                more.textContent = moreText;
                more.style.cssText = "color: var(--text-secondary); font-style: italic; margin-top: var(--spacing-md); font-family: 'matchstick', 'Courier New', monospace;";
                othersSection.appendChild(more);
            }

            container.appendChild(othersSection);
        }

        return container;
    }

    /**
     * 切换显示模式
     * @param {boolean} useSVG - 是否使用SVG显示
     */
    setDisplayMode(useSVG) {
        this.useSVGDisplay = useSVG;
    }

    /**
     * 设置是否使用手写模式
     * @param {boolean} useHandwritten - 是否使用手写模式
     */
    setHandwrittenMode(useHandwritten) {
        this.useHandwritten = useHandwritten;
    }

    /**
     * 设置火柴棒颜色
     * @param {string} color - 颜色值
     */
    setMatchColor(color) {
        this.matchstickDisplay.setMatchColor(color);
    }
}
