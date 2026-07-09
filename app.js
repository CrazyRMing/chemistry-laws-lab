// Canvas & UI Setup
const canvas = document.getElementById('chemCanvas');
const ctx = canvas.getContext('2d');
const canvasOverlay = document.getElementById('canvasOverlay');

// UI States
let currentTab = 'definite'; // 'definite' | 'multiple'
let multipleMode = 'CO'; // 'CO' | 'CO2'
let reactionState = 'idle'; // 'idle' | 'reacting' | 'completed'
let atoms = [];
let animationFrameId = null;

// Atom config
const ATOM_STYLES = {
    H: { radius: 8, color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.8)', mass: 1, name: '氫 (H)' },
    O: { radius: 14, color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.8)', mass: 16, name: '氧 (O)' },
    C: { radius: 16, color: '#a1a1aa', glow: 'rgba(161, 161, 170, 0.8)', mass: 12, name: '碳 (C)' }
};

// Handle Canvas Resizing
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    if (reactionState === 'idle') {
        initAtoms();
    }
}
window.addEventListener('resize', resizeCanvas);

// Sliders and Displays
const sliders = {
    definite: {
        h: { input: document.getElementById('range-h'), val: document.getElementById('val-h') },
        o: { input: document.getElementById('range-o'), val: document.getElementById('val-o') }
    },
    multiple: {
        c: { input: document.getElementById('range-c'), val: document.getElementById('val-c') },
        o: { input: document.getElementById('range-o-mult'), val: document.getElementById('val-o-mult') }
    }
};

// Attach events to sliders
sliders.definite.h.input.addEventListener('input', (e) => {
    sliders.definite.h.val.textContent = e.target.value;
    if (reactionState === 'idle') initAtoms();
});
sliders.definite.o.input.addEventListener('input', (e) => {
    sliders.definite.o.val.textContent = e.target.value;
    if (reactionState === 'idle') initAtoms();
});
sliders.multiple.c.input.addEventListener('input', (e) => {
    sliders.multiple.c.val.textContent = e.target.value;
    if (reactionState === 'idle') initAtoms();
});
sliders.multiple.o.input.addEventListener('input', (e) => {
    sliders.multiple.o.val.textContent = e.target.value;
    if (reactionState === 'idle') initAtoms();
});

// Tab Switcher
function switchTab(tab) {
    if (reactionState === 'reacting') return;
    
    currentTab = tab;
    document.getElementById('tab-definite').classList.toggle('active', tab === 'definite');
    document.getElementById('tab-multiple').classList.toggle('active', tab === 'multiple');
    
    document.getElementById('controls-definite').classList.toggle('hidden', tab !== 'definite');
    document.getElementById('controls-multiple').classList.toggle('hidden', tab !== 'multiple');
    
    document.getElementById('sim-title').textContent = tab === 'definite' 
        ? '定比定律：氫氧合成水模擬' 
        : `倍比定律：碳氧反應模擬 (${multipleMode === 'CO' ? '一氧化碳 CO' : '二氧化碳 CO2'})`;
        
    resetReaction();
}

// Mode Switcher for Multiple Proportions
function setMultipleMode(mode) {
    if (reactionState === 'reacting') return;
    multipleMode = mode;
    document.getElementById('btn-mode-co').classList.toggle('active', mode === 'CO');
    document.getElementById('btn-mode-co2').classList.toggle('active', mode === 'CO2');
    
    document.getElementById('sim-title').textContent = `倍比定律：碳氧反應模擬 (${mode === 'CO' ? '一氧化碳 CO' : '二氧化碳 CO2'})`;
    
    resetReaction();
}

// Atom Class
class Atom {
    constructor(type, x, y) {
        this.type = type;
        this.radius = ATOM_STYLES[type].radius;
        this.color = ATOM_STYLES[type].color;
        this.glow = ATOM_STYLES[type].glow;
        this.mass = ATOM_STYLES[type].mass;
        
        this.x = x || Math.random() * (canvas.width - this.radius * 4) + this.radius * 2;
        this.y = y || Math.random() * (canvas.height - this.radius * 4) + this.radius * 2;
        
        // Random velocity
        const speed = 1 + Math.random() * 1.5;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        // Bonding state
        this.isBound = false;
        this.bondCenter = null; // Pointer to the central atom (O or C)
        this.offsetX = 0;      // Offset relative to center atom when bound
        this.offsetY = 0;
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
    }

    update() {
        if (this.isBound && this.bondCenter) {
            // Gradually glide into bond position
            const ease = 0.08;
            this.offsetX += (this.targetOffsetX - this.offsetX) * ease;
            this.offsetY += (this.targetOffsetY - this.offsetY) * ease;
            
            this.x = this.bondCenter.x + this.offsetX;
            this.y = this.bondCenter.y + this.offsetY;
        } else {
            // Free movement
            this.x += this.vx;
            this.y += this.vy;
            
            // Wall collisions
            if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.vx *= -1;
            }
            if (this.x + this.radius > canvas.width) {
                this.x = canvas.width - this.radius;
                this.vx *= -1;
            }
            if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.vy *= -1;
            }
            if (this.y + this.radius > canvas.height) {
                this.y = canvas.height - this.radius;
                this.vy *= -1;
            }
        }
    }

    draw() {
        // Outer glow
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.glow;
        
        // Circle base
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Highlighting shine
        ctx.shadowBlur = 0; // reset shadow
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        // Label text inside
        ctx.fillStyle = this.type === 'H' ? '#0f172a' : '#ffffff';
        ctx.font = `bold ${this.radius * 0.9}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type, this.x, this.y + (this.radius * 0.05));
    }
}

// Spawn initial atoms
function initAtoms() {
    atoms = [];
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    if (currentTab === 'definite') {
        const hCount = parseInt(sliders.definite.h.input.value);
        const oCount = parseInt(sliders.definite.o.input.value);
        
        for (let i = 0; i < hCount; i++) atoms.push(new Atom('H'));
        for (let i = 0; i < oCount; i++) atoms.push(new Atom('O'));
    } else {
        const cCount = parseInt(sliders.multiple.c.input.value);
        const oCount = parseInt(sliders.multiple.o.input.value);
        
        for (let i = 0; i < cCount; i++) atoms.push(new Atom('C'));
        for (let i = 0; i < oCount; i++) atoms.push(new Atom('O'));
    }

    updateAnalysisTable();
    updateTheoryPanel();
    drawFrame();
}

// Primary Animation Loop
function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw bond lines first so they are behind atoms
    if (reactionState === 'reacting' || reactionState === 'completed') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 4;
        atoms.forEach(atom => {
            if (atom.isBound && atom.bondCenter) {
                ctx.beginPath();
                ctx.moveTo(atom.x, atom.y);
                ctx.lineTo(atom.bondCenter.x, atom.bondCenter.y);
                ctx.stroke();
            }
        });
    }

    // Update and draw atoms
    atoms.forEach(atom => {
        if (reactionState === 'reacting') {
            atom.update();
        } else if (reactionState === 'completed') {
            atom.update();
        } else {
            // Idle bounce state
            atom.update();
        }
        atom.draw();
    });

    animationFrameId = requestAnimationFrame(drawFrame);
}

// Start Reaction Simulation
function startReaction() {
    if (reactionState !== 'idle') return;
    
    reactionState = 'reacting';
    document.getElementById('reaction-status').textContent = '反應中';
    document.getElementById('reaction-status').className = 'badge active';
    document.getElementById('btn-start').disabled = true;
    canvasOverlay.classList.add('hidden');

    // Grouping / Bonding Algorithm
    const hAtoms = atoms.filter(a => a.type === 'H');
    const oAtoms = atoms.filter(a => a.type === 'O');
    const cAtoms = atoms.filter(a => a.type === 'C');

    if (currentTab === 'definite') {
        // H2O Synthesis
        const maxWater = Math.min(Math.floor(hAtoms.length / 2), oAtoms.length);
        
        for (let i = 0; i < maxWater; i++) {
            const centerO = oAtoms[i];
            const bondH1 = hAtoms[i * 2];
            const bondH2 = hAtoms[i * 2 + 1];
            
            // Set binding targets
            bondH1.isBound = true;
            bondH1.bondCenter = centerO;
            bondH1.targetOffsetX = -22;
            bondH1.targetOffsetY = 16;
            
            bondH2.isBound = true;
            bondH2.bondCenter = centerO;
            bondH2.targetOffsetX = 22;
            bondH2.targetOffsetY = 16;
        }
    } else {
        // CO or CO2 Synthesis
        if (multipleMode === 'CO') {
            const maxCO = Math.min(cAtoms.length, oAtoms.length);
            for (let i = 0; i < maxCO; i++) {
                const centerC = cAtoms[i];
                const bondO = oAtoms[i];
                
                bondO.isBound = true;
                bondO.bondCenter = centerC;
                bondO.targetOffsetX = 24;
                bondO.targetOffsetY = 0;
            }
        } else {
            // CO2
            const maxCO2 = Math.min(cAtoms.length, Math.floor(oAtoms.length / 2));
            for (let i = 0; i < maxCO2; i++) {
                const centerC = cAtoms[i];
                const bondO1 = oAtoms[i * 2];
                const bondO2 = oAtoms[i * 2 + 1];
                
                bondO1.isBound = true;
                bondO1.bondCenter = centerC;
                bondO1.targetOffsetX = -26;
                bondO1.targetOffsetY = 0;
                
                bondO2.isBound = true;
                bondO2.bondCenter = centerC;
                bondO2.targetOffsetX = 26;
                bondO2.targetOffsetY = 0;
            }
        }
    }

    // Reaction Completes in 3 seconds
    setTimeout(() => {
        reactionState = 'completed';
        document.getElementById('reaction-status').textContent = '已完成';
        document.getElementById('reaction-status').className = 'badge completed';
        updateAnalysisTable();
    }, 2500);
}

// Reset Experiment
function resetReaction() {
    reactionState = 'idle';
    document.getElementById('reaction-status').textContent = '待命';
    document.getElementById('reaction-status').className = 'badge';
    document.getElementById('btn-start').disabled = false;
    canvasOverlay.classList.remove('hidden');
    initAtoms();
}

// Calculate and render data analysis
function updateAnalysisTable() {
    const tbody = document.getElementById('analysis-tbody');
    tbody.innerHTML = '';

    const hAtoms = atoms.filter(a => a.type === 'H');
    const oAtoms = atoms.filter(a => a.type === 'O');
    const cAtoms = atoms.filter(a => a.type === 'C');

    if (currentTab === 'definite') {
        const maxWater = Math.min(Math.floor(hAtoms.length / 2), oAtoms.length);
        const waterReactedH = maxWater * 2;
        const waterReactedO = maxWater;
        
        const massBeforeH = hAtoms.length * 1;
        const massBeforeO = oAtoms.length * 16;
        const massAfterBoundH = waterReactedH * 1;
        const massAfterBoundO = waterReactedO * 16;
        
        const freeH = hAtoms.length - waterReactedH;
        const freeO = oAtoms.length - waterReactedO;
        
        tbody.innerHTML = `
            <tr>
                <td><span class="atom-dot dot-h"></span>氫原子 (H)</td>
                <td>${hAtoms.length} 個 (${massBeforeH} g)</td>
                <td>結合: ${waterReactedH} 個 / 游離: ${freeH} 個</td>
                <td rowspan="2" class="highlight-val">H : O<br>= ${massAfterBoundH} : ${massAfterBoundO}<br>= 1 : 8</td>
            </tr>
            <tr>
                <td><span class="atom-dot dot-o"></span>氧原子 (O)</td>
                <td>${oAtoms.length} 個 (${massBeforeO} g)</td>
                <td>結合: ${waterReactedO} 個 / 游離: ${freeO} 個</td>
            </tr>
            <tr>
                <td><strong>生成水分子 (H₂O)</strong></td>
                <td colspan="2"><span class="highlight-val">${maxWater}</span> 個分子 (質量: ${waterReactedH * 1 + waterReactedO * 16} g)</td>
                <td><span class="highlight-sub">定比質量比符合 1:8</span></td>
            </tr>
        `;
    } else {
        const isCO = multipleMode === 'CO';
        const maxMolecules = isCO 
            ? Math.min(cAtoms.length, oAtoms.length)
            : Math.min(cAtoms.length, Math.floor(oAtoms.length / 2));
            
        const reactedC = maxMolecules;
        const reactedO = maxMolecules * (isCO ? 1 : 2);
        
        const massBeforeC = cAtoms.length * 12;
        const massBeforeO = oAtoms.length * 16;
        
        const massAfterBoundC = reactedC * 12;
        const massAfterBoundO = reactedO * 16;
        
        const freeC = cAtoms.length - reactedC;
        const freeO = oAtoms.length - reactedO;
        
        const ratioText = isCO ? 'C : O = 12 : 16 = 3 : 4' : 'C : O = 12 : 32 = 3 : 8';
        const finalRatioG = isCO ? '12 : 16' : '12 : 32';
        
        tbody.innerHTML = `
            <tr>
                <td><span class="atom-dot dot-c"></span>碳原子 (C)</td>
                <td>${cAtoms.length} 個 (${massBeforeC} g)</td>
                <td>結合: ${reactedC} 個 / 游離: ${freeC} 個</td>
                <td rowspan="2" class="highlight-val">C : O<br>= ${massAfterBoundC} : ${massAfterBoundO}<br>= ${ratioText}</td>
            </tr>
            <tr>
                <td><span class="atom-dot dot-o"></span>氧原子 (O)</td>
                <td>${oAtoms.length} 個 (${massBeforeO} g)</td>
                <td>結合: ${reactedO} 個 / 游離: ${freeO} 個</td>
            </tr>
            <tr>
                <td><strong>生成 ${isCO ? 'CO' : 'CO₂'} 分子</strong></td>
                <td colspan="2"><span class="highlight-val">${maxMolecules}</span> 個分子 (質量: ${massAfterBoundC + massAfterBoundO} g)</td>
                <td><span class="highlight-sub">與固定碳 (12g) 結合的氧質量為 ${isCO ? '16g' : '32g'}</span></td>
            </tr>
        `;
    }
}

// Render dynamic theory content
function updateTheoryPanel() {
    const title = document.getElementById('theory-title');
    const content = document.getElementById('theory-text');
    
    if (currentTab === 'definite') {
        title.innerHTML = '⚖️ 定比定律解析 (Law of Definite Proportions)';
        content.innerHTML = `
            <p><strong>普魯斯特 (Joseph Proust)</strong> 提出：一種化合物不論來源為何，其組成元素的質量比恆為定值。</p>
            <div class="theory-math">
                <span>反應式：2H₂ + O₂ ➔ 2H₂O</span>
                <span>水分子由 <strong>2 個氫原子 (H)</strong> 與 <strong>1 個氧原子 (O)</strong> 組成。</span>
                <span>質量比：H : O = (2 × 1) : (1 × 16) = <strong>2 : 16 = 1 : 8</strong></span>
            </div>
            <p><strong>實驗結果驗證：</strong></p>
            <p>不論您調整滑桿配置多少氫氣與氧氣，成功合成水分子中，參與反應的氫與氧質量比必定嚴格遵守 <strong>1 : 8</strong> 的恆定關係。多餘的原子則保持游離，無法進行多餘的合成。</p>
        `;
    } else {
        title.innerHTML = '🔄 倍比定律解析 (Law of Multiple Proportions)';
        const isCO = multipleMode === 'CO';
        content.innerHTML = `
            <p><strong>道耳頓 (John Dalton)</strong> 提出：當兩元素可形成多種化合物時，若固定其中一元素的質量，則另一元素在各化合物中的質量呈簡單整數比。</p>
            <div class="theory-math">
                <span>一氧化碳 (CO)：C : O = 12 : <strong>16</strong> (個數比 1:1)</span>
                <span>二氧化碳 (CO₂)：C : O = 12 : <strong>32</strong> (個數比 1:2)</span>
                <span>在碳質量固定為 <strong>12g</strong> 時：</span>
                <span>結合氧的質量比為 <strong>16 : 32 = 1 : 2</strong> (簡單整數比)</span>
            </div>
            <p><strong>倍比定律對照說明：</strong></p>
            <p>目前設定在 <strong>${isCO ? '一氧化碳 CO' : '二氧化碳 CO₂'} 模式</strong>。此模式下，1 個碳原子會結合 <strong>${isCO ? '1' : '2'}</strong> 個氧原子。對比另一種產物，您可以清楚看出與相同碳（12g）結合的氧質量，恰好呈 <strong>1 : 2</strong> 的倍數關係，完美證實了倍比定律！</p>
            <div class="theory-alert">
                <p>💡 <strong>教學小技巧：</strong>您可以分別執行 CO 與 CO₂ 模式，記錄生成分子的氧原子數量，引導學生自行計算比值！</p>
            </div>
        `;
    }
}

// Initial setup on window load
window.onload = () => {
    resizeCanvas();
};
