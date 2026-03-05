/**
 * 国际化支持
 * 管理中英文语言切换
 */

export class I18n {
    constructor() {
        this.currentLang = 'zh'; // 默认中文
        this.translations = {
            zh: {
                // 页面标题和导航
                pageTitle: '火柴棒等式求解器',
                themeToggle: '切换主题',
                
                // 说明文字
                instructionInput: '💡 在输入框中输入你的谜题，或者点击下方的等式进行分析。',
                instructionValid: '✅ 如果等式不成立，将显示所有可能的解。',
                instructionInvalid: '🎲 如果等式已经成立，将显示所有可能的变体（简单的谜题生成）。',
                
                // 模式选择
                selectMode: '🎨 选择模式',
                standardMode: '标准模式',
                handwrittenMode: '手写模式',
                standardDesc: '标准七段数码管显示，数字7在标准模式下使用3根火柴，x表示乘号',
                handwrittenDesc: '(手写模式)H：手写风格，9少下面一横，6少上面一横，4像旗子，1只需要1根火柴，0只需4根火柴，7只需2根火柴，11只需2根火柴',
                modeDescription: '<strong>标准模式</strong>：标准七段数码管显示，数字7在标准模式下使用3根火柴，x表示乘号<br><strong>手写模式(H)</strong>：手写风格，9少下面一横，6少上面一横，4像旗子，1只需要1根火柴，0只需4根火柴，7只需2根火柴，11只需2根火柴',
                
                // 示例和输入
                sampleProblems: '▸ 示例',
                inputEquation: '▸ 输入',
                selectMode: '▸ 模式',
                inputPlaceholder: '例如: 8+3-4=0',
                
                // 结果显示
                foundSolutions: '发现',
                solutions: '个解',
                possibleTransforms: '个可能的谜题变换',
                invalidTransforms: '个不成立的变换',
                noSolutions: '没有找到解',
                moreTransforms: '... 还有',
                moreTransformsEnd: '个变换',
                
                // 规则表
                conversionRules: '转换规则',
                rulesPageTitle: '▸ 规则',
                backButton: '◄ 返回',
                rulesDescription: '仅限移动一根火柴。下表列出了当前模式下所有合法的变换规则。',
                character: '字符',
                matchCount: '火柴数',
                selfTransform: '自身变换（移动一根）',
                addOne: '添加一根火柴得到...',
                removeOne: '移除一根火柴得到...',
                selfTransform2: '自身变换（移动两根）',
                addTwo: '添加两根火柴得到...',
                removeTwo: '移除两根火柴得到...',
                emptySpace: '空格',
                
                // 移动火柴数选择
                moveCount: '移动火柴数',
                oneMatch: '1根',
                twoMatches: '2根',
                musicOn: '开启音乐',
                musicOff: '关闭音乐',
                langToggle: '切换语言',
                game3d: '3D游戏',
                gameTitle: '🔥 火柴棒谜题挑战',
                gameLevel: '关卡',
                gameScore: '分数',
                gameMode: '模式',
                gameMove: '移动',
                gameDifficulty: '难度',
                gameAnswer: '你的答案：',
                gameSubmit: '提交答案',
                gameHint: '💡 获取提示',
                gameNewPuzzle: '🎲 新谜题',
                gameShowSolution: '👁️ 查看答案',
                gameAnswerPlaceholder: '例如: 1+2=3',
                gameInstruction: '移动 {n} 根火柴，使等式成立',
                gameModeStandard: '标准模式',
                gameModeHandwritten: '手写模式',
                gameMove1: '1 根',
                gameMove2: '2 根',
                gameDifficulties: [
                    'Lv1 三个个位数',
                    'Lv2 1个两位数',
                    'Lv3 2个两位数',
                    'Lv4 3个两位数',
                    'Lv5 四数参与运算',
                    'Lv6 含1个三位数',
                    'Lv7 四数参与运算（含两位数）',
                    'Lv8 一个三位数（含两位数）',
                ],
                gameNoPuzzle: '题库中没有可解题目，请调整规则或题库',
                gameEnterAnswer: '请输入答案',
                gameIllegalChar: '包含非法字符',
                gameInvalidEquation: '等式不成立',
                gameNeedModify: '需要修改火柴使等式成立',
                gameNotMatched: '未匹配到可行解，换个思路试试',
                gameCorrectBurning: '答对了！点燃火柴中...',
                gameNoSolution: '暂无可用解，尝试输入一个成立的等式',
                gameNoHint: '暂时没有提示',
                gameSolutionPrefix: '解法思路：',
                gameHintPrefix: '提示：',
                gameMethodUnknown: '规则方法：',
                gameMethod_transform: '移动 1 根：字符内部重排',
                gameMethod_move: '移动 1 根：从一个字符移到另一个字符',
                gameMethod_multiChar: '多字符模式转换（如 11 与 4）',
                gameMethod_transform2: '移动 2 根：字符内部重排',
                gameMethod_move2: '移动 2 根：跨字符移动',
                gameMethod_moveSubThenAdd: '先“移并减”再“加”',
                gameMethod_moveAddThenSub: '先“移并加”再“减”',
                gameMethod_removeRemoveAdd2: '移除两处后再新增两根',
                gameMethod_removeTwoAddTwo: '净变化 0 的双步组合',
                gameMethod_combinedMoves: '两次移动组合',
                gameMethod_transformTwice: '两次字符内部变换',
                gameMethod_transformAndMove: '内部变换 + 跨字符移动',
                backButtonTitle: '返回',
                solveBtn: '求解',
                // 搜索设置与过滤
                maxSearchLabel: '🔍 搜索上限',
                filterSignedBtn: '⚡ 过滤±解',
                filterSignedBtnOn: '✅ 已过滤±解',
                solveTime: '⏱',
                // 求解方法名称
                method_transform: '移位变换',
                method_move: '移动火柴',
                method_multiChar: '多字符',
                method_transform2: '双变换',
                method_move2: '双移动',
                method_moveSubThenAdd: '移去再添',
                method_moveAddThenSub: '移添再去',
                method_removeRemoveAdd2: '双去双添',
                method_removeTwoAddTwo: '去二添二',
                method_combinedMoves: '两次移动',
                method_transformTwice: '两次变换',
                method_transformAndMove: '变换+移动',
                method_unknown: '未知',
                // 方法详细描述
                desc_transform: '某位置移动1根火柴改变字符',
                desc_move: '移除1根再添加1根到另一位置',
                desc_multiChar: '多字符转换（如11→4）',
                desc_transform2: '某位置移动2根火柴改变字符',
                desc_move2: '移除2根再添加2根到另一位置',
                desc_moveSubThenAdd: '移除1根+移动1根，再添加1根',
                desc_moveAddThenSub: '添加1根+移动1根，再移除1根',
                desc_removeRemoveAdd2: '移除2根，再添加2根到同一位置',
                desc_removeTwoAddTwo: '移除2根，再分别添加1根到两个位置',
                desc_combinedMoves: '两次单根移动操作',
                desc_transformTwice: '两次单根位置变换',
                desc_transformAndMove: '变扢1根+移除1根+添加1根',
                // 规则表新列
                moveSubCol: '移动一根＆移除一根得到...',
                moveAddCol: '移动一根＆添加一根得到...',
                moveSubCol2: '移动两根＆移除两根得到...',
                moveAddCol2: '移动两根＆添加两根得到...',
                
                // 页脚
                footerTip: '💡 提示：数字',
                footerTip2: '在标准模式下使用3根火柴。',
                footerTip3: '表示乘号。',
                madeWith: 'Made with ❤️ |',
                originalProject: 'Original Project',
            },
            en: {
                // Page title and navigation
                pageTitle: 'Matchstick Puzzle Solver',
                themeToggle: 'Toggle Theme',
                
                // Instructions
                instructionInput: '💡 Enter your puzzle in the input box, or click on the equations below to analyze.',
                instructionValid: '✅ If the equation is invalid, all possible solutions will be shown.',
                instructionInvalid: '🎲 If the equation is already valid, all possible variations will be shown (simple puzzle generation).',
                
                // Mode selection
                selectMode: '🎨 Select Mode',
                standardMode: 'STANDARD MODE',
                handwrittenMode: 'HANDWRITTEN MODE',
                standardDesc: 'Seven-segment display, digit 7 uses 3 matchsticks in standard mode, x represents multiplication',
                handwrittenDesc: '(Handwritten Mode)H: Handwritten style, 9 without bottom bar, 6 without top bar, 4 like a flag, 1 needs only 1 stick, 0 needs only 4 sticks, 7 needs only 2 sticks, 11 needs only 2 sticks',
                modeDescription: '<strong>Standard Mode</strong>: Seven-segment display, digit 7 uses 3 matchsticks in standard mode, x represents multiplication<br><strong>Handwritten Mode(H)</strong>: Handwritten style, 9 without bottom bar, 6 without top bar, 4 like a flag, 1 needs only 1 stick, 0 needs only 4 sticks, 7 needs only 2 sticks, 11 needs only 2 sticks',
                
                // Samples and input
                sampleProblems: '▸ EXAMPLES',
                inputEquation: '▸ INPUT',
                selectMode: '▸ MODE',
                inputPlaceholder: 'e.g.: 8+3-4=0',
                
                // Results display
                foundSolutions: 'Found',
                solutions: 'solution(s)',
                possibleTransforms: 'possible puzzle variation(s)',
                invalidTransforms: 'invalid transformation(s)',
                noSolutions: 'No solutions found',
                moreTransforms: '... and',
                moreTransformsEnd: 'more transformation(s)',
                
                // Rules table
                conversionRules: 'CONVERSION RULES',
                rulesPageTitle: '▸ RULES',
                backButton: '◄ BACK',
                rulesDescription: 'Move only one matchstick. The table below lists all valid transformations in current mode.',
                character: 'Character',
                matchCount: 'Matches',
                selfTransform: 'Self Transform (move 1)',
                addOne: 'Add one matchstick to get...',
                removeOne: 'Remove one matchstick to get...',
                selfTransform2: 'Self Transform (move 2)',
                addTwo: 'Add two matchsticks to get...',
                removeTwo: 'Remove two matchsticks to get...',
                emptySpace: 'space',
                
                // Move count selection
                moveCount: 'Move Count',
                oneMatch: '1 Match',
                twoMatches: '2 Matches',
                musicOn: 'Enable Music',
                musicOff: 'Disable Music',
                langToggle: 'Switch Language',
                game3d: '3D Game',
                gameTitle: '🔥 Matchstick Puzzle Challenge',
                gameLevel: 'Level',
                gameScore: 'Score',
                gameMode: 'Mode',
                gameMove: 'Move',
                gameDifficulty: 'Difficulty',
                gameAnswer: 'Your Answer:',
                gameSubmit: 'Submit',
                gameHint: '💡 Hint',
                gameNewPuzzle: '🎲 New Puzzle',
                gameShowSolution: '👁️ Show Solution',
                gameAnswerPlaceholder: 'e.g.: 1+2=3',
                gameInstruction: 'Move {n} matchstick(s) to make the equation true',
                gameModeStandard: 'Standard',
                gameModeHandwritten: 'Handwritten',
                gameMove1: '1 stick',
                gameMove2: '2 sticks',
                gameDifficulties: [
                    'Lv1 Three single-digit numbers',
                    'Lv2 One two-digit number',
                    'Lv3 Two two-digit numbers',
                    'Lv4 Three two-digit numbers',
                    'Lv5 Four-number expression',
                    'Lv6 Includes one three-digit number',
                    'Lv7 Four numbers (includes two-digit)',
                    'Lv8 One three-digit (with two-digit)',
                ],
                gameNoPuzzle: 'No solvable puzzle found. Please adjust rules or difficulty.',
                gameEnterAnswer: 'Please enter an answer',
                gameIllegalChar: 'Contains illegal characters',
                gameInvalidEquation: 'The equation is not valid',
                gameNeedModify: 'You need to modify matchsticks to solve it',
                gameNotMatched: 'No valid solution matched. Try another idea.',
                gameCorrectBurning: 'Correct! Igniting matchsticks...',
                gameNoSolution: 'No available solution currently. Try a valid equation.',
                gameNoHint: 'No hint available right now',
                gameSolutionPrefix: 'Method: ',
                gameHintPrefix: 'Hint: ',
                gameMethodUnknown: 'Rule method: ',
                gameMethod_transform: 'Move 1: transform inside one character',
                gameMethod_move: 'Move 1: move from one character to another',
                gameMethod_multiChar: 'Multi-character conversion (e.g. 11 and 4)',
                gameMethod_transform2: 'Move 2: transform inside one character',
                gameMethod_move2: 'Move 2: move across characters',
                gameMethod_moveSubThenAdd: 'Move+Subtract first, then Add',
                gameMethod_moveAddThenSub: 'Move+Add first, then Subtract',
                gameMethod_removeRemoveAdd2: 'Remove two points then add two',
                gameMethod_removeTwoAddTwo: 'Zero-net-change two-step combo',
                gameMethod_combinedMoves: 'Combined two-step move',
                gameMethod_transformTwice: 'Two internal transforms',
                gameMethod_transformAndMove: 'Internal transform + cross move',
                backButtonTitle: 'Back',
                solveBtn: 'SOLVE',
                // Search settings & filter
                maxSearchLabel: '🔍 Search Limit',
                filterSignedBtn: '⚡ Filter ±',
                filterSignedBtnOn: '✅ Filtered ±',
                solveTime: '⏱',
                // Method names
                method_transform: 'Transform',
                method_move: 'Move',
                method_multiChar: 'Multi-Char',
                method_transform2: '2×Transform',
                method_move2: '2×Move',
                method_moveSubThenAdd: 'moveSub+Add',
                method_moveAddThenSub: 'moveAdd+Sub',
                method_removeRemoveAdd2: '2×Sub+2×Add',
                method_removeTwoAddTwo: 'Sub2+Add+Add',
                method_combinedMoves: '2×Move',
                method_transformTwice: '2×Transform',
                method_transformAndMove: 'Trans+Move',
                method_unknown: 'Unknown',
                // Method descriptions
                desc_transform: 'Move 1 matchstick at a position to change character',
                desc_move: 'Remove 1 then add 1 at another position',
                desc_multiChar: 'Multi-character transform (e.g. 11→4)',
                desc_transform2: 'Move 2 matchsticks at a position to change character',
                desc_move2: 'Remove 2 then add 2 at another position',
                desc_moveSubThenAdd: 'Remove 1 + move 1, then add 1',
                desc_moveAddThenSub: 'Add 1 + move 1, then remove 1',
                desc_removeRemoveAdd2: 'Remove 2, then add 2 at same position',
                desc_removeTwoAddTwo: 'Remove 2, then add 1 to each of two positions',
                desc_combinedMoves: 'Two single-stick move operations',
                desc_transformTwice: 'Two single-stick position transforms',
                desc_transformAndMove: 'Transform 1 + remove 1 + add 1',
                // Rules table new columns
                moveSubCol: 'Move 1 & Remove 1 to get...',
                moveAddCol: 'Move 1 & Add 1 to get...',
                moveSubCol2: 'Move 2 & Remove 2 to get...',
                moveAddCol2: 'Move 2 & Add 2 to get...',
                
                // Footer
                footerTip: '💡 Tip: Digit',
                footerTip2: 'uses 3 matchsticks in standard mode.',
                footerTip3: 'represents multiplication.',
                madeWith: 'Made with ❤️ |',
                originalProject: 'Original Project',
            }
        };
    }

    /**
     * 切换语言
     * @param {string} lang - 语言代码 ('zh' 或 'en')
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            // 不自动调用updatePageText，由各页面自己控制更新
            // this.updatePageText();
            // 保存到 localStorage
            localStorage.setItem('matchstick-lang', lang);
        }
    }

    /**
     * 获取当前语言
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * 获取翻译文本
     * @param {string} key - 翻译键
     */
    t(key) {
        return this.translations[this.currentLang][key] || key;
    }

    /**
     * 更新页面所有文本
     */
    updatePageText() {
        // 页面标题 - 仅在index.html中更新，不在rules.html中更新
        const title = document.querySelector('h1:not(.rules-main-title)');
        if (title && !title.classList.contains('rules-main-title')) {
            title.innerHTML = `🔥 ${this.t('pageTitle')}`;
        }

        // 主题切换按钮
        const themeToggle = document.querySelector('#theme-toggle');
        if (themeToggle) themeToggle.title = this.t('themeToggle');

        // 说明文字
        const instructions = document.querySelectorAll('.card p');
        if (instructions.length >= 3) {
            instructions[0].innerHTML = this.t('instructionInput');
            instructions[1].innerHTML = this.t('instructionValid');
            instructions[2].innerHTML = this.t('instructionInvalid');
        }

        // 模式选择
        const modeTitle = document.querySelector('.card h3');
        if (modeTitle) modeTitle.innerHTML = this.t('selectMode');

        // 示例问题标题
        const samplesTitle = document.querySelectorAll('.card h2')[0];
        if (samplesTitle) samplesTitle.textContent = this.t('sampleProblems');

        // 输入等式标题
        const inputTitle = document.querySelectorAll('.card h2')[1];
        if (inputTitle) inputTitle.textContent = this.t('inputEquation');

        // 输入框占位符
        const input = document.querySelector('#equation');
        if (input) input.placeholder = this.t('inputPlaceholder');

        // 规则表标题
        const rulesTitle = document.querySelectorAll('.card h2')[2];
        if (rulesTitle) rulesTitle.textContent = this.t('conversionRules');

        // 规则表描述
        const rulesDesc = document.querySelectorAll('.card p');
        const rulesDescIndex = rulesDesc.length - 2;
        if (rulesDesc[rulesDescIndex]) {
            rulesDesc[rulesDescIndex].innerHTML = this.t('rulesDescription');
        }

        // 更新规则表头
        const thead = document.querySelector('thead');
        if (thead) {
            thead.innerHTML = `
                <tr>
                    <th>${this.t('character')}</th>
                    <th>${this.t('matchCount')}</th>
                    <th>${this.t('selfTransform')}</th>
                    <th>${this.t('addOne')}</th>
                    <th>${this.t('removeOne')}</th>
                </tr>
            `;
        }

        // 触发应用重新渲染规则表
        if (window.app) {
            window.app.renderRulesTable();
        }
    }

    /**
     * 从 localStorage 加载保存的语言设置
     */
    loadSavedLanguage() {
        const saved = localStorage.getItem('matchstick-lang');
        if (saved && this.translations[saved]) {
            this.currentLang = saved;
        }
    }
}
