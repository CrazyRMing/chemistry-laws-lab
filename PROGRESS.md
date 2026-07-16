# 專案進度

## 目前狀態

- 專案目標：以白底手繪動畫、座標圖與逐步引導活動，協助學生理解定比定律與倍比定律。
- 正式網站：https://crazyrming.github.io/chemistry-laws-lab/
- 本輪專案清理、iPad Safari 版面修正與 Quiz Canvas DPR 修正均已完成。
- `main` 已與 `origin/main` 同步，GitHub Pages 已部署。
- 目前沒有已知未完成問題。

## 2026-07-16

### 完成事項

- 修正 iPad Mini Safari 的雙欄 Grid 重疊、中央間隔消失、Canvas 高度裁切與圖例文字碰撞。
- 讓 CSS 負責 Canvas 顯示尺寸，JavaScript 只管理 Retina DPR backing store 與邏輯繪圖尺寸。
- 修正 Quiz 主關係圖與三張提示圖誤用 `canvas.width`、`canvas.height` 導致的二次 DPR 放大與裁切。
- 加入 Canvas wrapper `ResizeObserver`、視窗旋轉重繪與固定資產快取版本。
- 移除重複的專案筆記與未被正式導覽引用的 `index_3b1b.html`、`app_3b1b.js`。
- 更新 `README.md`，使內容符合目前白底手繪、逐步引導的四頁式教學網站。
- 建立並使用 `fix-ipad-safari-canvas-layout` 全域 Skill。
- 更新 `PROJECT_NOTES.md`，並同步至 `專案報告.html`。

### 驗證

- Node 自動化測試：14/14 通過。
- `app.js`、`multiple_proportions.js`、`multiple_proportions_explain.js`、`quiz.js` 語法檢查通過。
- GitHub Pages 建置成功，公開頁面回應 HTTP 200。
- iPad 實機已確認首頁雙欄與 Quiz 左側關係圖正常顯示。

### 發布狀態

- 最新功能提交：`14b031e`（Quiz Canvas 使用邏輯像素）。
- 最新收工紀錄提交：`feab748`。
- 遠端分支：`origin/main`。

### 下次開工起點

- 先讀取 `README.md`、`PROGRESS.md`、`TODO.md` 與專案工作規則。
- 若收到新的 Canvas 版面需求，修改後先執行三組 Node 測試，再進行 iPad 橫向與直向實機驗證。
