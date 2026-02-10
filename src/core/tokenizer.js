/**
 * 等式分词器
 * 支持手写模式的 (数字)H 和 (11)H 以及标准模式的 11
 */

export function tokenizeEquation(equation) {
    const tokens = [];
    let i = 0;

    while (i < equation.length) {
        // (11)H
        if (equation.substring(i, i + 5) === '(11)H') {
            tokens.push('(11)H');
            i += 5;
            continue;
        }

        // 11
        if (equation.substring(i, i + 2) === '11') {
            tokens.push('11');
            i += 2;
            continue;
        }

        // (数字)H
        if (
            equation[i] === '(' &&
            i + 3 < equation.length &&
            equation[i + 2] === ')' &&
            equation[i + 3] === 'H'
        ) {
            tokens.push(equation.substring(i, i + 4));
            i += 4;
            continue;
        }

        tokens.push(equation[i]);
        i += 1;
    }

    return tokens;
}
