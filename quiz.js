// State Variables
let quizPage = 1;
let subPage = 1;
let subPage1Passed = false;
let subPage2Passed = false;
let subPage3Passed = false;
let page2Passed = false;

const totalPages = 2;
const FONT_TITLE = 'bold 1.35rem sans-serif';
const FONT_UI = 'bold 1.15rem sans-serif';

// Interactive Hint State and Color Codes for Perfect Visual Alignments
let activeHints = { 1: false, 2: false, 3: false };
const COLOR_N = '#d32f2f';  // Red
const COLOR_H = '#2e7d32';  // Green
const COLOR_C = '#0288d1';  // Blue
const COLOR_O = '#f57c00';  // Orange
const COLOR_Si = '#7b1fa2'; // Purple

// Keep track of hint animation frame IDs
let hintAnimStepFrameId = {};
let activeHintStep = { 1: 0, 2: 0, 3: 0 };

function startHintStepAnimation(canvasId, questionId, stepNum, callback) {
    if (hintAnimStepFrameId[questionId]) {
        cancelAnimationFrame(hintAnimStepFrameId[questionId]);
    }
    
    const duration = stepNum === 1 ? 800 : 1800; // Step 1 is shorter, Step 2 is longer
    let startTime = null;
    
    function animLoop(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(1.0, elapsed / duration);
        
        drawWeightRatioDiagram(canvasId, questionId, stepNum, progress);
        
        if (stepNum === 2) {
            const formulaDiv = document.getElementById(`hint-formula-${questionId}`);
            if (formulaDiv) {
                const t_text = Math.min(1.0, Math.max(0.0, (progress - 0.7) / 0.3));
                formulaDiv.style.opacity = t_text;
            }
        }
        
        if (progress < 1.0 && activeHints[questionId] && activeHintStep[questionId] === stepNum) {
            hintAnimStepFrameId[questionId] = requestAnimationFrame(animLoop);
        } else if (progress >= 1.0) {
            if (callback) callback();
        }
    }
    
    hintAnimStepFrameId[questionId] = requestAnimationFrame(animLoop);
}

function runHintStep(questionId, stepNum) {
    activeHintStep[questionId] = stepNum;
    
    // Style update:
    const btn2 = document.getElementById(`btn-hint-${questionId}-step-2`);
    
    if (stepNum === 2) {
        // Step 2 Active (Theme highlight)
        if (btn2) {
            btn2.style.background = 'var(--theme-primary)';
            btn2.style.color = 'var(--theme-on-primary)';
            btn2.style.borderColor = 'var(--theme-primary)';
            btn2.disabled = true;
        }
        
        startHintStepAnimation('hintCanvas' + questionId, questionId, 2, () => {
            // Step 2 Completed (Soft theme background)
            if (btn2) {
                btn2.style.background = 'var(--theme-primary-soft)';
                btn2.style.color = 'var(--theme-primary)';
                btn2.style.borderColor = 'var(--theme-primary)';
                btn2.disabled = false;
            }
        });
    }
}

function collapseAllHints() {
    for (let i = 1; i <= 3; i++) {
        if (hintAnimStepFrameId[i]) {
            cancelAnimationFrame(hintAnimStepFrameId[i]);
            hintAnimStepFrameId[i] = null;
        }
        activeHintStep[i] = 0;
    }
    activeHints = { 1: false, 2: false, 3: false };
    document.querySelectorAll('.hint-sub-btn').forEach(btn => {
        btn.innerHTML = '💡 提示';
        btn.style.background = '#ffffff';
        btn.style.borderColor = 'var(--theme-primary)';
        btn.style.color = 'var(--theme-primary)';
    });
    
    // Reset all step buttons styles and formula text opacities
    for (let id = 1; id <= 3; id++) {
        const btn1 = document.getElementById(`btn-hint-${id}-step-1`);
        const btn2 = document.getElementById(`btn-hint-${id}-step-2`);
        if (btn1 && btn2) {
            btn1.disabled = false;
            btn1.style.background = '#ffffff';
            btn1.style.color = '#2b2b2b';
            btn1.style.borderColor = '#2b2b2b';
            
            btn2.disabled = true;
            btn2.style.background = '#f5f5f5';
            btn2.style.color = '#a0a0a0';
            btn2.style.borderColor = '#d3d3d3';
        }
        const formulaDiv = document.getElementById(`hint-formula-${id}`);
        if (formulaDiv) {
            formulaDiv.style.opacity = '0';
        }
    }
    
    document.querySelectorAll('.quiz-hint-span').forEach(span => span.style.display = 'none');
    document.querySelectorAll('.quiz-hint-plot').forEach(plot => plot.style.display = 'none');
    const wrapper = document.getElementById('quizContentPage1');
    if (wrapper) {
        wrapper.classList.remove('hint-active-1', 'hint-active-2', 'hint-active-3');
    }
}

// Independent Hint toggle method that controls spans visibility per question and redraws canvas
function toggleSingleHint(id) {
    const nextState = !activeHints[id];
    
    // Accordion effect: Collapse and reset any other active hints
    if (nextState) {
        collapseAllHints();
    }
    
    activeHints[id] = nextState;
    const btn = document.getElementById('btn-hint-' + id);
    const span = document.querySelector('.id-hint-' + id);
    const plot = document.querySelector('.id-hint-plot-' + id);
    const wrapper = document.getElementById('quizContentPage1');
    
    if (activeHints[id]) {
        btn.innerHTML = '隱藏提示';
        btn.style.background = 'var(--theme-primary-soft)';
        btn.style.borderColor = 'var(--theme-primary)';
        btn.style.color = 'var(--theme-primary)';
        span.style.display = 'inline-flex';
        if (plot) plot.style.display = 'block';
        wrapper.classList.add('hint-active-' + id);
        
        // Reset steps for this question and AUTO run step 1 (draw blue vertical line)
        activeHintStep[id] = 1;
        
        const btn2 = document.getElementById(`btn-hint-${id}-step-2`);
        if (btn2) {
            btn2.disabled = true;
            btn2.style.background = '#f5f5f5';
            btn2.style.color = '#a0a0a0';
            btn2.style.borderColor = '#d3d3d3';
        }
        const formulaDiv = document.getElementById(`hint-formula-${id}`);
        if (formulaDiv) {
            formulaDiv.style.opacity = '0';
        }
        
        // Auto play Step 1 animation
        setTimeout(() => {
            startHintStepAnimation('hintCanvas' + id, id, 1, () => {
                // Step 1 completed: Enable step 2 (draw-slope-line button)
                if (btn2) {
                    btn2.disabled = false;
                    btn2.style.background = '#ffffff';
                    btn2.style.color = '#2b2b2b';
                    btn2.style.borderColor = '#2b2b2b';
                }
            });
        }, 50);
    } else {
        btn.innerHTML = '💡 提示';
        btn.style.background = '#ffffff';
        btn.style.borderColor = 'var(--theme-primary)';
        btn.style.color = 'var(--theme-primary)';
        span.style.display = 'none';
        if (plot) plot.style.display = 'none';
        wrapper.classList.remove('hint-active-' + id);
        
        if (hintAnimStepFrameId[id]) {
            cancelAnimationFrame(hintAnimStepFrameId[id]);
            hintAnimStepFrameId[id] = null;
        }
        activeHintStep[id] = 0;
        
        const formulaDiv = document.getElementById(`hint-formula-${id}`);
        if (formulaDiv) {
            formulaDiv.style.opacity = '0';
        }
    }
    
    // Trigger canvas redraw (main static diagram)
    drawQuizDiagram();
}

// Draw dynamic hand-drawn weight ratio line diagram (Geometry illustration of Law of Constant Proportions)
function drawWeightRatioDiagram(canvasId, questionId, step = 0, progress = 0.0) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Resize backing store while drawing in CSS logical pixels
    const parentW = canvas.parentElement.clientWidth;
    if (parentW <= 0) return;

    const w = parentW;
    const h = 250;
    const compact = CanvasResponsive.isCompact(w);
    configureCanvas(canvas, ctx, w, h);
    
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    
    ctx.save();
    
    // Origin and boundaries coordinates
    const ox = w * 0.15;
    const oy = h * 0.82;
    const maxX = w * 0.9;
    const maxY = h * 0.20;
    
    // Draw Axis lines (static)
    drawWobblyLine(ctx, ox, oy, maxX, oy, '#2b2b2b', 1.5, 2001);
    drawWobblyLine(ctx, ox, oy, ox, maxY, '#2b2b2b', 1.5, 2002);
    
    // Axis labels
    ctx.font = compact ? 'bold 12px sans-serif' : 'bold 0.8rem sans-serif';
    ctx.fillStyle = '#5f5f5f';
    ctx.textBaseline = 'middle';
    
    let xLabel = '', yLabel = '';
    if (questionId === 1) {
        xLabel = '氫重量 wH (克)';
        yLabel = '氮重量 wN (克)';
    } else if (questionId === 2) {
        xLabel = '氧重量 wO (克)';
        yLabel = '碳重量 wC (克)';
    } else if (questionId === 3) {
        xLabel = '碳重量 wC (克)';
        yLabel = '矽重量 wSi (克)';
    }
    
    ctx.textAlign = 'right';
    ctx.fillText(xLabel, maxX, oy + 18);
    
    ctx.textAlign = 'left';
    ctx.fillText(yLabel, ox - 12, maxY - 15);
    
    // Point positions setup
    const dx = maxX - ox;
    const dy = oy - maxY;
    
    const pxA = ox + dx * 0.32;
    const pyA = oy - dy * 0.3111;
    
    const pxB = ox + dx * 0.72;
    const pyB = oy - dy * 0.70;
    
    // Step 1: Draw Vertical blue line at wH=1 (or wO=8, wC=3)
    if (step === 1) {
        const t1 = progress;
        ctx.save();
        ctx.strokeStyle = '#0288d1';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pxA, oy);
        ctx.lineTo(pxA, oy - (oy - maxY) * t1);
        ctx.stroke();
        ctx.restore();
        
        // Show X-axis label
        ctx.font = 'bold 0.85rem sans-serif';
        ctx.fillStyle = '#0288d1';
        ctx.textAlign = 'center';
        let valXA = '';
        if (questionId === 1) valXA = '1';
        else if (questionId === 2) valXA = '8';
        else if (questionId === 3) valXA = '3';
        ctx.fillText(valXA, pxA, oy + 12);
    }
    
    // Step 2: Draw Orange Line, blue dot intersection, and horizontal line to Y axis
    if (step === 2) {
        // Vertical dashed line (100% drawn to the top!)
        ctx.save();
        ctx.strokeStyle = '#0288d1';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pxA, oy);
        ctx.lineTo(pxA, maxY);
        ctx.stroke();
        ctx.restore();
        
        ctx.font = 'bold 0.85rem sans-serif';
        ctx.fillStyle = '#0288d1';
        ctx.textAlign = 'center';
        let valXA = '';
        if (questionId === 1) valXA = '1';
        else if (questionId === 2) valXA = '8';
        else if (questionId === 3) valXA = '3';
        ctx.fillText(valXA, pxA, oy + 12);
        
        // Orange Trendline growing from top-right to origin
        const endX = ox + dx * 0.85;
        const endY = oy - dy * 0.826;
        
        const t_line = Math.min(1.0, progress / 0.7);
        const curEndX = endX - (endX - ox) * t_line;
        const curEndY = endY - (endY - oy) * t_line;
        drawWobblyLine(ctx, endX, endY, curEndX, curEndY, '#ff7a00', 1.8, 2003);
        
        // Intersection Crossing: reaches pxA when t_line >= 0.62 (progress >= 0.43)
        if (progress >= 0.43) {
            const progressCrossing = (progress - 0.43) / 0.27;
            const t_horiz = Math.min(1.0, Math.max(0.0, progressCrossing));
            
            // Draw horizontal dashed line leftward
            ctx.save();
            ctx.strokeStyle = '#0288d1';
            ctx.lineWidth = 1.0;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(pxA, pyA);
            ctx.lineTo(pxA - (pxA - ox) * t_horiz, pyA);
            ctx.stroke();
            ctx.restore();
            
            // Blue Dot popping
            const dotT = Math.min(1.0, (progress - 0.43) / 0.1);
            ctx.beginPath();
            ctx.arc(pxA, pyA, 4 * dotT, 0, Math.PI * 2);
            ctx.fillStyle = '#0288d1';
            ctx.fill();
            ctx.strokeStyle = '#2b2b2b';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Show Y-axis label wO=X (or wC=Y, wSi=Z)
            ctx.font = 'bold 0.85rem sans-serif';
            ctx.fillStyle = '#0288d1';
            ctx.textAlign = 'right';
            let valYA = '';
            if (questionId === 1) valYA = 'X';
            else if (questionId === 2) valYA = 'Y';
            else if (questionId === 3) valYA = 'Z';
            ctx.fillText(valYA, ox - 6, pyA);
        }
        
        // Draw Point B details when progress >= 0.5
        if (progress >= 0.5) {
            let colX = '#2e7d32', colY = '#d32f2f';
            let valXB = '', valYB = '';
            if (questionId === 1) { valXB = '3'; valYB = '14'; }
            else if (questionId === 2) { valXB = '32'; valYB = '12'; }
            else if (questionId === 3) { valXB = '12'; valYB = '28'; }
            
            ctx.save();
            ctx.strokeStyle = '#ff7a00';
            ctx.lineWidth = 1.0;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(pxB, pyB);
            ctx.lineTo(pxB, oy);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pxB, pyB);
            ctx.lineTo(ox, pyB);
            ctx.stroke();
            ctx.restore();
            
            // Point B node
            ctx.beginPath();
            ctx.arc(pxB, pyB, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ff7a00';
            ctx.fill();
            ctx.strokeStyle = '#2b2b2b';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Point B labels
            ctx.font = 'bold 0.85rem sans-serif';
            ctx.fillStyle = colX;
            ctx.textAlign = 'center';
            ctx.fillText(valXB, pxB, oy + 12);
            
            ctx.fillStyle = colY;
            ctx.textAlign = 'right';
            ctx.fillText(valYB, ox - 6, pyB);
        }
    }
    
    ctx.restore();
}

// Helper to draw wobbly formula text character-by-character with corresponding color highlights
function drawColoredFormula(ctx, formula, cx, cy, active) {
    ctx.save();
    ctx.textBaseline = 'middle';

    if (!active) {
        // Render simple flat-color text when hint is inactive
        ctx.font = 'bold 0.95rem sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1f1f1f';
        ctx.fillText(formula, cx, cy);
        ctx.restore();
        return;
    }

    // Split compound string and paint characters dynamically
    let parts = [];
    if (formula === 'NH₃') {
        parts = [
            { text: 'N', color: '#d32f2f', isSub: false },
            { text: 'H', color: '#2e7d32', isSub: false },
            { text: '₃', color: '#2e7d32', isSub: true }
        ];
    } else if (formula === 'CO₂') {
        parts = [
            { text: 'C', color: '#d32f2f', isSub: false },
            { text: 'O', color: '#2e7d32', isSub: false },
            { text: '₂', color: '#2e7d32', isSub: true }
        ];
    } else if (formula === 'SiC') {
        parts = [
            { text: 'Si', color: '#d32f2f', isSub: false },
            { text: 'C', color: '#2e7d32', isSub: false }
        ];
    }

    // Calculate total layout width for perfect text alignment centering
    let totalWidth = 0;
    parts.forEach(p => {
        if (p.isSub) {
            ctx.font = '0.75rem sans-serif';
        } else {
            ctx.font = 'bold 1.05rem sans-serif';
        }
        totalWidth += ctx.measureText(p.text).width;
    });

    let currentX = cx - totalWidth / 2;

    parts.forEach(p => {
        if (p.isSub) {
            ctx.font = '0.75rem sans-serif';
            ctx.fillStyle = p.color;
            ctx.textAlign = 'left';
            ctx.fillText(p.text, currentX, cy + 4);
            currentX += ctx.measureText(p.text).width;
        } else {
            ctx.font = 'bold 1.05rem sans-serif';
            ctx.fillStyle = p.color;
            ctx.textAlign = 'left';
            ctx.fillText(p.text, currentX, cy);
            currentX += ctx.measureText(p.text).width;
        }
    });

    ctx.restore();
}

// Seeded Random Helper
let rndSeed = 1;
function setRndSeed(s) {
    rndSeed = s;
}
function seededRandom() {
    const x = Math.sin(rndSeed++) * 10000;
    return x - Math.floor(x);
}

// Wobbly drawing helper functions
function drawWobblyLine(ctx, x1, y1, x2, y2, color = '#2b2b2b', width = 2, seed = 42) {
    setRndSeed(seed);
    const segments = Math.max(5, Math.floor(Math.hypot(x2 - x1, y2 - y1) / 8));
    for (let drawCount = 0; drawCount < 2; drawCount++) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            let px = x1 + (x2 - x1) * t;
            let py = y1 + (y2 - y1) * t;
            if (i < segments) {
                const dx = x2 - x1;
                const dy = y2 - y1;
                const len = Math.hypot(dx, dy);
                const nx = -dy / len;
                const ny = dx / len;
                const jitter = (seededRandom() - 0.5) * 0.8;
                px += nx * jitter;
                py += ny * jitter;
            }
            ctx.lineTo(px, py);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = width + (seededRandom() - 0.5) * 0.2;
        ctx.stroke();
    }
}

function drawWobblyRect(ctx, x, y, w, h, color = '#2b2b2b', fill = false, fillColor = '#ffffff', width = 2, seed = 42, strokeAlpha = 1.0) {
    if (fill) {
        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, w, h);
        ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha = strokeAlpha;
    drawWobblyLine(ctx, x, y, x + w, y, color, width, seed);
    drawWobblyLine(ctx, x + w, y, x + w, y + h, color, width, seed + 1);
    drawWobblyLine(ctx, x + w, y + h, x, y + h, color, width, seed + 2);
    drawWobblyLine(ctx, x, y + h, x, y, color, width, seed + 3);
    ctx.restore();
}

function drawWobblyCircle(ctx, cx, cy, r, color = '#2b2b2b', fill = false, width = 2, seed = 100) {
    setRndSeed(seed);
    const segments = 24;
    for (let drawCount = 0; drawCount < (fill ? 1 : 2); drawCount++) {
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const jitter = (seededRandom() - 0.5) * 0.6;
            const rad = r + jitter;
            const x = cx + Math.cos(theta) * rad;
            const y = cy + Math.sin(theta) * rad;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        if (fill) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
        }
    }
}

function drawDiamond(ctx, cx, cy, r, color, border, borderAlpha = 1.0) {
    ctx.save();
    
    // Fill with solid opacity to block underlying lines
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw border with target alpha
    ctx.globalAlpha = borderAlpha;
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
}

// Setup Canvas
const canvas = document.getElementById('quizCanvas');
const ctx = canvas.getContext('2d');

function configureCanvas(targetCanvas, targetContext, logicalWidth, logicalHeight) {
    const dpr = window.devicePixelRatio || 1;
    const backingWidth = Math.round(logicalWidth * dpr);
    const backingHeight = Math.round(logicalHeight * dpr);

    if (targetCanvas.width !== backingWidth || targetCanvas.height !== backingHeight) {
        targetCanvas.width = Math.round(logicalWidth * dpr);
        targetCanvas.height = Math.round(logicalHeight * dpr);
    }

    targetCanvas.logicalWidth = logicalWidth;
    targetCanvas.logicalHeight = logicalHeight;
    targetContext.setTransform(dpr, 0, 0, dpr, 0, 0);
}

let quizCanvasResizeFrameId = 0;

function scheduleQuizCanvasResize() {
    cancelAnimationFrame(quizCanvasResizeFrameId);
    quizCanvasResizeFrameId = requestAnimationFrame(resizeCanvas);
}

const quizCanvasResizeObserver = 'ResizeObserver' in window
    ? new ResizeObserver(scheduleQuizCanvasResize)
    : null;

function resizeCanvas() {
    const wrapper = canvas.parentElement;
    const clientW = wrapper.clientWidth;
    if (clientW <= 0) return;

    const clientH = CanvasResponsive.heightFor(clientW, 13 / 16, 0.95);
    configureCanvas(canvas, ctx, clientW, clientH);
    drawQuizDiagram();
}

function quizNodeFont(context, label, width) {
    if (!CanvasResponsive.isCompact(width)) return 'bold 1rem sans-serif';
    return CanvasResponsive.fontFor(context, label, 72, 14, 10, 'bold');
}

function quizVerticalAnchors(cx, cy, halfHeight) {
    return {
        top: { x: cx, y: cy - halfHeight },
        bottom: { x: cx, y: cy + halfHeight },
    };
}

// Render network diagram with dynamic color overrides on Hint toggled
function drawQuizDiagram() {
    const w = canvas.logicalWidth || canvas.clientWidth;
    const h = canvas.logicalHeight || w * (13 / 16);
    const compact = CanvasResponsive.isCompact(w);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    ctx.save();

    // Nodes coordinates
    const x1 = w * 0.13;
    const x2 = w * 0.44;
    const x3 = w * 0.87;
    const yTop = h * 0.23;
    const yBottom = h * 0.77;
    const yMid = h * 0.5;
    const siliconAnchors = quizVerticalAnchors(x1, yMid, 18);

    const lineColor = '#777777';
    const lineWidth = 1.2;

    // Define opacity based on current quiz page & sub-question
    let aSi = 1.0, aO = 1.0, aC = 1.0, aN = 1.0, aH = 1.0;
    let aSiC = 1.0, aCO2 = 1.0, aNH3 = 1.0;
    let aA = 1.0, aB = 1.0, aC_diam = 1.0, aD = 1.0;

    let aLineSi_D = 1.0, aLineSi_SiC = 1.0, aLineD_O = 1.0, aLineSiC_C = 1.0;
    let aLineO_CO2 = 1.0, aLineC_CO2 = 1.0;
    let aLineO_B = 1.0, aLineO_A = 1.0, aLineC_C_diam = 1.0;
    let aLineB_N = 1.0, aLineC_diam_H = 1.0, aLineA_H = 1.0;
    let aLineN_NH3 = 1.0, aLineH_NH3 = 1.0;

    if (quizPage === 1) {
        if (subPage === 1) {
            // Only Nitrogen, Hydrogen, NH3 and N->NH3, H->NH3 lines are active
            aSi = 0.2; aO = 0.2; aC = 0.2;
            aSiC = 0.2; aCO2 = 0.2;
            aA = 0.2; aB = 0.2; aC_diam = 0.2; aD = 0.2;

            aLineSi_D = 0.2; aLineSi_SiC = 0.2; aLineD_O = 0.2; aLineSiC_C = 0.2;
            aLineO_CO2 = 0.2; aLineC_CO2 = 0.2;
            aLineO_B = 0.2; aLineO_A = 0.2; aLineC_C_diam = 0.2;
            aLineB_N = 0.2; aLineC_diam_H = 0.2; aLineA_H = 0.2;
        } else if (subPage === 2) {
            // Only Oxygen, Carbon, CO2 and O->CO2, C->CO2 lines are active
            aSi = 0.2; aN = 0.2; aH = 0.2;
            aSiC = 0.2; aNH3 = 0.2;
            aA = 0.2; aB = 0.2; aC_diam = 0.2; aD = 0.2;

            aLineSi_D = 0.2; aLineSi_SiC = 0.2; aLineD_O = 0.2; aLineSiC_C = 0.2;
            aLineO_B = 0.2; aLineO_A = 0.2; aLineC_C_diam = 0.2;
            aLineB_N = 0.2; aLineC_diam_H = 0.2; aLineA_H = 0.2;
            aLineN_NH3 = 0.2; aLineH_NH3 = 0.2;
        } else if (subPage === 3) {
            // Only Silicon, Carbon, SiC and Si->SiC, C->SiC lines are active
            aO = 0.2; aN = 0.2; aH = 0.2;
            aCO2 = 0.2; aNH3 = 0.2;
            aA = 0.2; aB = 0.2; aC_diam = 0.2; aD = 0.2;

            aLineSi_D = 0.2; aLineD_O = 0.2;
            aLineO_CO2 = 0.2; aLineC_CO2 = 0.2;
            aLineO_B = 0.2; aLineO_A = 0.2; aLineC_C_diam = 0.2;
            aLineB_N = 0.2; aLineC_diam_H = 0.2; aLineA_H = 0.2;
            aLineN_NH3 = 0.2; aLineH_NH3 = 0.2;
        }
    }

    // Line styles default
    let colLineSi_SiC = lineColor, wLineSi_SiC = lineWidth;
    let colLineC_SiC  = lineColor, wLineC_SiC  = lineWidth;
    let colLineO_CO2  = lineColor, wLineO_CO2  = lineWidth;
    let colLineC_CO2  = lineColor, wLineC_CO2  = lineWidth;
    let colLineN_NH3  = lineColor, wLineN_NH3  = lineWidth;
    let colLineH_NH3  = lineColor, wLineH_NH3  = lineWidth;

    // Node Border & Text colors
    let cSi = '#2b2b2b', textSi = '#1f1f1f';
    let cO  = '#2b2b2b', textO  = '#1f1f1f';
    let cC  = '#2b2b2b', textC  = '#1f1f1f';
    let cN  = '#2b2b2b', textN  = '#1f1f1f';
    let cH  = '#2b2b2b', textH  = '#1f1f1f';

    let circSiC = '#2b2b2b';
    let circCO2 = '#2b2b2b';
    let circNH3 = '#2b2b2b';

    // Apply active hint highlights dynamically (Numerator = Red #d32f2f, Denominator = Green #2e7d32)
    if (activeHints[1]) {
        cN = '#d32f2f'; textN = '#d32f2f';
        cH = '#2e7d32'; textH = '#2e7d32';
        circNH3 = '#d32f2f';
        colLineN_NH3 = '#d32f2f'; wLineN_NH3 = 2.0;
        colLineH_NH3 = '#2e7d32'; wLineH_NH3 = 2.0;
    } else if (activeHints[2]) {
        cC = '#d32f2f'; textC = '#d32f2f';
        cO = '#2e7d32'; textO = '#2e7d32';
        circCO2 = '#d32f2f';
        colLineC_CO2 = '#d32f2f'; wLineC_CO2 = 2.0;
        colLineO_CO2 = '#2e7d32'; wLineO_CO2 = 2.0;
    } else if (activeHints[3]) {
        cSi = '#d32f2f'; textSi = '#d32f2f';
        cC = '#2e7d32'; textC = '#2e7d32';
        circSiC = '#d32f2f';
        colLineSi_SiC = '#d32f2f'; wLineSi_SiC = 2.0;
        colLineC_SiC  = '#2e7d32'; wLineC_SiC  = 2.0;
    }

    // DRAW LAYER 1: Lines (Background)
    
    // SiC lines
    ctx.save();
    ctx.globalAlpha = aLineSi_D;
    drawWobblyLine(ctx, siliconAnchors.top.x, siliconAnchors.top.y, w * 0.22, yMid - 50, lineColor, lineWidth, 901);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = aLineSi_SiC;
    drawWobblyLine(ctx, siliconAnchors.bottom.x, siliconAnchors.bottom.y, w * 0.22, yMid + 50, colLineSi_SiC, wLineSi_SiC, 902);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = aLineD_O;
    drawWobblyLine(ctx, w * 0.22, yMid - 50, x2 - 45, yTop + 10, lineColor, lineWidth, 903);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = aLineSiC_C;
    drawWobblyLine(ctx, w * 0.22, yMid + 50, x2 - 45, yBottom - 10, colLineC_SiC, wLineC_SiC, 904);
    ctx.restore();

    // CO2 lines
    ctx.save();
    ctx.globalAlpha = aLineO_CO2;
    drawWobblyLine(ctx, x2, yTop + 18, x2, yMid - 24, colLineO_CO2, wLineO_CO2, 905);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = aLineC_CO2;
    drawWobblyLine(ctx, x2, yMid + 24, x2, yBottom - 18, colLineC_CO2, wLineC_CO2, 906);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = aLineO_B;
    drawWobblyLine(ctx, x2 + 45, yTop, w * 0.65, yTop, lineColor, lineWidth, 907);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = aLineO_A;
    drawWobblyLine(ctx, x2 + 45, yTop + 5, w * 0.65, yMid - 5, lineColor, lineWidth, 908);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = aLineC_C_diam;
    drawWobblyLine(ctx, x2 + 45, yBottom, w * 0.65, yBottom, lineColor, lineWidth, 909);
    ctx.restore();

    // NH3 lines
    ctx.save();
    ctx.globalAlpha = aLineB_N;
    drawWobblyLine(ctx, w * 0.65, yTop, x3 - 45, yTop, lineColor, lineWidth, 910);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = aLineC_diam_H;
    drawWobblyLine(ctx, w * 0.65, yBottom, x3 - 45, yBottom, lineColor, lineWidth, 911);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = aLineA_H;
    drawWobblyLine(ctx, w * 0.65, yMid + 5, x3 - 45, yBottom - 5, lineColor, lineWidth, 912);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = aLineN_NH3;
    drawWobblyLine(ctx, x3, yTop + 18, x3, yMid - 24, colLineN_NH3, wLineN_NH3, 913);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = aLineH_NH3;
    drawWobblyLine(ctx, x3, yMid + 24, x3, yBottom - 18, colLineH_NH3, wLineH_NH3, 914);
    ctx.restore();


    // DRAW LAYER 2: Nodes & Labels (Foreground)

    // Silicon node (Si)
    ctx.save();
    drawWobblyRect(ctx, x1 - 45, yMid - 18, 90, 36, cSi, true, '#ffffff', 1.5, 915, aSi);
    ctx.globalAlpha = aSi;
    const siliconLabel = quizPage === 2 ? '矽 7 克' : '矽 Z 克';
    ctx.font = quizNodeFont(ctx, siliconLabel, w);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textSi;
    ctx.fillText(siliconLabel, x1, yMid);
    ctx.restore();

    // Oxygen node (O)
    ctx.save();
    drawWobblyRect(ctx, x2 - 45, yTop - 18, 90, 36, cO, true, '#ffffff', 1.5, 916, aO);
    ctx.globalAlpha = aO;
    const oxygenLabel = '氧 8 克';
    ctx.font = quizNodeFont(ctx, oxygenLabel, w);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textO;
    ctx.fillText(oxygenLabel, x2, yTop);
    ctx.restore();

    // Carbon node (C)
    ctx.save();
    drawWobblyRect(ctx, x2 - 45, yBottom - 18, 90, 36, cC, true, '#ffffff', 1.5, 917, aC);
    ctx.globalAlpha = aC;
    const carbonLabel = quizPage === 2 ? '碳 3 克' : '碳 Y 克';
    ctx.font = quizNodeFont(ctx, carbonLabel, w);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textC;
    ctx.fillText(carbonLabel, x2, yBottom);
    ctx.restore();

    // Nitrogen node (N)
    ctx.save();
    drawWobblyRect(ctx, x3 - 45, yTop - 18, 90, 36, cN, true, '#ffffff', 1.5, 918, aN);
    ctx.globalAlpha = aN;
    const nitrogenLabel = quizPage === 2 ? '氮 4.67 克' : '氮 X 克';
    ctx.font = quizNodeFont(ctx, nitrogenLabel, w);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textN;
    ctx.fillText(nitrogenLabel, x3, yTop);
    ctx.restore();

    // Hydrogen node (H)
    ctx.save();
    drawWobblyRect(ctx, x3 - 45, yBottom - 18, 90, 36, cH, true, '#ffffff', 1.5, 919, aH);
    ctx.globalAlpha = aH;
    const hydrogenLabel = '氫 1 克';
    ctx.font = quizNodeFont(ctx, hydrogenLabel, w);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textH;
    ctx.fillText(hydrogenLabel, x3, yBottom);
    ctx.restore();

    // Circle SiC
    ctx.save();
    ctx.globalAlpha = 1.0;
    drawWobblyCircle(ctx, w * 0.22, yMid + 50, 24, '#f3f4f6', true, 1.2, 920);
    ctx.globalAlpha = aSiC;
    drawWobblyCircle(ctx, w * 0.22, yMid + 50, 24, circSiC, false, 1.2, 920);
    drawColoredFormula(ctx, 'SiC', w * 0.22, yMid + 50, activeHints[3]);
    ctx.restore();

    // Circle CO2
    ctx.save();
    ctx.globalAlpha = 1.0;
    drawWobblyCircle(ctx, x2, yMid, 24, '#f3f4f6', true, 1.2, 921);
    ctx.globalAlpha = aCO2;
    drawWobblyCircle(ctx, x2, yMid, 24, circCO2, false, 1.2, 921);
    drawColoredFormula(ctx, 'CO₂', x2, yMid, activeHints[2]);
    ctx.restore();

    // Circle NH3
    ctx.save();
    ctx.globalAlpha = 1.0;
    drawWobblyCircle(ctx, x3, yMid, 24, '#f3f4f6', true, 1.2, 922);
    ctx.globalAlpha = aNH3;
    drawWobblyCircle(ctx, x3, yMid, 24, circNH3, false, 1.2, 922);
    drawColoredFormula(ctx, 'NH₃', x3, yMid, activeHints[1]);
    ctx.restore();

    // Diamond D
    ctx.save();
    drawDiamond(ctx, w * 0.22, yMid - 50, 18, '#ffffff', '#2b2b2b', aD);
    ctx.globalAlpha = aD;
    ctx.font = 'bold 1.05rem sans-serif';
    ctx.fillStyle = '#1f1f1f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('D', w * 0.22, yMid - 50);
    ctx.restore();

    // Diamond A
    ctx.save();
    drawDiamond(ctx, w * 0.65, yMid, 18, '#ffffff', '#2b2b2b', aA);
    ctx.globalAlpha = aA;
    ctx.font = 'bold 1.05rem sans-serif';
    ctx.fillStyle = '#1f1f1f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', w * 0.65, yMid);
    ctx.restore();

    // Diamond B
    ctx.save();
    drawDiamond(ctx, w * 0.65, yTop, 18, '#ffffff', '#2b2b2b', aB);
    ctx.globalAlpha = aB;
    ctx.font = 'bold 1.05rem sans-serif';
    ctx.fillStyle = '#1f1f1f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', w * 0.65, yTop);
    ctx.restore();

    // Diamond C
    ctx.save();
    drawDiamond(ctx, w * 0.65, yBottom, 18, '#ffffff', '#2b2b2b', aC_diam);
    ctx.globalAlpha = aC_diam;
    ctx.font = 'bold 1.05rem sans-serif';
    ctx.fillStyle = '#1f1f1f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('C', w * 0.65, yBottom);
    ctx.restore();

    ctx.restore();
}

// Answer validation logic
function verifyCurrentQuiz() {
    const feedback = document.getElementById('quizFeedback');
    feedback.style.display = 'block';

    if (quizPage === 1) {
        if (subPage === 1) {
            const xVal = document.getElementById('quiz-x').value.trim();
            const xNum = parseFloat(xVal);
            const isXCorrect = (xVal === '14/3' || xVal === '4.67' || Math.abs(xNum - 4.67) < 0.02 || Math.abs(xNum - 14/3) < 0.02);

            if (isXCorrect) {
                subPage1Passed = true;
                document.getElementById('quiz-btn-next').disabled = false;
                feedback.style.background = '#eafaf1';
                feedback.style.borderColor = '#2e7d32';
                feedback.style.color = '#2e7d32';
                feedback.innerHTML = '🎉 <b>正確！</b><br>X = 4.67 克。<br>請點擊右下方的「下一題 ➡」繼續。';
            } else {
                feedback.style.background = '#fdeded';
                feedback.style.borderColor = '#d32f2f';
                feedback.style.color = '#d32f2f';
                feedback.innerHTML = '❌ <b>數值有誤，請再試一次！</b><br>提示：NH₃ 中 N:H = 14:3，故 1g H 需要 4.67g N (X = 4.67)。';
            }
        } else if (subPage === 2) {
            const yVal = document.getElementById('quiz-y').value.trim();
            if (yVal === '3') {
                subPage2Passed = true;
                document.getElementById('quiz-btn-next').disabled = false;
                feedback.style.background = '#eafaf1';
                feedback.style.borderColor = '#2e7d32';
                feedback.style.color = '#2e7d32';
                feedback.innerHTML = '🎉 <b>正確！</b><br>Y = 3 克。<br>請點擊右下方的「下一題 ➡」繼續。';
            } else {
                feedback.style.background = '#fdeded';
                feedback.style.borderColor = '#d32f2f';
                feedback.style.color = '#d32f2f';
                feedback.innerHTML = '❌ <b>數值有誤，請再試一次！</b><br>提示：CO₂ 中 C:O = 12:32 = 3:8，故 8g O 需要 3g C (Y = 3)。';
            }
        } else if (subPage === 3) {
            const zVal = document.getElementById('quiz-z').value.trim();
            if (zVal === '7') {
                subPage3Passed = true;
                document.getElementById('quiz-btn-next').disabled = false;
                feedback.style.background = '#eafaf1';
                feedback.style.borderColor = '#2e7d32';
                feedback.style.color = '#2e7d32';
                feedback.innerHTML = '🎉 <b>正確！</b><br>Z = 7 克。<br>請點擊右下方的「下一題 ➡」進入下一階段的化學式挑戰。';
            } else {
                feedback.style.background = '#fdeded';
                feedback.style.borderColor = '#d32f2f';
                feedback.style.color = '#d32f2f';
                feedback.innerHTML = '❌ <b>數值有誤，請再試一次！</b><br>提示：SiC 中 Si:C = 28:12 = 7:3，故 3g C 需要 7g Si (Z = 7)。';
            }
        }
    } else if (quizPage === 2) {
        const a = document.getElementById('quiz-a').value;
        const b = document.getElementById('quiz-b').value;
        const c = document.getElementById('quiz-c').value;
        const d = document.getElementById('quiz-d').value;

        if (a === 'H2O' && b === 'N2O3' && c === 'CH4' && d === 'SiO2') {
            page2Passed = true;
            document.getElementById('quiz-btn-next').textContent = '挑戰完成';
            document.getElementById('quiz-btn-next').disabled = true;
            feedback.style.background = '#eafaf1';
            feedback.style.borderColor = '#2e7d32';
            feedback.style.color = '#2e7d32';
            feedback.innerHTML = '🎉 <b>全部正確！恭喜您完成了所有定比定律的挑戰！</b><br>您已成功推導出所有未知的化學式：<br>• (A) = H₂O<br>• (B) = N₂O₃<br>• (C) = CH₄<br>• (D) = SiO₂';
        } else {
            feedback.style.background = '#fdeded';
            feedback.style.borderColor = '#d32f2f';
            feedback.style.color = '#d32f2f';
            feedback.innerHTML = '❌ <b>答案尚未完全正確！</b><br>提示：請檢查各選項的原子數比例換算（原子量比 H=1, C=12, N=14, O=16, Si=28）。';
        }
    }
}

// Keep UI state synchronized
function updateQuizUI() {
    const btnBack = document.getElementById('quiz-btn-back');
    const btnNext = document.getElementById('quiz-btn-next');
    
    if (quizPage === 1) {
        btnBack.textContent = (subPage === 1) ? '⬅ 返回步驟 8' : '⬅ 上一題';
        btnNext.textContent = '下一題 ➡';
        
        if (subPage === 1) {
            btnNext.disabled = !subPage1Passed;
        } else if (subPage === 2) {
            btnNext.disabled = !subPage2Passed;
        } else if (subPage === 3) {
            btnNext.disabled = !subPage3Passed;
        }
        
        document.getElementById('quiz-title').textContent = '例題一：定比關係定量推導練習';
        document.getElementById('quiz-desc').textContent = '請根據左側關係圖，由已知的化學式與部分元素質量，依序推導出未知的元素質量，並在右側輸入進行驗證。';
        document.getElementById('right-panel-title').textContent = '定量推導挑戰';
        
        document.getElementById('quizContentPage1').style.display = 'block';
        document.getElementById('quizContentPage2').style.display = 'none';
        
        document.getElementById('quiz-indicator').textContent = `例題 1 / 2 (第 ${subPage} / 3 小題)`;
        
        // Show/hide sub-questions
        document.getElementById('q-wrapper-1').style.display = (subPage === 1) ? 'block' : 'none';
        
        const qw2 = document.getElementById('q-wrapper-2');
        if (qw2) {
            qw2.style.borderTop = 'none';
            qw2.style.paddingTop = '0';
            qw2.style.display = (subPage === 2) ? 'block' : 'none';
        }
        
        const qw3 = document.getElementById('q-wrapper-3');
        if (qw3) {
            qw3.style.borderTop = 'none';
            qw3.style.paddingTop = '0';
            qw3.style.display = (subPage === 3) ? 'block' : 'none';
        }
    } else {
        btnBack.textContent = '⬅ 上一題';
        btnNext.disabled = !page2Passed;
        if (page2Passed) {
            btnNext.textContent = '挑戰完成';
        } else {
            btnNext.textContent = '下一題 ➡';
        }
        
        document.getElementById('quiz-title').textContent = '例題二：進階化學式推導挑戰';
        document.getElementById('quiz-desc').textContent = '利用先前求得的 X、Y、Z，進一步推導未知化合物 (A)、(B)、(C)、(D) 的最簡化學式，並在右側進行選擇與驗證。';
        document.getElementById('right-panel-title').textContent = '化學式推導挑戰';
        
        document.getElementById('quizContentPage1').style.display = 'none';
        document.getElementById('quizContentPage2').style.display = 'block';
        
        document.getElementById('quiz-indicator').textContent = '例題 2 / 2';
    }
    
    // Resize & redraw canvases
    resizeCanvas();
}

// Navigation Logic
function navigateQuizNext() {
    const feedback = document.getElementById('quizFeedback');
    if (quizPage === 1) {
        if (subPage === 1 && subPage1Passed) {
            subPage = 2;
            feedback.style.display = 'none';
            updateQuizUI();
        } else if (subPage === 2 && subPage2Passed) {
            subPage = 3;
            feedback.style.display = 'none';
            updateQuizUI();
        } else if (subPage === 3 && subPage3Passed) {
            collapseAllHints();
            quizPage = 2;
            feedback.style.display = 'none';
            updateQuizUI();
        }
    }
}

function navigateQuizBack() {
    const feedback = document.getElementById('quizFeedback');
    if (quizPage === 2) {
        collapseAllHints();
        quizPage = 1;
        subPage = 3;
        feedback.style.display = 'none';
        updateQuizUI();
    } else if (quizPage === 1) {
        if (subPage === 3) {
            collapseAllHints();
            subPage = 2;
            feedback.style.display = 'none';
            updateQuizUI();
        } else if (subPage === 2) {
            collapseAllHints();
            subPage = 1;
            feedback.style.display = 'none';
            updateQuizUI();
        } else if (subPage === 1) {
            location.href = "index.html?step=8";
        }
    }
}

// Initialization
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramQuiz = parseInt(urlParams.get('quiz'), 10);
    const paramSub = parseInt(urlParams.get('sub'), 10);

    if (paramQuiz === 1 || paramQuiz === 2) {
        quizPage = paramQuiz;
        if (paramQuiz === 1 && paramSub >= 1 && paramSub <= 3) {
            subPage = paramSub;
        }
    }
    updateQuizUI();
    quizCanvasResizeObserver?.observe(canvas.parentElement);
};

window.onresize = scheduleQuizCanvasResize;
