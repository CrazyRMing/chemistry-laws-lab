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

test('D and SiC attach to the silicon node vertical center anchors', () => {
  const source = functionSection('drawQuizDiagram', 'verifyCurrentQuiz');

  assert.match(js, /function quizVerticalAnchors\(cx, cy, halfHeight\)/);
  assert.match(source, /const siliconAnchors = quizVerticalAnchors\(x1, yMid, 18\)/);
  assert.match(source, /siliconAnchors\.top\.x, siliconAnchors\.top\.y/);
  assert.match(source, /siliconAnchors\.bottom\.x, siliconAnchors\.bottom\.y/);
  assert.doesNotMatch(source, /x1 \+ 45, yMid [-+] 5/);
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
  assert.match(html, /quiz\.js\?v=20260718_02/);
});
