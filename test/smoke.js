// Runs index.html in jsdom with a fake AudioContext. Checks input logic, not sound.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
let clipboard = '';   // what the page last copied

// One fake clock for every window. Page timers, performance.now(), Date.now(), the audio clock and the
// messages between tabs all run on it, and the test moves it forward, so the results depend on the code
// alone and never on how busy the machine is. Due callbacks run in time order, then in the order they
// were set; promises settle between them, as they would in a browser.
const clock = {
  now: 1_000_000,   // wall-clock ms; a multiple of the 2 s bar, like any other instant
  seq: 0,
  timers: new Map(),   // id -> { id, at, fn, every, seq }
  set(fn, ms, every) {
    const id = ++this.seq;
    this.timers.set(id, { id, at: this.now + Math.max(0, Number(ms) || 0), fn, every, seq: id });
    return id;
  },
  clear(id) { this.timers.delete(id); },
  async advance(ms) {
    const end = this.now + ms;
    await settle();
    for (;;) {
      let next = null;
      for (const t of this.timers.values())
        if (t.at <= end && (!next || t.at < next.at || (t.at === next.at && t.seq < next.seq))) next = t;
      if (!next) break;
      this.now = Math.max(this.now, next.at);
      if (next.every) { next.at += next.every; next.seq = ++this.seq; } else this.timers.delete(next.id);
      next.fn();
      await settle();
    }
    this.now = end;
    await settle();
  },
};
const settle = () => new Promise(r => setImmediate(r));   // lets pending promises run
const sleep = ms => clock.advance(ms);

// BroadcastChannel on the fake clock: a message reaches every other tab on the same channel a moment later.
const channels = new Map();
class FakeChannel {
  constructor(name) {
    this.name = name;
    this.onmessage = null;
    if (!channels.has(name)) channels.set(name, new Set());
    channels.get(name).add(this);
  }
  postMessage(data) {
    for (const other of channels.get(this.name)) {
      if (other === this) continue;
      const copy = structuredClone(data);
      clock.set(() => other.onmessage && other.onmessage({ data: copy }), 0);
    }
  }
  close() { channels.get(this.name).delete(this); }
}
class FakeParam { constructor(v) { this.value = v; } setValueAtTime() {} linearRampToValueAtTime() {} setTargetAtTime() {} cancelScheduledValues() {} }
class FakeNode {
  constructor() { for (const p of ['gain', 'frequency', 'playbackRate', 'threshold', 'ratio', 'attack', 'release']) this[p] = new FakeParam(0); }
  connect(n) { return n; } start() {} stop() {} setPeriodicWave() {}
}
class FakeCtx {
  constructor() { this.state = 'running'; this.destination = new FakeNode(); this.t0 = clock.now; }
  get currentTime() { return (clock.now - this.t0) / 1000; }   // each context starts at 0, as in a browser
  resume() { return Promise.resolve(); }
  createGain() { return new FakeNode(); } createDynamicsCompressor() { return new FakeNode(); }
  createBufferSource() { return new FakeNode(); } createOscillator() { return new FakeNode(); }
  get sampleRate() { return 44100; }
  createPeriodicWave() { return {}; }
  createBuffer(ch, len, sr) { const data = new Float32Array(len); return { duration: len / sr, getChannelData: () => data }; }
  decodeAudioData() { return Promise.resolve({ duration: 1 }); }
}
// Each group of windows gets its own channel name, so windows from earlier checks don't join later ones.
// lag: this window's timers fire late, as in a silent background tab that the browser slows down
function load({ offline = false, room = 'solo', lag = 0 } = {}) {
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/',
    beforeParse(w) {
      w.AudioContext = FakeCtx;
      w.setTimeout = (fn, ms, ...args) => clock.set(() => fn(...args), (Number(ms) || 0) + lag);
      w.setInterval = (fn, ms, ...args) => clock.set(() => fn(...args), (Number(ms) || 0) + lag, Math.max(1, Number(ms) || 0));
      w.clearTimeout = w.clearInterval = id => clock.clear(id);
      const opened = clock.now;
      w.performance.now = () => clock.now - opened;
      w.Date.now = () => clock.now;
      w.BroadcastChannel = class extends FakeChannel { constructor(name) { super(name + ':' + room); } };
      w.matchMedia = () => ({ matches: false });
      w.fetch = offline
        ? () => Promise.reject(new Error('offline'))
        : () => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
      Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async text => { clipboard = text; } } });
      w.HTMLElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, width: 20, height: 100, right: 20, bottom: 100 });
    }
  });
  return dom.window;
}
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
  assert.ok(main.includes('1–0 q–p a–l z–m are the natural keys'), 'the key legend reads as a sentence');
  for (const el of d.querySelectorAll('.how i, #hint'))
    assert.strictEqual(el.getAttribute('aria-label'), el.textContent.replace(/\s+/g, ' ').trim(), 'keycap sentences carry their whole text as a name');
  const hint = d.getElementById('hint');
  assert.ok(!hint.hidden && hint.textContent.includes('Press t t o o p p o to play Twinkle Twinkle'),
    'the empty wall offers a tune to try, as keys to press, read the same as text');
  d.getElementById('open').click();
  await sleep(200);
  assert.ok(d.getElementById('gate').classList.contains('hide'), 'gate hides after opening');
  assert.strictEqual(d.getElementById('status').textContent, 'Alone here · open this page in another tab to play together',
    'alone, the ensemble line says how to play together, and no fallback message when samples load');
  assert.ok(!hint.hidden, 'the phrase to try stays until something is played');

  // human: press and hold is immediate, release follows keyup
  key('keydown', 't'); await sleep(30);
  assert.ok(lit(60), 'immediate note lights the key');
  assert.ok(hint.hidden, 'the first note clears the phrase to try');
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

  // the 70 ms line, exactly: keys 50 ms apart are typing and wait for their slots, 90 ms apart are played live
  await typeString('tyu', 50);
  assert.ok(played().endsWith('A4  C4') && queue().includes('yu'), 'keys 50 ms apart are typed');
  await sleep(1000);
  await typeString('tyu', 90);
  assert.ok(played().endsWith('C4  D4  E4') && queue() === '', 'keys 90 ms apart are played as they come');
  await sleep(500);

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
    assert.strictEqual(d.title, name, 'the tab title names the instrument');
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
  assert.strictEqual(d.getElementById('status').textContent, 'Alone here · open this page in another tab to play together', 'alone: the ensemble line\'s empty state');

  // The agent prompt: an ensemble in one paste. It is the README's text, it names what is really on the
  // page, and every part in it plays the notes it should.
  const promptBtn = d.getElementById('agent-prompt');
  promptBtn.click(); await sleep(0);
  assert.ok(promptBtn.textContent.startsWith('Copied'), 'the button says it copied');
  assert.ok(readme.includes(clipboard.replace('http://localhost/', 'https://fengzdadi.github.io/samekeys/')),
    'the README carries the same prompt');
  assert.strictEqual(d.getElementById('played').getAttribute('aria-label'), 'Played notes', 'the played line has a name tools can find');
  for (const words of ['Open the piano', 'Ready, waiting for Enter', 'Played notes'])
    assert.ok(clipboard.includes('"' + words + '"') && html.includes(words), 'the prompt quotes "' + words + '" as the page says it');
  const parts = [
    ['Organ', 'C3  F2  G2  C3'],
    ['Harpsichord', '[C3 E3 G3]  [C3 E3 G3]  [C3 F3 A3]  [C3 F3 A3]  [B2 D3 G3]  [B2 D3 G3]  [C3 E3 G3]'],
    ['Marimba', 'C4  E4  G4  E4  C4  F4  A4  F4  B3  D4  G4  D4  C4'],
    ['Music box', 'E5  D5  C5  D5  F5  A5  G5  F5  E5  D5  C5'],
    ['Piano', 'E4  D4  C4  D4  F4  A4  G4  F4  E4  D4  C4'],
    ['Electric piano', '[C4 E4 G4]  [C4 E4 G4]  [C4 F4 A4]  [C4 F4 A4]  [B3 D4 G4]  [B3 D4 G4]  [C4 E4 G4]'],
  ];
  for (const [name, notes] of parts) {
    const part = clipboard.match(new RegExp('\\b' + name + ': ([^\\s,)]+)'))[1];
    pick(d, name);
    await typeString(part); await sleep(4500);
    assert.ok(played().endsWith(notes), name + '\'s part in the prompt plays ' + notes);
  }
  pick(d, 'Piano');
  await sleep(2500);
  assert.strictEqual(promptBtn.textContent, 'Copy agent prompt', 'and goes back to its name');

  // the wall's hint names a tune; pressed at a person's pace, its keys play that tune
  {
    const w2 = load({ room: 'twinkle' }), d2 = w2.document;
    const press = (type, k) => d2.dispatchEvent(new w2.KeyboardEvent(type, { key: k, code: codeFor(k), bubbles: true, cancelable: true }));
    d2.getElementById('open').click(); await sleep(200);
    for (const ch of 'ttooppo') { press('keydown', ch); await sleep(150); press('keyup', ch); await sleep(150); }
    assert.strictEqual(d2.getElementById('played').textContent, 'C4  C4  G4  G4  A4  A4  G4', 'the hint plays Twinkle Twinkle');
  }

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
  await sleep((2200 - clock.now % 2000) % 2000);   // press Enter 200 ms into a bar
  const downbeat = (Math.ceil(clock.now / 2000) + 1) * 2000;
  A.key('keydown', 'Enter', 'Enter'); A.key('keyup', 'Enter', 'Enter');
  await sleep(50);
  assert.ok(A.status().startsWith('Starting on the next bar') && B.status().startsWith('Starting on the next bar'),
    'right after Enter, both tabs say the music starts on the next bar');
  assert.strictEqual(A.d.getElementById('count').textContent, 'Starting on the next bar', 'and show it large on the wall');
  await sleep(2000 - clock.now % 2000 + 600);   // into the count-in bar, which is the next full bar
  assert.ok(/^Count-in [1-4]/.test(A.status()) && /^Count-in [1-4]/.test(B.status()), 'both tabs count in');
  assert.ok(/^[1-4]$/.test(B.d.getElementById('count').textContent), 'the beat is shown large');
  const aBefore = A.played(), bBefore = B.played();
  await sleep(downbeat - clock.now - 100);
  assert.strictEqual(A.played(), aBefore, 'A waits for the downbeat');
  assert.strictEqual(B.played(), bBefore, 'B waits for the downbeat');
  await sleep(200);
  assert.ok(A.played().endsWith('G4  C4'), 'A starts on the downbeat');
  assert.ok(B.played().endsWith('F3'), 'B starts on the same downbeat');
  assert.strictEqual(A.d.getElementById('count').textContent, '', 'the count-in clears on the downbeat');
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
  assert.strictEqual(A.status(), 'Alone here · open this page in another tab to play together', 'a closed tab leaves, and the empty state comes back');
  assert.ok(A.d.getElementById('together-how').hidden);
  // Alone again: typed phrases play right away and Enter does nothing.
  await typeIn(A, 'tyu'); await sleep(40);   // well before D4 is due (250 ms)
  assert.ok(A.played().endsWith('C4'), 'alone, a typed phrase starts at once');

  // --- a stage: one tab shows and plays every player; the players go quiet and send it their notes ---
  const P1 = tab(load({ room: 'hall' })), P2 = tab(load({ room: 'hall' })), S = tab(load({ room: 'hall' }));
  for (const t of [P1, P2, S]) t.d.getElementById('open').click();
  await sleep(200);
  pick(P2.d, 'Marimba'); await sleep(50);
  S.d.getElementById('stage-toggle').click(); await sleep(50);
  assert.strictEqual(S.d.title, 'Stage', 'the stage tab is titled Stage');
  assert.ok(S.status().startsWith('Stage · 2 players'), 'the stage counts its players');
  const stripOf = id => S.d.querySelector(`.strip[data-instrument="${id}"]`);
  const stripLine = id => stripOf(id).querySelector('.strip-line').textContent;
  assert.strictEqual(S.d.querySelectorAll('.strip').length, 2, 'one strip per player, not one for the stage');
  assert.ok(stripOf('piano') && stripOf('marimba'), 'each strip takes its player\'s instrument');
  assert.strictEqual(stripOf('marimba').querySelectorAll('.key').length, 61, 'a strip is the whole keyboard');
  assert.strictEqual(stripOf('marimba').getAttribute('aria-label'), 'Marimba');
  assert.strictEqual(P1.status(), 'Stage is open: sound comes from the stage · Other tab: Marimba',
    'a player learns where the sound went, and still sees the other player, not the stage');

  // live playing in a player tab lights its strip on the stage at once, and releases with it
  P1.key('keydown', 'o'); await sleep(30);
  assert.ok(P1.lit(67), 'the player still sees its own key');
  assert.ok(stripOf('piano').querySelector('.key.on'), 'the stage lights the key on the player\'s strip');
  assert.ok(stripLine('piano').endsWith('G4'), 'and writes it on the strip\'s line');
  P1.key('keyup', 'o'); await sleep(200);
  assert.ok(!stripOf('piano').querySelector('.key.on'), 'the key goes dark with the player\'s');

  // parts wait; the stage conducts, and both play on it together
  await typeIn(P1, 'tyu'); await typeIn(P2, 'qwe'); await sleep(100);
  assert.ok(stripOf('piano').querySelector('.strip-name').textContent.includes('(ready)'), 'a strip shows its player is ready');
  assert.ok(!stripLine('piano').endsWith('C4'), 'a held phrase\'s first note, taken back, leaves the strip too');
  S.key('keydown', 'Enter', 'Enter'); S.key('keyup', 'Enter', 'Enter');
  await sleep(50);
  assert.ok(S.status().startsWith('Starting on the next bar'), 'the stage counts in too');
  await sleep(5000);
  assert.ok(stripLine('piano').endsWith('G4  C4  D4  E4'), 'the piano part plays on the stage');
  assert.ok(stripLine('marimba').endsWith('F3  G3  A3'), 'and the marimba part with it');
  assert.strictEqual(S.d.querySelectorAll('.strip .key.on').length, 0, 'and every key is released');

  // the stage itself plays no notes from letters; Esc on the stage stops everyone
  const before = stripLine('piano');
  S.key('keydown', 't'); S.key('keyup', 't'); await sleep(100);
  assert.strictEqual(stripLine('piano'), before, 'letters typed on the stage play nothing');
  assert.strictEqual(S.played(), '', 'not even on the stage\'s own keyboard');
  await typeIn(P2, 'rty'); await sleep(50);
  S.key('keydown', 'Escape', 'Escape'); await sleep(50);
  assert.strictEqual(P2.held(), '', 'Esc on the stage clears the players\' waiting parts');

  // A player in the background, silent while the stage plays, has its timers slowed down; the stage
  // must still release every key on time, not when the late player gets round to it.
  const L = tab(load({ room: 'hall', lag: 1500 }));
  L.d.getElementById('open').click(); await sleep(1700);
  pick(L.d, 'Organ'); await sleep(50);
  await typeIn(L, 'tyu-'); await sleep(100);
  await sleep((2200 - clock.now % 2000) % 2000);   // Enter 200 ms into a bar
  const down = (Math.ceil(clock.now / 2000) + 1) * 2000;
  S.key('keydown', 'Enter', 'Enter'); S.key('keyup', 'Enter', 'Enter');
  await sleep(down - clock.now + 300);   // C4 sounded 0 to 240 ms, D4 is sounding now
  const organDown = () => stripOf('organ').querySelectorAll('.key.on').length;
  assert.strictEqual(organDown(), 1, 'the stage has released C4 on time, with only D4 down');
  await sleep(500);                     // E4's own slot ended at 740 ms; its "-" holds it to 990 ms
  assert.strictEqual(organDown(), 1, 'a "-" still holds E4 on the stage');
  await sleep(300);
  assert.strictEqual(organDown(), 0, 'and the stage lets it go when the hold ends, not seconds later');
  L.d.defaultView.dispatchEvent(new L.d.defaultView.Event('pagehide')); await sleep(50);
  assert.ok(!stripOf('organ'), 'a player that leaves takes its strip with it');

  // leaving the stage: back to a player, and the others hear themselves again
  S.d.getElementById('stage-toggle').click(); await sleep(50);
  assert.strictEqual(S.d.querySelectorAll('.strip').length, 0, 'the strips go');
  assert.strictEqual(P1.status(), 'Other tabs: Marimba, Piano', 'no stage any more');
  assert.strictEqual(S.d.title, 'Piano');

  console.log('ok');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
