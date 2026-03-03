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
        // 规则缓存（每次 solve 调用前重建）
        this._rc = null;
    }

    /**
     * 将规则中的 Set 展开为 string[]，存入实例缓存，整次 solve 复用。
     * 避免在每个变换方法内部重复调用 getRules() 和 [...set]。
     */
    _buildRuleCache() {
        const { trans, subs, adds, trans2, subs2, adds2, moveSub, moveAdd } = this.ruleManager.getRules();

        const toMap = (obj) => {
            if (!obj) return new Map();
            const m = new Map();
            for (const [k, v] of Object.entries(obj)) {
                m.set(k, v instanceof Set ? [...v] : Array.isArray(v) ? v : []);
            }
            return m;
        };

        this._rc = {
            trans:    toMap(trans),
            subs:     toMap(subs),
            adds:     toMap(adds),
            trans2:   toMap(trans2),
            subs2:    toMap(subs2),
            adds2:    toMap(adds2),
            moveSub:  toMap(moveSub),
            moveAdd:  toMap(moveAdd),
            // 常用的空格可添加字符
            spaceAdds:  adds  ? (adds[' ']  instanceof Set ? [...adds[' ']]  : (adds[' ']  || [])) : [],
            spaceAdds2: adds2 ? (adds2[' '] instanceof Set ? [...adds2[' ']] : (adds2[' '] || [])) : [],
        };
    }

    /**
     * 求解谜题
     * @param {string} equation - 等式字符串
     * @param {Object} options - 配置选项 {maxMutations: number, onProgress: function}
     * @returns {Object} {solutions: Array<{str,method}>, others: Array<string>}
     */
    solve(equation, options = {}) {
        const { maxMutations = 10000, onProgress = null } = options;

        // 重建规则缓存（支持运行时切换模式）
        this._buildRuleCache();

        const normalize = (str) => str.replace(/ /g, '');
        const originalNormalized = normalize(equation);

        // 获取所有可能的 tokenize 方式
        const tokenizeVariants = this.getAllTokenizeVariants(equation);

        // 边生成边验证：直接在各策略方法中检测有效解，避免堆积全量候选
        const solutionMap = new Map(); // normalized → {str, method}
        let totalMutations = 0;

        // 移动2根时，先收集单根解集用于排除
        let singleMoveSet = null;
        if (this.moveCount === 2) {
            singleMoveSet = new Set();
            for (const arr of tokenizeVariants) {
                const wrapped = this.wrapWithSpaces(arr);
                for (const candidate of this._generateSingle(wrapped, arr)) {
                    if (this.isQuickValid(candidate) && Evaluator.evaluate(candidate)) {
                        singleMoveSet.add(normalize(candidate.join('')));
                    }
                }
            }
        }

        for (const arr of tokenizeVariants) {
            const wrapped = this.wrapWithSpaces(arr);
            const strategies = this.moveCount === 1
                ? this._strategiesSingle(wrapped, arr)
                : this._strategiesDouble(wrapped, arr);

            for (const { candidates, method } of strategies) {
                for (const candidate of candidates) {
                    if (totalMutations >= maxMutations) break;
                    totalMutations++;

                    if (!this.isQuickValid(candidate)) continue;
                    if (!Evaluator.evaluate(candidate)) continue;

                    const key = normalize(candidate.join(''));
                    if (key === originalNormalized) continue;
                    if (singleMoveSet && singleMoveSet.has(key)) continue;
                    if (!solutionMap.has(key)) {
                        solutionMap.set(key, { str: candidate.join(''), method });
                    }
                }
                if (totalMutations >= maxMutations) break;
            }
            if (totalMutations >= maxMutations) break;
        }

        const finalSolutions = [...solutionMap.values()];

        return {
            solutions: finalSolutions, // Array<{str: string, method: string}>
            others: [],
            totalMutations
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
     * 快速验证表达式是否可能有效（剪枝用）
     * @param {Array<string>} arr - 字符数组
     * @returns {boolean}
     */
    isQuickValid(arr) {
        const str = arr.join('');

        // 必须包含等号
        if (!str.includes('=')) return false;

        // 临时移除有效的=+/=-模式及开头的+/-，再检测连续运算符
        const withoutValidPatterns = str
            .replace(/^[+\-]/, 'N')
            .replace(/=[+\-]/g, '=N');

        if (/==|[+\-*/=][+\-*/=]/.test(withoutValidPatterns)) return false;

        // 不能以运算符结尾
        if (/[+\-*/]$/.test(str)) return false;

        // 等号两边必须有内容
        const parts = str.split('=');
        if (parts.length !== 2 || !parts[0] || !parts[1]) return false;

        return true;
    }

    /**
     * 生成单根移动的所有候选（供内部使用）
     * @param {Array<string>} wrapped - wrapWithSpaces 后的数组
     * @param {Array<string>} raw    - 原始 token 数组（无空格包装）
     * @returns {Iterable<Array<string>>}
     */
    *_generateSingle(wrapped, raw) {
        const rc = this._rc;
        // transforms
        for (let i = 0; i < wrapped.length; i++) {
            const targets = rc.trans.get(wrapped[i]);
            if (!targets) continue;
            for (const t of targets) {
                const a = [...wrapped]; a[i] = t; yield a;
            }
        }
        // moves (sub → add to existing / insert)
        for (let i = 0; i < wrapped.length; i++) {
            const subsArr = rc.subs.get(wrapped[i]);
            if (!subsArr) continue;
            for (const sub of subsArr) {
                const a1 = [...wrapped]; a1[i] = sub;
                // add to existing positions
                for (let j = 0; j < a1.length; j++) {
                    if (j === i) continue;
                    const addsArr = rc.adds.get(a1[j]);
                    if (!addsArr) continue;
                    for (const ad of addsArr) {
                        const a2 = [...a1]; a2[j] = ad; yield a2;
                    }
                }
                // insert at new positions
                for (const sp of rc.spaceAdds) {
                    for (let ins = 0; ins <= a1.length; ins++) {
                        const a2 = [...a1]; a2.splice(ins, 0, sp); yield a2;
                    }
                }
            }
        }
        // multiCharTransforms (11 → 4 etc.)
        const trans11 = rc.trans.get('11');
        if (trans11) {
            for (let i = 0; i < raw.length - 1; i++) {
                if (raw[i] === '1' && raw[i + 1] === '1') {
                    for (const t of trans11) {
                        const a = [...raw]; a.splice(i, 2, t); yield a;
                    }
                }
            }
        }
    }

    /**
     * 单根移动的策略列表（供 solve 迭代）
     * @returns {Array<{candidates: Iterable, method: string}>}
     */
    _strategiesSingle(wrapped, raw) {
        const rc = this._rc;
        return [
            { method: 'transform',  candidates: this._genTransforms(wrapped, rc.trans) },
            { method: 'move',       candidates: this._genMoves(wrapped, rc.subs, rc.adds, rc.spaceAdds) },
            { method: 'multiChar',  candidates: this._genMultiChar(raw, rc.trans) },
        ];
    }

    /**
     * 双根移动的策略列表（供 solve 迭代）
     * @returns {Array<{candidates: Iterable, method: string}>}
     */
    _strategiesDouble(wrapped, raw) {
        const rc = this._rc;
        return [
            { method: 'transform2',       candidates: this._genTransforms(wrapped, rc.trans2) },
            { method: 'move2',            candidates: this._genMoves(wrapped, rc.subs2, rc.adds2, rc.spaceAdds2) },
            { method: 'moveSubThenAdd',   candidates: this._genMoveSubThenAdd(wrapped, rc) },
            { method: 'moveAddThenSub',   candidates: this._genMoveAddThenSub(wrapped, rc) },
            { method: 'removeRemoveAdd2', candidates: this._genRemoveRemoveAdd2(wrapped, rc) },
            { method: 'removeTwoAddTwo',  candidates: this._genRemoveTwoAddTwo(wrapped, rc) },
            { method: 'combinedMoves',    candidates: this._genCombinedMoves(wrapped, rc) },
            { method: 'transformTwice',   candidates: this._genTransformTwice(wrapped, rc) },
            { method: 'transformAndMove', candidates: this._genTransformAndMove(wrapped, rc) },
        ];
    }

    // ─────────────────────────────────────────────
    // 通用 generator 辅助（使用预缓存规则）
    // ─────────────────────────────────────────────

    /** 在数组前后及元素间插入空格占位 */
    wrapWithSpaces(arr) {
        const result = [' '];
        for (const item of arr) { result.push(item); result.push(' '); }
        return result;
    }

    /**
     * 通用 transforms generator：对 arr 中每个 token，尝试 transMap 中定义的同 stick 替换
     */
    *_genTransforms(arr, transMap) {
        for (let i = 0; i < arr.length; i++) {
            const targets = transMap.get(arr[i]);
            if (!targets) continue;
            for (const t of targets) {
                const a = [...arr]; a[i] = t; yield a;
            }
        }
    }

    /**
     * 通用 moves generator：sub(i) → add(j) 或 insert
     */
    *_genMoves(arr, subsMap, addsMap, spaceAdds) {
        for (let i = 0; i < arr.length; i++) {
            const subsArr = subsMap.get(arr[i]);
            if (!subsArr) continue;
            for (const sub of subsArr) {
                const a1 = [...arr]; a1[i] = sub;
                for (let j = 0; j < a1.length; j++) {
                    if (j === i) continue;
                    const addsArr = addsMap.get(a1[j]);
                    if (!addsArr) continue;
                    for (const ad of addsArr) {
                        const a2 = [...a1]; a2[j] = ad; yield a2;
                    }
                }
                for (const sp of spaceAdds) {
                    for (let ins = 0; ins <= a1.length; ins++) {
                        const a2 = [...a1]; a2.splice(ins, 0, sp); yield a2;
                    }
                }
            }
        }
    }

    /**
     * multiCharTransforms generator（11 → 4 等）
     */
    *_genMultiChar(raw, transMap) {
        const trans11 = transMap.get('11');
        if (!trans11) return;
        for (let i = 0; i < raw.length - 1; i++) {
            if (raw[i] === '1' && raw[i + 1] === '1') {
                for (const t of trans11) {
                    const a = [...raw]; a.splice(i, 2, t); yield a;
                }
            }
        }
    }

    // ─────────────────────────────────────────────
    // 双根移动专用 generators
    // ─────────────────────────────────────────────

    /** moveSubThenAdd：moveSub(i) + add(j or insert) */
    *_genMoveSubThenAdd(arr, rc) {
        const { moveSub, adds, spaceAdds } = rc;
        for (let i = 0; i < arr.length; i++) {
            const ms = moveSub.get(arr[i]);
            if (!ms) continue;
            for (const r1 of ms) {
                const a1 = [...arr]; a1[i] = r1;
                for (let j = 0; j < a1.length; j++) {
                    if (j === i) continue;
                    const ad = adds.get(a1[j]);
                    if (!ad) continue;
                    for (const r2 of ad) { const a2 = [...a1]; a2[j] = r2; yield a2; }
                }
                for (const sp of spaceAdds) {
                    for (let ins = 0; ins <= a1.length; ins++) {
                        const a2 = [...a1]; a2.splice(ins, 0, sp); yield a2;
                    }
                }
            }
        }
    }

    /** moveAddThenSub：moveAdd(i) + sub(j) */
    *_genMoveAddThenSub(arr, rc) {
        const { moveAdd, subs } = rc;
        for (let i = 0; i < arr.length; i++) {
            const ma = moveAdd.get(arr[i]);
            if (!ma) continue;
            for (const r1 of ma) {
                const a1 = [...arr]; a1[i] = r1;
                for (let j = 0; j < a1.length; j++) {
                    if (j === i) continue;
                    const sb = subs.get(a1[j]);
                    if (!sb) continue;
                    for (const r2 of sb) { const a2 = [...a1]; a2[j] = r2; yield a2; }
                }
            }
        }
    }

    /** removeRemoveAdd2：sub(i) + sub(j) + add2(k) */
    *_genRemoveRemoveAdd2(arr, rc) {
        const { subs, adds2 } = rc;
        for (let i = 0; i < arr.length; i++) {
            const sb1 = subs.get(arr[i]);
            if (!sb1) continue;
            for (const r1 of sb1) {
                const a1 = [...arr]; a1[i] = r1;
                for (let j = 0; j < a1.length; j++) {
                    if (j === i) continue;
                    const sb2 = subs.get(a1[j]);
                    if (!sb2) continue;
                    for (const r2 of sb2) {
                        const a2 = [...a1]; a2[j] = r2;
                        for (let k = 0; k < a2.length; k++) {
                            if (k === i || k === j) continue;
                            const ad2 = adds2.get(a2[k]);
                            if (!ad2) continue;
                            for (const r3 of ad2) { const a3 = [...a2]; a3[k] = r3; yield a3; }
                        }
                    }
                }
            }
        }
    }

    /** removeTwoAddTwo：sub2(i) + add(j or insert) + add(k or insert) */
    *_genRemoveTwoAddTwo(arr, rc) {
        const { subs2, adds, spaceAdds } = rc;
        for (let i = 0; i < arr.length; i++) {
            const sb2 = subs2.get(arr[i]);
            if (!sb2) continue;
            for (const r1 of sb2) {
                const a1 = [...arr]; a1[i] = r1;
                // 第一次 add：现有位置 j
                for (let j = 0; j < a1.length; j++) {
                    if (j === i) continue;
                    const ad1 = adds.get(a1[j]);
                    if (!ad1) continue;
                    for (const r2 of ad1) {
                        const a2 = [...a1]; a2[j] = r2;
                        // 第二次 add：现有位置 k
                        for (let k = 0; k < a2.length; k++) {
                            if (k === i || k === j) continue;
                            const ad2 = adds.get(a2[k]);
                            if (!ad2) continue;
                            for (const r3 of ad2) { const a3 = [...a2]; a3[k] = r3; yield a3; }
                        }
                        // 第二次 add：插入
                        for (const sp of spaceAdds) {
                            for (let ins = 0; ins <= a2.length; ins++) {
                                const a3 = [...a2]; a3.splice(ins, 0, sp); yield a3;
                            }
                        }
                    }
                }
                // 第一次 add：插入位置
                for (const sp1 of spaceAdds) {
                    for (let ins1 = 0; ins1 <= a1.length; ins1++) {
                        const a2 = [...a1]; a2.splice(ins1, 0, sp1);
                        // 第二次 add：现有位置 k
                        for (let k = 0; k < a2.length; k++) {
                            const ad2 = adds.get(a2[k]);
                            if (!ad2) continue;
                            for (const r3 of ad2) { const a3 = [...a2]; a3[k] = r3; yield a3; }
                        }
                        // 第二次 add：插入
                        for (const sp2 of spaceAdds) {
                            for (let ins2 = 0; ins2 <= a2.length; ins2++) {
                                const a3 = [...a2]; a3.splice(ins2, 0, sp2); yield a3;
                            }
                        }
                    }
                }
            }
        }
    }

    /** combinedMoves：两次完整的 sub→add（同 moveCount=1 两次）*/
    *_genCombinedMoves(arr, rc) {
        const { subs, adds, spaceAdds } = rc;
        for (let i = 0; i < arr.length; i++) {
            const sb1 = subs.get(arr[i]);
            if (!sb1) continue;
            for (const r1 of sb1) {
                const a1 = [...arr]; a1[i] = r1;
                // 第一次 add：现有位置 j
                for (let j = 0; j < a1.length; j++) {
                    if (j === i) continue;
                    const ad1 = adds.get(a1[j]);
                    if (!ad1) continue;
                    for (const r2 of ad1) {
                        const a2 = [...a1]; a2[j] = r2;
                        // 第二次 sub：位置 k
                        for (let k = 0; k < a2.length; k++) {
                            const sb2 = subs.get(a2[k]);
                            if (!sb2) continue;
                            for (const r3 of sb2) {
                                const a3 = [...a2]; a3[k] = r3;
                                // 第二次 add：现有位置 m
                                for (let m = 0; m < a3.length; m++) {
                                    if (m === k) continue;
                                    const ad2 = adds.get(a3[m]);
                                    if (!ad2) continue;
                                    for (const r4 of ad2) { const a4 = [...a3]; a4[m] = r4; yield a4; }
                                }
                                // 第二次 add：插入
                                for (const sp of spaceAdds) {
                                    for (let ins = 0; ins <= a3.length; ins++) {
                                        const a4 = [...a3]; a4.splice(ins, 0, sp); yield a4;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /** transformTwice：trans(i) + trans(j) */
    *_genTransformTwice(arr, rc) {
        const { trans } = rc;
        for (let i = 0; i < arr.length; i++) {
            const t1 = trans.get(arr[i]);
            if (!t1) continue;
            for (const r1 of t1) {
                const a1 = [...arr]; a1[i] = r1;
                for (let j = 0; j < a1.length; j++) {
                    if (j === i) continue;
                    const t2 = trans.get(a1[j]);
                    if (!t2) continue;
                    for (const r2 of t2) { const a2 = [...a1]; a2[j] = r2; yield a2; }
                }
            }
        }
    }

    /** transformAndMove：trans(i) + sub(j) + add(k or insert) */
    *_genTransformAndMove(arr, rc) {
        const { trans, subs, adds, spaceAdds } = rc;
        for (let i = 0; i < arr.length; i++) {
            const t1 = trans.get(arr[i]);
            if (!t1) continue;
            for (const r1 of t1) {
                const a1 = [...arr]; a1[i] = r1;
                for (let j = 0; j < a1.length; j++) {
                    if (j === i) continue;
                    const sb = subs.get(a1[j]);
                    if (!sb) continue;
                    for (const r2 of sb) {
                        const a2 = [...a1]; a2[j] = r2;
                        // add 到现有位置 k
                        for (let k = 0; k < a2.length; k++) {
                            if (k === i || k === j) continue;
                            const ad = adds.get(a2[k]);
                            if (!ad) continue;
                            for (const r3 of ad) { const a3 = [...a2]; a3[k] = r3; yield a3; }
                        }
                        // add 到插入位置
                        for (const sp of spaceAdds) {
                            for (let ins = 0; ins <= a2.length; ins++) {
                                const a3 = [...a2]; a3.splice(ins, 0, sp); yield a3;
                            }
                        }
                    }
                }
            }
        }
    }

}
