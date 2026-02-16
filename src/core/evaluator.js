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
                if (char === 'x' || char === '×') return '*';
                if (char === '÷') return '/';
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

            // 检查是否有前导0（如09, 08等，但允许单独的0）
            // 匹配：非数字或开头 + 0 + 数字
            if (/(^|[^\d])0\d/.test(expr.replace('==', '='))) {
                return false;
            }

            // 检查无效的连续运算符
            // 允许=+和=-（用于等号后的正数/负数）
            // 允许表达式开头的+和-（如+2+3=5或-1+1=0）
            const normalized = expr.replace('==', '=');
            
            // 临时移除有效的=+和=-模式，以及开头的+/-
            const withoutValidPatterns = normalized
                .replace(/^[+\-]/, 'N')  // 移除开头的+/-
                .replace(/=[+\-]/g, '=N');  // 移除=+和=-
            
            // 现在检查是否有任何连续运算符
            if (/[+\-*/=][+\-*/=]/.test(withoutValidPatterns)) {
                return false;
            }

            // 分割等式左右两边
            const [left, right] = expr.split('==');
            if (!left || !right) return false;

            // 计算并验证
            const leftVal = eval(left);
            const rightVal = eval(right);
            return Math.abs(leftVal - rightVal) < 0.0001;
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
