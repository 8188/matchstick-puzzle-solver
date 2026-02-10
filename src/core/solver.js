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
     * @returns {Object} {solutions: Array, others: Array}
     */
    solve(equation) {
        const arr = tokenizeEquation(equation);
        const mutations = this.mutate(arr);

        const solutions = mutations.filter(arr => Evaluator.evaluate(arr));
        const others = mutations.filter(arr => !Evaluator.evaluate(arr));

        // 去重并规范化（移除空格差异）
        const normalize = (str) => str.replace(/ /g, '');
        const solutionStrings = solutions.map(m => m.join(""));
        const uniqueSolutions = solutionStrings.filter((str, idx, arr) => 
            arr.findIndex(s => normalize(s) === normalize(str)) === idx
        );
        
        const otherStrings = others.map(m => m.join(""));
        const uniqueOthers = otherStrings.filter((str, idx, arr) => 
            arr.findIndex(s => normalize(s) === normalize(str)) === idx
        );

        return {
            solutions: uniqueSolutions,
            others: uniqueOthers,
            totalMutations: mutations.length
        };
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
        // Phase 3 实现
        throw new Error('Double move not implemented yet');
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
        return arr.flatMap((c, i) => {
            const subsSet = subs[c];
            if (!subsSet) return [];
            return [...subsSet].flatMap(re => this.adding(this.replace(arr, i, re), i));
        });
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
}
