# Piano

One web page, one instrument, no server. People play it with mouse, touch or keyboard. AI agents play it the same way, through computer use: screenshots and clicks, typed keystrokes, or DOM events. There is no API for agents, and there must not be one — making the page playable through ordinary human input is the whole idea.

Everything lives in `index.html` (CSS and JS inline). Keep it that way until a second file is clearly needed.

## What matters, in order

1. It sounds good and responds instantly to a person.
2. An agent using only human input channels can play it well.
3. The page stays clean: one screen, one instrument, almost no chrome.

## Rules that are easy to break by accident

- Keys are real DOM `<button>`s with `aria-label="C4 (t)"`. Never move the keyboard to `<canvas>` — agents that read the accessibility tree would go blind, and so would screen readers.
- No agent-only entry points: no `window.play()`, no URL parameters, no WebSocket. If an agent needs something, make it work through what a person would do: keyboard, pointer, visible text.
- The letter layout is also the notation, and it is fixed: `1–0 q–p a–l z–m` are the natural keys from C2 up, `t` is middle C, Shift adds a sharp, space is a rest, `[ ]` is a chord, `-` holds the last note. Letter sheets written for virtualpiano.net should keep working.
- Typing tempo: keydowns closer than ~70 ms with nothing physically held count as typing and are quantized to the current tempo, one character per eighth note. Human playing stays immediate. Never add latency to the human path to make the agent path easier; the 80 ms release grace after keyup is the one deliberate exception, so a typed phrase keeps its first note.
- Other tabs of the page on the same computer play together: they find each other over `BroadcastChannel` and share the tempo. With another tab open, typed phrases are held (shown as "ready, waiting for Enter") instead of played; Enter in any tab counts everyone in for one bar and all held parts start on the same wall-clock downbeat (every tab says "Starting on the next bar" at once, then shows the count-in beat large on the wall, so Enter never looks like it did nothing); Esc stops every tab. Agents are seconds slow, so they only load parts; the start is the conductor's keypress, a person's or an agent's. The ensemble line at the top of the wall names the other tabs, one tag each, and whether each is ready; it is where a future stage shows its players. Alone, a tab behaves exactly as before, and live playing is never delayed. A future network relay should carry the same messages.
- Everything an agent needs to see is visible text: the played line above the fallboard (an `aria-live` region), the queue of pending characters after it, and the key labels. Keep them legible in a 1x screenshot.
- No panels, sidebars, modals, tours or settings pages. The top row holds the how-to-play text as a key legend (`<kbd>` keycaps inside full sentences, so the text still reads as instructions) and the playing controls: sustain, labels, tempo. The instruments are chosen on the fallboard, where their names are engraved as buttons: the chosen one larger, brighter and underlined (`aria-pressed`), each material with its own `--plate` and `--plate-dim`, both 4.5:1 or better. A new control goes in the top row and has to earn its place. Layout, top to bottom: legend and controls, the wall (ensemble line, played line), the fallboard with the instrument names, the keyboard, which is the largest thing on the page.
- Design tokens are the `:root` variables. Ivory keys, ebony, lacquer fallboard, red felt strip, brass for pressed keys. Bodoni Moda for the fallboard's instrument names only, Instrument Sans for everything else. No glow effects, no dark theme with a neon accent. Key labels and the queue keep at least 4.5:1 contrast in every state: pressed white keys turn `--brass-deep` with an ivory label, pressed black keys `--brass-light` with an ink label.
- Each instrument looks like itself through material tokens on `.stage[data-instrument]` (the piano is the default). Key buttons are only hit boxes and keep identical boxes on every instrument; faces, press overlays and labels are drawn inside them, and nothing is drawn under another key's button, so what an agent sees is what it clicks. Decoration is CSS or `aria-hidden`, never a control. Done: piano, electric piano (silver name rail, square keys), marimba (rosewood bars in two rows, resonators), organ (cherry cabinet, drawbars drawn from `DRAWBARS` and `ORGAN_SUB`, waterfall keys), music box (one chromatic comb under a pinned brass cylinder, crank; natural teeth are narrow, so their letters sit on steel tags)., harpsichord (French: reversed keys with ebony naturals and bone sharps, pale seams between the naturals, arcaded fronts, green case with gilt bands). Reversed keys were checked with Claude in Chrome: agents found every key by letter, by note name and with labels off, using the 2-and-3 grouping rather than colour.
- Reduced motion, `:focus-visible` and keyboard-only use must keep working.

## Sound

- Salamander grand piano samples: 30 files, one every three semitones, about 2 MB total, pitched with `playbackRate`. Currently fetched from tonejs.github.io with raw.githubusercontent.com as fallback; self-hosting them under `assets/salamander/` is on the backlog. Keep the built-in synth fallback for offline use.
- Instruments share the keys and the notation, and are chosen from the row of instrument buttons. Each has its own room colour behind it (`--room-top`, `--room`). Only the piano uses samples; the rest are synthesized in the page, each with its knobs as constants: electric piano (two-operator FM, `EP_`), harpsichord (Karplus-Strong strings computed once per note, 8' and 4' choirs, `HC_`), organ (drawbar wave, sub-octave, percussion, vibrato, `ORGAN_`), marimba (tuned bar partials, `MAR_`), music box (inharmonic tine partials, `MB_`). A new instrument is one voice function returning the same `{ when, stop(t, tau) }` handle plus an entry in `INSTRUMENTS`.
- Audio starts only after the "Open the piano" click, because browsers require a gesture. Keep that gate; it is also the page's one moment of ceremony.
- Note onsets are scheduled on the AudioContext clock. Releases and visuals use timers. Never schedule an onset with `setTimeout`.
- Nobody has listened to v0 yet. Tune the velocity curve, release time, compressor and per-key balance by ear before anything else.

## How to test

- Human: open `index.html`, click Open the piano, play with mouse and keys.
- Agent: with Claude in Chrome, ask it to open the page and type `tyu [io]- p  s d f  [tuo]--`. Expect a phrase in time, chords landing together, keys lighting up, the played line filling in. JS-injected input must dispatch both `keydown` and `keyup`. Agent tools differ: a `type` action that inserts text sends no key events on this page (there is no text field), so agents should press keys with literal characters (`t y shift+t [ i ] -`); key names like `minus` send nothing in Claude in Chrome; the page accepts Shift sent as a flag on the unshifted key and an empty `e.code`.
- `npm test` runs the page in jsdom with a fake AudioContext (no sound) on a fake clock that every window shares: page timers, `performance.now()`, `Date.now()`, the audio clock and the messages between tabs all run on it, and `sleep(ms)` moves it forward. Results depend on the code alone, never on machine load, and the whole run takes about a second. It checks the input logic: immediate play, typing tempo (including the exact 70 ms line), chords, holds, rests, sharps, tempo change, sustain, pointer, synthetic clicks, offline fallback, every instrument, two tabs holding their parts and starting on the same bar after Enter, Esc stopping both. Keep it green and extend it whenever the typing-tempo code changes.

## Backlog, roughly in order

1. Listen and tune the sound.
2. Self-host the samples and drop the external fetches.
3. Deploy as a static site (GitHub Pages or Cloudflare Pages).
4. Run the Claude in Chrome test and write down what breaks.
5. Later, maybe: 88 keys, and a shared room so others can hear an agent play — a thin relay of note events like multiplayerpiano.com, not a stage server with queues and clocks.
