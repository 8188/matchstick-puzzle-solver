# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.6] - 2026-03-08

### Added
- Added `game.html`.
- Added a new entry button in `index.html` to open the game page (🎮).
- Added GitHub Actions cloud packaging workflow (`android-release.yml`) to produce Android Release APK artifacts.

### Changed
- Centralized game-page and result-list related texts into `src/utils/i18n.js` for unified bilingual i18n management.
- Extracted shared 2D/3D digit segment definitions into `src/core/display-segments.js`, and reused them in both `MatchstickDisplay` and `MatchstickDisplay3D`.
- Adjusted `game.html` layout scrolling behavior for small screens and tall pages to keep bottom action buttons reachable.
- Improved background coverage strategy in `game.html` during scroll to fix missing background area in lower viewport sections.

## [v0.5] - 2026-03-03

### Performance
- **Deep solver refactor** (`solver.js`): test suite execution time reduced from **130 seconds** to **700 ms**, approximately **180× faster**:
  - **Rule cache**: Added `_buildRuleCache()` which, at the start of each `solve()` call, expands all rule `Set`s into `Map<string, string[]>` once, eliminating repeated `getRules()` calls and `[...set]` spread overhead inside every transformation method
  - **Lazy generation (Generators)**: All transformation methods (`transforms`, `moves`, `combinedMoves`, `transformTwice`, etc. — 9 strategies total) rewritten as `function*` generators that `yield` candidates on demand instead of building full result arrays upfront
  - **Validate-as-you-go**: The main loop in `solve()` runs `isQuickValid` + `Evaluator.evaluate` immediately after each candidate is yielded; invalid candidates are skipped without waiting for full generation to complete
  - **Unified strategy interface**: Added `_strategiesSingle` / `_strategiesDouble` that return `{candidates, method}` lists iterated uniformly by `solve()`; removed the now-redundant `mutateTagged`, `mutate`, `mutateSingle`, `mutateDouble`, and `filterOutSingleMoveSolutions`

## [v0.4] - 2026-03-02

### Added
- **Move-2 Algorithm Enhancement**:
  - Added `removeTwoAddTwo` method: remove 2 matchsticks + add 1 matchstick + add 1 matchstick
  - Solves problems like `94-35=48 → 91 - 95 = 4 - 8` (remove 2 from 4 to get 1, add 1 to 3 to get 9, add 1 to space to get -)
  - Completed all possible transformation combinations for move-2 mode
- **Test Refactoring**:
  - Moved test files to `test/` folder, renamed to `test-solver.js`
  - Test data extracted to `test/cases.json` for easier test case additions
  - Test code refactored to import from `src/modes`, eliminating code duplication
- **Rules Page Enhancement**:
  - Move-2 mode now displays "Move 1 & Remove 1" and "Move 1 & Add 1" columns
  - Rules table dynamically adjusts column display based on move count
- **Detailed Solution Display**:
  - Each solution now shows method badge (e.g. "Transform", "2×Move", etc.)
  - Added method detailed descriptions (bilingual)
  - Display computation time (milliseconds)
- **Advanced Configuration**:
  - Search limit input box (default 10000, range 1000-500000)
  - Filter signed solutions button (optionally filter solutions with +/- signs)
  - Number input uses digital-7 font, spinner buttons hidden
- **Theme Synchronization**:
  - Main page and rules page now synchronize theme switching via localStorage
  - Maintain theme consistency across both pages
- **Test Cases**:
  - test.js supports new solution format, displays method tags for each solution
  - Added two new test cases: `94-35=48` (covers `moveAddThenSub`) and `1+7=8+8` (covers `removeRemoveAdd2`)

### Changed
- Unified button styles: Adjusted mode selector button sizes for more compact layout
- Removed auto-solving on mode/move count switch: Solutions now only computed when clicking solve button
- `solve()` return structure changed: `solutions` now in `Array<{str, method}>` format

### Fixed
- Display computation time even when no solutions found

### Docs
- Updated README and CHANGELOG in both Chinese and English

## [v0.3] - 2026-02-16

### Added
- **Performance Optimization**:
  - Implemented `isQuickValid()` pruning algorithm to filter invalid candidates early
  - Added `maxMutations` parameter to limit search space (affects solution completeness and overall speed)
  - Async solving: Made `solve()` method non-blocking to prevent browser freezing
  - 24x performance improvement: Test suite execution time reduced from 132s to 5.4s
- **Advanced Syntax Support**:
  - Support for signed numbers after equals: `=+`, `=-` (e.g., `19-3-9=+7`)
  - Support for leading signs in expressions: `+`, `-` (e.g., `+2+3=5`)
  - Filter leading zeros: Reject invalid numbers like `09`, `08`
- **Debug Features**:
  - Added `?debug=1` URL parameter to enable debug mode
  - Console displays solving time, solution count, total mutations, and other statistics
  - Frontend `performance.now()` precision timing

### Changed
- Optimized dynamic `maxMutations` settings in `app.js`: Longer expressions use larger search space
- Enhanced test output formatting: Clearer grouping and execution time display

### Fixed
- Fixed debug logging in `handwritten.js` displaying incorrect characters

### Docs
- Fixed rule table discrepancies in `doc/stantard-rules.md`
- Synchronized `test.js` with browser code logic to ensure test environment consistency

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
- Enhanced 2-match solver with `transformAndMove` combination.
- Fixed missing `filterOutSingleMoveSolutions` logic in test.js to ensure test behavior matches frontend UI.
- Handle consecutive '1' sequences (e.g. `111`) by trying alternative groupings (`['11','1']` and `['1','11']`) in the mutate/tokenize process, enabling solutions like `111+1=0` → `10+1=11`.

### Tests
- Expanded test suite to 30 cases covering standard/handwritten modes with 1-match and 2-match movements.

### Docs
- Updated README files and added screenshots placeholder.

## [v0.1] - 2026-02-10

### Added
- Initial public features: standard & handwritten modes, SVG rendering, bilingual UI.
