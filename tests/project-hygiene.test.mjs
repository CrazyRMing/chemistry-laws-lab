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
