/**
 * 测试脚本 - 验证重构后的代码（标准模式 + 手写模式）
 * 在Node.js环境中运行测试
 */

// 由于Node.js不支持浏览器的eval，我们需要模拟Evaluator
class TestEvaluator {
    static evaluate(arr) {
        if (arr.indexOf('=') <= -1) return false;

        try {
            // 移除手写标记()H，仅保留数字进行计算验证
            const filteredArr = arr.filter(char => char !== ' ');
            let expr = filteredArr.join("");
            
            // 替换手写字符为标准字符进行计算
            expr = expr.replace(/\(0\)H/g, '0')
                      .replace(/\(1\)H/g, '1')
                      .replace(/\(4\)H/g, '4')
                      .replace(/\(6\)H/g, '6')
                      .replace(/\(7\)H/g, '7')
                      .replace(/\(9\)H/g, '9')
                      .replace(/\(11\)H/g, '11')
                      .replace('=', '==')
                      .replace(/x/g, '*');

            if (/[+\-*/]{2,}/.test(expr)) {
                return false;
            }

            const [left, right] = expr.split('==');
            if (/^[+\-]/.test(left) || /^[+\-]/.test(right)) {
                return false;
            }

            // 使用Function代替eval（更安全）
            return new Function(`return ${expr}`)();
        } catch (x) {
            return false;
        }
    }
}

// 规则构建器
class RuleBuilder {
    constructor() {
        this.adds = {};
        this.subs = {};
        this.trans = {};
        this.adds2 = {}; // 添加两根火柴
        this.subs2 = {}; // 移除两根火柴
        this.trans2 = {}; // 移动两根火柴
        this.legals = "0123456789+-*/= ".split("").concat(['11']);

        this.legals.forEach(c => {
            this.adds[c] = new Set();
            this.subs[c] = new Set();
            this.trans[c] = new Set();
            this.adds2[c] = new Set();
            this.subs2[c] = new Set();
            this.trans2[c] = new Set();
        });
    }

    add(c1, c2) {
        this.adds[c1].add(c2);
        this.subs[c2].add(c1);
        return this;
    }

    transform(c1, c2) {
        if (!this.trans[c1]) this.trans[c1] = new Set();
        if (!this.trans[c2]) this.trans[c2] = new Set();
        this.trans[c1].add(c2);
        this.trans[c2].add(c1);
        return this;
    }

    add2(c1, c2) {
        if (!this.adds2[c1]) this.adds2[c1] = new Set();
        if (!this.subs2[c2]) this.subs2[c2] = new Set();
        this.adds2[c1].add(c2);
        this.subs2[c2].add(c1);
        return this;
    }

    transform2(c1, c2) {
        if (!this.trans2[c1]) this.trans2[c1] = new Set();
        if (!this.trans2[c2]) this.trans2[c2] = new Set();
        this.trans2[c1].add(c2);
        this.trans2[c2].add(c1);
        return this;
    }

    addMultiCharPattern(pattern) {
        if (!this.trans[pattern]) {
            this.trans[pattern] = new Set();
        }
        return this;
    }

    build() {
        return {
            adds: this.adds,
            subs: this.subs,
            trans: this.trans,
            adds2: this.adds2,
            subs2: this.subs2,
            trans2: this.trans2
        };
    }
}

// 标准模式
class StandardMode extends RuleBuilder {
    constructor() {
        super();
        this.buildRules();
    }

    buildRules() {
        this.add('-', '+');
        this.add('-', '=');
        this.add('0', '8');
        this.add('1', '7');
        this.add('3', '9');
        this.add('5', '9');
        this.add('5', '6');
        this.add('6', '8');
        this.add('9', '8');
        this.add(' ', '-');

        this.transform('1', '+');
        this.transform('0', '6');
        this.transform('0', '9');
        this.transform('3', '5');
        this.transform('3', '2');
        this.transform('6', '9');

        this.addMultiCharPattern('11');
        this.transform('11', '4');

        // 移动两根火柴的规则（根据标准规则表 Move 2 列）
        this.transform2('+', 'x');
        this.transform2('+', '/');
        this.transform2('+', '1');
        this.transform2('=', 'x');
        this.transform2('=', '/');
        this.transform2('=', '1');
        this.transform2('x', '1');
        this.transform2('/', '1');
        this.transform2('5', '2');
        
        // 添加两根火柴的规则（根据标准规则表 Add 2 列）
        this.add2(' ', '+');
        this.add2(' ', 'x');
        this.add2(' ', '/');
        this.add2(' ', '=');
        this.add2(' ', '1');
        this.add2('-', '7');
        this.add2('1', '4');
        this.add2('7', '3');
        this.add2('11', '0');
        this.add2('4', '9');
        this.add2('5', '8');
        this.add2('3', '8');
        this.add2('2', '8');

        return this;
    }
}

// 手写模式
class HandwrittenMode extends RuleBuilder {
    constructor() {
        super();
        // 添加手写字符到legals
        const handwrittenChars = ["(0)H", "(1)H", "(4)H", "(6)H", "(7)H", "(9)H", "(11)H"];
        this.legals = [...this.legals, ...handwrittenChars];
        
        // 为所有字符初始化集合
        this.legals.forEach(c => {
            if (!this.adds[c]) this.adds[c] = new Set();
            if (!this.subs[c]) this.subs[c] = new Set();
            if (!this.trans[c]) this.trans[c] = new Set();
        });
        
        this.buildRules();
    }

    buildRules() {
        // (0)H的规则
        this.add('(0)H', '(6)H');
        this.add('(0)H', '(9)H');

        // (1)H的规则
        this.transform('(1)H', '-');
        this.add('(1)H', '(7)H');
        this.add('(1)H', '(11)H');
        this.add('(1)H', '+');
        this.add(' ', '(1)H');

        // 2的规则
        this.transform('2', '3');

        // 3的规则
        this.transform('3', '2');
        this.transform('3', '5');
        this.transform('3', '(9)H');

        // (4)H的规则
        this.add('+', '(4)H');

        // 5的规则
        this.transform('5', '3');
        this.transform('5', '(6)H');
        this.transform('5', '(9)H');

        // (6)H的规则
        this.transform('(6)H', '5');
        this.transform('(6)H', '(9)H');
        this.add('(0)H', '(6)H');

        // (7)H的规则
        this.transform('(7)H', '(11)H');
        this.transform('(7)H', '+');
        this.transform('(7)H', '=');
        this.add('(1)H', '(7)H');
        this.add('-', '(7)H');

        // (9)H的规则
        this.transform('(9)H', '3');
        this.transform('(9)H', '5');
        this.transform('(9)H', '(6)H');
        this.add('(0)H', '(9)H');

        // +的规则
        this.transform('+', '(7)H');
        this.transform('+', '(11)H');
        this.transform('+', '=');
        this.add('+', '(4)H');
        this.add('(1)H', '+');
        this.add('-', '+');

        // -的规则
        this.transform('-', '(1)H');
        this.add('-', '(7)H');
        this.add('-', '+');
        this.add('-', '=');
        this.add(' ', '-');

        // *的规则
        this.transform('*', '/');

        // /的规则
        this.transform('/', '*');

        // =的规则
        this.transform('=', '+');
        this.transform('=', '(7)H');
        this.add('-', '=');

        // 空格的规则
        this.add(' ', '-');
        this.add(' ', '(1)H');

        // (11)H的规则
        this.addMultiCharPattern('(11)H');
        this.transform('(11)H', '(7)H');
        this.transform('(11)H', '+');
        this.add('(1)H', '(11)H');

        // ========== 移动2根火柴的规则 ==========
        // 为所有字符初始化2根火柴集合
        this.legals.forEach(c => {
            if (!this.adds2[c]) this.adds2[c] = new Set();
            if (!this.subs2[c]) this.subs2[c] = new Set();
            if (!this.trans2[c]) this.trans2[c] = new Set();
        });

        // SPACE -> 添加2根
        this.add2(' ', '*');
        this.add2(' ', '=');
        this.add2(' ', '+');
        this.add2(' ', '/');
        this.add2(' ', '(7)H');
        this.add2(' ', '(11)H');

        // (1)H -> 添加2根
        this.add2('(1)H', '(4)H');

        // - -> 添加2根
        this.add2('-', '(4)H');

        // * -> 自身变换2根
        this.transform2('*', '=');
        this.transform2('*', '+');
        this.transform2('*', '/');
        this.transform2('*', '(7)H');
        this.transform2('*', '(11)H');

        // = -> 自身变换2根 + 添加2根
        this.transform2('=', '*');
        this.transform2('=', '+');
        this.transform2('=', '/');
        this.transform2('=', '(7)H');
        this.transform2('=', '(11)H');
        this.add2('=', '(0)H');

        // + -> 自身变换2根
        this.transform2('+', '*');
        this.transform2('+', '=');
        this.transform2('+', '/');
        this.transform2('+', '(7)H');
        this.transform2('+', '(11)H');

        // / -> 自身变换2根
        this.transform2('/', '*');
        this.transform2('/', '=');
        this.transform2('/', '+');
        this.transform2('/', '(7)H');
        this.transform2('/', '(11)H');

        // (7)H -> 自身变换2根 + 添加2根
        this.transform2('(7)H', '*');
        this.transform2('(7)H', '=');
        this.transform2('(7)H', '+');
        this.transform2('(7)H', '/');
        this.transform2('(7)H', '(11)H');
        this.add2('(7)H', '(0)H');

        // (11)H -> 自身变换2根 + 添加2根
        this.transform2('(11)H', '*');
        this.transform2('(11)H', '=');
        this.transform2('(11)H', '+');
        this.transform2('(11)H', '/');
        this.transform2('(11)H', '(7)H');
        this.add2('(11)H', '(0)H');

        // 5 -> 自身变换2根 + 添加2根
        this.transform2('5', '2');
        this.add2('5', '8');

        // (9)H -> 自身变换2根 + 添加2根
        this.transform2('(9)H', '2');
        this.add2('(9)H', '8');

        // (6)H -> 自身变换2根 + 添加2根
        this.transform2('(6)H', '2');
        this.add2('(6)H', '8');

        // 3 -> 添加2根
        this.add2('3', '8');

        // 2 -> 自身变换2根 + 添加2根
        this.transform2('2', '5');
        this.transform2('2', '(6)H');
        this.transform2('2', '(9)H');
        this.add2('2', '8');

        return this;
    }
}

// 规则管理器
class RuleManager {
    constructor() {
        this.modes = new Map();
        this.modeConfigs = new Map();
        this.currentMode = 'standard';
        this.legals = "0123456789+-*/= ".split("");
    }

    registerMode(name, rules, legals = null) {
        this.modes.set(name, rules);
        if (legals) {
            this.modeConfigs.set(name, { legals });
        }
    }

    switchMode(name) {
        if (!this.modes.has(name)) {
            throw new Error(`Mode "${name}" not found`);
        }
        this.currentMode = name;
        const config = this.modeConfigs.get(name);
        if (config && config.legals) {
            this.legals = config.legals;
        }
    }

    getRules() {
        return this.modes.get(this.currentMode);
    }

    getLegals() {
        return this.legals;
    }
}

// 求解器
class MatchstickSolver {
    constructor(ruleManager, moveCount = 1) {
        this.ruleManager = ruleManager;
        this.moveCount = moveCount;
    }

    solve(equation) {
        // 获取所有可能的tokenize方式
        const tokenizeVariants = this.getAllTokenizeVariants(equation);
        
        // 对每种tokenize方式生成变换
        const allMutations = [];
        for (const arr of tokenizeVariants) {
            const mutations = this.mutate(arr);
            allMutations.push(...mutations);
        }

        let solutions = allMutations.filter(arr => TestEvaluator.evaluate(arr));
        const others = allMutations.filter(arr => !TestEvaluator.evaluate(arr));

        // 如果是移动2根模式，需要排除只移动1根就能达到的解
        if (this.moveCount === 2) {
            solutions = this.filterOutSingleMoveSolutions(tokenizeVariants[0], solutions);
        }

        // 去重并规范化
        const normalize = (str) => str.replace(/ /g, '');
        const originalNormalized = normalize(equation);
        
        const solutionStrings = solutions.map(m => m.join(""));
        const uniqueSolutions = solutionStrings.filter((str, idx, arr) => 
            arr.findIndex(s => normalize(s) === normalize(str)) === idx
        );
        
        // 过滤掉与原始输入相同的解
        const finalSolutions = uniqueSolutions.filter(str => normalize(str) !== originalNormalized);
        
        const otherStrings = others.map(m => m.join(""));
        const uniqueOthers = otherStrings.filter((str, idx, arr) => 
            arr.findIndex(s => normalize(s) === normalize(str)) === idx
        );

        return {
            solutions: finalSolutions,
            others: uniqueOthers,
            totalMutations: allMutations.length
        };
    }

    getAllTokenizeVariants(equation) {
        const variants = [];
        
        // 默认tokenize（贪婪匹配11）
        variants.push(this.tokenize(equation));
        
        // 检查是否包含连续的1（可能形成多个11）
        const hasConsecutiveOnes = /1{2,}/.test(equation);
        if (hasConsecutiveOnes) {
            const alternativeTokens = this.tokenizeAlternative(equation);
            if (JSON.stringify(alternativeTokens) !== JSON.stringify(variants[0])) {
                variants.push(alternativeTokens);
            }
        }
        
        return variants;
    }

    tokenizeAlternative(equation) {
        const tokens = [];
        let i = 0;
        
        while (i < equation.length) {
            if (equation.substring(i, i + 5) === '(11)H') {
                tokens.push('(11)H');
                i += 5;
                continue;
            }
            
            if (equation[i] === '(' && i + 3 < equation.length && 
                equation[i + 2] === ')' && equation[i + 3] === 'H') {
                tokens.push(equation.substring(i, i + 4));
                i += 4;
                continue;
            }
            
            // 对于数字1，先看后面是否还有1
            if (equation[i] === '1' && i + 1 < equation.length && equation[i + 1] === '1') {
                const nextNext = i + 2 < equation.length ? equation[i + 2] : '';
                if (nextNext === '1') {
                    // 3个连续1，先放单个1
                    tokens.push('1');
                    i++;
                } else {
                    // 2个连续1，组成11
                    tokens.push('11');
                    i += 2;
                }
            } else {
                tokens.push(equation[i]);
                i++;
            }
        }
        
        return tokens;
    }

    filterOutSingleMoveSolutions(originalArr, solutions) {
        // 获取移动1根火柴的所有可能解
        const wrappedArr = this.wrapWithSpaces(originalArr);
        const singleCharMutations = this.transforms(wrappedArr).concat(this.moves(wrappedArr));
        const multiCharMutations = this.multiCharTransforms(originalArr);
        const singleMoveMutations = [...singleCharMutations, ...multiCharMutations];
        const singleMoveSolutions = singleMoveMutations.filter(arr => TestEvaluator.evaluate(arr));
        
        // 规范化函数（去除空格）
        const normalize = (arr) => arr.join('').replace(/ /g, '');
        const singleMoveSolutionSet = new Set(singleMoveSolutions.map(normalize));
        
        // 过滤掉在单根移动解集中的解，以及包含双等号、双运算符的无效解
        return solutions.filter(solution => {
            const normalizedSolution = normalize(solution);
            // 检查是否包含双等号或连续运算符
            if (/==|\+\+|--|\*\*|\/\/|\+\*|\*\+|\+-|-\+|\+\/|\/\+|-\*|\*-|-\/|\/\-|\*\/|\/\*/.test(normalizedSolution)) {
                return false;
            }
            return !singleMoveSolutionSet.has(normalizedSolution);
        });
    }

    tokenize(equation) {
        const tokens = [];
        let i = 0;
        
        while (i < equation.length) {
            if (equation.substring(i, i + 5) === '(11)H') {
                tokens.push('(11)H');
                i += 5;
            } else if (equation.substring(i, i + 2) === '11') {
                tokens.push('11');
                i += 2;
            } else if (equation[i] === '(' && i + 3 < equation.length && 
                       equation[i + 2] === ')' && equation[i + 3] === 'H') {
                tokens.push(equation.substring(i, i + 4));
                i += 4;
            } else {
                tokens.push(equation[i]);
                i++;
            }
        }
        
        return tokens;
    }

    mutate(arr) {
        if (this.moveCount === 1) {
            const wrappedArr = this.wrapWithSpaces(arr);
            const singleCharMutations = this.transforms(wrappedArr).concat(this.moves(wrappedArr));
            const multiCharMutations = this.multiCharTransforms(arr);
            return [...singleCharMutations, ...multiCharMutations];
        } else if (this.moveCount === 2) {
            const wrappedArr = this.wrapWithSpaces(arr);
            const results = [];
            
            // 1. 移动两根火柴（trans2）
            results.push(...this.transforms2(wrappedArr));
            
            // 2. 移除两根 + 添加两根（moves2）
            results.push(...this.moves2(wrappedArr));
            
            // 3. 组合两次单根移动
            results.push(...this.combinedMoves(wrappedArr));
            
            // 4. 转换一根 + 转换一根（如 2→3 转换，同时 (6)H→(9)H 转换）
            results.push(...this.transformTwice(wrappedArr));
                        // 5. 转换一根 + 移除一根 + 添加一根
            results.push(...this.transformAndMove(wrappedArr));
                        return results;
        }
        throw new Error(`Unsupported move count: ${this.moveCount}`);
    }

    wrapWithSpaces(arr) {
        const result = [' '];
        for (const item of arr) {
            result.push(item);
            result.push(' ');
        }
        return result;
    }

    multiCharTransforms(arr) {
        const results = [];
        const { trans } = this.ruleManager.getRules();

        // 检测11
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === '1' && arr[i + 1] === '1') {
                if (trans['11']) {
                    for (const replacement of trans['11']) {
                        const newArr = [...arr];
                        newArr.splice(i, 2, replacement);
                        results.push(newArr);
                    }
                }
            }
        }

        // 检测(11)H
        for (let i = 0; i < arr.length - 4; i++) {
            if (arr[i] === '(' && arr[i+1] === '1' && arr[i+2] === '1' && 
                arr[i+3] === ')' && arr[i+4] === 'H') {
                if (trans['(11)H']) {
                    for (const replacement of trans['(11)H']) {
                        const newArr = [...arr];
                        newArr.splice(i, 5, replacement);
                        results.push(newArr);
                    }
                }
            }
        }

        return results;
    }

    replace(arr, index, replacement) {
        const res = [...arr];
        res[index] = replacement;
        return res;
    }

    transforms(arr) {
        const { trans } = this.ruleManager.getRules();
        return arr.flatMap((c, i) =>
            trans[c] ? [...trans[c]].map(re => this.replace(arr, i, re)) : []
        );
    }

    moves(arr) {
        const { subs } = this.ruleManager.getRules();
        return arr.flatMap((c, i) =>
            subs[c] ? [...subs[c]].flatMap(re => this.adding(this.replace(arr, i, re), i)) : []
        );
    }

    adding(arr, except) {
        const { adds } = this.ruleManager.getRules();
        return arr.flatMap((c, i) =>
            i === except ? [] : (adds[c] ? [...adds[c]].map(re => this.replace(arr, i, re)) : [])
        );
    }

    transforms2(arr) {
        const { trans2 } = this.ruleManager.getRules();
        if (!trans2) return [];
        return arr.flatMap((c, i) =>
            trans2[c] ? [...trans2[c]].map(re => this.replace(arr, i, re)) : []
        );
    }

    moves2(arr) {
        const { subs2 } = this.ruleManager.getRules();
        if (!subs2) return [];
        return arr.flatMap((c, i) =>
            subs2[c] ? [...subs2[c]].flatMap(re => this.adding2(this.replace(arr, i, re), i)) : []
        );
    }

    adding2(arr, except) {
        const { adds2 } = this.ruleManager.getRules();
        if (!adds2) return [];
        return arr.flatMap((c, i) =>
            i === except ? [] : (adds2[c] ? [...adds2[c]].map(re => this.replace(arr, i, re)) : [])
        );
    }

    combinedMoves(arr) {
        const results = [];
        const { subs, adds } = this.ruleManager.getRules();
        
        // 第一次移动
        arr.forEach((c, i) => {
            const subsSet = subs[c];
            if (!subsSet) return;
            
            [...subsSet].forEach(replacement1 => {
                const arr1 = this.replace(arr, i, replacement1);
                
                arr1.forEach((d, j) => {
                    if (i === j) return;
                    const addsSet = adds[d];
                    if (!addsSet) return;
                    
                    [...addsSet].forEach(replacement2 => {
                        const arr2 = this.replace(arr1, j, replacement2);
                        
                        // 第二次移动
                        arr2.forEach((e, k) => {
                            const subsSet2 = subs[e];
                            if (!subsSet2) return;
                            
                            [...subsSet2].forEach(replacement3 => {
                                const arr3 = this.replace(arr2, k, replacement3);
                                
                                arr3.forEach((f, m) => {
                                    if (k === m) return;
                                    const addsSet2 = adds[f];
                                    if (!addsSet2) return;
                                    
                                    [...addsSet2].forEach(replacement4 => {
                                        const arr4 = this.replace(arr3, m, replacement4);
                                        results.push(arr4);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
        
        return results;
    }

    transformTwice(arr) {
        const results = [];
        const { trans } = this.ruleManager.getRules();
        
        // 第一步：在位置 i 转换一根火柴
        arr.forEach((c, i) => {
            const transSet = trans[c];
            if (!transSet) return;
            
            [...transSet].forEach(replacement1 => {
                const arr1 = this.replace(arr, i, replacement1);
                
                // 第二步：在位置 j（j≠i）转换另一根火柴
                arr1.forEach((d, j) => {
                    if (i === j) return; // 不能在同一位置转换两次
                    const transSet2 = trans[d];
                    if (!transSet2) return;
                    
                    [...transSet2].forEach(replacement2 => {
                        const arr2 = this.replace(arr1, j, replacement2);
                        results.push(arr2);
                    });
                });
            });
        });
        
        return results;
    }

    transformAndMove(arr) {
        const results = [];
        const { trans, subs, adds } = this.ruleManager.getRules();
        
        // 第一步：在位置 i 转换一根火柴
        arr.forEach((c, i) => {
            const transSet = trans[c];
            if (!transSet) return;
            
            [...transSet].forEach(replacement1 => {
                const arr1 = this.replace(arr, i, replacement1);
                
                // 第二步：在位置 j 移除一根火柴
                arr1.forEach((d, j) => {
                    if (i === j) return;
                    const subsSet = subs[d];
                    if (!subsSet) return;
                    
                    [...subsSet].forEach(replacement2 => {
                        const arr2 = this.replace(arr1, j, replacement2);
                        
                        // 第三步：在位置 k 添加一根火柴
                        arr2.forEach((e, k) => {
                            if (k === i || k === j) return;
                            const addsSet = adds[e];
                            if (!addsSet) return;
                            
                            [...addsSet].forEach(replacement3 => {
                                const arr3 = this.replace(arr2, k, replacement3);
                                results.push(arr3);
                            });
                        });
                    });
                });
            });
        });
        
        return results;
    }

}

// 测试
console.log('🧪 开始测试重构后的代码...\n');

const ruleManager = new RuleManager();

// 标准模式测试
console.log('═══════════════════════════════════');
console.log('📋 标准模式测试');
console.log('═══════════════════════════════════\n');

const standardMode = new StandardMode();
ruleManager.registerMode('standard', standardMode.build());
ruleManager.switchMode('standard');

const solver = new MatchstickSolver(ruleManager, 1);

const standardTests = [
    ['8+3-4=0', 2],   // 三数运算（+、-）
    ['6-5=17', 1],    // 减法
    ['5+7=2', 1],     // 加法
    ['6+4=4', 2],     // 加法
    ['9/3=2', 2],     // 除法（9/3=3可变为6/3=2）
    ['3*3=6', 3],     // 乘法（3*3=9可变为2*3=6或 3*2=6）
];

let passed = 0;
let failed = 0;

standardTests.forEach(([equation, expectedSolutions]) => {
    const result = solver.solve(equation);
    const success = result.solutions.length === expectedSolutions;

    if (success) {
        passed++;
        console.log(`✅ ${equation} - 期望 ${expectedSolutions} 解，得到 ${result.solutions.length} 解`);
        if (result.solutions.length > 0) {
            console.log(`   解: ${result.solutions.join(', ')}`);
        }
    } else {
        failed++;
        console.log(`❌ ${equation} - 期望 ${expectedSolutions} 解，得到 ${result.solutions.length} 解`);
        if (result.solutions.length > 0) {
            console.log(`   解: ${result.solutions.join(', ')}`);
        }
    }
});

// 手写模式测试
console.log('\n═══════════════════════════════════');
console.log('✍️  手写模式测试');
console.log('═══════════════════════════════════\n');

const handwrittenMode = new HandwrittenMode();
ruleManager.registerMode('handwritten', handwrittenMode.build(), 
    "0123456789+-*/= (0)H(1)H(4)H(6)H(7)H(9)H(11)H".split(" "));
ruleManager.switchMode('handwritten');

const solver2 = new MatchstickSolver(ruleManager, 1);

const handwrittenTests = [
    // 加法测试（覆盖()H）
    ['(0)H+(6)H=(9)H', 3],
    ['2+(4)H=5', 1],
    ['(1)H+2=5', 2],
    ['(4)H+5=(9)H', 1],

    // 乘法测试（覆盖*符号）
    ['2*3=(9)H', 2],
    
    // 除法测试（覆盖/符号）  
    ['6/3=3', 2],
    
    // 三数运算（覆盖+、-符号）
    ['(9)H+3-2=5', 1],
];

handwrittenTests.forEach(([equation, expectedSolutions]) => {
    const result = solver2.solve(equation);
    const success = result.solutions.length >= expectedSolutions;

    if (success) {
        passed++;
        console.log(`✅ ${equation} - 期望至少 ${expectedSolutions} 解，得到 ${result.solutions.length} 解`);
        if (result.solutions.length > 0) {
            console.log(`   解: ${result.solutions.join(', ')}`);
        }
    } else {
        failed++;
        console.log(`❌ ${equation} - 期望至少 ${expectedSolutions} 解，得到 ${result.solutions.length} 解`);
    }
});

// 移动两根火柴的测试（标准模式）
console.log('\n═══════════════════════════════════');
console.log('🔥 标准模式 - 移动两根火柴测试');
console.log('═══════════════════════════════════\n');

ruleManager.switchMode('standard');
const solver3 = new MatchstickSolver(ruleManager, 2);

const doubleMoveTests = [
    // 测试 transform2 规则
    ['1+3=5', 3],      // 组合移动可得到有效解
    ['5+2=8', 2],      // 5<->2 或其他变换
    
    // 测试 add2 规则和组合移动
    ['3-2=0', 3],      // SPACE->1 等
    ['6-4=3', 1],      // 组合两次单根移动
    ['8-6=1', 1],      // 组合移动
    
    // 复杂测试
    ['5+5=8', 4],      // 多种可能的变换

    // 多位数测试
    ['111+1=0', 3],
    ['64+98=11', 1],
    ['41+29=78', 3],  // 44+29=73, 47+28=75, 41+38=79 (47+29=76被过滤,因为只需移动1根)
    ['79-39=17', 4],
];

doubleMoveTests.forEach(([equation, expectedSolutions]) => {
    const result = solver3.solve(equation);
    const success = result.solutions.length >= expectedSolutions;

    if (success) {
        passed++;
        console.log(`✅ ${equation} - 期望至少 ${expectedSolutions} 解，得到 ${result.solutions.length} 解`);
        if (result.solutions.length > 0) {
            console.log(`   解: ${result.solutions.join(', ')}`);
        }
    } else {
        failed++;
        console.log(`❌ ${equation} - 期望至少 ${expectedSolutions} 解，得到 ${result.solutions.length} 解`);
        if (result.solutions.length > 0) {
            console.log(`   解: ${result.solutions.join(', ')}`);
        }
    }
});

// 移动两根火柴的测试（手写模式）
console.log('\n═══════════════════════════════════');
console.log('🔥 手写模式 - 移动两根火柴测试');
console.log('═══════════════════════════════════\n');

ruleManager.switchMode('handwritten');
const solver4 = new MatchstickSolver(ruleManager, 2);

const handwrittenDoubleMoveTests = [
    // 测试 transform2 规则 (2个2根火柴字符互转)
    ['+/(7)H=3', 1],      // +可变换为*,=,/,(7)H,(11)H
    ['2+3=8', 2],         // 2可变换为5,(6)H,(9)H
    
    // 测试 add2 规则 (空格添加2根) - 调整为更简单的用例
    ['(1)H+2=5', 2],      // (1)H添加2根得到(4)H
    ['(9)H+2=8', 2],      // (9)H可以变换为其他数字
    
    // 测试复杂组合
    ['5+(7)H=8', 1],      // 多种可能的2根变换
    ['2*3=5', 2],         // 数字和运算符变换
    
    // 测试转换+转换组合（用户案例）
    ['2*3=(6)H', 3],      // 2→3(转换1根) + (6)H→(9)H(转换1根) = 3*3=(9)H
];

handwrittenDoubleMoveTests.forEach(([equation, expectedSolutions]) => {
    const result = solver4.solve(equation);
    const success = result.solutions.length >= expectedSolutions;

    if (success) {
        passed++;
        console.log(`✅ ${equation} - 期望至少 ${expectedSolutions} 解，得到 ${result.solutions.length} 解`);
        if (result.solutions.length > 0) {
            console.log(`   解: ${result.solutions.join(', ')}`);
        }
    } else {
        failed++;
        console.log(`❌ ${equation} - 期望至少 ${expectedSolutions} 解，得到 ${result.solutions.length} 解`);
        if (result.solutions.length > 0) {
            console.log(`   解: ${result.solutions.join(', ')}`);
        }
    }
});

const totalTests = standardTests.length + handwrittenTests.length + doubleMoveTests.length + handwrittenDoubleMoveTests.length;
console.log('\n═══════════════════════════════════');
console.log(`📊 总测试结果: ${passed}/${totalTests} 通过`);
console.log('═══════════════════════════════════');

if (failed > 0) {
    console.log(`\n❌ 失败: ${failed}/${totalTests}`);
    process.exit(1);
} else {
    console.log('\n🎉 所有测试通过！');
    console.log('✅ 标准模式（移动1根）: 正常工作');
    console.log('✅ 手写模式（移动1根）: 正常工作');
    console.log('✅ 标准模式（移动2根）: 正常工作');
    console.log('✅ 手写模式（移动2根）: 正常工作');
    process.exit(0);
}
