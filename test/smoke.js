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
  connect(n) { return n; } start() {} stop() {} setPeriodicWave() {}
}
class FakeCtx {
  constructor() { this.state = 'running'; this.destination = new FakeNode(); }
  get currentTime() { return (Date.now() - t0) / 1000; }
  resume() { return Promise.resolve(); }
  createGain() { return new FakeNode(); } createDynamicsCompressor() { return new FakeNode(); }
  createBufferSource() { return new FakeNode(); } createOscillator() { return new FakeNode(); }
  get sampleRate() { return 44100; }
  createPeriodicWave() { return {}; }
  createBuffer(ch, len, sr) { const data = new Float32Array(len); return { duration: len / sr, getChannelData: () => data }; }
  decodeAudioData() { return Promise.resolve({ duration: 1 }); }
}
// Each group of windows gets its own channel name, so windows from earlier checks don't join later ones.
function load({ offline = false, room = 'solo' } = {}) {
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/',
    beforeParse(w) {
      w.AudioContext = FakeCtx;
      w.BroadcastChannel = class extends BroadcastChannel { constructor(name) { super(name + ':' + room); } };
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
// The instrument buttons, as a person or an agent finds them: by their visible name.
const pick = (doc, name) => [...doc.querySelectorAll('#instruments button')].find(b => b.textContent === name).click();
const picked = doc => [...doc.querySelectorAll('#instruments button[aria-pressed="true"]')].map(b => b.textContent).join();
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

  const main = d.querySelector('main').textContent;
  assert.ok(main.includes('middle C') && main.includes('Open the piano') && main.includes('Sustain') && main.includes('Harpsichord'),
    'main holds the whole instrument, so tools that read "main" see the instructions, controls and lid');
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

  // automation that sends Shift as a flag ("t" + shiftKey) and leaves e.code empty still plays sharps and phrases
  await sleep(300);
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 't', code: 'KeyT', shiftKey: true, bubbles: true, cancelable: true }));
  await sleep(30); assert.ok(lit(61), 'Shift flag + t plays C#4');
  d.dispatchEvent(new w.KeyboardEvent('keyup', { key: 't', code: 'KeyT', shiftKey: true, bubbles: true, cancelable: true }));
  await sleep(150); assert.ok(!lit(61), 'and releases');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: '1', code: 'Digit1', shiftKey: true, bubbles: true, cancelable: true }));
  await sleep(30); assert.ok(lit(37), 'Shift flag + 1 plays C#2');
  d.dispatchEvent(new w.KeyboardEvent('keyup', { key: '1', code: 'Digit1', shiftKey: true, bubbles: true, cancelable: true }));
  await sleep(150);
  for (const k of '[io]-') {
    d.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, code: '', bubbles: true, cancelable: true }));
    d.dispatchEvent(new w.KeyboardEvent('keyup', { key: k, code: '', bubbles: true, cancelable: true }));
    await sleep(3);
  }
  await sleep(100);
  assert.ok(played().endsWith('[F4 G4]'), 'a phrase with empty key codes plays as a phrase');
  await sleep(600);
  assert.strictEqual(d.querySelectorAll('.key.on').length, 0, 'and releases');

  // electric piano plays on the same keys
  assert.strictEqual(d.querySelectorAll('#instruments button').length, 6, 'all six instruments are visible buttons');
  assert.strictEqual(picked(d), 'Piano', 'the piano is chosen at first');
  pick(d, 'Electric piano');
  assert.strictEqual(picked(d), 'Electric piano', 'exactly one instrument is pressed');
  key('keydown', 'u'); await sleep(30);
  assert.ok(lit(64), 'electric piano plays');
  key('keyup', 'u'); await sleep(150);
  assert.ok(!lit(64), 'electric piano releases');
  await typeString('tyu'); await sleep(900);
  assert.ok(played().endsWith('C4  D4  E4'), 'electric piano plays a typed phrase');
  // every other instrument plays, releases and takes a typed chord
  for (const name of ['Harpsichord', 'Organ', 'Marimba', 'Music box']) {
    pick(d, name);
    assert.strictEqual(picked(d), name);
    assert.strictEqual(d.getElementById('keys').getAttribute('aria-label'), name + ' keys', 'the keyboard group names the instrument');
    key('keydown', 'u'); await sleep(30);
    assert.ok(lit(64), name + ' plays');
    key('keyup', 'u'); await sleep(150);
    assert.ok(!lit(64), name + ' releases');
    await typeString('[tu]o'); await sleep(700);
    assert.ok(played().endsWith('[C4 E4]  G4'), name + ' plays a typed chord');
  }
  assert.strictEqual(d.querySelector('.stage').dataset.instrument, 'musicbox', 'the materials follow the instrument');
  pick(d, 'Piano');
  assert.strictEqual(picked(d), 'Piano', 'back to the piano');
  assert.strictEqual(d.querySelector('.stage').dataset.instrument, 'piano');
  assert.strictEqual(d.getElementById('status').textContent, '', 'alone: no ensemble status');

  // --- offline: synth fallback ---
  w = load({ offline: true }); d = w.document;
  d.getElementById('open').click(); await sleep(200);
  assert.ok(d.getElementById('status').textContent.includes('built-in tone'), 'fallback message shown');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 't', code: 'KeyT', bubbles: true, cancelable: true }));
  await sleep(30);
  assert.ok(d.querySelector('[data-midi="60"]').classList.contains('on'), 'synth fallback still plays');

  // --- two tabs: shared tempo, typed music waits for Enter, then both count in and start on the same bar ---
  const a = load({ room: 'duo' }), b = load({ room: 'duo' });
  const tab = win => ({
    d: win.document,
    key: (type, k, code) => win.document.dispatchEvent(new win.KeyboardEvent(type, { key: k, code: code || codeFor(k), bubbles: true, cancelable: true })),
    played: () => win.document.getElementById('played').textContent,
    queue: () => win.document.getElementById('queue').textContent,
    held: () => win.document.getElementById('held').textContent,
    status: () => win.document.getElementById('status').textContent,
    bpm: () => win.document.getElementById('bpm').textContent,
    lit: m => win.document.querySelector(`[data-midi="${m}"]`).classList.contains('on'),
  });
  const A = tab(a), B = tab(b);
  const typeIn = async (t, s) => { for (const ch of s) { t.key('keydown', ch); t.key('keyup', ch); await sleep(12); } };
  A.d.getElementById('open').click(); B.d.getElementById('open').click();
  await sleep(200);
  assert.strictEqual(A.status(), 'Other tab: Piano', 'tabs find each other');
  assert.ok(!A.d.getElementById('together-how').hidden, 'the Enter / Esc line appears with another tab open');
  pick(B.d, 'Electric piano'); await sleep(50);
  assert.strictEqual(A.status(), 'Other tab: Electric piano', 'the other tab\'s instrument is shown');
  assert.strictEqual(A.d.querySelector('#status .player').textContent, 'Electric piano', 'each other tab is a tag');
  assert.strictEqual(picked(B.d), 'Electric piano', 'the fallboard shows the chosen instrument');
  A.d.getElementById('faster').click(); await sleep(50);
  assert.strictEqual(B.bpm(), '130', 'tempo is shared');
  A.d.getElementById('slower').click(); await sleep(50);
  assert.strictEqual(B.bpm(), '120');

  // Typed parts wait, however far apart they arrive. Live playing stays immediate.
  await typeIn(A, 'tyu');
  await sleep(100);
  assert.strictEqual(A.played(), '', 'the first keystroke of a held phrase is taken back');
  assert.strictEqual(A.held(), '   Ready, waiting for Enter: tyu', 'the held part is shown');
  assert.strictEqual(B.status(), 'Other tab: Piano (ready)', 'the other tab shows A is ready');
  await sleep(2300);   // more than a bar at 120 bpm
  await typeIn(B, 'qwe');
  await sleep(100);
  assert.strictEqual(A.status(), 'Other tab: Electric piano (ready)');
  assert.ok(A.d.querySelector('#status .player.ready'), 'a ready tab\'s tag is marked ready');
  assert.strictEqual(A.played(), '', 'nothing plays before Enter');
  A.key('keydown', 'o'); await sleep(30);
  assert.ok(A.lit(67), 'live playing is immediate while parts wait');
  A.key('keyup', 'o'); await sleep(200);

  // Enter in A: one bar of count-in (2 s at 120 bpm), then both start on the same wall-clock bar.
  while (Date.now() % 2000 < 150 || Date.now() % 2000 > 250) await sleep(5);
  const downbeat = (Math.ceil(Date.now() / 2000) + 1) * 2000;
  A.key('keydown', 'Enter', 'Enter'); A.key('keyup', 'Enter', 'Enter');
  await sleep(2000 - Date.now() % 2000 + 600);   // into the count-in bar, which is the next full bar
  assert.ok(/^Count-in [1-4]/.test(A.status()) && /^Count-in [1-4]/.test(B.status()), 'both tabs count in');
  const aBefore = A.played(), bBefore = B.played();
  await sleep(downbeat - Date.now() - 100);
  assert.strictEqual(A.played(), aBefore, 'A waits for the downbeat');
  assert.strictEqual(B.played(), bBefore, 'B waits for the downbeat');
  await sleep(200);
  assert.ok(A.played().endsWith('G4  C4'), 'A starts on the downbeat');
  assert.ok(B.played().endsWith('F3'), 'B starts on the same downbeat');
  await sleep(600);
  assert.ok(A.played().endsWith('C4  D4  E4'));
  assert.ok(B.played().endsWith('F3  G3  A3'));
  assert.ok(!A.held() && !B.held(), 'held parts are used up');
  assert.strictEqual(A.status(), 'Other tab: Electric piano', 'no longer ready after playing');

  // Backspace clears only this tab's waiting part.
  await typeIn(B, 'qwe'); await sleep(50);
  await typeIn(A, 'tyu'); await sleep(350);
  B.key('keydown', 'Backspace', 'Backspace'); await sleep(50);
  assert.strictEqual(B.held(), '', 'Backspace clears this tab\'s part');
  assert.strictEqual(A.held(), '   Ready, waiting for Enter: tyu', 'and leaves the other tab\'s part alone');
  assert.strictEqual(A.status(), 'Other tab: Electric piano', 'the other tab sees it is no longer ready');
  await typeIn(B, 'qwer'); await sleep(50);
  assert.strictEqual(B.held(), '   Ready, waiting for Enter: qwer', 'a new part can be typed after clearing');
  B.key('keydown', 'Backspace', 'Backspace');
  await typeIn(B, 'tyu'); await sleep(50);   // right after Backspace: the r before it must not join the new part
  assert.strictEqual(B.held(), '   Ready, waiting for Enter: tyu', 'Backspace ends the phrase before it');
  A.key('keydown', 'Escape', 'Escape'); await sleep(50);

  // Esc in one tab stops everyone, including held parts.
  await typeIn(B, 'qwe'); await sleep(50);
  assert.ok(A.status().endsWith('(ready)'));
  A.key('keydown', 'Escape', 'Escape'); await sleep(50);
  assert.strictEqual(B.held(), '', 'Esc clears the other tab\'s held part');
  assert.strictEqual(A.status(), 'Other tab: Electric piano');

  b.dispatchEvent(new b.Event('pagehide')); await sleep(50);
  assert.strictEqual(A.status(), '', 'a closed tab leaves');
  assert.ok(A.d.getElementById('together-how').hidden);
  // Alone again: typed phrases play right away and Enter does nothing.
  await typeIn(A, 'tyu'); await sleep(40);
  assert.ok(A.played().endsWith('C4'), 'alone, a typed phrase starts at once');

  console.log('ok');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
