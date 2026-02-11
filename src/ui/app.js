/**
 * 主应用控制器
 * 整合所有模块，管理UI交互
 */

import { RuleManager } from '../core/rules.js';
import { MatchstickSolver } from '../core/solver.js';
import { Evaluator } from '../core/evaluator.js';
import { StandardMode } from '../modes/standard.js';
import { HandwrittenMode } from '../modes/handwritten.js';
import { MatchstickDisplay } from './components/MatchstickDisplay.js';
import { ModeSelector } from './components/ModeSelector.js';
import { ResultList } from './components/ResultList.js';
import { I18n } from '../utils/i18n.js';

export class App {
    constructor() {
        this.ruleManager = new RuleManager();
        this.solver = null;
        this.currentMode = 'standard';
        this.currentMoveCount = 1; // 移动火柴的数量
        this.currentTheme = 'light';
        this.useSVGDisplay = false; // SVG显示开关
        this.i18n = new I18n(); // 国际化支持
        this.debugMode = new URLSearchParams(window.location.search).get('debug') === '1'; // 调试模式
        this.solveTimer = null;

        // UI组件
        this.matchstickDisplay = new MatchstickDisplay();
        this.modeSelector = null;
        this.resultList = new ResultList(null, this.i18n); // 传递i18n
        this.resultList.debugMode = this.debugMode; // 设置debug模式

        // 测试数据
        this.testData = [
            ['8+3-4=0', 2, 15],
            ['6-5=17', 1, 18],
            ['5+7=2', 1, 8],
            ['6+4=4', 2, 1],
        ];

        // 手写模式示例（涵盖所有()H字符和多种运算符）
        this.handwrittenExamples = [
            '(1)H+(4)H=5',
            '(0)H+(6)H=(9)H',
            '2*3=(9)H',
        ];

        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        // 加载保存的语言设置
        this.i18n.loadSavedLanguage();
        
        // 注册所有模式
        this.registerModes();

        // 初始化求解器
        this.solver = new MatchstickSolver(this.ruleManager, 1);

        // 运行测试
        this.runTests();

        // 设置UI
        this.setupUI();

        // 加载第一个示例
        this.loadSample(this.testData[0][0]);
    }

    /**
     * 注册所有可用模式
     */
    registerModes() {
        const standardMode = new StandardMode();
        const handwrittenMode = new HandwrittenMode();

        this.ruleManager.registerMode(StandardMode.getName(), standardMode.build());
        this.ruleManager.registerMode(HandwrittenMode.getName(), handwrittenMode.build());

        // 设置默认模式
        this.ruleManager.switchMode('standard');
    }

    /**
     * 运行测试用例
     */
    runTests() {
        let passed = 0;
        let failed = 0;

        this.testData.forEach(([equation, expectedSolutions, expectedOthers]) => {
            const result = this.solver.solve(equation);

            if (result.solutions.length === expectedSolutions) {
                passed++;
            } else {
                failed++;
            }
        });
    }

    /**
     * 设置UI事件监听
     */
    setupUI() {
        // 输入框事件
        const equationInput = document.querySelector("#equation");
        if (equationInput) {
            equationInput.addEventListener('input', (e) => {
                // 支持小写h，自动转换为大写H
                let value = e.target.value;
                if (value.includes('h')) {
                    // 保持光标位置
                    const cursorPos = e.target.selectionStart;
                    value = value.replace(/h/g, 'H');
                    e.target.value = value;
                    e.target.setSelectionRange(cursorPos, cursorPos);
                }
                this.updateEquationPreview(value);
                this.scheduleSolve(value);
            });
        }

        // 示例列表
        this.renderSamples();

        // 模式切换器
        this.setupModeSelector();

        // 移动数量选择器
        this.setupMoveCountSelector();

        // 字符预览
        this.renderCharPreview();

        // 主题切换器
        this.setupThemeToggle();

        // 语言切换器
        this.setupLanguageToggle();

        // 音乐切换器
        this.setupMusicToggle();

        // 初始化页面文本
        this.updatePageText();

        // 规则页面按钮
        this.setupRulesButton();

        // 规则表（只在rules.html页面显示）
        if (document.querySelector('tbody')) {
            this.renderRulesTable();
        }
    }

    /**
     * 设置移动数量选择器
     */
    setupMoveCountSelector() {
        const buttons = document.querySelectorAll('.move-count-btn');
        buttons.forEach(btn => {
            // 设置初始文本和标题
            const textKey = btn.dataset.textKey;
            if (textKey) {
                btn.textContent = this.i18n.t(textKey);
                btn.title = this.i18n.t(textKey);
            }
            
            btn.addEventListener('click', (e) => {
                const count = parseInt(e.target.dataset.count);
                this.setMoveCount(count);
                
                // 更新按钮状态
                buttons.forEach(b => {
                    b.className = b === e.target ? 'btn btn-primary move-count-btn' : 'btn btn-secondary move-count-btn';
                });
            });
        });
    }

    /**
     * 设置移动火柴数量
     */
    setMoveCount(count) {
        this.currentMoveCount = count;
        this.solver = new MatchstickSolver(this.ruleManager, count);
        
        // 重新求解当前等式
        const equationInput = document.querySelector('#equation');
        if (equationInput && equationInput.value) {
            this.scheduleSolve(equationInput.value);
        }

        // 规则页需要更新表头与内容
        if (document.querySelector('tbody')) {
            this.updateRulesPageText();
            this.renderRulesTable();
        }
    }

    /**
     * 设置规则页面按钮
     */
    setupRulesButton() {
        const rulesBtn = document.querySelector('#show-rules');
        if (rulesBtn) {
            rulesBtn.addEventListener('click', () => {
                window.location.href = 'rules.html';
            });
        }
    }

    /**
     * 输入变化时延迟求解，避免UI阻塞
     */
    scheduleSolve(equation) {
        if (this.solveTimer) {
            clearTimeout(this.solveTimer);
        }

        this.solveTimer = setTimeout(() => {
            this.solve(equation);
            this.solveTimer = null;
        }, 30);
    }

    /**
     * 渲染示例列表
     */
    renderSamples() {
        const samplesContainer = document.querySelector("#samples");
        if (!samplesContainer) return;

        samplesContainer.innerHTML = '';
        const examples = this.currentMode === 'handwritten' 
            ? this.handwrittenExamples 
            : this.testData.map(([eq]) => eq);
        
        examples.forEach((equation) => {
            const li = document.createElement('li');
            li.className = 'result-item';
            li.dataset.solution = equation;
            li.style.cssText = 'padding: 6px 10px; border: 1px solid var(--border-color); background: var(--bg-tertiary); cursor: pointer;';
            
            // 使用SVG显示
            const svgDisplay = this.matchstickDisplay.createEquationDisplay(equation, this.currentMode === 'handwritten');
            li.appendChild(svgDisplay);
            li.addEventListener('click', () => this.loadSample(equation));
            
            samplesContainer.appendChild(li);
        });
    }

    /**
     * 创建可点击的列表项
     */
    createClickableItem(text) {
        const li = document.createElement('li');
        // 根据模式切换字体类
        li.className = this.currentMode === 'handwritten' ? 'result-item' : 'matchsticks result-item';
        // 显示x而不是*
        li.textContent = text.replace(/\*/g, 'x');
        li.addEventListener('click', () => this.loadSample(text));
        return li;
    }

    /**
     * 渲染字符预览
     */
    renderCharPreview() {
        const previewContainer = document.querySelector("#char-preview");
        if (!previewContainer) return;

        previewContainer.innerHTML = '';
        
        // 定义要显示的字符
        const chars = this.currentMode === 'handwritten' 
            ? ['(0)H', '(1)H', '2', '3', '(4)H', '5', '(6)H', '(7)H', '8', '(9)H', '+', '-', 'x', '/', '=', '(11)H']
            : ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', 'x', '/', '=', '11'];

        chars.forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.style.cssText = 'display: inline-block; padding: 4px 6px;';
            
            if (this.currentMode === 'handwritten') {
                // 手写模式使用SVG，统一大小
                if (char === '11' || char === '(11)H') {
                    // 11和(11)H需要特殊处理，显示两个1
                    const isHandwritten = char === '(11)H';
                    const svg1 = this.matchstickDisplay.createDigitSVG(isHandwritten ? '(1)H' : '1', false);
                    svg1.style.cssText = 'width: 16px; height: 24px; vertical-align: middle;';
                    const svg2 = this.matchstickDisplay.createDigitSVG(isHandwritten ? '(1)H' : '1', false);
                    svg2.style.cssText = 'width: 16px; height: 24px; vertical-align: middle; margin-left: -4px;';
                    charSpan.appendChild(svg1);
                    charSpan.appendChild(svg2);
                } else {
                    const svg = this.matchstickDisplay.createDigitSVG(char, false);
                    svg.style.cssText = 'width: 16px; height: 24px; vertical-align: middle;';
                    charSpan.appendChild(svg);
                }
            } else {
                // 标准模式也使用SVG
                if (char === '11') {
                    const svg1 = this.matchstickDisplay.createDigitSVG('1', false);
                    svg1.style.cssText = 'width: 16px; height: 24px; vertical-align: middle;';
                    const svg2 = this.matchstickDisplay.createDigitSVG('1', false);
                    svg2.style.cssText = 'width: 16px; height: 24px; vertical-align: middle; margin-left: -4px;';
                    charSpan.appendChild(svg1);
                    charSpan.appendChild(svg2);
                } else {
                    const svg = this.matchstickDisplay.createDigitSVG(char, false);
                    svg.style.cssText = 'width: 16px; height: 24px; vertical-align: middle;';
                    charSpan.appendChild(svg);
                }
            }
            
            previewContainer.appendChild(charSpan);
        });
    }

    /**
     * 更新输入框右侧的算式预览
     */
    updateEquationPreview(equation) {
        const previewContainer = document.querySelector("#equation-preview");
        if (!previewContainer) return;

        previewContainer.innerHTML = '';
        
        if (!equation) {
            previewContainer.style.opacity = '0.5';
            previewContainer.textContent = '预览';
            return;
        }

        previewContainer.style.opacity = '1';
        
        // 所有模式都使用SVG显示
        const display = this.matchstickDisplay.createEquationDisplay(equation, this.currentMode === 'handwritten');
        display.style.transform = 'scale(1)';
        previewContainer.appendChild(display);
    }

    /**
     * 加载示例
     */
    loadSample(equation) {
        const equationInput = document.querySelector("#equation");
        if (equationInput) {
            equationInput.value = equation;
            this.updateEquationPreview(equation);
            this.solve(equation);
        }
    }

    /**
     * 求解等式
     */
    solve(equation) {
        const isOK = Evaluator.evaluate(equation);
        const result = this.solver.solve(equation);

        this.renderResults(equation, isOK, result);
    }

    /**
     * 渲染结果
     */
    renderResults(equation, isOK, result) {
        const statusElement = document.querySelector("#status");
        if (!statusElement) return;

        statusElement.innerHTML = '';

        // 使用ResultList组件渲染结果
        const resultsDisplay = this.resultList.renderGroupedResults(result, isOK);
        statusElement.appendChild(resultsDisplay);
    }

    /**
     * 渲染规则表
     */
    renderRulesTable() {
        const tbody = document.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const { adds, subs, trans, adds2, subs2, trans2 } = this.ruleManager.getRules();
        const legals = this.ruleManager.getLegals();
        const useTrans = this.currentMoveCount === 1 ? trans : trans2;
        const useAdds = this.currentMoveCount === 1 ? adds : adds2;
        const useSubs = this.currentMoveCount === 1 ? subs : subs2;

        // 火柴数量映射
        const matchCounts = {
            '0': 6, '1': 2, '2': 5, '3': 5, '4': 4, '5': 5, '6': 6, '7': 3, '8': 7, '9': 6,
            '+': 2, '-': 1, '*': 2, '/': 2, '=': 2, ' ': 0, '11': 4,
            '(0)H': 4, '(1)H': 1, '(4)H': 3, '(6)H': 5, '(7)H': 2, '(9)H': 5, '(11)H': 2
        };

        // 定义显示顺序（按火柴数量升序）
        let displayOrder;
        if (this.currentMode === 'handwritten') {
            // 手写模式：按火柴数量排序
            displayOrder = [
                ' ', '-', '(1)H', '+', '(7)H', '/', '*', 'x', '=', '(11)H',
                '(4)H', '(0)H', '2', '3', '5',
                '(6)H', '(9)H', '8'
            ];
        } else {
            // 标准模式：按火柴数量排序
            displayOrder = [
                ' ', '-', '+', '/', '*', 'x', '=', '1',
                '7', '4', '11', '2', '3', '5',
                '0', '6', '9', '8'
            ];
        }

        displayOrder.forEach(char => {
            // 跳过不存在的字符
            if (!legals.includes(char)) return;

            const row = document.createElement('tr');
            row.className = 'fade-in';

            // 字符列
            const charCell = document.createElement('th');
            this.renderRuleTableCell(charCell, char, true);

            // 火柴数量列（不使用matchsticks字体）
            const countCell = document.createElement('td');
            countCell.textContent = matchCounts[char] || 0;

            // 自身变换列
            const transCell = document.createElement('td');
            this.renderRuleTableCharList(transCell, useTrans[char] || []);

            // 添加一根列
            const addsCell = document.createElement('td');
            this.renderRuleTableCharList(addsCell, useAdds[char] || []);

            // 移除一根列
            const subsCell = document.createElement('td');
            this.renderRuleTableCharList(subsCell, useSubs[char] || []);

            row.appendChild(charCell);
            row.appendChild(countCell);
            row.appendChild(transCell);
            row.appendChild(addsCell);
            row.appendChild(subsCell);

            tbody.appendChild(row);
        });
    }

    /**
     * 渲染规则表格中的单个字符单元格
     */
    renderRuleTableCell(cell, char, isHeader = false) {
        // 处理特殊字符显示
        let displayChar = char;
        if (char === ' ') {
            displayChar = this.i18n ? this.i18n.t('emptySpace') : '空格';
        } else if (char === '*') {
            displayChar = 'x';
        }
        
        // 字符列使用普通文字，继承表格字体大小
        cell.textContent = displayChar;
        cell.style.fontSize = 'inherit';
    }

    /**
     * 渲染规则表格中的字符列表（如转换规则列）
     */
    renderRuleTableCharList(cell, chars) {
        // 所有模式都用SVG，横向排列
        cell.style.cssText = '';
        cell.innerHTML = '';
        const charArray = [...chars];
        const container = document.createElement('div');
        container.style.cssText = 'display: flex; gap: 6px; flex-wrap: wrap; align-items: center;';
        charArray.forEach((c, index) => {
            if (index > 0) {
                const comma = document.createElement('span');
                comma.textContent = ',';
                comma.style.cssText = 'margin: 0 -2px; font-size: 12px;';
                container.appendChild(comma);
            }
            if (c === ' ') {
                // 空格显示为文字，使用较小字体
                const span = document.createElement('span');
                span.textContent = this.i18n ? this.i18n.t('emptySpace') : '空格';
                span.style.cssText = 'color: var(--text-secondary); font-size: 1.0rem;';
                container.appendChild(span);
            } else if (c === '11' || c === '(11)H') {
                // 11和(11)H需要特殊处理
                const isHandwritten = c === '(11)H';
                const svg1 = this.matchstickDisplay.createDigitSVG(isHandwritten ? '(1)H' : '1', false);
                svg1.style.cssText = 'width: 20px; height: 28px; flex-shrink: 0;';
                const svg2 = this.matchstickDisplay.createDigitSVG(isHandwritten ? '(1)H' : '1', false);
                svg2.style.cssText = 'width: 20px; height: 28px; flex-shrink: 0; margin-left: -6px;';
                container.appendChild(svg1);
                container.appendChild(svg2);
            } else {
                const svg = this.matchstickDisplay.createDigitSVG(c, false);
                svg.style.cssText = 'width: 20px; height: 28px; flex-shrink: 0;';
                container.appendChild(svg);
            }
        });
        cell.appendChild(container);
    }

    /**
     * 设置模式切换器
     */
    setupModeSelector() {
        const container = document.querySelector("#mode-selector");
        if (!container) return;

        const modes = [
            {
                name: 'standard',
                displayName: this.i18n.t('standardMode'),
                description: this.i18n.t('standardDesc')
            },
            {
                name: 'handwritten',
                displayName: this.i18n.t('handwrittenMode'),
                description: this.i18n.t('handwrittenDesc')
            }
        ];

        this.modeSelector = new ModeSelector(
            modes,
            this.currentMode,
            (mode) => this.switchMode(mode)
        );

        const element = this.modeSelector.render();
        container.innerHTML = '';
        container.appendChild(element);
    }

    /**
     * 切换模式
     */
    switchMode(mode) {
        this.currentMode = mode;
        this.ruleManager.switchMode(mode);
        this.solver = new MatchstickSolver(this.ruleManager, this.currentMoveCount);

        // 手写模式自动切换到SVG显示，标准模式使用字体显示
        if (mode === 'handwritten') {
            this.useSVGDisplay = true;
            this.resultList.setDisplayMode(true);
            this.resultList.setHandwrittenMode(true);
        } else {
            this.useSVGDisplay = false;
            this.resultList.setDisplayMode(false);
            this.resultList.setHandwrittenMode(false);
        }

        // 更新按钮状态
        const buttons = document.querySelectorAll("#mode-selector button");
        buttons.forEach((btn, index) => {
            const modes = this.ruleManager.getAvailableModes();
            if (modes[index] === mode) {
                btn.className = 'btn btn-primary';
            } else {
                btn.className = 'btn btn-secondary';
            }
        });

        // 重新渲染示例列表（更新字体）
        this.renderSamples();

        // 重新渲染字符预览
        this.renderCharPreview();

        // 重新渲染规则表（如果存在）
        if (document.querySelector('tbody')) {
            this.updateRulesPageText();
            this.renderRulesTable();
        }

        // 重新求解当前等式并更新预览
        const equationInput = document.querySelector("#equation");
        if (equationInput && equationInput.value) {
            this.solve(equationInput.value);
            this.updateEquationPreview(equationInput.value);
        }
    }

    /**
     * 设置主题切换
     */
    setupThemeToggle() {
        const themeToggle = document.querySelector("#theme-toggle");
        if (!themeToggle) return;

        themeToggle.addEventListener('click', () => {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', this.currentTheme);
            themeToggle.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        });
    }

    /**
     * 设置音乐切换
     */
    setupMusicToggle() {
        const musicToggle = document.querySelector('#music-toggle');
        const bgm = document.querySelector('#bgm');
        if (!musicToggle || !bgm) return;

        // 从 localStorage 读取音乐状态，默认关闭
        const musicEnabled = localStorage.getItem('music-enabled') === 'true';
        bgm.volume = 0.3; // 设置音量为30%

        // 设置初始状态
        if (musicEnabled) {
            musicToggle.textContent = '🎵';
            musicToggle.title = this.i18n.t('musicOff');
            // 用户交互后才能播放
            const playMusic = () => {
                bgm.play().catch(() => {});
                document.removeEventListener('click', playMusic);
            };
            document.addEventListener('click', playMusic, { once: true });
        } else {
            musicToggle.textContent = '🔇';
            musicToggle.title = this.i18n.t('musicOn');
            bgm.pause();
        }

        // 点击切换
        musicToggle.addEventListener('click', () => {
            if (bgm.paused) {
                bgm.play().catch(() => {});
                musicToggle.textContent = '🎵';
                musicToggle.title = this.i18n.t('musicOff');
                localStorage.setItem('music-enabled', 'true');
            } else {
                bgm.pause();
                musicToggle.textContent = '🔇';
                musicToggle.title = this.i18n.t('musicOn');
                localStorage.setItem('music-enabled', 'false');
            }
        });
    }

    /**
     * 设置语言切换
     */
    setupLanguageToggle() {
        const langToggle = document.querySelector("#lang-toggle");
        if (!langToggle) return;

        // 始终显示🌐图标
        langToggle.textContent = '🌐';
        langToggle.title = this.i18n.getCurrentLanguage() === 'zh' ? 'Switch to English' : '切换到中文';

        langToggle.addEventListener('click', () => {
            const newLang = this.i18n.getCurrentLanguage() === 'zh' ? 'en' : 'zh';
            this.i18n.setLanguage(newLang);
            langToggle.title = newLang === 'zh' ? 'Switch to English' : '切换到中文';
            
            // 更新页面文本（不包括标题）
            this.updatePageText();
            
            // 重新设置模式选择器以更新文本
            this.setupModeSelector();
            
            // 更新规则页面（如果当前在rules.html）
            this.updateRulesPageText();

            // 重新渲染当前结果
            const equationInput = document.querySelector("#equation");
            if (equationInput && equationInput.value) {
                this.solve(equationInput.value);
            }
        });

        // 初始加载时同步规则页文本（若存在）
        this.updateRulesPageText();
    }

    /**
     * 更新页面文本（不包括标题）
     */
    updatePageText() {
        // 更新INPUT标题
        const inputTitle = document.querySelector('.input-title');
        if (inputTitle) {
            inputTitle.textContent = this.i18n.t('inputEquation');
        }
        
        // 更新EXAMPLES标题
        const examplesTitle = document.querySelector('.examples-title');
        if (examplesTitle) {
            examplesTitle.textContent = this.i18n.t('sampleProblems');
        }
        
        // 更新MODE标题
        const modeTitle = document.querySelector('.mode-title');
        if (modeTitle) {
            modeTitle.textContent = this.i18n.t('selectMode');
        }
        
        // 更新RULES按钮
        const rulesBtn = document.querySelector('#show-rules');
        if (rulesBtn) {
            rulesBtn.textContent = this.i18n.getCurrentLanguage() === 'zh' ? '⚙ 规则' : '⚙ RULES';
        }
        
        // 更新输入框placeholder
        const input = document.querySelector('#equation');
        if (input) {
            input.placeholder = this.i18n.t('inputPlaceholder');
        }
        
        // 更新移动火柴数标签
        const moveCountLabel = document.querySelector('.move-count-label');
        if (moveCountLabel) {
            moveCountLabel.textContent = this.i18n.t('moveCount');
        }
        
        // 更新移动数按钮文本和标题
        const moveButtons = document.querySelectorAll('.move-count-btn');
        moveButtons.forEach(btn => {
            const textKey = btn.dataset.textKey;
            if (textKey) {
                btn.textContent = this.i18n.t(textKey);
                btn.title = this.i18n.t(textKey);
            }
        });
        
        // 更新带有 data-title-key 的按钮的悬停文字（通用）
        const titleButtons = document.querySelectorAll('[data-title-key]');
        titleButtons.forEach(btn => {
            const key = btn.dataset.titleKey;
            if (key) btn.title = this.i18n.t(key);
        });

        // 音乐按钮使用动态状态标题（播放/暂停）
        const musicToggle = document.querySelector('#music-toggle');
        const bgm = document.querySelector('#bgm');
        if (musicToggle && bgm) {
            musicToggle.title = bgm.paused ? this.i18n.t('musicOn') : this.i18n.t('musicOff');
        }
    }

    /**
     * 更新规则页面文本和表头
     */
    updateRulesPageText() {
        const rulesTitle = document.querySelector('.rules-main-title');
        if (!rulesTitle) return; // 不在规则页时直接返回

        rulesTitle.textContent = '■ ' + this.i18n.t('conversionRules');

        const backBtn = document.querySelector('.back-button');
        if (backBtn) {
            // 返回按钮在规则页使用图标显示，悬停显示本地化文字（使用 backButtonTitle 键）
            backBtn.title = this.i18n.t('backButtonTitle');
            // 保持按钮内部图标/文本不被覆盖 so icon remains
        }

        const rulesPageTitle = document.querySelector('.rules-page-title');
        if (rulesPageTitle) {
            rulesPageTitle.textContent = this.i18n.t('rulesPageTitle');
        }

        const thead = document.querySelector('thead');
        if (thead) {
            const selfTransformText = this.currentMoveCount === 1 ? this.i18n.t('selfTransform') : this.i18n.t('selfTransform2');
            const addText = this.currentMoveCount === 1 ? this.i18n.t('addOne') : this.i18n.t('addTwo');
            const removeText = this.currentMoveCount === 1 ? this.i18n.t('removeOne') : this.i18n.t('removeTwo');
            thead.innerHTML = `
                <tr>
                    <th>${this.i18n.t('character')}</th>
                    <th>${this.i18n.t('matchCount')}</th>
                    <th>${selfTransformText}</th>
                    <th>${addText}</th>
                    <th>${removeText}</th>
                </tr>
            `;
        }

        // 重新渲染模式选择器和规则表，确保文本与语言一致
        if (document.querySelector('#mode-selector')) {
            this.setupModeSelector();
        }
        if (document.querySelector('tbody')) {
            this.renderRulesTable();
        }

        // 同步规则页带 data-title-key 的按钮的悬停文字与移动数按钮文本
        const titleBtns = document.querySelectorAll('[data-title-key]');
        titleBtns.forEach(btn => {
            const key = btn.dataset.titleKey;
            if (key) btn.title = this.i18n.t(key);
            // 如果是移动数按钮，也更新显示文本
            if (btn.classList.contains('move-count-btn')) {
                const textKey = btn.dataset.textKey;
                if (textKey) btn.textContent = this.i18n.t(textKey);
            }
        });
    }
}


// 初始化应用
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
