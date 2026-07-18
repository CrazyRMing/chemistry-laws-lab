import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const productionPages = [
  'index.html',
  'multiple_proportions.html',
  'multiple_proportions_explain.html',
  'quiz.html',
];

test('project notes contain one development timeline', () => {
  const notes = readFileSync(new URL('PROJECT_NOTES.md', root), 'utf8');
  const headings = notes.match(/^# 專案開發筆記 \(PROJECT_NOTES\)$/gm) ?? [];
  assert.equal(headings.length, 1);
});

test('legacy 3b1b copies are removed from the published root', () => {
  assert.equal(existsSync(new URL('index_3b1b.html', root)), false);
  assert.equal(existsSync(new URL('app_3b1b.js', root)), false);
});

test('production pages share one stylesheet cache version', () => {
  for (const page of productionPages) {
    const html = readFileSync(new URL(page, root), 'utf8');
    assert.match(html, /style\.css\?v=20260718_02/);
  }
});

test('experiment images use a fixed cache version', () => {
  const app = readFileSync(new URL('app.js', root), 'utf8');
  assert.doesNotMatch(app, /Date\.now\(\)/);
  for (const image of ['titration', 'combustion', 'heating']) {
    assert.match(app, new RegExp(`assets/${image}\\.png\\?v=20260716_01`));
  }
});

test('README describes the current four-page guided site', () => {
  const readme = readFileSync(new URL('README.md', root), 'utf8');
  for (const expected of ['白底手繪', '逐步引導', '定比例題', '倍比例題']) {
    assert.match(readme, new RegExp(expected));
  }
  assert.doesNotMatch(readme, /深色模式|Glassmorphism|拖曳滑桿|物理碰撞模擬/);
});
