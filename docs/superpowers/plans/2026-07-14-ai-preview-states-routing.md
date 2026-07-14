# AI 渲染預覽狀態路由參數化 (AI Preview States Routing) 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 為「定比定律首頁」與「倍比定律解析頁」導入 URL 狀態參數解析，並重構「預覽檢視看板」，使其能一次性平鋪展現 11 個不同步驟與狀態的分支，加速 AI 的視覺/排版檢視。

**Architecture:** 網頁 onload 時，利用 `URLSearchParams` 取出參數直接改變 JS 內部變數狀態並呼叫渲染；重構預覽頁面，使用 CSS Grid 排版放置 11 個帶有特定狀態參數的 iframes。

**Tech Stack:** HTML5, Vanilla JavaScript, CSS Grid

## Global Constraints
- 零外部大型庫依賴，維持 Vanilla JS 離線可用。
- 代碼改動只涉及狀態初始化判定，不影響網頁原有的手動點擊邏輯。
- 專案內部測試，不需要推送到 GitHub Pages 上。

---

### Task 1: 參數化定比定律引導頁狀態 (`app.js`)

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: 無
- Produces: 載入 `index.html?step=N` 時自動定位至步驟 N，並渲染對應的圖表與反應裝置。

- [ ] **Step 1: 修改 app.js 初始化邏輯**

在 `app.js` 的 `window.addEventListener('load', ...)` 回調中，讀取 `step` 查詢參數並跳轉至該步驟：

```javascript
// 在 app.js 中 window.onload 的最尾端或初始化邏輯中加入：
const urlParams = new URLSearchParams(window.location.search);
const paramStep = parseInt(urlParams.get('step'));
if (paramStep >= 1 && paramStep <= 7) {
    currentStep = paramStep;
    updateStepUI();
}
```

- [ ] **Step 2: 手動驗證效果**

在瀏覽器中直接載入本地的 `index.html?step=3`，確認網頁載入時直接顯示「步驟 3：燃燒反應（氫氧結合）」且反應裝置圖案與說明渲染正確。

- [ ] **Step 3: Git Commit**

```bash
git add app.js
git commit -m "feat(index): 支援 url 參數 ?step 定位特定步驟"
```

---

### Task 2: 參數化倍比定律解析頁狀態 (`multiple_proportions_explain.js`)

**Files:**
- Modify: `multiple_proportions_explain.js`

**Interfaces:**
- Consumes: 無
- Produces: 載入 `multiple_proportions_explain.html?tab=geometric&fixed=X&mass=4.67` 時，直接顯示幾何面板，並預先設定好固定元素為 X，質量為 4.67 克的輔助線狀態。

- [ ] **Step 1: 修改 multiple_proportions_explain.js 載入邏輯**

在 `multiple_proportions_explain.js` 初始化區段（如檔案底部 `window.addEventListener('load')` 或變數宣告後）加入解析邏輯：

```javascript
// 尋找合適初始化點（例如 load 事件或頁面啟動處）：
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramTab = urlParams.get('tab');       // 'algebraic' or 'geometric'
    const paramFixed = urlParams.get('fixed');   // 'X' or 'Y'
    const paramMass = parseFloat(urlParams.get('mass')); // 數字

    // 1. 切換顯示 Tab
    if (paramTab === 'algebraic') {
        toggleAlgebraic();
    } else if (paramTab === 'geometric') {
        toggleGeometric();
    }

    // 2. 初始化固定元素與目標質量
    if (paramFixed === 'X' || paramFixed === 'Y') {
        fixedElement = paramFixed;
        if (!isNaN(paramMass)) {
            tempMass = paramMass;
            selectedMass = paramMass; // 設為已確認狀態，直接渲染最終推導步驟
        }
    }

    // 3. 觸發初始渲染
    renderAlgebraicWizard();
    if (geometricActive) {
        renderGeometricWizard();
        initCanvas();
        draw(1.0);
    }
});
```

- [ ] **Step 2: 手動驗證效果**

在瀏覽器中載入 `multiple_proportions_explain.html?tab=geometric&fixed=X&mass=4.67`，驗證網頁載入時直接開啟右側的「幾何表徵」，且圖表中已經畫出 X = 4.67 克的藍色垂直虛線與其在定比線上的交點。

- [ ] **Step 3: Git Commit**

```bash
git add multiple_proportions_explain.js
git commit -m "feat(explain): 支援 url 參數 tab、fixed、mass 自動設定狀態"
```

---

### Task 3: 重構快速預覽檢視看板 (`preview_dashboard.html`)

**Files:**
- Modify: `preview_dashboard.html`

**Interfaces:**
- Consumes: `index.html` 的 `?step=N` 參數、`multiple_proportions_explain.html` 的 `?tab/fixed/mass` 參數。
- Produces: 顯示 11 個 iframes 分別載入全站不同步驟與互動分支成果，並以 CSS Grid 進行網格排版。

- [ ] **Step 1: 重寫 preview_dashboard.html HTML 與 CSS**

將 `preview_dashboard.html` 的 `<body>` 與佈局重構，將 grid 改為適合 11 個 iframe 平鋪的網格佈局：

```html
<!-- 將 preview_dashboard.html 的 <main> 內容修改為： -->
<main class="dashboard-grid" id="dashboard" style="grid-template-columns: repeat(3, 1fr);">
    <!-- ==================== 定比定律 7 步驟 ==================== -->
    <div class="preview-card">
        <div class="card-header"><div class="card-title">定比 步驟 1 (index)</div></div>
        <div class="iframe-container"><iframe src="index.html?step=1"></iframe></div>
    </div>
    <div class="preview-card">
        <div class="card-header"><div class="card-title">定比 步驟 2 (index)</div></div>
        <div class="iframe-container"><iframe src="index.html?step=2"></iframe></div>
    </div>
    <div class="preview-card">
        <div class="card-header"><div class="card-title">定比 步驟 3 (index)</div></div>
        <div class="iframe-container"><iframe src="index.html?step=3"></iframe></div>
    </div>
    <div class="preview-card">
        <div class="card-header"><div class="card-title">定比 步驟 4 (index)</div></div>
        <div class="iframe-container"><iframe src="index.html?step=4"></iframe></div>
    </div>
    <div class="preview-card">
        <div class="card-header"><div class="card-title">定比 步驟 5 (index)</div></div>
        <div class="iframe-container"><iframe src="index.html?step=5"></iframe></div>
    </div>
    <div class="preview-card">
        <div class="card-header"><div class="card-title">定比 步驟 6 (index)</div></div>
        <div class="iframe-container"><iframe src="index.html?step=6"></iframe></div>
    </div>
    <div class="preview-card">
        <div class="card-header"><div class="card-title">定比 步驟 7 (index)</div></div>
        <div class="iframe-container"><iframe src="index.html?step=7"></iframe></div>
    </div>

    <!-- ==================== 倍比定律解析 4 狀態 ==================== -->
    <div class="preview-card">
        <div class="card-header"><div class="card-title">倍比代數 固定X (explain)</div></div>
        <div class="iframe-container"><iframe src="multiple_proportions_explain.html?tab=algebraic&fixed=X&mass=9.34"></iframe></div>
    </div>
    <div class="preview-card">
        <div class="card-header"><div class="card-title">倍比代數 固定Y (explain)</div></div>
        <div class="iframe-container"><iframe src="multiple_proportions_explain.html?tab=algebraic&fixed=Y&mass=3.00"></iframe></div>
    </div>
    <div class="preview-card">
        <div class="card-header"><div class="card-title">倍比幾何 固定X (explain)</div></div>
        <div class="iframe-container"><iframe src="multiple_proportions_explain.html?tab=geometric&fixed=X&mass=4.67"></iframe></div>
    </div>
    <div class="preview-card">
        <div class="card-header"><div class="card-title">倍比幾何 固定Y (explain)</div></div>
        <div class="iframe-container"><iframe src="multiple_proportions_explain.html?tab=geometric&fixed=Y&mass=6.00"></iframe></div>
    </div>
</main>
```

在 CSS 中，將 `.dashboard-grid` 設為：
`grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));`
這樣在不同解析度下，iframe 區塊都會自動重新排列，極度利於一次性預覽與 RWD 視覺比對！

- [ ] **Step 2: 手動驗證預覽畫布**

開啟 `preview_dashboard.html`，確認畫面中 11 個 iframe 全數載入，且分別呈現定比 7 步驟與倍比 4 種推導分支，完全不需要人為點擊任何下一步。

- [ ] **Step 3: Git Commit**

```bash
git add preview_dashboard.html
git commit -m "feat(preview): 重構看板為 11 狀態矩陣平鋪預覽"
```
