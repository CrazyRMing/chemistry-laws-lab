# Design Spec: Law of Multiple Proportions Explanation Page

This document specifies the design for a new interactive educational page comparing the traditional algebraic representation (table scaling) and geometric representation (coordinate graph intersection) of a Law of Multiple Proportions exam question (from the 96th College Entrance Exam).

## Goals & Context

- **Question Stem**:
  "今有二種不同元素 X 及 Y，化合為兩個含此二種元素的化合物。第一個化合物是由 9.34 克的 X 和 2.00 克的 Y 化合而成；而第二個化合物是由 4.67 克的 X 和 3.00 克的 Y 化合而成。如果第一個化合物的分子式是 XY，那麼第二個化合物的分子式為下列何者？ (A) X₂Y (B) XY₂ (C) X₃Y (D) XY₃ (E) X₂Y₂"
  Correct answer: (D) XY₃.
- **Aesthetic**: Follows the established SOIL visual style (solid white background, charcoal text and borders, high-contrast orange `#ff7a00` for primary/algebraic highlights, and purple `#7c3aed` for secondary/geometric highlights).
- **Layout**: Split double panel layout beneath the question header, comparing algebraic table calculations side-by-side with a geometric Canvas coordinate diagram.

## Design Details

### 1. HTML Layout (multiple_proportions_explain.html)
- **Header**: SOIL navigation header with page marker `挑戰` and title `基礎化學 (倍比定律解析)`.
- **Question Card**:
  - Displays the 96th Exam Question stem clearly.
  - Interactive options buttons (A) to (E). Option (D) shows correct state, other buttons show incorrect state.
  - Interactive feedback area below the options showing response explanation.
- **Comparative Body (CSS Grid)**:
  - Left panel: Algebraic table showing X and Y mass values, with Compound 2 values scaled by 2 (e.g. `4.67 (9.34)` and `3.00 (6.00)`) to align X mass.
  - Right panel: Canvas coordinate diagram (w_X as horizontal axis, w_Y as vertical axis).
- **Controls**: Two button triggers: "顯示代數表徵" (left) and "顯示幾何表徵" (right).

### 2. JS Interaction & Drawing (multiple_proportions_explain.js)
- **State variables**:
  - `selectedOption`: Track user choice for the question stem (A-E).
  - `algebraicActive`: Track if the algebraic panel is shown.
  - `geometricActive`: Track if the geometric canvas animation is shown.
- **Canvas scale**:
  - X axis: X element mass $w_X$ from 0 to 12.0 g.
  - Y axis: Y element mass $w_Y$ from 0 to 8.0 g.
- **Canvas elements**:
  - Plot point $(9.34, 2.00)$ for Compound 1. Draw relationship line $y = (2/9.34)x$.
  - Plot point $(4.67, 3.00)$ for Compound 2. Draw relationship line $y = (3/4.67)x$.
  - Draw wobbly dotted vertical auxiliary line at $w_X = 9.34$ (fixed X mass).
  - Highlight intersection point on Line 1 at $(9.34, 2.00)$ and Line 2 at $(9.34, 6.00)$.
  - Draw vertical bracket on X=9.34 from Y=2.00 to Y=6.00 to show the 1:3 ratio.

### 3. File List
- **New Page**: `multiple_proportions_explain.html`
- **New JS**: `multiple_proportions_explain.js`
- **Asset updates**: Modify `專案報告.html` to log the new feature.
