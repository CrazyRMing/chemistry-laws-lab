# AI 渲染預覽狀態路由參數化 Phase 2 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將 URL 狀態路由擴充至「倍比定律主頁 (multiple_proportions.html)」與「挑戰題目頁 (quiz.html)」，並在「快速預覽看板 (preview_dashboard.html)」中平鋪這些具體狀態，實現全站核心狀態的 AI 檢視覆蓋。

**Architecture:** 
- 在 `multiple_proportions.js` 中解析 `?step=N` 並初始化 `currentStep`。
- 在 `quiz.js` 中解析 `?quiz=N` 與 `?sub=M`，並初始化 `quizPage` 與 `subPage`。
- 在 `preview_dashboard.html` 中新增對應狀態的 iframe 節點。

**Tech Stack:** HTML5, Vanilla JavaScript, CSS Grid

## Global Constraints
- 零外部大型庫依賴，維持 Vanilla JS 離線可用。
- 專案內部測試，不需要推送到 GitHub Pages 上。

---

### Task 1: 參數化倍比定律主頁狀態 (`multiple_proportions.js`)

**Files:**
- Modify: `multiple_proportions.js`

**Interfaces:**
- Consumes: 無
- Produces: 載入 `multiple_proportions.html?step=N` 時自動定位至步驟 N，並渲染對應的圖表與數據。

- [ ] **Step 1: 修改 multiple_proportions.js 初始化邏輯**

在 `multiple_proportions.js` 的 `window.onload` 回調（第 225-235 行左右）中加入參數解析邏輯：

```javascript
window.onload = () => {
    // 解析 step 參數
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    if (stepParam) {
        const step = parseInt(stepParam, 10);
        if (step >= 1 && step <= totalSteps) {
            currentStep = step;
        }
    }

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
```

- [ ] **Step 2: 手動驗證效果**

在瀏覽器中載入 `multiple_proportions.html?step=6`，確認網頁載入時直接停留在「步驟 6」的渲染狀態。

- [ ] **Step 3: Git Commit**

```bash
git add multiple_proportions.js
git commit -m "feat(multiple): 支援 url 參數 ?step 設定初始步驟"
```

---

### Task 2: 參數化挑戰題目頁狀態 (`quiz.js`)

**Files:**
- Modify: `quiz.js`

**Interfaces:**
- Consumes: 無
- Produces: 載入 `quiz.html?quiz=1&sub=2` 時直接定位到例題一的第 2 小題；載入 `quiz.html?quiz=2` 時直接定位到例題二。

- [ ] **Step 1: 修改 quiz.js 初始化邏輯**

在 `quiz.js` 的 `window.onload` 回調（第 1130-1133 行左右）中，讀取並套用 `quiz` 與 `sub` 參數：

```javascript
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
};
```

- [ ] **Step 2: 手動驗證效果**

在瀏覽器中載入 `quiz.html?quiz=1&sub=3`，驗證其是否直接顯示例題一的第 3 小題；載入 `quiz.html?quiz=2`，驗證其是否直接顯示例題二。

- [ ] **Step 3: Git Commit**

```bash
git add quiz.js
git commit -m "feat(quiz): 支援 url 參數 ?quiz 與 ?sub 設定初始題目狀態"
```

---

### Task 3: 擴充預覽檢視看板 (`preview_dashboard.html`)

**Files:**
- Modify: `preview_dashboard.html`

**Interfaces:**
- Consumes: `multiple_proportions.html?step=N` 參數、`quiz.html?quiz=N&sub=M` 參數。
- Produces: 平鋪新增的 iframes，展示倍比主頁多步驟狀態與測驗頁多題目狀態。

- [ ] **Step 1: 在 preview_dashboard.html 中新增 iframe 節點**

修改 `preview_dashboard.html`，在 `dashboard` grid 容器中加入倍比步驟 3, 6, 9, 10，以及 quiz 的 4 種題目狀態：

```html
<!-- 在 preview_dashboard.html 的 </main> 之前，加入以下預覽卡片： -->

        <!-- ==================== 倍比定律主頁步驟預覽 ==================== -->
        <div class="preview-card">
            <div class="card-header"><div class="card-title">📐 倍比主頁 步驟 3 (反應裝置)</div></div>
            <div class="iframe-container"><iframe src="multiple_proportions.html?step=3" title="倍比主頁 步驟 3"></iframe></div>
        </div>
        <div class="preview-card">
            <div class="card-header"><div class="card-title">📐 倍比主頁 步驟 6 (固定X)</div></div>
            <div class="iframe-container"><iframe src="multiple_proportions.html?step=6" title="倍比主頁 步驟 6"></iframe></div>
        </div>
        <div class="preview-card">
            <div class="card-header"><div class="card-title">📐 倍比主頁 步驟 9 (比較Y)</div></div>
            <div class="iframe-container"><iframe src="multiple_proportions.html?step=9" title="倍比主頁 步驟 9"></iframe></div>
        </div>
        <div class="preview-card">
            <div class="card-header"><div class="card-title">📐 倍比主頁 步驟 10 (推導分子式)</div></div>
            <div class="iframe-container"><iframe src="multiple_proportions.html?step=10" title="倍比主頁 步驟 10"></iframe></div>
        </div>

        <!-- ==================== 挑戰題測驗狀態預覽 ==================== -->
        <div class="preview-card">
            <div class="card-header"><div class="card-title">✍️ 挑戰 例題1-1</div></div>
            <div class="iframe-container"><iframe src="quiz.html?quiz=1&sub=1" title="挑戰 例題1-1"></iframe></div>
        </div>
        <div class="preview-card">
            <div class="card-header"><div class="card-title">✍️ 挑戰 例題1-2</div></div>
            <div class="iframe-container"><iframe src="quiz.html?quiz=1&sub=2" title="挑戰 例題1-2"></iframe></div>
        </div>
        <div class="preview-card">
            <div class="card-header"><div class="card-title">✍️ 挑戰 例題1-3</div></div>
            <div class="iframe-container"><iframe src="quiz.html?quiz=1&sub=3" title="挑戰 例題1-3"></iframe></div>
        </div>
        <div class="preview-card">
            <div class="card-header"><div class="card-title">✍️ 挑戰 例題2</div></div>
            <div class="iframe-container"><iframe src="quiz.html?quiz=2" title="挑戰 例題2"></iframe></div>
        </div>
```

- [ ] **Step 2: 驗證檢視看板**

開啟 `preview_dashboard.html`，確認所有平鋪 iframe 均正確渲染，無點擊即可一次性檢視定比、倍比、解析與題目的所有步驟狀態。

- [ ] **Step 3: Git Commit**

```bash
git add preview_dashboard.html
git commit -m "feat(preview): 看板追加倍比主頁與測驗狀態，實現全頁面覆蓋"
```
