/**
 * 标准模式规则
 * 定义标准七段数码管显示下的火柴棒转换规则
 */

import { RuleBuilder } from '../core/rules.js';

export class StandardMode extends RuleBuilder {
    constructor() {
        super();
        this.buildRules();
    }

    buildRules() {
        // 添加一根火柴的转换
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

        // 移动一根火柴的转换（不改变火柴总数）
        this.transform('1', '+');
        this.transform('0', '6');
        this.transform('0', '9');
        this.transform('3', '5');
        this.transform('3', '2');
        this.transform('6', '9');
        this.transform('+', '=');  // + 移动一根可变 =
        this.transform('*', '/');  // x 移动一根可变 /

        // 多字符转换：11 <-> 4
        this.addMultiCharPattern('11');
        this.transform('11', '4');

        // 移动两根火柴的规则（根据标准规则表 Move 2 列）
        this.transform2('+', 'x');   // + <-> x (2根)
        this.transform2('+', '/');   // + <-> / (2根)
        this.transform2('+', '1');   // + <-> 1 (2根)
        this.transform2('=', 'x');   // = <-> x (2根)
        this.transform2('=', '/');   // = <-> / (2根)
        this.transform2('=', '1');   // = <-> 1 (2根)
        this.transform2('x', '1');   // x <-> 1 (2根)
        this.transform2('/', '1');   // / <-> 1 (2根)
        this.transform2('5', '2');   // 5 <-> 2 (5根)
        
        // 添加两根火柴的规则（根据标准规则表 Add 2 列）
        this.add2(' ', '+');   // SPACE -> + (2根)
        this.add2(' ', 'x');   // SPACE -> x (2根)
        this.add2(' ', '/');   // SPACE -> / (2根)
        this.add2(' ', '=');   // SPACE -> = (2根)
        this.add2(' ', '1');   // SPACE -> 1 (2根)
        this.add2('-', '7');   // - -> 7 (3根，添加2根)
        this.add2('1', '4');   // 1 -> 4 (4根)
        this.add2('7', '3');   // 7 -> 3 (5根)
        this.add2('11', '0');  // 11 -> 0 (6根)
        this.add2('4', '9');   // 4 -> 9 (6根)
        this.add2('5', '8');   // 5 -> 8 (7根)
        this.add2('3', '8');   // 3 -> 8 (7根)
        this.add2('2', '8');   // 2 -> 8 (7根)

        return this;
    }

    /**
     * 获取模式名称
     */
    static getName() {
        return 'standard';
    }

    /**
     * 获取模式显示名称
     */
    static getDisplayName() {
        return '标准模式';
    }

    /**
     * 获取模式描述
     */
    static getDescription() {
        return '标准七段数码管显示，数字7使用3根火柴';
    }
}
