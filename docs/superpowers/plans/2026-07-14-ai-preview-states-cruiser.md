# AI 真實尺寸單一 iframe 巡航預覽器 (Diagnostic Cruiser) 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將「預覽檢視看板 (preview_dashboard.html)」從多個 iframe 平鋪網格，重構為「單一真實尺寸（Desktop 寬度）iframe 巡航器」，提供自動化巡航與手動狀態清單切換，使 AI 代理與開發者能夠在百分之百真實排版尺寸下快速檢視全站 19 個狀態。

**Architecture:** 
- 左側為 `control-panel`，展示 19 個核心步驟與狀態的分支連結按鈕，並提供「自動巡航」開關。
- 右側為 100% 寬高填充的 `main-iframe`（保持電腦大螢幕寬度，無 CSS scale 縮放，不觸發手機版 RWD）。
- JavaScript 定義 `states` 陣列，控制自動巡航間隔切換 iframe `src`。

**Tech Stack:** HTML5, Vanilla JavaScript, CSS Flexbox

## Global Constraints
- 零外部庫依賴，維持 Vanilla JS 離線可用。
- iframe 寬高比必須呈現真實的電腦版視窗（如寬 100%，或限定真實大尺寸寬度，避免縮小）。
- 專案內部測試，不需要推送到 GitHub Pages 上。

---

### Task 1: 重構預覽檢視看板 (`preview_dashboard.html`)

**Files:**
- Modify: `preview_dashboard.html`

**Interfaces:**
- Consumes: `states` 陣列中的 19 個狀態 URL。
- Produces: 真實寬度 iframe 巡航渲染介面。

- [ ] **Step 1: 重寫 preview_dashboard.html**

覆寫 `preview_dashboard.html` 的 HTML 結構與 CSS 樣式，重構為巡航器版面：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>真實尺寸渲染巡航看板 - AI & Developer Dashboard</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #FAF8F5;
            --border-color: #2b2b2b;
            --text-primary: #1f1f1f;
            --text-secondary: #5f5f5f;
            --color-orange: #ff7a00;
            --color-purple: #7c3aed;
            --color-green: #2e7d32;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-primary);
            font-family: 'Outfit', 'Noto Sans TC', sans-serif;
            padding: 1.5rem;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 3px solid var(--border-color);
            background: #ffffff;
            border-radius: 16px;
            padding: 1rem 1.5rem;
            box-shadow: 4px 5px 0px rgba(43, 43, 43, 0.08);
            margin-bottom: 1.5rem;
            flex-shrink: 0;
        }

        .title-area h1 {
            font-size: 1.3rem;
            font-weight: 800;
            color: var(--text-primary);
        }

        .title-area p {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-top: 0.1rem;
        }

        .cruiser-container {
            display: flex;
            gap: 1.5rem;
            flex-grow: 1;
            min-height: 0; /* Important for flex child scrolling */
            margin-bottom: 1rem;
        }

        .control-panel {
            width: 320px;
            border: 3px solid var(--border-color);
            background: #ffffff;
            border-radius: 16px;
            padding: 1.2rem;
            display: flex;
            flex-direction: column;
            box-shadow: 4px 5px 0px rgba(43, 43, 43, 0.08);
            flex-shrink: 0;
        }

        .panel-title {
            font-size: 1rem;
            font-weight: bold;
            margin-bottom: 0.8rem;
            border-bottom: 2px dashed rgba(43,43,43,0.15);
            padding-bottom: 0.4rem;
        }

        .cruise-btn {
            background: #ffffff;
            border: 2px solid var(--border-color);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 2px 2px 0px var(--border-color);
            width: 100%;
            margin-bottom: 0.8rem;
            text-align: center;
        }

        .cruise-btn:hover {
            transform: translate(-1px, -1px);
            box-shadow: 3px 3px 0px var(--border-color);
        }

        .status-list {
            flex-grow: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            padding-right: 0.2rem;
        }

        .state-item {
            background: #ffffff;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 0.6rem 0.8rem;
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
            text-align: left;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .state-item:hover {
            border-color: var(--border-color);
            background: #f9fafb;
        }

        .state-item.active {
            border-color: var(--border-color);
            background: var(--border-color);
            color: #ffffff;
            font-weight: 700;
        }

        .iframe-wrapper {
            flex-grow: 1;
            border: 3px solid var(--border-color);
            border-radius: 16px;
            overflow: hidden;
            background: #ffffff;
            box-shadow: 5px 6px 0px rgba(43, 43, 43, 0.08);
            display: flex;
            flex-direction: column;
        }

        .iframe-header {
            background: #f9fafb;
            border-bottom: 2.5px solid var(--border-color);
            padding: 0.6rem 1.2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
            font-weight: 700;
            flex-shrink: 0;
        }

        .iframe-container {
            flex-grow: 1;
            position: relative;
            background: #ffffff;
        }

        iframe {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
        }
    </style>
</head>
<body>

    <header>
        <div class="title-area">
            <h1>🔍 真實尺寸渲染巡航看板</h1>
            <p>AI 專用診斷環境 — 單一 100% 真實電腦解析度 iframe 輪播載入，防止 RWD 觸發或 CSS 縮放失真</p>
        </div>
        <div style="font-size: 0.85rem; font-weight: bold; color: var(--text-secondary);" id="cruise-status">
            狀態：等待操作
        </div>
    </header>

    <div class="cruiser-container">
        <!-- 左側控制面板 -->
        <div class="control-panel">
            <div class="panel-title">自動巡航控制</div>
            <button id="btn-start" class="cruise-btn" style="background: var(--color-green); color: white;" onclick="startCruise()">▶ 開始自動巡航</button>
            <button id="btn-stop" class="cruise-btn" style="background: #ef4444; color: white; display: none;" onclick="stopCruise()">⏹ 停止巡航</button>
            
            <div class="panel-title" style="margin-top: 0.5rem;">狀態路由清單</div>
            <div class="status-list" id="status-list">
                <!-- 動態注入 -->
            </div>
        </div>

        <!-- 右側展示面板 -->
        <div class="iframe-wrapper">
            <div class="iframe-header">
                <span id="current-state-title">🧪 定比步驟 1 (引言)</span>
                <span id="current-state-url" style="color: var(--text-secondary); font-family: monospace; font-weight: normal;">index.html?step=1</span>
            </div>
            <div class="iframe-container">
                <iframe id="main-iframe" src="index.html?step=1"></iframe>
            </div>
        </div>
    </div>

    <script>
        const states = [
            { name: "🧪 定比步驟 1 (引言)", url: "index.html?step=1" },
            { name: "🧪 定比步驟 2 (滴定)", url: "index.html?step=2" },
            { name: "🧪 定比步驟 3 (燃燒)", url: "index.html?step=3" },
            { name: "🧪 定比步驟 4 (分解)", url: "index.html?step=4" },
            { name: "🧪 定比步驟 5 (微觀)", url: "index.html?step=5" },
            { name: "🧪 定比步驟 6 (座標)", url: "index.html?step=6" },
            { name: "🧪 定比步驟 7 (總結)", url: "index.html?step=7" },
            { name: "📐 倍比步驟 3 (反應裝置)", url: "multiple_proportions.html?step=3" },
            { name: "📐 倍比步驟 6 (固定X)", url: "multiple_proportions.html?step=6" },
            { name: "📐 倍比步驟 9 (比較Y)", url: "multiple_proportions.html?step=9" },
            { name: "📐 倍比步驟 10 (推導結果)", url: "multiple_proportions.html?step=10" },
            { name: "📖 倍比解析代數 固定X", url: "multiple_proportions_explain.html?tab=algebraic&fixed=X&mass=9.34" },
            { name: "📖 倍比解析代數 固定Y", url: "multiple_proportions_explain.html?tab=algebraic&fixed=Y&mass=3.00" },
            { name: "📖 倍比解析幾何 固定X", url: "multiple_proportions_explain.html?tab=geometric&fixed=X&mass=4.67" },
            { name: "📖 倍比解析幾何 固定Y", url: "multiple_proportions_explain.html?tab=geometric&fixed=Y&mass=6.00" },
            { name: "✍️ 挑戰 例題 1-1", url: "quiz.html?quiz=1&sub=1" },
            { name: "✍️ 挑戰 例題 1-2", url: "quiz.html?quiz=1&sub=2" },
            { name: "✍️ 挑戰 例題 1-3", url: "quiz.html?quiz=1&sub=3" },
            { name: "✍️ 挑戰 例題 2", url: "quiz.html?quiz=2" }
        ];

        let currentIndex = 0;
        let cruiseInterval = null;

        // Render status items
        const listContainer = document.getElementById('status-list');
        states.forEach((state, index) => {
            const item = document.createElement('div');
            item.className = 'state-item' + (index === 0 ? ' active' : '');
            item.innerHTML = `<span>${state.name}</span><span style="font-size: 0.7rem; color: #888888;">#${index+1}</span>`;
            item.onclick = () => selectState(index);
            listContainer.appendChild(item);
        });

        function selectState(index) {
            currentIndex = index;
            const state = states[index];
            
            // UI updates
            document.querySelectorAll('.state-item').forEach((item, i) => {
                item.className = 'state-item' + (i === index ? ' active' : '');
            });
            
            document.getElementById('current-state-title').textContent = state.name;
            document.getElementById('current-state-url').textContent = state.url;
            
            // Set iframe src
            document.getElementById('main-iframe').src = state.url;
            
            // Scroll selected item into view smoothly
            const selectedItem = listContainer.children[index];
            selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function startCruise() {
            if (cruiseInterval) return;
            document.getElementById('btn-start').style.display = 'none';
            document.getElementById('btn-stop').style.display = 'block';
            document.getElementById('cruise-status').textContent = '狀態：自動巡航中...';
            
            cruiseInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % states.length;
                selectState(currentIndex);
            }, 2500); // 2.5 seconds per state to allow smooth canvas drawing
        }

        function stopCruise() {
            if (!cruiseInterval) return;
            clearInterval(cruiseInterval);
            cruiseInterval = null;
            document.getElementById('btn-start').style.display = 'block';
            document.getElementById('btn-stop').style.display = 'none';
            document.getElementById('cruise-status').textContent = '狀態：已暫停巡航';
        }
    </script>
</body>
</html>
```

- [ ] **Step 2: 手動驗證預覽畫布**

開啟 `preview_dashboard.html`，點選各個狀態連結，確認右側 iframe 能以 100% 電腦解析度真實渲染各步驟，且沒有任何版面壓縮；再點選「開始自動巡航」，確認能平滑且依序地輪播所有狀態。

- [ ] **Step 3: Git Commit**

```bash
git add preview_dashboard.html
git commit -m "feat(preview): 重構看板為大螢幕單一 iframe 巡航診斷器"
```
