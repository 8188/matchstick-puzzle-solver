# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.2] - 2026-02-11

### Added
- Support for moving two matchsticks (two-match mode) in both standard and handwritten modes.
- UI move-count selector (choose 1 or 2 matches) and rules viewer improvements.
- Background music toggle and persistent preference.

### Changed
- Improved solve debounce for UI responsiveness.

### Fixed
 - Filter out single-move duplicates in two-match results and reject invalid normalized solutions (e.g., consecutive equals signs).
 - Resolve undefined set initialization bugs.
 - Filter self-solutions: Solutions no longer include the original input equation.
 - Enhanced 2-match solver with `transformAndMove` combination .
 - Fixed missing `filterOutSingleMoveSolutions` logic in test.js to ensure test behavior matches frontend UI.
 - Handle consecutive '1' sequences (e.g. `111`) by trying alternative groupings (`['11','1']` and `['1','11']`) in the mutate/tokenize process, enabling solutions like `111+1=0` → `10+1=11`.

### Tests
- Expanded test suite to 30 cases covering standard/handwritten modes with 1-match and 2-match movements.

### Docs
- Updated README files and added screenshots placeholder.

## [v0.1] - 2026-02-10

### Added
- Initial public features: standard & handwritten modes, SVG rendering, bilingual UI.
