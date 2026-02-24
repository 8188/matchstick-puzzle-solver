/**
 * 测试脚本 - 验证火柴棒求解器（标准模式 + 手写模式）
 * 在Node.js环境中运行测试
 * 
 * 使用方法: node test/test-solver.js
 */

import { StandardMode } from '../src/modes/standard.js';
import { HandwrittenMode } from '../src/modes/handwritten.js';
import { RuleManager } from '../src/core/rules.js';
import { MatchstickSolver } from '../src/core/solver.js';
import { Evaluator } from '../src/core/evaluator.js';
import { readFileSync } from 'fs';

// 加载测试用例
const testCases = JSON.parse(readFileSync('./test/cases.json', 'utf-8'));

/**
 * 打印测试结果
 */
function printResult(equation, expectedSolutions, result) {
    const success = result.solutions.length >= expectedSolutions;
    if (success) {
        console.log(`✅ ${equation} - 期望${expectedSolutions}解，得到${result.solutions.length}解`);
    } else {
        console.log(`❌ ${equation} - 期望${expectedSolutions}解，得到${result.solutions.length}解`);
    }
    result.solutions.forEach((sol, idx) => {
        const str = typeof sol === 'string' ? sol : sol.str;
        const method = typeof sol === 'string' ? '' : ` [${sol.method}]`;
        console.log(`   解${idx + 1}: ${str}${method}`);
    });
    return success;
}

/**
 * 运行测试套件
 */
async function runTests() {
    const testStartTime = performance.now();
    console.log('🧪 开始测试求解器...\n');

    let passed = 0;
    let failed = 0;

    const ruleManager = new RuleManager();

    // ========== 标准模式测试（移动1根）==========
    console.log('═══════════════════════════════════');
    console.log('📋 标准模式测试（移动1根）');
    console.log('═══════════════════════════════════\n');

    const standardMode = new StandardMode();
    ruleManager.registerMode('standard', standardMode.build());
    ruleManager.switchMode('standard');

    const solver1 = new MatchstickSolver(ruleManager, 1);

    for (const testCase of testCases.standardMode1Match) {
        const result = solver1.solve(testCase.equation, { maxMutations: testCase.maxMutations || 10000 });
        if (printResult(testCase.equation, testCase.expectedSolutions, result)) {
            passed++;
        } else {
            failed++;
        }
    }

    // ========== 手写模式测试（移动1根）==========
    console.log('\n═══════════════════════════════════');
    console.log('✍️  手写模式测试（移动1根）');
    console.log('═══════════════════════════════════\n');

    const handwrittenMode = new HandwrittenMode();
    ruleManager.registerMode('handwritten', handwrittenMode.build(),
        "0123456789+-*/= (0)H(1)H(4)H(6)H(7)H(9)H(11)H".split(" "));
    ruleManager.switchMode('handwritten');

    const solver2 = new MatchstickSolver(ruleManager, 1);

    for (const testCase of testCases.handwrittenMode1Match) {
        const result = solver2.solve(testCase.equation, { maxMutations: testCase.maxMutations || 10000 });
        if (printResult(testCase.equation, testCase.expectedSolutions, result)) {
            passed++;
        } else {
            failed++;
        }
    }

    // ========== 标准模式测试（移动2根）==========
    console.log('\n═══════════════════════════════════');
    console.log('🔥 标准模式测试（移动2根）');
    console.log('═══════════════════════════════════\n');

    ruleManager.switchMode('standard');
    const solver3 = new MatchstickSolver(ruleManager, 2);

    for (const testCase of testCases.standardMode2Match) {
        const result = solver3.solve(testCase.equation, { maxMutations: testCase.maxMutations || 10000 });
        if (printResult(testCase.equation, testCase.expectedSolutions, result)) {
            passed++;
        } else {
            failed++;
        }
    }

    // ========== 手写模式测试（移动2根）==========
    console.log('\n═══════════════════════════════════');
    console.log('🔥 手写模式测试（移动2根）');
    console.log('═══════════════════════════════════\n');

    ruleManager.switchMode('handwritten');
    const solver4 = new MatchstickSolver(ruleManager, 2);

    for (const testCase of testCases.handwrittenMode2Match) {
        const result = solver4.solve(testCase.equation, { maxMutations: testCase.maxMutations || 10000 });
        if (printResult(testCase.equation, testCase.expectedSolutions, result)) {
            passed++;
        } else {
            failed++;
        }
    }

    // ========== 测试总结 ==========
    const testEndTime = performance.now();
    const totalTests = testCases.standardMode1Match.length + 
                       testCases.handwrittenMode1Match.length + 
                       testCases.standardMode2Match.length + 
                       testCases.handwrittenMode2Match.length;

    console.log('\n═══════════════════════════════════');
    console.log(`📊 总测试结果: ${passed}/${totalTests} 通过`);
    console.log(`⏱️  总执行时间: ${(testEndTime - testStartTime).toFixed(2)}ms`);
    console.log('═══════════════════════════════════');

    if (failed > 0) {
        console.log(`\n❌ 失败: ${failed}/${totalTests}`);
        process.exit(1);
    } else {
        console.log('\n🎉 所有测试通过！');
        process.exit(0);
    }
}

// 运行测试
runTests().catch(err => {
    console.error('❌ 测试运行失败:', err);
    process.exit(1);
});
