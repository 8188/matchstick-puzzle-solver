/**
 * 火柴棒谜题求解器
 * 负责生成所有可能的变换并找到解
 */

import { Evaluator } from './evaluator.js';
import { tokenizeEquation } from './tokenizer.js';

export class MatchstickSolver {
    /**
     * @param {Object} ruleManager - 规则管理器实例
     * @param {number} moveCount - 移动火柴的数量（默认1根）
     */
    constructor(ruleManager, moveCount = 1) {
        this.ruleManager = ruleManager;
        this.moveCount = moveCount;
    }

    /**
     * 求解谜题
     * @param {string} equation - 等式字符串
     * @param {Object} options - 配置选项 {maxMutations: number, onProgress: function}
     * @returns {Object} {solutions: Array, others: Array}
     */
    solve(equation, options = {}) {
        const { maxMutations = 10000, onProgress = null } = options;
        
        // 获取所有可能的tokenize方式
        const tokenizeVariants = this.getAllTokenizeVariants(equation);
        
        // 对每种tokenize方式生成变换（带剪枝）
        const allMutations = [];
        for (const arr of tokenizeVariants) {
            const mutations = this.mutate(arr);
            // 剪枝：限制生成的变换数量
            if (allMutations.length + mutations.length > maxMutations) {
                const remaining = maxMutations - allMutations.length;
                if (remaining > 0) {
                    allMutations.push(...mutations.slice(0, remaining));
                }
                break;
            }
            allMutations.push(...mutations);
        }

        // 快速过滤：先检查基本有效性，再进行完整验证
        const validCandidates = allMutations.filter(arr => this.isQuickValid(arr));
        
        let solutions = validCandidates.filter(arr => Evaluator.evaluate(arr));
        const others = validCandidates.filter(arr => !Evaluator.evaluate(arr));

        // 如果是移动2根模式，需要排除只移动1根就能达到的解
        if (this.moveCount === 2) {
            solutions = this.filterOutSingleMoveSolutions(tokenizeVariants[0], solutions);
        }

        // 去重并规范化（移除空格差异）
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

    /**
     * 获取等式的所有可能tokenize方式
     * 用于处理类似 "111" 可以拆分为 ['11','1'] 或 ['1','11'] 的情况
     * @param {string} equation - 等式字符串
     * @returns {Array<Array<string>>}
     */
    getAllTokenizeVariants(equation) {
        const variants = [];
        
        // 默认tokenize（贪婪匹配11）
        variants.push(tokenizeEquation(equation));
        
        // 检查是否包含连续的1（可能形成多个11）
        // 例如 "111" 除了 ['11','1'] 还可以是 ['1','11']
        const hasConsecutiveOnes = /1{2,}/.test(equation);
        if (hasConsecutiveOnes) {
            // 生成备选tokenize：优先匹配单个字符，延迟匹配11
            const alternativeTokens = this.tokenizeAlternative(equation);
            if (JSON.stringify(alternativeTokens) !== JSON.stringify(variants[0])) {
                variants.push(alternativeTokens);
            }
        }
        
        return variants;
    }

    /**
     * 备选tokenize策略：从右向左匹配11
     * @param {string} equation - 等式字符串
     * @returns {Array<string>}
     */
    tokenizeAlternative(equation) {
        const tokens = [];
        let i = 0;
        
        while (i < equation.length) {
            // (11)H
            if (equation.substring(i, i + 5) === '(11)H') {
                tokens.push('(11)H');
                i += 5;
                continue;
            }
            
            // (数字)H
            if (equation[i] === '(' && i + 3 < equation.length && 
                equation[i + 2] === ')' && equation[i + 3] === 'H') {
                tokens.push(equation.substring(i, i + 4));
                i += 4;
                continue;
            }
            
            // 对于数字1，先看后面是否还有1，如果有就跳过当前，让后面组成11
            if (equation[i] === '1' && i + 1 < equation.length && equation[i + 1] === '1') {
                // 向前看：如果前一个token不是1，则当前1和下一个1组成11
                // 但如果这会导致后面只剩一个1，则先放单个1
                const nextNext = i + 2 < equation.length ? equation[i + 2] : '';
                if (nextNext === '1') {
                    // 有3个连续的1，先放单个1
                    tokens.push('1');
                    i++;
                } else {
                    // 只有2个连续的1，组成11
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

    /**
     * 过滤掉只需移动1根火柴就能达到的解
     * @param {Array<string>} originalArr - 原始数组
     * @param {Array<Array<string>>} solutions - 所有解
     * @returns {Array<Array<string>>}
     */
    filterOutSingleMoveSolutions(originalArr, solutions) {
        // 获取移动1根火柴的所有可能解
        const singleMoveMutations = this.mutateSingle(originalArr);
        const singleMoveSolutions = singleMoveMutations.filter(arr => Evaluator.evaluate(arr));
        
        // 规范化函数（去除空格）
        const normalize = (arr) => arr.join('').replace(/ /g, '');
        const singleMoveSolutionSet = new Set(singleMoveSolutions.map(normalize));
        
        // 过滤掉在单根移动解集中的解，以及包含双等号、双运算符的无效解
        return solutions.filter(solution => {
            const normalizedSolution = normalize(solution);
            
            // 检查无效的连续运算符（使用与 isQuickValid 相同的逻辑）
            // 允许=+和=-（用于等号后的正数/负数）
            // 允许表达式开头的+和-
            const withoutValidPatterns = normalizedSolution
                .replace(/^[+\-]/, 'N')  // 移除开头的+/-
                .replace(/=[+\-]/g, '=N');  // 移除=+和=-
            
            // 现在检查是否有任何连续运算符或双等号
            if (/==|[+\-*/=][+\-*/=]/.test(withoutValidPatterns)) {
                return false;
            }
            
            return !singleMoveSolutionSet.has(normalizedSolution);
        });
    }

    /**
     * 生成所有可能的变换
     * @param {Array<string>} arr - 字符数组
     * @returns {Array<Array<string>>}
     */
    mutate(arr) {
        if (this.moveCount === 1) {
            return this.mutateSingle(arr);
        } else if (this.moveCount === 2) {
            return this.mutateDouble(arr);
        }
        throw new Error(`Unsupported move count: ${this.moveCount}`);
    }

    /**
     * 快速验证表达式是否可能有效（剪枝用）
     * @param {Array<string>} arr - 字符数组
     * @returns {boolean}
     */
    isQuickValid(arr) {
        const str = arr.join('');
        
        // 必须包含等号
        if (!str.includes('=')) return false;
        
        // 检查无效的连续运算符
        // 允许=+和=-（用于等号后的正数/负数）
        // 允许表达式开头的+和-（如+2+3=5或-1+1=0）
        
        // 临时移除有效的=+和=-模式，以及开头的+/-
        const withoutValidPatterns = str
            .replace(/^[+\-]/, 'N')  // 移除开头的+/-
            .replace(/=[+\-]/g, '=N');  // 移除=+和=-
        
        // 现在检查是否有任何连续运算符或双等号
        if (/==|[+\-*/=][+\-*/=]/.test(withoutValidPatterns)) {
            return false;
        }
        
        // 不能以运算符结尾（除了等号）
        if (/[+\-*/]$/.test(str)) return false;
        
        // 等号两边必须有内容
        const parts = str.split('=');
        if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
        
        return true;
    }

    /**
     * 移动一根火柴的所有变换
     * @param {Array<string>} arr - 字符数组
     * @returns {Array<Array<string>>}
     */
    mutateSingle(arr) {
        const wrappedArr = this.wrapWithSpaces(arr);
        const singleCharMutations = this.transforms(wrappedArr).concat(this.moves(wrappedArr));
        const multiCharMutations = this.multiCharTransforms(arr);

        return [...singleCharMutations, ...multiCharMutations];
    }

    /**
     * 移动两根火柴的所有变换（待实现）
     * @param {Array<string>} arr - 字符数组
     * @returns {Array<Array<string>>}
     */
    mutateDouble(arr) {
        const wrappedArr = this.wrapWithSpaces(arr);
        const results = [];
        
        // 1. 移动两根火柴（trans2）
        results.push(...this.transforms2(wrappedArr));
        
        // 2. 移除两根 + 添加两根（moves2）
        results.push(...this.moves2(wrappedArr));
        
        // 3. 移除一根 + 添加一根，再重复一次（组合两次单根移动）
        results.push(...this.combinedMoves(wrappedArr));
        
        // 4. 转换一根 + 转换一根（如 2→3 + (6)H→(9)H）
        results.push(...this.transformTwice(wrappedArr));
        
        // 5. 转换一根 + 移除一根 + 添加一根（顺序：transform → remove → add）
        results.push(...this.transformAndMove(wrappedArr));
        
        return results;
    }

    /**
     * 在数组前后及元素间添加空格
     * @param {Array<string>} arr - 字符数组
     * @returns {Array<string>}
     */
    wrapWithSpaces(arr) {
        const result = [' '];
        for (const item of arr) {
            result.push(item);
            result.push(' ');
        }
        return result;
    }

    /**
     * 处理多字符转换（如 "11" -> "4"）
     * @param {Array<string>} arr - 字符数组
     * @returns {Array<Array<string>>}
     */
    multiCharTransforms(arr) {
        const results = [];
        const { trans } = this.ruleManager.getRules();

        // 查找 "11" 并替换为 "4"
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

        return results;
    }

    /**
     * 替换数组中指定位置的字符
     * @param {Array<string>} arr - 字符数组
     * @param {number} index - 索引
     * @param {string} replacement - 替换字符
     * @returns {Array<string>}
     */
    replace(arr, index, replacement) {
        const res = [...arr];
        res[index] = replacement;
        return res;
    }

    /**
     * 移动一根火柴的位置变换（不改变火柴总数）
     * @param {Array<string>} arr - 字符数组
     * @returns {Array<Array<string>>}
     */
    transforms(arr) {
        const { trans } = this.ruleManager.getRules();
        return arr.flatMap((c, i) => {
            const transformSet = trans[c];
            if (!transformSet) return [];
            return [...transformSet].map(re => this.replace(arr, i, re));
        });
    }

    /**
     * 移动火柴（先减后加）
     * @param {Array<string>} arr - 字符数组
     * @returns {Array<Array<string>>}
     */
    moves(arr) {
        const { subs } = this.ruleManager.getRules();
        const results = [];
        
        arr.forEach((c, i) => {
            const subsSet = subs[c];
            if (!subsSet) return;
            
            [...subsSet].forEach(re => {
                // 添加到现有位置
                results.push(...this.adding(this.replace(arr, i, re), i));
                // 插入新位置
                results.push(...this.inserting(this.replace(arr, i, re), i));
            });
        });
        
        return results;
    }

    /**
     * 添加一根火柴到其他位置
     * @param {Array<string>} arr - 字符数组
     * @param {number} except - 排除的索引
     * @returns {Array<Array<string>>}
     */
    adding(arr, except) {
        const { adds } = this.ruleManager.getRules();
        return arr.flatMap((c, i) => {
            if (i === except) return [];
            const addsSet = adds[c];
            if (!addsSet) return [];
            return [...addsSet].map(re => this.replace(arr, i, re));
        });
    }

    /**
     * 插入一根火柴到新位置（从空格派生新字符）
     * @param {Array<string>} arr - 字符数组
     * @param {number} except - 排除的索引（刚刚移除的位置）
     * @returns {Array<Array<string>>}
     */
    inserting(arr, except) {
        const { adds } = this.ruleManager.getRules();
        const results = [];
        
        // 从空格中获取可以添加的字符
        const spaceAdds = adds[' '];
        if (!spaceAdds) return [];
        
        // 尝试在每个位置插入新字符（包括最前面和最后面）
        // 注意：arr已经被wrapWithSpaces包装，所以arr[0]和arr[arr.length-1]是空格
        for (let insertIdx = 0; insertIdx <= arr.length; insertIdx++) {
            [...spaceAdds].forEach(newChar => {
                const newArr = [...arr];
                newArr.splice(insertIdx, 0, newChar);
                results.push(newArr);
            });
        }
        
        return results;
    }

    /**
     * 移动两根火柴的位置变换（trans2，不改变火柴总数）
     * @param {Array<string>} arr - 字符数组
     * @returns {Array<Array<string>>}
     */
    transforms2(arr) {
        const { trans2 } = this.ruleManager.getRules();
        if (!trans2) return [];
        return arr.flatMap((c, i) => {
            const transformSet = trans2[c];
            if (!transformSet) return [];
            return [...transformSet].map(re => this.replace(arr, i, re));
        });
    }

    /**
     * 移动两根火柴（先减后加）
     * @param {Array<string>} arr - 字符数组
     * @returns {Array<Array<string>>}
     */
    moves2(arr) {
        const { subs2 } = this.ruleManager.getRules();
        if (!subs2) return [];
        const results = [];
        
        arr.forEach((c, i) => {
            const subsSet = subs2[c];
            if (!subsSet) return;
            
            [...subsSet].forEach(re => {
                // 添加到现有位置
                results.push(...this.adding2(this.replace(arr, i, re), i));
                // 插入新位置
                results.push(...this.inserting2(this.replace(arr, i, re), i));
            });
        });
        
        return results;
    }

    /**
     * 添加两根火柴到其他位置
     * @param {Array<string>} arr - 字符数组
     * @param {number} except - 排除的索引
     * @returns {Array<Array<string>>}
     */
    adding2(arr, except) {
        const { adds2 } = this.ruleManager.getRules();
        if (!adds2) return [];
        return arr.flatMap((c, i) => {
            if (i === except) return [];
            const addsSet = adds2[c];
            if (!addsSet) return [];
            return [...addsSet].map(re => this.replace(arr, i, re));
        });
    }

    /**
     * 插入两根火柴到新位置（从空格派生新字符）
     * @param {Array<string>} arr - 字符数组
     * @param {number} except - 排除的索引（刚刚移除的位置）
     * @returns {Array<Array<string>>}
     */
    inserting2(arr, except) {
        const { adds2 } = this.ruleManager.getRules();
        if (!adds2) return [];
        const results = [];
        
        // 从空格中获取可以添加的字符
        const spaceAdds = adds2[' '];
        if (!spaceAdds) return [];
        
        // 尝试在每个位置插入新字符
        for (let insertIdx = 0; insertIdx <= arr.length; insertIdx++) {
            [...spaceAdds].forEach(newChar => {
                const newArr = [...arr];
                newArr.splice(insertIdx, 0, newChar);
                results.push(newArr);
            });
        }
        
        return results;
    }

    /**
     * 组合两次单根移动操作
     * 这可以模拟某些复杂的两根火柴移动场景
     * @param {Array<string>} arr - 字符数组
     * @returns {Array<Array<string>>}
     */
    combinedMoves(arr) {
        const results = [];
        const { subs, adds } = this.ruleManager.getRules();
        
        // 第一次移动：从位置 i 移除一根
        arr.forEach((c, i) => {
            const subsSet = subs[c];
            if (!subsSet) return;
            
            [...subsSet].forEach(replacement1 => {
                const arr1 = this.replace(arr, i, replacement1);
                
                // 第一次移动：添加到位置 j
                arr1.forEach((d, j) => {
                    if (i === j) return;
                    const addsSet = adds[d];
                    if (!addsSet) return;
                    
                    [...addsSet].forEach(replacement2 => {
                        const arr2 = this.replace(arr1, j, replacement2);
                        
                        // 第二次移动：从位置 k 移除一根
                        arr2.forEach((e, k) => {
                            const subsSet2 = subs[e];
                            if (!subsSet2) return;
                            
                            [...subsSet2].forEach(replacement3 => {
                                const arr3 = this.replace(arr2, k, replacement3);
                                
                                // 第二次移动：添加到位置 m（现有位置）
                                arr3.forEach((f, m) => {
                                    if (k === m) return;
                                    const addsSet2 = adds[f];
                                    if (!addsSet2) return;
                                    
                                    [...addsSet2].forEach(replacement4 => {
                                        const arr4 = this.replace(arr3, m, replacement4);
                                        results.push(arr4);
                                    });
                                });
                                
                                // 第二次移动：插入到新位置
                                const spaceAdds = adds[' '];
                                if (spaceAdds) {
                                    for (let insertIdx = 0; insertIdx <= arr3.length; insertIdx++) {
                                        [...spaceAdds].forEach(newChar => {
                                            const arr4 = [...arr3];
                                            arr4.splice(insertIdx, 0, newChar);
                                            results.push(arr4);
                                        });
                                    }
                                }
                            });
                        });
                    });
                });
            });
        });
        
        return results;
    }

    /**
     * 转换1根 + 转换1根的组合操作
     * 例如：2→3（转换）+ (6)H→(9)H（转换）
     * @param {Array<string>} arr - 字符数组
     * @returns {Array<Array<string>>}
     */
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

    /**
     * 转换1根 + 移除1根 + 添加1根的组合操作
     * 例如：41+29=78 → 41+38=79 (8→9转换, 2→3需移除再添加)
     * @param {Array<string>} arr - 字符数组
     * @returns {Array<Array<string>>}
     */
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
                        
                        // 第三步：在位置 k 添加一根火柴（现有位置）
                        arr2.forEach((e, k) => {
                            if (k === i || k === j) return;
                            const addsSet = adds[e];
                            if (!addsSet) return;
                            
                            [...addsSet].forEach(replacement3 => {
                                const arr3 = this.replace(arr2, k, replacement3);
                                results.push(arr3);
                            });
                        });
                        
                        // 第三步：插入到新位置
                        const spaceAdds = adds[' '];
                        if (spaceAdds) {
                            for (let insertIdx = 0; insertIdx <= arr2.length; insertIdx++) {
                                [...spaceAdds].forEach(newChar => {
                                    const arr3 = [...arr2];
                                    arr3.splice(insertIdx, 0, newChar);
                                    results.push(arr3);
                                });
                            }
                        }
                    });
                });
            });
        });
        
        return results;
    }

    /**
     * 移除1根 + 添加1根 + 转换1根的组合操作
     * 例如：41+29=78 → 41+38=79 (9→8添加, 8→9移除, 2→3转换)
     * @param {Array<string>} arr - 字符数组
     * @returns {Array<Array<string>>}
     */
}
