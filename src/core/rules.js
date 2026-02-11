/**
 * 规则管理系统
 * 管理不同模式下的火柴棒转换规则
 */

export class RuleManager {
    constructor() {
        this.modes = new Map();
        this.currentMode = 'standard';
        // 标准字符 + 11 + 手写字符(带()H标记)
        this.legals = "0123456789+-*/= ".split("").concat(['11', '(0)H', '(1)H', '(4)H', '(6)H', '(7)H', '(9)H', '(11)H']);
    }

    /**
     * 注册一个新的模式
     * @param {string} name - 模式名称
     * @param {Object} rules - 规则对象 {adds, subs, trans}
     */
    registerMode(name, rules) {
        this.modes.set(name, rules);
    }

    /**
     * 切换当前模式
     * @param {string} name - 模式名称
     */
    switchMode(name) {
        if (!this.modes.has(name)) {
            throw new Error(`Mode "${name}" not found`);
        }
        this.currentMode = name;
    }

    /**
     * 获取当前模式的规则
     * @returns {Object} {adds, subs, trans}
     */
    getRules() {
        return this.modes.get(this.currentMode);
    }

    /**
     * 获取所有合法字符
     * @returns {Array<string>}
     */
    getLegals() {
        return this.legals;
    }

    /**
     * 获取所有可用模式
     * @returns {Array<string>}
     */
    getAvailableModes() {
        return Array.from(this.modes.keys());
    }
}

/**
 * 规则构建器基类
 */
export class RuleBuilder {
    constructor() {
        this.adds = {};
        this.subs = {};
        this.trans = {};
        this.adds2 = {}; // 添加两根火柴
        this.subs2 = {}; // 移除两根火柴
        this.trans2 = {}; // 移动两根火柴
        // 标准字符 + 11 + 手写字符(带()H标记)
        this.legals = "0123456789+-*/= ".split("").concat(['11', '(0)H', '(1)H', '(4)H', '(6)H', '(7)H', '(9)H', '(11)H']);

        // 初始化所有字符的规则集合
        this.legals.forEach(c => {
            this.adds[c] = new Set();
            this.subs[c] = new Set();
            this.trans[c] = new Set();
            this.adds2[c] = new Set();
            this.subs2[c] = new Set();
            this.trans2[c] = new Set();
        });
    }

    /**
     * 定义添加一根火柴的转换规则
     * @param {string} c1 - 源字符
     * @param {string} c2 - 目标字符
     */
    add(c1, c2) {
        this.adds[c1].add(c2);
        this.subs[c2].add(c1);
        return this;
    }

    /**
     * 定义移动一根火柴的转换规则（不改变火柴总数）
     * @param {string} c1 - 字符1
     * @param {string} c2 - 字符2
     */
    transform(c1, c2) {
        this.trans[c1].add(c2);
        this.trans[c2].add(c1);
        return this;
    }

    /**
     * 定义添加两根火柴的转换规则
     * @param {string} c1 - 源字符
     * @param {string} c2 - 目标字符
     */
    add2(c1, c2) {
        if (!this.adds2[c1]) this.adds2[c1] = new Set();
        if (!this.subs2[c2]) this.subs2[c2] = new Set();
        this.adds2[c1].add(c2);
        this.subs2[c2].add(c1);
        return this;
    }

    /**
     * 定义移动两根火柴的转换规则（不改变火柴总数）
     * @param {string} c1 - 字符1
     * @param {string} c2 - 字符2
     */
    transform2(c1, c2) {
        if (!this.trans2[c1]) this.trans2[c1] = new Set();
        if (!this.trans2[c2]) this.trans2[c2] = new Set();
        this.trans2[c1].add(c2);
        this.trans2[c2].add(c1);
        return this;
    }

    /**
     * 添加多字符转换规则
     * @param {string} pattern - 多字符模式
     */
    addMultiCharPattern(pattern) {
        if (!this.trans[pattern]) {
            this.trans[pattern] = new Set();
        }
        return this;
    }

    /**
     * 构建并返回规则对象
     * @returns {Object}
     */
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
