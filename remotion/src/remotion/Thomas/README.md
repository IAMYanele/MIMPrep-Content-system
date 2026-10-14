# Thomas — "The Study System"

An Iman-Gadzhi-style edit of a 61-minute raw against a 9.5-minute script
(`Study system.pdf`), built to the `iman-gadzhi-editor-brain` rules.

## How it is put together

The raw is one locked-off take of someone reading the script with retakes, so the
edit happens in three stages:

1. **Take selection** — `assemble.py` matches every script sentence against the
   transcript and keeps the *last* clean attempt before the speaker moves on. Writes
   `cuts.json` and a `report.txt` listing match confidence per line.
2. **Assembly** — `build.py cut` keeps only those windows in one ffmpeg pass
   (`select`/`aselect`, not 88 separate inputs), normalises to −16 LUFS, and
   alternates a 7% punch-in at each *real* discontinuity so the join between two
   takes reads as a second angle rather than a jump cut. Takes that were already
   contiguous in the raw keep their framing — there is no cut there to hide.
3. **Animation** — each event renders as its own short composition and is laid over
   the assembly at its timecode (`build.py final`). Rendering per event instead of
   one 9-minute timeline keeps every render small and leaves the talking head
   between events untouched.

```bash
python assemble.py          # transcript + script -> cuts.json
python build.py cut         # -> assembly.mp4
python build.py timings     # -> timings.json (where each event lands)
node render-thomas.mjs      # -> out/thomas/<event>.mp4  (bundles once, not 27 times)
python build.py final       # -> thomas-study-system.mp4
```

## The design

One bespoke canvas (`canvas.tsx`): signal red `#E3372B` on a grained off-black
field, Anton for hero words, Caveat as the editor's voice for asides, rubber stamps
for corrections, write-on motion throughout.

**Chapter device** — a rail of four index cards (`scenes/chapter.tsx`). Dealt
face-down in the intro as the open loop, one flips face-up at each transition with
the finished ones stamped behind it, all four complete in the recap. This is the
viewer's progress bar and the main mid-video retention mechanic.

**Bookend** — a sealed LBS envelope planted at ~0:06 and opened in the final scene,
with the two hundred that are still sealed behind it.

## Budget

Measured against the brain's constraints:

| | Target | This edit |
| --- | --- | --- |
| Intro events (first 60s) | 4–10 | 4 |
| Event length | 4–12s | 3–11s |
| Animated share of runtime | ≤ 35% | ~32% |

27 events. Fourteen stretches are marked explicitly as bare face in
`events.ts` (`FACE_BEATS`) — the stories, the nuance, the "I am someone who"
reframe, and the sign-off after the pitch. Those are placements too.

## Files

- `events.ts` — the cue sheet as data: id, channel, script sentence range, duration,
  the single hero word, and why the animation is there at all. Edit this to retime or
  drop an event; everything else follows.
- `canvas.tsx` — palette, type, `Field`, `Stamp`, `Hero`, `Aside`, `WriteOn`, `Base`.
- `scenes/` — one file per section.
- `timings.json` — generated; do not hand-edit.

## Known gaps

- **No music bed.** The style leans on one; no licensed track was available here, so
  the audio ships normalised and dry.
- **`ordinary-tuesday`** uses a Pexels still (credit in
  `.render-public/thomas/tuesday.credit.json`) rather than a generated image.
- The **promo block** is typographic. Swap in real MIM Prep branding if you have it.
