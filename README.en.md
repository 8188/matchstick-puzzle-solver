
# Matchstick Puzzle Solver 🔥

[🇨🇳 中文](./README.md) | [🇬🇧 English](#)

**Version: v0.3**

---

A modern matchstick equation solver supporting both standard and handwritten modes.

## Features

- 🎯 **Smart Solving**: Automatically finds all possible solutions
- 🎨 **Dual Modes**: Supports standard and handwritten modes
- 🔀 **Move Selection**: Supports solving by moving 1 or 2 matchsticks
- 🧮 **Advanced Syntax**: Supports signed numbers (=+, =-, leading +/-) and leading zero filtering
- 🖼️ **SVG Display**: Beautiful vector matchstick display with realistic heads
- 🌍 **Bilingual**: Chinese/English interface switching
- 🌓 **Theme Toggle**: Light/dark themes
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
├── index.html             # Interface
└── test.js                # Test script
```

## Documentation

- Handwritten mode rules: [doc/hand-written-rules.md](doc/hand-written-rules.md)
- Standard seven-segment mode rules: [doc/stantard-rules.md](doc/stantard-rules.md)

## Testing

```bash
node test.js
```

## 📋 TODO List

Planned features for future versions:

- [x] **Two-Match Mode**: Support solving by moving two matchsticks (✅ v0.2)
- [x] **Performance Optimization**: Pruning algorithms, non-blocking solving (✅ v0.3)
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
