// Canvas & UI Setup
const flaskCanvas = document.getElementById('flaskCanvas');
const graphCanvas = document.getElementById('graphCanvas');
const ctxF = flaskCanvas.getContext('2d');
const ctxG = graphCanvas.getContext('2d');

// Font Configuration (Strict Sans-serif for all UI and math formulas)
const FONT_UI = 'bold 1.15rem sans-serif';
const FONT_TITLE = 'bold 1.35rem sans-serif';
const FONT_SMALL = '0.95rem sans-serif';
const FONT_MATH = 'bold italic 1.15rem sans-serif';

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

// Colors updated for Light Mode styling (keeping 3B1B vibrant contrasts)
const COLOR_BLACK = '#ffffff';  // Canvas background (pure white)
const COLOR_WHITE = '#2b2b2b';  // Primary lines/text (chalk dark)
const COLOR_GREY = '#888888';   // Grid lines & secondary text
const COLOR_BLUE = '#007799';   // Acid-base titration (Ocean blue - high contrast)
const COLOR_GREEN = '#2e7d32';  // Combustion (Forest green - high contrast)
const COLOR_YELLOW = '#ffb300'; // Solid heating (Golden amber for white background readability)
const COLOR_ORANGE = '#ff7a00'; // Highlights / Trendline (SOIL orange)
const COLOR_RED = '#ef4444';    // Oxygen Atoms (Red)

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
    wH1 = "1.34";
    wO1 = "10.72";
    wH2 = "3.02";
    wO2 = "24.16";
    wH3 = "0.50";
    wO3 = "4.00";
}

// Math Easing Functions
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// Seeded Random for Steady (Non-jittering) Hand-Drawn Lines
let rndSeed = 1;
function setRndSeed(s) {
    rndSeed = s;
}
function seededRandom() {
    const x = Math.sin(rndSeed++) * 10000;
    return x - Math.floor(x);
}

function drawWobblyLine(ctx, x1, y1, x2, y2, color = COLOR_WHITE, width = 2, seed = 42) {
    ctx.save();
    setRndSeed(seed);
    const segments = Math.max(5, Math.floor(Math.hypot(x2 - x1, y2 - y1) / 8));

    // Light-mode shadow glow (subtle grey shadow to mimic pencil/chalk bleed)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 2;

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
    ctx.restore();
}

function drawWobblyRect(ctx, x, y, w, h, color = COLOR_WHITE, fill = false, fillColor = '#ffffff', width = 2, seed = 42) {
    ctx.save();
    if (fill) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, w, h);
    }
    drawWobblyLine(ctx, x, y, x + w, y, color, width, seed);
    drawWobblyLine(ctx, x + w, y, x + w, y + h, color, width, seed + 1);
    drawWobblyLine(ctx, x + w, y + h, x, y + h, color, width, seed + 2);
    drawWobblyLine(ctx, x, y + h, x, y, color, width, seed + 3);
    ctx.restore();
}

function drawWobblyCircle(ctx, cx, cy, r, color = COLOR_WHITE, fill = false, width = 2, seed = 100) {
    ctx.save();
    setRndSeed(seed);
    const segments = 24;

    // Subtle drop-shadow for light background
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 4;

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
            ctx.fillStyle = fill === true ? color : fill;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
        }
    }
    ctx.restore();
}

// Coordinate Helpers for Graph Canvas (x: 0 ~ 4.0, y: 0 ~ 32.0)
const margin = 60;
function mapX(xVal, width) {
    return margin + (xVal / 4.0) * (width - 2 * margin);
}
function mapY(yVal, height) {
    const maxVal = (currentStep === 8) ? 2.0 : 32.0;
    return height - margin - (yVal / maxVal) * (height - 2 * margin);
}

// Step descriptions
const stepTexts = [
    {
        title: "第一步：建立質量關係座標系",
        desc: "以水 (H₂O) 為例。我們建立一個座標圖，以氧的質量 wO 為 Y 軸，以氫的質量 wH 為 X 軸，用來探討水分子的組成比例。"
    },
    {
        title: "第二步：酸鹼中和產生的水",
        desc: "進行酸鹼中和實驗，收集生成的水滴進行分析，測得其氫、氧質量。此時在座標圖上點下第 1 點。數據點的對應名稱請見圖例。"
    },
    {
        title: "第三步：酒精燃燒產生的水",
        desc: "點燃酒精，收集燃燒產生的水滴進行分析。此時在座標圖上點下第 2 點。此次收集到的水滴質量較多。"
    },
    {
        title: "第四步：小蘇打分解產生的水",
        desc: "將小蘇打固體放入試管加熱，收集管口冷凝出來的水滴進行分析。此時在座標圖上點下第 3 點。此次收集到的水滴質量較少。"
    },
    {
        title: "第五步：觀察不同的水源",
        desc: "引導觀察：注意看這三個來自完全不同化學反應產生的水，雖然每次反應得到的質量多寡不同，但它們在圖上呈現什麼關係？"
    },
    {
        title: "第六步：普魯斯特的重大發現",
        desc: "法國化學家普魯斯特發現，同一種化合物，不論其來源或製備方法為何，其組成元素的質量比恆為定值。本圖以質量比（即座標圖上的斜率）呈現，亦為定值。"
    },
    {
        title: "第七步：定比定律 (Law of Definite Proportions)",
        desc: "化合物中，各組成元素間的質量比恆為定值。這就是定比定律！以水為例，不論來源，氧與氫的質量比永遠是固定的 8 : 1。"
    },
    {
        title: "第八步：定比定律的微觀解釋",
        desc: "從微觀尺度來看，化合物是由原子以固定的個數比例結合而成。例如每個水分子 (H₂O) 恆由 2 個氫原子與 1 個氧原子結合，這決定了它們在巨觀上的質量比恆為 8 : 1。"
    }
];

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        animProgress = 0;
        updateUI();
    } else if (currentStep === totalSteps) {
        location.href = "quiz.html?v=20260711_02";
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
    document.getElementById('btn-back').disabled = (currentStep === 1);
    document.getElementById('btn-next').disabled = false;

    if (currentStep === totalSteps) {
        document.getElementById('btn-next').textContent = "挑戰例題";
    } else {
        document.getElementById('btn-next').textContent = "下一步";
    }

    document.getElementById('step-indicator').textContent = `步驟 ${currentStep} / ${totalSteps}`;
    document.getElementById('step-title').textContent = stepTexts[currentStep - 1].title;
    document.getElementById('step-desc').textContent = stepTexts[currentStep - 1].desc;
    document.getElementById('soil-page-num').textContent = String(currentStep).padStart(2, '0');
    document.getElementById('takeaway-text').textContent = takeawayTexts[currentStep - 1];

    // Toggle active state of HTML legend items
    document.getElementById('legend-item-1').classList.toggle('visible', currentStep >= 2);
    document.getElementById('legend-item-2').classList.toggle('visible', currentStep >= 3);
    document.getElementById('legend-item-3').classList.toggle('visible', currentStep >= 4);
    document.getElementById('legend-item-4').classList.toggle('visible', currentStep >= 5);

    document.getElementById('left-legend-item-1').classList.toggle('visible', currentStep >= 2);
    document.getElementById('left-legend-item-2').classList.toggle('visible', currentStep >= 3);
    document.getElementById('left-legend-item-3').classList.toggle('visible', currentStep >= 4);

    // Dynamic right panel label update
    const rightPanelLabel = document.querySelector('.right-panel .panel-label');
    if (rightPanelLabel) {
        if (currentStep === 8) {
            rightPanelLabel.innerHTML = '組成莫耳數座標圖 (n<sub>H</sub> - n<sub>O</sub>)';
        } else {
            rightPanelLabel.innerHTML = '組成質量座標圖 (w<sub>H</sub> - w<sub>O</sub>)';
        }
    }

    // Dynamic legend update for step 8
    const legendItem4Line = document.querySelector('#legend-item-4 .legend-line');
    const legendItem4Text = document.querySelector('#legend-item-4 span:not(.legend-line)');
    if (legendItem4Line && legendItem4Text) {
        if (currentStep === 8) {
            legendItem4Line.style.backgroundColor = '#7c3aed';
            legendItem4Text.innerHTML = '定比線 n<sub>O</sub> = 0.5 × n<sub>H</sub>';
        } else {
            legendItem4Line.style.backgroundColor = COLOR_ORANGE;
            legendItem4Text.innerHTML = '定比線 w<sub>O</sub> = 8 × w<sub>H</sub>';
        }
    }
}

function resizeCanvases() {
    const wrapperL = flaskCanvas.parentElement;
    flaskCanvas.width = wrapperL.clientWidth;
    flaskCanvas.height = wrapperL.clientHeight;

    const wrapperR = graphCanvas.parentElement;
    graphCanvas.width = wrapperR.clientWidth;
    graphCanvas.height = wrapperR.clientHeight;
}

// Unified Animation Loop (Runs constantly at 60 FPS)
function drawLoop() {
    if (animProgress < 1.0) {
        animProgress = Math.min(1.0, animProgress + 0.016); // 1.6% per frame
    }

    renderFlaskPanel();
    renderGraphPanel();

    requestAnimationFrame(drawLoop);
}

// -------------------------------------------------------------
// LEFT PANEL: Light Theme Render
// -------------------------------------------------------------
function renderFlaskPanel() {
    const w = flaskCanvas.width;
    const h = flaskCanvas.height;
    ctxF.clearRect(0, 0, w, h);

    // Light Theme background fill
    ctxF.fillStyle = COLOR_BLACK;
    ctxF.fillRect(0, 0, w, h);

    ctxF.save();

    const p = animProgress;
    const t = easeInOutCubic(p);

    if (currentStep === 1) {
        // Step 1: Blank slate introducing Definite Proportions
        ctxF.fillStyle = COLOR_WHITE;
        ctxF.font = FONT_MATH;
        ctxF.textAlign = 'center';
        ctxF.fillText('定比定律實驗演示 🧪', w / 2, h / 2 - 20);

        ctxF.fillStyle = COLOR_GREY;
        ctxF.font = FONT_SMALL;
        ctxF.fillText('收集並定量分析三種不同化學反應產生的水滴', w / 2, h / 2 + 20);
    }
    else if (currentStep === 2) {
        // Step 2: Acid-base Titration - Fade-in only
        ctxF.fillStyle = COLOR_WHITE;
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'center';
        ctxF.fillText('生成水的方法：酸鹼中和', w / 2, 38);

        const imgSize = Math.min(w, h) * 0.75;
        const imgX = (w - imgSize) / 2;
        const imgY = (h - imgSize) / 2 + 15;

        // Simple Opacity Fade-in
        ctxF.save();
        ctxF.globalAlpha = p;
        ctxF.drawImage(imgTitration, imgX, imgY, imgSize, imgSize);
        ctxF.restore();

        // Flying droplet
        if (p > 0.1 && p < 0.7) {
            const dropT = (p - 0.1) / 0.6;
            if (dropT <= 0.5) {
                const easeDrop = easeInOutCubic(dropT / 0.5);
                const startX = imgX + imgSize * 0.48;
                const startY = imgY + imgSize * 0.72;
                const endX = w;
                const endY = mapY(wO1, graphCanvas.height);

                const dropX = startX + (endX - startX) * easeDrop;
                const dropY = startY + (endY - startY) * easeDrop - Math.sin(easeDrop * Math.PI) * 40;

                drawWaterDrop(ctxF, dropX, dropY, 12, COLOR_BLUE);
            }
        }
    }
    else if (currentStep === 3) {
        // Step 3: Combustion Setup - Fade-in only
        ctxF.fillStyle = COLOR_WHITE;
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'center';
        ctxF.fillText('生成水的方法：酒精燃燒', w / 2, 38);

        const imgSize = Math.min(w, h) * 0.75;
        const imgX = (w - imgSize) / 2;
        const imgY = (h - imgSize) / 2 + 15;

        ctxF.save();
        ctxF.globalAlpha = p;
        ctxF.drawImage(imgCombustion, imgX, imgY, imgSize, imgSize);
        ctxF.restore();

        if (p > 0.1 && p < 0.7) {
            const dropT = (p - 0.1) / 0.6;
            if (dropT <= 0.5) {
                const easeDrop = easeInOutCubic(dropT / 0.5);
                const startX = imgX + imgSize * 0.50;
                const startY = imgY + imgSize * 0.38;
                const endX = w;
                const endY = mapY(wO2, graphCanvas.height);

                const dropX = startX + (endX - startX) * easeDrop;
                const dropY = startY + (endY - startY) * easeDrop - Math.sin(easeDrop * Math.PI) * 50;

                drawWaterDrop(ctxF, dropX, dropY, 14, COLOR_GREEN);
            }
        }
    }
    else if (currentStep === 4) {
        // Step 4: Baking Soda Heating Setup - Fade-in only
        ctxF.fillStyle = COLOR_WHITE;
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'center';
        ctxF.fillText('生成水的方法：小蘇打熱解', w / 2, 38);

        const imgSize = Math.min(w, h) * 0.75;
        const imgX = (w - imgSize) / 2;
        const imgY = (h - imgSize) / 2 + 15;

        ctxF.save();
        ctxF.globalAlpha = p;
        ctxF.drawImage(imgHeating, imgX, imgY, imgSize, imgSize);
        ctxF.restore();

        if (p > 0.1 && p < 0.7) {
            const dropT = (p - 0.1) / 0.6;
            if (dropT <= 0.5) {
                const easeDrop = easeInOutCubic(dropT / 0.5);
                const startX = imgX + imgSize * 0.68;
                const startY = imgY + imgSize * 0.48;
                const endX = w;
                const endY = mapY(wO3, graphCanvas.height);

                const dropX = startX + (endX - startX) * easeDrop;
                const dropY = startY + (endY - startY) * easeDrop - Math.sin(easeDrop * Math.PI) * 30;

                drawWaterDrop(ctxF, dropX, dropY, 10, COLOR_YELLOW);
            }
        }
    }
    else if (currentStep === 5) {
        // Step 5: Beaker side-by-side Grow-in (retaining wobbly shapes)
        const gap = w / 4;
        const cy = h / 2 + 20;

        ctxF.fillStyle = COLOR_WHITE;
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'center';
        ctxF.fillText('分析三種來源的水滴', w / 2, h / 2 - 90);

        const drawGrowBeaker = (bx, label, val, lColor, dColor, seed) => {
            ctxF.save();
            ctxF.translate(bx, cy);
            ctxF.globalAlpha = p; // 使用淡入動畫即可
            drawStaticBeaker(ctxF, 0, 0, 35, 55, label, val, lColor, dColor, seed);
            ctxF.restore();
        };

        drawGrowBeaker(gap, '酸鹼中和水', '', 'rgba(88, 196, 221, 0.2)', COLOR_BLUE, 110);
        drawGrowBeaker(gap * 2, '酒精燃燒水', '', 'rgba(131, 193, 103, 0.2)', COLOR_GREEN, 120);
        drawGrowBeaker(gap * 3, '小蘇打分解水', '', 'rgba(255, 241, 182, 0.2)', COLOR_YELLOW, 130);

        ctxF.font = FONT_UI;
        const text1 = '實驗分析顯示：它們的';
        const text2 = '組成元素質量比完全一樣';
        const text3 = '，';

        const w1 = ctxF.measureText(text1).width;
        const w2 = ctxF.measureText(text2).width;
        const w3 = ctxF.measureText(text3).width;
        const totalW = w1 + w2 + w3;

        let startX = w / 2 - totalW / 2;
        ctxF.save();
        ctxF.textAlign = 'left';
        ctxF.fillStyle = COLOR_GREY;
        ctxF.fillText(text1, startX, h / 2 + 95);
        startX += w1;
        ctxF.fillStyle = COLOR_ORANGE;
        ctxF.fillText(text2, startX, h / 2 + 95);
        startX += w2;
        ctxF.fillStyle = COLOR_GREY;
        ctxF.fillText(text3, startX, h / 2 + 95);
        ctxF.restore();

        ctxF.fillStyle = COLOR_GREY;
        ctxF.textAlign = 'center';
        ctxF.fillText('不論來源為何，皆為相同物質「水 (H₂O)」。', w / 2, h / 2 + 120);
    }
    else if (currentStep === 6) {
        // Step 6: 3B1B Light Theme Data Table
        const cy = h / 2;
        const y0 = cy - 90, y1 = cy - 45, y2 = cy, y3 = cy + 45, y4 = cy + 90;

        // 5 Columns (Column 1 is expanded to 30% to fit settled droplets without clipping)
        const x0 = 35;
        const x1 = x0 + (w - 70) * 0.30; // 水源種類 (30%)
        const x2 = x1 + (w - 70) * 0.15; // 總重 (15%)
        const x3 = x2 + (w - 70) * 0.15; // 氧質量 wO (15%)
        const x4 = x3 + (w - 70) * 0.15; // 氫質量 wH (15%)
        const x5 = w - 35;                // 比值 (25%)

        const cx1 = (x0 + x1) / 2;
        const cx2 = (x1 + x2) / 2;
        const cx3 = (x2 + x3) / 2;
        const cx4 = (x3 + x4) / 2;
        const cx5 = (x4 + x5) / 2;

        const centerY1 = (y1 + y2) / 2;
        const centerY2 = (y2 + y3) / 2;
        const centerY3 = (y3 + y4) / 2;

        // Draw outer card outline
        drawWobblyRect(ctxF, 25, 25, w - 50, h - 50, COLOR_WHITE, true, COLOR_BLACK, 2.5, 600);

        // Title
        ctxF.fillStyle = COLOR_WHITE;
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'center';
        ctxF.fillText('定量分析數據表 (wO / wH)', w / 2, cy - 122);

        // Horizontal grid lines - Draw-in along vectors
        drawWobblyLine(ctxF, x0, y0, x0 + (x5 - x0) * t, y0, COLOR_WHITE, 2, 601);
        drawWobblyLine(ctxF, x0, y1, x0 + (x5 - x0) * t, y1, COLOR_WHITE, 2, 602);
        drawWobblyLine(ctxF, x0, y2, x0 + (x5 - x0) * t, y2, COLOR_GREY, 1, 603);
        drawWobblyLine(ctxF, x0, y3, x0 + (x5 - x0) * t, y3, COLOR_GREY, 1, 604);
        drawWobblyLine(ctxF, x0, y4, x0 + (x5 - x0) * t, y4, COLOR_WHITE, 2, 605);

        // Vertical grid lines
        drawWobblyLine(ctxF, x0, y0, x0, y0 + (y4 - y0) * t, COLOR_WHITE, 2, 606);
        drawWobblyLine(ctxF, x1, y0, x1, y0 + (y4 - y0) * t, COLOR_GREY, 1, 607);
        drawWobblyLine(ctxF, x2, y0, x2, y0 + (y4 - y0) * t, COLOR_GREY, 1, 608);
        drawWobblyLine(ctxF, x3, y0, x3, y0 + (y4 - y0) * t, COLOR_GREY, 1, 609);
        drawWobblyLine(ctxF, x4, y0, x4, y0 + (y4 - y0) * t, COLOR_GREY, 1, 611);
        drawWobblyLine(ctxF, x5, y0, x5, y0 + (y4 - y0) * t, COLOR_WHITE, 2, 610);

        // Table text rendering
        ctxF.save();
        ctxF.textBaseline = 'middle';
        ctxF.fillStyle = COLOR_WHITE;
        ctxF.font = FONT_UI;
        ctxF.textAlign = 'center';

        const centerY0 = (y0 + y1) / 2;
        ctxF.fillText('水源種類', cx1, centerY0);
        ctxF.fillText('總重', cx2, centerY0 - 9);
        ctxF.fillText('氧質量', cx3, centerY0 - 9);
        ctxF.fillText('氫質量', cx4, centerY0 - 9);
        ctxF.fillText('比值', cx5, centerY0 - 9);

        ctxF.save();
        ctxF.font = FONT_SMALL;
        ctxF.fillStyle = COLOR_GREY;
        ctxF.fillText('w水 (g)', cx2, centerY0 + 9);
        ctxF.fillText('wO (g)', cx3, centerY0 + 9);
        ctxF.fillText('wH (g)', cx4, centerY0 + 9);
        ctxF.fillText('wO/wH', cx5, centerY0 + 9);
        ctxF.restore();

        // Labels
        ctxF.fillStyle = COLOR_WHITE;
        ctxF.font = FONT_SMALL;
        ctxF.fillText('酸鹼中和水', cx1, centerY1);
        ctxF.fillText('酒精燃燒水', cx1, centerY2);
        ctxF.fillText('小蘇打分解水', cx1, centerY3);

        // Morphing: fly droplets from their exact reaction sources into the data table cells
        const imgSize = Math.min(w, h) * 0.75;
        const imgX = (w - imgSize) / 2;
        const imgY = (h - imgSize) / 2 + 15;

        // Titration Flask liquid surface coordinates
        const titrationStartX = imgX + imgSize * 0.48;
        const titrationStartY = imgY + imgSize * 0.72;

        // Combustion Flame tip coordinates
        const greenStartX = imgX + imgSize * 0.50;
        const greenStartY = imgY + imgSize * 0.38;

        // Soda Heating powder coordinates inside test tube
        const sodaStartX = imgX + imgSize * 0.68;
        const sodaStartY = imgY + imgSize * 0.48;

        if (p < 0.8) {
            const morphT = p / 0.8;
            const easeMorph = easeInOutCubic(morphT);

            // Fly droplet 1 to Water source name suffix - from Titration Flask liquid surface
            const drop1X = titrationStartX + (cx1 + 45 - titrationStartX) * easeMorph;
            const drop1Y = titrationStartY + (centerY1 - titrationStartY) * easeMorph;
            drawWaterDrop(ctxF, drop1X, drop1Y, 10, COLOR_BLUE);

            // Fly droplet 2 to Water source name suffix - from Combustion Flame tip
            const drop2X = greenStartX + (cx1 + 45 - greenStartX) * easeMorph;
            const drop2Y = greenStartY + (centerY2 - greenStartY) * easeMorph;
            drawWaterDrop(ctxF, drop2X, drop2Y, 11, COLOR_GREEN);

            // Fly droplet 3 to Water source name suffix - from Soda Heating powder region
            const drop3X = sodaStartX + (cx1 + 52 - sodaStartX) * easeMorph;
            const drop3Y = sodaStartY + (centerY3 - sodaStartY) * easeMorph;
            drawWaterDrop(ctxF, drop3X, drop3Y, 9, COLOR_YELLOW);
        } else {
            // Once morph completes, fade in the numeric values
            const whiteAlpha = Math.min(1.0, (p - 0.8) / 0.1); // Fast fade in for white text
            const orangeAlpha = p < 0.88 ? 0 : Math.min(1.0, (p - 0.88) / 0.12); // Delayed fade in for orange formulas

            // Draw Coordinate Label removed per user request
            ctxF.save();
            ctxF.globalAlpha = whiteAlpha;
            ctxF.fillStyle = COLOR_WHITE;
            ctxF.font = 'bold 1.1rem sans-serif';

            // Total Mass (col 2 - cx2)
            ctxF.fillText('12.06', cx2, centerY1);
            ctxF.fillText('27.18', cx2, centerY2);
            ctxF.fillText('4.50', cx2, centerY3);

            // Oxygen Mass (col 3 - cx3)
            ctxF.fillText(`${wO1}`, cx3, centerY1);
            ctxF.fillText(`${wO2}`, cx3, centerY2);
            ctxF.fillText(`${wO3}`, cx3, centerY3);

            // Hydrogen Mass (col 4 - cx4)
            ctxF.fillText(`${wH1}`, cx4, centerY1);
            ctxF.fillText(`${wH2}`, cx4, centerY2);
            ctxF.fillText(`${wH3}`, cx4, centerY3);
            ctxF.restore();

            // 2. Draw resident droplets inside Column 1 behind names (do not disappear after landing)
            ctxF.save();
            ctxF.globalAlpha = whiteAlpha;
            drawWaterDrop(ctxF, cx1 + 45, centerY1, 7, COLOR_BLUE);
            drawWaterDrop(ctxF, cx1 + 45, centerY2, 8, COLOR_GREEN);
            drawWaterDrop(ctxF, cx1 + 52, centerY3, 6, COLOR_YELLOW);
            ctxF.restore();

            // 3. Draw orange values: division slash '/' between col(3) and col(4) at border x3, and ratio '= 8.0' in col(5)
            ctxF.save();
            ctxF.globalAlpha = orangeAlpha;
            ctxF.fillStyle = COLOR_ORANGE;
            ctxF.textAlign = 'center';

            // Render dividers - scaled by 1.5x
            ctxF.font = 'bold 1.65rem sans-serif';
            ctxF.fillText('/', x3, centerY1);
            ctxF.fillText('/', x3, centerY2);
            ctxF.fillText('/', x3, centerY3);

            // Render ratio values - normal font size
            ctxF.font = 'bold 1.1rem sans-serif';
            ctxF.fillText('= 8.0', cx5, centerY1);
            ctxF.fillText('= 8.0', cx5, centerY2);
            ctxF.fillText('= 8.0', cx5, centerY3);
            ctxF.restore();
        }

        ctxF.restore();

        // Bottom takeaway inside canvas
        ctxF.fillStyle = COLOR_GREY;
        ctxF.font = FONT_UI;
        ctxF.textAlign = 'center';
        ctxF.fillText('觀察發現：不同來源的水，其組成的質量比值恆為定值。', w / 2, cy + 122);
    }
    else if (currentStep === 7) {
        // Step 7: Proust Law Scroll (Grow-in)
        ctxF.save();
        ctxF.globalAlpha = t;

        const cyScroll = h / 2;

        drawWobblyRect(ctxF, 35, 35, w - 70, h - 70, COLOR_WHITE, true, COLOR_BLACK, 2.5, 700);
        drawWobblyRect(ctxF, 43, 43, w - 86, h - 86, COLOR_GREY, false, '', 1, 750);

        ctxF.fillStyle = COLOR_ORANGE;
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'center';
        ctxF.fillText('定比定律 (Law of Definite Proportions)', w / 2, cyScroll - 85);

        drawWobblyLine(ctxF, 60, cyScroll - 65, w - 60, cyScroll - 65, COLOR_WHITE, 1.5, 710);

        ctxF.fillStyle = COLOR_WHITE;
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'left';
        const startX = w / 2 - 145;

        // Proust Statement text
        let cx1 = startX;
        ctxF.fillText('「一種純', cx1, cyScroll - 15);
        cx1 += ctxF.measureText('「一種純').width;
        ctxF.fillStyle = COLOR_ORANGE;
        ctxF.fillText('化合物', cx1, cyScroll - 15);
        cx1 += ctxF.measureText('化合物').width;
        ctxF.fillStyle = COLOR_WHITE;
        ctxF.fillText('，不論其來源或', cx1, cyScroll - 15);

        ctxF.fillText('　製備方法為何，其組成元素', startX, cyScroll + 30);

        let cx3 = startX;
        ctxF.fillText('　之間的', cx3, cyScroll + 75);
        cx3 += ctxF.measureText('　之間的').width;
        ctxF.fillStyle = COLOR_ORANGE;
        ctxF.fillText('質量比', cx3, cyScroll + 75);
        cx3 += ctxF.measureText('質量比').width;
        ctxF.fillStyle = COLOR_WHITE;
        ctxF.fillText('恆', cx3, cyScroll + 75);
        cx3 += ctxF.measureText('恆').width;
        ctxF.fillStyle = COLOR_ORANGE;
        ctxF.fillText('為定值', cx3, cyScroll + 75);
        cx3 += ctxF.measureText('為定值').width;
        ctxF.fillStyle = COLOR_WHITE;
        ctxF.fillText('。」', cx3, cyScroll + 75);

        ctxF.fillStyle = COLOR_GREY;
        ctxF.font = FONT_UI;
        ctxF.textAlign = 'right';
        ctxF.fillText('── 普魯斯特 (Joseph Proust, 1799)', w - 70, cyScroll + 125);
        ctxF.restore();
    }
    else if (currentStep === 8) {
        // Step 8: Microscopic water molecules Grow-In (with purple highlight)
        ctxF.font = FONT_TITLE;
        const part1 = '微觀原理：';
        const part2 = '化合物的原子以固定比例結合';
        const w1 = ctxF.measureText(part1).width;
        const w2 = ctxF.measureText(part2).width;
        const startX = (w - (w1 + w2)) / 2;

        ctxF.textAlign = 'left';
        ctxF.fillStyle = COLOR_WHITE;
        ctxF.fillText(part1, startX, 45);

        ctxF.fillStyle = '#7b1fa2'; // Purple
        ctxF.fillText(part2, startX + w1, 45);

        // Easing grow-in translation scaling for 3 molecules
        const drawGrowMolecule = (mx, my, rot) => {
            ctxF.save();
            ctxF.translate(mx, my);
            ctxF.scale(t, t);
            drawWaterMolecule(ctxF, 0, 0, 22, 13, 104.5, rot);
            ctxF.restore();
        };

        drawGrowMolecule(w / 2 - 85, h / 2 - 60, -Math.PI / 6);
        drawGrowMolecule(w / 2 + 85, h / 2 - 40, Math.PI / 4);
        drawGrowMolecule(w / 2, h / 2 + 45, Math.PI + Math.PI / 8);

        ctxF.fillStyle = COLOR_GREY;
        ctxF.font = FONT_UI;
        ctxF.textAlign = 'center';
        ctxF.fillText('每個水分子 (H₂O) 恆由 2 個 H 與 1 個 O 原子結合', w / 2, h - 85);

        ctxF.font = FONT_UI;
        ctxF.fillStyle = COLOR_ORANGE;
        ctxF.fillText('原子質量比', w / 2, h - 55);
        ctxF.fillText('氧 (16) : 氫 (1) × 2 = 8 : 1', w / 2, h - 30);
    }

    ctxF.restore();
}

// -------------------------------------------------------------
// RIGHT PANEL: Light Theme Chalk Graph
// -------------------------------------------------------------
function renderGraphPanel() {
    const w = graphCanvas.width;
    const h = graphCanvas.height;
    ctxG.clearRect(0, 0, w, h);

    // Light background
    ctxG.fillStyle = COLOR_BLACK;
    ctxG.fillRect(0, 0, w, h);

    // Draw Axis System
    drawGraphAxes(w, h);

    const p = animProgress;

    const getPy = (wOVal) => {
        return (currentStep === 8) ? mapY(wOVal / 16.0, h) : mapY(wOVal, h);
    };

    // Step 5: Draw Trendline (chalk line drawing animation)
    if (currentStep >= 5) {
        const t = (currentStep === 5) ? easeInOutCubic(p) : 1;
        const startX = mapX(0, w);
        const startY = mapY(0, h);
        const endX = mapX(3.8, w);
        const isStep8 = (currentStep === 8);
        const slope = isStep8 ? 0.5 : 8.0;
        const lineColor = isStep8 ? '#7c3aed' : COLOR_ORANGE;
        const shadowColor = isStep8 ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255, 122, 0, 0.2)';
        const endY = mapY(3.8 * slope, h);

        const currentX = startX + (endX - startX) * t;
        const currentY = startY + (endY - startY) * t;

        // Translucent line for trendline with subtle drop-shadow (opacity 70%)
        ctxG.save();
        ctxG.globalAlpha = 0.7; // 定比線不透明度70
        ctxG.shadowColor = shadowColor;
        ctxG.shadowBlur = 4;
        drawWobblyLine(ctxG, startX, startY, currentX, currentY, lineColor, 4, 300);
        ctxG.restore();
    }

    // Step 2: Plot Point 1 or Flying Droplet (second half)
    if (currentStep === 2) {
        if (p > 0.1 && p < 0.7) {
            const dropT = (p - 0.1) / 0.6;
            if (dropT > 0.5) {
                const easeDrop = easeInOutCubic((dropT - 0.5) / 0.5);
                const startX = 0;
                const endX = mapX(wH1, w);
                const py = getPy(wO1);

                const dropX = startX + (endX - startX) * easeDrop;
                const dropY = py - Math.sin(easeDrop * Math.PI) * 20;
                drawWaterDrop(ctxG, dropX, dropY, 12, COLOR_BLUE);
            }
        }
    }
    if (currentStep >= 2) {
        let t = 1;
        if (currentStep === 2) {
            t = p < 0.7 ? 0 : easeOutElastic((p - 0.7) / 0.3);
        }
        const px = mapX(wH1, w);
        const py = getPy(wO1);
        drawPlotPoint(px, py, 7 * t, COLOR_BLUE);
    }

    // Step 3: Plot Point 2 or Flying Droplet (second half)
    if (currentStep === 3) {
        if (p > 0.1 && p < 0.7) {
            const dropT = (p - 0.1) / 0.6;
            if (dropT > 0.5) {
                const easeDrop = easeInOutCubic((dropT - 0.5) / 0.5);
                const startX = 0;
                const endX = mapX(wH2, w);
                const py = getPy(wO2);

                const dropX = startX + (endX - startX) * easeDrop;
                const dropY = py - Math.sin(easeDrop * Math.PI) * 20;
                drawWaterDrop(ctxG, dropX, dropY, 12, COLOR_GREEN);
            }
        }
    }
    if (currentStep >= 3) {
        let t = 1;
        if (currentStep === 3) {
            t = p < 0.7 ? 0 : easeOutElastic((p - 0.7) / 0.3);
        }
        const px = mapX(wH2, w);
        const py = getPy(wO2);
        drawPlotPoint(px, py, 7 * t, COLOR_GREEN);
    }

    // Step 4: Plot Point 3 or Flying Droplet (second half)
    if (currentStep === 4) {
        if (p > 0.1 && p < 0.7) {
            const dropT = (p - 0.1) / 0.6;
            if (dropT > 0.5) {
                const easeDrop = easeInOutCubic((dropT - 0.5) / 0.5);
                const startX = 0;
                const endX = mapX(wH3, w);
                const py = getPy(wO3);

                const dropX = startX + (endX - startX) * easeDrop;
                const dropY = py - Math.sin(easeDrop * Math.PI) * 20;
                drawWaterDrop(ctxG, dropX, dropY, 10, COLOR_YELLOW);
            }
        }
    }
    if (currentStep >= 4) {
        let t = 1;
        if (currentStep === 4) {
            t = p < 0.7 ? 0 : easeOutElastic((p - 0.7) / 0.3);
        }
        const px = mapX(wH3, w);
        const py = getPy(wO3);
        drawPlotPoint(px, py, 7 * t, COLOR_YELLOW);
    }

    // Step 6 & 7: Draw Slope Triangle (Chalk Draw-in)
    if (currentStep === 6 || currentStep === 7) {
        const t = (currentStep === 6) ? easeInOutCubic(p) : 1;
        const xVal = 2.0;
        const yVal = xVal * 8.0;

        const cx = mapX(xVal, w);
        const cy = mapY(yVal, h);
        const rx = mapX(xVal + 0.8, w);
        const ry = mapY(yVal + 0.8 * 8.0, h);

        ctxG.save();
        ctxG.globalAlpha = t;

        // Draw ΔwH and ΔwO lines step-by-step
        drawWobblyLine(ctxG, cx, cy, cx + (rx - cx) * t, cy, COLOR_WHITE, 1.5, 400);
        drawWobblyLine(ctxG, rx, cy, rx, cy + (ry - cy) * t, COLOR_WHITE, 1.5, 500);

        ctxG.fillStyle = COLOR_WHITE;
        ctxG.font = FONT_SMALL;
        ctxG.textAlign = 'center';
        ctxG.fillText('ΔwH', (cx + rx) / 2, cy + 18);
        ctxG.fillText('ΔwO', rx + 22, (cy + ry) / 2);

        ctxG.font = FONT_UI;
        ctxG.fillStyle = COLOR_ORANGE;
        ctxG.textAlign = 'left';
        ctxG.fillText('斜率 (質量比) = ΔwO / ΔwH = 8.0', margin + 20, margin + 35);

        ctxG.restore();
    }

    // Step 8: Draw Molar Slope Text
    if (currentStep === 8) {
        ctxG.save();
        ctxG.font = FONT_UI;
        ctxG.fillStyle = '#7c3aed'; // Purple
        ctxG.textAlign = 'left';
        ctxG.fillText('斜率 (莫耳數比) = nO / nH = 1/2', margin + 20, margin + 35);
        ctxG.restore();
    }
}



// Draw Graph Grid and Coordinates
function drawGraphAxes(w, h) {
    ctxG.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctxG.lineWidth = 1;
    const maxValY = (currentStep === 8) ? 2.0 : 32.0;

    for (let xVal = 0.5; xVal <= 4.0; xVal += 0.5) {
        ctxG.beginPath();
        ctxG.moveTo(mapX(xVal, w), mapY(0, h));
        ctxG.lineTo(mapX(xVal, w), mapY(maxValY, h));
        ctxG.stroke();
    }

    if (currentStep === 8) {
        for (let yVal = 0.25; yVal <= 2.0; yVal += 0.25) {
            ctxG.beginPath();
            ctxG.moveTo(mapX(0, w), mapY(yVal, h));
            ctxG.lineTo(mapX(4.0, w), mapY(yVal, h));
            ctxG.stroke();
        }
    } else {
        for (let yVal = 4; yVal <= 32; yVal += 4) {
            ctxG.beginPath();
            ctxG.moveTo(mapX(0, w), mapY(yVal, h));
            ctxG.lineTo(mapX(4.0, w), mapY(yVal, h));
            ctxG.stroke();
        }
    }

    const originX = mapX(0, w);
    const originY = mapY(0, h);

    // Draw wobbly dark axes
    drawWobblyLine(ctxG, originX, originY, mapX(4.0, w), originY, COLOR_WHITE, 2.5, 201); // X Axis
    drawWobblyLine(ctxG, originX, originY, originX, mapY(maxValY, h), COLOR_WHITE, 2.5, 202); // Y Axis

    ctxG.font = FONT_SMALL;
    ctxG.textAlign = 'center';
    for (let xVal = 1.0; xVal <= 4.0; xVal += 1.0) {
        const tx = mapX(xVal, w);
        const ty = mapY(0, h);
        drawWobblyLine(ctxG, tx, ty, tx, ty + 5, COLOR_WHITE, 1.5, 203 + xVal);
        ctxG.fillStyle = COLOR_WHITE;
        ctxG.fillText(xVal.toFixed(1), tx, ty + 18);
    }

    if (currentStep === 8) {
        ctxG.textAlign = 'right';
        for (let yVal = 0.5; yVal <= 2.0; yVal += 0.5) {
            const tx = mapX(0, w);
            const ty = mapY(yVal, h);
            drawWobblyLine(ctxG, tx, ty, tx - 5, ty, COLOR_WHITE, 1.5, 210 + yVal * 10);
            ctxG.fillStyle = COLOR_WHITE;
            ctxG.fillText(yVal.toFixed(1), tx - 10, ty + 5);
        }
    } else {
        ctxG.textAlign = 'right';
        for (let yVal = 8; yVal <= 32; yVal += 8) {
            const tx = mapX(0, w);
            const ty = mapY(yVal, h);
            drawWobblyLine(ctxG, tx, ty, tx - 5, ty, COLOR_WHITE, 1.5, 210 + yVal);
            ctxG.fillStyle = COLOR_WHITE;
            ctxG.fillText(yVal.toString(), tx - 10, ty + 5);
        }
    }

    ctxG.font = FONT_UI;
    ctxG.fillStyle = COLOR_WHITE;

    ctxG.textAlign = 'center';
    const xLabel = (currentStep === 8) ? '氫的莫耳數 nH (mol)' : '氫的質量 wH (g)';
    ctxG.fillText(xLabel, w - 100, originY + 40);

    ctxG.textAlign = 'left';
    const yLabel = (currentStep === 8) ? '氧的莫耳數 nO (mol)' : '氧的質量 wO (g)';
    ctxG.fillText(yLabel, 10, 30);

    ctxG.textAlign = 'right';
    ctxG.fillText('0', originX - 10, originY + 15);
}

function drawPlotPoint(x, y, radius, color) {
    if (radius <= 0) return;
    drawWobblyCircle(ctxG, x, y, radius, color, true, 2, x + y);
}

// -------------------------------------------------------------
// UI Drawer Components
// -------------------------------------------------------------
function drawStaticBeaker(ctx, cx, cy, r, height, label, valueText, liquidColor, dropletColor, seed) {
    ctx.beginPath();
    ctx.moveTo(cx - r, cy - height);
    ctx.lineTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx + r, cy - height);
    ctx.strokeStyle = COLOR_WHITE;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    drawWobblyLine(ctx, cx - r - 4, cy - height, cx - r, cy - height, COLOR_WHITE, 2.5, seed + 1);
    drawWobblyLine(ctx, cx + r, cy - height, cx + r + 2, cy - height, COLOR_WHITE, 2.5, seed + 2);

    ctx.fillStyle = liquidColor;
    ctx.fillRect(cx - r + 3, cy - height * 0.5, r * 2 - 6, height * 0.5 - 3);

    ctx.fillStyle = COLOR_WHITE;
    ctx.font = FONT_SMALL;
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + 20);

    if (valueText) {
        ctx.save();
        ctx.font = '0.85rem sans-serif';
        ctx.fillStyle = COLOR_GREY;
        ctx.fillText(valueText, cx, cy + 38);
        ctx.restore();
    }

    drawWaterDrop(ctx, cx, cy - height - 20, 10, dropletColor);
}

function drawWaterDrop(ctx, x, y, r, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';

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
    const dist = rO + rH + 4;
    const h1x = cx + dist * Math.cos(rotAngle - angleRad / 2);
    const h1y = cy + dist * Math.sin(rotAngle - angleRad / 2);
    const h2x = cx + dist * Math.cos(rotAngle + angleRad / 2);
    const h2y = cy + dist * Math.sin(rotAngle + angleRad / 2);

    drawWobblyLine(ctx, cx, cy, h1x, h1y, COLOR_GREY, 2.5, cx + cy);
    drawWobblyLine(ctx, cx, cy, h2x, h2y, COLOR_GREY, 2.5, cx - cy);

    // Oxygen - Red atom
    drawWobblyCircle(ctx, cx, cy, rO, COLOR_RED, true, 2, cx);
    drawWobblyCircle(ctx, cx, cy, rO, COLOR_WHITE, false, 2, cx);
    ctx.fillStyle = '#ffffff';
    ctx.font = FONT_UI;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('O', cx, cy + 5);

    // Hydrogen 1 - White atom
    drawWobblyCircle(ctx, h1x, h1y, rH, '#ffffff', true, 1.5, h1x);
    drawWobblyCircle(ctx, h1x, h1y, rH, COLOR_WHITE, false, 1.5, h1x);
    ctx.fillStyle = COLOR_WHITE;
    ctx.font = FONT_SMALL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', h1x, h1y + 4);

    // Hydrogen 2 - White atom
    drawWobblyCircle(ctx, h2x, h2y, rH, '#ffffff', true, 1.5, h2x);
    drawWobblyCircle(ctx, h2x, h2y, rH, COLOR_WHITE, false, 1.5, h2x);
    ctx.fillStyle = COLOR_WHITE;
    ctx.font = FONT_SMALL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', h2x, h2y + 4);
}

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    if (stepParam) {
        const step = parseInt(stepParam, 10);
        if (step >= 1 && step <= totalSteps) {
            currentStep = step;
        }
    }
    generateRandomValues();
    resizeCanvases();
    updateUI();
    drawLoop(); // Run frame animation rendering constantly
};

window.onresize = () => {
    resizeCanvases();
};
