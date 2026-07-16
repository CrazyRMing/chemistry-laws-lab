# Quiz iPad Canvas DPR Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Quiz main relationship diagram and all three hint diagrams use CSS logical pixels consistently so Retina DPR scaling cannot clip their right or bottom content.

**Architecture:** Keep the current static `quiz.html` and `quiz.js` structure. Add one page-local Canvas backing-store helper shared by the main and hint diagrams, make CSS own display sizing, and observe the main wrapper for responsive redraws.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Canvas 2D, Node.js built-in `node:test`, GitHub Pages.

## Global Constraints

- Do not modify right-side questions, input fields, hint steps, answer validation, or navigation behavior.
- Do not modify diagram node positions, colors, labels, or animation durations.
- Do not change the other three production teaching pages.
- Do not add dependencies or a build process.
- Use `quiz.js?v=20260716_02` for the deployed cache version.
- Do not claim the visual issue is resolved until the user confirms it on a real iPad.

---

### Task 1: Use logical Canvas dimensions throughout Quiz diagrams

**Files:**
- Create: `tests/quiz-canvas-dpr.test.mjs`
- Modify: `quiz.js:207-224`
- Modify: `quiz.js:589-610`
- Modify: `quiz.js:1105-1129`
- Modify: `quiz.html:75-78`
- Modify: `quiz.html:404`
- Test: `tests/quiz-canvas-dpr.test.mjs`

**Interfaces:**
- Consumes: `configureCanvas(targetCanvas, targetContext, logicalWidth, logicalHeight)` with CSS-pixel dimensions.
- Produces: `targetCanvas.logicalWidth` and `targetCanvas.logicalHeight` for drawing; DPR-scaled integer backing-store dimensions; `scheduleQuizCanvasResize()` for observer and window resize callbacks.

- [ ] **Step 1: Write the failing regression tests**

Create `tests/quiz-canvas-dpr.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../quiz.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('../quiz.js', import.meta.url), 'utf8');

function functionSection(startName, endName) {
  const start = js.indexOf(`function ${startName}`);
  const end = js.indexOf(`function ${endName}`, start + 1);
  assert.notEqual(start, -1, `${startName} must exist`);
  assert.notEqual(end, -1, `${endName} must follow ${startName}`);
  return js.slice(start, end);
}

test('all quiz canvases share one logical-size DPR helper', () => {
  assert.match(js, /function configureCanvas\(targetCanvas, targetContext, logicalWidth, logicalHeight\)/);
  assert.match(js, /targetCanvas\.width = Math\.round\(logicalWidth \* dpr\)/);
  assert.match(js, /targetCanvas\.height = Math\.round\(logicalHeight \* dpr\)/);
  assert.match(js, /targetCanvas\.logicalWidth = logicalWidth/);
  assert.match(js, /targetCanvas\.logicalHeight = logicalHeight/);
  assert.doesNotMatch(js, /canvas\.style\.(?:width|height)\s*=/);
});

test('main diagram draws with logical dimensions', () => {
  const source = functionSection('drawQuizDiagram', 'verifyCurrentQuiz');
  assert.match(source, /const w = canvas\.logicalWidth \|\| canvas\.clientWidth/);
  assert.match(source, /const h = canvas\.logicalHeight \|\| w \* \(13 \/ 16\)/);
  assert.doesNotMatch(source, /const [wh] = canvas\.(?:width|height)/);
});

test('hint diagrams draw at container width and 250 logical pixels', () => {
  const source = functionSection('drawWeightRatioDiagram', 'drawColoredFormula');
  assert.match(source, /const w = parentW/);
  assert.match(source, /const h = 250/);
  assert.match(source, /configureCanvas\(canvas, ctx, w, h\)/);
  assert.doesNotMatch(source, /const [wh] = canvas\.(?:width|height)/);
});

test('CSS owns main display size and wrapper changes trigger redraw', () => {
  assert.match(html, /#quizCanvas\s*\{[\s\S]*?width:\s*100%\s*!important;[\s\S]*?height:\s*auto\s*!important/);
  assert.match(js, /new ResizeObserver\(scheduleQuizCanvasResize\)/);
  assert.match(js, /quizCanvasResizeObserver\?\.observe\(canvas\.parentElement\)/);
  assert.match(html, /quiz\.js\?v=20260716_02/);
});
```

- [ ] **Step 2: Run the new test and verify RED**

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\quiz-canvas-dpr.test.mjs
```

Expected: 4 failed tests because the shared helper, logical dimensions, observer, and new cache version do not exist.

- [ ] **Step 3: Add CSS-owned main Canvas display sizing**

Add after the Quiz `.canvas-wrapper` rule in `quiz.html`:

```css
#quizCanvas {
    display: block;
    width: 100% !important;
    height: auto !important;
}
```

- [ ] **Step 4: Add the shared backing-store helper and main resize scheduler**

Add beside the main Canvas setup in `quiz.js`:

```js
function configureCanvas(targetCanvas, targetContext, logicalWidth, logicalHeight) {
    const dpr = window.devicePixelRatio || 1;
    const backingWidth = Math.round(logicalWidth * dpr);
    const backingHeight = Math.round(logicalHeight * dpr);

    if (targetCanvas.width !== backingWidth || targetCanvas.height !== backingHeight) {
        targetCanvas.width = Math.round(logicalWidth * dpr);
        targetCanvas.height = Math.round(logicalHeight * dpr);
    }

    targetCanvas.logicalWidth = logicalWidth;
    targetCanvas.logicalHeight = logicalHeight;
    targetContext.setTransform(dpr, 0, 0, dpr, 0, 0);
}

let quizCanvasResizeFrameId = 0;

function scheduleQuizCanvasResize() {
    cancelAnimationFrame(quizCanvasResizeFrameId);
    quizCanvasResizeFrameId = requestAnimationFrame(resizeCanvas);
}

const quizCanvasResizeObserver = 'ResizeObserver' in window
    ? new ResizeObserver(scheduleQuizCanvasResize)
    : null;
```

- [ ] **Step 5: Convert the main diagram to logical dimensions**

Replace `resizeCanvas()` sizing with:

```js
function resizeCanvas() {
    const wrapper = canvas.parentElement;
    const clientW = wrapper.clientWidth;
    if (clientW <= 0) return;

    const clientH = clientW * (13 / 16);
    configureCanvas(canvas, ctx, clientW, clientH);
    drawQuizDiagram();
}
```

Start `drawQuizDiagram()` with:

```js
const w = canvas.logicalWidth || canvas.clientWidth;
const h = canvas.logicalHeight || w * (13 / 16);
ctx.clearRect(0, 0, w, h);
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, w, h);
```

- [ ] **Step 6: Convert hint diagrams to logical dimensions**

At the start of `drawWeightRatioDiagram()`, after obtaining the parent width, use:

```js
const parentW = canvas.parentElement.clientWidth;
if (parentW <= 0) return;

const w = parentW;
const h = 250;
configureCanvas(canvas, ctx, w, h);

ctx.clearRect(0, 0, w, h);
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, w, h);
```

Remove both `canvas.style.width` and `canvas.style.height` assignments.

- [ ] **Step 7: Observe the wrapper and retain a resize fallback**

After `updateQuizUI()` in `window.onload`, add:

```js
quizCanvasResizeObserver?.observe(canvas.parentElement);
```

Replace the current `window.onresize` callback with:

```js
window.onresize = scheduleQuizCanvasResize;
```

- [ ] **Step 8: Bump the Quiz script cache version**

Change the script reference in `quiz.html` to:

```html
<script src="quiz.js?v=20260716_02"></script>
```

- [ ] **Step 9: Run the new test and verify GREEN**

Run the Step 2 command again. Expected: 4 passed, 0 failed.

- [ ] **Step 10: Commit the tested fix**

```powershell
git add -- tests/quiz-canvas-dpr.test.mjs quiz.js quiz.html
git commit -m "fix: use logical pixels for quiz canvases"
```

### Task 2: Run full regression and deployment verification

**Files:**
- Verify: `tests/quiz-canvas-dpr.test.mjs`
- Verify: `tests/ipad-layout.test.mjs`
- Verify: `tests/project-hygiene.test.mjs`
- Verify: `quiz.js`
- Verify: `quiz.html`

**Interfaces:**
- Consumes: the committed Quiz Canvas fix.
- Produces: automated evidence, a deployed Pages build, and a cache-busting iPad test URL.

- [ ] **Step 1: Run all tests**

```powershell
$node = 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node --test tests\ipad-layout.test.mjs tests\project-hygiene.test.mjs tests\quiz-canvas-dpr.test.mjs
```

Expected: 14 passed, 0 failed.

- [ ] **Step 2: Check production JavaScript syntax**

```powershell
& $node --check app.js
& $node --check multiple_proportions.js
& $node --check multiple_proportions_explain.js
& $node --check quiz.js
```

Expected: exit code 0 with no syntax errors.

- [ ] **Step 3: Check diff scope and whitespace**

```powershell
git diff --check
git status --short
git diff --stat HEAD~1
```

Expected: no whitespace errors and only `quiz.html`, `quiz.js`, and `tests/quiz-canvas-dpr.test.mjs` in the implementation commit.

- [ ] **Step 4: Integrate and publish after branch completion**

Use `finishing-a-development-branch` to merge the verified feature branch into `main`, then push `main` because the approved design requires GitHub Pages deployment.

- [ ] **Step 5: Verify GitHub Pages deployment**

```powershell
gh api repos/CrazyRMing/chemistry-laws-lab/pages/builds/latest --jq '{status: .status, commit: .commit}'
$response = Invoke-WebRequest -Uri 'https://crazyrming.github.io/chemistry-laws-lab/quiz.html?quiz=1&sub=1&test=20260716_02' -UseBasicParsing
$response.StatusCode
$response.Content.Contains('quiz.js?v=20260716_02')
```

Expected: latest build status `built`, HTTP 200, and `True` for the new Quiz script version.

- [ ] **Step 6: Request real-device confirmation**

Provide this URL for iPad landscape and portrait testing:

```text
https://crazyrming.github.io/chemistry-laws-lab/quiz.html?quiz=1&sub=1&test=20260716_02
```

Ask the user to confirm the main relationship diagram and all three expanded hint diagrams are fully visible before declaring the visual defect resolved.
