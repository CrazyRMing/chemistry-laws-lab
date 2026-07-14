# 設計規格：AI 渲染預覽狀態路由參數化 (AI Preview States Routing)

本設計規格旨在為化學基本定律虛擬實驗室網站引入 URL 狀態路由，使得 AI 代理與開發者能夠在單一網頁（`preview_dashboard.html`）中，一次性檢視全站各步驟與不同互動分支的靜態渲染成果，避免高成本、低效率的 DOM 自動化點擊測試。

---

## 1. 系統架構與狀態路由設計

透過 `URLSearchParams` 解析 URL 中的查詢參數，網頁在初始化階段直接跳轉至設定狀態，略過人機互動點擊。

### 1.1 定比定律引導頁 (`app.js` / `index.html`)
* **參數名**：`step`
* **有效值**：`1` 到 `7`
* **行為**：
  * 在 `window.addEventListener('load', ...)` 或 `init` 階段讀取 `?step=N`。
  * 設定 `currentStep = N`。
  * 呼叫 `updateStepUI()` 進行即時 DOM 與 Canvas 反應圖的更新與重繪。

### 1.2 倍比定律解析頁 (`multiple_proportions_explain.js` / `multiple_proportions_explain.html`)
* **參數名**：
  * `tab`：`algebraic` (顯示代數表徵面板) 或 `geometric` (顯示幾何表徵面板)
  * `fixed`：`X` 或 `Y` (設定步驟 1 已固定之元素)
  * `mass`：數字，如 `9.34` 或 `3.00` (設定步驟 2 已選擇之固定質量)
* **行為**：
  * **Tab 切換**：若 `tab=algebraic` 則自動模擬點擊顯示代數面板；若 `tab=geometric` 則自動模擬點擊幾何面板。
  * **固定元素與目標質量設定**：
    * 若同時包含 `fixed` 與 `mass` 參數，則直接跳過步驟 1 和 2 的互動。
    * 將內部狀態變數 `fixedElement = fixed`、`tempMass = mass`、`selectedMass = mass` 進行同步設定。
    * 觸發 `renderAlgebraicWizard()`、`renderGeometricWizard()` 與 Canvas 重繪，直接呈現出已縮放的表格數據及包含藍色交點輔助線的座標圖。

---

## 2. 預覽檢視看板重構 (`preview_dashboard.html`)

重新設計檢視看板，將其從單頁預覽重構為**「全步驟狀態渲染矩陣」**，以網格佈局平鋪展示所有狀態：

### 2.1 定比定律展示矩陣 (7 個 iframe)
* 步驟 1 (引言)：`index.html?step=1`
* 步驟 2 (酸鹼滴定反應)：`index.html?step=2`
* 步驟 3 (氫氣燃燒反應)：`index.html?step=3`
* 步驟 4 (熱分解反應)：`index.html?step=4`
* 步驟 5 (微觀碰撞結合反應)：`index.html?step=5`
* 步驟 6 (實驗數據座標繪製)：`index.html?step=6`
* 步驟 7 (定比定律總結)：`index.html?step=7`

### 2.2 倍比定律代數與幾何展示矩陣 (4 個 iframe)
* 代數表徵 (固定 X 9.34)：`multiple_proportions_explain.html?tab=algebraic&fixed=X&mass=9.34`
* 代數表徵 (固定 Y 3.00)：`multiple_proportions_explain.html?tab=algebraic&fixed=Y&mass=3.00`
* 幾何表徵 (固定 X 4.67)：`multiple_proportions_explain.html?tab=geometric&fixed=X&mass=4.67`
* 幾何表徵 (固定 Y 6.00)：`multiple_proportions_explain.html?tab=geometric&fixed=Y&mass=6.00`

---

## 3. 測試與驗證計劃

1. **手動測試**：
   * 在瀏覽器中載入 `index.html?step=4`，驗證其是否直接停留在步驟 4 (熱分解反應) 且動畫起點正確。
   * 在瀏覽器中載入 `multiple_proportions_explain.html?tab=geometric&fixed=X&mass=9.34`，驗證其是否直接顯示幾何表徵面板，且 Canvas 上已正確畫出 X = 9.34 的藍色虛線與交點。
2. **AI 視覺檢視**：
   * 開啟 `preview_dashboard.html`，AI 可以透過單次截圖，直接檢視以上 11 個不同步驟與分支的樣式與排版。
