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
        
        // Render step buttons and play animation
        renderGeometricWizard();
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

let resizeObserver = null;

function initCanvas() {
    canvas = document.getElementById('explainCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    
    const resize = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
            canvas.width = w;
            canvas.height = h;
            if (!animationId) {
                draw(1.0);
            }
        }
    };
    
    resize();
    
    if (window.ResizeObserver) {
        if (resizeObserver) resizeObserver.disconnect();
        resizeObserver = new ResizeObserver(() => {
            resize();
        });
        resizeObserver.observe(canvas.closest('.canvas-wrapper'));
    }
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
    
    // Ensure buffer size matches layout size dynamically during transition
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
    }
    
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
    
    // Determine step and mass parameters
    const currentStep = (fixedElement === null) ? 1 : ((selectedMass === null) ? 2 : 3);
    const activeMass = (selectedMass !== null) ? selectedMass : tempMass;

    // Define graph scale limits dynamically
    let xMax = 12;
    let yMax = 8;
    let xStep = 3;
    let yStep = 2;

    if (fixedElement === 'Y' && activeMass !== null) {
        if (activeMass >= 6.00) {
            xMax = 30;
            xStep = 6;
        } else if (activeMass >= 3.00) {
            xMax = 15;
            xStep = 3;
        }
    }

    // Coordinate mapping
    const mX = (xVal) => margin + (xVal / xMax) * (w - 2 * margin);
    const mY = (yVal) => h - margin - (yVal / yMax) * (h - 2 * margin);

    // 1. Draw Grid Lines
    ctx.save();
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    for (let xVal = xStep; xVal <= xMax; xVal += xStep) {
        const tx = mX(xVal);
        ctx.beginPath();
        ctx.moveTo(tx, mY(0));
        ctx.lineTo(tx, mY(yMax));
        ctx.stroke();
    }
    for (let yVal = yStep; yVal <= yMax; yVal += yStep) {
        const ty = mY(yVal);
        ctx.beginPath();
        ctx.moveTo(mX(0), ty);
        ctx.lineTo(mX(xMax), ty);
        ctx.stroke();
    }
    ctx.restore();

    // 2. Draw Axes
    drawWobblyLine(ctx, mX(0), mY(0), mX(xMax), mY(0), '#2b2b2b', 2, 201); // X Axis
    drawWobblyLine(ctx, mX(0), mY(0), mX(0), mY(yMax), '#2b2b2b', 2, 202); // Y Axis

    // Ticks & Numbers
    ctx.fillStyle = '#5f5f5f';
    ctx.font = 'Outfit sans-serif';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    for (let xVal = xStep; xVal <= xMax; xVal += xStep) {
        const tx = mX(xVal);
        drawWobblyLine(ctx, tx, mY(0), tx, mY(0) + 5, '#2b2b2b', 1.5, 300 + xVal);
        ctx.fillText(xVal, tx, mY(0) + 18);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let yVal = yStep; yVal <= yMax; yVal += yStep) {
        const ty = mY(yVal);
        drawWobblyLine(ctx, mX(0), ty, mX(0) - 5, ty, '#2b2b2b', 1.5, 400 + yVal);
        ctx.fillText(yVal, mX(0) - 10, ty);
    }

    // Axis labels
    ctx.fillStyle = '#2b2b2b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('X 元素質量 wX (g)', mX(xMax), mY(0) + 32);
    ctx.textAlign = 'left';
    ctx.fillText('Y 元素質量 wY (g)', mX(0), mY(yMax) - 15);

    // Clamp helper to keep progress between 0 and 1
    const clamp = (val) => Math.max(0.0, Math.min(val, 1.0));

    // 3. Draw constant-ratio wobbly lines from origin
    const ratioLineP = (currentStep === 1) ? clamp((p - 0.4) / 0.4) : 1.0;
    const endX1 = mX(xMax * ratioLineP);
    const endY1 = mY((2.00 / 9.34) * xMax * ratioLineP);
    drawWobblyLine(ctx, mX(0), mY(0), endX1, endY1, '#ff7a00', 3, 501);

    const limitX2 = Math.min(xMax, yMax * (4.67 / 3.00));
    const endX2 = mX(limitX2 * ratioLineP);
    const endY2 = mY((3.00 / 4.67) * limitX2 * ratioLineP);
    drawWobblyLine(ctx, mX(0), mY(0), endX2, endY2, '#7c3aed', 3, 502);

    // 4. Draw original sample points (Point I: (9.34, 2.00), Point II: (4.67, 3.00))
    const ptP = (currentStep === 1) ? clamp(p / 0.4) : 1.0;
    if (ptP > 0) {
        ctx.save();
        ctx.globalAlpha = ptP;
        
        // Point I
        const pAx = mX(9.34);
        const pAy = mY(2.00);
        ctx.beginPath();
        ctx.arc(pAx, pAy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff7a00';
        ctx.fill();
        ctx.strokeStyle = '#2b2b2b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ff7a00';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('I (XY)  ', pAx - 6, pAy - 6);
        
        // Point II
        const pBx = mX(4.67);
        const pBy = mY(3.00);
        ctx.beginPath();
        ctx.arc(pBx, pBy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#7c3aed';
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#7c3aed';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('II (XaYb)  ', pBx - 6, pBy - 6);
        ctx.restore();
    }

    // 5. Draw Blue Dashed Line and intersection points (Step 2+)
    if (currentStep >= 2 && activeMass !== null) {
        const helperP = (currentStep === 2) ? clamp((p - 0.3) / 0.4) : 1.0;
        
        ctx.save();
        ctx.strokeStyle = '#0284c7'; // fixed-element blue
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);

        if (fixedElement === 'X') {
            const ix1_y = (2.00 / 9.34) * activeMass;
            const ix2_y = (3.00 / 4.67) * activeMass;
            const targetY = Math.max(ix1_y, ix2_y) + 0.5;
            
            ctx.beginPath();
            ctx.moveTo(mX(activeMass), mY(0));
            ctx.lineTo(mX(activeMass), mY(targetY * helperP));
            ctx.stroke();
        } else {
            const ix1_x = (9.34 / 2.00) * activeMass;
            const ix2_x = (4.67 / 3.00) * activeMass;
            const targetX = Math.max(ix1_x, ix2_x) + 1.0;
            
            ctx.beginPath();
            ctx.moveTo(mX(0), mY(activeMass));
            ctx.lineTo(mX(targetX * helperP), mY(activeMass));
            ctx.stroke();
        }
        ctx.restore();

        // Draw intersection markers
        const ixP = (currentStep === 2) ? clamp((p - 0.7) / 0.3) : 1.0;
        if (ixP > 0) {
            ctx.save();
            ctx.globalAlpha = ixP;

            if (fixedElement === 'X') {
                const ix1_y = (2.00 / 9.34) * activeMass;
                const ix2_y = (3.00 / 4.67) * activeMass;
                
                // Intersection I
                ctx.beginPath();
                ctx.arc(mX(activeMass), mY(ix1_y), 5, 0, Math.PI * 2);
                ctx.fillStyle = '#0284c7';
                ctx.fill();
                ctx.strokeStyle = '#2b2b2b';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                
                ctx.font = 'bold 11px sans-serif';
                ctx.fillStyle = '#0284c7';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(`(${activeMass.toFixed(2)}, ${ix1_y.toFixed(2)})`, mX(activeMass) + 6, mY(ix1_y) + 6);
                
                // Intersection II
                ctx.beginPath();
                ctx.arc(mX(activeMass), mY(ix2_y), 5, 0, Math.PI * 2);
                ctx.fillStyle = '#0284c7';
                ctx.fill();
                ctx.strokeStyle = '#2b2b2b';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                
                ctx.fillStyle = '#0284c7';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(`(${activeMass.toFixed(2)}, ${ix2_y.toFixed(2)})`, mX(activeMass) + 6, mY(ix2_y) + 6);
            } else {
                const ix1_x = (9.34 / 2.00) * activeMass;
                const ix2_x = (4.67 / 3.00) * activeMass;
                
                // Intersection I
                ctx.beginPath();
                ctx.arc(mX(ix1_x), mY(activeMass), 5, 0, Math.PI * 2);
                ctx.fillStyle = '#0284c7';
                ctx.fill();
                ctx.strokeStyle = '#2b2b2b';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                
                ctx.font = 'bold 11px sans-serif';
                ctx.fillStyle = '#0284c7';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(`(${ix1_x.toFixed(2)}, ${activeMass.toFixed(2)})`, mX(ix1_x) + 6, mY(activeMass) + 6);
                
                // Intersection II
                ctx.beginPath();
                ctx.arc(mX(ix2_x), mY(activeMass), 5, 0, Math.PI * 2);
                ctx.fillStyle = '#0284c7';
                ctx.fill();
                ctx.strokeStyle = '#2b2b2b';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                
                ctx.fillStyle = '#0284c7';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(`(${ix2_x.toFixed(2)}, ${activeMass.toFixed(2)})`, mX(ix2_x) + 6, mY(activeMass) + 6);
            }
            ctx.restore();
        }
    }

    // 6. Draw comparison bracket and ratio labels (Step 3)
    if (currentStep === 3 && activeMass !== null) {
        const brP = clamp((p - 0.6) / 0.4);
        if (brP > 0) {
            ctx.save();
            ctx.globalAlpha = brP;
            
            if (fixedElement === 'X') {
                const ix1_y = (2.00 / 9.34) * activeMass;
                const ix2_y = (3.00 / 4.67) * activeMass;
                const ratioY = ix2_y / ix1_y;
                
                drawVerticalBracket(ctx, mX(activeMass) + 70, mY(ix1_y), mY(ix2_y), `Y 質量比 = ${ix1_y.toFixed(2)} : ${ix2_y.toFixed(2)} = 1 : ${ratioY.toFixed(0)}`);
            } else {
                const ix1_x = (9.34 / 2.00) * activeMass;
                const ix2_x = (4.67 / 3.00) * activeMass;
                const ratioX = ix1_x / ix2_x;
                
                drawHorizontalBracket(ctx, mX(ix2_x), mX(ix1_x), mY(activeMass) + 22, `X 質量比 = ${ix1_x.toFixed(2)} : ${ix2_x.toFixed(2)} = ${ratioX.toFixed(0)} : 1 ➡ a = 1/${ratioX.toFixed(0)}`);
            }
            ctx.restore();
        }
    }
}

function drawVerticalBracket(ctx, x, y1, y2, label) {
    ctx.save();
    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const topY = Math.min(y1, y2);
    const bottomY = Math.max(y1, y2);
    const midY = (topY + bottomY) / 2;
    
    // Bracket shape facing right: {
    ctx.moveTo(x + 5, topY);
    ctx.lineTo(x + 12, topY);
    ctx.lineTo(x + 12, midY - 6);
    ctx.lineTo(x + 18, midY);
    ctx.lineTo(x + 12, midY + 6);
    ctx.lineTo(x + 12, bottomY);
    ctx.lineTo(x + 5, bottomY);
    ctx.stroke();
    
    // Label text
    ctx.fillStyle = '#2b2b2b';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + 24, midY);
    ctx.restore();
}

function drawHorizontalBracket(ctx, x1, x2, y, label) {
    ctx.save();
    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const leftX = Math.min(x1, x2);
    const rightX = Math.max(x1, x2);
    const midX = (leftX + rightX) / 2;
    
    // Bracket shape facing down: } rotated
    ctx.moveTo(leftX, y + 5);
    ctx.lineTo(leftX, y + 12);
    ctx.lineTo(midX - 6, y + 12);
    ctx.lineTo(midX, y + 18);
    ctx.lineTo(midX + 6, y + 12);
    ctx.lineTo(rightX, y + 12);
    ctx.lineTo(rightX, y + 5);
    ctx.stroke();
    
    ctx.fillStyle = '#2b2b2b';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, midX, y + 23);
    ctx.restore();
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

    // Update table header colors to indicate fixed element
    const thX = document.getElementById('th-x-header');
    const thY = document.getElementById('th-y-header');
    if (thX && thY) {
        if (fixedElement === null) {
            thX.style.color = '';
            thY.style.color = '';
        } else if (fixedElement === 'X') {
            thX.style.color = '#0284c7';
            thY.style.color = '';
        } else if (fixedElement === 'Y') {
            thX.style.color = '';
            thY.style.color = '#0284c7';
        }
    }

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
        let c1Formula = '';
        let c2Formula = '';
        if (fixedElement === 'X') {
            c1Formula = `<span style="color: #0284c7; font-weight: bold;">X</span>Y`;
            c2Formula = `<span style="color: #0284c7; font-weight: bold;">X</span><sub>a</sub>Y<sub>b</sub>`;
        } else {
            c1Formula = `X<span style="color: #0284c7; font-weight: bold;">Y</span>`;
            c2Formula = `X<sub>a</sub><span style="color: #0284c7; font-weight: bold;">Y</span><sub>b</sub>`;
        }

        tableBody.innerHTML = `
            <tr style="color: var(--color-orange); font-weight: 500;">
                <td style="font-weight: bold;">第一個化合物 (${c1Formula})</td>
                <td>9.34</td>
                <td>2.00</td>
            </tr>
            <tr style="color: #7c3aed; font-weight: 500;">
                <td style="font-weight: bold;">第二個化合物 (${c2Formula})</td>
                <td>4.67</td>
                <td>3.00</td>
            </tr>
        `;

        let massOptions = '';
        if (fixedElement === 'X') {
            massOptions = `
                <button class="wizard-btn orange ${tempMass === 9.34 ? 'active' : ''}" onclick="selectTargetMass(9.34)">9.34 克</button>
                <button class="wizard-btn orange ${tempMass === 4.67 ? 'active' : ''}" onclick="selectTargetMass(4.67)">4.67 克</button>
            `;
        } else {
            massOptions = `
                <button class="wizard-btn purple ${tempMass === 6.00 ? 'active' : ''}" onclick="selectTargetMass(6.00)">6.00 克</button>
                <button class="wizard-btn purple ${tempMass === 3.00 ? 'active' : ''}" onclick="selectTargetMass(3.00)">3.00 克</button>
                <button class="wizard-btn purple ${tempMass === 2.00 ? 'active' : ''}" onclick="selectTargetMass(2.00)">2.00 克</button>
            `;
        }

        container.innerHTML = `
            <div class="step-card" style="border-color: var(--border-color);">
                <strong style="font-size: 0.95rem; color: #2b2b2b;">步驟 2：設定<span style="color: #0284c7; font-weight: bold;">固定</span>後的 <span style="color: #0284c7; font-weight: bold;">${fixedElement}</span> 元素目標質量</strong><br>
                <span style="color: var(--text-secondary); font-size: 0.85rem;">選擇您希望將 <span style="color: #0284c7; font-weight: bold;">${fixedElement}</span> 質量<span style="color: #0284c7; font-weight: bold;">固定</span>為多少克：</span>
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

        let c1FormulaLabel = '';
        let c2FormulaLabel = '';
        if (fixedElement === 'X') {
            c1FormulaLabel = `<span style="color: #0284c7; font-weight: bold;">X</span>Y`;
            c2FormulaLabel = `<span style="color: #0284c7; font-weight: bold;">X</span>Y<sub>b</sub>`;
        } else {
            c1FormulaLabel = `X<span style="color: #0284c7; font-weight: bold;">Y</span>`;
            c2FormulaLabel = `X<sub>a</sub><span style="color: #0284c7; font-weight: bold;">Y</span>`;
        }

        tableBody.innerHTML = `
            <tr style="color: var(--color-orange); font-weight: 500;">
                <td style="font-weight: bold;">第一個化合物 (${c1FormulaLabel})</td>
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
                    1. <strong>固定元素同質量</strong>：此時 <span style="color: #0284c7; font-weight: bold;">X</span> 的質量均<span style="color: #0284c7; font-weight: bold;">固定</span>為 <span style="font-weight: bold;">${selectedMass.toFixed(2)}g</span>。<br>
                    2. <strong>重量相同代表原子數目相同</strong>：此時兩個化合物中的 <span style="color: #0284c7; font-weight: bold;">X</span> 原子數目被視為<span style="color: #0284c7; font-weight: bold;">相同</span>（代表 1 個 <span style="color: #0284c7; font-weight: bold;">X</span> 原子），故化合物 II 可表示為 <strong><span style="color: #0284c7; font-weight: bold;">X</span>Y<sub>b</sub></strong>。<br>
                    3. <strong>觀察另一個元素的質量比</strong>：第一個化合物中 Y 的質量為 <span style="color: var(--color-orange); font-weight: bold;">${c1Y_scaled.toFixed(2)}g</span>，第二個化合物中 Y 的質量為 <span style="color: #7c3aed; font-weight: bold;">${c2Y_scaled.toFixed(2)}g</span>。<br>
                    4. <strong>求出原子個數比 (b值)</strong>：在 <span style="color: #0284c7; font-weight: bold;">X</span> 原子數<span style="color: #0284c7; font-weight: bold;">相同</span>時，Y 的原子個數比即為其質量比：
                    <div style="text-align: center; margin: 0.4rem 0; font-size: 1.1rem; font-weight: bold; font-family: var(--font-heading);">
                        Y 原子比 1 : b = <span style="color: var(--color-orange);">${c1Y_scaled.toFixed(2)}</span> : <span style="color: #7c3aed;">${c2Y_scaled.toFixed(2)}</span> = 1 : ${ratioY.toFixed(1)}
                    </div>
                </div>
            `;

            // Rule 6 check: Non-integer atom handling
            if (Math.abs(ratioY - 3.0) < 0.01) {
                deductionText += `
                    <div style="border-top: 1.5px dashed rgba(43,43,43,0.15); padding-top: 0.4rem; margin-top: 0.4rem;">
                        5. <strong>分析原子數目關係</strong>：因為兩者中的 <span style="color: #0284c7; font-weight: bold;">X</span> 質量相同，且第一個化合物已知為 <span style="color: #0284c7; font-weight: bold;">X</span>Y（含有 1 個 <span style="color: #0284c7; font-weight: bold;">X</span> 原子），故第二個化合物亦含有 1 個 <span style="color: #0284c7; font-weight: bold;">X</span> 原子。<br>
                        6. <strong>得出分子式</strong>：此時第二個化合物中的 Y 質量（${c2Y_scaled.toFixed(2)}g）是第一個化合物中 Y 質量（${c1Y_scaled.toFixed(2)}g）的 ${ratioY.toFixed(0)} 倍，表示其 Y 原子數為 ${ratioY.toFixed(0)} 個，故第二個化合物的分子式為 <strong style="color: #7c3aed;">XY₃</strong>。
                    </div>
                `;
            }
        } else {
            // Y is fixed
            const ratioX = c1X_scaled / c2X_scaled; // Compound 1 : Compound 2
            deductionText = `
                <strong style="font-size: 0.95rem; color: #2b2b2b;">步驟 3-6：代數比例推導結果</strong><br>
                <div style="margin-top: 0.4rem;">
                    1. <strong>固定元素同質量</strong>：此時 <span style="color: #0284c7; font-weight: bold;">Y</span> 的質量均<span style="color: #0284c7; font-weight: bold;">固定</span>為 <span style="font-weight: bold;">${selectedMass.toFixed(2)}g</span>。<br>
                    2. <strong>重量相同代表原子數目相同</strong>：此時兩個化合物中的 <span style="color: #0284c7; font-weight: bold;">Y</span> 原子數目視為<span style="color: #0284c7; font-weight: bold;">相同</span>，故化合物 II 可以表示為 <strong>X<sub>a</sub><span style="color: #0284c7; font-weight: bold;">Y</span></strong>（a 代表 X 相對於 1 個 <span style="color: #0284c7; font-weight: bold;">Y</span> 原子的比例）。<br>
                    3. <strong>觀察另一個元素 X 的質量比</strong>：第一個化合物中 X 的質量為 <span style="color: var(--color-orange); font-weight: bold;">${c1X_scaled.toFixed(2)}g</span>，第二個化合物中 X 的質量為 <span style="color: #7c3aed; font-weight: bold;">${c2X_scaled.toFixed(2)}g</span>。<br>
                    4. <strong>求出 X 的質量比</strong>：在<span style="color: #0284c7; font-weight: bold;">固定</span><span style="color: #0284c7; font-weight: bold;">相同</span> <span style="color: #0284c7; font-weight: bold;">Y</span> 質量下，第一個與第二個化合物的 X 質量比為：
                    <div style="text-align: center; margin: 0.4rem 0; font-size: 1.1rem; font-weight: bold; font-family: var(--font-heading);">
                        X 質量比 = <span style="color: var(--color-orange);">${c1X_scaled.toFixed(2)}</span> : <span style="color: #7c3aed;">${c2X_scaled.toFixed(2)}</span> = 3 : 1
                    </div>
                    5. <strong>推導暫時分子式</strong>：第一個化合物為 X<span style="color: #0284c7; font-weight: bold;">Y</span>（X 與 <span style="color: #0284c7; font-weight: bold;">Y</span> 的個數比為 1 : 1）。在<span style="color: #0284c7; font-weight: bold;">相同</span> <span style="color: #0284c7; font-weight: bold;">Y</span> 質量下，因為 X 的質量比為 3 : 1，所以第二個化合物中的 X 原子數只有第一個的 1/3 倍，此時分子式寫為 <strong>X<sub>1/3</sub><span style="color: #0284c7; font-weight: bold;">Y</span></strong>。<br>
                    <div style="border-top: 1.5px dashed rgba(43,43,43,0.15); padding-top: 0.4rem; margin-top: 0.4rem;">
                        6. <strong>化為整數比（符合原子說）</strong>：根據原子說，原子不能分割，個數必須為整數。我們將 <strong>X<sub>1/3</sub><span style="color: #0284c7; font-weight: bold;">Y</span><sub>1</sub></strong> 的下標同乘以 3，得到最簡整數比，故第二個化合物的分子式為 <strong style="color: #7c3aed;">XY₃</strong>。
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="step-card" style="border-color: var(--border-color);">
                ${deductionText}
                <div style="margin-top: 0.6rem; text-align: right; display: flex; justify-content: space-between;">
                    <button class="wizard-btn" onclick="resetWizard()" style="border-color: #ef4444; color: #ef4444; margin: 0;">重新計算</button>
                </div>
            </div>
        `;
    }

    // Sync geometric wizard container UI
    renderGeometricWizard();

    // Auto restart canvas animation on step transitions
    if (geometricActive && typeof startAnimation === 'function') {
        initCanvas();
        startAnimation();
    }
}

function renderGeometricWizard() {
    const container = document.getElementById('geom-wizard-container');
    if (!container) return;

    if (fixedElement === null) {
        // Step 1: Raw state, choose element to fix
        container.innerHTML = `
            <div class="step-card" style="border-color: var(--border-color);">
                <strong style="font-size: 0.95rem; color: #2b2b2b;">幾何步驟 1：顯示原始數據點與等比線</strong><br>
                <span style="color: var(--text-secondary); font-size: 0.85rem;">已繪製化合物 I (XY) 與 II (XaYb) 的比例斜率線。請選擇在圖表上固定哪一個元素的重量相同：</span>
                <div style="margin-top: 0.6rem;">
                    <button class="wizard-btn active" onclick="selectFixedElement('X')">固定 X 元素</button>
                    <button class="wizard-btn active" onclick="selectFixedElement('Y')" style="border-color: #7c3aed; color: #7c3aed; background: #ffffff;">固定 Y 元素</button>
                </div>
            </div>
        `;
    } else if (selectedMass === null) {
        // Step 2: Selecting mass/position
        let massOptions = '';
        if (fixedElement === 'X') {
            massOptions = `
                <button class="wizard-btn orange ${tempMass === 9.34 ? 'active' : ''}" onclick="selectTargetMass(9.34)">9.34 克</button>
                <button class="wizard-btn orange ${tempMass === 4.67 ? 'active' : ''}" onclick="selectTargetMass(4.67)">4.67 克</button>
            `;
        } else {
            massOptions = `
                <button class="wizard-btn purple ${tempMass === 6.00 ? 'active' : ''}" onclick="selectTargetMass(6.00)">6.00 克</button>
                <button class="wizard-btn purple ${tempMass === 3.00 ? 'active' : ''}" onclick="selectTargetMass(3.00)">3.00 克</button>
                <button class="wizard-btn purple ${tempMass === 2.00 ? 'active' : ''}" onclick="selectTargetMass(2.00)">2.00 克</button>
            `;
        }

        container.innerHTML = `
            <div class="step-card" style="border-color: var(--border-color);">
                <strong style="font-size: 0.95rem; color: #2b2b2b;">幾何步驟 2：繪製同質量藍色虛線</strong><br>
                <span style="color: var(--text-secondary); font-size: 0.85rem;">選擇將 <span style="color: #0284c7; font-weight: bold;">固定</span> 的 <span style="color: #0284c7; font-weight: bold;">${fixedElement}</span> 軸藍色虛線設定在多少克：</span>
                <div style="margin-top: 0.6rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0.2rem;">
                    ${massOptions}
                </div>
                <div style="margin-top: 0.8rem; display: flex; justify-content: space-between;">
                    <button class="wizard-btn" onclick="resetWizard()" style="border-color: #ef4444; color: #ef4444; margin: 0;">返回步驟 1</button>
                    <button class="wizard-btn active" onclick="confirmCalculation()" style="background: var(--border-color); color: #ffffff; margin: 0;">確認進行推導 &rArr;</button>
                </div>
            </div>
        `;
    } else {
        // Step 3: Confirmed / Deduction
        const factor1 = (fixedElement === 'X') ? selectedMass / 9.34 : selectedMass / 2.00;
        const factor2 = (fixedElement === 'X') ? selectedMass / 4.67 : selectedMass / 3.00;
        const c1Val = (fixedElement === 'X') ? 2.00 * factor1 : 9.34 * factor1;
        const c2Val = (fixedElement === 'X') ? 3.00 * factor2 : 4.67 * factor2;
        const ratio = c2Val / c1Val;

        let ratioText = '';
        if (fixedElement === 'X') {
            ratioText = `Y 質量比 = ${c1Val.toFixed(2)} : ${c2Val.toFixed(2)} = 1 : ${ratio.toFixed(0)}`;
        } else {
            const invRatio = c1Val / c2Val;
            ratioText = `X 質量比 = ${c1Val.toFixed(2)} : ${c2Val.toFixed(2)} = ${invRatio.toFixed(0)} : 1`;
        }

        container.innerHTML = `
            <div class="step-card" style="border-color: var(--border-color);">
                <strong style="font-size: 0.95rem; color: #2b2b2b;">幾何步驟 3：繪製比例括號與得出分子式</strong><br>
                <span style="color: var(--text-secondary); font-size: 0.85rem;">已在藍色虛線上繪製比較括號並得出比例（${ratioText}），這時化合物另一個元素的係數對應改變，化合物 II 分子式即為 <strong style="color: #7c3aed;">XY₃</strong>。</span>
                <div style="margin-top: 0.8rem; text-align: right;">
                    <button class="wizard-btn" onclick="resetWizard()" style="border-color: #ef4444; color: #ef4444; margin: 0;">重新開始</button>
                </div>
            </div>
        `;
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    renderAlgebraicWizard();
});

