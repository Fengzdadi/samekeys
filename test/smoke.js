// Runs index.html in jsdom with a fake AudioContext. Checks input logic, not sound.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const t0 = Date.now();
class FakeParam { constructor(v) { this.value = v; } setValueAtTime() {} linearRampToValueAtTime() {} setTargetAtTime() {} cancelScheduledValues() {} }
class FakeNode {
  constructor() { for (const p of ['gain', 'frequency', 'playbackRate', 'threshold', 'ratio', 'attack', 'release']) this[p] = new FakeParam(0); }
  connect(n) { return n; } start() {} stop() {}
}
class FakeCtx {
  constructor() { this.state = 'running'; this.destination = new FakeNode(); }
  get currentTime() { return (Date.now() - t0) / 1000; }
  resume() { return Promise.resolve(); }
  createGain() { return new FakeNode(); } createDynamicsCompressor() { return new FakeNode(); }
  createBufferSource() { return new FakeNode(); } createOscillator() { return new FakeNode(); }
  decodeAudioData() { return Promise.resolve({ duration: 1 }); }
}
function load({ offline = false } = {}) {
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/',
    beforeParse(w) {
      w.AudioContext = FakeCtx;
      w.matchMedia = () => ({ matches: false });
      w.fetch = offline
        ? () => Promise.reject(new Error('offline'))
        : () => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
      w.HTMLElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, width: 20, height: 100, right: 20, bottom: 100 });
    }
  });
  return dom.window;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const codeFor = ch => /[a-z]/i.test(ch) ? 'Key' + ch.toUpperCase()
  : ch === ' ' ? 'Space' : ch === '[' ? 'BracketLeft' : ch === ']' ? 'BracketRight' : ch === '-' ? 'Minus' : 'Digit' + ch;

async function main() {
  // --- online: samples "load" ---
  let w = load(), d = w.document;
  const key = (type, k, code) => d.dispatchEvent(new w.KeyboardEvent(type, { key: k, code: code || codeFor(k), bubbles: true, cancelable: true }));
  const typeString = async (s, gap = 12) => { for (const ch of s) { key('keydown', ch); key('keyup', ch); await sleep(gap); } };
  const lit = midi => d.querySelector(`[data-midi="${midi}"]`).classList.contains('on');
  const played = () => d.getElementById('played').textContent;
  const queue = () => d.getElementById('queue').textContent;

  assert.strictEqual(d.querySelectorAll('.key').length, 61, '61 keys');
  assert.strictEqual(d.querySelectorAll('.key.black').length, 25, '25 black keys');
  assert.strictEqual(d.querySelector('[data-midi="60"]').getAttribute('aria-label'), 'C4 (t)', 'middle C is t');
  assert.strictEqual(d.querySelector('[data-midi="61"]').getAttribute('aria-label'), 'C#4 (T)', 'sharps use Shift');

  d.getElementById('open').click();
  await sleep(200);
  assert.ok(d.getElementById('gate').classList.contains('hide'), 'gate hides after opening');
  assert.strictEqual(d.getElementById('status').textContent, '', 'no fallback message when samples load');

  // human: press and hold is immediate, release follows keyup
  key('keydown', 't'); await sleep(30);
  assert.ok(lit(60), 'immediate note lights the key');
  assert.strictEqual(played(), 'C4');
  key('keyup', 't'); await sleep(150);
  assert.ok(!lit(60), 'key releases after keyup');
  await sleep(400);

  // agent: typed phrase is quantized at 120 bpm (250 ms per character)
  await typeString('tyu [io]- p');
  assert.strictEqual(played(), 'C4  C4', 'only the first typed note has sounded right away');
  assert.ok(queue().includes('yu [io]- p'), 'pending characters are shown');
  await sleep(600);
  assert.strictEqual(played(), 'C4  C4  D4  E4', 'notes arrive one slot at a time');
  await sleep(1300);
  assert.strictEqual(played(), 'C4  C4  D4  E4  [F4 G4]  A4', 'chord lands together, hold and rest take a slot each');
  assert.strictEqual(queue(), '', 'queue drains');
  await sleep(300);
  assert.strictEqual(d.querySelectorAll('.key.on').length, 0, 'nothing stays lit');

  // chord first, repeated notes, sharps, Escape
  await typeString('[tyu] tt'); await sleep(900);
  assert.ok(played().endsWith('[C4 D4 E4]  C4  C4'), 'chord at the start of a phrase stays together');
  key('keydown', 'Escape', 'Escape');
  key('keydown', 'T', 'KeyT'); await sleep(20);
  assert.ok(lit(61), 'Shift+t plays C#4');
  key('keyup', 't', 'KeyT'); await sleep(120);
  assert.ok(!lit(61));

  // a note repeated later in the same phrase must still release on time (t: 0-240 ms, y: 250-740, t: 750-990)
  await typeString('tyyt'); await sleep(350);
  assert.ok(!lit(60), 'first C4 releases before its repeat');
  assert.ok(lit(62), 'D4 is sounding meanwhile');
  await sleep(700);
  assert.strictEqual(d.querySelectorAll('.key.on').length, 0, 'repeated note releases at the end');
  await sleep(300);
  // and "-" still extends the onset it belongs to
  await typeString('t--y'); await sleep(400);
  assert.ok(lit(60), 'held note stays lit');
  assert.ok(!lit(62));
  await sleep(500);
  assert.ok(!lit(60), 'held note releases when the hold ends');
  assert.ok(lit(62), 'next note follows');
  await sleep(400);

  // tempo change mid-phrase keeps going
  await typeString('tyuiopas'); await sleep(300);
  d.getElementById('faster').click(); d.getElementById('faster').click();
  await sleep(1800);
  assert.strictEqual(d.getElementById('bpm').textContent, '140');
  assert.ok(played().endsWith('C4  D4  E4  F4  G4  A4  B4  C5'), 'phrase finishes after tempo change');

  // sustain latch, pointer, synthetic click, labels
  d.getElementById('sustain').click();
  assert.strictEqual(d.getElementById('sustain').getAttribute('aria-pressed'), 'true');
  d.getElementById('sustain').click();
  const e4 = d.querySelector('[data-midi="64"]');
  e4.dispatchEvent(new w.PointerEvent('pointerdown', { pointerId: 1, clientX: 5, clientY: 80, bubbles: true, cancelable: true }));
  await sleep(30); assert.ok(lit(64), 'pointer plays');
  d.dispatchEvent(new w.PointerEvent('pointerup', { pointerId: 1, bubbles: true }));
  await sleep(30); assert.ok(!lit(64), 'pointer releases');
  await sleep(450); // clicks right after a real pointer press are ignored on purpose
  d.querySelector('[data-midi="67"]').click(); await sleep(30);
  assert.ok(lit(67), 'synthetic click plays a short note');
  await sleep(450); assert.ok(!lit(67));
  d.getElementById('labels').click();
  assert.ok(!d.body.classList.contains('labels'), 'labels toggle off');

  // --- offline: synth fallback ---
  w = load({ offline: true }); d = w.document;
  d.getElementById('open').click(); await sleep(200);
  assert.ok(d.getElementById('status').textContent.includes('built-in tone'), 'fallback message shown');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 't', code: 'KeyT', bubbles: true, cancelable: true }));
  await sleep(30);
  assert.ok(d.querySelector('[data-midi="60"]').classList.contains('on'), 'synth fallback still plays');

  console.log('ok');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
