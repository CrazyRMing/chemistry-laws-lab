# 化學基本定律探索實驗室

以白底手繪動畫、座標圖與逐步引導活動，協助學生理解定比定律與倍比定律。網站將具體實驗、粒子觀點、代數推導和幾何表示並列，降低抽象化學概念的理解負擔。

## 線上使用

[開啟 GitHub Pages 教學網站](https://crazyrming.github.io/chemistry-laws-lab/)

## 學習頁面

- `index.html`：定比定律，從三種來源的水建立質量座標關係。
- `quiz.html`：定比例題，包含作答、分段提示與即時回饋。
- `multiple_proportions.html`：倍比定律，以雙畫布逐步比較兩種化合物。
- `multiple_proportions_explain.html`：倍比例題，提供代數與幾何雙重表徵引導。

## 設計特色

- 純白背景、黑灰手繪線條與固定教學色彩語意。
- 以上一步／下一步控制內容揭露，每一步只處理一個核心概念。
- Canvas 呈現實驗與座標動畫，重要公式、圖例和操作元件使用 HTML 顯示。
- 支援桌面、iPad Safari 與手機版面；Canvas 依容器尺寸與 Retina DPR 調整。
- 學生必須先明確選擇或作答，系統才會開放下一個操作或提供回饋。

## 技術

- 原生 HTML5、CSS3 與 Vanilla JavaScript。
- HTML Canvas 搭配 `requestAnimationFrame` 製作動畫。
- 無第三方執行階段相依套件，不需要建置程序。
- CSS 與圖片使用固定版本查詢參數，兼顧 Safari 更新與瀏覽器快取。

## 本機使用

直接開啟 `index.html` 即可使用。若瀏覽器限制本機檔案載入，也可在專案目錄啟動任一靜態 HTTP 伺服器。

## 驗證

專案使用 Node.js 內建測試工具檢查 iPad 版面規則、正式頁面的資產版本與專案結構：

```powershell
node --test tests\*.test.mjs
```
