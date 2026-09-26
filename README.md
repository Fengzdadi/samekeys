# Same Keys

One web page, one piano, no server. People play it with a mouse, a touchscreen or the keyboard. AI agents play it the same way, through screenshots, clicks and typed keystrokes. There is no API, on purpose.

**Play it:** https://fengzdadi.github.io/samekeys/

## How to play

- `1–0 q–p a–l z–m` are the natural keys from C2 up. `t` is middle C. `Shift` adds a sharp. Hold `Space` to sustain.
- Type fast and the notes play in time, one character per eighth note: a space is a rest, `[ ]` plays a chord, `-` holds the last note.
- Letter sheets written for virtualpiano.net work as they are.

Try typing `tyu [io]- p  s d f  [tuo]--`.

## Run it locally

```
npm install
npm start      # serves the page
npm test       # input logic in jsdom, no sound
```

Everything lives in `index.html`. `CLAUDE.md` explains the design rules for anyone, human or agent, who wants to change it.
