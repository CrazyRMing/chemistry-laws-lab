# AntiGravity 專案協同開發指南

本專案是用於說明**定比定律 (Law of Definite Proportions)** 與 **倍比定律 (Law of Multiple Proportions)** 的互動網頁動畫實驗室。

## 開發技術棧
- **核心**：HTML5 + Vanilla JavaScript (ES6+)
- **樣式**：Vanilla CSS (深色模式配色的玻璃擬物化 Glassmorphism 設計，配合 Outfit/Inter 字型)
- **動畫技術**：HTML5 Canvas 粒子引擎

## 協作規則
1. **極簡與效率 (Ponytail 模式)**：
   - 儘可能避免引入外部大型 JS/CSS 庫（如 Bootstrap、Tailwind 或複雜的 React/Vite 框架）。
   - 保留程式碼的簡單與純粹性，無須編譯即可透過瀏覽器直接開啟（方便於因材網系統、外掛中離線使用）。
2. **視覺效果與美學 (Aesthetics)**：
   - 使用精美的高對比度漸層與毛玻璃卡片。
   - 粒子碰撞結合必須有流暢的動態過渡動畫與反彈效果。
3. **專案筆記更新**：
   - 每當階段性功能完成或有新發現，必須隨時更新 `PROJECT_NOTES.md`，並在收工前編譯/同步至 `專案報告.html`。
