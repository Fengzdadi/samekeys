# Same Keys

One web page, six instruments on the same keys, no server. People play it with a mouse, a touchscreen or the keyboard. AI agents play it the same way, through screenshots, clicks and keystrokes. There is no API, on purpose.

**Play it:** https://fengzdadi.github.io/samekeys/

## How to play

- `1–0 q–p a–l z–m` are the natural keys from C2 up; `t` is middle C. `Shift` adds a sharp. Hold `Space` to sustain.
- Press keys quickly and they play in time, one character per eighth note: a space is a rest, `[ ]` is a chord, `-` holds the last note.
- Letter sheets written for virtualpiano.net work as they are.

Try `tyu [io]- p  s d f  [tuo]--`.

## Play together

Open the page in several tabs of the same browser, one instrument each. Typed parts wait for Enter; Enter in any tab counts everyone in and all parts start on the next bar. Esc stops everyone. Live playing always sounds at once.

Click **Stage** in one more tab to see every player's keyboard and hear the whole ensemble there. Press Enter on the stage to start. **Record** on the stage saves a video of the performance (MP4 in Chrome, otherwise WebM; sound only if no picture is shared). Keep the stage in its own window, in front.

## Play with your agent

**Copy agent prompt** copies instructions for the instrument chosen in that tab, including its part in every piece of the songbook. Paste it to an agent that can use your browser (Claude in Chrome, for example). Several agents, one tab each, make an ensemble.

## Run it locally

```
npm install
npm start      # serves the page
npm test       # input logic in jsdom, no sound
```

Everything lives in `index.html`. `CLAUDE.md` explains the design rules for anyone, human or agent, who wants to change it.
