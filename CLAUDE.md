# Piano

One web page, one instrument, no server. People play it with mouse, touch or keyboard. AI agents play it the same way, through computer use: screenshots and clicks, typed keystrokes, or DOM events. There is no API for agents, and there must not be one — making the page playable through ordinary human input is the whole idea.

Everything lives in `piano.html` (CSS and JS inline). Keep it that way until a second file is clearly needed.

## What matters, in order

1. It sounds good and responds instantly to a person.
2. An agent using only human input channels can play it well.
3. The page stays clean: one screen, one instrument, almost no chrome.

## Rules that are easy to break by accident

- Keys are real DOM `<button>`s with `aria-label="C4 (t)"`. Never move the keyboard to `<canvas>` — agents that read the accessibility tree would go blind, and so would screen readers.
- No agent-only entry points: no `window.play()`, no URL parameters, no WebSocket. If an agent needs something, make it work through what a person would do: keyboard, pointer, visible text.
- The letter layout is also the notation, and it is fixed: `1–0 q–p a–l z–m` are the white keys from C2 up, `t` is middle C, Shift adds a sharp, space is a rest, `[ ]` is a chord, `-` holds the last note. Letter sheets written for virtualpiano.net should keep working.
- Typing tempo: keydowns closer than ~70 ms with nothing physically held count as typing and are quantized to the current tempo, one character per eighth note. Human playing stays immediate. Never add latency to the human path to make the agent path easier; the 80 ms release grace after keyup is the one deliberate exception, so a typed phrase keeps its first note.
- Everything an agent needs to see is visible text: the played line above the fallboard (an `aria-live` region), the queue of pending characters after it, and the key labels. Keep them legible in a 1x screenshot.
- No panels, sidebars, modals, tours or settings pages. A new control goes in the single top-right row and has to earn its place.
- Design tokens are the `:root` variables. Ivory keys, ebony, lacquer fallboard, red felt strip, brass for pressed keys. Bodoni Moda for the nameplate only, Instrument Sans for everything else. No glow effects, no dark theme with a neon accent.
- Reduced motion, `:focus-visible` and keyboard-only use must keep working.

## Sound

- Salamander grand piano samples: 30 files, one every three semitones, about 2 MB total, pitched with `playbackRate`. Currently fetched from tonejs.github.io with raw.githubusercontent.com as fallback; self-hosting them under `assets/salamander/` is on the backlog. Keep the built-in synth fallback for offline use.
- Audio starts only after the "Open the piano" click, because browsers require a gesture. Keep that gate; it is also the page's one moment of ceremony.
- Note onsets are scheduled on the AudioContext clock. Releases and visuals use timers. Never schedule an onset with `setTimeout`.
- Nobody has listened to v0 yet. Tune the velocity curve, release time, compressor and per-key balance by ear before anything else.

## How to test

- Human: open `piano.html`, click Open the piano, play with mouse and keys.
- Agent: with Claude in Chrome, ask it to open the page and type `tyu [io]- p  s d f  [tuo]--`. Expect a phrase in time, chords landing together, keys lighting up, the played line filling in. JS-injected input must dispatch both `keydown` and `keyup`.
- `npm test` runs the page in jsdom with a fake AudioContext (no sound) and checks the input logic: immediate play, typing tempo, chords, holds, rests, sharps, tempo change, sustain, pointer, synthetic clicks, offline fallback. Keep it green and extend it whenever the typing-tempo code changes.

## Backlog, roughly in order

1. Listen and tune the sound.
2. Self-host the samples and drop the external fetches.
3. Deploy as a static site (GitHub Pages or Cloudflare Pages).
4. Run the Claude in Chrome test and write down what breaks.
5. Later, maybe: more instruments on the same keys (electric piano, marimba), 88 keys, and a shared room so others can hear an agent play — a thin relay of note events like multiplayerpiano.com, not a stage server with queues and clocks.
