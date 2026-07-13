# Multiple Proportions Explain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Law of Multiple Proportions explanation page that compares algebraic table-based scaling and geometric coordinate graphing for a 96th College Entrance Exam question.

**Architecture:** A dual-column layout beneath the question card. Clicking the left control button reveals the algebraic table with scaled X/Y mass values. Clicking the right control button triggers the Canvas coordinate graph animation showing lines, intersection heights, and a vertical bracket showing the 1:3 ratio.

**Tech Stack:** HTML5, Vanilla JavaScript, style.css.

## Global Constraints
- **Style Consistency**: Must reuse style.css and matches the SOIL theme (solid white backgrounds, charcoal borders, outfit/noto fonts, #ff7a00 orange primary highlights, #7c3aed purple secondary highlights).
- **No Browser Autoload**: Do not open browser windows for testing automatically unless requested.

---

### Task 1: Create HTML Page and Question Stem Option Selection

**Files:**
- Create: `multiple_proportions_explain.html`
- Modify: `專案報告.html`

**Interfaces:**
- Consumes: `style.css`
- Produces: Interactive options buttons and feedback area on the DOM.

- [ ] **Step 1: Write HTML layout structure**
  Create `multiple_proportions_explain.html` with:
  - SOIL Header (`挑战` and title `基礎化學 (倍比定律解析)`)
  - A href link pointing back to `multiple_proportions.html`
  - Question Card containing text, options button list (A to E), and empty feedback div.
  - Split column grid container (`explain-columns`) with Left Panel (Algebraic) and Right Panel (Geometric), initially hidden or showing empty state.
  - Control buttons bar at the bottom.

- [ ] **Step 2: Add interactivity script inside HTML**
  Add inline script to handle:
  - Highlighting chosen option (A-E)
  - Displaying explanation text inside feedback div:
    - If user clicks D: Show success message in orange: "答對了！第一個化合物為 XY，當固定 X 為 9.34g 時，Y 呈現 1:3 關係..."
    - If user clicks other: Show message: "答錯囉，可以點擊下方按鈕看看兩種解法！"

- [ ] **Step 3: Update local server files list**
  Add a link to the new explanation page in the development reports dashboard `專案報告.html`.

- [ ] **Step 4: Verify files existence**
  Verify that `multiple_proportions_explain.html` can be read and that the elements are correctly structured.
  Command: Check that the file exists and has correct tags.

- [ ] **Step 5: Commit**
  ```bash
  git add multiple_proportions_explain.html 專案報告.html
  git commit -m "feat(explain): scaffold HTML layout with interactive question options"
  ```

---

### Task 2: Implement Algebraic Representation Panel (Table and Text)

**Files:**
- Create: `multiple_proportions_explain.js`
- Modify: `multiple_proportions_explain.html`

**Interfaces:**
- Consumes: Click events on the left control button.
- Produces: Fades in algebraic table and text inside the left panel.

- [ ] **Step 1: Create explain.js script template**
  Create `multiple_proportions_explain.js` with placeholders for rendering logic.

- [ ] **Step 2: Implement Algebraic toggle in JS**
  In `multiple_proportions_explain.js`, define `showAlgebraic()` to toggle CSS active classes on the left card container.
  When active, it populates the left panel with:
  - A table styled as in the user's attachment:
    - Row 1: `XY` | `9.34` | `2`
    - Row 2: `XY_n` | `4.67 (9.34)` | `3 (6)`
  - Summary text: `則 Y 質量比 = Y 原子數比，2 : 6 = 1 : n => n = 3，故化合物為 XY₃。`

- [ ] **Step 3: Connect button click handler**
  In `multiple_proportions_explain.html`, include `<script src="multiple_proportions_explain.js?v=1"></script>` and map the click event of the left control button to `showAlgebraic()`.

- [ ] **Step 4: Verify table classes**
  Ensure that tables align to the visual grid using CSS classes.

- [ ] **Step 5: Commit**
  ```bash
  git add multiple_proportions_explain.js multiple_proportions_explain.html
  git commit -m "feat(explain): implement algebraic table rendering and text calculation"
  ```

---

### Task 3: Implement Geometric Canvas Drawing & Animation

**Files:**
- Modify: `multiple_proportions_explain.js`
- Modify: `multiple_proportions_explain.html`

**Interfaces:**
- Consumes: Click events on the right control button.
- Produces: Renders grid, points, relationship lines, and wobbly brackets on the Canvas.

- [ ] **Step 1: Implement showGeometric() trigger**
  Define `showGeometric()` to toggle CSS active classes on the right card container, initializing the Canvas and starting the animation loop.

- [ ] **Step 2: Implement coordinate grid drawing**
  Draw X-axis ($w_X$ from 0 to 12.0) and Y-axis ($w_Y$ from 0 to 8.0) usingStraight line grids.

- [ ] **Step 3: Implement points and lines animation**
  - Plot point A $(9.34, 2.00)$ for XY. Draw line with slope $2/9.34$ from origin.
  - Plot point B $(4.67, 3.00)$ for XY_n. Draw line with slope $3/4.67$ from origin.
  - Animate these lines extending outward.

- [ ] **Step 4: Draw scaling vertical line and intersection**
  - Draw a vertical dashed line at $w_X = 9.34$ (showing fixed X mass).
  - Animate intersection point at Line 2 reaching $w_Y = 6.00$.
  - Draw brackets from Y=2.00 to Y=6.00 labeled "3倍" or "1 : 3" to correspond with the algebraic calculations.

- [ ] **Step 5: Commit**
  ```bash
  git add multiple_proportions_explain.js
  git commit -m "feat(explain): implement canvas coordinate drawing with vertical scaling bracket"
  ```
