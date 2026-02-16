/**
 * 手写模式规则
 * 定义手写风格下的火柴棒转换规则
 * 
 * 手写特点：
 * - (0)H: 只需4根火柴
 * - (1)H: 只需1根竖线（1根火柴）
 * - (4)H: 像旗子（3根火柴）
 * - (6)H: 缺少最上面的横线（5根火柴）
 * - (7)H: 只需2根火柴
 * - (9)H: 缺少最下面的横线（5根火柴）
 * - (11)H: 只需2根火柴
 */

import { RuleBuilder } from '../core/rules.js';

export class HandwrittenMode extends RuleBuilder {
    constructor() {
        super();
        this.buildRules();
    }

    buildRules() {
        // ========== (0)H的规则 ==========
        this.add('(0)H', '(6)H');
        this.add('(0)H', '(9)H');

        // ========== (1)H的规则 ==========
        this.transform('(1)H', '-');
        this.add('(1)H', '(7)H');
        this.add('(1)H', '(11)H');
        this.add('(1)H', '+');
        this.add(' ', '(1)H');

        // ========== 2的规则 ==========
        this.transform('2', '3');

        // ========== 3的规则 ==========
        this.transform('3', '2');
        this.transform('3', '5');
        this.transform('3', '(9)H');

        // ========== (4)H的规则 ==========
        this.add('+', '(4)H');

        // ========== 5的规则 ==========
        this.transform('5', '3');
        this.transform('5', '(6)H');
        this.transform('5', '(9)H');

        // ========== (6)H的规则 ==========
        this.transform('(6)H', '5');
        this.transform('(6)H', '(9)H');
        this.add('(0)H', '(6)H');

        // ========== (7)H的规则 ==========
        this.transform('(7)H', '(11)H');
        this.transform('(7)H', '+');
        this.transform('(7)H', '=');
        this.add('(1)H', '(7)H');
        this.add('-', '(7)H');

        // ========== (9)H的规则 ==========
        this.transform('(9)H', '3');
        this.transform('(9)H', '5');
        this.transform('(9)H', '(6)H');
        this.add('(0)H', '(9)H');

        // ========== +的规则 ==========
        this.transform('+', '(7)H');
        this.transform('+', '(11)H');
        this.transform('+', '=');
        this.add('+', '(4)H');
        this.add('(1)H', '+');
        this.add('-', '+');

        // ========== -的规则 ==========
        this.transform('-', '(1)H');
        this.add('-', '(7)H');
        this.add('-', '+');
        this.add('-', '=');
        this.add(' ', '-');

        // ========== *的规则 ==========
        this.transform('*', '/');

        // ========== /的规则 ==========
        this.transform('/', '*');

        // ========== =的规则 ==========
        this.transform('=', '+');
        this.transform('=', '(7)H');
        this.add('-', '=');

        // ========== 空格的规则 ==========
        this.add(' ', '-');
        this.add(' ', '(1)H');

        // ========== (11)H的规则 ==========
        this.addMultiCharPattern('(11)H');
        this.transform('(11)H', '(7)H');
        this.transform('(11)H', '+');
        this.add('(1)H', '(11)H');

        // ========== 移动2根火柴的规则 ==========
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

    /**
     * 获取模式名称
     */
    static getName() {
        return 'handwritten';
    }

    /**
     * 获取模式显示名称
     */
    static getDisplayName() {
        return '手写模式';
    }

    /**
     * 获取模式描述
     */
    static getDescription() {
        return '手写风格，6缺上横、9缺下横、1只需1根竖线';
    }
}
