# Mobile Canvas Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public teaching Canvas readable at 360–480px without changing the established desktop and iPad composition.

**Architecture:** Add one dependency-free global utility for deterministic Canvas width, height, margin, font fitting, and wrapping calculations. Each existing page script keeps ownership of its teaching composition and opts into a compact branch only when its Canvas logical width is at most 480px.

**Tech Stack:** Vanilla JavaScript, HTML Canvas 2D, CSS, Node.js built-in test runner.

## Global Constraints

- Do not change teaching copy, colors, animation order, or navigation.
- Widths above 480px must retain the current desktop and iPad values.
- CSS owns Canvas display width; JavaScript owns backing resolution and logical coordinates only.
- No dependencies or framework migration.
- Use tests before production changes and bump cache query versions before deployment.

---

### Task 1: Shared responsive Canvas calculations

**Files:**
- Create: `canvas-responsive.js`
- Create: `tests/mobile-canvas-layout.test.mjs`
- Modify: `index.html`, `quiz.html`, `multiple_proportions.html`, `multiple_proportions_explain.html`

**Interfaces:**
- Produces: `globalThis.CanvasResponsive` with `isCompact(width)`, `heightFor(width, desktopRatio, compactRatio)`, `marginFor(width, desktopMargin, compactMargin)`, `fontFor(ctx, text, maxWidth, preferredPx, minimumPx, weight)`, and `wrapLines(ctx, text, maxWidth)`.

- [ ] Write tests proving 480px is compact, 481px is desktop, desktop ratios remain unchanged, mobile ratios are selected, fitted text never exceeds the requested width, and wrapped lines preserve the source text.
- [ ] Run `node --test tests/mobile-canvas-layout.test.mjs` and verify the module-missing failure.
- [ ] Implement the utility as a small IIFE with no DOM access.
- [ ] Load it before each page script using `canvas-responsive.js?v=20260717_01`.
- [ ] Run the test and verify all shared-helper assertions pass.

### Task 2: Definite-law page compact composition

**Files:**
- Modify: `app.js`
- Modify: `index.html`
- Test: `tests/mobile-canvas-layout.test.mjs`

**Interfaces:**
- Consumes: `CanvasResponsive`.
- Produces: square mobile logical canvases, width-aware graph margins, and compact rendering for steps 1–8.

- [ ] Add failing source-level assertions for helper use, square compact height, wrapped step-8 title/body/formula, and dynamic graph margin.
- [ ] Run the focused test and verify failures identify the missing compact branch.
- [ ] Update `resizeCanvases`, coordinate mapping, step-8 composition, and long graph annotations with the minimum compact-only branches.
- [ ] Re-run the focused test and existing iPad tests.

### Task 3: Multiple-proportions page compact composition

**Files:**
- Modify: `multiple_proportions.js`
- Modify: `multiple_proportions.html`
- Test: `tests/mobile-canvas-layout.test.mjs`

**Interfaces:**
- Consumes: `CanvasResponsive`.
- Produces: square mobile logical canvases and compact compositions for public steps 1–10.

- [ ] Add failing assertions for compact height, dynamic margin, and compact step 4–10 labels/formulas.
- [ ] Run the focused test and verify expected failures.
- [ ] Apply compact-only sizing and drawing branches while leaving the desktop constants unchanged.
- [ ] Re-run focused and existing tests.

### Task 4: Quiz and explanation compact composition

**Files:**
- Modify: `quiz.js`
- Modify: `multiple_proportions_explain.js`
- Modify: `quiz.html`
- Modify: `multiple_proportions_explain.html`
- Test: `tests/mobile-canvas-layout.test.mjs`

**Interfaces:**
- Consumes: `CanvasResponsive`.
- Produces: taller mobile quiz/explanation canvases, fitted labels, wrapped hint formulas, and dynamic graph margins.

- [ ] Add failing assertions for each page's compact height, width-aware fonts, wrapping, and dynamic margins.
- [ ] Run the focused test and verify expected failures.
- [ ] Implement the two page-scoped compact branches without changing HTML learning flow.
- [ ] Re-run focused, quiz DPR, and project hygiene tests.

### Task 5: Full verification and publish preparation

**Files:**
- Modify: script cache keys in the four public HTML files.
- Test: all files in `tests/`.

**Interfaces:**
- Consumes: all completed page changes.
- Produces: a deployable branch with cache-safe mobile fixes.

- [ ] Run `node --test tests/quiz-canvas-dpr.test.mjs tests/project-hygiene.test.mjs tests/ipad-layout.test.mjs tests/mobile-canvas-layout.test.mjs` and require zero failures.
- [ ] Run `node --check` for all four page scripts and `canvas-responsive.js`.
- [ ] Run `git diff --check` and inspect that no unrelated files changed.
- [ ] Start or reuse a verified local HTTP server and check every routable state at 360px and 480px when browser automation is available; otherwise report static verification and require real-device confirmation.
- [ ] Commit the implementation, then push and verify GitHub Pages only after the user requests deployment.
