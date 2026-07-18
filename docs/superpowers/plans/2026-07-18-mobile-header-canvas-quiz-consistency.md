# Mobile Header, Canvas, and Quiz Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent mobile navigation overflow and Canvas collisions, align both law home pages, and attach the quiz D/SiC lines to the vertical center anchors of the silicon node.

**Architecture:** Keep the current static HTML/CSS/Canvas architecture. Add static regression assertions around the shared responsive CSS and renderer geometry, then make renderer-scoped coordinate changes without adding dependencies or changing teaching flow.

**Tech Stack:** HTML, CSS, browser Canvas JavaScript, Node.js `node:test`, GitHub Pages

## Global Constraints

- Mobile navigation uses a visible 2×2 tab grid; desktop and tablet keep the current single-row tabs.
- Definite and multiple-proportions pages both open on their formal first teaching step.
- Compact Canvas content reserves a footer band and derives positions from logical Canvas dimensions.
- Quiz connection geometry is shared by all quiz pages, subquestions, and states.
- No teaching values, step counts, or unrelated desktop layout are changed.

---

### Task 1: Mobile tabs and first-page parity

**Files:**
- Create: `tests/mobile-ui-consistency.test.mjs`
- Modify: `style.css:441-490`
- Modify: `multiple_proportions.html:30-43,117-120`
- Modify: `index.html`, `quiz.html`, `multiple_proportions.html`, `multiple_proportions_explain.html` asset versions

**Interfaces:**
- Consumes: existing `.soil-header`, `.soil-tabs`, `.soil-tab-btn`, and `stepTexts[0]` markup contracts.
- Produces: one shared mobile 2×2 tab layout and matching initial multiple-proportions first-step copy.

- [ ] **Step 1: Write the failing tests**

```javascript
test('mobile tabs form a bounded two-column grid', () => {
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.soil-tabs\s*\{[\s\S]*?display:\s*grid[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.soil-tab-btn\s*\{[\s\S]*?min-width:\s*0/);
});

test('multiple-proportions HTML starts on the same formal first-step pattern', () => {
  assert.match(multipleHtml, /<h1 id="step-title">第一步：建立質量關係座標系<\/h1>/);
  assert.match(multipleHtml, /以氫（H）與氧（O）組成的化合物為例/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/mobile-ui-consistency.test.mjs`

Expected: FAIL because `.soil-tabs` is still a flex row and the multiple-proportions static HTML still says `倍比定律探討`.

- [ ] **Step 3: Add the minimal shared mobile layout and initial copy**

```css
@media (max-width: 480px) {
  .soil-header > div:last-child {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr);
  }

  .soil-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .soil-tab-btn {
    min-width: 0;
    padding-inline: 0.5rem;
    text-align: center;
  }
}
```

Set the multiple-proportions static `<h1>` and `<p>` to the exact title and description from `stepTexts[0]`. Change its inline Grid tracks to `minmax(0, 1fr)` and its stacking breakpoint to `820px`, matching `index.html`. Bump `style.css` to `v=20260718_02` on all four public pages.

- [ ] **Step 4: Run the focused and existing layout tests**

Run: `node --test tests/mobile-ui-consistency.test.mjs tests/ipad-layout.test.mjs tests/project-hygiene.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add tests/mobile-ui-consistency.test.mjs style.css index.html quiz.html multiple_proportions.html multiple_proportions_explain.html
git commit -m "fix: contain mobile navigation tabs"
```

### Task 2: Compact Canvas footer separation

**Files:**
- Modify: `tests/mobile-canvas-layout.test.mjs`
- Modify: `app.js:324-428`
- Modify: `index.html` app asset version

**Interfaces:**
- Consumes: `CanvasResponsive.bottomPair(height, gap, bottomInset)` and `CanvasResponsive.wrapLines(ctx, text, maxWidth)`.
- Produces: `compactFooterLayout(height)` returning `{ conclusionY, contentBottom }`, used by compact steps 5 and 6.

- [ ] **Step 1: Add failing structural and geometry assertions**

```javascript
test('definite-law compact steps reserve content above a shared footer', () => {
  assert.match(source, /function compactFooterLayout\(height\)/);
  assert.match(source, /const footer = compactFooterLayout\(h\)/);
  assert.match(source, /const bottom = footer\.contentBottom/);
  assert.doesNotMatch(source, /const bottom = 270/);
  assert.doesNotMatch(source, /235,[\s\S]*?h - 34/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/mobile-canvas-layout.test.mjs`

Expected: FAIL because step 5 uses a fixed paragraph baseline and step 6 uses a fixed table bottom.

- [ ] **Step 3: Implement one compact footer geometry source**

```javascript
function compactFooterLayout(height) {
  const { upper: conclusionY } = CanvasResponsive.bottomPair(height, 46, 24);
  return {
    conclusionY,
    contentBottom: conclusionY - 26,
  };
}
```

For step 5, move the wrapped explanation high enough that its calculated last baseline remains at least 18 logical pixels above `conclusionY`. For step 6, derive the table `bottom`, horizontal row lines, and row centers from `contentBottom`; draw the conclusion only at `conclusionY`. Keep step 7 on the existing shared bottom-pair pattern. Bump `app.js` to `v=20260718_02` in `index.html`.

- [ ] **Step 4: Run Canvas and syntax tests**

Run: `node --test tests/mobile-canvas-layout.test.mjs tests/ipad-layout.test.mjs`

Run: `node --check app.js`

Expected: all PASS and syntax exit code 0.

- [ ] **Step 5: Commit**

```powershell
git add tests/mobile-canvas-layout.test.mjs app.js index.html
git commit -m "fix: separate compact canvas footer content"
```

### Task 3: Quiz silicon-node anchors

**Files:**
- Modify: `tests/quiz-canvas-dpr.test.mjs`
- Modify: `quiz.js:629-824`
- Modify: `quiz.html` quiz asset version

**Interfaces:**
- Consumes: silicon node center `(x1, yMid)` and half-height `18`.
- Produces: `quizVerticalAnchors(cx, cy, halfHeight)` returning `{ top: {x, y}, bottom: {x, y} }`.

- [ ] **Step 1: Add the failing shared-anchor test**

```javascript
test('D and SiC attach to the silicon node vertical center anchors', () => {
  const source = functionSection('drawQuizDiagram', 'verifyCurrentQuiz');
  assert.match(source, /const siliconAnchors = quizVerticalAnchors\(x1, yMid, 18\)/);
  assert.match(source, /siliconAnchors\.top\.x, siliconAnchors\.top\.y/);
  assert.match(source, /siliconAnchors\.bottom\.x, siliconAnchors\.bottom\.y/);
  assert.doesNotMatch(source, /x1 \+ 45, yMid [-+] 5/);
});
```

- [ ] **Step 2: Run the quiz test and verify RED**

Run: `node --test tests/quiz-canvas-dpr.test.mjs`

Expected: FAIL because the two lines currently start at the right edge of the silicon node.

- [ ] **Step 3: Implement and use the shared anchors**

```javascript
function quizVerticalAnchors(cx, cy, halfHeight) {
  return {
    top: { x: cx, y: cy - halfHeight },
    bottom: { x: cx, y: cy + halfHeight },
  };
}
```

Within `drawQuizDiagram`, calculate `const siliconAnchors = quizVerticalAnchors(x1, yMid, 18);`. Start the `D` line at `siliconAnchors.top` and the `SiC` line at `siliconAnchors.bottom`; keep their existing target nodes, colors, alpha states, and line-first rendering order. Bump `quiz.js` to `v=20260718_02` in `quiz.html`.

- [ ] **Step 4: Run quiz tests and syntax check**

Run: `node --test tests/quiz-canvas-dpr.test.mjs tests/mobile-canvas-layout.test.mjs`

Run: `node --check quiz.js`

Expected: all PASS and syntax exit code 0.

- [ ] **Step 5: Commit**

```powershell
git add tests/quiz-canvas-dpr.test.mjs quiz.js quiz.html
git commit -m "fix: anchor quiz silicon connections vertically"
```

### Task 4: Full verification and GitHub Pages deployment

**Files:**
- Verify: all modified HTML, CSS, JavaScript, and test files

**Interfaces:**
- Consumes: the three independently committed fixes.
- Produces: a verified `main` push and cache-busting GitHub Pages URLs.

- [ ] **Step 1: Run the complete Node test suite**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Run all production JavaScript syntax checks**

Run individually:

```powershell
node --check app.js
node --check quiz.js
node --check multiple_proportions.js
node --check multiple_proportions_explain.js
```

Expected: every command exits 0.

- [ ] **Step 3: Inspect diff and repository state**

Run: `git diff HEAD~3 --check`

Run: `git status --short`

Expected: no whitespace errors and a clean worktree.

- [ ] **Step 4: Push main**

Run: `git push origin main`

Expected: remote `main` advances to the local final commit.

- [ ] **Step 5: Verify Pages and hand off real-device checks**

Poll `https://crazyrming.github.io/chemistry-laws-lab/` until HTTP 200 and confirm deployed HTML references `style.css?v=20260718_02`, `app.js?v=20260718_02`, and `quiz.js?v=20260718_02` on their respective pages. Provide cache-busting URLs for the index step 5, index step 6, the multiple-proportions home, and the quiz silicon question.
