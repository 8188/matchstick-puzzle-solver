/**
 * 等式验证器
 * 负责验证等式是否成立
 */

import { tokenizeEquation } from './tokenizer.js';

export class Evaluator {
    /**
     * 规范化输入，返回token数组
     * @param {string|Array<string>} input
     * @returns {Array<string>}
     */
    static normalizeTokens(input) {
        if (Array.isArray(input)) {
            const hasRawHandwritten = input.some(t => t === '(' || t === ')' || t === 'H');
            if (hasRawHandwritten) {
                return tokenizeEquation(input.join(''));
            }
            return input;
        }
        return tokenizeEquation(input);
    }

    /**
     * 将token数组转换为可计算的表达式字符串
     * @param {Array<string>} tokens
     * @returns {string}
     */
    static tokensToExpression(tokens) {
        const exprTokens = tokens
            .filter(char => char !== ' ')
            .map(char => {
                if (char.startsWith('(') && char.endsWith(')H')) {
                    const match = char.match(/\((\d+)\)H/);
                    return match ? match[1] : char;
                }
                if (char === 'x') return '*';
                return char;
            });

        return exprTokens.join("").replace('=', '==');
    }
    /**
     * 计算并验证等式是否成立
     * @param {Array<string>} arr - 字符数组
     * @returns {boolean}
     */
    static evaluate(arr) {
        const tokens = Evaluator.normalizeTokens(arr);
        if (tokens.indexOf('=') <= -1) return false;

        try {
            const expr = Evaluator.tokensToExpression(tokens);

            // 检查连续的运算符
            if (/[+\-*/]{2,}/.test(expr)) {
                return false;
            }

            // 检查等式左右两边是否以加减号开头
            const [left, right] = expr.split('==');
            if (/^[+\-]/.test(left) || /^[+\-]/.test(right)) {
                return false;
            }

            return !!eval(expr);
        } catch (x) {
            return false;
        }
    }

    /**
     * 检查表达式是否合法（不一定成立）
     * @param {Array<string>} arr - 字符数组
     * @returns {boolean}
     */
    static isValidExpression(arr) {
        const tokens = Evaluator.normalizeTokens(arr);
        const expr = Evaluator.tokensToExpression(tokens).replace('==', '=');

        // 必须包含等号
        if (!expr.includes('=')) return false;

        // 不能有连续的运算符
        if (/[+\-*/]{2,}/.test(expr)) return false;

        return true;
    }
}
