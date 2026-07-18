# Prussian Blue Interface Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the public site's orange-and-white interface theme with Prussian blue and white while preserving every Canvas, chart, legend-series, chemistry, success, error, and disabled-state color.

**Architecture:** Add a semantic interface palette to `style.css` and route only DOM interface components through `--theme-*` variables. Preserve `--color-orange` and every Canvas drawing color as teaching/data colors; JavaScript changes are limited to DOM element styles, with tests that enforce the boundary.

**Tech Stack:** Static HTML, CSS custom properties, vanilla JavaScript, Canvas 2D, Node.js built-in test runner, GitHub Pages.

## Global Constraints

- Interface primary color is exactly `#003153`.
- Interface hover color is `#174a6b` and soft background is `#eaf1f5`.
- Page and card backgrounds remain `#ffffff`.
- Success, error, warning, disabled, Canvas, chart, legend-series, chemistry, and teaching-data colors remain unchanged.
- Mobile tabs remain the existing 2×2 Grid; no breakpoint, layout, sizing, animation, content, or interaction-flow changes.
- Do not add dependencies, dark mode, theme switching, or unrelated refactoring.
- Do not globally replace `#ff7a00`, `#f57c00`, `orange`, or `--color-orange`.
- Do not stage or commit `.superpowers/` local preview artifacts.

---

## File Map

- Create `tests/interface-theme.test.mjs`: interface token, DOM-state, cache-version, and protected teaching-palette contract tests.
- Modify `style.css`: single source of truth for semantic interface colors and CSS-owned component states.
- Modify `quiz.js`: dynamic hint-button DOM colors only; Canvas drawing statements remain unchanged.
- Modify `multiple_proportions_explain.js`: algebraic panel-toggle DOM color only; Canvas and data-table series colors remain unchanged.
- Modify `index.html`: interface link styling and shared stylesheet version.
- Modify `quiz.html`: interface-only inline styles and CSS/script versions; formula colors remain unchanged.
- Modify `multiple_proportions.html`: interface link styling and shared stylesheet version; legend and Canvas colors remain unchanged.
- Modify `multiple_proportions_explain.html`: interface control styling and CSS/script versions; orange/purple data-series controls remain unchanged.
- Modify `tests/project-hygiene.test.mjs`: expected shared stylesheet version.

---

### Task 1: Establish the interface palette and protect teaching colors

**Files:**
- Create: `tests/interface-theme.test.mjs`
- Modify: `style.css:1-17,59-64,101-105,128-134,210-289,305-390,421-438`

**Interfaces:**
- Produces: CSS properties `--theme-primary`, `--theme-primary-hover`, `--theme-primary-soft`, and `--theme-on-primary`.
- Preserves: `--color-orange: #ff7a00` as a teaching/data color.
- Consumed by: all DOM interface styles in Tasks 1 and 2.

- [ ] **Step 1: Write failing theme and palette-protection tests**

Create `tests/interface-theme.test.mjs` with:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const css = readFileSync(new URL('style.css', root), 'utf8');
const app = readFileSync(new URL('app.js', root), 'utf8');
const quiz = readFileSync(new URL('quiz.js', root), 'utf8');
const multiple = readFileSync(new URL('multiple_proportions.js', root), 'utf8');
const explain = readFileSync(new URL('multiple_proportions_explain.js', root), 'utf8');

test('Prussian blue interface tokens have one CSS source of truth', () => {
  for (const [name, value] of [
    ['theme-primary', '#003153'],
    ['theme-primary-hover', '#174a6b'],
    ['theme-primary-soft', '#eaf1f5'],
    ['theme-on-primary', '#ffffff'],
  ]) {
    assert.match(css, new RegExp(`--${name}:\\s*${value}`));
  }
  assert.match(css, /--color-orange:\s*#ff7a00/);
});

test('CSS-owned interface controls use semantic theme colors', () => {
  for (const selector of [
    'mass-item\\.active',
    'nav-btn\\.highlight-btn',
    'btn-primary',
    'soil-tab-btn\\.active',
    'soil-page-num',
    'soil-orange-line',
    'nav-page-link',
  ]) {
    assert.match(
      css,
      new RegExp(`\\.${selector}\\s*\\{[\\s\\S]*?var\\(--theme-primary`),
      `${selector} must use the interface theme`,
    );
  }
});

test('representative Canvas and teaching-series colors remain unchanged', () => {
  assert.match(app, /const COLOR_ORANGE = '#ff7a00'/);
  assert.match(quiz, /drawWobblyLine\(ctx, endX, endY, curEndX, curEndY, '#ff7a00'/);
  assert.match(multiple, /drawWobblyLine\(ctxG,[\s\S]*?'#ff7a00', 3, 225\)/);
  assert.match(explain, /drawWobblyLine\(ctx, mX\(0\), mY\(0\), endX1, endY1, '#ff7a00'/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
$node = 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node --test tests/interface-theme.test.mjs
```

Expected: FAIL because `--theme-primary` and the other semantic properties do not exist yet.

- [ ] **Step 3: Add the semantic palette without changing the teaching palette**

At the start of `style.css`, use this exact root palette:

```css
:root {
    --theme-primary: #003153;
    --theme-primary-hover: #174a6b;
    --theme-primary-soft: #eaf1f5;
    --theme-on-primary: #ffffff;

    --bg-color: #ffffff;
    --panel-bg: rgba(255, 255, 255, 0.85);
    --border-color: var(--theme-primary);
    --text-primary: #1f1f1f;
    --text-secondary: #5f5f5f;

    --color-orange: #ff7a00;
    --color-gray-light: #cccccc;
    --color-gray-medium: #888888;
    --color-gray-dark: #444444;

    --font-heading: 'Outfit', sans-serif;
    --font-math: 'Outfit', 'Noto Sans TC', sans-serif;
    --font-ui: 'Outfit', 'Noto Sans TC', sans-serif;
}
```

Change only these CSS-owned interface rules:

```css
.info-card h1,
.panel-label {
    color: var(--theme-primary, #003153);
}

.mass-item.active {
    color: var(--theme-primary, #003153) !important;
    border-color: var(--theme-primary, #003153) !important;
    box-shadow: 0 0 8px rgba(0, 49, 83, 0.25);
}

.nav-btn.highlight-btn,
.btn-primary {
    background: var(--theme-primary, #003153) !important;
    color: var(--theme-on-primary, #ffffff) !important;
}

.nav-btn.highlight-btn:hover,
.btn-primary:hover {
    background: var(--theme-primary-hover, #174a6b) !important;
}

.soil-tab-btn {
    border-color: var(--theme-primary, #003153);
    background: #ffffff;
    color: var(--theme-primary, #003153);
}

.soil-tab-btn:hover {
    background: var(--theme-primary-soft, #eaf1f5) !important;
    color: var(--theme-primary, #003153) !important;
}

.soil-tab-btn.active {
    background: var(--theme-primary, #003153) !important;
    color: var(--theme-on-primary, #ffffff) !important;
    border-color: var(--theme-primary, #003153);
}

.soil-page-num,
.soil-orange-line {
    background-color: var(--theme-primary, #003153);
}

.nav-page-link {
    color: var(--theme-primary, #003153);
    border-color: var(--theme-primary, #003153);
}

.nav-page-link:hover {
    background: var(--theme-primary-soft, #eaf1f5);
}
```

Keep all existing size, spacing, radius, animation, transform, and shadow declarations in those rules. Do not delete the remaining declarations when replacing only the listed color properties.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run:

```powershell
& $node --test tests/interface-theme.test.mjs tests/mobile-ui-consistency.test.mjs tests/ipad-layout.test.mjs
```

Expected: all tests PASS, including the protected representative Canvas colors and mobile 2×2 tab contract.

- [ ] **Step 5: Commit the palette contract**

```powershell
git add -- style.css tests/interface-theme.test.mjs
git commit -m 'feat: add Prussian blue interface palette'
```

---

### Task 2: Route dynamic and inline interface states through the theme

**Files:**
- Modify: `tests/interface-theme.test.mjs`
- Modify: `quiz.js:58-81,85-128,130-177`
- Modify: `multiple_proportions_explain.js:35-50`
- Modify: `index.html:215`
- Modify: `quiz.html:112-126,165-167`
- Modify: `multiple_proportions.html:184`
- Modify: `multiple_proportions_explain.html:363`

**Interfaces:**
- Consumes: `--theme-primary`, `--theme-primary-soft`, and `--theme-on-primary` from Task 1.
- Produces: consistent interface-only active, completed, hover, and link states.
- Preserves: quiz formula orange, Canvas orange, multiple-proportions legend orange, algebraic/geometric data-series orange and purple.

- [ ] **Step 1: Extend the test with DOM-versus-data boundary assertions**

Append to `tests/interface-theme.test.mjs`:

```js
const pages = Object.fromEntries(
  ['index.html', 'quiz.html', 'multiple_proportions.html', 'multiple_proportions_explain.html']
    .map((name) => [name, readFileSync(new URL(name, root), 'utf8')]),
);

test('dynamic interface controls use theme variables', () => {
  assert.match(quiz, /btn2\.style\.background = 'var\(--theme-primary\)'/);
  assert.match(quiz, /btn\.style\.background = 'var\(--theme-primary-soft\)'/);
  assert.match(explain, /btn\.style\.background = 'var\(--theme-primary\)'/);
});

test('inline interface links use theme variables while data legends stay orange', () => {
  assert.match(pages['index.html'], /直接挑戰例題[^<]*<\/a>|直接挑戰例題/);
  assert.match(pages['index.html'], /border-color:\s*var\(--theme-primary\)/);
  assert.match(pages['multiple_proportions.html'], /border-color:\s*var\(--theme-primary\)/);
  assert.match(pages['multiple_proportions.html'], /legend-dot[^>]*background-color:\s*#ff7a00/);
  assert.match(pages['quiz.html'], /NH₃ 中[\s\S]*?color:\s*#ff7a00/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
& $node --test tests/interface-theme.test.mjs
```

Expected: FAIL because dynamic and inline interface controls still use orange literals or `--color-orange`.

- [ ] **Step 3: Change only dynamic DOM interface assignments**

In `quiz.js`, replace active/completed hint-button interface colors as follows:

```js
btn2.style.background = 'var(--theme-primary)';
btn2.style.color = 'var(--theme-on-primary)';
btn2.style.borderColor = 'var(--theme-primary)';

btn2.style.background = 'var(--theme-primary-soft)';
btn2.style.color = 'var(--theme-primary)';
btn2.style.borderColor = 'var(--theme-primary)';

btn.style.background = 'var(--theme-primary-soft)';
btn.style.borderColor = 'var(--theme-primary)';
btn.style.color = 'var(--theme-primary)';
```

Update the reset-state interface border/text from `#2b2b2b` to `var(--theme-primary)` where it belongs to `.hint-sub-btn`; retain white backgrounds and all disabled grays.

In `multiple_proportions_explain.js`, change only the active algebraic panel toggle:

```js
btn.style.background = 'var(--theme-primary)';
btn.style.color = 'var(--theme-on-primary)';
```

Do not modify any statement containing `ctx.`, `ctxF.`, `ctxG.`, `drawWobbly*`, series table rows, success colors, or error colors.

- [ ] **Step 4: Change only inline interface markup**

Apply these replacements without changing data/formula styles:

```html
<!-- index.html and multiple_proportions.html direct challenge links -->
style="... border-color: var(--theme-primary); color: var(--theme-primary); ..."

<!-- quiz.html hint-button hover -->
background: var(--theme-primary-soft) !important;

<!-- quiz.html atomic-weight information card -->
style="border: 3px dashed var(--theme-primary); ... color: var(--theme-primary); box-shadow: 3px 4px 0 rgba(0, 49, 83, 0.08); ..."

<!-- multiple_proportions_explain.html algebraic panel control -->
style="border-color: var(--theme-primary); box-shadow: 3px 4px 0 var(--theme-primary);"
```

Do not modify:

- `index.html` orange trendline legend.
- `multiple_proportions.html` orange legend dot and legend line.
- `quiz.html` formula spans and fraction borders using `#ff7a00`.
- `.wizard-btn.orange.active`, orange table rows, or purple comparison-series controls.

- [ ] **Step 5: Run focused tests and syntax checks**

Run:

```powershell
& $node --test tests/interface-theme.test.mjs tests/mobile-ui-consistency.test.mjs tests/quiz-canvas-dpr.test.mjs
& $node --check quiz.js
& $node --check multiple_proportions_explain.js
```

Expected: all tests PASS and both syntax checks exit 0.

- [ ] **Step 6: Commit DOM theme integration**

```powershell
git add -- tests/interface-theme.test.mjs quiz.js multiple_proportions_explain.js index.html quiz.html multiple_proportions.html multiple_proportions_explain.html
git commit -m 'feat: apply Prussian blue to interface controls'
```

---

### Task 3: Bust caches and verify every supported layout

**Files:**
- Modify: `index.html:11`
- Modify: `quiz.html:11,419`
- Modify: `multiple_proportions.html:11`
- Modify: `multiple_proportions_explain.html:18,371`
- Modify: `tests/project-hygiene.test.mjs:25-31`
- Modify: `tests/interface-theme.test.mjs`

**Interfaces:**
- Consumes: completed CSS and DOM interface theme from Tasks 1 and 2.
- Produces: one cache-consistent public release and evidence that layout/data colors remain stable.

- [ ] **Step 1: Write the failing release-version test**

Change `tests/project-hygiene.test.mjs` to expect:

```js
assert.match(html, /style\.css\?v=20260718_03/);
```

Append to `tests/interface-theme.test.mjs`:

```js
test('pages with themed dynamic DOM styles load refreshed scripts', () => {
  assert.match(pages['quiz.html'], /quiz\.js\?v=20260718_03/);
  assert.match(
    pages['multiple_proportions_explain.html'],
    /multiple_proportions_explain\.js\?v=20260718_02/,
  );
});
```

- [ ] **Step 2: Run release tests and verify RED**

Run:

```powershell
& $node --test tests/project-hygiene.test.mjs tests/interface-theme.test.mjs
```

Expected: FAIL because HTML still references the previous asset versions.

- [ ] **Step 3: Update cache versions**

In all four public HTML files, change:

```html
<link rel="stylesheet" href="style.css?v=20260718_03">
```

Also change:

```html
<!-- quiz.html -->
<script src="quiz.js?v=20260718_03"></script>

<!-- multiple_proportions_explain.html -->
<script src="multiple_proportions_explain.js?v=20260718_02"></script>
```

Do not change `canvas-responsive.js`, `app.js`, or `multiple_proportions.js` versions because their executable contents are unchanged.

- [ ] **Step 4: Run the complete automated verification**

Run:

```powershell
& $node --test tests/*.test.mjs
& $node --check app.js
& $node --check quiz.js
& $node --check multiple_proportions.js
& $node --check multiple_proportions_explain.js
git diff --check
```

Expected: all tests PASS, every syntax command exits 0, and `git diff --check` produces no output.

- [ ] **Step 5: Perform browser visual verification before committing**

Serve the repository root with the bundled runtime on an unused localhost port. At desktop width, iPad landscape/portrait, and 390×844, inspect:

- `index.html?step=5`
- `index.html?step=6`
- `quiz.html?quiz=1&sub=3`
- `multiple_proportions.html`
- `multiple_proportions_explain.html`

For each page, verify:

- Prussian blue frame, tabs, headings, and primary controls.
- White page/card backgrounds and readable contrast.
- Mobile tabs remain 2×2 with no horizontal overflow.
- Canvas dimensions and panel layout are unchanged.
- Orange trendlines/data series, blue/green/yellow data points, chemistry colors, formula colors, success green, error red, and disabled gray remain unchanged.

Expected: no overlap, clipping, horizontal overflow, or unintended palette changes.

- [ ] **Step 6: Commit the release metadata**

```powershell
git add -- index.html quiz.html multiple_proportions.html multiple_proportions_explain.html tests/project-hygiene.test.mjs tests/interface-theme.test.mjs
git commit -m 'chore: refresh theme asset versions'
```

- [ ] **Step 7: Verify the committed tree**

Run:

```powershell
& $node --test tests/*.test.mjs
git status --short
git log -4 --oneline
```

Expected: all tests PASS; `git status --short` lists only the untracked `.superpowers/` preview directory, if retained; the three implementation commits follow the design and plan commits.

---

### Task 4: Publish and verify GitHub Pages

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: verified commits from Tasks 1–3.
- Produces: live GitHub Pages release on `main`.

- [ ] **Step 1: Push the approved main branch**

Run:

```powershell
git push origin main
```

Expected: remote reports `main -> main` and the new local HEAD.

- [ ] **Step 2: Verify local and remote synchronization**

Run:

```powershell
git status -sb
git rev-parse HEAD
git rev-parse origin/main
```

Expected: `main...origin/main` without ahead/behind counts, and both hashes are identical.

- [ ] **Step 3: Verify deployed resource versions**

Request these cache-busted URLs and require HTTP 200:

```text
https://crazyrming.github.io/chemistry-laws-lab/index.html?step=5&v=20260718_03
https://crazyrming.github.io/chemistry-laws-lab/quiz.html?quiz=1&sub=3&v=20260718_03
https://crazyrming.github.io/chemistry-laws-lab/multiple_proportions.html?v=20260718_03
https://crazyrming.github.io/chemistry-laws-lab/multiple_proportions_explain.html?v=20260718_03
```

Inspect returned HTML and verify it references `style.css?v=20260718_03`; additionally verify the quiz and explanation pages reference their refreshed script versions.

- [ ] **Step 4: Hand off real-device checks**

Provide the four cache-busted URLs and ask the user to verify Android in-app browser and iPad Safari. Report that automated, local visual, and HTTP deployment checks passed, while real-device confirmation remains the only external validation.
