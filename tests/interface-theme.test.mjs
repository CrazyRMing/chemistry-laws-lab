import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const css = readFileSync(new URL('style.css', root), 'utf8');
const app = readFileSync(new URL('app.js', root), 'utf8');
const quiz = readFileSync(new URL('quiz.js', root), 'utf8');
const multiple = readFileSync(new URL('multiple_proportions.js', root), 'utf8');
const explain = readFileSync(new URL('multiple_proportions_explain.js', root), 'utf8');
const pages = Object.fromEntries(
  ['index.html', 'quiz.html', 'multiple_proportions.html', 'multiple_proportions_explain.html']
    .map((name) => [name, readFileSync(new URL(name, root), 'utf8')]),
);

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

test('legend markers and disabled buttons retain neutral charcoal outlines', () => {
  assert.match(css, /--border-neutral:\s*#2b2b2b/);
  assert.match(
    css,
    /\.legend-dot\s*\{[\s\S]*?border:\s*2px solid var\(--border-neutral, #2b2b2b\)/,
  );
  assert.match(
    css,
    /\.legend-line\s*\{[\s\S]*?border:\s*1\.5px solid var\(--border-neutral, #2b2b2b\)/,
  );
  assert.match(
    css,
    /\.nav-btn:disabled\s*\{[\s\S]*?border-color:\s*var\(--border-neutral, #2b2b2b\)[\s\S]*?box-shadow:\s*2px 2px 0px var\(--border-neutral, #2b2b2b\)/,
  );
});

test('representative Canvas and teaching-series colors remain unchanged', () => {
  assert.match(app, /const COLOR_ORANGE = '#ff7a00'/);
  assert.match(quiz, /drawWobblyLine\(ctx, endX, endY, curEndX, curEndY, '#ff7a00'/);
  assert.match(multiple, /drawWobblyLine\(ctxG,[\s\S]*?'#ff7a00', 3, 225\)/);
  assert.match(explain, /drawWobblyLine\(ctx, mX\(0\), mY\(0\), endX1, endY1, '#ff7a00'/);
});

test('dynamic interface controls use theme variables', () => {
  assert.match(quiz, /btn2\.style\.background = 'var\(--theme-primary\)'/);
  assert.match(quiz, /btn\.style\.background = 'var\(--theme-primary-soft\)'/);
  assert.match(explain, /btn\.style\.background = 'var\(--theme-primary\)'/);
});

test('inline interface links use theme variables while data legends stay orange', () => {
  assert.match(pages['index.html'], /直接挑戰例題[^<]*<\/a>/);
  assert.match(pages['index.html'], /border-color:\s*var\(--theme-primary\)/);
  assert.match(pages['multiple_proportions.html'], /border-color:\s*var\(--theme-primary\)/);
  assert.match(pages['multiple_proportions.html'], /legend-dot[^>]*background-color:\s*#ff7a00/);
  assert.match(pages['quiz.html'], /NH₃ 中[\s\S]*?color:\s*#ff7a00/);
});
