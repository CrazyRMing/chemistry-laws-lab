# Quiz iPad Canvas DPR 修正設計

## 問題與根因

`quiz.js` 先將 Canvas backing store 設為 CSS 顯示尺寸乘上 `devicePixelRatio`，再用 `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` 建立 CSS 邏輯座標系；但主關係圖與提示圖接著又以 `canvas.width`、`canvas.height` 作為繪圖寬高。這兩個屬性是已乘 DPR 的實體像素，因此在 iPad Retina 螢幕上被繪圖 transform 再放大一次，造成右側與下方內容超出畫布並被裁切。

## 目標

修正 `quiz.html` 主關係圖與三張提示圖的所有同類 DPR／Canvas 尺寸問題，使內容在 iPad 橫向、直向及桌面瀏覽器都完整落在 Canvas 邊界內，同時保持目前教學流程與畫面比例。

## 設計

### 共用尺寸流程

在 `quiz.js` 建立一個頁面內共用的 Canvas 尺寸函式，輸入 Canvas、CSS 邏輯寬度與高度，負責：

1. 讀取 `window.devicePixelRatio || 1`。
2. 將 `canvas.width`、`canvas.height` 設為邏輯尺寸乘 DPR 後的整數 backing-store 尺寸。
3. 將邏輯尺寸保存為 `canvas.logicalWidth`、`canvas.logicalHeight`。
4. 對 context 執行 `setTransform(dpr, 0, 0, dpr, 0, 0)`。
5. 不寫入 `canvas.style.width` 或 `canvas.style.height`。

### 主關係圖

- CSS 負責 `quizCanvas` 的顯示寬度，維持現有 `16 / 13` wrapper 比例。
- `resizeCanvas()` 以 wrapper 的 `clientWidth` 計算邏輯高度 `width * 13 / 16`。
- `drawQuizDiagram()` 使用 `logicalWidth`、`logicalHeight`，不再使用 backing-store 的 `canvas.width`、`canvas.height` 計算節點座標。
- `ResizeObserver` 監看主圖 wrapper，並用 `requestAnimationFrame` 合併短時間內的重複 resize；保留 window resize／orientation fallback。

### 三張提示圖

- 顯示寬度繼續跟隨各自容器，CSS 邏輯高度維持 250px。
- 每次顯示或動畫重繪前，透過同一個尺寸函式準備 backing store。
- `drawWeightRatioDiagram()` 使用容器寬度與 250px 邏輯高度繪製，不再以 DPR 實體像素計算座標。

## 不在本次範圍

- 不修改右側題目、輸入欄、提示步驟、答案判斷或導覽流程。
- 不修改圖形節點的相對位置、顏色、文字或動畫時間。
- 不調整其他三個正式教學頁面。
- 不新增第三方套件或建置流程。

## 測試與驗證

1. 先新增會在目前程式失敗的靜態回歸測試，確認：
   - 主圖與提示圖繪圖不使用 `canvas.width`、`canvas.height` 作為邏輯座標。
   - JS 不寫入 Canvas inline `style.width`、`style.height`。
   - 四個 Canvas 共用一致的 DPR backing-store 尺寸函式。
   - 主圖 wrapper 由 `ResizeObserver` 監看。
2. 執行既有 iPad 版面與 project hygiene 測試。
3. 執行 `node --check quiz.js` 與 `git diff --check`。
4. 更新 `quiz.js` 查詢版本，推送 GitHub Pages，輪詢至新版本部署完成。
5. 使用 iPad 橫向與直向實機確認主圖及三張提示圖沒有裁切；在收到實機結果前，只宣稱程式與部署驗證通過，不宣稱視覺問題最終解決。

## 成功條件

- 主圖五個元素節點、三個化合物圓形、四個菱形及所有連線皆在外框內完整顯示。
- 三張提示圖在展開、動畫播放及旋轉裝置後皆完整顯示。
- 右側作答流程與既有測試不變。
- 所有自動化檢查通過，GitHub Pages 引用新的 `quiz.js` 版本。
