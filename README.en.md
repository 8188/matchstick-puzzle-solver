
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
- 🎮 **3D Game Page**: `game.html` includes match burning, paper-flip puzzle transition, and doodle-paper style interaction
- 🌍 **Bilingual**: Chinese/English interface switching
- 🌓 **Theme Toggle**: Light/dark themes, synchronized across main and rules pages
- 🎵 **Background Music**: Play/stop background music (local resource)

## Quick Start

```bash
npm run serve
```

Then open `http://localhost:8080` in your browser.

[Online address](https://8188.github.io/matchstick-puzzle-solver)

## Project Structure

```
matchstick-puzzle-solver/
├── src/
│   ├── core/              # Core solving modules
│   ├── modes/             # Mode definitions (standard, handwritten)
│   ├── ui/                # UI layer
│   └── utils/             # Utility modules
├── assets/                # Assets (fonts, images, music)
├── doc/                   # Documentation
├── test/                  # Test files
├── index.html             # Solver main page
├── game.html              # 3D game page
├── rules.html             # Rules display page
└── package.json           # Project config
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
- [x] **Statistics Features**: Solving time tracking (✅ v0.3)
- [x] **Puzzle Generator**: Automatically generate matchstick puzzles of varying difficulty (✅ v0.6)
- [x] **Hint System**: Provide step-by-step hints (✅ v0.6)
- [x] **Difficulty Ratings**: Evaluate difficulty based on complexity of equation (✅ v0.6), moves and solution count
- [ ] **Custom Rules**: Allow users to define custom matchstick transformation rules

## Changelog

- See the changelog: [doc/CHANGELOG.en.md](doc/CHANGELOG.en.md)

## Screenshots

![index screenshot](assets/images/index.png)

## License

MIT License

## Acknowledgments

Inspired by [narve/matchstick-puzzle-solver](https://github.com/narve/matchstick-puzzle-solver)

- [Three.js](https://threejs.org/): 3D rendering and match model/animation support
- [Vanta.js](https://www.vantajs.com/): animated background effects

---
