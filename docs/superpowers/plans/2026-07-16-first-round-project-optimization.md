# First-Round Project Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove confirmed repository duplication and stale files, restore effective browser caching, and align project documentation with the current teaching site without changing runtime behavior.

**Architecture:** Keep the existing static multi-page HTML/CSS/Vanilla JS architecture. Add one Node built-in test file that validates repository structure and published asset references; make only direct file deletions and string/content updates required by those tests.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Node.js built-in `node:test`, Git.

## Global Constraints

- Do not change teaching flow, Canvas rendering logic, responsive breakpoints, or iPad Safari layout behavior.
- Do not extract shared Canvas, Header, or copyright Modal code in this round.
- Do not add frameworks, packages, or a build process.
- Keep the four production entry pages and their navigation paths unchanged.
- Use fixed cache versions: `style.css?v=20260716_03` and experiment images `?v=20260716_01`.

---

### Task 1: Remove confirmed duplicate and legacy files

**Files:**
- Create: `tests/project-hygiene.test.mjs`
- Modify: `PROJECT_NOTES.md:177-352`
- Delete: `index_3b1b.html`
- Delete: `app_3b1b.js`
- Test: `tests/project-hygiene.test.mjs`

**Interfaces:**
- Consumes: repository files through Node `readFileSync()` and `existsSync()`.
- Produces: a repository invariant that only one `# 專案開發筆記 (PROJECT_NOTES)` heading exists and legacy `_3b1b` files are absent.

- [ ] **Step 1: Write the failing tests**

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('project notes contain one development timeline', () => {
  const notes = readFileSync(new URL('PROJECT_NOTES.md', root), 'utf8');
  const headings = notes.match(/^# 專案開發筆記 \(PROJECT_NOTES\)$/gm) ?? [];
  assert.equal(headings.length, 1);
});

test('legacy 3b1b copies are removed from the published root', () => {
  assert.equal(existsSync(new URL('index_3b1b.html', root)), false);
  assert.equal(existsSync(new URL('app_3b1b.js', root)), false);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\project-hygiene.test.mjs
```

Expected: two failed tests because the duplicate heading and both legacy files still exist.

- [ ] **Step 3: Apply the minimal cleanup**

Remove physical lines 177 through 352 from `PROJECT_NOTES.md`, preserving lines 1-176 and the unique entries beginning with `移除多餘的版本探索標籤`. Delete `index_3b1b.html` and `app_3b1b.js`.

- [ ] **Step 4: Run the tests to verify they pass**

Run the Task 1 command again. Expected: 2 passed, 0 failed.

- [ ] **Step 5: Commit**

```powershell
git add -- tests/project-hygiene.test.mjs PROJECT_NOTES.md index_3b1b.html app_3b1b.js
git commit -m "chore: remove duplicate project artifacts"
```

### Task 2: Make asset cache versions deterministic

**Files:**
- Modify: `tests/project-hygiene.test.mjs`
- Modify: `app.js:15-21`
- Modify: `index.html:11`
- Modify: `multiple_proportions.html:11`
- Modify: `multiple_proportions_explain.html:18`
- Modify: `quiz.html:11`
- Test: `tests/project-hygiene.test.mjs`

**Interfaces:**
- Consumes: production HTML and `app.js` as text fixtures.
- Produces: consistent `style.css?v=20260716_03` references and cacheable experiment image URLs ending in `?v=20260716_01`.

- [ ] **Step 1: Add failing cache tests**

```js
const productionPages = [
  'index.html',
  'multiple_proportions.html',
  'multiple_proportions_explain.html',
  'quiz.html',
];

test('production pages share one stylesheet cache version', () => {
  for (const page of productionPages) {
    const html = readFileSync(new URL(page, root), 'utf8');
    assert.match(html, /style\.css\?v=20260716_03/);
  }
});

test('experiment images use a fixed cache version', () => {
  const app = readFileSync(new URL('app.js', root), 'utf8');
  assert.doesNotMatch(app, /Date\.now\(\)/);
  for (const image of ['titration.png', 'combustion.png', 'heating.png']) {
    assert.match(app, new RegExp(`assets/${image.replace('.', '\\\.')}\\?v=20260716_01`));
  }
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run the Task 1 test command. Expected: cleanup tests pass; both new cache tests fail on current version strings and `Date.now()`.

- [ ] **Step 3: Apply the minimal cache updates**

Set all four stylesheet references to:

```html
<link rel="stylesheet" href="style.css?v=20260716_03">
```

Set the three image sources to fixed strings:

```js
imgTitration.src = 'assets/titration.png?v=20260716_01';
imgCombustion.src = 'assets/combustion.png?v=20260716_01';
imgHeating.src = 'assets/heating.png?v=20260716_01';
```

- [ ] **Step 4: Run the tests to verify they pass**

Run the Task 1 test command. Expected: 4 passed, 0 failed.

- [ ] **Step 5: Commit**

```powershell
git add -- tests/project-hygiene.test.mjs app.js index.html multiple_proportions.html multiple_proportions_explain.html quiz.html
git commit -m "perf: restore deterministic asset caching"
```

### Task 3: Rewrite README for the current learning experience

**Files:**
- Modify: `tests/project-hygiene.test.mjs`
- Modify: `README.md`
- Test: `tests/project-hygiene.test.mjs`

**Interfaces:**
- Consumes: the current four production page names and site behavior.
- Produces: UTF-8 project documentation describing the white hand-drawn guided learning flow and GitHub Pages URL.

- [ ] **Step 1: Add the failing README test**

```js
test('README describes the current four-page guided site', () => {
  const readme = readFileSync(new URL('README.md', root), 'utf8');
  for (const expected of ['白底手繪', '逐步引導', '定比例題', '倍比例題']) {
    assert.match(readme, new RegExp(expected));
  }
  assert.doesNotMatch(readme, /深色模式|Glassmorphism|拖曳滑桿|物理碰撞模擬/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run the Task 1 test command. Expected: the README test fails because the old README still describes the retired dark collision simulation.

- [ ] **Step 3: Replace README with current documentation**

Write these sections: project purpose, four learning pages, design and technical characteristics, online URL, local usage, and project structure. State that the site uses a white hand-drawn visual language, progressive previous/next guidance, dual representations, Vanilla JS, HTML Canvas, responsive iPad/Safari handling, and no third-party runtime dependencies.

- [ ] **Step 4: Run the tests to verify they pass**

Run the Task 1 test command. Expected: 5 passed, 0 failed.

- [ ] **Step 5: Commit**

```powershell
git add -- tests/project-hygiene.test.mjs README.md
git commit -m "docs: align README with current teaching site"
```

### Task 4: Run final regression verification

**Files:**
- Verify: `tests/project-hygiene.test.mjs`
- Verify: `tests/ipad-layout.test.mjs`
- Verify: `app.js`
- Verify: `multiple_proportions.js`
- Verify: `multiple_proportions_explain.js`
- Verify: `quiz.js`

**Interfaces:**
- Consumes: the completed working tree.
- Produces: fresh evidence that repository invariants, iPad layout assertions, and JavaScript syntax remain valid.

- [ ] **Step 1: Run all Node tests**

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\*.test.mjs
```

Expected: 10 passed, 0 failed.

- [ ] **Step 2: Check all production JavaScript syntax**

```powershell
$node = 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node --check app.js
& $node --check multiple_proportions.js
& $node --check multiple_proportions_explain.js
& $node --check quiz.js
```

Expected: exit code 0 with no syntax errors.

- [ ] **Step 3: Inspect scope and whitespace**

```powershell
git diff --check HEAD~3
git status --short
git log -4 --oneline
```

Expected: no whitespace errors; only the planned files changed across the three implementation commits; no unrelated working-tree changes.
