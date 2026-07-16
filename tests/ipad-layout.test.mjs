import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('iPad landscape keeps two bounded columns', () => {
  assert.match(html, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)/);
  assert.match(html, /@media\s*\(max-width:\s*820px\)/);
});

test('iPad portrait stacks panels without full-width oversized canvases', () => {
  assert.match(html, /@media\s*\(max-width:\s*820px\)[\s\S]*?\.canvas-wrapper,[\s\S]*?\.graph-legend-html\s*\{[\s\S]*?max-width:\s*560px/);
  assert.match(html, /aspect-ratio:\s*auto\s*!important/);
});

test('canvas sizing has one 4:3 source and follows container changes', () => {
  assert.match(js, /const hL = wL \* 0\.75/);
  assert.match(js, /const hR = wR \* 0\.75/);
  assert.match(js, /new ResizeObserver\(scheduleCanvasResize\)/);
});

test('canvas display width follows each grid column so the center gap stays visible', () => {
  assert.match(html, /\.canvas-wrapper canvas\s*\{[\s\S]*?width:\s*100%\s*!important/);
  assert.doesNotMatch(js, /flaskCanvas\.style\.(?:width|height)/);
  assert.doesNotMatch(js, /graphCanvas\.style\.(?:width|height)/);
  assert.match(js, /canvasResizeObserver\?\.observe\(flaskCanvas\.parentElement\)/);
  assert.match(js, /canvasResizeObserver\?\.observe\(graphCanvas\.parentElement\)/);
});

test('iPad landscape legends use one wrapping column', () => {
  assert.match(html, /@media\s*\(min-width:\s*821px\)\s*and\s*\(max-width:\s*1180px\)[\s\S]*?\.graph-legend-html\s*\{[\s\S]*?grid-template-columns:\s*1fr\s*!important/);
  assert.match(html, /\.graph-legend-html \.legend-item\s*\{[\s\S]*?white-space:\s*normal\s*!important/);
});
