# 專案開發筆記 (PROJECT_NOTES)

## 開發背景與目標
配合化學教學，建立一個直觀、好懂且具有 3B1B (Manim) 動畫質感的引導式手繪動畫網頁，說明**定比定律**。
網頁支援明亮主題（奶油白 `#FAF8F5`、石墨深灰線條與皇家藍直線），藉由一個 7 步驟的流程，向學生逐步推演普魯斯特的重大化學定律。

## 目前進度 (`3b1b-style` 分支資產優化版)
- [x] 新增 `3b1b-style` 分支，與原先的虛擬實驗室區分開來。
- [x] 更新 `index.html` 結構為單頁 7 步驟的「上一步 / 下一步」雙畫布引導式版面。
- [x] 修正 X-Y 軸的下標標示，改用原生 HTML `<sub>` 標籤實現 $w_H - w_O$ 的完美渲染。
- [x] 優化座標圖圖面，將原本散落在數據點旁的座標名稱文字全部移至左上角的手繪圖例框中。
- [x] 修正歷史觀點，在步驟 5 移除原先的 H2O 微觀球棍結構，改為展示三杯不同來源的宏觀水滴對比，加深定比定律「不論物質來源其組成恆定」的宏觀本質。
- [x] **生圖模型資產整合**：使用 `generate_image` 生圖模型，為三種反應生成了三張風格極高、一致的極簡手繪線條靜態圖片（滴定管與錐形瓶、燃燒皿與冷凝罩、酒精燈與試管），存放在專案 `assets/` 資料夾下。
- [x] **Canvas 影像載入與置中**：在 `app.js` 中新增資產預載入，並在繪圖時自適應視窗大小將圖片渲染在左側 Canvas 內。
- [x] **水滴滑出軌跡校準**：重新調整水滴從反應裝置（如滴定管嘴、冷凝管口、試管口）滑出的起點，使其與生圖資產完美對接。
- [x] 驗證三個點的質量比例在隨機數值下恆為完美的 8.0。
- [x] 通過瀏覽器自動化腳本功能測試，控制台零錯誤。

## 技術實現與生圖提示
- **生成圖片提示詞 (Prompt)**：
  -Titration: `A minimalist, hand-drawn vector line art illustration of an acid-base titration setup on a solid white background. It includes a metal ring stand, a thin glass burette clamped to the stand, and a glass conical flask directly underneath. Sketchy pencil-stroke style, clean charcoal lines, no color, no labels, no text, clean scientific schematic, 3b1b mathematical video style.`
  -Combustion: `A minimalist, hand-drawn vector line art illustration of a hydrogen combustion setup on a solid white background. It includes a metal stand, a thin glass tube with a nozzle from which a small flame burns, and a glass condenser funnel positioned directly above the flame to collect condensed water. Sketchy pencil-stroke style, clean charcoal lines, no color except a tiny orange hue for the flame...`
  -Heating: `A minimalist, hand-drawn vector line art illustration of a thermal decomposition heating setup on a solid white background. It includes a metal ring stand, a horizontal glass test tube clamped to the stand, a small alcohol burner underneath heating the test tube, and a small amount of white powder inside the tube...`
