// Canvas & UI Setup
const flaskCanvas = document.getElementById('flaskCanvas');
const graphCanvas = document.getElementById('graphCanvas');
const ctxF = flaskCanvas.getContext('2d');
const ctxG = graphCanvas.getContext('2d');

// Font Configuration (Clean system fonts matching index.html reversion)
const FONT_UI = 'bold 1.15rem sans-serif';
const FONT_TITLE = 'bold 1.35rem sans-serif';
const FONT_SMALL = '0.95rem sans-serif';
const FONT_MATH = 'bold italic 1.15rem "EB Garamond", serif';

// Navigation State
let currentStep = 1;
const totalSteps = 14;
let animProgress = 0; // 0 → 1 per step

function easeInOutCubic(t) {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
}

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

// Draw a wobbly rectangle
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

// Draw a wobbly circle
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

// Helper to draw vertical brackets
function drawVerticalBracket(ctx, x, y1, y2, color, alignLeft = true) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const ym = (y1 + y2) / 2;
    const dir = alignLeft ? -1 : 1;
    // Draw top half arc
    ctx.moveTo(x, y1);
    ctx.quadraticCurveTo(x + dir * 6, y1 + (ym - y1) * 0.1, x + dir * 6, y1 + (ym - y1) * 0.5);
    ctx.quadraticCurveTo(x + dir * 6, ym - 2, x + dir * 12, ym);
    // Draw bottom half arc
    ctx.moveTo(x, y2);
    ctx.quadraticCurveTo(x + dir * 6, y2 - (y2 - ym) * 0.1, x + dir * 6, y2 - (y2 - ym) * 0.5);
    ctx.quadraticCurveTo(x + dir * 6, ym + 2, x + dir * 12, ym);
    ctx.stroke();
    ctx.restore();
}

// Helper to draw horizontal brackets
function drawHorizontalBracket(ctx, x1, x2, y, color, alignTop = false) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const xm = (x1 + x2) / 2;
    const dir = alignTop ? -1 : 1;
    // Left half
    ctx.moveTo(x1, y);
    ctx.quadraticCurveTo(x1 + (xm - x1) * 0.1, y + dir * 6, x1 + (xm - x1) * 0.5, y + dir * 6);
    ctx.quadraticCurveTo(xm - 2, y + dir * 6, xm, y + dir * 12);
    // Right half
    ctx.moveTo(x2, y);
    ctx.quadraticCurveTo(x2 - (x2 - xm) * 0.1, y + dir * 6, x2 - (x2 - xm) * 0.5, y + dir * 6);
    ctx.quadraticCurveTo(xm + 2, y + dir * 6, xm, y + dir * 12);
    ctx.stroke();
    ctx.restore();
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
        title: "第一步：建立質量關係座標系",
        desc: "以氫（H）與氧（O）組成的化合物為例。我們繪製一個座標圖，以氧的質量 wO 為 Y 軸，以氫的質量 wH 為 X 軸，用以探討兩種化合物之間的質量比例關係。",
        takeaway: "重點：用座標系可以直觀地分析不同化合物中兩種元素的質量定量關係。"
    },
    {
        title: "第二步：標記化合物 I 數據點",
        desc: "分析第一種氫氧化合物（即水，此處以「化合物 I」表示）的實驗分析數據：當氫為 2.5g 時，氧為 20.0g。我們在座標圖上點出這一個代表點。",
        takeaway: "重點：此數據點反映了化合物 I 的實測氫氧質量比值關係。"
    },
    {
        title: "第三步：繪製化合物 I 質量關係線",
        desc: "根據定比定律，對於化合物 I 而言，其不同大小樣本的氫氧質量比恆為定值。我們從原點向數據點繪製出一條質量關係線，斜率即為 8.0（即 wO = 8 × wH）。",
        takeaway: "重點：定比定律在座標圖上表現為一條斜率為 8.0 且通過原點的直線。"
    },
    {
        title: "第四步：標記化合物 II 數據點",
        desc: "加入第二種不同的氫氧化合物（即雙氧水，此處以「化合物 II」表示）。分析其實驗數據：當氫為 1.5g 時，氧為 24.0g。我們在座標圖上點出這一個代表點。",
        takeaway: "重點：化合物 II 的實驗分析點 (1.5g, 24.0g) 與化合物 I 具有完全不同的絕對質量數據。"
    },
    {
        title: "第五步：繪製化合物 II 質量關係線",
        desc: "同樣根據定比定律，我們從原點向化合物 II 的數據點繪製出一條質量關係線，斜率為 24.0 / 1.5 = 16.0（即 wO = 16 × wH）。",
        takeaway: "重點：不同的化合物有不同的定比關係線（y = 16x），代表不同的質量比例。"
    },
    {
        title: "第六步：固定氫質量（劃垂直線）",
        desc: "劃一條垂直線固定氫的質量（例如 wH = 1.0g，避開實驗數據點）。此時在兩條關係直線上，對應的氫元素質量均相同。",
        takeaway: "重點：此時兩化合物中被分析樣本的氫質量均相同。"
    },
    {
        title: "第七步：氫等重下的氧質量比",
        desc: "當氫質量固定在 1.0g 時，化合物 II 的氧為 16.0g，化合物 I 的氧為 8.0g。兩者的氧質量比呈現簡單整數比 (16.0 : 8.0 = 2 : 1)。",
        takeaway: "重點：固定氫的質量相同時，兩化合物中的氧質量比為簡單整數比 2 : 1。"
    },
    {
        title: "第八步：固定氧質量（劃水平線）",
        desc: "移除垂直線，改劃一條水平線固定氧的質量（例如 wO = 16.0g，避開實驗數據點）。此時在兩條關係直線上，對應的氧元素質量均相同。",
        takeaway: "重點：此時兩化合物中被分析樣本的氧質量均相同。"
    },
    {
        title: "第九步：氧等重下的氫質量比",
        desc: "當氧質量固定在 16.0g 時，化合物 I 的氫為 2.0g，化合物 II 的氫為 1.0g。兩者的氫質量比呈現簡單整數比 (2.0 : 1.0 = 2 : 1)。",
        takeaway: "重點：固定氧的質量相同時，兩化合物中的氫質量比同樣為簡單整數比 2 : 1。"
    },
    {
        title: "第十步：倍比定律的宣告",
        desc: "這就是著名的「倍比定律」：當甲、乙兩元素結合生成兩種以上的化合物時，若固定甲元素的質量，則各化合物中乙元素的質量將呈現簡單的整數比。",
        takeaway: "重點：倍比定律 ── 由道耳頓於 1803 年提出，是原子論建立的重要定量基石。"
    },
    {
        title: "第十一步：倍比定律與原子說的關係",
        desc: "道耳頓用原子說完美解釋了這個現象：兩物質若含有相同質量的氧，代表兩者在微觀上擁有相同數量的氧原子。此時不同的氫質量，正是由不同數量的氫原子所造成的。",
        takeaway: "重點：等質量的元素在微觀上代表相同數量的原子。"
    },
    {
        title: "第十二步：化學式中原子數的假設",
        desc: "既然等重的氧原子數量相同，我們可以大膽假設這兩個化合物在化學式中都只含有 1 個氧原子，即化學式分別為 HₓO 與 H_yO。",
        takeaway: "重點：假設兩者氧原子數皆為 1，此時 H 原子數的比值將直接對應其實驗質量比。"
    },
    {
        title: "第十三步：氫原子數量與質量比的對應",
        desc: "在此假設下，等重氧時的氫質量比為 2 : 1，這直接反映出兩者所含的氫原子個數比亦為 2 : 1（即 x : y = 2 : 1）。這代表化合物 I 中的氫原子數量是化合物 II 的 2 倍。",
        takeaway: "重點：原子數比 (x : y) = 質量比 = 2 : 1。"
    },
    {
        title: "第十四步：推導兩化合物之化學式",
        desc: "已知化合物 I（水）的化學式為 H₂O（即氧為 1 時氫為 2，x = 2）。由於個數比為 2 : 1，可推知化合物 II 中氫原子數為 1 (y = 1)。因此化合物 II 的最簡式為 HO，化學式為 H₂O₂（雙氧水）。",
        takeaway: "重點：確定其中一個化合物的化學式，即可確定另一個化合物的化學式關係！"
    }
];

// Resize and draw loop
function resizeCanvases() {
    const pF = flaskCanvas.parentElement;
    flaskCanvas.width = pF.clientWidth;
    flaskCanvas.height = pF.clientHeight;
    
    const pG = graphCanvas.parentElement;
    graphCanvas.width = pG.clientWidth;
    graphCanvas.height = pG.clientHeight;
}

window.onload = () => {
    resizeCanvases();
    updateUI();
    if (document.fonts) {
        document.fonts.ready.then(() => {
            drawLoop();
        });
    } else {
        drawLoop();
    }
};

window.onresize = () => {
    resizeCanvases();
    drawLoop();
};

function updateUI() {
    // Page header indicator
    document.getElementById('soil-page-num').innerText = String(currentStep).padStart(2, '0');
    
    // Step Title & Description
    const currentData = stepTexts[currentStep - 1];
    document.getElementById('step-title').innerText = currentData.title;
    document.getElementById('step-desc').innerText = currentData.desc;
    document.getElementById('takeaway-text').innerText = currentData.takeaway;
    document.getElementById('step-indicator').innerText = `步驟 ${currentStep} / ${totalSteps}`;
    
    // Mass board visibility
    const massBoard = document.getElementById('mass-board');
    if (currentStep >= 2) {
        massBoard.classList.remove('hidden');
        
        // Update mass board details dynamically
        const boardH1 = document.getElementById('board-h1');
        const boardO1 = document.getElementById('board-o1');
        const boardH2 = document.getElementById('board-h2');
        const boardO2 = document.getElementById('board-o2');
        
        boardH1.innerText = "2.5";
        boardO1.innerText = "20.0";
        
        if (currentStep >= 4) {
            boardH2.parentElement.style.opacity = "1";
            boardH2.innerText = "1.5";
            boardO2.innerText = "24.0";
        } else {
            boardH2.parentElement.style.opacity = "0";
        }
    } else {
        massBoard.classList.add('hidden');
    }
    
    // Legend Items active highlighting
    const items = document.querySelectorAll('.legend-item');
    items.forEach((item, index) => {
        const id = index + 1;
        let visible = false;
        if (id === 1 && currentStep >= 2) visible = true;
        if (id === 2 && currentStep >= 4) visible = true;
        if (id === 3 && (currentStep === 6 || currentStep === 7)) visible = true;
        if (id === 4 && (currentStep === 8 || currentStep === 9)) visible = true;
        
        if (visible) {
            item.classList.add('visible');
        } else {
            item.classList.remove('visible');
        }
    });
}

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        animProgress = 0;
        updateUI();
        startAnimLoop();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        animProgress = 0;
        updateUI();
        startAnimLoop();
    }
}

let _animLoopId = null;
function startAnimLoop() {
    if (_animLoopId) cancelAnimationFrame(_animLoopId);
    function loop() {
        if (animProgress < 1.0) {
            animProgress = Math.min(1.0, animProgress + 0.018);
            drawLoop();
            _animLoopId = requestAnimationFrame(loop);
        } else {
            drawLoop(); // final frame
        }
    }
    _animLoopId = requestAnimationFrame(loop);
}

function drawLoop() {
    drawLeftPanel();
    drawRightPanel();
}

// DRAW LEFT PANEL (SCHEMATICS)
function drawLeftPanel() {
    const w = flaskCanvas.width;
    const h = flaskCanvas.height;
    ctxF.clearRect(0, 0, w, h);
    
    // Global styling config
    ctxF.strokeStyle = '#2b2b2b';
    ctxF.fillStyle = '#1f1f1f';
    
    if (currentStep === 1) {
        // Step 1: Chalkboard banner
        ctxF.save();
        drawWobblyRect(ctxF, 30, 40, w - 60, h - 80, '#2b2b2b', true, '#faf8f5', 3, 20);
        ctxF.fillStyle = '#2b2b2b';
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'center';
        ctxF.fillText('倍比定律互動學習', w / 2, h / 2 - 10);
        ctxF.font = FONT_SMALL;
        ctxF.fillStyle = '#5f5f5f';
        ctxF.fillText('點擊下方「下一步」開始推導', w / 2, h / 2 + 25);
        ctxF.restore();
    }
    else if (currentStep === 2 || currentStep === 3) {
        // Step 2-3: Show Compound I container centered (Step 3 is identical to Step 2)
        ctxF.save();
        
        // Slower fade-in on step 2, keep fully visible on step 3
        const alpha = (currentStep === 2) ? easeInOutCubic(animProgress) : 1;
        ctxF.globalAlpha = alpha;

        drawWobblyRect(ctxF, 40, 40, w - 80, h - 80, '#2b2b2b', true, '#ffffff', 2, 35);

        // Beaker geometry — same size as Steps 4-5 (50x60)
        const bW = 50, bH = 60;
        const targetCX = w / 2;
        const by = h / 2 - 40;
        const bx = targetCX - bW / 2;

        drawWobblyLine(ctxF, bx, by, bx, by + bH, '#2b2b2b', 2.5, 40);
        drawWobblyLine(ctxF, bx, by + bH, bx + bW, by + bH, '#2b2b2b', 2.5, 41);
        drawWobblyLine(ctxF, bx + bW, by + bH, bx + bW, by, '#2b2b2b', 2.5, 42);
        ctxF.fillStyle = 'rgba(255, 122, 0, 0.15)';
        ctxF.fillRect(bx + 3, by + 20, bW - 6, 38);
        drawWobblyLine(ctxF, bx + 1, by + 20, bx + bW - 1, by + 20, '#ff7a00', 1.5, 43);

        // Label above beaker, data below — matching Step 4 layout
        ctxF.fillStyle = '#ff7a00'; // Colored Compound I title (Orange)
        ctxF.font = FONT_UI;
        ctxF.textAlign = 'center';
        ctxF.fillText('化合物 I（水）', targetCX, by - 15);
        ctxF.fillStyle = '#1f1f1f'; // Restore color for following texts
        const lW = Math.max(ctxF.measureText('H').width, ctxF.measureText('O').width);
        const vW = Math.max(ctxF.measureText(' = 2.5 g').width, ctxF.measureText(' = 20.0 g').width);
        const piv = targetCX - vW / 2 + lW / 2;
        ctxF.textAlign = 'right';
        ctxF.fillText('H', piv, by + bH + 25);
        ctxF.textAlign = 'left';
        ctxF.fillText(' = 2.5 g', piv, by + bH + 25);
        ctxF.textAlign = 'right';
        ctxF.fillText('O', piv, by + bH + 48);
        ctxF.textAlign = 'left';
        ctxF.fillText(' = 20.0 g', piv, by + bH + 48);

        ctxF.restore();
    }
    else if (currentStep === 4 || currentStep === 5) {
        // Step 4-5: Compound I slides from w/2 to w/4, Compound II (right) fades in
        ctxF.save();
        drawWobblyRect(ctxF, 30, 40, w - 60, h - 80, '#2b2b2b', true, '#ffffff', 2, 50);

        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'left';
        ctxF.fillStyle = '#1f1f1f';
        ctxF.fillText('多種化合物的組成比', 50, 75);

        const bW = 50, bH = 60;
        const by = h / 2 - 40;

        // Compound I — slides from w/2 to w/4 during Step 4 transition
        const startCX = w / 2;
        const endCX = w / 4;
        const t1 = (currentStep === 4) ? easeInOutCubic(animProgress) : 1;
        const cx1 = startCX + (endCX - startCX) * t1;

        let bx1 = cx1 - bW / 2;
        drawWobblyLine(ctxF, bx1, by, bx1, by + bH, '#2b2b2b', 2.5, 60);
        drawWobblyLine(ctxF, bx1, by + bH, bx1 + bW, by + bH, '#2b2b2b', 2.5, 61);
        drawWobblyLine(ctxF, bx1 + bW, by + bH, bx1 + bW, by, '#2b2b2b', 2.5, 62);
        ctxF.fillStyle = 'rgba(255, 122, 0, 0.15)';
        ctxF.fillRect(bx1 + 3, by + 20, bW - 6, 38);
        drawWobblyLine(ctxF, bx1 + 1, by + 20, bx1 + bW - 1, by + 20, '#ff7a00', 1.5, 63);
        
        // Draw Compound I label above beaker
        ctxF.fillStyle = '#ff7a00'; // Colored Compound I title (Orange)
        ctxF.font = FONT_UI;
        ctxF.textAlign = 'center';
        ctxF.fillText('化合物 I（水）', cx1, by - 15);
        ctxF.fillStyle = '#1f1f1f'; // Restore color for following texts
        
        // Two-column data block, centered under Compound I beaker
        const labelColW1 = Math.max(ctxF.measureText('H').width, ctxF.measureText('O').width);
        const valColW1   = Math.max(ctxF.measureText(' = 2.5 g').width, ctxF.measureText(' = 20.0 g').width);
        const pivot1 = cx1 - valColW1 / 2 + labelColW1 / 2;
        ctxF.textAlign = 'right';
        ctxF.fillText('H', pivot1, by + bH + 25);
        ctxF.textAlign = 'left';
        ctxF.fillText(' = 2.5 g', pivot1, by + bH + 25);
        ctxF.textAlign = 'right';
        ctxF.fillText('O', pivot1, by + bH + 48);
        ctxF.textAlign = 'left';
        ctxF.fillText(' = 20.0 g', pivot1, by + bH + 48);

        // Draw Compound II (Right side) — beaker centered at 3w/4, fades in on Step 4
        const cx2 = (w * 3) / 4;
        const alpha4 = (currentStep === 4) ? easeInOutCubic(animProgress) : 1;
        ctxF.globalAlpha = alpha4;
        let bx2 = cx2 - bW / 2;
        drawWobblyLine(ctxF, bx2, by, bx2, by + bH, '#2b2b2b', 2.5, 70);
        drawWobblyLine(ctxF, bx2, by + bH, bx2 + bW, by + bH, '#2b2b2b', 2.5, 71);
        drawWobblyLine(ctxF, bx2 + bW, by + bH, bx2 + bW, by, '#2b2b2b', 2.5, 72);
        ctxF.fillStyle = 'rgba(124, 58, 237, 0.15)';
        ctxF.fillRect(bx2 + 3, by + 20, bW - 6, 38);
        drawWobblyLine(ctxF, bx2 + 1, by + 20, bx2 + bW - 1, by + 20, '#7c3aed', 1.5, 73);
        
        // Draw Compound II label above beaker
        ctxF.fillStyle = '#7c3aed'; // Colored Compound II title (Purple)
        ctxF.font = FONT_UI;
        ctxF.textAlign = 'center';
        ctxF.fillText('化合物 II（雙氧水）', cx2, by - 15);
        ctxF.fillStyle = '#1f1f1f'; // Restore color for following texts
        
        // Two-column data block, centered under Compound II beaker
        const labelColW2 = Math.max(ctxF.measureText('H').width, ctxF.measureText('O').width);
        const valColW2   = Math.max(ctxF.measureText(' = 1.5 g').width, ctxF.measureText(' = 24.0 g').width);
        const pivot2 = cx2 - valColW2 / 2 + labelColW2 / 2;
        ctxF.textAlign = 'right';
        ctxF.fillText('H', pivot2, by + bH + 25);
        ctxF.textAlign = 'left';
        ctxF.fillText(' = 1.5 g', pivot2, by + bH + 25);
        ctxF.textAlign = 'right';
        ctxF.fillText('O', pivot2, by + bH + 48);
        ctxF.textAlign = 'left';
        ctxF.fillText(' = 24.0 g', pivot2, by + bH + 48);
        ctxF.globalAlpha = 1;

        ctxF.restore();
    }
    else if (currentStep === 6 || currentStep === 7) {
        // Step 6 & 7: Equal hydrogen comparison
        ctxF.save();
        drawWobblyRect(ctxF, 30, 40, w - 60, h - 80, '#2b2b2b', true, '#ffffff', 2, 80);

        const cx1 = w / 4;
        const cx2 = (w * 3) / 4;
        const cy = h / 2 + 15; // Shifted downward (atoms and texts shift down)
        const atomR_H = 15, atomR_O = 20;

        // FONT_TITLE header at the top
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'left';
        ctxF.fillStyle = '#1f1f1f';
        ctxF.fillText('元素質量與原子數量關係', 50, 75);

        // Transition progress for Step 6
        const t6 = (currentStep === 6) ? easeInOutCubic(animProgress) : 1;

        // Draw static labels Compound I and II at the top (matching Step 4-5) without sliding up
        ctxF.font = FONT_UI;
        ctxF.textAlign = 'center';
        const labelY = h / 2 - 55;
        ctxF.fillStyle = '#ff7a00'; // Colored Compound I title (Orange)
        ctxF.fillText('化合物 I（水）', cx1, labelY);
        ctxF.fillStyle = '#7c3aed'; // Colored Compound II title (Purple)
        ctxF.fillText('化合物 II（雙氧水）', cx2, labelY);

        // Draw horizontal separator line to separate top (equal H) and bottom (O ratio) sections
        const lineAlpha = (currentStep === 6) ? t6 : 1.0;
        ctxF.save();
        ctxF.globalAlpha = lineAlpha;
        drawWobblyLine(ctxF, 50, cy + 24, w - 50, cy + 24, '#d1d5db', 1.5, 300);
        ctxF.restore();

        // 1. Draw fading-out beakers during Step 6 entry transition (Pure fade, no sliding)
        if (currentStep === 6 && t6 < 1.0) {
            ctxF.save();
            ctxF.globalAlpha = 1 - t6;
            const bW = 50, bH = 60;
            const byOffset = h / 2 - 40; // Static position, no sliding
            
            // Compound I beaker
            const bx1 = w / 4 - bW / 2;
            drawWobblyLine(ctxF, bx1, byOffset, bx1, byOffset + bH, '#2b2b2b', 2.5, 60);
            drawWobblyLine(ctxF, bx1, byOffset + bH, bx1 + bW, byOffset + bH, '#2b2b2b', 2.5, 61);
            drawWobblyLine(ctxF, bx1 + bW, byOffset + bH, bx1 + bW, byOffset, '#2b2b2b', 2.5, 62);
            ctxF.fillStyle = 'rgba(255, 122, 0, 0.15)';
            ctxF.fillRect(bx1 + 3, byOffset + 20, bW - 6, 38);
            drawWobblyLine(ctxF, bx1 + 1, byOffset + 20, bx1 + bW - 1, byOffset + 20, '#ff7a00', 1.5, 63);
            
            // Compound II beaker
            const bx2 = (w * 3) / 4 - bW / 2;
            drawWobblyLine(ctxF, bx2, byOffset, bx2, byOffset + bH, '#2b2b2b', 2.5, 70);
            drawWobblyLine(ctxF, bx2, byOffset + bH, bx2 + bW, byOffset + bH, '#2b2b2b', 2.5, 71);
            drawWobblyLine(ctxF, bx2 + bW, byOffset + bH, bx2 + bW, byOffset, '#2b2b2b', 2.5, 72);
            ctxF.fillStyle = 'rgba(124, 58, 237, 0.15)';
            ctxF.fillRect(bx2 + 3, byOffset + 20, bW - 6, 38);
            drawWobblyLine(ctxF, bx2 + 1, byOffset + 20, bx2 + bW - 1, byOffset + 20, '#7c3aed', 1.5, 73);
            ctxF.restore();
        }

        // Draw micro comparison details (fading in but static at cy on Step 6)
        ctxF.save();
        ctxF.globalAlpha = t6;
        const currentCy = cy; // Static position, no sliding

        // Compound I — H atom (White fill, wobbly black outline, black text)
        drawWobblyCircle(ctxF, cx1, currentCy - 20, atomR_H, '#ffffff', true, 2, 81);
        drawWobblyCircle(ctxF, cx1, currentCy - 20, atomR_H, '#2b2b2b', false, 2, 81);
        ctxF.fillStyle = '#2b2b2b';
        ctxF.font = 'bold 0.95rem sans-serif';
        ctxF.textAlign = 'center';
        ctxF.fillText('H', cx1, currentCy - 16);
        
        // Compound II — H atom (White fill, wobbly black outline, black text)
        drawWobblyCircle(ctxF, cx2, currentCy - 20, atomR_H, '#ffffff', true, 2, 83);
        drawWobblyCircle(ctxF, cx2, currentCy - 20, atomR_H, '#2b2b2b', false, 2, 83);
        ctxF.fillStyle = '#2b2b2b';
        ctxF.font = 'bold 0.95rem sans-serif';
        ctxF.textAlign = 'center';
        ctxF.fillText('H', cx2, currentCy - 16);
        ctxF.restore();

        // 2. Fade in O atoms in Step 7
        if (currentStep === 7) {
            ctxF.save();
            const alpha7 = easeInOutCubic(animProgress);
            ctxF.globalAlpha = alpha7;
            
            // Compound I — O atom (Red fill, wobbly black outline, white text)
            drawWobblyCircle(ctxF, cx1, cy + 58, atomR_O, '#ef4444', true, 2, 82);
            drawWobblyCircle(ctxF, cx1, cy + 58, atomR_O, '#2b2b2b', false, 2, 82);
            ctxF.fillStyle = '#ffffff';
            ctxF.font = 'bold 1.15rem sans-serif';
            ctxF.textAlign = 'center';
            ctxF.fillText('O', cx1, cy + 63);
            
            // Compound II — 2 O atoms (Horizontally arranged: first at cx2, second at cx2+36)
            drawWobblyCircle(ctxF, cx2, cy + 58, atomR_O, '#ef4444', true, 2, 84);
            drawWobblyCircle(ctxF, cx2, cy + 58, atomR_O, '#2b2b2b', false, 2, 84);
            ctxF.fillStyle = '#ffffff';
            ctxF.font = 'bold 1.15rem sans-serif';
            ctxF.textAlign = 'center';
            ctxF.fillText('O', cx2, cy + 63);
            drawWobblyCircle(ctxF, cx2 + 36, cy + 58, atomR_O, '#ef4444', true, 2, 85);
            drawWobblyCircle(ctxF, cx2 + 36, cy + 58, atomR_O, '#2b2b2b', false, 2, 85);
            ctxF.fillStyle = '#ffffff';
            ctxF.fillText('O', cx2 + 36, cy + 63);
            
            ctxF.restore();
        }

        // 3. Draw middle text descriptions (H is at cy-25/cy-5, O is at cy+53/cy+73)
        if (currentStep === 6) {
            ctxF.save();
            ctxF.globalAlpha = t6;
            ctxF.font = FONT_UI;
            ctxF.fillStyle = '#2563eb'; // Blue
            ctxF.textAlign = 'center';
            ctxF.fillText('H 重量相同', w / 2, cy - 25);
            ctxF.font = FONT_SMALL;
            ctxF.fillText('表示應有相同數量的 H 原子', w / 2, cy - 5);
            ctxF.restore();
        }
        else if (currentStep === 7) {
            const alpha7 = easeInOutCubic(animProgress);
            
            ctxF.save();
            // Step 6 text remains visible in blue at same position
            ctxF.font = FONT_UI;
            ctxF.fillStyle = '#2563eb'; // Blue
            ctxF.textAlign = 'center';
            ctxF.fillText('H 重量相同', w / 2, cy - 25);
            ctxF.font = FONT_SMALL;
            ctxF.fillText('表示應有相同數量的 H 原子', w / 2, cy - 5);
            ctxF.restore();

            // Red/green O weight ratio text at cy + 53 - Fades in!
            ctxF.save();
            ctxF.globalAlpha = alpha7; // Apply fade-in to O weight ratio text
            
            const text1 = "O 原子重量比為 ";
            const text2 = "1";
            const text3 = " : ";
            const text4 = "2";
            ctxF.font = FONT_UI;
            const w1 = ctxF.measureText(text1).width;
            const w2 = ctxF.measureText(text2).width;
            const w3 = ctxF.measureText(text3).width;
            const w4 = ctxF.measureText(text4).width;
            const totalW = w1 + w2 + w3 + w4;
            let startX = w / 2 - totalW / 2;

            ctxF.textAlign = 'left';
            ctxF.fillStyle = '#1f1f1f'; // Unified text color
            ctxF.fillText(text1, startX, cy + 53);
            startX += w1;
            ctxF.fillStyle = '#ef4444'; // Red
            ctxF.fillText(text2, startX, cy + 53);
            startX += w2;
            ctxF.fillStyle = '#1f1f1f'; // Unified text color
            ctxF.fillText(text3, startX, cy + 53);
            startX += w3;
            ctxF.fillStyle = '#10b981'; // Green
            ctxF.fillText(text4, startX, cy + 53);

            // Represent O atoms ratio is also 1 : 2 at cy + 73
            const text6 = "表示 O 原子的數量也是 ";
            const text7 = "1";
            const text8 = " : ";
            const text9 = "2";
            ctxF.font = FONT_SMALL;
            const w6 = ctxF.measureText(text6).width;
            const w7 = ctxF.measureText(text7).width;
            const w8 = ctxF.measureText(text8).width;
            const w9 = ctxF.measureText(text9).width;
            const totalW2 = w6 + w7 + w8 + w9;
            let startX2 = w / 2 - totalW2 / 2;

            ctxF.fillStyle = '#1f1f1f'; // Unified text color
            ctxF.fillText(text6, startX2, cy + 73);
            startX2 += w6;
            ctxF.fillStyle = '#ef4444'; // Red
            ctxF.fillText(text7, startX2, cy + 73);
            startX2 += w7;
            ctxF.fillStyle = '#1f1f1f'; // Unified text color
            ctxF.fillText(text8, startX2, cy + 73);
            startX2 += w8;
            ctxF.fillStyle = '#10b981'; // Green
            ctxF.fillText(text9, startX2, cy + 73);

            ctxF.restore();
        }

        ctxF.restore();
    }
    else if (currentStep === 8 || currentStep === 9) {
        // Step 8 & 9: Equal oxygen comparison
        ctxF.save();
        drawWobblyRect(ctxF, 30, 40, w - 60, h - 80, '#2b2b2b', true, '#ffffff', 2, 90);

        const cx1 = w / 4;
        const cx2 = (w * 3) / 4;
        const cy = h / 2 + 15; // Shifted downward (atoms and texts shift down)
        const atomR_H = 15, atomR_O = 20;

        // FONT_TITLE header at the top
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'left';
        ctxF.fillStyle = '#1f1f1f';
        ctxF.fillText('元素質量與原子數量關係', 50, 75);

        // Draw static labels Compound I and II at the top, matching Step 4-5
        ctxF.font = FONT_UI;
        ctxF.textAlign = 'center';
        ctxF.fillStyle = '#ff7a00'; // Colored Compound I title (Orange)
        ctxF.fillText('化合物 I（水）', cx1, h / 2 - 55);
        ctxF.fillStyle = '#7c3aed'; // Colored Compound II title (Purple)
        ctxF.fillText('化合物 II（雙氧水）', cx2, h / 2 - 55);

        // Draw horizontal separator line to separate top (equal O) and bottom (H ratio) sections
        ctxF.save();
        drawWobblyLine(ctxF, 50, cy + 24, w - 50, cy + 24, '#d1d5db', 1.5, 300);
        ctxF.restore();

        // Compound I — H atoms fade in during Step 9 (Horizontally arranged: cx1-28 and cx1 at cy+58)
        if (currentStep === 9) {
            ctxF.save();
            ctxF.globalAlpha = easeInOutCubic(animProgress);
            drawWobblyCircle(ctxF, cx1 - 28, cy + 58, atomR_H, '#ffffff', true, 2, 91);
            drawWobblyCircle(ctxF, cx1 - 28, cy + 58, atomR_H, '#2b2b2b', false, 2, 91);
            ctxF.fillStyle = '#2b2b2b';
            ctxF.font = 'bold 0.95rem sans-serif';
            ctxF.textAlign = 'center';
            ctxF.fillText('H', cx1 - 28, cy + 62);
            drawWobblyCircle(ctxF, cx1, cy + 58, atomR_H, '#ffffff', true, 2, 92);
            drawWobblyCircle(ctxF, cx1, cy + 58, atomR_H, '#2b2b2b', false, 2, 92);
            ctxF.fillStyle = '#2b2b2b';
            ctxF.fillText('H', cx1, cy + 62);
            ctxF.restore();
        }
        
        // t8 must be declared before alpha8_O to avoid TDZ error
        const t8 = (currentStep === 8) ? easeInOutCubic(animProgress) : 1;

        // Compound I — O atom (Red fill, black outline, white text) — now at the TOP (cy - 20)
        ctxF.save();
        const alpha8_O = t8; // fade in on Step 8 entry, stays at 1 on Step 9
        ctxF.globalAlpha = alpha8_O;
        drawWobblyCircle(ctxF, cx1, cy - 20, atomR_O, '#ef4444', true, 2, 93);
        drawWobblyCircle(ctxF, cx1, cy - 20, atomR_O, '#2b2b2b', false, 2, 93);
        ctxF.fillStyle = '#ffffff';
        ctxF.font = 'bold 1.15rem sans-serif';
        ctxF.textAlign = 'center';
        ctxF.fillText('O', cx1, cy - 15);
        ctxF.restore();

        // Compound II — H atom fades in during Step 9 (White fill, black outline, black text) — now at the BOTTOM (cy + 58)
        if (currentStep === 9) {
            ctxF.save();
            ctxF.globalAlpha = easeInOutCubic(animProgress);
            drawWobblyCircle(ctxF, cx2, cy + 58, atomR_H, '#ffffff', true, 2, 94);
            drawWobblyCircle(ctxF, cx2, cy + 58, atomR_H, '#2b2b2b', false, 2, 94);
            ctxF.fillStyle = '#2b2b2b';
            ctxF.font = 'bold 0.95rem sans-serif';
            ctxF.textAlign = 'center';
            ctxF.fillText('H', cx2, cy + 62);
            ctxF.restore();
        }
        
        // Compound II — O atom (Red fill, black outline, white text) — now at the TOP (cy - 20)
        ctxF.save();
        ctxF.globalAlpha = alpha8_O;
        drawWobblyCircle(ctxF, cx2, cy - 20, atomR_O, '#ef4444', true, 2, 95);
        drawWobblyCircle(ctxF, cx2, cy - 20, atomR_O, '#2b2b2b', false, 2, 95);
        ctxF.fillStyle = '#ffffff';
        ctxF.font = 'bold 1.15rem sans-serif';
        ctxF.textAlign = 'center';
        ctxF.fillText('O', cx2, cy - 15);
        ctxF.restore();

        // 2. Dissolve fading-out Step 7 text and bottom O atoms during Step 8 entry transition
        if (currentStep === 8 && t8 < 1.0) {
            ctxF.save();
            ctxF.globalAlpha = 1 - t8;
            
            // Fading out Compound I bottom O atom
            drawWobblyCircle(ctxF, cx1, cy + 58, atomR_O, '#ef4444', true, 2, 82);
            drawWobblyCircle(ctxF, cx1, cy + 58, atomR_O, '#2b2b2b', false, 2, 82);
            ctxF.fillStyle = '#ffffff';
            ctxF.font = 'bold 1.15rem sans-serif';
            ctxF.textAlign = 'center';
            ctxF.fillText('O', cx1, cy + 63);
            
            // Fading out Compound II bottom 2 O atoms (horizontally arranged)
            drawWobblyCircle(ctxF, cx2, cy + 58, atomR_O, '#ef4444', true, 2, 84);
            drawWobblyCircle(ctxF, cx2, cy + 58, atomR_O, '#2b2b2b', false, 2, 84);
            ctxF.fillStyle = '#ffffff';
            ctxF.font = 'bold 1.15rem sans-serif';
            ctxF.textAlign = 'center';
            ctxF.fillText('O', cx2, cy + 63);
            drawWobblyCircle(ctxF, cx2 + 36, cy + 58, atomR_O, '#ef4444', true, 2, 85);
            drawWobblyCircle(ctxF, cx2 + 36, cy + 58, atomR_O, '#2b2b2b', false, 2, 85);
            ctxF.fillStyle = '#ffffff';
            ctxF.fillText('O', cx2 + 36, cy + 63);

            ctxF.font = FONT_UI;
            ctxF.fillStyle = '#2563eb'; // Blue
            ctxF.textAlign = 'center';
            ctxF.fillText('H 重量相同', w / 2, cy - 25);
            ctxF.font = FONT_SMALL;
            ctxF.fillText('表示應有相同數量的 H 原子', w / 2, cy - 5);

            // Red/green O weight ratio text
            const text1 = "O 原子重量比為 ";
            const text2 = "1";
            const text3 = " : ";
            const text4 = "2";
            ctxF.font = FONT_UI;
            const w1 = ctxF.measureText(text1).width;
            const w2 = ctxF.measureText(text2).width;
            const w3 = ctxF.measureText(text3).width;
            const w4 = ctxF.measureText(text4).width;
            const totalW = w1 + w2 + w3 + w4;
            let startX = w / 2 - totalW / 2;
            ctxF.textAlign = 'left';
            ctxF.fillStyle = '#1f1f1f';
            ctxF.fillText(text1, startX, cy + 53);
            startX += w1;
            ctxF.fillStyle = '#ef4444'; // Red
            ctxF.fillText(text2, startX, cy + 53);
            startX += w2;
            ctxF.fillStyle = '#1f1f1f';
            ctxF.fillText(text3, startX, cy + 53);
            startX += w3;
            ctxF.fillStyle = '#10b981'; // Green
            ctxF.fillText(text4, startX, cy + 53);

            // Represent O atoms ratio
            const text6 = "表示 O 原子的數量也是 ";
            const text7 = "1";
            const text8 = " : ";
            const text9 = "2";
            ctxF.font = FONT_SMALL;
            const w6 = ctxF.measureText(text6).width;
            const w7 = ctxF.measureText(text7).width;
            const w8 = ctxF.measureText(text8).width;
            const w9 = ctxF.measureText(text9).width;
            const totalW2 = w6 + w7 + w8 + w9;
            let startX2 = w / 2 - totalW2 / 2;
            ctxF.fillStyle = '#1f1f1f';
            ctxF.fillText(text6, startX2, cy + 73);
            startX2 += w6;
            ctxF.fillStyle = '#ef4444'; // Red
            ctxF.fillText(text7, startX2, cy + 73);
            startX2 += w7;
            ctxF.fillStyle = '#1f1f1f';
            ctxF.fillText(text8, startX2, cy + 73);
            startX2 += w8;
            ctxF.fillStyle = '#10b981'; // Green
            ctxF.fillText(text9, startX2, cy + 73);
            ctxF.restore();
        }

        // 3. Draw text descriptions (Equal weight premise always at top cy-25/cy-5, ratio always at bottom cy+53/cy+73)
        if (currentStep === 8) {
            ctxF.save();
            ctxF.globalAlpha = t8;
            ctxF.font = FONT_UI;
            ctxF.fillStyle = '#2563eb'; // Blue
            ctxF.textAlign = 'center';
            ctxF.fillText('O 重量相同', w / 2, cy - 25);
            ctxF.font = FONT_SMALL;
            ctxF.fillText('表示應有相同數量的 O 原子', w / 2, cy - 5);
            ctxF.restore();
        }
        else if (currentStep === 9) {
            ctxF.save();
            // Step 8 text remains visible in blue at top position
            ctxF.font = FONT_UI;
            ctxF.fillStyle = '#2563eb'; // Blue
            ctxF.textAlign = 'center';
            ctxF.fillText('O 重量相同', w / 2, cy - 25);
            ctxF.font = FONT_SMALL;
            ctxF.fillText('表示應有相同數量的 O 原子', w / 2, cy - 5);
            ctxF.restore();

            // Red/green H weight ratio text at cy + 53 - Fades in!
            ctxF.save();
            const alpha9 = easeInOutCubic(animProgress);
            ctxF.globalAlpha = alpha9;

            const text1 = "H 原子重量比為 ";
            const text2 = "2";
            const text3 = " : ";
            const text4 = "1";
            ctxF.font = FONT_UI;
            const w1 = ctxF.measureText(text1).width;
            const w2 = ctxF.measureText(text2).width;
            const w3 = ctxF.measureText(text3).width;
            const w4 = ctxF.measureText(text4).width;
            const totalW = w1 + w2 + w3 + w4;
            let startX = w / 2 - totalW / 2;

            ctxF.textAlign = 'left';
            ctxF.fillStyle = '#1f1f1f'; // Unified text color
            ctxF.fillText(text1, startX, cy + 53);
            startX += w1;
            ctxF.fillStyle = '#10b981'; // Green
            ctxF.fillText(text2, startX, cy + 53);
            startX += w2;
            ctxF.fillStyle = '#1f1f1f'; // Unified text color
            ctxF.fillText(text3, startX, cy + 53);
            startX += w3;
            ctxF.fillStyle = '#ef4444'; // Red
            ctxF.fillText(text4, startX, cy + 53);

            // Represent H atoms ratio is also 2 : 1 at cy + 73
            const text6 = "表示 H 原子的數量也是 ";
            const text7 = "2";
            const text8 = " : ";
            const text9 = "1";
            ctxF.font = FONT_SMALL;
            const w6 = ctxF.measureText(text6).width;
            const w7 = ctxF.measureText(text7).width;
            const w8 = ctxF.measureText(text8).width;
            const w9 = ctxF.measureText(text9).width;
            const totalW2 = w6 + w7 + w8 + w9;
            let startX2 = w / 2 - totalW2 / 2;

            ctxF.fillStyle = '#1f1f1f'; // Unified text color
            ctxF.fillText(text6, startX2, cy + 73);
            startX2 += w6;
            ctxF.fillStyle = '#10b981'; // Green
            ctxF.fillText(text7, startX2, cy + 73);
            startX2 += w7;
            ctxF.fillStyle = '#1f1f1f'; // Unified text color
            ctxF.fillText(text8, startX2, cy + 73);
            startX2 += w8;
            ctxF.fillStyle = '#ef4444'; // Red
            ctxF.fillText(text9, startX2, cy + 73);

            ctxF.restore();
        }

        ctxF.restore();
    }
    else if (currentStep === 10) {
        // Step 10: Formal Law Scroll / John Dalton Scroll
        const alpha10 = easeInOutCubic(animProgress);
        ctxF.save();
        ctxF.globalAlpha = alpha10;
        
        // Draw parchment border matching Step 7 of definite proportions
        drawWobblyRect(ctxF, 35, 35, w - 70, h - 70, '#2b2b2b', true, '#faf8f5', 2.5, 100);
        drawWobblyRect(ctxF, 43, 43, w - 86, h - 86, '#888888', false, '', 1, 105);

        const cy = h / 2;

        // Title
        ctxF.fillStyle = '#ff7a00'; // COLOR_ORANGE
        ctxF.font = FONT_TITLE;
        ctxF.textAlign = 'center';
        ctxF.fillText('倍比定律 (Law of Multiple Proportions)', w / 2, cy - 105);

        // Divider
        drawWobblyLine(ctxF, 60, cy - 85, w - 60, cy - 85, '#2b2b2b', 1.5, 110);

        // Statement (broken into 4 shorter lines to prevent overflow)
        ctxF.fillStyle = '#1f1f1f';
        ctxF.font = FONT_TITLE;
        ctxF.fillText('「 當甲、乙兩元素結合，', w / 2, cy - 50);
        ctxF.fillText('生成兩種以上的化合物時，', w / 2, cy - 10);
        ctxF.fillText('若固定甲元素的質量，', w / 2, cy + 30);
        ctxF.fillText('則乙元素的質量比呈簡單整數比。 」', w / 2, cy + 70);

        // Author / Date
        ctxF.fillStyle = '#5f5f5f';
        ctxF.font = FONT_UI;
        ctxF.textAlign = 'right';
        ctxF.fillText('── 道耳頓 (John Dalton, 1803)', w - 70, cy + 110);
        ctxF.restore();
    }
    else if (currentStep === 11) {
        // Step 11: Dalton's atom mapping
        ctxF.save();
        drawWobblyRect(ctxF, 30, 40, w - 60, h - 80, '#2b2b2b', true, '#ffffff', 2, 110);
        ctxF.font = FONT_TITLE;
        ctxF.fillText('等質量 O 代表有相同數量的 O 原子：', 50, 75);
        
        // Draw aligned O atoms side-by-side with labels to avoid overlap
        const cy1 = h / 2 - 40;
        const cy2 = h / 2 + 40;
        
        ctxF.font = FONT_UI;
        ctxF.fillStyle = '#1f1f1f';
        ctxF.textAlign = 'left';
        ctxF.textBaseline = 'middle';
        ctxF.fillText('化合物 I 的 4 個 O 原子：', 50, cy1);
        for (let i = 0; i < 4; i++) {
            drawWobblyCircle(ctxF, 270 + i * 42, cy1, 15, '#ef4444', true, 1.5, 111 + i);
            drawWobblyCircle(ctxF, 270 + i * 42, cy1, 15, '#2b2b2b', false, 1.5, 111 + i);
            ctxF.fillStyle = '#ffffff';
            ctxF.font = 'bold 0.85rem sans-serif';
            ctxF.textAlign = 'center';
            ctxF.textBaseline = 'middle';
            ctxF.fillText('O', 270 + i * 42, cy1 + 1);
        }
        
        ctxF.fillStyle = '#1f1f1f';
        ctxF.textAlign = 'left';
        ctxF.font = FONT_UI;
        ctxF.textBaseline = 'middle';
        ctxF.fillText('化合物 II 的 4 個 O 原子：', 50, cy2);
        for (let i = 0; i < 4; i++) {
            drawWobblyCircle(ctxF, 270 + i * 42, cy2, 15, '#ef4444', true, 1.5, 120 + i);
            drawWobblyCircle(ctxF, 270 + i * 42, cy2, 15, '#2b2b2b', false, 1.5, 120 + i);
            ctxF.fillStyle = '#ffffff';
            ctxF.font = 'bold 0.85rem sans-serif';
            ctxF.textAlign = 'center';
            ctxF.textBaseline = 'middle';
            ctxF.fillText('O', 270 + i * 42, cy2 + 1);
        }
        
        ctxF.restore();
    }
    else if (currentStep === 12) {
        // Step 12: Formula hypothesis cards
        ctxF.save();
        drawWobblyRect(ctxF, 30, 40, w - 60, h - 80, '#2b2b2b', true, '#ffffff', 2, 130);
        
        ctxF.font = FONT_TITLE;
        ctxF.fillText('設定化學式中含有 1 個 O 原子：', 50, 75);
        
        // Card 1
        const cw = 110, ch = 100;
        drawWobblyRect(ctxF, w / 4 - cw / 2, h / 2 - 30, cw, ch, '#ff7a00', false, '#ffffff', 2, 131);
        ctxF.font = FONT_UI;
        ctxF.fillText('化合物 I', w / 4, h / 2 - 5);
        ctxF.font = 'bold italic 1.45rem "EB Garamond", serif';
        ctxF.fillStyle = '#ff7a00';
        ctxF.fillText('HₓO₁', w / 4, h / 2 + 40);
        
        // Card 2
        ctxF.fillStyle = '#1f1f1f';
        drawWobblyRect(ctxF, (w * 3) / 4 - cw / 2, h / 2 - 30, cw, ch, '#7c3aed', false, '#ffffff', 2, 132);
        ctxF.font = FONT_UI;
        ctxF.fillText('化合物 II', (w * 3) / 4, h / 2 - 5);
        ctxF.font = 'bold italic 1.45rem "EB Garamond", serif';
        ctxF.fillStyle = '#7c3aed';
        ctxF.fillText('H_yO₁', (w * 3) / 4, h / 2 + 40);
        
        ctxF.restore();
    }
    else if (currentStep === 13) {
        // Step 13: Derivation logic math board
        ctxF.save();
        drawWobblyRect(ctxF, 30, 40, w - 60, h - 80, '#2b2b2b', true, '#ffffff', 2, 140);
        ctxF.font = FONT_TITLE;
        ctxF.fillText('質量比與原子個數比對應：', 50, 75);
        
        ctxF.font = FONT_UI;
        ctxF.fillText('等氧質量時，氫之質量比為 2 : 1。', 50, 110);
        ctxF.fillText('因此，分子中 H 原子數之比應為：', 50, 140);
        
        ctxF.font = 'bold italic 1.35rem "EB Garamond", serif';
        ctxF.fillStyle = '#ff7a00';
        ctxF.fillText('x : y = 2 : 1', w / 2 - 40, h / 2 + 30);
        
        ctxF.fillStyle = '#5f5f5f';
        ctxF.font = FONT_SMALL;
        ctxF.fillText('這代表化合物 I 的 H 原子數是化合物 II 的 2 倍。', 50, h - 70);
        ctxF.restore();
    }
    else if (currentStep === 14) {
        // Step 14: Final determined formulas
        ctxF.save();
        drawWobblyRect(ctxF, 30, 40, w - 60, h - 80, '#2b2b2b', true, '#ffffff', 2, 150);
        
        ctxF.font = FONT_TITLE;
        ctxF.fillText('推導完成的化學式：', 50, 75);
        
        // Compound I card
        const cw = 120, ch = 110;
        drawWobblyRect(ctxF, w / 4 - cw / 2, h / 2 - 35, cw, ch, '#2b2b2b', true, '#faf8f5', 2.5, 151);
        ctxF.font = FONT_UI;
        ctxF.fillText('化合物 I (水)', w / 4, h / 2 - 10);
        ctxF.font = 'bold italic 1.65rem "EB Garamond", serif';
        ctxF.fillStyle = '#ff7a00';
        ctxF.fillText('H₂O', w / 4, h / 2 + 35);
        
        // Compound II card
        ctxF.fillStyle = '#1f1f1f';
        drawWobblyRect(ctxF, (w * 3) / 4 - cw / 2, h / 2 - 35, cw, ch, '#2b2b2b', true, '#faf8f5', 2.5, 152);
        ctxF.font = FONT_UI;
        ctxF.fillText('化合物 II (雙氧水)', (w * 3) / 4, h / 2 - 10);
        ctxF.font = 'bold italic 1.65rem "EB Garamond", serif';
        ctxF.fillStyle = '#7c3aed';
        ctxF.fillText('H₂O₂', (w * 3) / 4, h / 2 + 35);
        
        ctxF.restore();
    }
}

// DRAW RIGHT PANEL (COORDINATE GRAPH)
function drawRightPanel() {
    const w = graphCanvas.width;
    const h = graphCanvas.height;
    ctxG.clearRect(0, 0, w, h);
    
    // 1. Draw Grid lines
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
    
    // 2. Draw Axes (Wobbly)
    drawWobblyLine(ctxG, mapX(0, w), mapY(0, h), mapX(4.0, w), mapY(0, h), '#2b2b2b', 2.5, 201); // X Axis
    drawWobblyLine(ctxG, mapX(0, w), mapY(0, h), mapX(0, w), mapY(32.0, h), '#2b2b2b', 2.5, 202); // Y Axis
    
    // X Axis ticks & labels
    ctxG.font = FONT_SMALL;
    ctxG.textAlign = 'center';
    for (let xVal = 1.0; xVal <= 4.0; xVal += 1.0) {
        const tx = mapX(xVal, w);
        const ty = mapY(0, h);
        drawWobblyLine(ctxG, tx, ty, tx, ty + 5, '#2b2b2b', 1.5, 203 + xVal);
        
        if ((currentStep === 6 || currentStep === 7) && xVal === 1.0) {
            ctxG.save();
            ctxG.fillStyle = '#2563eb'; // Blue text label
            ctxG.font = 'bold 1.15rem sans-serif'; // Larger & Bold
            ctxG.fillText(xVal.toFixed(1), tx, ty + 20);
            ctxG.restore();
        } else {
            ctxG.fillStyle = '#2b2b2b';
            ctxG.fillText(xVal.toFixed(1), tx, ty + 18);
        }
    }
    ctxG.font = FONT_UI;
    ctxG.fillStyle = '#2b2b2b';
    ctxG.fillText('氫的質量 wH (g)', w - 100, mapY(0, h) + 40);
    
    // Y Axis ticks & labels (prevent text alignment pollution)
    ctxG.font = FONT_SMALL;
    ctxG.textAlign = 'right';
    for (let yVal = 8; yVal <= 32; yVal += 8) {
        const tx = mapX(0, w);
        const ty = mapY(yVal, h);
        drawWobblyLine(ctxG, tx, ty, tx - 5, ty, '#2b2b2b', 1.5, 210 + yVal);
        
        if ((currentStep === 8 || currentStep === 9) && yVal === 16) {
            ctxG.save();
            ctxG.fillStyle = '#2563eb'; // Blue text label
            ctxG.font = 'bold 1.15rem sans-serif'; // Larger & Bold
            ctxG.fillText(yVal.toString(), tx - 10, ty + 5);
            ctxG.restore();
        } else {
            ctxG.fillStyle = '#2b2b2b';
            ctxG.fillText(yVal.toString(), tx - 10, ty + 5);
        }
    }
    
    // Y-Axis Label with RESET textAlign to avoid clipping
    ctxG.font = FONT_UI;
    ctxG.textAlign = 'left'; // Reset alignment to prevent clipping!
    ctxG.fillText('氧的質量 wO (g)', mapX(0, w) + 15, 30);
    ctxG.textAlign = 'right'; // Restore tick alignment
    ctxG.fillText('0', mapX(0, w) - 10, mapY(0, h) + 15);
    
    // 3. Draw Compound I representative point and line
    if (currentStep >= 2) {
        const t2 = (currentStep === 2) ? easeInOutCubic(animProgress) : 1;
        drawWobblyCircle(ctxG, mapX(2.5, w), mapY(20.0, h), 6 * t2, '#ff7a00', true, 2, 220);
        
        // Draw Compound I label "I" above the point
        ctxG.save();
        ctxG.globalAlpha = t2;
        ctxG.fillStyle = '#ff7a00';
        ctxG.font = 'bold 1.1rem sans-serif';
        ctxG.textAlign = 'center';
        ctxG.fillText('I', mapX(2.5, w), mapY(20.0, h) - 12);
        ctxG.restore();
    }
    
    if (currentStep >= 3) {
        ctxG.save();
        ctxG.globalAlpha = 0.65;
        // Animate drawing on step 3, show full on later steps
        const t3 = (currentStep === 3) ? easeInOutCubic(animProgress) : 1;
        const endX3 = mapX(0, w) + (mapX(3.5, w) - mapX(0, w)) * t3;
        const endY3 = mapY(0, h) + (mapY(28.0, h) - mapY(0, h)) * t3;
        drawWobblyLine(ctxG, mapX(0, w), mapY(0, h), endX3, endY3, '#ff7a00', 3, 225);
        ctxG.restore();
    }
    
    // 4. Draw Compound II representative point and line
    if (currentStep >= 4) {
        const t4 = (currentStep === 4) ? easeInOutCubic(animProgress) : 1;
        drawWobblyCircle(ctxG, mapX(1.5, w), mapY(24.0, h), 6 * t4, '#7c3aed', true, 2, 230);
        
        // Draw Compound II label "II" above the point
        ctxG.save();
        ctxG.globalAlpha = t4;
        ctxG.fillStyle = '#7c3aed';
        ctxG.font = 'bold 1.1rem sans-serif';
        ctxG.textAlign = 'center';
        ctxG.fillText('II', mapX(1.5, w), mapY(24.0, h) - 12);
        ctxG.restore();
    }
    
    if (currentStep >= 5) {
        ctxG.save();
        ctxG.globalAlpha = 0.65;
        // Animate drawing on step 5, show full on later steps
        const t5 = (currentStep === 5) ? easeInOutCubic(animProgress) : 1;
        const endX5 = mapX(0, w) + (mapX(1.8, w) - mapX(0, w)) * t5;
        const endY5 = mapY(0, h) + (mapY(28.8, h) - mapY(0, h)) * t5;
        drawWobblyLine(ctxG, mapX(0, w), mapY(0, h), endX5, endY5, '#7c3aed', 3, 235);
        ctxG.restore();
    }
    
    // 5. Draw vertical comparison line (Step 6 & 7)
    if (currentStep === 6 || currentStep === 7) {
        const lineX = 1.0;
        const xPos = mapX(lineX, w);
        const t6 = (currentStep === 6) ? easeInOutCubic(animProgress) : 1;
        const currentY = mapY(0, h) + (mapY(20.0, h) - mapY(0, h)) * t6;
        
        ctxG.save();
        ctxG.setLineDash([5, 5]);
        ctxG.strokeStyle = '#2563eb';
        ctxG.lineWidth = 2;
        ctxG.beginPath();
        ctxG.moveTo(xPos, mapY(0, h));
        ctxG.lineTo(xPos, currentY);
        ctxG.stroke();
        ctxG.restore();
        
        // Threshold alphas for vertical comparison intersections
        const alpha8 = (currentStep === 7) ? 1.0 : ((t6 >= 0.4) ? Math.min(1.0, (t6 - 0.4) / 0.1) : 0);
        const alpha16 = (currentStep === 7) ? 1.0 : ((t6 >= 0.8) ? Math.min(1.0, (t6 - 0.8) / 0.1) : 0);

        // Draw intersection dots & labels
        if (alpha8 > 0) {
            ctxG.save();
            ctxG.globalAlpha = alpha8;
            drawWobblyCircle(ctxG, xPos, mapY(8.0, h), 5, 'rgba(37, 99, 235, 0.6)', true, 2, 240); // Blue dot (semi-trans)
            ctxG.fillStyle = '#ff7a00';
            ctxG.font = 'bold 0.95rem sans-serif';
            ctxG.textAlign = 'left';
            ctxG.fillText('8.0', xPos + 8, mapY(8.0, h) + 4);
            ctxG.restore();
        }
        
        if (alpha16 > 0) {
            ctxG.save();
            ctxG.globalAlpha = alpha16;
            drawWobblyCircle(ctxG, xPos, mapY(16.0, h), 5, 'rgba(37, 99, 235, 0.6)', true, 2, 241); // Blue dot (semi-trans)
            ctxG.fillStyle = '#7c3aed';
            ctxG.font = 'bold 0.95rem sans-serif';
            ctxG.textAlign = 'left';
            ctxG.fillText('16.0', xPos + 8, mapY(16.0, h) + 4);
            ctxG.restore();
        }
        
        // Step 7 Vertical Bracket Marks in Red and Green per sketch - Fades in!
        if (currentStep === 7) {
            ctxG.save();
            ctxG.globalAlpha = easeInOutCubic(animProgress);
            // Draw red vertical bracket (0 to 8.0) on the left of the line
            drawVerticalBracket(ctxG, xPos - 8, mapY(0, h), mapY(8.0, h), '#ef4444', true);
            // Label 1 in red to the left of the red bracket
            ctxG.fillStyle = '#ef4444';
            ctxG.font = 'bold 1.05rem sans-serif';
            ctxG.textAlign = 'right';
            ctxG.fillText('1', xPos - 22, mapY(4.0, h) + 5);
            
            // Draw green vertical bracket (0 to 16.0) on the right of the line and labels
            drawVerticalBracket(ctxG, xPos + 48, mapY(0, h), mapY(16.0, h), '#10b981', false);
            // Label 2 in green to the right of the green bracket
            ctxG.fillStyle = '#10b981';
            ctxG.font = 'bold 1.05rem sans-serif';
            ctxG.textAlign = 'left';
            ctxG.fillText('2', xPos + 62, mapY(8.0, h) + 5);
            ctxG.restore();
        }
    }
    
    // 6. Draw horizontal comparison line (Step 8 & 9)
    if (currentStep === 8 || currentStep === 9) {
        const lineY = 16.0;
        const yPos = mapY(lineY, h);
        const t8 = (currentStep === 8) ? easeInOutCubic(animProgress) : 1;
        const currentX = mapX(0, w) + (mapX(2.5, w) - mapX(0, w)) * t8;
        
        ctxG.save();
        ctxG.setLineDash([5, 5]);
        ctxG.strokeStyle = '#2563eb'; // Blue horizontal comparison line per request
        ctxG.lineWidth = 2;
        ctxG.beginPath();
        ctxG.moveTo(mapX(0, w), yPos);
        ctxG.lineTo(currentX, yPos);
        ctxG.stroke();
        ctxG.restore();
        
        // Threshold alphas for horizontal comparison intersections
        const alpha1 = (currentStep === 9) ? 1.0 : ((t8 >= 0.4) ? Math.min(1.0, (t8 - 0.4) / 0.1) : 0);
        const alpha2 = (currentStep === 9) ? 1.0 : ((t8 >= 0.8) ? Math.min(1.0, (t8 - 0.8) / 0.1) : 0);

        // Draw intersection dots
        const xPos1 = mapX(2.0, w);
        if (alpha2 > 0) {
            ctxG.save();
            ctxG.globalAlpha = alpha2;
            drawWobblyCircle(ctxG, xPos1, yPos, 5, 'rgba(37, 99, 235, 0.6)', true, 2, 250); // Blue dot (semi-trans)
            ctxG.fillStyle = '#ff7a00';
            ctxG.font = 'bold 0.95rem sans-serif';
            ctxG.textAlign = 'center';
            ctxG.fillText('2.0', xPos1, yPos - 10);
            ctxG.restore();
        }
        
        const xPos2 = mapX(1.0, w);
        if (alpha1 > 0) {
            ctxG.save();
            ctxG.globalAlpha = alpha1;
            drawWobblyCircle(ctxG, xPos2, yPos, 5, 'rgba(37, 99, 235, 0.6)', true, 2, 251); // Blue dot (semi-trans)
            ctxG.fillStyle = '#7c3aed';
            ctxG.font = 'bold 0.95rem sans-serif';
            ctxG.textAlign = 'center';
            ctxG.fillText('1.0', xPos2, yPos - 10);
            ctxG.restore();
        }
        
        // Step 9 Horizontal Bracket Marks in Red and Green (Symmetrical to Step 7) - Fades in!
        if (currentStep === 9) {
            ctxG.save();
            ctxG.globalAlpha = easeInOutCubic(animProgress);
            // Draw red horizontal bracket (0 to 1.0) below the line
            drawHorizontalBracket(ctxG, mapX(0, w), mapX(1.0, w), yPos + 8, '#ef4444', false);
            // Label 1 in red below the red bracket
            ctxG.fillStyle = '#ef4444';
            ctxG.font = 'bold 1.05rem sans-serif';
            ctxG.textAlign = 'center';
            ctxG.fillText('1', mapX(0.5, w), yPos + 36);
            
            // Draw green horizontal bracket (0 to 2.0) above the line and labels
            drawHorizontalBracket(ctxG, mapX(0, w), mapX(2.0, w), yPos - 24, '#10b981', true);
            // Label 2 in green above the green bracket
            ctxG.fillStyle = '#10b981';
            ctxG.font = 'bold 1.05rem sans-serif';
            ctxG.textAlign = 'center';
            ctxG.fillText('2', mapX(1.0, w), yPos - 38);
            ctxG.restore();
        }
    }
}
