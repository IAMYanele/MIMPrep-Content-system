---
name: zoom-session-reel
description: Turn a clipped MiM Prep GMAT session, 1:1 coaching call or consultation call recorded on Zoom (usually a Fathom recording) into 9:16 Instagram reels - the tutor on top, the student below with their face hidden (a face-only mosaic AND a soft-blur variant), white captions on the seam, and Thomas's approved title card (big serif title in a white box plus the tutor's credential pill: name, school logos, GMAT score). Use whenever someone wants a GMAT-session or consultation clip made into a reel, a "split screen" of a Zoom call, "blur/mosaic the student", "add the title like Thomas's example", "add her credentials", or to redo the title, crop, captions or blur on one of these reels. The clean clips come from value-clipper first; covers come from edit-with-thumbnail.
---

# Zoom session reel

The MiM Prep format for tutoring sessions and consultation calls (approved by Thomas on
2026-10-20, built on a 1:1 GMAT session):

```
 ┌────────────────────┐
 │       TUTOR        │  1080x960, cropped from the tutor's Zoom tile
 │                    │
 ├──── caption ───────┤  white, on the seam (y=960)
 │ ┌────────────────┐ │  title card, first 9.7s: big serif title in a white box,
 │ │  How to use    │ │  box top right under the caption (y=1016)
 │ │ your GMAT mocks│ │
 │ └────────────────┘ │
 │ [Name·School·Score]│  the tutor's credential pill
 │   STUDENT (hidden) │  1080x960, face mosaicked (or blurred)
 └────────────────────┘
```

Scripts are in `scripts/` next to this file (`$SKILL`). Work in the clip's job folder.
Measurements and the feedback behind each choice: `references/style.md`.

## Rules that aren't optional

- **The student is never shown.** No authorization to display students (Thomas: "Do we
  have authorization to display them?" Answer: "No... we'll blur the student out"). Hide
  the face before anything else, check coverage is 100%, and crop the tile so their full
  name (Zoom's label) never appears.
- **The tutor's consent** to being posted isn't settled ("What about the teacher?" is
  still open). Say so when delivering. Nothing is posted or scheduled without an explicit ask.
- Deliver **both variants**, `- TITLE - mosaic` and `- TITLE - blur`. Thomas asked for the
  mosaic; the user wanted the soft blur kept as the alternative.

## Steps

**0. Clean clips first.** Raw recording or a Fathom link: run `value-clipper`. Do Level 1,
wait for approval, then cut. Use its precise path (`chunk_words.py` + `keeps.py`) because
Zoom audio drifts. Then `assemble.py --render`, which leaves `<clip>.mp4`,
`<clip>.cuts.json`, `<clip>.heard.json`, and `<plan>.expected.json` from keeps.py. Start
the cover job now (`edit-with-thumbnail`).

**1. Layout.**
```bash
python $SKILL/scripts/measure_layout.py "<clip>.mp4" --out <job>/layout.json --tutor left
```
Look at `layout.png`. The cyan box must hold the student, the yellow box the tutor, with
no name label, no green border and no other tile inside either box. The default tiles are
a Fathom recording of Zoom with the notetaker (1280x720, two people in the top row). For
anything else (two-person gallery, speaker view, a different size), read the tile rects
off a frame and pass `--tiles`.

**2. Hide the student** (both variants; the second run reuses the tracking):
```bash
python $SKILL/scripts/hide_student.py "<clip>.mp4" "<job>/hidden/<name> - mosaic.mp4" --layout <job>/layout.json --mode mosaic --boxes <job>/boxes_<k>.json
python $SKILL/scripts/hide_student.py "<clip>.mp4" "<job>/hidden/<name> - blur.mp4"   --layout <job>/layout.json --mode blur   --boxes <job>/boxes_<k>.json
```
It must report `face core covered: min 100%`. If it doesn't, or the face was found in
under ~90% of frames, look at the frames before going on.

**3. Split-screen + captions** (for each variant):
```bash
python $SKILL/scripts/split_vertical.py "<job>/hidden/<name> - mosaic.mp4" "<job>/VERTICAL/<name> 9x16 - mosaic.mp4" \
    --layout <job>/layout.json --expected <job>/plan_<k>.expected.json --heard "<clip>.heard.json"
```
The `.heard.json` belongs to the original cut. The hidden copies have the same audio and
timing, so it's still valid for them. Fix caption spelling in the chunk words'
`words_fixed.json` before keeps.py ("opponent" was "opposite", "course" was "quant").
Captions show what's said, so don't tidy the grammar ("time their self" stays).

**4. Title card.** Write the title (below), then:
```bash
python $SKILL/scripts/title_card.py --line "How to use your" --line "GMAT mock exams" --tutor <tutor> --out <job>/titles/<k>.png \
    --apply "<job>/VERTICAL/<name> 9x16 - mosaic.mp4" "<job>/VERTICAL/<name> 9x16 - TITLE - mosaic.mp4" \
    --apply "<job>/VERTICAL/<name> 9x16 - blur.mp4"   "<job>/VERTICAL/<name> 9x16 - TITLE - blur.mp4"
```
A tutor without a pill in `assets/pills/` needs `--pill-text "Name · School · Score"`
(same serif, text only). Ask the user for the credentials. Don't invent a score or a school.

**5. Check, then deliver.**
```bash
python $SKILL/scripts/check_reel.py "<job>/VERTICAL/"*"TITLE"*.mp4
```
Every reel must report OK: it decodes and has no green in the student panel. Open the
`.check.png` sheets and look: title on at 1s and 5s, fading at 9.75s, gone at 10.5s, mask
on the face. Then send both variants of each reel, with:
- the title of each and an offer to reword it,
- any fused filler you left in (e.g. "and so", "do like 10"),
- the tutor-consent note.

## Writing the title

Two lines, about 15 characters each, in Thomas's example shape: **"How to [do the thing]
your/GMAT [topic]"**. It promises exactly what the clip teaches. It isn't clickbait.
- "How to structure / your GMAT prep" (Thomas's own)
- "How to use your / GMAT mock exams"
- "How to ace GMAT / reading comp"

The box widens to fit the longer line (731px for Thomas's title). Past ~22 characters a
line it nearly fills the frame, so reword rather than shrink the font.

## Gotchas from the first run

- **Reinstall after editing scripts** (`install-skills.ps1`). The first renders ran the
  stale installed copy and none of the fixes were in them.
- **Zoom's green speaker border** sits on whoever is talking. Every crop stays 6px inside
  the tile, and hide_student masks the border before averaging.
- **One render at a time.** Back up delivered reels before re-rendering (`title-v1/`,
  `soft-blur/` folders).
- The title font isn't installed anywhere we know of. `title_card.py` uses Georgia Pro
  Condensed SemiBold narrowed to 91%, and recalibrates for whatever serif it finds. Check
  the card next to `references/title-card-reference.png`.
