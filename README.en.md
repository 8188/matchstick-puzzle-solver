
# Matchstick Puzzle Solver 🔥

[🇨🇳 中文](./README.md) | [🇬🇧 English](#)

**Version: v0.5**

---

A modern matchstick equation solver supporting both standard and handwritten modes.

## Features

- 🎯 **Smart Solving**: Automatically finds all possible solutions
- 🎨 **Dual Modes**: Supports standard and handwritten modes
- 🔀 **Move Selection**: Supports solving by moving 1 or 2 matchsticks
- 🧮 **Advanced Syntax**: Supports signed numbers (=+, =-, leading +/-) and leading zero filtering
- 🔧 **Advanced Configuration**: 
  - **Search Limit**: Set maximum search iterations (default 10000, range 1000-500000), affects solving speed and completeness
  - **Filter Signed Solutions**: Optionally filter out equations with signs (like `+5-3=2` or `5-3=+2`)
- 📊 **Detailed Display**: Shows solving method, descriptions, and computation time
- 🖼️ **SVG Display**: Beautiful vector matchstick display with realistic heads
- 🌍 **Bilingual**: Chinese/English interface switching
- 🌓 **Theme Toggle**: Light/dark themes, synchronized across main and rules pages
- 🎵 **Background Music**: Play/stop background music (local resource)

## Quick Start

Open `index.html` directly in your browser.

[Online address](https://8188.github.io/matchstick-puzzle-solver)

## Project Structure

```
matchstick-puzzle-solver/
├── src/
│   ├── core/              # Core modules
│   ├── modes/             # Mode definitions
│   ├── ui/                # UI layer
│   └── utils/             # Utility modules
├── assets/                # Assets
├── doc/                   # Documentation
├── test/                  # Test files
└── index.html             # Interface
```

## Documentation

- Handwritten mode rules: [doc/hand-written-rules.md](doc/hand-written-rules.md)
- Standard seven-segment mode rules: [doc/stantard-rules.md](doc/stantard-rules.md)

## Testing

```bash
node test/test-solver.js
# or use npm
npm test
```

## 📋 TODO List

Planned features for future versions:

- [x] **Two-Match Mode**: Support solving by moving two matchsticks (✅ v0.2)
- [x] **Performance Optimization**: Pruning algorithms, non-blocking solving (✅ v0.3), Rule cache + generator lazy evaluation, 180× speedup (✅ v0.5)
- [x] **Statistics Features**: Solving time tracking (✅ v0.3, debug mode)
- [ ] **Custom Rules**: Allow users to define custom matchstick transformation rules
- [ ] **Puzzle Generator**: Automatically generate matchstick puzzles of varying difficulty
- [ ] **Hint System**: Provide step-by-step hints
- [ ] **Difficulty Ratings**: Auto-evaluate difficulty based on moves and solution count

## Changelog

- See the changelog: [doc/CHANGELOG.en.md](doc/CHANGELOG.en.md)

## Screenshots

![index screenshot](assets/images/index.png)

## License

MIT License

## Acknowledgments

Inspired by [narve/matchstick-puzzle-solver](https://github.com/narve/matchstick-puzzle-solver)

---
