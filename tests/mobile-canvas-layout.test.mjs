import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const app = readFileSync(new URL('app.js', root), 'utf8');
const multiple = readFileSync(new URL('multiple_proportions.js', root), 'utf8');

test('all public pages load the shared responsive Canvas helper first', () => {
  assert.equal(existsSync(new URL('canvas-responsive.js', root)), true);

  const pages = [
    ['index.html', 'app.js'],
    ['quiz.html', 'quiz.js'],
    ['multiple_proportions.html', 'multiple_proportions.js'],
    ['multiple_proportions_explain.html', 'multiple_proportions_explain.js'],
  ];

  for (const [htmlPath, pageScript] of pages) {
    const html = readFileSync(new URL(htmlPath, root), 'utf8');
    const helperPosition = html.indexOf('canvas-responsive.js?v=');
    const pagePosition = html.indexOf(pageScript);
    assert.notEqual(helperPosition, -1, `${htmlPath} must load the helper`);
    assert.ok(helperPosition < pagePosition, `${htmlPath} must load the helper first`);
  }
});

test('responsive Canvas thresholds preserve desktop layout above 480px', () => {
  const source = readFileSync(new URL('canvas-responsive.js', root), 'utf8');
  const sandbox = {};
  vm.runInNewContext(source, sandbox);
  const responsive = sandbox.CanvasResponsive;

  assert.equal(responsive.isCompact(480), true);
  assert.equal(responsive.isCompact(481), false);
  assert.equal(responsive.heightFor(400, 0.75, 1), 400);
  assert.equal(responsive.heightFor(600, 0.75, 1), 450);
  assert.equal(responsive.marginFor(360, 60, 40), 40);
  assert.equal(responsive.marginFor(600, 60, 40), 60);

  const bottomRows = responsive.bottomPair(300, 50, 28);
  assert.equal(bottomRows.upper, 222);
  assert.equal(bottomRows.lower, 272);
  assert.equal(bottomRows.lower - bottomRows.upper, 50);
});

test('responsive Canvas text tools fit and wrap inside the requested width', () => {
  const source = readFileSync(new URL('canvas-responsive.js', root), 'utf8');
  const sandbox = {};
  vm.runInNewContext(source, sandbox);
  const responsive = sandbox.CanvasResponsive;
  const ctx = {
    font: '',
    measureText(text) {
      const size = Number.parseFloat(this.font.match(/([\d.]+)px/)?.[1] || '16');
      return { width: [...text].length * size };
    },
  };

  const font = responsive.fontFor(ctx, '八個中文字', 60, 18, 10, 'bold');
  ctx.font = font;
  assert.ok(ctx.measureText('八個中文字').width <= 60);

  ctx.font = '16px sans-serif';
  const sourceText = '化合物的原子以固定比例結合';
  const lines = responsive.wrapLines(ctx, sourceText, 96);
  assert.equal(lines.join(''), sourceText);
  assert.ok(lines.every((line) => ctx.measureText(line).width <= 96));
});

test('definite-law page has a complete compact Canvas composition', () => {
  const source = readFileSync(new URL('app.js', root), 'utf8');

  assert.match(source, /CanvasResponsive\.heightFor\(wL,\s*0\.75,\s*1\)/);
  assert.match(source, /CanvasResponsive\.heightFor\(wR,\s*0\.75,\s*1\)/);
  assert.match(source, /function graphMargin\(width\)/);
  assert.match(source, /CanvasResponsive\.marginFor\(width,\s*margin,\s*40\)/);
  assert.match(source, /function drawStepEightCompact\(/);
  assert.match(source, /function drawMiddleStepsCompact\(/);
  assert.match(source, /currentStep >= 5 && currentStep <= 7/);
  assert.match(source, /CanvasResponsive\.bottomPair\(h,\s*50,\s*28\)/);
  assert.match(source, /CanvasResponsive\.wrapLines\(/);
  assert.match(source, /const compact = CanvasResponsive\.isCompact\(w\)/);
});

test('definite-law compact steps reserve content above a shared footer', () => {
  const source = readFileSync(new URL('app.js', root), 'utf8');

  assert.match(source, /function compactFooterLayout\(height\)/);
  assert.match(source, /const footer = compactFooterLayout\(h\)/);
  assert.match(source, /const bottom = footer\.contentBottom/);
  assert.doesNotMatch(source, /const bottom = 270/);
  assert.doesNotMatch(source, /235,[\s\S]*?h - 34/);
});

test('multiple-proportions page has compact steps and graph geometry', () => {
  const source = readFileSync(new URL('multiple_proportions.js', root), 'utf8');
  const html = readFileSync(new URL('multiple_proportions.html', root), 'utf8');

  assert.match(source, /CanvasResponsive\.heightFor\(wF,\s*0\.75,\s*1\)/);
  assert.match(source, /CanvasResponsive\.heightFor\(wG,\s*0\.75,\s*1\)/);
  assert.match(source, /function multipleGraphMargin\(width\)/);
  assert.match(source, /function drawMultipleCompact\(/);
  assert.match(source, /currentStep >= 4/);
  assert.match(source, /CanvasResponsive\.bottomPair\(h,\s*24,\s*28\)/);
  assert.match(source, /CanvasResponsive\.wrapLines\(/);
  assert.doesNotMatch(source, /flaskCanvas\.style\.(?:width|height)\s*=/);
  assert.doesNotMatch(source, /graphCanvas\.style\.(?:width|height)\s*=/);
  assert.match(html, /@media\s*\(max-width:\s*480px\)[\s\S]*?aspect-ratio:\s*1\s*\/\s*1\s*!important/);
});

test('quiz page fits mobile node and hint labels', () => {
  const source = readFileSync(new URL('quiz.js', root), 'utf8');
  const html = readFileSync(new URL('quiz.html', root), 'utf8');

  assert.match(source, /CanvasResponsive\.heightFor\(clientW,\s*13\s*\/\s*16,\s*0\.95\)/);
  assert.match(source, /function quizNodeFont\(/);
  assert.match(source, /CanvasResponsive\.fontFor\(/);
  assert.match(source, /const compact = CanvasResponsive\.isCompact\(w\)/);
  assert.match(html, /@media\s*\(max-width:\s*480px\)[\s\S]*?#quizCanvas[\s\S]*?height:\s*auto\s*!important/);
});

test('multiple-proportions explanation uses mobile height and dynamic margins', () => {
  const source = readFileSync(new URL('multiple_proportions_explain.js', root), 'utf8');
  const html = readFileSync(new URL('multiple_proportions_explain.html', root), 'utf8');

  assert.match(source, /CanvasResponsive\.heightFor\(w,\s*0\.75,\s*0\.9\)/);
  assert.match(source, /function explainMargin\(width\)/);
  assert.match(source, /CanvasResponsive\.marginFor\(width,\s*margin,\s*38\)/);
  assert.match(source, /function drawCompactPointLabel\(/);
  assert.doesNotMatch(source, /canvas\.style\.(?:width|height)\s*=/);
  assert.match(html, /#explainCanvas\s*\{[\s\S]*?width:\s*100%\s*!important;[\s\S]*?height:\s*auto\s*!important/);
});

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
