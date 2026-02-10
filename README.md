# 火柴棒谜题求解器 🔥

[🇨🇳 中文](#) | [🇬🇧 English](./README.en.md)

**Version: v0.1.0**

---

一个现代化的火柴棒等式解题工具，支持标准模式和手写模式。

## 特性

- 🎯 **智能求解**: 自动找出所有可能的解
- 🎨 **双模式**: 支持标准模式和手写模式
- 🖼️ **SVG显示**: 精美的矢量图火柴棒显示，带真实火柴头
- 🌍 **双语支持**: 中文/英文界面切换
- 🌓 **主题切换**: 亮色/深色主题
- 📱 **响应式**: 支持桌面和移动设备

## 快速开始

```bash
# 使用Python
python -m http.server 8080

# 或使用Node.js
npx http-server -p 8080
```

然后访问：`http://localhost:8080/index.html`

## 项目结构

```
matchstick-puzzle-solver/
├── src/
│   ├── core/              # 核心模块
│   ├── modes/             # 模式定义
│   ├── ui/                # UI层
│   └── utils/             # 工具模块
├── assets/                # 资源文件
├── doc/                   # 文档
├── index.html             # 界面
└── test.js                # 测试脚本
```

## 文档

- 手写模式规则: [doc/hand-written-rules.md](doc/hand-written-rules.md)
- 标准七段数码管模式规则: [doc/stantard-rules.md](doc/stantard-rules.md)

## 测试

```bash
node test.js
```

测试结果：✅ 13/13 通过

## 📋 TODO List

未来版本计划实现的功能：

- [ ] **双火柴模式**: 支持移动两根火柴的求解模式
- [ ] **谜题生成器**: 自动生成不同难度的火柴棒谜题
- [ ] **统计功能**: 
  - 求解时间统计
  - 解的数量分析
  - 用户操作历史
- [ ] **提示系统**: 为用户提供分步提示
- [ ] **难度分级**: 根据移动次数和解的数量自动评估难度
- [ ] **分享功能**: 生成谜题链接，方便分享给好友

## License

MIT License

## 致谢

Based on [Original Project](https://github.com/narve/matchstick-puzzle-solver)

---
