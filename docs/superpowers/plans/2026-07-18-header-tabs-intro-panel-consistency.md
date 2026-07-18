# Header, Tabs, and Intro Panel Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the two example pages share the `挑戰` badge, make the two law home pages share the multiple-proportions hand-drawn intro style, and make only the current tab white.

**Architecture:** Keep the existing four-page static architecture. Shared tab appearance stays in `style.css`; page identity remains in HTML; quiz JavaScript stops replacing the identity badge; only the definite-proportions step-one Canvas branch is redrawn to match the existing multiple-proportions composition.

**Tech Stack:** Static HTML, CSS custom properties, Canvas 2D, vanilla JavaScript, Node.js built-in test runner.

## Global Constraints

- The two example pages must display `挑戰`; the two law home pages continue to display `01` initially and may keep their existing step-number behavior.
- The active tab is white with Prussian-blue text; all inactive tabs are Prussian blue with white text.
- Every page must contain exactly one `.soil-tab-btn.active`.
- Mobile tabs remain a bounded 2×2 grid.
- The definite-proportions first-step panel adopts the multiple-proportions inner hand-drawn frame without copying its teaching text.
- Do not change chart, data-point, legend, chemical-element, or teaching-series colors.
- Do not add dependencies or change routes, lesson order, answer logic, or later Canvas steps.

---

### Task 1: Unify example badges and tab state semantics

**Files:**
- Modify: `tests/interface-theme.test.mjs`
- Modify: `quiz.html:134`
- Modify: `quiz.js:1035-1087`
- Modify: `style.css:332-362`
- Modify: `index.html:11,220`
- Modify: `quiz.html:11,419`
- Modify: `multiple_proportions.html:11`
- Modify: `multiple_proportions_explain.html:18`
- Modify: `tests/project-hygiene.test.mjs`

**Interfaces:**
- Consumes: existing `.soil-tab-btn`, `.soil-tab-btn.active`, `--theme-primary`, `--theme-primary-hover`, and `--theme-on-primary` tokens.
- Produces: one visual convention in which inactive tabs are blue and the single active tab is white; static `挑戰` identity on both example pages.

- [ ] **Step 1: Add failing badge and tab-state tests**

Append tests equivalent to the following to `tests/interface-theme.test.mjs`:

```js
test('each production page has exactly one active tab', () => {
  for (const [name, page] of Object.entries(pages)) {
    assert.equal(
      [...page.matchAll(/class="soil-tab-btn active"/g)].length,
      1,
      `${name} must identify exactly one current tab`,
    );
  }
});

test('example pages use a stable challenge badge', () => {
  assert.match(pages['quiz.html'], /id="quiz-page-num">挑戰<\/div>/);
  assert.match(pages['multiple_proportions_explain.html'], /class="soil-page-num">挑戰<\/div>/);
  assert.doesNotMatch(quiz, /quiz-page-num'\)\.textContent\s*=\s*'(?:09|10)'/);
});

test('only the active tab is white', () => {
  const inactive = css.match(/\.soil-tab-btn\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  const active = css.match(/\.soil-tab-btn\.active\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(inactive, /background:\s*var\(--theme-primary/);
  assert.match(inactive, /color:\s*var\(--theme-on-primary/);
  assert.match(active, /background:\s*#ffffff/);
  assert.match(active, /color:\s*var\(--theme-primary/);
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run:

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/interface-theme.test.mjs
```

Expected: FAIL because `quiz.html` starts at `09`, `quiz.js` writes `09` and `10`, and inactive tabs are white.

- [ ] **Step 3: Implement the minimal badge and tab changes**

In `quiz.html`, use:

```html
<div class="soil-page-num" id="quiz-page-num">挑戰</div>
```

In `quiz.js`, remove both assignments to `quiz-page-num`; leave `quiz-title`, `quiz-desc`, `quiz-indicator`, question navigation, and validation untouched.

In `style.css`, make the base, hover, and active rules follow this state model:

```css
.soil-tab-btn {
    background: var(--theme-primary, #003153);
    color: var(--theme-on-primary, #ffffff);
}

.soil-tab-btn:hover {
    background: var(--theme-primary-hover, #174a6b) !important;
    color: var(--theme-on-primary, #ffffff) !important;
}

.soil-tab-btn.active,
.soil-tab-btn.active:hover {
    background: #ffffff !important;
    color: var(--theme-primary, #003153) !important;
}
```

Preserve the existing border geometry, padding, stacking, and mobile 2×2 rules.

Update all four stylesheet URLs from `style.css?v=20260718_03` to `style.css?v=20260718_04`, update `quiz.js` to `quiz.js?v=20260718_04`, and update the exact cache assertions in `tests/project-hygiene.test.mjs` and `tests/interface-theme.test.mjs`.

- [ ] **Step 4: Run focused and mobile tests**

Run:

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/interface-theme.test.mjs tests/mobile-ui-consistency.test.mjs tests/project-hygiene.test.mjs
```

Expected: all selected tests PASS; the mobile two-column assertion remains green.

- [ ] **Step 5: Commit Task 1**

```powershell
git add style.css index.html quiz.html quiz.js multiple_proportions.html multiple_proportions_explain.html tests/interface-theme.test.mjs tests/project-hygiene.test.mjs
git commit -m "fix: clarify current tab and challenge badges"
```

---

### Task 2: Match the definite-proportions intro panel to the hand-drawn baseline

**Files:**
- Modify: `tests/mobile-canvas-layout.test.mjs`
- Modify: `app.js:506-516`
- Modify: `index.html:220`
- Modify: `tests/project-hygiene.test.mjs`

**Interfaces:**
- Consumes: `drawWobblyRect(ctx, x, y, w, h, color, fill, fillColor, width, seed)`, `COLOR_WHITE`, `COLOR_BLACK`, `COLOR_GREY`, `FONT_MATH`, and `FONT_SMALL` from `app.js`.
- Produces: a first-step definite-proportions composition with the same `30, 40, w - 60, h - 80` inner frame geometry as the multiple-proportions first step.

- [ ] **Step 1: Add a failing structural Canvas test**

In `tests/mobile-canvas-layout.test.mjs`, add:

```js
test('definite and multiple law intros share the hand-drawn frame geometry', () => {
  assert.match(
    app,
    /currentStep === 1[\s\S]*?drawWobblyRect\(ctxF, 30, 40, w - 60, h - 80, COLOR_WHITE, true, COLOR_BLACK, 3, 20\)/,
  );
  assert.match(
    multiple,
    /currentStep === 1[\s\S]*?drawWobblyRect\(ctxF, 30, 40, w - 60, h - 80, '#2b2b2b', true, '#ffffff', 3, 20\)/,
  );
  assert.match(app, /定比定律實驗演示 🧪/);
  assert.match(app, /收集並定量分析三種不同化學反應產生的水滴/);
});
```

If `app` or `multiple` is not already loaded in this test file, load both with `readFileSync` beside the existing fixtures.

- [ ] **Step 2: Run the focused test and confirm failure**

Run:

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/mobile-canvas-layout.test.mjs
```

Expected: FAIL because the definite-proportions first step does not draw an inner frame.

- [ ] **Step 3: Implement the matching first-step composition**

Replace only the `currentStep === 1` branch in `app.js` with the same frame geometry and text alignment used by the multiple-proportions intro:

```js
if (currentStep === 1) {
    ctxF.save();
    drawWobblyRect(ctxF, 30, 40, w - 60, h - 80, COLOR_WHITE, true, COLOR_BLACK, 3, 20);
    ctxF.fillStyle = COLOR_WHITE;
    ctxF.font = FONT_MATH;
    ctxF.textAlign = 'center';
    ctxF.fillText('定比定律實驗演示 🧪', w / 2, h / 2 - 10);
    ctxF.font = FONT_SMALL;
    ctxF.fillStyle = COLOR_GREY;
    ctxF.fillText('收集並定量分析三種不同化學反應產生的水滴', w / 2, h / 2 + 25);
    ctxF.restore();
}
```

Update `index.html` from `app.js?v=20260718_02` to `app.js?v=20260718_03` and update the exact script-version assertion in `tests/project-hygiene.test.mjs`. Do not alter later drawing branches or any series colors.

- [ ] **Step 4: Run focused Canvas tests**

Run:

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/mobile-canvas-layout.test.mjs tests/ipad-layout.test.mjs tests/project-hygiene.test.mjs
```

Expected: all selected tests PASS.

- [ ] **Step 5: Commit Task 2**

```powershell
git add app.js index.html tests/mobile-canvas-layout.test.mjs tests/project-hygiene.test.mjs
git commit -m "fix: align law intro panel styles"
```

---

### Task 3: Full verification and publish readiness

**Files:**
- Verify only: all production HTML, CSS, JavaScript, and tests.

**Interfaces:**
- Consumes: Task 1 tab/badge changes and Task 2 Canvas intro changes.
- Produces: evidence that the branch is safe to push for phone and iPad testing.

- [ ] **Step 1: Run the complete automated suite**

```powershell
$node = 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node --test tests/*.test.mjs
```

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Run JavaScript syntax checks**

```powershell
$node = 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node --check app.js
& $node --check multiple_proportions.js
& $node --check multiple_proportions_explain.js
& $node --check quiz.js
```

Expected: all commands exit `0` without output.

- [ ] **Step 3: Inspect the final diff and repository state**

```powershell
git status -sb
git diff origin/main...HEAD --stat
git diff origin/main...HEAD -- style.css index.html quiz.html quiz.js app.js tests
```

Expected: only the approved specification, plan, badge/tab changes, intro-panel change, cache versions, and related tests appear; `.superpowers/` remains untracked and unstaged.

- [ ] **Step 4: Visual acceptance matrix**

Check `index.html`, `quiz.html`, `multiple_proportions.html`, and `multiple_proportions_explain.html` at desktop width and 390px width. Confirm exactly one white tab, three blue tabs, 2×2 mobile layout, both example badges read `挑戰`, the two home intros share the hand-drawn frame, and no chart or Canvas series color changed.

- [ ] **Step 5: Report readiness**

Report the commit hashes, automated-test counts, syntax-check result, visual matrix result, and any remaining need for real-device verification. Do not push until the user requests publishing.
