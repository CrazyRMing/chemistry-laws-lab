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

## 2026-07-10 今日完成事項 (SOIL 風格重製 + A版本簡報)

### 完成
- [x] **SOIL 風格重製**：全面移除雜色，改用黑/白/灰 + 橘色單一焦點；新增 SOIL 頁眉（黑底頁碼方框 + 橘色標線）、底部 takeaway box。
- [x] **圖例移出 Canvas**：改用 HTML flex 區塊渲染圖例，清空畫布左上角空間，消除文字切邊與物件重疊。
- [x] **斜率文字定位**：移至畫布左上角空白區，橘色顯示，無重疊。
- [x] **燃燒實驗設備簡化**：Step 3 改用單純酒精燈插圖。
- [x] **加熱試管傾斜修正**：Step 4 改用使用者提供之正確傾斜圖（加熱端右側翹高，管口左側朝下），符合化學實驗安全規範。
- [x] **定比線半透明置底**：先繪製 `rgba(255,122,0,0.55)` 定比線，再繪製數據點，確保點覆蓋於線上。
- [x] **下一步按鈕修正**：修復白底白字隱形問題，改為橘底白字黑框。
- [x] **新增 Step 8 微觀解釋**：Canvas 手繪三個 H₂O 分子（帶擺動動畫），說明定比定律的原子層級成因。
- [x] **防快取機制**：圖片 src 加上 `?v=Date.now()` 防快取時間戳。
- [x] **安裝全域技能**：`soil-teaching-slides` 技能包安裝至 `C:\Users\user\.gemini\config\skills\`。
- [x] **A 版本簡報生成**：為 8 個步驟分別生圖（手繪 SOIL 16:9 格式），以 `pack_images_to_pptx.py` 封裝輸出 `定比定律教學簡報(A版本).pptx`（3 MB，8 slides，8 媒體圖）。
- [x] **圖例欄位對齊**：利用 CSS Grid 將圖例版面重構為雙欄網格，確保兩列點標記垂直對齊。
- [x] **字體風格優化**：應使用者要求，將拙黑體還原為原本清晰精緻的原生黑體字型系統（與 EB Garamond 襯線字體），兼顧畫面整潔與教學易讀性。
- [x] **打包與瘦身**：自專案資產中清理 15 MB 的 font 檔以保持 Git 庫輕量化。

### 踩坑筆記
- `heating.png` 傾斜方向 AI 生圖容易搞錯；最終使用者直接提供參考圖，複製覆蓋最可靠。
- Canvas 圖例框畫在 canvas 內容易切字，移到 HTML 是根本解法；使用 Flex 換行對齊時會因為各字串寬度不等導致圖例點參差不齊，改用 CSS Grid 網格是解決垂直對齊最簡單、最穩固的方案。
- `pack_images_to_pptx.py` 為純 stdlib，不依賴 python-pptx，可直接執行。

- [x] **新增倍比定律互動網頁**：新建 `multiple_proportions.html` 與 `multiple_proportions.js`，包含 11 個互動步驟，推導化合物 I (水) 與化合物 II (雙氧水) 的質量關係與化學式，並提供首頁頁眉導覽切換。

### 下一步 (待議)
- [ ] 考慮製作 B 版本（可編輯 PPTX，文字可改）。
- [ ] 考慮部署至 GitHub Pages 供學生線上瀏覽互動動畫。
