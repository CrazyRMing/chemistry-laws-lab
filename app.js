// Canvas & UI Setup
const flaskCanvas = document.getElementById('flaskCanvas');
const graphCanvas = document.getElementById('graphCanvas');
const ctxF = flaskCanvas.getContext('2d');
const ctxG = graphCanvas.getContext('2d');

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

// Custom Hand-Drawn Sketch Drawing Helpers
function drawWobblyLine(ctx, x1, y1, x2, y2, color = '#2b2b2b', width = 2) {
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
                const jitter = (Math.random() - 0.5) * 0.8;
                px += nx * jitter;
                py += ny * jitter;
            }
            ctx.lineTo(px, py);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = width + (Math.random() - 0.5) * 0.3;
        ctx.stroke();
    }
}

function drawWobblyCircle(ctx, cx, cy, r, color = '#2b2b2b', fill = false, width = 2) {
    const segments = 24;
    
    for (let drawCount = 0; drawCount < (fill ? 1 : 2); drawCount++) {
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const jitter = (Math.random() - 0.5) * 0.6;
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

// Step descriptions
const stepTexts = [
    {
        title: "第一步：建立質量關係坐標系",
        desc: "以水 (H₂O) 為例。我們繪製一個坐標圖，以氧的質量 wO 為 Y 軸，以氫的質量 wH 為 X 軸，用來探討水分子的組成比例。"
    },
    {
        title: "第二步：酸鹼中和產生的水",
        desc: "進行酸鹼中和實驗，取生成的純水分析其質量。在圖表上標記第 1 點。不論做幾次，我們得到的數據總會落在特定比例..."
    },
    {
        title: "第三步：氫氣燃燒產生的水",
        desc: "點燃氫氣與氧氣，收集燃燒產生的水滴。在圖表上標記第 2 點。由於氫氣燃燒較旺盛，這次反應生成的水量較多。"
    },
    {
        title: "第四步：加熱小蘇打產生的水",
        desc: "將小蘇打固體放入試管加熱，收集管口凝結出的水滴。在圖表上標記第 3 點。這次反應產生的水量雖然較少..."
    },
    {
        title: "第五步：神奇的趨勢線",
        desc: "引導觀察：注意看這三個來自完全不同化學反應的點，不論生成水量多寡，它們似乎都完美地位在同一條通過原點的直線上！"
    },
    {
        title: "第六步：普魯斯特的重大發現",
        desc: "法國化學家普魯斯特發現，同一種化合物，不論其來源與製法為何，其組成元素的質量比（即直線的斜率）恆為定值（斜率為 8.0）。"
    },
    {
        title: "第七步：定比定律 (Law of Definite Proportions)",
        desc: "化合物中，各組成元素間的質量比恆為定值。這就是定比定律！例如水分子中氧與氫的質量比永遠是固定的 8 : 1。"
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
    
    // Change next button to Finish style if last step
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
    
    // Set random values on step indicators
    document.getElementById('board-h1').textContent = wH1;
    document.getElementById('board-o1').textContent = wO1;
    document.getElementById('board-h2').textContent = wH2;
    document.getElementById('board-o2').textContent = wO2;
    document.getElementById('board-h3').textContent = wH3;
    document.getElementById('board-o3').textContent = wO3;
    
    // Apply styling matching the step
    document.getElementById('board-h1').parentElement.style.opacity = currentStep >= 2 ? 1 : 0.2;
    document.getElementById('board-h2').parentElement.style.opacity = currentStep >= 3 ? 1 : 0.2;
    document.getElementById('board-h3').parentElement.style.opacity = currentStep >= 4 ? 1 : 0.2;
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

// -------------------------------------------------------------
// Drawing loop
// -------------------------------------------------------------
function drawLoop() {
    // Increment step animation progress
    if (animProgress < 1.0) {
        animProgress += 0.015;
        if (animProgress > 1.0) animProgress = 1.0;
    }
    
    // Render canvases
    renderFlaskPanel();
    renderGraphPanel();
    
    requestAnimationFrame(drawLoop);
}

// 1. LEFT PANEL: Chemical Reaction Sketches
function renderFlaskPanel() {
    const w = flaskCanvas.width;
    const h = flaskCanvas.height;
    ctxF.clearRect(0, 0, w, h);
    
    // Draw subtle paper/grid background on left
    ctxF.fillStyle = '#faf8f5';
    ctxF.fillRect(0, 0, w, h);
    
    ctxF.save();
    
    if (currentStep === 1) {
        // Step 1: Draw clean beaker flask silhouette placeholder
        ctxF.globalAlpha = 0.3;
        drawFlaskFlask(w / 2, h / 2 + 20, 70, 110);
        ctxF.globalAlpha = 1.0;
        
        ctxF.fillStyle = '#5f5f5f';
        ctxF.font = 'italic 1.15rem "EB Garamond", serif';
        ctxF.textAlign = 'center';
        ctxF.fillText('定比定律虛擬演練', w / 2, h / 2 - 40);
        ctxF.fillText('將在此動態演示各實驗反應', w / 2, h / 2);
    } 
    else if (currentStep === 2) {
        // Step 2: Acid-base Titration
        const progress = animProgress;
        
        // Draw Burette (滴定管) on top
        drawBurette(w / 2, 40, 120);
        
        // Draw Beaker (燒杯) on bottom
        drawBeaker(w / 2, h - 90, 60, 80);
        
        // Draw acid drop animation
        if (progress < 0.6) {
            const dropY = 160 + (progress / 0.6) * (h - 250);
            drawWobblyCircle(ctxF, w / 2, dropY, 4, '#e76f51', true);
        } else {
            // Liquid inside beaker fills slightly
            ctxF.fillStyle = 'rgba(231, 111, 81, 0.15)';
            ctxF.fillRect(w / 2 - 50, h - 130, 100, 40);
            
            // Generate a water droplet molecule floating to the right
            const outProgress = (progress - 0.6) / 0.4;
            const dropX = w / 2 + outProgress * (w / 2 - 60);
            const dropY = h - 110 - outProgress * 60;
            if (outProgress > 0) {
                drawWaterMolecule(dropX, dropY, 14, '#e76f51');
                ctxF.fillStyle = '#1f1f1f';
                ctxF.font = 'bold 0.9rem sans-serif';
                ctxF.fillText(`水滴 (酸鹼中和)`, dropX, dropY - 22);
            }
        }
    } 
    else if (currentStep === 3) {
        // Step 3: Combustion
        const progress = animProgress;
        
        // Draw Alcohol Burner (酒精燈) & Dish (燃燒皿)
        drawBurner(w / 2 - 40, h - 90, progress);
        
        // Draw collecting funnel/condenser (冷凝漏斗)
        drawCondenser(w / 2 + 20, 60, 100);
        
        // Draw water droplets condensing and traveling
        if (progress > 0.4) {
            const outProgress = (progress - 0.4) / 0.6;
            const dropX = w / 2 + 20 + outProgress * (w / 2 - 80);
            const dropY = 140 + outProgress * 50;
            drawWaterMolecule(dropX, dropY, 16, '#2a9d8f');
            ctxF.fillStyle = '#1f1f1f';
            ctxF.font = 'bold 0.9rem sans-serif';
            ctxF.fillText(`水滴 (燃燒反應)`, dropX, dropY - 22);
        }
    } 
    else if (currentStep === 4) {
        // Step 4: Heating baking soda
        const progress = animProgress;
        
        // Draw Horizontal Test Tube (試管) being heated
        drawHorizontalTube(w / 2 - 40, h / 2 - 20, 120, 24);
        drawBurner(w / 2 - 60, h - 90, progress);
        
        // Water drop dripping out of test tube mouth
        if (progress > 0.5) {
            const outProgress = (progress - 0.5) / 0.5;
            const dropX = w / 2 + 80 + outProgress * 60;
            const dropY = h / 2 - 10 + outProgress * 80;
            drawWaterMolecule(dropX, dropY, 12, '#b58900');
            ctxF.fillStyle = '#1f1f1f';
            ctxF.font = 'bold 0.9rem sans-serif';
            ctxF.fillText(`水滴 (加熱小蘇打)`, dropX, dropY - 22);
        }
    } 
    else if (currentStep >= 5) {
        // Show Water molecule representation
        const size = 35;
        const cx = w / 2;
        const cy = h / 2;
        
        ctxF.fillStyle = '#1f1f1f';
        ctxF.font = 'bold 1.25rem sans-serif';
        ctxF.textAlign = 'center';
        ctxF.fillText('水分子的組成結構', cx, cy - 80);
        
        // Draw bonds
        ctxF.strokeStyle = '#2b2b2b';
        ctxF.lineWidth = 6;
        ctxF.beginPath();
        ctxF.moveTo(cx, cy);
        ctxF.lineTo(cx - 50, cy + 50);
        ctxF.moveTo(cx, cy);
        ctxF.lineTo(cx + 50, cy + 50);
        ctxF.stroke();
        
        // Center Oxygen atom (Red)
        drawWobblyCircle(ctxF, cx, cy, size, '#e76f51', true);
        ctxF.fillStyle = '#ffffff';
        ctxF.font = 'bold 1.5rem Outfit, sans-serif';
        ctxF.fillText('O', cx, cy + 2);
        
        // Hydrogen atom 1 (Blue)
        drawWobblyCircle(ctxF, cx - 50, cy + 50, size * 0.6, '#38bdf8', true);
        ctxF.fillStyle = '#0f172a';
        ctxF.font = 'bold 1.1rem Outfit, sans-serif';
        ctxF.fillText('H', cx - 50, cy + 52);
        
        // Hydrogen atom 2 (Blue)
        drawWobblyCircle(ctxF, cx + 50, cy + 50, size * 0.6, '#38bdf8', true);
        ctxF.fillStyle = '#0f172a';
        ctxF.font = 'bold 1.1rem Outfit, sans-serif';
        ctxF.fillText('H', cx + 50, cy + 52);
        
        ctxF.fillStyle = '#5f5f5f';
        ctxF.font = 'italic 1.1rem "EB Garamond", serif';
        ctxF.fillText('H : O 原子個數比 = 2 : 1', cx, cy + 110);
        ctxF.fillText('H : O 質量組成比 = 2g : 16g = 1 : 8', cx, cy + 135);
    }
    
    ctxF.restore();
}

// 2. RIGHT PANEL: 3B1B Style Math Graph
function renderGraphPanel() {
    const w = graphCanvas.width;
    const h = graphCanvas.height;
    ctxG.clearRect(0, 0, w, h);
    
    // Paper background
    ctxG.fillStyle = '#faf8f5';
    ctxG.fillRect(0, 0, w, h);
    
    // Draw Axis System
    drawGraphAxes(w, h);
    
    // Step 2: Plot Point 1 (Acid-base)
    if (currentStep >= 2) {
        const t = (currentStep === 2) ? easeOutElastic(animProgress) : 1;
        const px = mapX(wH1, w);
        const py = mapY(wO1, h);
        drawPlotPoint(px, py, 7 * t, '#e76f51', `酸鹼中和 (${wH1}, ${wO1})`);
    }
    
    // Step 3: Plot Point 2 (Combustion)
    if (currentStep >= 3) {
        const t = (currentStep === 3) ? easeOutElastic(animProgress) : 1;
        const px = mapX(wH2, w);
        const py = mapY(wO2, h);
        drawPlotPoint(px, py, 7 * t, '#2a9d8f', `燃燒反應 (${wH2}, ${wO2})`);
    }
    
    // Step 4: Plot Point 3 (Baking soda)
    if (currentStep >= 4) {
        const t = (currentStep === 4) ? easeOutElastic(animProgress) : 1;
        const px = mapX(wH3, w);
        const py = mapY(wO3, h);
        drawPlotPoint(px, py, 7 * t, '#b58900', `加熱小蘇打 (${wH3}, ${wO3})`);
    }
    
    // Step 5: Draw Trendline
    if (currentStep >= 5) {
        const t = (currentStep === 5) ? easeInOutCubic(animProgress) : 1;
        const startX = mapX(0, w);
        const startY = mapY(0, h);
        const endX = mapX(3.8, w);
        const endY = mapY(3.8 * 8.0, h);
        
        // Draw progressive trend line
        const currentX = startX + (endX - startX) * t;
        const currentY = startY + (endY - startY) * t;
        
        drawWobblyLine(ctxG, startX, startY, currentX, currentY, 'rgba(29, 53, 87, 0.5)', 4);
        
        // Label the formula of the line
        ctxG.fillStyle = 'var(--color-royal)';
        ctxG.font = 'bold italic 1.1rem "EB Garamond", serif';
        ctxG.fillText('wO = 8 × wH', endX - 50, endY - 15);
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
        
        // Draw delta lines
        ctxG.save();
        ctxG.globalAlpha = t;
        
        // Horizontal delta wH
        drawWobblyLine(ctxG, cx, cy, rx, cy, '#5f5f5f', 1.5);
        // Vertical delta wO
        drawWobblyLine(ctxG, rx, cy, rx, ry, '#5f5f5f', 1.5);
        
        // Label Slope (斜率 = 8)
        ctxG.fillStyle = '#2b2b2b';
        ctxG.font = 'bold 0.95rem sans-serif';
        ctxG.textAlign = 'center';
        ctxG.fillText('ΔwH', (cx + rx) / 2, cy + 18);
        ctxG.fillText('ΔwO', rx + 22, (cy + ry) / 2);
        
        ctxG.font = 'bold 1.1rem "EB Garamond", serif';
        ctxG.fillStyle = '#b58900';
        ctxG.fillText('斜率 (Slope) = ΔwO / ΔwH = 8.0', cx + 70, cy - 25);
        
        ctxG.restore();
    }
}

// -------------------------------------------------------------
// Component Drawer Functions
// -------------------------------------------------------------
function drawGraphAxes(w, h) {
    // Draw grid lines
    ctxG.strokeStyle = 'rgba(43, 43, 43, 0.05)';
    ctxG.lineWidth = 1;
    for (let x = 0.5; x <= 4.0; x += 0.5) {
        const px = mapX(x, w);
        drawWobblyLine(ctxG, px, margin, px, h - margin, 'rgba(43, 43, 43, 0.05)', 1);
    }
    for (let y = 4; y <= 32; y += 4) {
        const py = mapY(y, h);
        drawWobblyLine(ctxG, margin, py, w - margin, py, 'rgba(43, 43, 43, 0.05)', 1);
    }

    // Draw main axes
    const originX = mapX(0, w);
    const originY = mapY(0, h);
    
    // wH axis (X-axis)
    drawWobblyLine(ctxG, originX, originY, w - margin + 20, originY, '#2b2b2b', 2.5);
    // wO axis (Y-axis)
    drawWobblyLine(ctxG, originX, originY, originX, margin - 20, '#2b2b2b', 2.5);
    
    // Labels & Ticks
    ctxG.fillStyle = '#2b2b2b';
    ctxG.font = 'italic 1.1rem "EB Garamond", serif';
    ctxG.textAlign = 'center';
    
    // X Axis Label
    ctxG.fillText('氢的质量 wH (g)', w - margin, originY + 38);
    // Y Axis Label
    ctxG.fillText('氧的质量 wO (g)', originX - 10, margin - 35);
    
    // Tick marks wH
    for (let x = 1.0; x <= 4.0; x += 1.0) {
        const px = mapX(x, w);
        drawWobblyLine(ctxG, px, originY - 4, px, originY + 4, '#2b2b2b', 1.5);
        ctxG.fillText(x.toFixed(1), px, originY + 20);
    }
    
    // Tick marks wO
    ctxG.textAlign = 'right';
    for (let y = 8; y <= 32; y += 8) {
        const py = mapY(y, h);
        drawWobblyLine(ctxG, originX - 4, py, originX + 4, '#2b2b2b', 1.5);
        ctxG.fillText(y.toString(), originX - 12, py + 5);
    }
    
    // Origin (0,0)
    ctxG.fillText('0', originX - 10, originY + 18);
}

function drawPlotPoint(x, y, radius, color, labelText) {
    if (radius <= 0) return;
    drawWobblyCircle(ctxG, x, y, radius + 2, '#2b2b2b', false, 1.5);
    drawWobblyCircle(ctxG, x, y, radius, color, true);
    
    // Fade in text label next to point
    ctxG.fillStyle = '#1f1f1f';
    ctxG.font = 'bold 0.85rem sans-serif';
    ctxG.textAlign = 'left';
    ctxG.fillText(labelText, x + 12, y + 4);
}

function drawWaterMolecule(x, y, r, glowColor) {
    ctxF.shadowBlur = 10;
    ctxF.shadowColor = glowColor;
    drawWobblyCircle(ctxF, x, y, r, glowColor, true);
    drawWobblyCircle(ctxF, x - r * 0.7, y + r * 0.5, r * 0.5, '#38bdf8', true);
    drawWobblyCircle(ctxF, x + r * 0.7, y + r * 0.5, r * 0.5, '#38bdf8', true);
    ctxF.shadowBlur = 0;
}

// -------------------------------------------------------------
// Chemical apparatus drawings
// -------------------------------------------------------------
function drawFlaskFlask(cx, cy, baseR, height) {
    ctxF.beginPath();
    ctxF.moveTo(cx - 15, cy - height / 2);
    ctxF.lineTo(cx + 15, cy - height / 2);
    ctxF.lineTo(cx + 15, cy - height / 4);
    ctxF.lineTo(cx + baseR, cy + height / 2);
    ctxF.lineTo(cx - baseR, cy + height / 2);
    ctxF.lineTo(cx - 15, cy - height / 4);
    ctxF.closePath();
    ctxF.strokeStyle = '#2b2b2b';
    ctxF.lineWidth = 2.5;
    ctxF.stroke();
}

function drawBeaker(cx, cy, r, height) {
    // Left rim, base, right rim
    ctxF.beginPath();
    ctxF.moveTo(cx - r, cy - height);
    ctxF.lineTo(cx - r, cy);
    ctxF.lineTo(cx + r, cy);
    ctxF.lineTo(cx + r, cy - height);
    ctxF.strokeStyle = '#2b2b2b';
    ctxF.lineWidth = 2.5;
    ctxF.stroke();
    
    // Draw lip
    drawWobblyLine(ctxF, cx - r - 5, cy - height, cx - r, cy - height, '#2b2b2b', 2.5);
    drawWobblyLine(ctxF, cx + r, cy - height, cx + r + 2, cy - height, '#2b2b2b', 2.5);
}

function drawBurette(cx, cy, length) {
    // Vertical parallel tubes
    drawWobblyLine(ctxF, cx - 6, cy, cx - 6, cy + length, '#2b2b2b', 2);
    drawWobblyLine(ctxF, cx + 6, cy, cx + 6, cy + length, '#2b2b2b', 2);
    
    // Burette tip
    ctxF.beginPath();
    ctxF.moveTo(cx - 6, cy + length);
    ctxF.lineTo(cx - 2, cy + length + 20);
    ctxF.lineTo(cx + 2, cy + length + 20);
    ctxF.lineTo(cx + 6, cy + length);
    ctxF.strokeStyle = '#2b2b2b';
    ctxF.lineWidth = 2;
    ctxF.stroke();
    
    // Stopcock valve (閥門)
    drawWobblyCircle(ctxF, cx, cy + length + 5, 5, '#5f5f5f', true);
}

function drawBurner(cx, cy, progress) {
    // Burner base
    ctxF.beginPath();
    ctxF.moveTo(cx - 25, cy);
    ctxF.lineTo(cx - 15, cy - 25);
    ctxF.lineTo(cx + 15, cy - 25);
    ctxF.lineTo(cx + 25, cy);
    ctxF.closePath();
    ctxF.strokeStyle = '#2b2b2b';
    ctxF.lineWidth = 2.5;
    ctxF.stroke();
    
    // Wick & Flame
    drawWobblyLine(ctxF, cx, cy - 25, cx, cy - 35, '#2b2b2b', 4);
    
    if (progress > 0.1) {
        // Flickering fire
        ctxF.save();
        ctxF.shadowBlur = 15;
        ctxF.shadowColor = 'rgba(231, 111, 81, 0.8)';
        ctxF.fillStyle = '#e76f51';
        ctxF.beginPath();
        ctxF.moveTo(cx - 8, cy - 35);
        ctxF.quadraticCurveTo(cx, cy - 60 - Math.random() * 8, cx + 8, cy - 35);
        ctxF.closePath();
        ctxF.fill();
        ctxF.restore();
    }
}

function drawCondenser(cx, cy, size) {
    // Draw funnel opening at bottom
    ctxF.beginPath();
    ctxF.moveTo(cx - 30, cy + size);
    ctxF.lineTo(cx, cy + size - 20);
    ctxF.lineTo(cx + 30, cy + size);
    ctxF.strokeStyle = '#2b2b2b';
    ctxF.lineWidth = 2;
    ctxF.stroke();
    
    // Condenser body tube
    drawWobblyLine(ctxF, cx, cy + size - 20, cx, cy, '#2b2b2b', 2);
}

function drawHorizontalTube(cx, cy, length, height) {
    ctxF.beginPath();
    ctxF.moveTo(cx - length / 2, cy - height / 2);
    ctxF.lineTo(cx + length / 2, cy - height / 2);
    ctxF.arc(cx + length / 2, cy, height / 2, -Math.PI / 2, Math.PI / 2);
    ctxF.lineTo(cx - length / 2, cy + height / 2);
    ctxF.strokeStyle = '#2b2b2b';
    ctxF.lineWidth = 2.5;
    ctxF.stroke();
    
    // Substance inside (baking soda)
    ctxF.fillStyle = '#e2e2e2';
    ctxF.fillRect(cx - length / 2 + 10, cy - height / 2 + 4, length - 40, height - 8);
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
