# 火柴棒谜题求解器 🔥

[🇨🇳 中文](#) | [🇬🇧 English](./README.en.md)

**Version: v0.2**

---

一个现代化的火柴棒等式解题工具，支持标准模式和手写模式。

## 特性

- 🎯 **智能求解**: 自动找出所有可能的解
- 🎨 **双模式**: 支持标准模式和手写模式
- � **移动选择**: 支持移动1根或2根火柴的求解模式
- 📊 **规则展示**: 内置规则表查看器，清晰展示所有转换规则
- 🖼️ **SVG显示**: 精美的矢量图火柴棒显示，带真实火柴头
- 🌍 **双语支持**: 中文/英文界面切换
- 🌓 **主题切换**: 亮色/深色主题
- 📱 **响应式**: 支持桌面和移动设备
- 🎵 **背景音乐**: 支持在页面播放/关闭背景音乐（本地资源）

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

测试结果：✅ 26/26 通过（本地运行）
- 标准模式（移动1根）：6个测试用例 ✅
- 手写模式（移动1根）：7个测试用例 ✅  
- 标准模式（移动2根）：6个测试用例 ✅
- 手写模式（移动2根）：7个测试用例 ✅

## 📋 TODO List

未来版本计划实现的功能：

- [x] **双火柴模式**: 支持移动两根火柴的求解模式（✅ v0.2）
- [ ] **性能优化**:
  - 剪枝算法（提前过滤不可能的候选解）
  - 记忆化搜索（缓存已求解的子问题）
  - 启发式搜索（A* 算法优先探索接近目标的路径）
- [ ] **谜题生成器**: 自动生成不同难度的火柴棒谜题
- [ ] **统计功能**: 
  - 求解时间统计
  - 解的数量分析
  - 用户操作历史
- [ ] **提示系统**: 为用户提供分步提示
- [ ] **难度分级**: 根据移动次数和解的数量自动评估难度
- [ ] **分享功能**: 生成谜题链接，方便分享给好友
- [ ] **增加更多测试案例**: 扩展 edge-case 与手写/组合移动的自动化测试

## 更新日志

- 查看更新日志: [doc/CHANGELOG.md](doc/CHANGELOG.md)

## 截图

![index screenshot](assets/images/index.png)

## 许可证

MIT License

## 致谢

受启发于 [narve/matchstick-puzzle-solver](https://github.com/narve/matchstick-puzzle-solver)

---
