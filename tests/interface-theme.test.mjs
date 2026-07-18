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

test('every production page identifies exactly one active lesson tab', () => {
  for (const [name, page] of Object.entries(pages)) {
    const activeTabs = page.match(/class="soil-tab-btn active"/g) ?? [];
    assert.equal(activeTabs.length, 1, `${name} must have exactly one active lesson tab`);
  }
});

test('example pages use a challenge badge instead of lesson step numbers', () => {
  for (const name of ['quiz.html', 'multiple_proportions_explain.html']) {
    assert.match(
      pages[name],
      /<div class="soil-page-num"(?: id="[^"]+")?>挑戰<\/div>/,
      `${name} must label its example badge as 挑戰`,
    );
  }
  assert.doesNotMatch(
    quiz,
    /getElementById\('quiz-page-num'\)\.textContent\s*=\s*'(?:09|10)'/,
  );
});

test('inactive and active lesson tabs use inverse theme states', () => {
  const inactiveRule = css.match(/\.soil-tab-btn\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  const inactiveHoverRule = css.match(/\.soil-tab-btn:hover\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  const activeRule = css.match(
    /\.soil-tab-btn\.active,\s*\.soil-tab-btn\.active:hover\s*\{([\s\S]*?)\}/,
  )?.[1] ?? '';

  assert.match(inactiveRule, /background:\s*var\(--theme-primary, #003153\)/);
  assert.match(inactiveRule, /color:\s*var\(--theme-on-primary, #ffffff\)/);
  assert.match(inactiveHoverRule, /background:\s*var\(--theme-primary-hover, #174a6b\)\s*!important/);
  assert.match(inactiveHoverRule, /color:\s*var\(--theme-on-primary, #ffffff\)\s*!important/);
  assert.match(activeRule, /background:\s*#ffffff\s*!important/);
  assert.match(activeRule, /color:\s*var\(--theme-primary, #003153\)\s*!important/);
});

test('purple geometric comparison control overrides the shared primary background', () => {
  const primaryRule = css.match(/\.btn-primary\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  const primaryHoverRule = css.match(/\.btn-primary:hover\s*\{([\s\S]*?)\}/)?.[1] ?? '';

  assert.match(
    pages['multiple_proportions_explain.html'],
    /id="btn-show-geometric"[^>]*style="[^"]*background:\s*#7c3aed/,
  );
  assert.doesNotMatch(primaryRule, /background:[^;]*!important/);
  assert.doesNotMatch(primaryHoverRule, /background:[^;]*!important/);
});

test('quiz hint buttons allow inline active theme styles to override their base rule', () => {
  const hintRule = pages['quiz.html'].match(/\.hint-sub-btn\s*\{([\s\S]*?)\}/)?.[1] ?? '';

  assert.doesNotMatch(hintRule, /background:[^;]*!important/);
  assert.doesNotMatch(hintRule, /border:[^;]*!important/);
  assert.match(quiz, /btn\.style\.background = 'var\(--theme-primary-soft\)'/);
  assert.match(quiz, /btn\.style\.borderColor = 'var\(--theme-primary\)'/);
  assert.match(quiz, /btn\.style\.color = 'var\(--theme-primary\)'/);
});

test('major question and card wrappers use the interface border token', () => {
  assert.match(
    pages['multiple_proportions_explain.html'],
    /\.question-card\s*\{[\s\S]*?border:\s*3px solid var\(--border-color\)/,
  );
  assert.match(
    pages['quiz.html'],
    /id="quizContentPage1"[^>]*border:\s*3px solid var\(--border-color\)/,
  );
  assert.match(
    pages['quiz.html'],
    /id="quizContentPage2"[^>]*border:\s*3px solid var\(--border-color\)/,
  );
});

test('enabled highlight button uses the interface border token', () => {
  assert.match(
    css,
    /\.nav-btn\.highlight-btn\s*\{[\s\S]*?border-color:\s*var\(--border-color\)\s*!important/,
  );
});

test('copyright modal interface borders use the theme token on every production page', () => {
  for (const [name, page] of Object.entries(pages)) {
    const modal = page.match(/<div id="copyrightModal"[\s\S]*?<script>/)?.[0] ?? '';

    assert.match(
      modal,
      /<div style="background: #ffffff; border: 3px solid var\(--border-color\)/,
      `${name} copyright modal card must use the interface border token`,
    );
    assert.match(
      modal,
      /<!-- Modal Header -->\s*<div style="background: #f9fafb; border-bottom: 2\.5px solid var\(--border-color\)/,
      `${name} copyright modal header must use the interface border token`,
    );
    assert.match(
      modal,
      /<button onclick="closeCopyrightModal\(\)" style="background: #ffffff; border: 2px solid var\(--border-color\)/,
      `${name} copyright modal close button must use the interface border token`,
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

test('pages with themed dynamic DOM styles load refreshed scripts', () => {
  assert.match(pages['quiz.html'], /quiz\.js\?v=20260718_04/);
  assert.match(
    pages['multiple_proportions_explain.html'],
    /multiple_proportions_explain\.js\?v=20260718_02/,
  );
});
