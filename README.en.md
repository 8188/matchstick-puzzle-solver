
# Matchstick Puzzle Solver 🔥

[🇨🇳 中文](./README.md) | [🇬🇧 English](#)

**Version: v0.1**

---

A modern matchstick equation solver supporting both standard and handwritten modes.

## Features

- 🎯 **Smart Solving**: Automatically finds all possible solutions
- 🎨 **Dual Modes**: Supports standard and handwritten modes
- 🔀 **Move Selection**: Supports solving by moving 1 or 2 matchsticks
- 📊 **Rule Viewer**: Built-in rule table viewer for all transformation rules
- 🖼️ **SVG Display**: Beautiful vector matchstick display with realistic heads
- 🌍 **Bilingual**: Chinese/English interface switching
- 🌓 **Theme Toggle**: Light/dark themes
- 📱 **Responsive**: Desktop and mobile support
- 🎵 **Background Music**: Play/stop background music (local resource)

## Quick Start

```bash
# Using Python
python -m http.server 8080

# Or using Node.js
npx http-server -p 8080
```

Then visit: `http://localhost:8080/index.html`

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
- [ ] **Performance Optimization**:
  - Pruning algorithm (filter impossible candidates early)
  - Memoization (cache solved subproblems)
  - Heuristic search (A* algorithm to prioritize promising paths)
- [ ] **Puzzle Generator**: Automatically generate matchstick puzzles of varying difficulty
- [ ] **Statistics Features**: 
  - Solving time tracking
  - Solution count analysis
  - User operation history
- [ ] **Hint System**: Provide step-by-step hints
- [ ] **Difficulty Ratings**: Auto-evaluate difficulty based on moves and solution count
- [ ] **Share Function**: Generate puzzle links for sharing
- [ ] **Add more test cases**: Expand edge-case and handwritten/combined-move automated tests

## Changelog

- See the changelog: [doc/CHANGELOG.en.md](doc/CHANGELOG.en.md)

## Screenshots

![index screenshot](assets/images/index.png)

## License

MIT License

## Acknowledgments

Inspired by [narve/matchstick-puzzle-solver](https://github.com/narve/matchstick-puzzle-solver)

---
