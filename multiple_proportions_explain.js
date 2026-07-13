// Option Selection Interactivity
let selectedOption = null;

function selectOption(option, btn) {
    // Reset all buttons
    document.querySelectorAll('.option-btn').forEach(b => {
        b.classList.remove('correct', 'incorrect');
    });

    const feedbackBox = document.getElementById('feedback-box');
    feedbackBox.style.display = 'block';

    if (option === 'D') {
        btn.classList.add('correct');
        feedbackBox.style.borderColor = '#10b981';
        feedbackBox.style.background = '#ecfdf5';
        feedbackBox.style.color = '#065f46';
        feedbackBox.innerHTML = `<strong>答對了！恭喜！(D) 是正確選項。</strong><br>第一個化合物是 XY，其元素質量為 X: 9.34g, Y: 2.00g；第二個化合物是 XY<sub>n</sub>，其元素質量為 X: 4.67g, Y: 3.00g。<br>為了比較，可以點擊下方「顯示代數表徵」與「顯示幾何表徵」按鈕，看看如何利用「等質量法」求得 n = 3。`;
        
        // Auto active both panels or guide user
        document.getElementById('btn-show-algebraic').scrollIntoView({ behavior: 'smooth' });
    } else {
        btn.classList.add('incorrect');
        feedbackBox.style.borderColor = '#ef4444';
        feedbackBox.style.background = '#fef2f2';
        feedbackBox.style.color = '#991b1b';
        feedbackBox.innerHTML = `<strong>答錯囉，請再試試看！</strong><br>提示：倍比定律的關鍵在於「固定其中一個元素的質量，再比較另一個元素的質量比」。您可以點擊下方的按鈕觀看代數與幾何的解法！`;
    }
}

// Side Panels Interactivity
let algebraicActive = false;
let geometricActive = false;

function toggleAlgebraic() {
    algebraicActive = !algebraicActive;
    const panel = document.getElementById('algebraic-panel');
    const btn = document.getElementById('btn-show-algebraic');
    
    if (algebraicActive) {
        panel.classList.add('active');
        btn.innerText = '隱藏代數表徵';
        btn.style.background = 'var(--color-orange)';
        btn.style.color = '#ffffff';
    } else {
        panel.classList.remove('active');
        btn.innerText = '顯示代數表徵';
        btn.style.background = '#ffffff';
        btn.style.color = 'var(--text-primary)';
    }
}

function toggleGeometric() {
    geometricActive = !geometricActive;
    const panel = document.getElementById('geometric-panel');
    const btn = document.getElementById('btn-show-geometric');
    
    if (geometricActive) {
        panel.classList.add('active');
        btn.innerText = '隱藏幾何表徵';
        btn.style.background = '#7c3aed';
        btn.style.color = '#ffffff';
        
        // Init Canvas and play animation
        initCanvas();
        startAnimation();
    } else {
        panel.classList.remove('active');
        btn.innerText = '顯示幾何表徵';
        btn.style.background = '#ffffff';
        btn.style.color = 'var(--text-primary)';
        
        stopAnimation();
    }
}

// ==========================================
// Canvas Drawing & Geometry Animation
// ==========================================

let canvas = null;
let ctx = null;
let animationId = null;
let startTime = null;
const animDuration = 2500; // 2.5 seconds total

// Seeded Random for Hand-drawn wobbly effect
let rndSeed = 42;
function setRndSeed(val) {
    rndSeed = val;
}
function seededRandom() {
    let x = Math.sin(rndSeed++) * 10000;
    return x - Math.floor(x);
}

// Draw a hand-drawn wobbly line
function drawWobblyLine(ctx, x1, y1, x2, y2, color = '#2b2b2b', width = 2, seed = 42) {
    setRndSeed(seed);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    
    if (len < 5) {
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    } else {
        const segments = Math.max(3, Math.floor(len / 15));
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            let px = x1 + dx * t;
            let py = y1 + dy * t;
            if (i < segments) {
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

// Coordinate mapping parameters
const margin = 50;

function mapX(xVal, w) {
    return margin + (xVal / 12.0) * (w - 2 * margin);
}

function mapY(yVal, h) {
    return h - margin - (yVal / 8.0) * (h - 2 * margin);
}

function initCanvas() {
    canvas = document.getElementById('explainCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    
    // Resize to match parent wrapper bounds
    const rect = canvas.closest('.canvas-wrapper').getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

function startAnimation() {
    stopAnimation();
    startTime = performance.now();
    requestAnimationFrame(renderLoop);
}

function stopAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function renderLoop(now) {
    if (!canvas || !ctx) return;
    
    const elapsed = now - startTime;
    let t = Math.min(elapsed / animDuration, 1.0); // 0.0 -> 1.0
    
    // Ease transition
    const progress = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    
    draw(progress);
    
    if (t < 1.0) {
        animationId = requestAnimationFrame(renderLoop);
    }
}

function draw(p) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    // 1. Draw Grid Lines (straight lines, light gray)
    ctx.save();
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    
    // X ticks grid (every 3 units)
    for (let xVal = 3; xVal <= 12; xVal += 3) {
        const tx = mapX(xVal, w);
        ctx.beginPath();
        ctx.moveTo(tx, mapY(0, h));
        ctx.lineTo(tx, mapY(8, h));
        ctx.stroke();
    }
    // Y ticks grid (every 2 units)
    for (let yVal = 2; yVal <= 8; yVal += 2) {
        const ty = mapY(yVal, h);
        ctx.beginPath();
        ctx.moveTo(mapX(0, w), ty);
        ctx.lineTo(mapX(12, w), ty);
        ctx.stroke();
    }
    ctx.restore();
    
    // 2. Draw Axes (Wobbly)
    drawWobblyLine(ctx, mapX(0, w), mapY(0, h), mapX(12, w), mapY(0, h), '#2b2b2b', 2, 201); // X Axis
    drawWobblyLine(ctx, mapX(0, w), mapY(0, h), mapX(0, w), mapY(8, h), '#2b2b2b', 2, 202); // Y Axis
    
    // Ticks & Numbers
    ctx.fillStyle = '#5f5f5f';
    ctx.font = 'Outfit sans-serif';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // X ticks
    for (let xVal = 3; xVal <= 12; xVal += 3) {
        const tx = mapX(xVal, w);
        drawWobblyLine(ctx, tx, mapY(0, h), tx, mapY(0, h) + 5, '#2b2b2b', 1.5, 300 + xVal);
        ctx.fillText(xVal, tx, mapY(0, h) + 18);
    }
    // Y ticks
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let yVal = 2; yVal <= 8; yVal += 2) {
        const ty = mapY(yVal, h);
        drawWobblyLine(ctx, mapX(0, w), ty, mapX(0, w) - 5, ty, '#2b2b2b', 1.5, 400 + yVal);
        ctx.fillText(yVal, mapX(0, w) - 10, ty);
    }
    
    // Axis labels
    ctx.fillStyle = '#2b2b2b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('X 元素質量 wX (g)', mapX(12, w), mapY(0, h) + 32);
    ctx.textAlign = 'left';
    ctx.fillText('Y 元素質量 wY (g)', mapX(0, w), mapY(8, h) - 15);
    
    // 3. Draw Relationship Lines (0.0 -> 0.6 timeline)
    const lineP = Math.min(p / 0.6, 1.0);
    const lineXLimit = 12.0 * lineP;
    
    // Compound 1 (XY): w_Y = (2.00 / 9.34) * w_X
    // At w_X = 12.0, w_Y = 2.57
    const endX1 = mapX(lineXLimit, w);
    const endY1 = mapY((2.00 / 9.34) * lineXLimit, h);
    drawWobblyLine(ctx, mapX(0, w), mapY(0, h), endX1, endY1, '#ff7a00', 3, 501);
    
    // Compound 2 (XYn): w_Y = (3.00 / 4.67) * w_X
    // At w_X = 11.0, w_Y = 7.06
    const limitX2 = Math.min(lineXLimit, 11.0);
    const endX2 = mapX(limitX2, w);
    const endY2 = mapY((3.00 / 4.67) * limitX2, h);
    drawWobblyLine(ctx, mapX(0, w), mapY(0, h), endX2, endY2, '#7c3aed', 3, 502);
    
    // Labels for lines (drawn when lines finished)
    if (p >= 0.5) {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ff7a00';
        ctx.textAlign = 'left';
        ctx.fillText('第一個化合物 XY', mapX(10, w), mapY((2.00 / 9.34) * 10, h) + 15);
        
        ctx.fillStyle = '#7c3aed';
        ctx.fillText('第二個化合物 XYn', mapX(9.2, w), mapY((3.00 / 4.67) * 9.2, h) - 15);
    }
    
    // 4. Plot points and highlight original samples (0.5 -> 0.8 timeline)
    if (p >= 0.4) {
        const ptP = Math.min((p - 0.4) / 0.3, 1.0);
        ctx.save();
        ctx.globalAlpha = ptP;
        
        // Point A (9.34, 2.00)
        const pAx = mapX(9.34, w);
        const pAy = mapY(2.00, h);
        ctx.beginPath();
        ctx.arc(pAx, pAy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff7a00';
        ctx.fill();
        ctx.strokeStyle = '#2b2b2b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ff7a00';
        ctx.textAlign = 'left';
        ctx.fillText('  (9.34, 2.00)', pAx, pAy + 8);
        
        // Point B (4.67, 3.00)
        const pBx = mapX(4.67, w);
        const pBy = mapY(3.00, h);
        ctx.beginPath();
        ctx.arc(pBx, pBy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#7c3aed';
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#7c3aed';
        ctx.textAlign = 'right';
        ctx.fillText('(4.67, 3.00)  ', pBx, pBy - 8);
        ctx.restore();
    }
    
    // 5. Draw Vertical dashed helper line at w_X = 9.34 (0.7 -> 0.9 timeline)
    if (p >= 0.7) {
        const helperP = Math.min((p - 0.7) / 0.2, 1.0);
        const targetHeight = 6.2; // slightly above intersection at Y=6.00
        const startY = mapY(0, h);
        const endY = mapY(targetHeight * helperP, h);
        const refX = mapX(9.34, w);
        
        // Draw dashed wobbly-like straight vertical line
        ctx.save();
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(refX, startY);
        ctx.lineTo(refX, endY);
        ctx.stroke();
        ctx.restore();
        
        // Intersection markers
        if (p >= 0.8) {
            const ixP = Math.min((p - 0.8) / 0.1, 1.0);
            ctx.save();
            ctx.globalAlpha = ixP;
            
            // Marker 1: XY at (9.34, 2.00)
            ctx.beginPath();
            ctx.arc(refX, mapY(2.00, h), 7, 0, Math.PI * 2);
            ctx.strokeStyle = '#ff7a00';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            
            // Marker 2: XY_n at (9.34, 6.00)
            ctx.beginPath();
            ctx.arc(refX, mapY(6.00, h), 7, 0, Math.PI * 2);
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = '#7c3aed';
            ctx.textAlign = 'right';
            ctx.fillText('(9.34, 6.00)  ', refX - 8, mapY(6.00, h));
            
            ctx.restore();
        }
    }
    
    // 6. Draw vertical comparison bracket and ratio labels (0.85 -> 1.0 timeline)
    if (p >= 0.85) {
        const brP = Math.min((p - 0.85) / 0.15, 1.0);
        ctx.save();
        ctx.globalAlpha = brP;
        
        const refX = mapX(9.34, w);
        const yA = mapY(2.00, h);
        const yC = mapY(6.00, h);
        
        // Draw bracket on the right of the vertical line
        drawBracket(ctx, refX + 8, yA, yC, 'Y 質量比 = 2 : 6 = 1 : 3');
        ctx.restore();
    }
}

function drawBracket(ctx, x, y1, y2, label) {
    ctx.strokeStyle = '#1f1f1f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // A bracket shape facing right: {
    // y1 (bottom) is larger y-pixel coordinate, y2 (top) is smaller y-pixel coordinate
    const topY = Math.min(y1, y2);
    const bottomY = Math.max(y1, y2);
    const midY = (topY + bottomY) / 2;
    
    ctx.moveTo(x + 5, topY);
    ctx.lineTo(x + 12, topY);
    ctx.lineTo(x + 12, midY - 6);
    ctx.lineTo(x + 19, midY);
    ctx.lineTo(x + 12, midY + 6);
    ctx.lineTo(x + 12, bottomY);
    ctx.lineTo(x + 5, bottomY);
    ctx.stroke();
    
    // Label text
    ctx.fillStyle = '#1f1f1f';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + 24, midY);
}

// Window resizing
window.addEventListener('resize', () => {
    if (geometricActive && canvas) {
        initCanvas();
        draw(1.0); // redraw completed frame
    }
});

// ==========================================
// Interactive Algebraic Step-by-Step Wizard
// ==========================================

let fixedElement = null;
let tempMass = null;
let selectedMass = null;

function selectFixedElement(el) {
    fixedElement = el;
    tempMass = (el === 'X') ? 9.34 : 6.00; // default recommended values
    selectedMass = null;
    renderAlgebraicWizard();
}

function selectTargetMass(val) {
    tempMass = val;
    renderAlgebraicWizard();
}

function confirmCalculation() {
    selectedMass = tempMass;
    renderAlgebraicWizard();
}

function resetWizard() {
    fixedElement = null;
    tempMass = null;
    selectedMass = null;
    renderAlgebraicWizard();
}

function renderAlgebraicWizard() {
    const tableBody = document.getElementById('alg-table-body');
    const container = document.getElementById('alg-wizard-container');
    if (!tableBody || !container) return;

    if (fixedElement === null) {
        // Step 1: Raw Table with no brackets, Compound II shows X_a Y_b
        tableBody.innerHTML = `
            <tr style="color: var(--color-orange); font-weight: 500;">
                <td style="font-weight: bold;">第一個化合物 (XY)</td>
                <td>9.34</td>
                <td>2.00</td>
            </tr>
            <tr style="color: #7c3aed; font-weight: 500;">
                <td style="font-weight: bold;">第二個化合物 (X<sub>a</sub>Y<sub>b</sub>)</td>
                <td>4.67</td>
                <td>3.00</td>
            </tr>
        `;
        
        container.innerHTML = `
            <div class="step-card" style="border-color: var(--border-color);">
                <strong style="font-size: 0.95rem; color: #2b2b2b;">步驟 1：請選擇欲固定的元素</strong><br>
                <span style="color: var(--text-secondary); font-size: 0.85rem;">倍比定律的代數解法中，必須先將其中一個元素的質量調整至相同，才能觀察另一個元素的質量比例。</span>
                <div style="margin-top: 0.6rem;">
                    <button class="wizard-btn active" onclick="selectFixedElement('X')">固定 X 元素</button>
                    <button class="wizard-btn active" onclick="selectFixedElement('Y')" style="border-color: #7c3aed; color: #7c3aed; background: #ffffff;">固定 Y 元素</button>
                </div>
            </div>
        `;
    } else if (selectedMass === null) {
        // Step 2: Choosing mass values
        tableBody.innerHTML = `
            <tr style="color: var(--color-orange); font-weight: 500;">
                <td style="font-weight: bold;">第一個化合物 (XY)</td>
                <td>9.34</td>
                <td>2.00</td>
            </tr>
            <tr style="color: #7c3aed; font-weight: 500;">
                <td style="font-weight: bold;">第二個化合物 (X<sub>a</sub>Y<sub>b</sub>)</td>
                <td>4.67</td>
                <td>3.00</td>
            </tr>
        `;

        let massOptions = '';
        if (fixedElement === 'X') {
            massOptions = `
                <button class="wizard-btn orange ${tempMass === 9.34 ? 'active' : ''}" onclick="selectTargetMass(9.34)">9.34 克 (推薦)</button>
                <button class="wizard-btn orange ${tempMass === 4.67 ? 'active' : ''}" onclick="selectTargetMass(4.67)">4.67 克</button>
            `;
        } else {
            massOptions = `
                <button class="wizard-btn purple ${tempMass === 6.00 ? 'active' : ''}" onclick="selectTargetMass(6.00)">6.00 克 (推薦)</button>
                <button class="wizard-btn purple ${tempMass === 3.00 ? 'active' : ''}" onclick="selectTargetMass(3.00)">3.00 克</button>
                <button class="wizard-btn purple ${tempMass === 2.00 ? 'active' : ''}" onclick="selectTargetMass(2.00)">2.00 克</button>
            `;
        }

        container.innerHTML = `
            <div class="step-card" style="border-color: var(--border-color);">
                <strong style="font-size: 0.95rem; color: #2b2b2b;">步驟 2：設定固定後的 ${fixedElement} 元素目標質量</strong><br>
                <span style="color: var(--text-secondary); font-size: 0.85rem;">選擇您希望將 ${fixedElement} 質量固定為多少克：</span>
                <div style="margin-top: 0.6rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0.2rem;">
                    ${massOptions}
                </div>
                <div style="margin-top: 0.8rem; display: flex; justify-content: space-between;">
                    <button class="wizard-btn" onclick="resetWizard()" style="border-color: #ef4444; color: #ef4444; margin: 0;">返回步驟 1</button>
                    <button class="wizard-btn active" onclick="confirmCalculation()" style="background: var(--border-color); color: #ffffff; margin: 0;">確認進行計算 &rArr;</button>
                </div>
            </div>
        `;
    } else {
        // Steps 3-6: Rendering scaling and results
        const factor1 = (fixedElement === 'X') ? selectedMass / 9.34 : selectedMass / 2.00;
        const factor2 = (fixedElement === 'X') ? selectedMass / 4.67 : selectedMass / 3.00;

        const c1X_scaled = 9.34 * factor1;
        const c1Y_scaled = 2.00 * factor1;
        const c2X_scaled = 4.67 * factor2;
        const c2Y_scaled = 3.00 * factor2;

        let c2FormulaLabel = '';
        if (fixedElement === 'X') {
            c2FormulaLabel = `XY<sub>n</sub>`;
        } else {
            c2FormulaLabel = `X<sub>n</sub>Y`;
        }

        tableBody.innerHTML = `
            <tr style="color: var(--color-orange); font-weight: 500;">
                <td style="font-weight: bold;">第一個化合物 (XY)</td>
                <td>
                    9.34${factor1 !== 1 ? `<br><span style="font-size: 0.88em; font-weight: bold;">( ${c1X_scaled.toFixed(2)} )</span>` : ''}
                </td>
                <td>
                    2.00${factor1 !== 1 ? `<br><span style="font-size: 0.88em; font-weight: bold;">( ${c1Y_scaled.toFixed(2)} )</span>` : ''}
                </td>
            </tr>
            <tr style="color: #7c3aed; font-weight: 500;">
                <td style="font-weight: bold;">第二個化合物 (${c2FormulaLabel})</td>
                <td>
                    4.67${factor2 !== 1 ? `<br><span style="font-size: 0.88em; font-weight: bold;">( ${c2X_scaled.toFixed(2)} )</span>` : ''}
                </td>
                <td>
                    3.00${factor2 !== 1 ? `<br><span style="font-size: 0.88em; font-weight: bold;">( ${c2Y_scaled.toFixed(2)} )</span>` : ''}
                </td>
            </tr>
        `;

        let deductionText = '';
        if (fixedElement === 'X') {
            const ratioY = c2Y_scaled / c1Y_scaled;
            deductionText = `
                <strong style="font-size: 0.95rem; color: #2b2b2b;">步驟 3-6：代數比例推導結果</strong><br>
                <div style="margin-top: 0.4rem;">
                    1. <strong>固定元素同質量</strong>：此時 X 的質量均固定為 <span style="font-weight: bold;">${selectedMass.toFixed(2)}g</span>。<br>
                    2. <strong>重量相同代表原子數目相同</strong>：此時兩個化合物中的 X 原子數目被視為相同（代表 1 個 X 原子），故化合物 II 可表示為 <strong>XY<sub>n</sub></strong>。<br>
                    3. <strong>觀察另一個元素的質量比</strong>：第一個化合物中 Y 的質量為 <span style="color: var(--color-orange); font-weight: bold;">${c1Y_scaled.toFixed(2)}g</span>，第二個化合物中 Y 的質量為 <span style="color: #7c3aed; font-weight: bold;">${c2Y_scaled.toFixed(2)}g</span>。<br>
                    4. <strong>求出原子個數比 (n值)</strong>：在 X 原子數相同時，Y 的原子個數比即為其質量比：
                    <div style="text-align: center; margin: 0.4rem 0; font-size: 1.1rem; font-weight: bold; font-family: var(--font-heading);">
                        Y 原子比 1 : n = <span style="color: var(--color-orange);">${c1Y_scaled.toFixed(2)}</span> : <span style="color: #7c3aed;">${c2Y_scaled.toFixed(2)}</span> = 1 : ${ratioY.toFixed(1)}
                    </div>
                </div>
            `;

            // Rule 6 check: Non-integer atom handling
            if (Math.abs(ratioY - 3.0) < 0.01) {
                if (Math.abs(factor1 - 0.5) < 0.01) {
                    // Fixed to X = 4.67
                    deductionText += `
                        <div style="border-top: 1.5px dashed rgba(43,43,43,0.15); padding-top: 0.4rem; margin-top: 0.4rem;">
                            5. <strong>注意非整數原子個數的處理</strong>：此時 X 質量為 4.67g (相當於 0.5 個 X 原子)，求得 Y 原子數 n = 3，分子式寫為 <strong>X<sub>0.5</sub>Y<sub>1.5</sub></strong>。<br>
                            6. <strong>化為最簡整數比</strong>：根據原子說，原子不能分割，個數必須為整數。我們將式子中的原子數同乘以 2，得到 1 : 3，故第二個化合物的分子式為 <strong style="color: #7c3aed;">XY₃</strong>。
                        </div>
                    `;
                } else {
                    // Fixed to X = 9.34
                    deductionText += `
                        <div style="border-top: 1.5px dashed rgba(43,43,43,0.15); padding-top: 0.4rem; margin-top: 0.4rem;">
                            5. <strong>確認整數比</strong>：n = ${ratioY.toFixed(0)} 為整數，符合原子說的整數原子假設。<br>
                            6. 故第二個化合物的分子式為 <strong style="color: #7c3aed;">XY₃</strong>。
                        </div>
                    `;
                }
            }
        } else {
            // Y is fixed
            const ratioX = c1X_scaled / c2X_scaled; // Compound 1 : Compound 2
            deductionText = `
                <strong style="font-size: 0.95rem; color: #2b2b2b;">步驟 3-6：代數比例推導結果</strong><br>
                <div style="margin-top: 0.4rem;">
                    1. <strong>固定元素同質量</strong>：此時 Y 的質量均固定為 <span style="font-weight: bold;">${selectedMass.toFixed(2)}g</span>。<br>
                    2. <strong>重量相同代表原子數目相同</strong>：此時兩個化合物中的 Y 原子數目視為相同，故化合物 II 可以表示為 <strong>X<sub>n</sub>Y</strong>（n 代表 X 相對於 1 個 Y 原子的比例）。<br>
                    3. <strong>觀察另一個元素 X 的質量比</strong>：第一個化合物中 X 的質量為 <span style="color: var(--color-orange); font-weight: bold;">${c1X_scaled.toFixed(2)}g</span>，第二個化合物中 X 的質量為 <span style="color: #7c3aed; font-weight: bold;">${c2X_scaled.toFixed(2)}g</span>。<br>
                    4. <strong>求出 X 的質量比</strong>：在固定相同 Y 質量下，第一個與第二個化合物的 X 質量比為：
                    <div style="text-align: center; margin: 0.4rem 0; font-size: 1.1rem; font-weight: bold; font-family: var(--font-heading);">
                        X 質量比 = <span style="color: var(--color-orange);">${c1X_scaled.toFixed(2)}</span> : <span style="color: #7c3aed;">${c2X_scaled.toFixed(2)}</span> = 3 : 1
                    </div>
                    5. <strong>推導暫時分子式</strong>：第一個化合物為 XY（X 與 Y 的個數比為 1 : 1）。在相同 Y 質量下，因為 X 的質量比為 3 : 1，所以第二個化合物中的 X 原子數只有第一個的 1/3 倍，此時分子式寫為 <strong>X<sub>1/3</sub>Y</strong>。<br>
                    <div style="border-top: 1.5px dashed rgba(43,43,43,0.15); padding-top: 0.4rem; margin-top: 0.4rem;">
                        6. <strong>化為整數比（符合原子說）</strong>：根據原子說，原子不能分割，個數必須為整數。我們將 <strong>X<sub>1/3</sub>Y<sub>1</sub></strong> 的下標同乘以 3，得到最簡整數比，故第二個化合物的分子式為 <strong style="color: #7c3aed;">XY₃</strong>。
                    </div>
                </div>
            `;

        container.innerHTML = `
            <div class="step-card" style="border-color: var(--border-color); max-height: 200px; overflow-y: auto;">
                ${deductionText}
                <div style="margin-top: 0.6rem; text-align: right; display: flex; justify-content: space-between;">
                    <button class="wizard-btn" onclick="resetWizard()" style="border-color: #ef4444; color: #ef4444; margin: 0;">重新計算</button>
                </div>
            </div>
        `;
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    renderAlgebraicWizard();
});

