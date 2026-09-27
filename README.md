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

To watch and hear everyone in one place, click **Stage** in one more tab. The stage shows every player's keyboard, each in its own instrument, lined up by pitch, and plays all of them; the player tabs go quiet so nothing sounds twice. Press Enter on the stage to start everyone. To share a performance, record the stage tab with any screen recorder.

## Play with your agent

Click **Copy agent prompt** at the top of the page, or copy the text below, and paste it to an AI agent that can use your browser (Claude in Chrome, for example). One agent can play the whole ensemble, tab by tab; an agent that can start helpers may give each instrument its own.

```
Please play an ensemble on a web instrument, using the browser the way a person would.
Each instrument plays in its own browser tab; the tabs find each other and start together.

Page: https://fengzdadi.github.io/samekeys/
Parts (two bars of C, F, G, C; each character is one key press):
- Organ: 8---4---5---8---
- Harpsichord: [80w]-[80w]-[8qe]-[8qe]-[79w]-[79w]-[80w]---
- Marimba: tuoutipiryoyt---
- Music box: fdsdg-j-hgfds---
(Piano: uytyi-p-oiuyt---, Electric piano: [tuo]-[tuo]-[tip]-[tip]-[ryo]-[ryo]-[tuo]---)

1. Open one tab per instrument and click "Open the piano" in each. Open them all before playing: a tab that is alone plays at once instead of waiting.
   Work in one tab at a time: bring it to the front and check that the "Open the piano" screen is gone before you click or press keys there. Clicks and key presses sent to a tab that is not in front can be lost.
2. In each tab, click the instrument's name on the dark band above the keys, then press its part's keys in one quick burst. The part waits: the line above the keys says "Ready, waiting for Enter".
3. When each of your tabs shows its part ready, press Enter in any one of them. Other tabs of the page that you did not open may be listed too; they don't need to be ready. All tabs count in and start together on the next bar. Esc in any tab stops everything.

You can do the tabs one after another yourself. If you can start helper agents, you may give each instrument its own, but they share one browser: let them load their parts one at a time, and have one of them (or you) press Enter at the end.

Pressing keys: t is middle C, 1–0 q–p a–l z–m are the natural keys from C2 up, Shift plays a sharp, [ ] makes a chord, - holds. Press keys, don't type text: the page has no text box. With Claude in Chrome, send a part as one key action with the characters separated by spaces (e.g. "8 - - - 4 - - - 5 - - - 8 - - -"), using literal characters, not key names like "minus".

Only want one instrument? Play just its part in a single tab.
Tell me what each tab's "Played notes" line, just above the keys, said.
```

## Run it locally

```
npm install
npm start      # serves the page
npm test       # input logic in jsdom, no sound
```

Everything lives in `index.html`. `CLAUDE.md` explains the design rules for anyone, human or agent, who wants to change it.
