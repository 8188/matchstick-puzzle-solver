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
     * @param {string|{str,method}} solution - 解的字符串或对象
     * @param {number} index - 索引
     * @param {boolean} isSuccess - 是否为成功的解
     * @returns {HTMLElement}
     */
    createResultItem(solution, index, isSuccess) {
        // 兼容旧格式（string）和新格式（{str, method}）
        const solutionStr = typeof solution === 'string' ? solution : solution.str;
        const solutionMethod = typeof solution === 'string' ? null : solution.method;

        const li = document.createElement('li');
        li.className = 'result-item';
        li.dataset.solution = solutionStr;
        li.style.flexDirection = 'column';
        li.style.alignItems = 'flex-start';

        // 顶部：SVG 等式显示 + 方法徽章
        const topRow = document.createElement('div');
        topRow.style.cssText = 'display:flex;width:100%;align-items:center;gap:var(--spacing-sm);';

        const svgDisplay = this.matchstickDisplay.createEquationDisplay(solutionStr, this.useHandwritten);
        topRow.appendChild(svgDisplay);

        if (solutionMethod) {
            const badge = document.createElement('span');
            badge.className = 'method-badge';
            const methodKey = `method_${solutionMethod}`;
            badge.textContent = this.i18n ? this.i18n.t(methodKey) : solutionMethod;
            badge.title = solutionStr;
            topRow.appendChild(badge);
        }

        li.appendChild(topRow);

        // 底部：详细描述（如果有 method 信息）
        if (solutionMethod) {
            const desc = this.generateDescription(solutionStr, solutionMethod);
            if (desc) {
                const descDiv = document.createElement('div');
                descDiv.className = 'solution-desc';
                descDiv.textContent = desc;
                li.appendChild(descDiv);
            }
        }

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
     * @param {string|null} duration - 计算耗时（毫秒）
     * @returns {HTMLElement}
     */
    renderGroupedResults(results, isOriginalValid, duration = null) {
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
            const timeText = duration !== null
                ? ` <span style="color:var(--text-secondary);font-size:0.72rem;font-weight:normal;letter-spacing:0;">${this.i18n ? this.i18n.t('solveTime') : '⏱'} ${duration}ms</span>`
                : '';
            header.innerHTML = `▸ ${foundText} <span style="color: var(--success);">${results.solutions.length}</span> ${solutionsText}${timeText}`;
            header.style.fontSize = '0.9rem';
            solutionsSection.appendChild(header);

            const solutionsList = this.renderSolutions(results.solutions, true);
            solutionsSection.appendChild(solutionsList);

            container.appendChild(solutionsSection);
        } else {
            // 无解时也显示时间
            const noSolSection = document.createElement('div');
            noSolSection.className = 'card fade-in';
            const noSolText = this.i18n ? this.i18n.t('noSolutions') : '没有找到解';
            const timeText = duration !== null
                ? ` <span style="color:var(--text-secondary);font-size:0.72rem;"> ${this.i18n ? this.i18n.t('solveTime') : '⏱'} ${duration}ms</span>`
                : '';
            noSolSection.innerHTML = `<p style="color:var(--text-secondary);font-style:italic;">🔍 ${noSolText}${timeText}</p>`;
            container.appendChild(noSolSection);
        }
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
     * 生成详细描述（简化版，基于方法类型）
     * @param {string} solutionStr - 解的字符串
     * @param {string} method - 方法名称
     * @returns {string|null}
     */
    generateDescription(solutionStr, method) {
        const methodDescMap = {
            transform: this.i18n ? this.i18n.t('desc_transform') : '某位置移动1根火柴改变字符',
            move: this.i18n ? this.i18n.t('desc_move') : '移除1根再添加1根到另一位置',
            multiChar: this.i18n ? this.i18n.t('desc_multiChar') : '多字符转换（如11→4）',
            transform2: this.i18n ? this.i18n.t('desc_transform2') : '某位置移动2根火柴改变字符',
            move2: this.i18n ? this.i18n.t('desc_move2') : '移除2根再添加2根到另一位置',
            moveSubThenAdd: this.i18n ? this.i18n.t('desc_moveSubThenAdd') : '移除1根+移动1根，再添加1根',
            moveAddThenSub: this.i18n ? this.i18n.t('desc_moveAddThenSub') : '添加1根+移动1根，再移除1根',
            removeRemoveAdd2: this.i18n ? this.i18n.t('desc_removeRemoveAdd2') : '移除2根，再添加2根到同一位置',
            combinedMoves: this.i18n ? this.i18n.t('desc_combinedMoves') : '两次单根移动操作',
            transformTwice: this.i18n ? this.i18n.t('desc_transformTwice') : '两次单根位置变换',
            transformAndMove: this.i18n ? this.i18n.t('desc_transformAndMove') : '变换1根+移除1根+添加1根',
        };
        return methodDescMap[method] || null;
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
