/**
 * 3D火柴棒显示组件
 * 使用Three.js创建3D火柴棒模型
 */

import { tokenizeEquation } from '../../core/tokenizer.js';
import { getDisplaySegments } from '../../core/display-segments.js';

const THREE = window.THREE;

export class MatchstickDisplay3D {
    constructor(scene, mode = 'standard') {
        this.scene = scene;
        this.mode = mode;
        this.matchsticks = []; // 存储所有火柴棒mesh
        this.digitGroups = []; // 存储数字组
        this.equationRoot = null;
        
        // 火柴棒尺寸参数
        this.stickWidth = 0.1;
        this.stickDepth = 0.12;
        this.stickSegments = 10;
        this.headRadius = 0.11;
        this.unitScale = 0.03; // 将 SVG 坐标映射到 Three.js 世界坐标
        this._time = 0;

        this.woodTexture = this._createWoodTexture();
        this.headTexture = this._createHeadTexture();
        this.ashTexture = this._createAshTexture();
        this.flameTexture = this._createFlameTexture();

        this.baseStickMaterial = new THREE.MeshStandardMaterial({
            map: this.woodTexture,
            bumpMap: this.woodTexture,
            roughnessMap: this.woodTexture,
            bumpScale: 0.05,
            color: 0xe9c995,
            roughness: 0.88,
            metalness: 0.02,
        });

        this.baseHeadMaterial = new THREE.MeshStandardMaterial({
            map: this.headTexture,
            bumpMap: this.headTexture,
            bumpScale: 0.08,
            color: 0xea554a,
            roughness: 0.9,
            metalness: 0.0,
        });

        this.baseHeadNeckMaterial = new THREE.MeshStandardMaterial({
            map: this.headTexture,
            bumpMap: this.headTexture,
            bumpScale: 0.06,
            color: 0xb1433a,
            roughness: 0.96,
            metalness: 0.0,
        });
    }

    _createWoodTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 64;
        const ctx = c.getContext('2d');

        const g = ctx.createLinearGradient(0, 0, c.width, 0);
        g.addColorStop(0, '#f1d6a3');
        g.addColorStop(0.24, '#dfbf86');
        g.addColorStop(0.48, '#cfa86d');
        g.addColorStop(0.76, '#e7c78f');
        g.addColorStop(1, '#bb9359');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, c.width, c.height);

        // 木纤维细丝
        for (let i = 0; i < 520; i++) {
            const x = Math.random() * c.width;
            const y = Math.random() * c.height;
            const len = 20 + Math.random() * 70;
            ctx.strokeStyle = `rgba(86, 58, 24, ${0.04 + Math.random() * 0.08})`;
            ctx.lineWidth = 0.4 + Math.random() * 1.4;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(
                x + len * 0.25,
                y + (Math.random() - 0.5) * 6,
                x + len * 0.75,
                y + (Math.random() - 0.5) * 6,
                Math.min(c.width, x + len),
                y + (Math.random() - 0.5) * 2.6
            );
            ctx.stroke();
        }

        // 节疤（弱化，避免横向纹路感）
        for (let i = 0; i < 4; i++) {
            const kx = 24 + Math.random() * (c.width - 48);
            const ky = 10 + Math.random() * (c.height - 20);
            const rw = 6 + Math.random() * 14;
            const rh = 3 + Math.random() * 8;
            ctx.save();
            ctx.translate(kx, ky);
            ctx.rotate((Math.random() - 0.5) * 0.8);
            const knot = ctx.createRadialGradient(0, 0, 1, 0, 0, rw);
            knot.addColorStop(0, 'rgba(95, 58, 22, 0.2)');
            knot.addColorStop(0.5, 'rgba(120, 78, 35, 0.12)');
            knot.addColorStop(1, 'rgba(145, 98, 44, 0.02)');
            ctx.fillStyle = knot;
            ctx.beginPath();
            ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3.2, 0.75);
        tex.anisotropy = 8;
        return tex;
    }

    _createHeadTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');

        const cx = c.width / 2;
        const cy = c.height / 2;
        const r = c.width * 0.46;

        const g = ctx.createRadialGradient(cx - 20, cy - 20, r * 0.08, cx, cy, r);
        g.addColorStop(0, '#ff7b73');
        g.addColorStop(0.45, '#ff4c42');
        g.addColorStop(1, '#d22c29');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 260; i++) {
            const a = Math.random() * Math.PI * 2;
            const rr = Math.sqrt(Math.random()) * r * 0.95;
            const x = cx + Math.cos(a) * rr;
            const y = cy + Math.sin(a) * rr;
            const pr = 1.5 + Math.random() * 4.0;
            const alpha = 0.18 + Math.random() * 0.26;
            ctx.fillStyle = `rgba(70, 12, 12, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, pr, 0, Math.PI * 2);
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
    }

    _createAshTexture() {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 128;
        const ctx = c.getContext('2d');

        const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
        g.addColorStop(0, 'rgba(220,220,220,0.85)');
        g.addColorStop(0.35, 'rgba(110,110,110,0.45)');
        g.addColorStop(1, 'rgba(20,20,20,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);

        for (let i = 0; i < 120; i++) {
            ctx.fillStyle = `rgba(${120 + Math.random() * 80},${120 + Math.random() * 80},${120 + Math.random() * 80},${0.15 + Math.random() * 0.35})`;
            ctx.beginPath();
            ctx.arc(Math.random() * 128, Math.random() * 128, 0.6 + Math.random() * 1.6, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(c);
    }

    _createFlameTexture() {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 192;
        const ctx = c.getContext('2d');

        // 外焰
        const g1 = ctx.createRadialGradient(64, 140, 8, 64, 120, 80);
        g1.addColorStop(0, 'rgba(255,255,180,0.95)');
        g1.addColorStop(0.35, 'rgba(255,170,40,0.85)');
        g1.addColorStop(0.7, 'rgba(255,90,0,0.45)');
        g1.addColorStop(1, 'rgba(255,40,0,0.0)');
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.ellipse(64, 118, 42, 70, 0, 0, Math.PI * 2);
        ctx.fill();

        // 内焰
        const g2 = ctx.createRadialGradient(64, 140, 2, 64, 130, 36);
        g2.addColorStop(0, 'rgba(255,255,230,1.0)');
        g2.addColorStop(0.55, 'rgba(255,215,120,0.9)');
        g2.addColorStop(1, 'rgba(255,120,30,0.0)');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.ellipse(64, 130, 18, 42, 0, 0, Math.PI * 2);
        ctx.fill();

        return new THREE.CanvasTexture(c);
    }

    /**
     * 创建单根3D火柴棒
     * @param {Object} segment - 线段定义 {x1, y1, x2, y2}
     * @param {boolean} burning - 是否燃烧状态
     * @returns {THREE.Group}
     */
    createMatchstick3D(segment, burning = false) {
        const group = new THREE.Group();
        
        // 将 SVG 坐标(0~50,0~80)转换到以中心为原点的世界坐标
        const p1 = new THREE.Vector3(
            (segment.x1 - 25) * this.unitScale,
            (40 - segment.y1) * this.unitScale,
            0
        );
        const p2 = new THREE.Vector3(
            (segment.x2 - 25) * this.unitScale,
            (40 - segment.y2) * this.unitScale,
            0
        );
        const center = p1.clone().add(p2).multiplyScalar(0.5);
        const dir = p2.clone().sub(p1);
        const length = Math.max(0.01, dir.length());
        const dirNorm = dir.clone().normalize();
        
        // 创建火柴棍体（窄长方体分段，便于后续弯曲）
        const stickRoot = new THREE.Group();
        const stickMaterial = this.baseStickMaterial.clone();
        const segCount = this.stickSegments;
        const segLen = length / segCount;
        const segments = [];

        for (let i = 0; i < segCount; i++) {
            const t = (i + 0.5) / segCount; // 0尾 -> 1头
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(this.stickWidth, segLen * 0.995, this.stickDepth),
                stickMaterial
            );
            box.position.y = -length * 0.5 + (i + 0.5) * segLen;
            box.userData.baseY = box.position.y;
            box.castShadow = true;
            box.receiveShadow = true;
            stickRoot.add(box);
            segments.push(box);
        }

        // Y轴 -> 火柴方向
        const yAxis = new THREE.Vector3(0, 1, 0);
        stickRoot.quaternion.setFromUnitVectors(yAxis, dirNorm);
        
        // 创建火柴头（非纯球形：球帽 + 圆台）
        const headMat = this.baseHeadMaterial.clone();
        const neckMat = this.baseHeadNeckMaterial.clone();
        const head = new THREE.Group();
        const headCap = new THREE.Mesh(
            new THREE.SphereGeometry(this.headRadius * 0.62, 16, 16),
            headMat
        );
        const headNeck = new THREE.Mesh(
            new THREE.CylinderGeometry(this.headRadius * 0.58, this.headRadius * 0.26, this.headRadius * 1.6, 18),
            neckMat
        );
        headCap.position.y = this.headRadius * 0.36;
        headNeck.position.y = -this.headRadius * 0.40;
        head.add(headNeck);
        head.add(headCap);
        head.quaternion.setFromUnitVectors(yAxis, dirNorm);

        const ash = new THREE.Sprite(new THREE.SpriteMaterial({
            map: this.ashTexture,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            color: 0xffffff,
        }));
        ash.scale.set(0.20, 0.20, 0.20);

        const flame = new THREE.Sprite(new THREE.SpriteMaterial({
            map: this.flameTexture,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            color: 0xffffff,
            blending: THREE.AdditiveBlending,
        }));
        flame.scale.set(0.18, 0.28, 0.18);
        
        // 火柴头放在线段终点，局部坐标下需要减去 center
        head.position.copy(p2.clone().sub(center));
        ash.position.copy(head.position.clone().add(new THREE.Vector3(0.02, 0.02, 0.05)));
        flame.position.copy(head.position.clone().add(new THREE.Vector3(0.0, 0.15, 0.08)));
        
        group.add(stickRoot);
        group.add(head);
        group.add(ash);
        group.add(flame);
        group.position.copy(center);
        const bendAxis = new THREE.Vector3(0, 0, 1);
        const bendSign = Math.random() > 0.5 ? 1 : -1;
        const bendMax = (Math.random() * 0.26 + 0.16) * bendSign;
        const sideBias = (Math.random() - 0.5) * 0.28; // 左右偏头
        const outBias = (Math.random() - 0.5) * 0.08; // 轻微离面偏转
        
        // 存储引用以便后续动画
        group.userData = {
            head: head,
            headMaterial: headMat,
            headNeckMaterial: neckMat,
            stickRoot,
            stickSegments: segments,
            stickLength: length,
            segmentLength: segLen,
            stickMaterial,
            ash: ash,
            flame: flame,
            burning: burning,
            burnProgress: 0,
            burnDelay: 0,
            burnStarted: false,
            burnCompleted: false,
            baseHeadPos: head.position.clone(),
            baseStickQuat: stickRoot.quaternion.clone(),
            bendAxis,
            bendMax,
            bendSign,
            sideBias,
            outBias,
            tailPos: p1.clone().sub(center),
            headPos: p2.clone().sub(center),
            burnAxis: p1.clone().sub(p2).normalize(), // 从头指向尾的局部方向
        };
        
        return group;
    }

    /**
     * 获取数字/符号的线段定义（与SVG版本相同）
     */
    getSegments(char, handwritten = false) {
        return getDisplaySegments(char);
    }

    /**
     * 创建完整等式的3D显示
     * @param {string} equation - 等式字符串
     * @returns {THREE.Group}
     */
    createEquation3D(equation) {
        const container = new THREE.Group();
        const tokens = tokenizeEquation(equation);
        
        let offsetX = 0;
        const spacing = 1.15; // 字符间距
        
        for (let token of tokens) {
            let displayToken = token.replace('*', 'x');
            
            if (displayToken !== ' ') {
                if (displayToken === '11' || displayToken === '(11)H') {
                    const isHandwritten = displayToken === '(11)H';
                    const digit1 = this.createDigit3D(isHandwritten ? '(1)H' : '1');
                    const digit2 = this.createDigit3D(isHandwritten ? '(1)H' : '1');
                    
                    digit1.position.x = offsetX;
                    digit2.position.x = offsetX + 0.52;
                    
                    container.add(digit1);
                    container.add(digit2);
                    this.digitGroups.push(digit1, digit2);
                    
                    offsetX += 1.05;
                } else {
                    const digitGroup = this.createDigit3D(displayToken);
                    digitGroup.position.x = offsetX;
                    container.add(digitGroup);
                    this.digitGroups.push(digitGroup);
                    offsetX += spacing;
                }
            } else {
                offsetX += spacing * 0.3;
            }
        }
        
        // 使用包围盒精确居中，避免字符宽度差异导致看不清/偏移
        const box = new THREE.Box3().setFromObject(container);
        const center = new THREE.Vector3();
        box.getCenter(center);
        container.position.sub(center);
        
        this.equationRoot = container;
        this._applyOverlapLift(container);
        
        return container;
    }

    _pointSegmentDist2D(p, a, b) {
        const ab = b.clone().sub(a);
        const ap = p.clone().sub(a);
        const abLen2 = Math.max(1e-8, ab.lengthSq());
        const t = THREE.MathUtils.clamp(ap.dot(ab) / abLen2, 0, 1);
        const proj = a.clone().add(ab.multiplyScalar(t));
        return proj.distanceTo(p);
    }

    _segmentDist2D(a1, a2, b1, b2) {
        const d1 = this._pointSegmentDist2D(a1, b1, b2);
        const d2 = this._pointSegmentDist2D(a2, b1, b2);
        const d3 = this._pointSegmentDist2D(b1, a1, a2);
        const d4 = this._pointSegmentDist2D(b2, a1, a2);
        return Math.min(d1, d2, d3, d4);
    }

    _applyOverlapLift(container) {
        const sticks = this.matchsticks;
        if (!sticks || sticks.length < 2) return;
        container.updateMatrixWorld(true);

        const overlapScore = new Array(sticks.length).fill(0);
        const threshold = this.stickWidth * 0.95;

        for (let i = 0; i < sticks.length; i++) {
            const a = sticks[i].userData;
            const a1 = container.worldToLocal(sticks[i].localToWorld(a.tailPos.clone()));
            const a2 = container.worldToLocal(sticks[i].localToWorld(a.headPos.clone()));
            for (let j = i + 1; j < sticks.length; j++) {
                const b = sticks[j].userData;
                const b1 = container.worldToLocal(sticks[j].localToWorld(b.tailPos.clone()));
                const b2 = container.worldToLocal(sticks[j].localToWorld(b.headPos.clone()));
                const dist = this._segmentDist2D(a1, a2, b1, b2);
                if (dist < threshold) {
                    overlapScore[j] += 1;
                }
            }
        }

        sticks.forEach((m, idx) => {
            const score = overlapScore[idx];
            if (score <= 0) return;
            const lift = Math.min(0.16, 0.045 * score);
            m.position.z += lift;
            m.rotation.x += 0.08 * Math.min(2.0, score);
            m.rotation.z += (idx % 2 === 0 ? 1 : -1) * 0.04 * Math.min(2.0, score);
        });
    }

    /**
     * 创建单个数字/符号的3D组
     */
    createDigit3D(char) {
        const group = new THREE.Group();
        const segments = this.getSegments(char);
        
        segments.forEach(segment => {
            const matchstick = this.createMatchstick3D(segment);
            group.add(matchstick);
            this.matchsticks.push(matchstick);
        });
        
        return group;
    }

    _applyBurnVisual(matchstick) {
        const ud = matchstick.userData;
        const p = THREE.MathUtils.clamp(ud.burnProgress, 0, 1);

        const stickMat = ud.stickMaterial;
        const headMat = ud.headMaterial;
        const neckMat = ud.headNeckMaterial;

        // 木头 -> 焦黑
        stickMat.color.setRGB(
            THREE.MathUtils.lerp(0.95, 0.12, p),
            THREE.MathUtils.lerp(0.80, 0.12, p),
            THREE.MathUtils.lerp(0.62, 0.12, p)
        );
        stickMat.roughness = THREE.MathUtils.lerp(0.78, 0.95, p);

        // 火柴头发光 -> 炭化
        headMat.color.setRGB(
            THREE.MathUtils.lerp(1.0, 0.03, p),
            THREE.MathUtils.lerp(0.30, 0.03, p),
            THREE.MathUtils.lerp(0.26, 0.03, p)
        );
        headMat.emissive.setRGB(0.85 * (1 - p), 0.22 * (1 - p), 0.02 * (1 - p));
        neckMat.color.setRGB(
            THREE.MathUtils.lerp(0.70, 0.04, p),
            THREE.MathUtils.lerp(0.25, 0.04, p),
            THREE.MathUtils.lerp(0.20, 0.04, p)
        );
        neckMat.emissive.setRGB(0.32 * (1 - p), 0.08 * (1 - p), 0.01 * (1 - p));

        // 从头到尾推进燃烧前沿
        const burnFront = 1.0 - p; // 本地 y 方向：头=1 -> 尾=0
        const consumed = ud.stickLength * p * 0.28; // 总长度缩短（从头端侵蚀）
        const headShift = ud.burnAxis.clone().multiplyScalar(consumed);

        // 分段弯曲 + 前沿附近更细 + 平滑缩短（避免突然跳变）
        const remainTipY = ud.stickLength * 0.5 - consumed;
        ud.stickSegments.forEach((seg, i) => {
            const t = (i + 0.5) / ud.stickSegments.length; // 0尾 -> 1头
            const local = THREE.MathUtils.clamp((t - burnFront) * 3.2, 0, 1);

            // 平滑缩短：靠近燃烧前沿的分段逐步压扁，而不是直接隐藏
            const baseY = seg.userData.baseY;
            const dy = baseY - remainTipY;
            const crush = THREE.MathUtils.clamp((dy + ud.segmentLength * 0.5) / ud.segmentLength, 0, 1);
            const alive = 1.0 - crush;
            seg.visible = true;

            // 弧度：靠近头部更弯，左右随机偏
            const curve = p * (0.14 + 0.28 * t) * ud.bendSign;
            seg.rotation.z = curve * (0.35 + 0.65 * local);
            seg.rotation.x = ud.outBias * (0.2 + local * 0.8);

            // 局部变细（前沿更细）
            const sx = (1.0 - 0.55 * local) * (0.35 + 0.65 * alive);
            const sz = (1.0 - 0.48 * local) * (0.35 + 0.65 * alive);
            const sy = Math.max(0.05, alive);
            seg.scale.set(sx, sy, sz);

            // 受热下垂（头端更明显）
            seg.position.y = seg.userData.baseY - consumed * (0.15 + 0.85 * t) * local - (1.0 - alive) * ud.segmentLength * 0.45;
        });

        // 头部：始终贴在火柴棒末端，缩小并炭化（不再脱落）
        const tipLocalOnRoot = new THREE.Vector3(0, remainTipY, 0);
        const tipLocalOnGroup = tipLocalOnRoot.clone().applyQuaternion(ud.stickRoot.quaternion);

        ud.head.position.copy(tipLocalOnGroup);
        ud.head.position.add(ud.burnAxis.clone().multiplyScalar(-0.008));
        ud.head.position.y -= p * 0.02;
        ud.head.rotation.z = ud.sideBias * p * 0.12;

        const hs = Math.max(0.22, 1 - p * 0.78);
        ud.head.scale.set(hs, hs * 0.92, hs);

        // 火苗沿火柴从头向尾移动
        const flamePos = ud.head.position.clone().add(ud.burnAxis.clone().multiplyScalar(-ud.segmentLength * 0.35));
        const flicker = 0.8 + Math.sin(this._time * 28 + ud.sideBias * 20) * 0.12;
        ud.flame.position.copy(flamePos);
        ud.flame.position.x += Math.sin(this._time * 17 + ud.sideBias * 8) * 0.012;
        ud.flame.position.y += 0.10 + Math.sin(this._time * 22 + ud.outBias * 12) * 0.01;
        ud.flame.material.opacity = (1.0 - p * 0.85) * 0.9;
        ud.flame.scale.set(0.16 * flicker, 0.28 * flicker, 0.16);

        // 灰烬
        const ashP = THREE.MathUtils.clamp((p - 0.40) / 0.60, 0, 1);
        ud.ash.material.opacity = ashP * 0.85;
        ud.ash.scale.setScalar(0.12 + ashP * 0.24);
        ud.ash.position.copy(flamePos).add(new THREE.Vector3(0, 0.02, 0.06));
    }

    update(delta) {
        this._time += delta;
        for (const matchstick of this.matchsticks) {
            const ud = matchstick.userData;
            if (!ud.burning) continue;

            if (ud.burnDelay > 0) {
                ud.burnDelay -= delta;
                continue;
            }

            if (!ud.burnStarted) {
                ud.burnStarted = true;
                ud.headMaterial.emissive.setRGB(1.0, 0.45, 0.08);
                ud.headNeckMaterial.emissive.setRGB(0.45, 0.18, 0.04);
                ud.flame.material.opacity = 0.85;
            }

            ud.burnProgress = Math.min(1, ud.burnProgress + delta * 0.24);
            this._applyBurnVisual(matchstick);

            if (ud.burnProgress >= 1) {
                ud.burning = false;
                ud.burnCompleted = true;
            }
        }
    }

    /**
     * 所有火柴头同时点燃
     * @returns {THREE.Vector3|null} 所有火柴头中心世界坐标（用于纸张燃烧起点）
     */
    igniteAll() {
        if (!this.matchsticks.length) return null;

        const center = new THREE.Vector3();
        let count = 0;

        this.matchsticks.forEach(matchstick => {
            const ud = matchstick.userData;
            const headWorld = ud.head.getWorldPosition(new THREE.Vector3());
            center.add(headWorld);
            count++;

            ud.burning = true;
            ud.burnStarted = false;
            ud.burnCompleted = false;
            ud.burnProgress = 0;
            ud.burnDelay = 0;

            ud.stickSegments.forEach(seg => {
                seg.visible = true;
                seg.rotation.set(0, 0, 0);
                seg.scale.set(1, 1, 1);
                seg.position.y = seg.userData.baseY;
            });
            ud.head.position.copy(ud.baseHeadPos);
            ud.head.scale.set(1, 1, 1);
            ud.flame.position.copy(ud.baseHeadPos).add(new THREE.Vector3(0.0, 0.15, 0.08));
            ud.flame.material.opacity = 0;
            ud.ash.material.opacity = 0;
        });

        return count > 0 ? center.multiplyScalar(1 / count) : null;
    }

    areAllBurned() {
        if (!this.matchsticks.length) return false;
        return this.matchsticks.every(m => m.userData.burnCompleted === true);
    }

    /**
     * 清除所有火柴棒
     */
    clear() {
        if (this.equationRoot) {
            this.scene.remove(this.equationRoot);
            this.equationRoot = null;
        }
        this.digitGroups = [];
        this.matchsticks = [];
    }

    /**
     * 获取所有火柴棒（用于动画）
     */
    getAllMatchsticks() {
        return this.matchsticks;
    }
}
