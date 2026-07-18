import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const css = readFileSync(new URL('style.css', root), 'utf8');
const multipleHtml = readFileSync(new URL('multiple_proportions.html', root), 'utf8');

test('mobile tabs form a bounded two-column grid', () => {
  assert.match(
    css,
    /@media\s*\(max-width:\s*480px\)[\s\S]*?\.soil-tabs\s*\{[\s\S]*?display:\s*grid[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*480px\)[\s\S]*?\.soil-tab-btn\s*\{[\s\S]*?min-width:\s*0/,
  );
});

test('multiple-proportions HTML starts on the formal first teaching step', () => {
  assert.match(
    multipleHtml,
    /<h1 id="step-title">第一步：建立質量關係座標系<\/h1>/,
  );
  assert.match(multipleHtml, /以氫（H）與氧（O）組成的化合物為例/);
  assert.match(
    multipleHtml,
    /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)\s*!important/,
  );
  assert.match(multipleHtml, /@media\s*\(max-width:\s*820px\)/);
});
