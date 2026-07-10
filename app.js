// Canvas & UI Setup
const flaskCanvas = document.getElementById('flaskCanvas');
const graphCanvas = document.getElementById('graphCanvas');
const ctxF = flaskCanvas.getContext('2d');
const ctxG = graphCanvas.getContext('2d');

// Font Configuration
const FONT_UI = 'bold 1.15rem sans-serif';
const FONT_TITLE = 'bold 1.35rem sans-serif';
const FONT_SMALL = '0.95rem sans-serif';
const FONT_MATH = 'bold italic 1.15rem "EB Garamond", serif';

// Preload generated sketchy asset images
const imgTitration = new Image();
imgTitration.src = 'assets/titration.png?v=' + Date.now();

const imgCombustion = new Image();
imgCombustion.src = 'assets/combustion.png?v=' + Date.now();

const imgHeating = new Image();
imgHeating.src = 'assets/heating.png?v=' + Date.now();

// State Variables
let currentStep = 1;
let animProgress = 0; // Current step animation progress [0, 1]
const totalSteps = 8;

// SOIL Color Config
const COLOR_ORANGE = '#ff7a00';
const COLOR_GRAY_LIGHT = '#cccccc';
const COLOR_GRAY_MEDIUM = '#888888';
const COLOR_GRAY_DARK = '#444444';

// SOIL Takeaway Texts
const takeawayTexts = [
    "利用座標系可以直觀地分析兩種元素之間的質量定量關係。",
    "酸鹼中和反應生成的水，其氧與氫的質量具有特定的比例。",
    "不同反應生成的水，在質量座標圖上似乎遵循著相同的規律。",
    "不論水量多寡，所有數據點在圖上呈現明顯的線性排列關係。",
    "這三個不同化學反應產生的水，雖然質量多寡不同，但呈現相同的比例規律。",
    "同一種化合物，不論其來源或製備方法為何，其組成元素的質量比（斜率）恆為定值。",
    "定比定律：各組成元素間的質量比恆為定值。水的氧與氫質量比永遠是固定的 8 : 1。",
    "微觀原理：化合物是由原子以固定的個數比例結合所造成（如每個 H₂O 恆為 2:1 的 H 與 O）。"
];

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

function drawWobblyRect(ctx, x, y, w, h, color = '#2b2b2b', fill = false, fillColor = '#ffffff', width = 2, seed = 42) {
    if (fill) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, w, h);
    }
    drawWobblyLine(ctx, x, y, x + w, y, color, width, seed);
    drawWobblyLine(ctx, x + w, y, x + w, y + h, color, width, seed + 1);
    drawWobblyLine(ctx, x + w, y + h, x, y + h, color, width, seed + 2);
    drawWobblyLine(ctx, x, y + h, x, y, color, width, seed + 3);
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
        title: "第三步：酒精燃燒產生的水",
        desc: "點燃酒精，收集燃燒產生的水滴進行分析。此時在座標圖上點下第 2 點。此次收集到的水滴質量較多。"
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
    },
    {
        title: "第八步：定比定律的微觀解釋",
        desc: "從微觀尺度來看，定比定律的原理是：每一種「化合物」都是由原子以固定的個數比例結合而成。例如每個水分子 (H₂O) 恆由 2 個氫原子與 1 個氧原子結合，這決定了它們在宏觀上的組成元素質量比恆為 8 : 1。"
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
    
    // Update SOIL page number
    document.getElementById('soil-page-num').textContent = String(currentStep).padStart(2, '0');
    
    // Update takeaway text
    document.getElementById('takeaway-text').textContent = takeawayTexts[currentStep - 1];
    
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
    
    // Highlight active board item in orange
    document.getElementById('board-h1').parentElement.classList.toggle('active', currentStep === 2);
    document.getElementById('board-h2').parentElement.classList.toggle('active', currentStep === 3);
    document.getElementById('board-h3').parentElement.classList.toggle('active', currentStep === 4);
    
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
        ctxF.font = FONT_MATH;
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
            if (t <= 0.5) {
                const t_left = t / 0.5;
                const easeT = easeInOutCubic(t_left);
                // Droplet trajectory starts from conical flask mouth
                const startX = imgX + imgSize * 0.48;
                const startY = imgY + imgSize * 0.72;
                const endX = w;
                const endY = mapY(wO1, graphCanvas.height);
                
                const dropX = startX + (endX - startX) * easeT;
                const dropY = startY + (endY - startY) * easeT - Math.sin(easeT * Math.PI) * 40;
                
                drawWaterDrop(ctxF, dropX, dropY, 12, COLOR_GRAY_LIGHT);
            }
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
            if (t <= 0.5) {
                const t_left = t / 0.5;
                const easeT = easeInOutCubic(t_left);
                // Droplet starts from flame
                const startX = imgX + imgSize * 0.52;
                const startY = imgY + imgSize * 0.44;
                const endX = w;
                const endY = mapY(wO2, graphCanvas.height);
                
                const dropX = startX + (endX - startX) * easeT;
                const dropY = startY + (endY - startY) * easeT - Math.sin(easeT * Math.PI) * 50;
                
                drawWaterDrop(ctxF, dropX, dropY, 14, COLOR_GRAY_MEDIUM);
            }
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
            if (t <= 0.5) {
                const t_left = t / 0.5;
                const easeT = easeInOutCubic(t_left);
                // Droplet starts from baking soda drug solid heated area
                const startX = imgX + imgSize * 0.3;
                const startY = imgY + imgSize * 0.65;
                const endX = w;
                const endY = mapY(wO3, graphCanvas.height);
                
                const dropX = startX + (endX - startX) * easeT;
                const dropY = startY + (endY - startY) * easeT - Math.sin(easeT * Math.PI) * 30;
                
                drawWaterDrop(ctxF, dropX, dropY, 10, COLOR_GRAY_DARK);
            }
        }
    } 
    else if (currentStep === 5) {
        // Step 5: Show three beakers of water side-by-side (Identical composition)
        const gap = w / 4;
        const cy = h / 2 + 20;
        
        ctxF.fillStyle = '#1f1f1f';
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'center';
        ctxF.fillText('分析三種來源的水滴', w / 2, h / 2 - 90);
        
        // Render 3 Beakers in Gray Shades matching the Graph Points
        drawStaticBeaker(ctxF, gap, cy, 35, 55, '酸鹼中和水', 'rgba(204, 204, 204, 0.35)', COLOR_GRAY_LIGHT, 110);
        drawStaticBeaker(ctxF, gap * 2, cy, 35, 55, '酒精燃燒水', 'rgba(136, 136, 136, 0.35)', COLOR_GRAY_MEDIUM, 120);
        drawStaticBeaker(ctxF, gap * 3, cy, 35, 55, '小蘇打分解水', 'rgba(68, 68, 68, 0.35)', COLOR_GRAY_DARK, 130);
        
        ctxF.fillStyle = '#5f5f5f';
        ctxF.font = FONT_UI;
        ctxF.fillText('實驗分析顯示：它們在化學性質上完全一樣，', w / 2, h / 2 + 95);
        ctxF.fillText('不論來源為何，皆為相同物質「水 (H₂O)」。', w / 2, h / 2 + 120);
    }
    else if (currentStep === 6) {
        // Step 6: Quantitative Analysis Data Table
        const y0 = 90, y1 = 135, y2 = 180, y3 = 225, y4 = 270;
        const x0 = 40;
        const x1 = x0 + (w - 80) * 0.25;
        const x2 = x1 + (w - 80) * 0.22;
        const x3 = x2 + (w - 80) * 0.22;
        const x4 = w - 40;

        const cx1 = (x0 + x1) / 2;
        const cx2 = (x1 + x2) / 2;
        const cx3 = (x2 + x3) / 2;
        const cx4 = (x3 + x4) / 2;

        // Draw outer card outline
        drawWobblyRect(ctxF, 25, 25, w - 50, h - 50, '#2b2b2b', true, '#ffffff', 2.5, 600);

        // Title
        ctxF.fillStyle = '#1f1f1f';
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'center';
        ctxF.fillText('定量分析數據表 (wO / wH)', w / 2, 60);

        // Horizontal grid lines
        drawWobblyLine(ctxF, x0, y0, x4, y0, '#2b2b2b', 2, 601);
        drawWobblyLine(ctxF, x0, y1, x4, y1, '#2b2b2b', 2, 602);
        drawWobblyLine(ctxF, x0, y2, x4, y2, '#888888', 1, 603);
        drawWobblyLine(ctxF, x0, y3, x4, y3, '#888888', 1, 604);
        drawWobblyLine(ctxF, x0, y4, x4, y4, '#2b2b2b', 2, 605);

        // Vertical grid lines
        drawWobblyLine(ctxF, x0, y0, x0, y4, '#2b2b2b', 2, 606);
        drawWobblyLine(ctxF, x1, y0, x1, y4, '#888888', 1, 607);
        drawWobblyLine(ctxF, x2, y0, x2, y4, '#888888', 1, 608);
        drawWobblyLine(ctxF, x3, y0, x3, y4, '#888888', 1, 609);
        drawWobblyLine(ctxF, x4, y0, x4, y4, '#2b2b2b', 2, 610);

        // Text rendering
        ctxF.fillStyle = '#2b2b2b';
        ctxF.font = FONT_UI;
        ctxF.textAlign = 'center';

        // Headers
        ctxF.fillText('水源種類', cx1, y0 + 28);
        ctxF.fillText('氫質量 wH', cx2, y0 + 28);
        ctxF.fillText('氧質量 wO', cx3, y0 + 28);
        ctxF.fillText('比值 wO/wH', cx4, y0 + 28);

        // Row 1: 酸鹼中和
        ctxF.font = FONT_SMALL;
        ctxF.fillText('酸鹼中和水', cx1, y1 + 28);
        ctxF.font = FONT_MATH;
        ctxF.fillText(`${wH1} g`, cx2, y1 + 28);
        ctxF.fillText(`${wO1} g`, cx3, y1 + 28);
        ctxF.fillStyle = COLOR_ORANGE;
        ctxF.fillText(`${wO1}/${wH1} = 8.0`, cx4, y1 + 28);

        // Row 2: 酒精燃燒
        ctxF.fillStyle = '#2b2b2b';
        ctxF.font = FONT_SMALL;
        ctxF.fillText('酒精燃燒水', cx1, y2 + 28);
        ctxF.font = FONT_MATH;
        ctxF.fillText(`${wH2} g`, cx2, y2 + 28);
        ctxF.fillText(`${wO2} g`, cx3, y2 + 28);
        ctxF.fillStyle = COLOR_ORANGE;
        ctxF.fillText(`${wO2}/${wH2} = 8.0`, cx4, y2 + 28);

        // Row 3: 小蘇打分解
        ctxF.fillStyle = '#2b2b2b';
        ctxF.font = FONT_SMALL;
        ctxF.fillText('小蘇打分解水', cx1, y3 + 28);
        ctxF.font = FONT_MATH;
        ctxF.fillText(`${wH3} g`, cx2, y3 + 28);
        ctxF.fillText(`${wO3} g`, cx3, y3 + 28);
        ctxF.fillStyle = COLOR_ORANGE;
        ctxF.fillText(`${wO3}/${wH3} = 8.0`, cx4, y3 + 28);

        // Bottom takeaway inside canvas
        ctxF.fillStyle = '#5f5f5f';
        ctxF.font = FONT_UI;
        ctxF.fillText('觀察發現：不同來源的水，其組成的質量比值恆為定值。', w / 2, h - 45);
    }
    else if (currentStep === 7) {
        // Step 7: Formal Law Scroll / Joseph Proust Scroll
        const alpha7 = easeInOutCubic(animProgress);
        ctxF.save();
        ctxF.globalAlpha = alpha7;

        // Draw parchment border
        drawWobblyRect(ctxF, 35, 35, w - 70, h - 70, '#2b2b2b', true, '#faf8f5', 2.5, 700);
        drawWobblyRect(ctxF, 43, 43, w - 86, h - 86, '#888888', false, '', 1, 750);

        // Title
        ctxF.fillStyle = COLOR_ORANGE;
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'center';
        ctxF.fillText('定比定律 (Law of Definite Proportions)', w / 2, 75);

        // Divider
        drawWobblyLine(ctxF, 60, 95, w - 60, 95, '#2b2b2b', 1.5, 710);

        // Statement
        ctxF.fillStyle = '#1f1f1f';
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'center'; // Just make sure centering is clean
        ctxF.fillText('「 一種純化合物，不論其來源或', w / 2, 145);
        ctxF.fillText('製備方法為何，其組成元素', w / 2, 190);
        ctxF.fillText('之間的質量比恆為定值。 」', w / 2, 235);

        // Author / Date
        ctxF.fillStyle = '#5f5f5f';
        ctxF.font = FONT_UI;
        ctxF.textAlign = 'right';
        ctxF.fillText('── 普魯斯特 (Joseph Proust, 1799)', w - 70, 285);
        ctxF.restore();
    }
    else if (currentStep === 8) {
        // Step 8: Show microscopic water molecules
        ctxF.fillStyle = '#1f1f1f';
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'center';
        ctxF.fillText('微觀原理：原子以固定比例結合', w / 2, 45);
        
        // Draw 3 water molecules
        drawWaterMolecule(ctxF, w / 2 - 85, h / 2 - 30, 22, 13, 104.5, -Math.PI / 6);
        drawWaterMolecule(ctxF, w / 2 + 85, h / 2 - 10, 22, 13, 104.5, Math.PI / 4);
        drawWaterMolecule(ctxF, w / 2, h / 2 + 75, 22, 13, 104.5, Math.PI + Math.PI / 8);
        
        // Explanatory text
        ctxF.fillStyle = '#5f5f5f';
        ctxF.font = FONT_UI;
        ctxF.fillText('每個水分子 (H₂O) 恆由 2 個 H 與 1 個 O 原子結合', w / 2, h - 80);
        
        ctxF.font = FONT_MATH;
        ctxF.fillStyle = COLOR_ORANGE;
        ctxF.fillText('原子質量比 ── 氧 (16) : 氫 (1) × 2 = 8 : 1', w / 2, h - 50);
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
    
    // Step 5: Draw Trendline (drawn under points, translucent)
    if (currentStep >= 5) {
        const t = (currentStep === 5) ? easeInOutCubic(animProgress) : 1;
        const startX = mapX(0, w);
        const startY = mapY(0, h);
        const endX = mapX(3.8, w);
        const endY = mapY(3.8 * 8.0, h);
        
        const currentX = startX + (endX - startX) * t;
        const currentY = startY + (endY - startY) * t;
        
        // Use translucent orange for trendline
        drawWobblyLine(ctxG, startX, startY, currentX, currentY, 'rgba(255, 122, 0, 0.55)', 4, 300);
    }
    
    // Step 2: Plot Point 1 or Flying Droplet (second half)
    if (currentStep === 2) {
        const p = animProgress;
        if (p > 0.1 && p < 0.7) {
            const t = (p - 0.1) / 0.6;
            if (t > 0.5) {
                const t_right = (t - 0.5) / 0.5;
                const easeT = easeInOutCubic(t_right);
                const startX = 0;
                const endX = mapX(wH1, w);
                const py = mapY(wO1, h);
                
                const dropX = startX + (endX - startX) * easeT;
                const dropY = py - Math.sin(easeT * Math.PI) * 20;
                drawWaterDrop(ctxG, dropX, dropY, 12, COLOR_GRAY_LIGHT);
            }
        }
    }
    if (currentStep >= 2) {
        let t = 1;
        if (currentStep === 2) {
            // Plot only after droplet lands (at progress 0.7)
            t = animProgress < 0.7 ? 0 : easeOutElastic((animProgress - 0.7) / 0.3);
        }
        const px = mapX(wH1, w);
        const py = mapY(wO1, h);
        drawPlotPoint(px, py, 7 * t, COLOR_GRAY_LIGHT);
    }
    
    // Step 3: Plot Point 2 or Flying Droplet (second half)
    if (currentStep === 3) {
        const p = animProgress;
        if (p > 0.1 && p < 0.7) {
            const t = (p - 0.1) / 0.6;
            if (t > 0.5) {
                const t_right = (t - 0.5) / 0.5;
                const easeT = easeInOutCubic(t_right);
                const startX = 0;
                const endX = mapX(wH2, w);
                const py = mapY(wO2, h);
                
                const dropX = startX + (endX - startX) * easeT;
                const dropY = py - Math.sin(easeT * Math.PI) * 20;
                drawWaterDrop(ctxG, dropX, dropY, 14, COLOR_GRAY_MEDIUM);
            }
        }
    }
    if (currentStep >= 3) {
        let t = 1;
        if (currentStep === 3) {
            t = animProgress < 0.7 ? 0 : easeOutElastic((animProgress - 0.7) / 0.3);
        }
        const px = mapX(wH2, w);
        const py = mapY(wO2, h);
        drawPlotPoint(px, py, 7 * t, COLOR_GRAY_MEDIUM);
    }
    
    // Step 4: Plot Point 3 or Flying Droplet (second half)
    if (currentStep === 4) {
        const p = animProgress;
        if (p > 0.1 && p < 0.7) {
            const t = (p - 0.1) / 0.6;
            if (t > 0.5) {
                const t_right = (t - 0.5) / 0.5;
                const easeT = easeInOutCubic(t_right);
                const startX = 0;
                const endX = mapX(wH3, w);
                const py = mapY(wO3, h);
                
                const dropX = startX + (endX - startX) * easeT;
                const dropY = py - Math.sin(easeT * Math.PI) * 20;
                drawWaterDrop(ctxG, dropX, dropY, 10, COLOR_GRAY_DARK);
            }
        }
    }
    if (currentStep >= 4) {
        let t = 1;
        if (currentStep === 4) {
            t = animProgress < 0.7 ? 0 : easeOutElastic((animProgress - 0.7) / 0.3);
        }
        const px = mapX(wH3, w);
        const py = mapY(wO3, h);
        drawPlotPoint(px, py, 7 * t, COLOR_GRAY_DARK);
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
        drawWobblyLine(ctxG, cx, cy, rx, cy, '#888888', 1.5, 400);
        // Vertical delta wO
        drawWobblyLine(ctxG, rx, cy, rx, ry, '#888888', 1.5, 500);
        
        ctxG.fillStyle = '#2b2b2b';
        ctxG.font = FONT_SMALL;
        ctxG.textAlign = 'center';
        ctxG.fillText('ΔwH', (cx + rx) / 2, cy + 18);
        ctxG.fillText('ΔwO', rx + 22, (cy + ry) / 2);
        
        // Slope calculation formula - placed in top-left clear area to avoid overlaps
        ctxG.font = FONT_MATH;
        ctxG.fillStyle = COLOR_ORANGE;
        ctxG.textAlign = 'left';
        ctxG.fillText('斜率 (質量比) = ΔwO / ΔwH = 8.0', margin + 20, margin + 35);
        
        ctxG.restore();
    }
}

// -------------------------------------------------------------
// UI Drawer Components
// -------------------------------------------------------------
function drawGraphAxes(w, h) {
    // 1. Draw Grid lines (straight, clean - matching multiple proportions)
    ctxG.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctxG.lineWidth = 1;
    for (let xVal = 0.5; xVal <= 4.0; xVal += 0.5) {
        ctxG.beginPath();
        ctxG.moveTo(mapX(xVal, w), mapY(0, h));
        ctxG.lineTo(mapX(xVal, w), mapY(32, h));
        ctxG.stroke();
    }
    for (let yVal = 4; yVal <= 32; yVal += 4) {
        ctxG.beginPath();
        ctxG.moveTo(mapX(0, w), mapY(yVal, h));
        ctxG.lineTo(mapX(4.0, w), mapY(yVal, h));
        ctxG.stroke();
    }

    const originX = mapX(0, w);
    const originY = mapY(0, h);
    
    // 2. Draw Axes (Wobbly - matching multiple proportions, no arrows)
    drawWobblyLine(ctxG, originX, originY, mapX(4.0, w), originY, '#2b2b2b', 2.5, 201); // X Axis
    drawWobblyLine(ctxG, originX, originY, originX, mapY(32.0, h), '#2b2b2b', 2.5, 202); // Y Axis
    
    // Ticks & labels for X Axis
    ctxG.font = FONT_SMALL;
    ctxG.textAlign = 'center';
    for (let xVal = 1.0; xVal <= 4.0; xVal += 1.0) {
        const tx = mapX(xVal, w);
        const ty = mapY(0, h);
        drawWobblyLine(ctxG, tx, ty, tx, ty + 5, '#2b2b2b', 1.5, 203 + xVal);
        ctxG.fillStyle = '#2b2b2b';
        ctxG.fillText(xVal.toFixed(1), tx, ty + 18);
    }
    
    // Ticks & labels for Y Axis
    ctxG.textAlign = 'right';
    for (let yVal = 8; yVal <= 32; yVal += 8) {
        const tx = mapX(0, w);
        const ty = mapY(yVal, h);
        drawWobblyLine(ctxG, tx, ty, tx - 5, ty, '#2b2b2b', 1.5, 210 + yVal);
        ctxG.fillStyle = '#2b2b2b';
        ctxG.fillText(yVal.toString(), tx - 10, ty + 5);
    }
    
    // Axis Titles (matching multiple proportions)
    ctxG.font = FONT_UI;
    ctxG.fillStyle = '#2b2b2b';
    
    // X Axis Label
    ctxG.textAlign = 'center';
    ctxG.fillText('氫的質量 wH (g)', w - 100, originY + 40);
    
    // Y Axis Label
    ctxG.textAlign = 'left';
    ctxG.fillText('氧的質量 wO (g)', originX + 15, 30);
    
    ctxG.textAlign = 'right';
    ctxG.fillText('0', originX - 10, originY + 15);
}

function drawPlotPoint(x, y, radius, color) {
    if (radius <= 0) return;
    // Draw wobbly filled circle matching Law of Multiple Proportions (no black outline)
    drawWobblyCircle(ctxG, x, y, radius, color, true, 2, x + y);
}

// -------------------------------------------------------------
// High-Quality Static Chemical Apparatus Illustrations
// -------------------------------------------------------------

function drawStaticBeaker(ctx, cx, cy, r, height, label, liquidColor, dropletColor, seed) {
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
    
    // Liquid inside beaker (flat render)
    ctx.fillStyle = liquidColor;
    ctx.fillRect(cx - r + 3, cy - height * 0.5, r * 2 - 6, height * 0.5 - 3);
    
    // Label text
    ctx.fillStyle = '#1f1f1f';
    ctx.font = FONT_SMALL;
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + 20);
    
    // Floating water droplet
    drawWaterDrop(ctx, cx, cy - height - 20, 10, dropletColor);
}

function drawWaterDrop(ctx, x, y, r, color = '#ff7a00') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color === '#ff7a00' ? 'rgba(255, 122, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)';
    
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

function drawWaterMolecule(ctx, cx, cy, rO = 22, rH = 13, angleDeg = 104.5, rotAngle = 0) {
    const angleRad = (angleDeg * Math.PI) / 180;
    const dist = rO + rH + 4; // distance between centers
    const h1x = cx + dist * Math.cos(rotAngle - angleRad / 2);
    const h1y = cy + dist * Math.sin(rotAngle - angleRad / 2);
    const h2x = cx + dist * Math.cos(rotAngle + angleRad / 2);
    const h2y = cy + dist * Math.sin(rotAngle + angleRad / 2);
    
    // Draw wobbly bonds
    drawWobblyLine(ctx, cx, cy, h1x, h1y, '#888888', 2.5, cx + cy);
    drawWobblyLine(ctx, cx, cy, h2x, h2y, '#888888', 2.5, cx - cy);
    
    // Draw Oxygen atom (large wobbly circle) — Red fill, white text
    drawWobblyCircle(ctx, cx, cy, rO, '#ef4444', true, 2, cx);
    drawWobblyCircle(ctx, cx, cy, rO, '#2b2b2b', false, 2, cx);
    ctx.fillStyle = '#ffffff';
    ctx.font = FONT_UI;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('O', cx, cy + 5);
    
    // Draw Hydrogen 1 (small wobbly circle) — White fill, black text
    drawWobblyCircle(ctx, h1x, h1y, rH, '#ffffff', true, 1.5, h1x);
    drawWobblyCircle(ctx, h1x, h1y, rH, '#2b2b2b', false, 1.5, h1x);
    ctx.fillStyle = '#2b2b2b';
    ctx.font = FONT_SMALL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', h1x, h1y + 4);
    
    // Draw Hydrogen 2 (small wobbly circle) — White fill, black text
    drawWobblyCircle(ctx, h2x, h2y, rH, '#ffffff', true, 1.5, h2x);
    drawWobblyCircle(ctx, h2x, h2y, rH, '#2b2b2b', false, 1.5, h2x);
    ctx.fillStyle = '#2b2b2b';
    ctx.font = FONT_SMALL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', h2x, h2y + 4);
}

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
window.onload = () => {
    generateRandomValues();
    resizeCanvases();
    updateUI();
    if (document.fonts) {
        document.fonts.ready.then((fontFaceSet) => {
            console.log("=== Fonts Status ===");
            fontFaceSet.forEach((font) => {
                console.log(`Family: ${font.family}, Status: ${font.status}`);
            });
            drawLoop();
        });
    } else {
        drawLoop();
    }
};

window.onresize = () => {
    resizeCanvases();
};
