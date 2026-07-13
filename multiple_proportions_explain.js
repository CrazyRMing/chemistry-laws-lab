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
