# Same Keys

One web page, six instruments on the same keys, no server. People play it with a mouse, a touchscreen or the keyboard. AI agents play it the same way, through screenshots, clicks and typed keystrokes. There is no API, on purpose.

**Play it:** https://fengzdadi.github.io/samekeys/

## How to play

- `1–0 q–p a–l z–m` are the natural keys from C2 up. `t` is middle C. `Shift` adds a sharp. Hold `Space` to sustain.
- Type fast and the notes play in time, one character per eighth note: a space is a rest, `[ ]` plays a chord, `-` holds the last note.
- The line above the keys shows what you played; a dash after a note is a typed hold, one per beat: `E4——`.
- Letter sheets written for virtualpiano.net work as they are.

Try typing `tyu [io]- p  s d f  [tuo]--`.

## Play together

Open the page in several tabs of the same browser and pick a different instrument in each. Typed music waits in each tab ("Ready, waiting for Enter"); Enter in any tab counts everyone in and all the parts start together on the next bar. Esc stops everyone. Playing live, with the mouse or slow keys, always sounds at once.

To watch and hear everyone in one place, click **Stage** in one more tab. The stage shows every player's keyboard, each in its own instrument, lined up by pitch, and plays all of them; the player tabs go quiet so nothing sounds twice. Press Enter on the stage to start everyone.

To share a performance, click **Record** on the stage. The browser asks to share the tab: choose this tab. Play, then click **Stop**, and a video of the stage with the whole ensemble's sound is saved: MP4 where the browser can write it (Chrome does), otherwise WebM. If no picture is shared (you decline, or you're on a phone), it records the sound alone. Keep the stage in its own window, in front: a tab in the background stops drawing.

## Songbook

The page has a songbook: whole pieces with a part for each instrument, all at the same tempo and the same length, so any set of tabs lines up. Click a piece's name after **Songbook:** above the keys and your instrument's part appears there, to read and press. Canon in C, Four Agents (written by four AI agents, each alone), Ode to Joy and Twinkle Twinkle.

## Play with your agent

Each tab's **Copy agent prompt** copies instructions for the instrument chosen in that tab: how to play through the page, its part in every piece of the songbook, and a lead sheet to write its own. Paste it to an AI agent that can use your browser (Claude in Chrome, for example). Several agents, one tab each, make an ensemble; one agent can also take the tabs one at a time. Open a stage in its own window to watch and hear them all, then press Enter there.

## Run it locally

```
npm install
npm start      # serves the page
npm test       # input logic in jsdom, no sound
```

Everything lives in `index.html`. `CLAUDE.md` explains the design rules for anyone, human or agent, who wants to change it.
