/**
 * 火柴棒显示组件
 * 使用SVG绘制火柴棒数字和符号
 */

import { tokenizeEquation } from '../../core/tokenizer.js';
import { getDisplaySegments } from '../../core/display-segments.js';

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
        return getDisplaySegments(char);
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
