import { MatchstickDisplay3D } from './MatchstickDisplay3D.js';
import { MatchstickSolver } from '../../core/solver.js';
import { RuleManager } from '../../core/rules.js';
import { StandardMode } from '../../modes/standard.js';
import { HandwrittenMode } from '../../modes/handwritten.js';
import { Evaluator } from '../../core/evaluator.js';
import { tokenizeEquation } from '../../core/tokenizer.js';
import { I18n } from '../../utils/i18n.js';

const THREE = window.THREE;

class GameController {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.container = document.getElementById('game-container');
        this.equationDisplay = document.getElementById('equation-display');
        this.paperElement = document.getElementById('puzzle-container');
        this.answerInput = document.getElementById('answer-input');
        this.burnSfx = document.getElementById('burn-sfx');
        this.feedback = document.getElementById('feedback');
        this.levelEl = document.getElementById('level');
        this.scoreEl = document.getElementById('score');
        this.moveCountEl = document.getElementById('move-count');
        this.hintBtn = document.getElementById('hint-btn');
        this.langToggleBtn = document.getElementById('lang-toggle-game');
        this.hintSection = document.getElementById('hint-section');
        this.hintText = document.getElementById('hint-text');
        this.modeSelect = document.getElementById('mode-select');
        this.moveSelect = document.getElementById('move-select');
        this.difficultySelect = document.getElementById('difficulty-select');
        this.currentGroup = null;
        this.equationZ = 0.2;
        this.isBurning = false;
        this.isFlipping = false;
        this.nextPreparedPuzzle = null;
        this.isPreparingNextPuzzle = false;
        this.vantaEffect = null;
        this.paperDoodleCanvas = null;
        this.paperDoodleCtx = null;
        this.doodleResizeTimer = null;
        this.i18n = new I18n();
        this.i18n.loadSavedLanguage();

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.clock = new THREE.Clock();

        this.level = 1;
        this.score = 0;
        this.currentPuzzle = null;
        this.currentMode = 'standard';
        this.currentMoveCount = 1;
        this.currentDifficulty = 1;
        this.casePools = {
            standard: [],
            handwritten: [],
        };
    }

    _t(key) {
        return this.i18n.t(key);
    }

    _updateInstruction() {
        const el = document.getElementById('puzzle-instruction');
        if (!el) return;
        const template = this._t('gameInstruction');
        el.innerHTML = String(template).replace('{n}', String(this.currentMoveCount));
    }

    _applyI18n() {
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setText('game-title', this._t('gameTitle'));
        setText('label-level', this._t('gameLevel'));
        setText('label-score', this._t('gameScore'));
        setText('label-mode', this._t('gameMode'));
        setText('label-move', this._t('gameMove'));
        setText('label-difficulty', this._t('gameDifficulty'));
        setText('answer-label', this._t('gameAnswer'));
        setText('submit-btn', this._t('gameSubmit'));
        setText('hint-btn', this._t('gameHint'));
        setText('new-puzzle-btn', this._t('gameNewPuzzle'));
        setText('show-solution-btn', this._t('gameShowSolution'));
        setText('opt-mode-standard', this._t('gameModeStandard'));
        setText('opt-mode-handwritten', this._t('gameModeHandwritten'));
        setText('opt-move-1', this._t('gameMove1'));
        setText('opt-move-2', this._t('gameMove2'));

        const d = this._t('gameDifficulties');
        for (let i = 1; i <= 8; i++) {
            setText(`opt-diff-${i}`, d[i - 1]);
        }

        if (this.answerInput) this.answerInput.placeholder = this._t('gameAnswerPlaceholder');
        if (this.langToggleBtn) {
            this.langToggleBtn.textContent = this.i18n.getCurrentLanguage() === 'zh' ? 'EN' : '中';
            this.langToggleBtn.title = this._t('langToggle');
            this.langToggleBtn.setAttribute('aria-label', this._t('langToggle'));
        }
        this._updateInstruction();
    }

    _normalizeEquationString(eq) {
        const tokens = tokenizeEquation(String(eq || '').trim());
        return tokens
            .filter(t => t !== ' ')
            .map(t => (t === 'x' || t === '×') ? '*' : t)
            .join('');
    }

    _methodDescription(method) {
        const key = `gameMethod_${method || 'unknown'}`;
        const translated = this._t(key);
        if (translated !== key) return translated;
        return `${this._t('gameMethodUnknown')}${method || 'unknown'}`;
    }

    _screenToWorldAtZ(clientX, clientY, targetZ = 0) {
        const rect = this.canvas.getBoundingClientRect();
        const w = Math.max(1, rect.width);
        const h = Math.max(1, rect.height);
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const ndc = new THREE.Vector3(
            (x / w) * 2 - 1,
            -(y / h) * 2 + 1,
            0.5
        );
        ndc.unproject(this.camera);
        const dir = ndc.sub(this.camera.position).normalize();
        const t = (targetZ - this.camera.position.z) / dir.z;
        return this.camera.position.clone().add(dir.multiplyScalar(t));
    }

    _updateEquationLayout() {
        if (!this.currentGroup) return;

        const rect = this.equationDisplay.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const isNarrow = rect.width < 560;
        const sidePaddingPx = isNarrow ? 6 : 12;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const worldCenter = this._screenToWorldAtZ(centerX, centerY, this.equationZ);
        this.currentGroup.position.copy(worldCenter);

        const worldLeft = this._screenToWorldAtZ(rect.left, centerY, this.equationZ);
        const worldRight = this._screenToWorldAtZ(rect.right, centerY, this.equationZ);
        const worldTop = this._screenToWorldAtZ(centerX, rect.top, this.equationZ);
        const worldBottom = this._screenToWorldAtZ(centerX, rect.bottom, this.equationZ);
        const targetWidth = worldRight.distanceTo(worldLeft) * 0.9;
        const targetHeight = worldTop.distanceTo(worldBottom) * 0.72;

        const baseSize = this.currentGroup.userData.baseSize;
        if (baseSize && baseSize.x > 0 && baseSize.y > 0) {
            const scaleX = targetWidth / baseSize.x;
            const scaleY = targetHeight / baseSize.y;
            const minScale = isNarrow ? 0.18 : 0.35;
            const s = Math.max(minScale, Math.min(scaleX, scaleY, 2.8));
            this.currentGroup.scale.setScalar(s);

            // 使用当前包围盒进行“真实左对齐”，确保从 puzzle 左侧开始
            const leftAnchor = this._screenToWorldAtZ(rect.left + sidePaddingPx, centerY, this.equationZ);
            const rightAnchor = this._screenToWorldAtZ(rect.right - sidePaddingPx, centerY, this.equationZ);

            let box = new THREE.Box3().setFromObject(this.currentGroup);
            let dx = leftAnchor.x - box.min.x;
            this.currentGroup.position.x += dx;

            // 二次自适应：左对齐后若仍超出右边界，继续缩小
            box = new THREE.Box3().setFromObject(this.currentGroup);
            const availableWidth = Math.max(0.0001, rightAnchor.x - leftAnchor.x);
            const currentWidth = Math.max(0.0001, box.max.x - box.min.x);
            if (currentWidth > availableWidth) {
                const fit = (availableWidth / currentWidth) * 0.985;
                const fitScale = Math.max(0.14, this.currentGroup.scale.x * fit);
                this.currentGroup.scale.setScalar(fitScale);

                box = new THREE.Box3().setFromObject(this.currentGroup);
                dx = leftAnchor.x - box.min.x;
                this.currentGroup.position.x += dx;
            }
        }
    }

    _startBurnSfx() {
        if (!this.burnSfx) return;
        this.burnSfx.loop = true;
        this.burnSfx.volume = 0.45;
        this.burnSfx.currentTime = 0;
        this.burnSfx.play().catch(() => {});
    }

    _stopBurnSfx() {
        if (this.burnSfx) {
            this.burnSfx.pause();
            this.burnSfx.currentTime = 0;
        }
    }

    _initVantaBackground() {
        if (!window.THREE || !window.VANTA || !window.VANTA.CELLS) return;
        if (this.vantaEffect) {
            this.vantaEffect.destroy();
            this.vantaEffect = null;
        }

        try {
            this.vantaEffect = window.VANTA.CELLS({
                el: document.body,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200,
                minWidth: 200,
                scale: 1,
                scaleMobile: 1,
                color1: 0x008c8c,
                color2: 0xf2e735,
                size: 1.5,
                speed: 1,
                backgroundColor: 0x060b16,
            });
        } catch (err) {
            console.warn('Vanta CELLS init failed:', err);
            this.vantaEffect = null;
        }
    }

    _initPaperDoodles() {
        if (!this.paperElement) return;

        let canvas = this.paperElement.querySelector('#paper-doodles');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'paper-doodles';
            this.paperElement.appendChild(canvas);
        }

        this.paperDoodleCanvas = canvas;
        this.paperDoodleCtx = canvas.getContext('2d');
        this._drawPaperDoodles();
    }

    _drawPaperDoodles() {
        if (!this.paperDoodleCanvas || !this.paperDoodleCtx || !this.paperElement) return;

        const rect = this.paperElement.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));

        this.paperDoodleCanvas.width = Math.floor(w * dpr);
        this.paperDoodleCanvas.height = Math.floor(h * dpr);
        this.paperDoodleCanvas.style.width = `${w}px`;
        this.paperDoodleCanvas.style.height = `${h}px`;

        const ctx = this.paperDoodleCtx;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const inks = [
            'rgba(20, 40, 95, 0.22)',
            'rgba(55, 25, 90, 0.2)',
            'rgba(85, 20, 20, 0.16)',
            'rgba(30, 70, 60, 0.2)',
        ];
        const scribbleCount = 7 + Math.floor(Math.random() * 9);

        for (let i = 0; i < scribbleCount; i++) {
            ctx.strokeStyle = inks[Math.floor(Math.random() * inks.length)];
            ctx.lineWidth = 0.8 + Math.random() * 2.2;
            ctx.beginPath();
            const x0 = Math.random() * w;
            const y0 = Math.random() * h;
            ctx.moveTo(x0, y0);
            const seg = 2 + Math.floor(Math.random() * 4);
            for (let s = 0; s < seg; s++) {
                const cx = x0 + (Math.random() - 0.5) * (w * 0.28);
                const cy = y0 + (Math.random() - 0.5) * (h * 0.22);
                const ex = x0 + (Math.random() - 0.5) * (w * 0.36);
                const ey = y0 + (Math.random() - 0.5) * (h * 0.28);
                ctx.quadraticCurveTo(cx, cy, ex, ey);
            }
            ctx.stroke();
        }

        const marks = ['?', '✓', '!', 'x', '2+3=5', '7-1=6', 'a+b', '∴'];
        const markCount = 4 + Math.floor(Math.random() * 6);
        for (let i = 0; i < markCount; i++) {
            const txt = marks[Math.floor(Math.random() * marks.length)];
            const fs = 12 + Math.floor(Math.random() * 16);
            ctx.font = `${fs}px "Segoe Script", "Comic Sans MS", cursive`;
            ctx.fillStyle = inks[Math.floor(Math.random() * inks.length)];
            const x = 14 + Math.random() * (w - 28);
            const y = 22 + Math.random() * (h - 32);
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((Math.random() - 0.5) * 0.7);
            ctx.fillText(txt, 0, 0);
            ctx.restore();
        }
    }

    _scheduleDoodleRedraw(delay = 160) {
        if (this.doodleResizeTimer) {
            window.clearTimeout(this.doodleResizeTimer);
        }
        this.doodleResizeTimer = window.setTimeout(() => {
            if (!this.isFlipping) {
                this._drawPaperDoodles();
            }
            this.doodleResizeTimer = null;
        }, delay);
    }

    async init() {
        this._setupThree();
        this._setupRules();
        this._bindUI();
        this._initPaperDoodles();
        this.currentMode = this.modeSelect?.value === 'handwritten' ? 'handwritten' : 'standard';
        this.currentMoveCount = Number(this.moveSelect?.value || 1);
        this.currentDifficulty = Number(this.difficultySelect?.value || 1);
        this.ruleManager.switchMode(this.currentMode);
        this.display3D.mode = this.currentMode;
        this._applyI18n();
        await this._loadCases();
        this._loadPuzzle();
        this._initVantaBackground();
        this._loop();
    }

    _setupThree() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 0.25, 8.0);
        this.camera.lookAt(0, 0, 0);

        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(2, 3, 2);
        this.scene.add(dir);

        this.display3D = new MatchstickDisplay3D(this.scene, 'standard');

        window.addEventListener('resize', () => this._onResize());
    }

    _setupRules() {
        this.ruleManager = new RuleManager();
        this.ruleManager.registerMode(StandardMode.getName(), new StandardMode());
        this.ruleManager.registerMode(HandwrittenMode.getName(), new HandwrittenMode());
        this.ruleManager.switchMode(StandardMode.getName());
        this.solver = new MatchstickSolver(this.ruleManager, 1);
    }

    async _loadCases() {
        try {
            const res = await fetch('test/cases.json');
            if (res.ok) {
                const json = await res.json();
                const collect = (arr = []) => arr
                    .map(item => ({
                        eq: item.equation || item.eq || item.question || item[0],
                        moves: item.moves || (item.maxMutations ? 2 : 1),
                    }))
                    .filter(item => !!item.eq);

                this.casePools.standard = [
                    ...collect(json.standardMode1Match),
                    ...collect(json.standardMode2Match),
                ];
                this.casePools.handwritten = [
                    ...collect(json.handwrittenMode1Match),
                    ...collect(json.handwrittenMode2Match),
                ];
            }
        } catch (e) {
            console.info('Use built-in puzzles fallback.', e);
        }
    }

    _numberLengthsFromEquation(eq) {
        const plain = String(eq).replace(/\((\d+)\)H/g, '$1');
        const nums = plain.match(/\d+/g) || [];
        return nums.map(n => n.length);
    }

    _matchDifficulty(eq, level) {
        const lengths = this._numberLengthsFromEquation(eq);
        const two = lengths.filter(n => n === 2).length;
        const three = lengths.filter(n => n === 3).length;

        switch (Number(level)) {
            case 1: return lengths.length === 3 && lengths.every(n => n === 1);
            case 2: return lengths.length === 3 && two === 1;
            case 3: return lengths.length === 3 && two === 2;
            case 4: return lengths.length === 3 && two === 3;
            case 5: return lengths.length === 4;
            case 6: return lengths.length >= 3 && three === 1;
            case 7: return lengths.length === 4 && two >= 1;
            case 8: return lengths.length >= 3 && three === 1 && two >= 1;
            default: return true;
        }
    }

    _randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    _randByLen(len) {
        if (len <= 1) return String(this._randInt(0, 9));
        if (len === 2) return String(this._randInt(10, 99));
        return String(this._randInt(100, 999));
    }

    _generateLengthsByDifficulty(level) {
        switch (Number(level)) {
            case 1: return [1, 1, 1];
            case 2: return [2, 1, 1];
            case 3: return [2, 2, 1];
            case 4: return [2, 2, 2];
            case 5: return [1, 1, 1, 1];
            case 6: return [3, 1, 1];
            case 7: return [2, 1, 1, 1];
            case 8: return [3, 2, 1];
            default: return [1, 1, 1];
        }
    }

    _generateRandomEquation(level) {
        const lens = this._generateLengthsByDifficulty(level);
        const ops = ['+', '-'];

        if (Number(level) === 5 || Number(level) === 7) {
            const a = this._randByLen(lens[0]);
            const b = this._randByLen(lens[1]);
            const c = this._randByLen(lens[2]);
            const d = this._randByLen(lens[3]);
            const op1 = ops[this._randInt(0, ops.length - 1)];
            const op2 = ops[this._randInt(0, ops.length - 1)];
            return `${a}${op1}${b}${op2}${c}=${d}`;
        }

        const shuffled = [...lens].sort(() => Math.random() - 0.5);
        const a = this._randByLen(shuffled[0]);
        const b = this._randByLen(shuffled[1]);
        const c = this._randByLen(shuffled[2]);
        const op = ops[this._randInt(0, ops.length - 1)];
        return `${a}${op}${b}=${c}`;
    }

    _toHandwrittenMixed(eq) {
        const map = { '0': '(0)H', '1': '(1)H', '4': '(4)H', '6': '(6)H', '7': '(7)H', '9': '(9)H' };
        return String(eq).replace(/[014679]/g, (d) => (Math.random() < 0.35 ? map[d] : d));
    }

    _preparePuzzleSync(excludeEq = null) {
        const pool = this.casePools[this.currentMode] || [];

        // 先从题库随机挑符合难度的
        const candidates = pool
            .filter(p => this._matchDifficulty(p.eq, this.currentDifficulty))
            .sort(() => Math.random() - 0.5);

        for (const puzzle of candidates) {
            if (!puzzle?.eq) continue;
            if (excludeEq && puzzle.eq === excludeEq) continue;
            if (Evaluator.evaluate(tokenizeEquation(puzzle.eq))) continue;

            this.solver.moveCount = this.currentMoveCount;
            const solutions = this.solver.solve(puzzle.eq, { maxMutations: 12000 }).solutions || [];
            if (solutions.length > 0) {
                return {
                    puzzle,
                    solutions,
                    solutionSet: new Set(solutions.map(s => this._normalizeEquationString(s.str || s.solution || s))),
                };
            }
        }

        // 再动态生成随机题（保证不是固定题）
        for (let i = 0; i < 320; i++) {
            let eq = this._generateRandomEquation(this.currentDifficulty);
            if (this.currentMode === 'handwritten') {
                eq = this._toHandwrittenMixed(eq);
            }
            if (!eq || (excludeEq && eq === excludeEq)) continue;
            if (!this._matchDifficulty(eq, this.currentDifficulty)) continue;
            if (Evaluator.evaluate(tokenizeEquation(eq))) continue;

            const puzzle = { eq, moves: this.currentMoveCount };
            this.solver.moveCount = this.currentMoveCount;
            const solutions = this.solver.solve(eq, { maxMutations: 14000 }).solutions || [];
            if (solutions.length > 0) {
                return {
                    puzzle,
                    solutions,
                    solutionSet: new Set(solutions.map(s => this._normalizeEquationString(s.str || s.solution || s))),
                };
            }
        }

        return null;
    }

    _scheduleNextPuzzlePreparation() {
        if (this.isPreparingNextPuzzle || this.nextPreparedPuzzle) return;
        this.isPreparingNextPuzzle = true;
        window.setTimeout(() => {
            this.nextPreparedPuzzle = this._preparePuzzleSync(this.currentPuzzle?.eq || null);
            this.isPreparingNextPuzzle = false;
        }, 0);
    }

    _bindUI() {
        document.getElementById('submit-btn').addEventListener('click', () => this._submit());
        document.getElementById('answer-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._submit();
        });
        document.getElementById('new-puzzle-btn').addEventListener('click', () => this._loadPuzzle());
        document.getElementById('show-solution-btn').addEventListener('click', () => this._showSolution());
        this.hintBtn.addEventListener('click', () => this._giveHint());
        this.langToggleBtn?.addEventListener('click', () => {
            const newLang = this.i18n.getCurrentLanguage() === 'zh' ? 'en' : 'zh';
            this.i18n.setLanguage(newLang);
            this._applyI18n();
        });

        if (this.modeSelect) {
            this.modeSelect.addEventListener('change', () => {
                this.currentMode = this.modeSelect.value === 'handwritten' ? 'handwritten' : 'standard';
                this.ruleManager.switchMode(this.currentMode);
                this.display3D.mode = this.currentMode;
                this.nextPreparedPuzzle = null;
                this._loadPuzzle();
            });
        }

        if (this.moveSelect) {
            this.moveSelect.addEventListener('change', () => {
                this.currentMoveCount = Number(this.moveSelect.value || 1);
                this._updateInstruction();
                this.nextPreparedPuzzle = null;
                this._loadPuzzle();
            });
        }

        if (this.difficultySelect) {
            this.difficultySelect.addEventListener('change', () => {
                this.currentDifficulty = Number(this.difficultySelect.value || 1);
                this.nextPreparedPuzzle = null;
                this._loadPuzzle();
            });
        }
    }

    _onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this._updateEquationLayout();
        this._scheduleDoodleRedraw();
        if (this.vantaEffect && this.vantaEffect.resize) {
            this.vantaEffect.resize();
        }
    }

    _loadPuzzle({ redrawDoodles = true } = {}) {
        this.display3D.clear();
        this.isBurning = false;
        this._stopBurnSfx();
        this.feedback.classList.add('hidden');
        this.hintText.textContent = '';
        if (redrawDoodles) {
            this._drawPaperDoodles();
        }

        let prepared = this.nextPreparedPuzzle;
        this.nextPreparedPuzzle = null;
        if (!prepared) {
            prepared = this._preparePuzzleSync();
        }
        if (!prepared) {
            this._showFeedback(this._t('gameNoPuzzle'), false);
            return;
        }

        this.currentPuzzle = prepared.puzzle;
        this._solutions = prepared.solutions;
        this._solutionSet = prepared.solutionSet;
        this.moveCountEl.textContent = this.currentMoveCount;
        this._updateInstruction();

        // render equation in 3D
        const group = this.display3D.createEquation3D(this.currentPuzzle.eq);
        this.scene.add(group);
        this.currentGroup = group;
        const size = new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3());
        this.currentGroup.userData.baseSize = size;
        this._updateEquationLayout();

        // 后台准备下一题（保证有解）
        this._scheduleNextPuzzlePreparation();

        this.answerInput.value = '';
        this.answerInput.placeholder = this._t('gameAnswerPlaceholder');
        this.answerInput.focus();
    }

    _submit() {
        const ans = (this.answerInput.value || '').trim();
        if (this.isBurning) return;
        if (!ans) {
            this._showFeedback(this._t('gameEnterAnswer'), false);
            return;
        }

        const normalizedInput = ans.replace(/[x×]/g, '*');
        const tokens = tokenizeEquation(normalizedInput);
        const legals = this.ruleManager.getRules().legals || this.ruleManager.getLegals();
        const illegal = tokens.some(t => !legals.includes(t));
        if (illegal) {
            this._showFeedback(this._t('gameIllegalChar'), false);
            return;
        }

        if (!Evaluator.evaluate(tokens)) {
            this._showFeedback(this._t('gameInvalidEquation'), false);
            return;
        }

        // 如果原式已经成立，不算作解
        if (Evaluator.evaluate(tokenizeEquation(this.currentPuzzle.eq)) && normalizedInput === this.currentPuzzle.eq.replace(/[x×]/g, '*')) {
            this._showFeedback(this._t('gameNeedModify'), false);
            return;
        }

        const normalizedAnswer = this._normalizeEquationString(normalizedInput);
        const isSolution = this._solutions.length === 0
            ? true
            : this._solutionSet.has(normalizedAnswer);

        if (isSolution) {
            this._onCorrect();
        } else {
            this._showFeedback(this._t('gameNotMatched'), false);
        }
    }

    _onCorrect() {
        this.score += 100;
        this.level += 1;
        this.scoreEl.textContent = this.score;
        this.levelEl.textContent = this.level;
        this.isBurning = true;

        this._showFeedback(this._t('gameCorrectBurning'), true);
        this.display3D.igniteAll();
        this._startBurnSfx();
        this._scheduleNextPuzzlePreparation();
    }

    _flipToNextPuzzle() {
        if (this.isFlipping || !this.paperElement) return;
        this.isFlipping = true;
        this.paperElement.classList.add('is-flipping');

        window.setTimeout(() => {
            this._loadPuzzle({ redrawDoodles: false });
        }, 380);

        window.setTimeout(() => {
            this.paperElement.classList.remove('is-flipping');
            this._drawPaperDoodles();
            this.isFlipping = false;
        }, 860);
    }

    _showSolution() {
        if (!this._solutions || this._solutions.length === 0) {
            this._showFeedback(this._t('gameNoSolution'), false);
            return;
        }
        const first = this._solutions[0];
        const s = first.str || first.solution || first;
        this.answerInput.value = this._normalizeEquationString(s).replace(/\*/g, 'x');
        this.hintText.textContent = this._t('gameSolutionPrefix') + this._methodDescription(first.method);
    }

    _giveHint() {
        if (!this._solutions || this._solutions.length === 0) {
            this._showFeedback(this._t('gameNoHint'), false);
            return;
        }
        const pick = this._solutions[Math.floor(Math.random() * this._solutions.length)];
        this.hintText.textContent = this._t('gameHintPrefix') + this._methodDescription(pick.method);
    }

    _showFeedback(msg, ok) {
        this.feedback.textContent = msg;
        this.feedback.classList.remove('hidden');
        this.feedback.classList.toggle('success', !!ok);
        this.feedback.classList.toggle('error', !ok);
    }

    _loop() {
        requestAnimationFrame(() => this._loop());
        const delta = this.clock.getDelta();

        // 轻微摆动动画
        if (this.currentGroup) {
            this.currentGroup.rotation.y = 0;
        }

        this.display3D.update(delta);

        if (this.isBurning && this.display3D.areAllBurned()) {
            this._flipToNextPuzzle();
        }

        this._updateEquationLayout();

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const game = new GameController();
    game.init();
});
