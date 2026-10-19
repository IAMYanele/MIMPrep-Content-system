---
name: thomas-broll-reel
description: Edit a Thomas / MiM Prep interview or talking-head recording into the vertical b-roll reel style built in Remotion - 4K landscape reframed to 9:16 shot by shot so every face is centred, dead air tightened, 2-word white-pill captions under the chin, and ~2-second full-screen cutaways of Thomas's own b-roll (presenting, campus, mentoring, London) over his running audio, -14 LUFS. This is the "Talk about your background" ad style. Use when someone hands over an interview/podcast/talking-head clip of Thomas and wants it cut "in this style", "with b-roll of Thomas", "like the background video", for an ad or a reel, or when re-cutting, re-framing or re-placing b-roll in a reel made this way. When the edit starts, also run the edit-with-thumbnail skill so the cover is made in parallel.
---

# Thomas b-roll reel

The reference is `F:\thomas b-roll\raw video\example video.mp4`. The approved build is
`F:\thomas-bg-edit\2 - Talk about your background - EDIT v4.mp4`. It took four rounds,
and every round's feedback is a rule below.

**Starting a new edit?** Kick off the cover first: follow `edit-with-thumbnail`,
which runs `thomas-reel-cover` in the background while you edit.

Scripts are in `scripts/` next to this file (`$SKILL`). Each video gets a job folder
on a drive with space (`F:\thomas-bg-edit\<slug>\` on Yanele's PC). Everything the
render needs ends up in `<job>/public/`.

## Setup

- ffmpeg/ffprobe on PATH (ffmpeg 9: `-vsync` is gone, use `-fps_mode`).
- Python: `pip install numpy opencv-python pillow requests faster-whisper`.
- `OPENAI_API_KEY` for fast transcription. When it's out of credits (it often is),
  `captions.py` falls back to local faster-whisper automatically. That's slower but
  just as usable.
- A Remotion project with `ThomasBrollReel` registered (`src/remotion/ThomasBroll/`)
  and `render-fast.mjs` at its root. The canonical copy is the MIMPrep-Content-system
  repo's `remotion/` folder. On Yanele's PC, render from `C:\Users\yanel\Documents\remotion`,
  which has the same comp and its node_modules installed. C: is nearly full, so never
  render against the project's whole `public/` folder. The steps below pass only the
  job's folder.

## The style (measured, don't re-derive)

- 1080x1920, 25 fps.
- **Captions:** white pill, black Inter 700 at 56px, ~-0.5 tracking, pill top y=1124
  (58.5% down), ~78px tall, radius 10, padding 8px 20px, centred. 2-word chunks, 1
  word when the pair is over ~17 characters, never across a sentence end. Each chunk
  holds until the next starts. No full stops on screen. A tiny 0.94 to 1 pop on each
  new chunk.
- **Cutaways:** full screen, ~1.8-2.5s each, his audio running underneath. About a
  third of the runtime (v4: 7 cutaways, 14.1s of 44.5s), spread across the whole
  video, not clustered.
- **Pace:** silences over 0.45s shortened to 0.18s.
- **Audio:** -14 LUFS.

## 1. Reframe shot by shot

```bash
python $SKILL/scripts/shots.py "<source.mp4>" --out <job>
```

Look at `shots_sheet.jpg`: each shot has its crop box and centre line drawn on, and
the face must sit on the line. The first build used one crop for the whole clip and
the user flagged two ranges where faces sat off-centre. The source cut between two
camera angles (interviewer and Thomas), so one crop can't fit both. Hard cuts between
angles in one room score about 0.27 on ffmpeg's scene score, and movement within a
shot scores under 0.03. If a cut is missed or invented, change `--threshold`. If a
face is wrong, edit that shot's `x0` in `shots.json`.

## 2. Build the base

```bash
python $SKILL/scripts/make_base.py --job <job> [--noise -33dB] [--trim 12.4,14.0]
```

One ffmpeg pass: the crop follows the camera, and select/aselect drop the same spans
from picture and sound. Measure the speaker's level before trusting `-33dB`: a soft
talker needs a lower threshold, or real speech gets read as silence. Use `--trim` for
bad takes and false starts (in source seconds). Cut inside pauses, never on a word
timestamp.

## 3. Captions

```bash
python $SKILL/scripts/captions.py --job <job> [--fix "Wrong=Right"]
```

Read `transcript.txt` start to finish. Fix names and schools with `--fix` (a glossary
already covers MiM, LBS, HEC, ESSEC, ESCP, LSE, GMAT, INSEAD and EHL). The script
merges the `%` token Whisper returns as an empty word, and it widens zero-length words
so none vanish from the captions.

## 4. Choose the b-roll

**Only use the footage the user names.** Here that's Thomas's own pool:
`F:\thomas b-roll` (top level) and `F:\thomas content\b-rolls`. No stock.
`F:\thomas content\b-roll stills` is a fast visual index: every still's filename is
`NNN_<clip>_<seconds>s.jpg`, so a still you like gives you the clip and a good
in-point directly.

```bash
python $SKILL/scripts/broll_sheet.py --out <job>/broll "F:/thomas b-roll" "F:/thomas content/b-rolls"
python $SKILL/scripts/broll_sheet.py --out <job>/broll --clip "<file>" --step 0.5    # pick an in-point
```

Rules from the feedback:
- **Use plenty of b-roll of Thomas himself.** "Use more b-roll of thomas from the folder
  that i gave you even if there is some university branding in there or a group of
  people. Find the ones that fit and still make sense." v1 had 4 cutaways, all in the
  back half. That was too few and too late.
- **Fit the line, don't contradict it.** The pool is business-school material
  (presenting, mentoring, EHL campus, corridors, London streets, car). Personal beats
  (family, childhood) can take shots of Thomas himself, such as at a laptop or at a
  table. Never put EHL signage over a line naming a different school (Warwick, LBS).
- **Verify every clip at its exact in-point.** Contact sheets misled the first build
  three times (shifted indices, a different presenter labelled as Thomas). The sheets
  here label inside each tile, but still look at the in-point frame before
  committing.
- Leave the first ~2s on his face for the hook, and don't cover the line where he
  names the payoff unless the cutaway shows it.

Write `<job>/cutaways.json` (times in base/output seconds):

```json
[{"clip": "F:/thomas b-roll/fx30 SW20250925_0020.MP4", "in": 4.2, "dur": 2.1, "at": 10.2,
  "cx": null, "why": "Thomas at a laptop - over 'grew up in France'"}]
```

```bash
python $SKILL/scripts/prep_cutaways.py --job <job>
```

It crops each clip to 9:16 on its subject. With `cx: null` it measures faces and
people across the whole window, not one frame. The user asked for the 0:30 campus shot
to have "the people in the middle of the screen" after it was cropped on the sign.
Check `cutaways_sheet.jpg`, the printed motion per clip, and the b-roll share.

## 5. Render, mux, verify

```bash
python $SKILL/scripts/finish.py --job <job> assemble       # writes edit.json, prints the render command
cd <remotion project> && node render-fast.mjs ThomasBrollReel --public-dir "<job>/public" \
    --props "<job>/edit.json" --stills ... --stills-out "<job>/stills" --out "<job>/render.mp4"
python $SKILL/scripts/finish.py --job <job> mux --render <job>/render.mp4 --out "<deliverable>.mp4"
```

- **One render at a time**, never in parallel (that includes a second job). Back up a
  delivered file before overwriting it, and version the names: `- EDIT v2.mp4`.
- Look at the stills first (one inside each cutaway): right clip, subject centred,
  caption pill clear of his face.
- `mux` checks clean decode, duration, -14 LUFS, and that **every cutaway moves**.
  In v2 every cutaway was frozen: `OffthreadVideo` read the composition clock, so a
  2-second clip placed at 16s was asked for its 16-second mark and held its last
  frame. The comp now wraps each cutaway in its own `Sequence`. A single still can't
  show a freeze, so motion is checked across frame pairs.
- Don't grep ffmpeg's stderr away when checking a render: a failed render once looked
  like success because the error was filtered out.

## Delivering

Say what you did in a few lines: the shots and crops, how much was tightened, the
cutaway list (time, what it shows, which line it covers), and any judgement calls (a
beat you left on his face because nothing in the pool fits it). Nothing is posted or
uploaded without an explicit ask.
