/**
 * 火柴棒显示组件
 * 使用SVG绘制火柴棒数字和符号
 */

import { tokenizeEquation } from '../../core/tokenizer.js';

export class MatchstickDisplay {
    constructor(mode = 'standard') {
        this.mode = mode;
        this.matchColor = '#ff6b35';
        this.matchWidth = 4;
        this.matchLength = 30;
        this.gap = 4;
    }

    /**
     * 创建数字的SVG表示
     * @param {string} digit - 数字或符号
     * @param {boolean} useHandwritten - 是否使用手写模式
     * @returns {SVGElement}
     */
    createDigitSVG(digit, useHandwritten = false) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'matchstick-digit');
        svg.setAttribute('viewBox', '0 0 50 80');
        // 移除硬编码的 width 和 height，由 CSS 控制

        const segments = this.getSegments(digit, useHandwritten);
        segments.forEach(segment => {
            const line = this.createMatchstick(segment);
            svg.appendChild(line);
        });

        return svg;
    }

    /**
     * 创建单根火柴棒
     * @param {Object} segment - 线段定义 {x1, y1, x2, y2}
     * @returns {SVGGElement}
     */
    createMatchstick(segment) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // 计算火柴棒的方向和长度
        const dx = segment.x2 - segment.x1;
        const dy = segment.y2 - segment.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // 火柴棍体（更浅的木色）
        const stick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        stick.setAttribute('x1', segment.x1);
        stick.setAttribute('y1', segment.y1);
        stick.setAttribute('x2', segment.x2);
        stick.setAttribute('y2', segment.y2);
        stick.setAttribute('stroke', '#DEB887'); // 小麦色，更浅
        stick.setAttribute('stroke-width', this.matchWidth);
        stick.setAttribute('stroke-linecap', 'round');
        stick.setAttribute('class', 'match-stick');
        
        // 火柴头（鲜红色，更明显）
        const headSize = this.matchWidth * 1.5;
        const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        head.setAttribute('cx', segment.x2);
        head.setAttribute('cy', segment.y2);
        head.setAttribute('r', headSize);
        head.setAttribute('fill', '#FF4444'); // 鲜红色火柴头
        head.setAttribute('class', 'match-head');
        
        group.appendChild(stick);
        group.appendChild(head);
        
        return group;
    }

    /**
     * 获取数字/符号的线段定义
     * @param {string} char - 字符（可能包含()H标记）
     * @param {boolean} handwritten - 手写模式（已废弃，现在通过()H标记判断）
     * @returns {Array<Object>}
     */
    getSegments(char, handwritten = false) {
        // 检查是否有()H标记
        const isHandwritten = char.includes(')H');
        let baseChar = char;
        
        if (isHandwritten) {
            // 提取括号内的字符，如(6)H -> 6
            const match = char.match(/\((\d+)\)H/);
            if (match) {
                baseChar = match[1];
            }
        }
        
        // 七段显示的标准位置
        const segments = {
            // 数字 0-9
            '0': isHandwritten ?
                [
                    { x1: 15, y1: 20, x2: 35, y2: 20 },  // 顶部
                    { x1: 15, y1: 60, x2: 35, y2: 60 },  // 底部
                    { x1: 15, y1: 20, x2: 15, y2: 60 },  // 左侧
                    { x1: 35, y1: 20, x2: 35, y2: 60 },  // 右侧
                ] : [
                    { x1: 15, y1: 10, x2: 35, y2: 10 },  // 顶部
                    { x1: 15, y1: 70, x2: 35, y2: 70 },  // 底部
                    { x1: 15, y1: 10, x2: 15, y2: 40 },  // 左上
                    { x1: 15, y1: 40, x2: 15, y2: 70 },  // 左下
                    { x1: 35, y1: 10, x2: 35, y2: 40 },  // 右上
                    { x1: 35, y1: 40, x2: 35, y2: 70 },  // 右下
                ],

            '1': isHandwritten ?
                [
                    { x1: 35, y1: 20, x2: 35, y2: 60 },  // 只有一根竖线（短一些）
                ] : [
                    { x1: 35, y1: 10, x2: 35, y2: 40 },  // 右上
                    { x1: 35, y1: 40, x2: 35, y2: 70 },  // 右下
                ],

            '2': [
                { x1: 15, y1: 10, x2: 35, y2: 10 },  // 顶部
                { x1: 15, y1: 40, x2: 35, y2: 40 },  // 中间
                { x1: 15, y1: 70, x2: 35, y2: 70 },  // 底部
                { x1: 35, y1: 10, x2: 35, y2: 40 },  // 右上
                { x1: 15, y1: 40, x2: 15, y2: 70 },  // 左下
            ],

            '3': [
                { x1: 15, y1: 10, x2: 35, y2: 10 },  // 顶部
                { x1: 15, y1: 40, x2: 35, y2: 40 },  // 中间
                { x1: 15, y1: 70, x2: 35, y2: 70 },  // 底部
                { x1: 35, y1: 10, x2: 35, y2: 40 },  // 右上
                { x1: 35, y1: 40, x2: 35, y2: 70 },  // 右下
            ],

            '4': isHandwritten ?
                [
                    { x1: 15, y1: 40, x2: 25, y2: 20 },  // 左下到45度斜线（旗帜）
                    { x1: 15, y1: 40, x2: 35, y2: 40 },  // 中间横线（穿过竖线）
                    { x1: 25, y1: 20, x2: 25, y2: 60 },  // 竖线（短一些）
                ] : [
                    { x1: 15, y1: 40, x2: 35, y2: 40 },  // 中间
                    { x1: 15, y1: 10, x2: 15, y2: 40 },  // 左上
                    { x1: 35, y1: 10, x2: 35, y2: 40 },  // 右上
                    { x1: 35, y1: 40, x2: 35, y2: 70 },  // 右下
                ],

            '5': [
                { x1: 15, y1: 10, x2: 35, y2: 10 },  // 顶部
                { x1: 15, y1: 40, x2: 35, y2: 40 },  // 中间
                { x1: 15, y1: 70, x2: 35, y2: 70 },  // 底部
                { x1: 15, y1: 10, x2: 15, y2: 40 },  // 左上
                { x1: 35, y1: 40, x2: 35, y2: 70 },  // 右下
            ],

            '6': isHandwritten ?
                [
                    { x1: 15, y1: 40, x2: 35, y2: 40 },  // 中间
                    { x1: 15, y1: 70, x2: 35, y2: 70 },  // 底部
                    { x1: 15, y1: 10, x2: 15, y2: 40 },  // 左上
                    { x1: 15, y1: 40, x2: 15, y2: 70 },  // 左下
                    { x1: 35, y1: 40, x2: 35, y2: 70 },  // 右下
                ] : [
                    { x1: 15, y1: 10, x2: 35, y2: 10 },  // 顶部
                    { x1: 15, y1: 40, x2: 35, y2: 40 },  // 中间
                    { x1: 15, y1: 70, x2: 35, y2: 70 },  // 底部
                    { x1: 15, y1: 10, x2: 15, y2: 40 },  // 左上
                    { x1: 15, y1: 40, x2: 15, y2: 70 },  // 左下
                    { x1: 35, y1: 40, x2: 35, y2: 70 },  // 右下
                ],

            '7': isHandwritten ?
                [
                    { x1: 15, y1: 20, x2: 35, y2: 20 },  // 顶部
                    { x1: 35, y1: 20, x2: 35, y2: 60 },  // 右竖线
                ] : [
                    { x1: 15, y1: 10, x2: 35, y2: 10 },  // 顶部
                    { x1: 35, y1: 10, x2: 35, y2: 40 },  // 右上
                    { x1: 35, y1: 40, x2: 35, y2: 70 },  // 右下
                ],

            '8': [
                { x1: 15, y1: 10, x2: 35, y2: 10 },  // 顶部
                { x1: 15, y1: 40, x2: 35, y2: 40 },  // 中间
                { x1: 15, y1: 70, x2: 35, y2: 70 },  // 底部
                { x1: 15, y1: 10, x2: 15, y2: 40 },  // 左上
                { x1: 15, y1: 40, x2: 15, y2: 70 },  // 左下
                { x1: 35, y1: 10, x2: 35, y2: 40 },  // 右上
                { x1: 35, y1: 40, x2: 35, y2: 70 },  // 右下
            ],

            '9': isHandwritten ?
                [
                    { x1: 15, y1: 10, x2: 35, y2: 10 },  // 顶部
                    { x1: 15, y1: 40, x2: 35, y2: 40 },  // 中间
                    { x1: 15, y1: 10, x2: 15, y2: 40 },  // 左上
                    { x1: 35, y1: 10, x2: 35, y2: 40 },  // 右上
                    { x1: 35, y1: 40, x2: 35, y2: 70 },  // 右下
                ] : [
                    { x1: 15, y1: 10, x2: 35, y2: 10 },  // 顶部
                    { x1: 15, y1: 40, x2: 35, y2: 40 },  // 中间
                    { x1: 15, y1: 70, x2: 35, y2: 70 },  // 底部
                    { x1: 15, y1: 10, x2: 15, y2: 40 },  // 左上
                    { x1: 35, y1: 10, x2: 35, y2: 40 },  // 右上
                    { x1: 35, y1: 40, x2: 35, y2: 70 },  // 右下
                ],

            // 运算符
            '+': [
                { x1: 25, y1: 25, x2: 25, y2: 55 },  // 竖线
                { x1: 10, y1: 40, x2: 40, y2: 40 },  // 横线
            ],

            '-': [
                { x1: 10, y1: 40, x2: 40, y2: 40 },  // 横线
            ],

            '*': [
                { x1: 15, y1: 25, x2: 35, y2: 55 },  // 左上到右下
                { x1: 35, y1: 25, x2: 15, y2: 55 },  // 右上到左下
            ],

            'x': [  // x作为乘号的显示形式
                { x1: 15, y1: 25, x2: 35, y2: 55 },  // 左上到右下
                { x1: 35, y1: 25, x2: 15, y2: 55 },  // 右上到左下
            ],

            '/': [
                { x1: 35, y1: 20, x2: 15, y2: 60 },  // 斜线（标准和手写都用两根火柴）
            ],

            '=': [
                { x1: 10, y1: 30, x2: 40, y2: 30 },  // 上横线
                { x1: 10, y1: 50, x2: 40, y2: 50 },  // 下横线
            ],

            ' ': [], // 空格
        };

        return segments[baseChar] || [];
    }

    /**
     * 创建完整等式的SVG显示
     * @param {string} equation - 等式字符串（可能包含(H)标记，如 6(H)+1=7(H)）
     * @param {boolean} useHandwritten - 是否使用手写模式（已废弃）
     * @returns {HTMLElement}
     */
    createEquationDisplay(equation, useHandwritten = false) {
        const container = document.createElement('div');
        container.className = 'matchstick-equation';
        
        // 将等式分解为tokens，支持(H)标记
        const tokens = this.parseEquation(equation);
        
        for (let token of tokens) {
            // 将*替换为x用于显示
            let displayToken = token.replace('*', 'x');
            
            if (displayToken !== ' ') {
                // 特殊处理11和(11)H
                if (displayToken === '11' || displayToken === '(11)H') {
                    const isHandwritten = displayToken === '(11)H';
                    const digit1 = this.createDigitSVG(isHandwritten ? '(1)H' : '1', false);
                    const digit2 = this.createDigitSVG(isHandwritten ? '(1)H' : '1', false);
                    digit2.style.marginLeft = '-8px'; // 让两个1靠近一些
                    container.appendChild(digit1);
                    container.appendChild(digit2);
                } else {
                    const digitSVG = this.createDigitSVG(displayToken, false);
                    container.appendChild(digitSVG);
                }
            } else {
                // 添加小间距
                const spacer = document.createElement('div');
                spacer.style.width = '4px';
                container.appendChild(spacer);
            }
        }

        return container;
    }

    /**
     * 解析等式为tokens，支持()H标记和11
     * @param {string} equation - 等式字符串
     * @returns {Array<string>} tokens数组
     */
    parseEquation(equation) {
        return tokenizeEquation(equation);
    }

    /**
     * 设置火柴棒颜色
     * @param {string} color - 颜色值
     */
    setMatchColor(color) {
        this.matchColor = color;
    }
}
