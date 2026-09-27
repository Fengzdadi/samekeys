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

## Play with your agent

Each tab's **Copy agent prompt** copies instructions for the instrument chosen in that tab: its part in every piece of the songbook below, or a lead sheet to write its own. Paste it to an AI agent that can use your browser (Claude in Chrome, for example). Several agents, one tab each, make an ensemble; one agent can also take the tabs one at a time. Open a stage in its own window to watch and hear them all, then press Enter there. The prompt for the piano:

```
You are the Piano player in an ensemble on a web instrument. Each player, a person or an AI agent, plays one instrument in its own browser tab; the tabs find each other and start together. Play through the page the way a person would.

Page: https://fengzdadi.github.io/samekeys/

1. Open the page and click "Open the piano", then click "Piano" in the row of instrument names on the dark band above the keys. Work in your own tab only, and bring it to the front before you click or press keys there: clicks and key presses sent to a tab that is not in front can be lost.
2. Press your part for the piece I name (if I name none, the first below) in one quick burst. With other tabs of the page open, it waits: the line above the keys says "Ready, waiting for Enter". If yours is the only tab, it plays at once, so open another tab first.
3. Don't press Enter unless I ask you to start everyone: Enter in any tab counts everyone in, and every waiting part starts together on the next bar. Esc in any tab stops everything.

Your parts, at tempo 120 (each character is one key press, one eighth note):
- Canon in C (Pachelbel; a ground bass under a canon of four voices, 2 min): [wtu]---[wry]---[etu]---[wru]---[eti]---[wtu]---[eti]---[wry]---[wtu]---[wry]---[etu]---[wru]---[eti]---[wtu]---[eti]---[wry]---[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]---[wry]---[etu]---[wru]---[eti]---[wtu]---[eti]---[wry]---[wtu]---[wry]---[etu]---[wru]---[eti]---[wtu]---[eti]---[wry]---[8wtu]---------------
- Four Agents (written by four AI agents, each alone, from one lead sheet, 2 min): no Piano part; it is for harpsichord, organ, marimba, music box.
- Ode to Joy (Beethoven; the whole theme, twice, 1 min): u-u-i-o-o-i-u-y-t-t-y-u-u--yy---u-u-i-o-o-i-u-y-t-t-y-u-y--tt---y-y-u-t-y-uiu-t-y-uiu-t-t-y-w---u-u-i-o-o-i-u-y-t-t-y-u-y--tt---u-u-i-o-o-i-u-y-t-t-y-u-u--yy---u-u-i-o-o-i-u-y-t-t-y-u-y--tt---y-y-u-t-y-uiu-t-y-uiu-t-t-y-w---u-u-i-o-o-i-u-y-t-t-y-u-y--tt---[tuo]---------------
- Twinkle Twinkle (all three verses, twice, 50 s): t-t-o-o-p-p-o---i-i-u-u-y-y-t---o-o-i-i-u-u-y---o-o-i-i-u-u-y---t-t-o-o-p-p-o---i-i-u-u-y-y-t---8w0w8w0wqtet8w0wqtet8w0w7w9w8w0w8w0wqtet8w0w7w9w8w0wqtet8w0w7w9w8w0w8w0wqtet8w0wqtet8w0w7w9w8w0w[tuo]---------------

Or write your own part over this lead sheet, two chords per bar, each 4 characters long: C G Am Em F C F G, 14 times, then a 16-character ending on a note of C major held with 15 "-", 464 characters in all. Say so to the other players, so every part is the same length.

Pressing keys: t is middle C, 1–0 q–p a–l z–m are the natural keys from C2 up, Shift plays a sharp, [ ] around keys plays a chord in one slot, - holds, a space rests. Press keys, don't type text: the page has no text box. With Claude in Chrome, send a part as key actions with the characters separated by spaces, the word "space" for a rest and the literal characters otherwise, not key names like "minus"; a long part can go in a few actions, in order.

Playing several instruments yourself? Take them one tab at a time: each tab's "Copy agent prompt" gives that instrument's parts.
Tell me what your "Played notes" line, just above the keys, said.
```

## Songbook

Whole pieces, one part per instrument, at tempo 120. Each character is one key press, one eighth note; press a part fast and it plays in time. Every part of a piece is the same length, so any set of tabs lines up. Parts that come in later start with rests (spaces), counted here.

### Canon in C

Pachelbel; a ground bass under a canon of four voices, 2 min.

```
Piano: [wtu]---[wry]---[etu]---[wru]---[eti]---[wtu]---[eti]---[wry]---[wtu]---[wry]---[etu]---[wru]---[eti]---[wtu]---[eti]---[wry]---[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]---[wry]---[etu]---[wru]---[eti]---[wtu]---[eti]---[wry]---[wtu]---[wry]---[etu]---[wru]---[eti]---[wtu]---[eti]---[wry]---[8wtu]---------------
Electric piano: (first press space 96 times, 24 s of rest) u---y---t---r---e---w---e---r---t---r---e---w---q---0---q---9---8-0-w-q-0-8-0-9-8-6-8-w-q-e-w-q-0-8-9-r-t-u-o-w-e-q-w-0-8-t-t-r-uytyyrwrte0erw0weq8qw080etipoiyrtyutrtyrertewerwqweq0qw0qetiwryif---d---s---a---p---o---p---a---s---a---p---o---i---u---i---y---u---y---t---r---e---w---e---r---t---r---e---w---q---0---q---9---8-0-w-q-0-8-0-9-8-6-8-w-q-e-w-q-t---------------
Harpsichord: f---d---s---a---p---o---p---a---s---a---p---o---i---u---i---y---t-u-o-i-u-t-u-y-t-e-t-o-i-p-o-i-u-t-y-a-s-f-h-o-p-i-o-u-t-s-s-a-fdsddaoaspupaouopitioutupsgjhgdasdfsasdapaspopaoiopiuiouipsgoadgx---z---l---k---j---h---j---k---l---k---j---h---g---f---g---d---f---d---s---a---p---o---p---a---s---a---p---o---i---u---i---y---t-u-o-i-u-t-u-y-t-e-t-o-i-p-o-i-u-t-y-a-s-f-h-o-p-i-o-u-t-s-s-a-fdsddaoaspupaouopitioutupsgjhgdasdfsasdapaspopaoiopiuiouipsgoadgs---------------
Organ: 8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---[18]---------------
Marimba: (first press space 32 times, 8 s of rest) f---d---s---a---p---o---p---a---s---a---p---o---i---u---i---y---t-u-o-i-u-t-u-y-t-e-t-o-i-p-o-i-u-t-y-a-s-f-h-o-p-i-o-u-t-s-s-a-fdsddaoaspupaouopitioutupsgjhgdasdfsasdapaspopaoiopiuiouipsgoadgx---z---l---k---j---h---j---k---l---k---j---h---g---f---g---d---f---d---s---a---p---o---p---a---s---a---p---o---i---u---i---y---t-u-o-i-u-t-u-y-t-e-t-o-i-p-o-i-u-t-y-a-s-f-h-o-p-i-o-u-t-s-s-a-fdsddaoaspupaouopitioutupsgjhgdao---------------
Music box: (first press space 64 times, 16 s of rest) f---d---s---a---p---o---p---a---s---a---p---o---i---u---i---y---t-u-o-i-u-t-u-y-t-e-t-o-i-p-o-i-u-t-y-a-s-f-h-o-p-i-o-u-t-s-s-a-fdsddaoaspupaouopitioutupsgjhgdasdfsasdapaspopaoiopiuiouipsgoadgx---z---l---k---j---h---j---k---l---k---j---h---g---f---g---d---f---d---s---a---p---o---p---a---s---a---p---o---i---u---i---y---t-u-o-i-u-t-u-y-t-e-t-o-i-p-o-i-u-t-y-a-s-f-h-o-p-i-o-u-t-s-s-a-u---------------
```

### Four Agents

Written by four AI agents, each alone, from one lead sheet, 2 min.

```
Harpsichord: (first press space 32 times, 8 s of rest) [wtu]---[wry]---[etu]---[wru]---[eti]---[wtu]---[eti]---[wry]---[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-8w0wwyryeutu0rwrqtet8w0wqtetwyry8w0wwyryeutu0rwrqtet8w0wqtetwyry8wtuwryoetup0wruqeti8wtuqetiwryo8wtuwryoetup0wruqeti8wtuqetiwryo[wtu] [wtu][wtu][wry] [wry][wry][etu] [etu][etu][wru] [wru][wru][eti] [eti][eti][wtu] [wtu][wtu][eti] [eti][eti][wry] [wry][wry][wtu] [wtu][wtu][wry] [wry][wry][etu] [etu][etu][wru] [wru][wru][eti] [eti][eti][wtu] [wtu][wtu][eti] [eti][eti][wry] [wry][wry][8w]tuo[wr]yoa[et]ups[0w]rua[qe]tip[8w]tuo[qe]tip[wr]yoa[8w]tuo[wr]yoa[et]ups[0w]rua[qe]tip[8w]tuo[qe]tip[wr]yoa[wtu]-[wtu]-[wry]-[wry]-[etu]-[etu]-[wru]-[wru]-[eti]-[eti]-[wtu]-[wtu]-[eti]-[eti]-[wry]-[wry]-[wtu]---[wry]---[etu]---[wru]---[eti]---[wtu]---[eti]---[wry]---[8wu]---------------
Organ: (first press space 32 times, 8 s of rest) 8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8---5---6---3---4---1---4---5---8-5-5-2-6-3-3-7-4-8-1-5-4-8-5-2-8-5-5-2-6-3-3-7-4-8-1-5-4-8-5-2-8--55--26--33--74--81--54--85--78--55--26--33--74--81--54--85--78-765-7-6-543-5-4-8-1-3-4-6-5-7-8-765-7-6-543-5-4-8-1-3-4-6-5-7-8-765-7-6-543-5-4-8-1-3-4-6-5-7-8-765-7-6-543-5-4-8-1-3-4-6-5-7-8-5-5-2-6-3-3-7-4-8-1-5-4-8-5-2-8---5---6---3---4---1---4---5---[18]---------------
Marimba: (first press space 64 times, 16 s of rest) s---a---p---o---i---u---p---a---s---a---p---o---i---u---p---a-sds-dsa-sap-apo-poi-oiu-iop-opa-sds-dsa-sap-apo---i-oiu-iop-opa-sdf-gfd-fds-dsa-dfg-hgf-d-s-asd-fgf-hfd-fds-dsa-dfg-hgf-d-s-asd-fgh-gfd-a-s-dfh-gfg-sdf-ghg-fda-sdfghfdfdasdfsasdfgfsdf---g-fda-sds-dsa-sap-apo-poi-oiu-iop-opa-sd[us]---[ya]---[tp]---[uo]---[ip]---[us]---[ps]---[ad]---s-dsa---p-apo---i-oiu---p-opa---s---a---p---o---i---u---i---y---u---------------
Music box: f-h-d---s-f-h---j-h-f---g-f-d---f-h-d---s-f-h---j-h-f---g-f-d---f-ghd-fds-dfh-gfj-kjh-f-g-fdd---f-h-d---s-f-h---j-h-f---g-f-d---l---k-h-j---h-k-l-j-h---j-g-k---l-kjk-jhj-ljk-hfg-jll-hfg-jgh-d-f-ghd-fds-dfh-gfj-kjh-f-g-fdd---f-  d-  s-  h-  j-  f-  g-  d-  f-h-d---s-f-h---j-h-f---g-f-d---f-ghd-fds-dfh-gfj-kjh-f-g-fdd---l---k-h-j---h-k-l-j-h---j-g-k---l-kjk-jhj-ljk-hfg-jll-hfg-jgh-d-f-ghd-fds-dfh-gfj-kjh-f-g-fdd---f-h-d---s-f-h---j-h-f---g-f-d---s---------------
```

### Ode to Joy

Beethoven; the whole theme, twice, 1 min.

```
Piano: u-u-i-o-o-i-u-y-t-t-y-u-u--yy---u-u-i-o-o-i-u-y-t-t-y-u-y--tt---y-y-u-t-y-uiu-t-y-uiu-t-t-y-w---u-u-i-o-o-i-u-y-t-t-y-u-y--tt---u-u-i-o-o-i-u-y-t-t-y-u-u--yy---u-u-i-o-o-i-u-y-t-t-y-u-y--tt---y-y-u-t-y-uiu-t-y-uiu-t-t-y-w---u-u-i-o-o-i-u-y-t-t-y-u-y--tt---[tuo]---------------
Electric piano: [wt]---[wr]---[wr]---[wt]---[wt]---[wr]---[wt]---[wr]---[wt]---[wr]---[wr]---[wt]---[wt]---[wr]---[wr]---[wt]---[wr]---[wt]---[wr]---[wt]---[wr]---[wt]---[wt]---[wr]---[wt]---[wr]---[wr]---[wt]---[wt]---[wr]---[wr]---[wt]---[wt]---[wr]---[wr]---[wt]---[wt]---[wr]---[wt]---[wr]---[wt]---[wr]---[wr]---[wt]---[wt]---[wr]---[wr]---[wt]---[wr]---[wt]---[wr]---[wt]---[wr]---[wt]---[wt]---[wr]---[wt]---[wr]---[wr]---[wt]---[wt]---[wr]---[wr]---[wt]---[wt]---------------
Harpsichord: (first press space 128 times, 32 s of rest) [80w]-[80w]-[79w]-[79w]-[79w]-[79w]-[80w]-[80w]-[80w]-[80w]-[79w]-[79w]-[80w]-[80w]-[79w]-[79w]-[80w]-[80w]-[79w]-[79w]-[79w]-[79w]-[80w]-[80w]-[80w]-[80w]-[79w]-[79w]-[79w]-[79w]-[80w]-[80w]-[79w]-[79w]-[80w]-[80w]-[79w]-[79w]-[80w]-[80w]-[79w]-[79w]-[80w]-[80w]-[80w]-[80w]-[79w]-[79w]-[80w]-[80w]-[79w]-[79w]-[79w]-[79w]-[80w]-[80w]-[80w]-[80w]-[79w]-[79w]-[79w]-[79w]-[80w]-[80w]-[80w]---------------
Organ: 8---5---5---8---8---5---8---5---8---5---5---8---8---5---5---8---5---8---5---8---5---8---8---5---8---5---5---8---8---5---5---8---8-5-5-9-5-9-8-5-8-5-5-9-8-5-5-9-8-5-5-9-5-9-8-5-8-5-5-9-5-9-8-5-5-9-8-5-5-9-8-5-5-9-8-5-8-5-5-9-8-5-5-9-5-9-8-5-8-5-5-9-5-9-8-5-[18]---------------
Marimba: (first press space 128 times, 32 s of rest) 0wtwrywyrywy0wtw0wtwrywy0wtwrywy0wtwrywyrywy0wtw0wtwrywyrywy0wtwrywy0wtwrywy0wtwrywy0wtw0wtwrywy0wtwrywyrywy0wtw0wtwrywyrywy0wtwt---------------
Music box: (first press space 128 times, 32 s of rest) f-f-g-h-h-g-f-d-s-s-d-f-f--dd---f-f-g-h-h-g-f-d-s-s-d-f-d--ss---d-d-f-s-d-fgf-s-d-fgf-s-s-d-o---f-f-g-h-h-g-f-d-s-s-d-f-d--ss---s---------------
```

### Twinkle Twinkle

All three verses, twice, 50 s.

```
Piano: t-t-o-o-p-p-o---i-i-u-u-y-y-t---o-o-i-i-u-u-y---o-o-i-i-u-u-y---t-t-o-o-p-p-o---i-i-u-u-y-y-t---8w0w8w0wqtet8w0wqtet8w0w7w9w8w0w8w0wqtet8w0w7w9w8w0wqtet8w0w7w9w8w0w8w0wqtet8w0wqtet8w0w7w9w8w0w[tuo]---------------
Electric piano: (first press space 96 times, 24 s of rest) [wt]---[wt]---[et]---[wt]---[et]---[wt]---[wr]---[wt]---[wt]---[et]---[wt]---[wr]---[wt]---[et]---[wt]---[wr]---[wt]---[wt]---[et]---[wt]---[et]---[wt]---[wr]---[wt]---[wt]---------------
Harpsichord: (first press space 96 times, 24 s of rest) [80w]-[80w]-[80w]-[80w]-[8qe]-[8qe]-[80w]-[80w]-[8qe]-[8qe]-[80w]-[80w]-[79w]-[79w]-[80w]-[80w]-[80w]-[80w]-[8qe]-[8qe]-[80w]-[80w]-[79w]-[79w]-[80w]-[80w]-[8qe]-[8qe]-[80w]-[80w]-[79w]-[79w]-[80w]-[80w]-[80w]-[80w]-[8qe]-[8qe]-[80w]-[80w]-[8qe]-[8qe]-[80w]-[80w]-[79w]-[79w]-[80w]-[80w]-[80w]---------------
Organ: 8---8---4---8---4---8---5---8---8---4---8---5---8---4---8---5---8---8---4---8---4---8---5---8---8-8-8-8-4-4-8-8-4-4-8-8-5-5-8-8-8-8-4-4-8-8-5-5-8-8-4-4-8-8-5-5-8-8-8-8-4-4-8-8-4-4-8-8-5-5-8-8-[18]---------------
Marimba: (first press space 96 times, 24 s of rest) u---u---i---u---i---u---y---u---u---i---u---y---u---i---u---y---u---u---i---u---i---u---y---u---u---------------
Music box: (first press space 96 times, 24 s of rest) s-s-h-h-j-j-h---g-g-f-f-d-d-s---h-h-g-g-f-f-d---h-h-g-g-f-f-d---s-s-h-h-j-j-h---g-g-f-f-d-d-s---s---------------
```

## Run it locally

```
npm install
npm start      # serves the page
npm test       # input logic in jsdom, no sound
```

Everything lives in `index.html`. `CLAUDE.md` explains the design rules for anyone, human or agent, who wants to change it.
