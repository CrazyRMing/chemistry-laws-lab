// Canvas & UI Setup
const flaskCanvas = document.getElementById('flaskCanvas');
const graphCanvas = document.getElementById('graphCanvas');
const ctxF = flaskCanvas.getContext('2d');
const ctxG = graphCanvas.getContext('2d');

// Preload generated sketchy asset images
const imgTitration = new Image();
imgTitration.src = 'assets/titration.png';

const imgCombustion = new Image();
imgCombustion.src = 'assets/combustion.png';

const imgHeating = new Image();
imgHeating.src = 'assets/heating.png';

// State Variables
let currentStep = 1;
let animProgress = 0; // Current step animation progress [0, 1]
const totalSteps = 7;

// Random Water Composition Values (Ratio is strictly 1 : 8)
let wH1, wO1, wH2, wO2, wH3, wO3;

function generateRandomValues() {
    wH1 = (1.0 + Math.random() * 0.8).toFixed(2); // 1.0 ~ 1.8
    wO1 = (wH1 * 8).toFixed(2);
    
    wH2 = (2.2 + Math.random() * 1.0).toFixed(2); // 2.2 ~ 3.2
    wO2 = (wH2 * 8).toFixed(2);
    
    wH3 = (0.4 + Math.random() * 0.5).toFixed(2); // 0.4 ~ 0.9
    wO3 = (wH3 * 8).toFixed(2);
}

// Math Easing Functions
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// -------------------------------------------------------------
// Seeded Random for Steady (Non-jittering) Hand-Drawn Lines
// -------------------------------------------------------------
let rndSeed = 1;
function setRndSeed(s) {
    rndSeed = s;
}
function seededRandom() {
    const x = Math.sin(rndSeed++) * 10000;
    return x - Math.floor(x);
}

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

// Coordinate Helpers for Graph Canvas (x: 0 ~ 4.0, y: 0 ~ 32.0)
const margin = 60;
function mapX(xVal, width) {
    return margin + (xVal / 4.0) * (width - 2 * margin);
}
function mapY(yVal, height) {
    return height - margin - (yVal / 32.0) * (height - 2 * margin);
}

// Step descriptions (Traditional Chinese)
const stepTexts = [
    {
        title: "第一步：建立質量關係座標系",
        desc: "以水 (H₂O) 為例。我們繪製一個座標圖，以氧的質量 wO 為 Y 軸，以氫的質量 wH 為 X 軸，用來探討水分子的組成比例。"
    },
    {
        title: "第二步：酸鹼中和產生的水",
        desc: "進行酸鹼中和實驗，收集生成的水滴進行分析，測得其氫氧質量。此時在座標圖上點下第 1 點。數據點的對應名稱請見圖例。"
    },
    {
        title: "第三步：氫氣燃燒產生的水",
        desc: "點燃氫氣與氧氣，收集燃燒產生的水滴進行分析。此時在座標圖上點下第 2 點。因燃燒反應較激烈，此次生成的水滴質量較多。"
    },
    {
        title: "第四步：加熱小蘇打產生的水",
        desc: "將小蘇打固體放入試管加熱，收集管口冷凝出來的水滴進行分析。此時在座標圖上點下第 3 點。此次收集到的水滴質量較少。"
    },
    {
        title: "第五步：觀察不同的水源",
        desc: "引導觀察：注意看這三個來自完全不同化學反應產生的水，雖然每次反應得到的質量多寡不同，但它們在圖上呈現什麼關係？"
    },
    {
        title: "第六步：普魯斯特的重大發現",
        desc: "法國化學家普魯斯特發現，同一種化合物，不論其來源或製備方法為何，其組成元素的質量比（即座標圖上的斜率）恆為定值。"
    },
    {
        title: "第七步：定比定律 (Law of Definite Proportions)",
        desc: "化合物中，各組成元素間的質量比恆為定值。這就是定比定律！以水為例，不論來源，氧與氫的質量比永遠是固定的 8 : 1。"
    }
];

// Switch to Next/Previous steps
function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        animProgress = 0;
        updateUI();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        animProgress = 0;
        updateUI();
    }
}

function updateUI() {
    // Enable/disable buttons
    document.getElementById('btn-back').disabled = (currentStep === 1);
    document.getElementById('btn-next').disabled = (currentStep === totalSteps);
    
    if (currentStep === totalSteps) {
        document.getElementById('btn-next').textContent = "探索完成";
    } else {
        document.getElementById('btn-next').textContent = "下一步";
    }
    
    // Step indicator text
    document.getElementById('step-indicator').textContent = `步驟 ${currentStep} / ${totalSteps}`;
    
    // Update texts
    document.getElementById('step-title').textContent = stepTexts[currentStep - 1].title;
    document.getElementById('step-desc').textContent = stepTexts[currentStep - 1].desc;
    
    // Update Mass Board visibility
    const massBoard = document.getElementById('mass-board');
    massBoard.classList.toggle('hidden', currentStep < 2);
    
    // Set values on indicators
    document.getElementById('board-h1').textContent = wH1;
    document.getElementById('board-o1').textContent = wO1;
    document.getElementById('board-h2').textContent = wH2;
    document.getElementById('board-o2').textContent = wO2;
    document.getElementById('board-h3').textContent = wH3;
    document.getElementById('board-o3').textContent = wO3;
    
    // Fade inactive board items
    document.getElementById('board-h1').parentElement.style.opacity = currentStep >= 2 ? 1 : 0.2;
    document.getElementById('board-h2').parentElement.style.opacity = currentStep >= 3 ? 1 : 0.2;
    document.getElementById('board-h3').parentElement.style.opacity = currentStep >= 4 ? 1 : 0.2;
    
    // Toggle active state of HTML legend items
    document.getElementById('legend-item-1').classList.toggle('visible', currentStep >= 2);
    document.getElementById('legend-item-2').classList.toggle('visible', currentStep >= 3);
    document.getElementById('legend-item-3').classList.toggle('visible', currentStep >= 4);
    document.getElementById('legend-item-4').classList.toggle('visible', currentStep >= 5);
}

// Resize and Setup Canvases
function resizeCanvases() {
    const wrapperL = flaskCanvas.parentElement;
    flaskCanvas.width = wrapperL.clientWidth;
    flaskCanvas.height = wrapperL.clientHeight;

    const wrapperR = graphCanvas.parentElement;
    graphCanvas.width = wrapperR.clientWidth;
    graphCanvas.height = wrapperR.clientHeight;
}

// Main Animation Loop
function drawLoop() {
    if (animProgress < 1.0) {
        animProgress += 0.012; // Easing speed
        if (animProgress > 1.0) animProgress = 1.0;
    }
    
    renderFlaskPanel();
    renderGraphPanel();
    
    requestAnimationFrame(drawLoop);
}

// 1. LEFT PANEL: Static Apparatus Drawing + Smooth Droplet Emission
function renderFlaskPanel() {
    const w = flaskCanvas.width;
    const h = flaskCanvas.height;
    ctxF.clearRect(0, 0, w, h);
    
    // Background filling - solid white to blend with sketchy images
    ctxF.fillStyle = '#ffffff';
    ctxF.fillRect(0, 0, w, h);
    
    ctxF.save();
    
    if (currentStep === 1) {
        // Step 1: Blank canvas with introductory title
        ctxF.fillStyle = '#5f5f5f';
        ctxF.font = 'italic 1.2rem "EB Garamond", serif';
        ctxF.textAlign = 'center';
        ctxF.fillText('定比定律實驗演示', w / 2, h / 2 - 20);
        ctxF.fillText('在此收集並分析不同來源的水滴', w / 2, h / 2 + 15);
    } 
    else if (currentStep === 2) {
        // Step 2: Acid-base Titration
        const imgSize = Math.min(w, h) * 0.85;
        const imgX = (w - imgSize) / 2;
        const imgY = (h - imgSize) / 2;
        ctxF.drawImage(imgTitration, imgX, imgY, imgSize, imgSize);
        
        // Droplet flies out
        const p = animProgress;
        if (p > 0.1 && p < 0.7) {
            const t = (p - 0.1) / 0.6; // normalized droplet time
            const easeT = easeInOutCubic(t);
            // Droplet trajectory: from conical flask mouth to right edge
            const startX = imgX + imgSize * 0.48;
            const startY = imgY + imgSize * 0.72;
            const endX = w - 15;
            const endY = h / 2;
            
            // Quadratic Bezier path for water drop fly-out
            const dropX = startX + (endX - startX) * easeT;
            const dropY = startY + (endY - startY) * easeT - Math.sin(easeT * Math.PI) * 40;
            
            drawWaterDrop(ctxF, dropX, dropY, 12);
        }
    } 
    else if (currentStep === 3) {
        // Step 3: Combustion Setup
        const imgSize = Math.min(w, h) * 0.85;
        const imgX = (w - imgSize) / 2;
        const imgY = (h - imgSize) / 2;
        ctxF.drawImage(imgCombustion, imgX, imgY, imgSize, imgSize);
        
        const p = animProgress;
        if (p > 0.1 && p < 0.7) {
            const t = (p - 0.1) / 0.6;
            const easeT = easeInOutCubic(t);
            const startX = imgX + imgSize * 0.52;
            const startY = imgY + imgSize * 0.44;
            const endX = w - 15;
            const endY = h / 2;
            
            const dropX = startX + (endX - startX) * easeT;
            const dropY = startY + (endY - startY) * easeT - Math.sin(easeT * Math.PI) * 50;
            
            drawWaterDrop(ctxF, dropX, dropY, 14);
        }
    } 
    else if (currentStep === 4) {
        // Step 4: Baking Soda Heating Setup
        const imgSize = Math.min(w, h) * 0.85;
        const imgX = (w - imgSize) / 2;
        const imgY = (h - imgSize) / 2;
        ctxF.drawImage(imgHeating, imgX, imgY, imgSize, imgSize);
        
        const p = animProgress;
        if (p > 0.1 && p < 0.7) {
            const t = (p - 0.1) / 0.6;
            const easeT = easeInOutCubic(t);
            const startX = imgX + imgSize * 0.72;
            const startY = imgY + imgSize * 0.46;
            const endX = w - 15;
            const endY = h / 2;
            
            const dropX = startX + (endX - startX) * easeT;
            const dropY = startY + (endY - startY) * easeT - Math.sin(easeT * Math.PI) * 30;
            
            drawWaterDrop(ctxF, dropX, dropY, 10);
        }
    } 
    else if (currentStep >= 5) {
        // Step 5, 6, 7: Show three beakers of water side-by-side (Identical composition)
        const gap = w / 4;
        const cy = h / 2 + 20;
        
        ctxF.fillStyle = '#1f1f1f';
        ctxF.font = 'bold 1.2rem sans-serif';
        ctxF.textAlign = 'center';
        ctxF.fillText('分析三種來源的水滴', w / 2, h / 2 - 90);
        
        // Render 3 Beakers
        drawStaticBeaker(ctxF, gap, cy, 35, 55, '酸鹼中和水', '#e76f51', 110);
        drawStaticBeaker(ctxF, gap * 2, cy, 35, 55, '氫氣燃燒水', '#2a9d8f', 120);
        drawStaticBeaker(ctxF, gap * 3, cy, 35, 55, '小蘇打分解水', '#b58900', 130);
        
        ctxF.fillStyle = '#5f5f5f';
        ctxF.font = 'italic 1.1rem "EB Garamond", serif';
        ctxF.fillText('實驗分析顯示：它們在化學性質上完全一樣，', w / 2, h / 2 + 95);
        ctxF.fillText('不論來源為何，皆為相同物質「水 (H₂O)」。', w / 2, h / 2 + 120);
    }
    
    ctxF.restore();
}

// 2. RIGHT PANEL: 3B1B Style Math Graph (Traditional Chinese)
function renderGraphPanel() {
    const w = graphCanvas.width;
    const h = graphCanvas.height;
    ctxG.clearRect(0, 0, w, h);
    
    // Paper bg
    ctxG.fillStyle = '#faf8f5';
    ctxG.fillRect(0, 0, w, h);
    
    // Draw Axis System
    drawGraphAxes(w, h);
    
    // Step 2: Plot Point 1
    if (currentStep >= 2) {
        let t = 1;
        if (currentStep === 2) {
            // Plot only after droplet reaches the edge (at progress 0.7)
            t = animProgress < 0.7 ? 0 : easeOutElastic((animProgress - 0.7) / 0.3);
        }
        const px = mapX(wH1, w);
        const py = mapY(wO1, h);
        drawPlotPoint(px, py, 7 * t, '#e76f51');
    }
    
    // Step 3: Plot Point 2
    if (currentStep >= 3) {
        let t = 1;
        if (currentStep === 3) {
            t = animProgress < 0.7 ? 0 : easeOutElastic((animProgress - 0.7) / 0.3);
        }
        const px = mapX(wH2, w);
        const py = mapY(wO2, h);
        drawPlotPoint(px, py, 7 * t, '#2a9d8f');
    }
    
    // Step 4: Plot Point 3
    if (currentStep >= 4) {
        let t = 1;
        if (currentStep === 4) {
            t = animProgress < 0.7 ? 0 : easeOutElastic((animProgress - 0.7) / 0.3);
        }
        const px = mapX(wH3, w);
        const py = mapY(wO3, h);
        drawPlotPoint(px, py, 7 * t, '#b58900');
    }
    
    // Step 5: Draw Trendline
    if (currentStep >= 5) {
        const t = (currentStep === 5) ? easeInOutCubic(animProgress) : 1;
        const startX = mapX(0, w);
        const startY = mapY(0, h);
        const endX = mapX(3.8, w);
        const endY = mapY(3.8 * 8.0, h);
        
        const currentX = startX + (endX - startX) * t;
        const currentY = startY + (endY - startY) * t;
        
        drawWobblyLine(ctxG, startX, startY, currentX, currentY, 'rgba(29, 53, 87, 0.45)', 4, 300);
    }
    
    // Step 6 & 7: Draw Slope Triangle
    if (currentStep >= 6) {
        const t = (currentStep === 6) ? easeInOutCubic(animProgress) : 1;
        const xVal = 2.0;
        const yVal = xVal * 8.0;
        
        const cx = mapX(xVal, w);
        const cy = mapY(yVal, h);
        const rx = mapX(xVal + 0.8, w);
        const ry = mapY(yVal + 0.8 * 8.0, h);
        
        ctxG.save();
        ctxG.globalAlpha = t;
        
        // Horizontal delta wH
        drawWobblyLine(ctxG, cx, cy, rx, cy, '#5f5f5f', 1.5, 400);
        // Vertical delta wO
        drawWobblyLine(ctxG, rx, cy, rx, ry, '#5f5f5f', 1.5, 500);
        
        ctxG.fillStyle = '#2b2b2b';
        ctxG.font = 'bold 0.9rem sans-serif';
        ctxG.textAlign = 'center';
        ctxG.fillText('ΔwH', (cx + rx) / 2, cy + 18);
        ctxG.fillText('ΔwO', rx + 22, (cy + ry) / 2);
        
        // Slope calculation formula - placed in top-right clear area
        ctxG.font = 'bold 1.15rem "EB Garamond", serif';
        ctxG.fillStyle = '#b58900';
        ctxG.textAlign = 'right';
        ctxG.fillText('斜率 (質量比) = ΔwO / ΔwH = 8.0', w - margin - 10, margin + 30);
        
        ctxG.restore();
    }
}

// -------------------------------------------------------------
// UI Drawer Components
// -------------------------------------------------------------
function drawGraphAxes(w, h) {
    // Draw wobbly coordinates grid (clean and steady)
    for (let x = 0.5; x <= 4.0; x += 0.5) {
        const px = mapX(x, w);
        drawWobblyLine(ctxG, px, margin, px, h - margin, 'rgba(43, 43, 43, 0.04)', 1, x * 100);
    }
    for (let y = 4; y <= 32; y += 4) {
        const py = mapY(y, h);
        drawWobblyLine(ctxG, margin, py, w - margin, py, 'rgba(43, 43, 43, 0.04)', 1, y * 200);
    }

    const originX = mapX(0, w);
    const originY = mapY(0, h);
    
    // wH axis
    drawWobblyLine(ctxG, originX, originY, w - margin + 20, originY, '#2b2b2b', 2.5, 10);
    // wO axis
    drawWobblyLine(ctxG, originX, originY, originX, margin - 20, '#2b2b2b', 2.5, 20);
    
    // Arrow for X axis
    drawWobblyLine(ctxG, w - margin + 20, originY, w - margin + 12, originY - 6, '#2b2b2b', 2, 11);
    drawWobblyLine(ctxG, w - margin + 20, originY, w - margin + 12, originY + 6, '#2b2b2b', 2, 12);
    
    // Arrow for Y axis
    drawWobblyLine(ctxG, originX, margin - 20, originX - 6, margin - 12, '#2b2b2b', 2, 21);
    drawWobblyLine(ctxG, originX, margin - 20, originX + 6, margin - 12, '#2b2b2b', 2, 22);

    ctxG.fillStyle = '#2b2b2b';
    ctxG.font = 'bold italic 1.15rem "EB Garamond", serif';
    
    // Labels - shift wO to the right to avoid cut-off at the left edge
    ctxG.textAlign = 'center';
    ctxG.fillText('氫的質量 wH (g)', w - margin - 50, originY + 40);
    
    ctxG.textAlign = 'left';
    ctxG.fillText('氧的質量 wO (g)', originX + 15, margin - 20);
    
    // Ticks wH
    ctxG.textAlign = 'center';
    for (let x = 1.0; x <= 4.0; x += 1.0) {
        const px = mapX(x, w);
        drawWobblyLine(ctxG, px, originY - 4, px, originY + 4, '#2b2b2b', 1.5, x * 77);
        ctxG.fillText(x.toFixed(1), px, originY + 22);
    }
    
    // Ticks wO
    ctxG.textAlign = 'right';
    for (let y = 8; y <= 32; y += 8) {
        const py = mapY(y, h);
        drawWobblyLine(ctxG, originX - 4, py, originX + 4, '#2b2b2b', 1.5, y * 88);
        ctxG.fillText(y.toString(), originX - 12, py + 5);
    }
    
    ctxG.fillText('0', originX - 12, originY + 18);
} = 'bold 0.9rem sans-serif';
    
    // 1. Acid-Base water item
    drawWobblyCircle(ctxG, lx + 20, ly + 22, 5, '#e76f51', true, 1, 611);
    ctxG.fillStyle = '#1f1f1f';
    ctxG.fillText('🔴 酸鹼中和生成水', lx + 36, ly + 22);
    
    // 2. Combustion item (if unlocked)
    if (currentStep >= 3) {
        drawWobblyCircle(ctxG, lx + 20, ly + 47, 5, '#2a9d8f', true, 1, 612);
        ctxG.fillStyle = '#1f1f1f';
        ctxG.fillText('🟢 氫氣燃燒生成水', lx + 36, ly + 47);
    }
    
    // 3. Baking soda heating item (if unlocked)
    if (currentStep >= 4) {
        drawWobblyCircle(ctxG, lx + 20, ly + 72, 5, '#b58900', true, 1, 613);
        ctxG.fillStyle = '#1f1f1f';
        ctxG.fillText('🟡 小蘇打分解水', lx + 36, ly + 72);
    }
    
    // 4. Slope trendline item (if unlocked)
    if (currentStep >= 5) {
        ctxG.strokeStyle = 'rgba(29, 53, 87, 0.7)';
        ctxG.lineWidth = 3;
        ctxG.beginPath();
        ctxG.moveTo(lx + 10, ly + 97);
        ctxG.lineTo(lx + 30, ly + 97);
        ctxG.stroke();
        ctxG.fillStyle = 'var(--color-royal)';
        ctxG.fillText('🔵 定比線 wO = 8 × wH', lx + 36, ly + 97);
    }
}

function drawPlotPoint(x, y, radius, color) {
    if (radius <= 0) return;
    // Draw point circle cleanly
    drawWobblyCircle(ctxG, x, y, radius + 2, '#2b2b2b', false, 1.5, x + y);
    drawWobblyCircle(ctxG, x, y, radius, color, true, 1, x - y);
}

// -------------------------------------------------------------
// High-Quality Static Chemical Apparatus Illustrations
// -------------------------------------------------------------

function drawStaticBeaker(ctx, cx, cy, r, height, label, color, seed) {
    // Draw beaker lines
    ctx.beginPath();
    ctx.moveTo(cx - r, cy - height);
    ctx.lineTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx + r, cy - height);
    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // Beaker lips
    drawWobblyLine(ctx, cx - r - 4, cy - height, cx - r, cy - height, '#2b2b2b', 2.5, seed + 1);
    drawWobblyLine(ctx, cx + r, cy - height, cx + r + 2, cy - height, '#2b2b2b', 2.5, seed + 2);
    
    // Liquid inside beaker (flat steady render)
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.fillRect(cx - r + 3, cy - height * 0.5, r * 2 - 6, height * 0.5 - 3);
    
    // Label text
    ctx.fillStyle = '#1f1f1f';
    ctx.font = 'bold 0.85rem sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + 20);
    
    // Floating water droplet
    drawWaterDrop(ctx, cx, cy - height - 20, 10);
}

function drawWaterDrop(ctx, x, y, r) {
    ctx.save();
    ctx.fillStyle = '#38bdf8'; // water blue
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
    
    // Path for water drop teardrop shape
    ctx.beginPath();
    ctx.moveTo(x, y - r * 1.2);
    ctx.quadraticCurveTo(x + r * 0.8, y - r * 0.2, x + r * 0.8, y + r * 0.3);
    ctx.arc(x, y + r * 0.3, r * 0.8, 0, Math.PI);
    ctx.quadraticCurveTo(x - r * 0.8, y - r * 0.2, x, y - r * 1.2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
window.onload = () => {
    generateRandomValues();
    resizeCanvases();
    updateUI();
    drawLoop();
};

window.onresize = () => {
    resizeCanvases();
};
