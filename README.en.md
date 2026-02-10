# Matchstick Puzzle Solver 🔥

[🇨🇳 中文](./README.md) | [🇬🇧 English](#)

**Version: v0.1.0**

---

A modern matchstick puzzle solver with standard and handwritten modes.

## Features

- 🎯 **Smart Solving**: Automatically finds all possible solutions
- 🎨 **Dual Modes**: Supports standard and handwritten modes
- 🖼️ **SVG Display**: Beautiful vector graphics with realistic matchstick heads
- 🌍 **Bilingual**: Chinese/English interface switching
- 🌓 **Theme Toggle**: Light/dark themes
- 📱 **Responsive**: Desktop and mobile support

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
│   ├── ui/                # UI layers
│   └── utils/             # Utilities
├── assets/                # Assets
├── doc/                   # Documentation
├── index.html             # Interface
└── test.js                # Tests
```

## Documentation

- Handwritten-style rules: [doc/hand-written-rules.md](doc/hand-written-rules.md)
- Standard seven-segment rules: [doc/stantard-rules.md](doc/stantard-rules.md)

## Testing

```bash
node test.js
```

Test result: ✅ 13/13 passed

## 📋 TODO List

Planned features for future versions:

- [ ] **Two-Match Mode**: Support solving puzzles by moving two matchsticks
- [ ] **Puzzle Generator**: Automatically generate puzzles with different difficulty levels
- [ ] **Statistics Features**: 
  - Solving time tracking
  - Solution count analysis
  - User operation history
- [ ] **Hint System**: Provide step-by-step hints for users
- [ ] **Difficulty Ratings**: Auto-evaluate difficulty based on moves and solution count
- [ ] **Share Function**: Generate puzzle links to share with friends

## License

MIT License

## Acknowledgments

Based on [Original Project](https://github.com/narve/matchstick-puzzle-solver)

---
