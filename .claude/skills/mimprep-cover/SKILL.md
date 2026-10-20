---
name: mimprep-cover
description: 'Make Instagram reel covers / thumbnails for the MiM Prep page (not Thomas''s personal page) in MiM Prep''s own brand - clean light paper with the dot grid, the exact MiM blue (004AAD), Poppins headline, italic serif kicker, blue pill - with one of the UGC creators (Maria, Manon, Mathilde, Charlene...) cut out of her real clip and placed on an approved composition (blue arch, blue circle, or a high-end background photo). Covers finding the girls'' clips in the shared Drive folders, picking a flattering sharp frame, a clean cutout that never alters her face, empty high-end background plates from Nano Banana, colour grading, layout and 3 options. Use for any "MiM Prep thumbnail", "MiM Prep cover", "cover for the MiM page", "thumbnail with the girls", UGC creator covers, or when edit-with-thumbnail hands off a MiM Prep video. Not for Thomas''s own page (thomas-reel-cover) or YouTube 16:9 thumbnails.'
---

# MiM Prep reel cover

MiM Prep's page is a separate brand from Thomas's page. Its covers use **MiM Prep's own
palette** (one blue, matched exactly, aligned with the website), feature the **UGC girls**
rather than Thomas, and must never show an AI-edited face. Read `references/style.md` once
per session: it has the approved covers, the rejected ones, and the team's exact words.

Scripts are in `scripts/` next to this file (`$SKILL`). Work in a job folder
(e.g. `F:\thomas b-roll\<slug>\`), never inside the skill.

## Setup (once per machine)

- `pip install pillow pillow-heif opencv-python numpy google-genai rembg pymatting`, and ffmpeg on PATH.
- Fonts: Poppins SemiBold + Medium and Georgia Pro Condensed Italic. Override the paths with
  `MIM_FONT_BOLD`, `MIM_FONT_MEDIUM`, `MIM_FONT_SERIF` if they live elsewhere.
- `GEMINI_API_KEY` in the environment or a `.env` (the scripts check the working folder and
  `~/plug kit/.env`). Never print it.
- The logo is bundled in `assets/mimprep-logo.png`.

## 1. Know the post

Get the video and its hook. **Look for an existing transcript first**: the edit almost always
has one. Write one sentence on what the viewer gets.

Headlines use the carousel structure, in sentence case (not all caps):
- A **serif italic kicker** (`The`, `The unfair advantage of a`).
- **One or two big Poppins lines** (`London / Loophole`, `Study Here. / Work Here.`).
- A **blue pill** with a short qualifier (`for international students`, `UK Masters`).

The headline must give a reason to click: a loophole, an unfair advantage, a verdict.
Never invent a number the video doesn't state, and don't use em dashes.

## 2. Find the girl and the frame

The girls' clips live in public Drive folders, one per creator (all phone video). Their folder IDs are in
`references/drive-folders.local.md`, which stays on this machine and is never committed, because the
repo is public and those links open every creator's raw footage. If that file is missing, ask Yanele
for the folder links.

```bash
python $SKILL/scripts/drive_list.py --out <job>/girls --sheet <ManonId>:Manon <MathildeId>:Mathilde <MariaId>:Maria
python $SKILL/scripts/drive_get.py <fileId> <job>/girls/raw/<name>.mov        # only the takes you picked
python $SKILL/scripts/scan_clip.py <job>/girls/raw/<name>.mov <job>/girls/scan_<name>.jpg 0.4
python $SKILL/scripts/grab_frame.py <job>/girls/raw/<name>.mov <seconds> <job>/girls/<name>.png
```

From the thumbnail sheet, prefer bright, clean, well-lit takes with a waist-up framing
(Maria's REEL 3 / REEL 5 are 4K and the sharpest). From the scan, pick a moment where her
**mouth is closed, she has a natural soft smile, her eyes are open and the frame is sharp**.
Never use a mid-word frame. Thomas's note: "she needs to look good."

The Google Drive connector can't list these folders, which is why the scripts use the
public folder view.

## 3. Cut her out (her pixels are never changed)

```bash
python $SKILL/scripts/cutout.py <job>/girls/<name>.png 0,160,1080,1920 <job>/cut/<name>.png
```

It prints the row where her arms touch the source frame's edge. Those straight cut edges
**must never show** on the cover: the team said the arms "seem as if they were cut out, and
that doesn't look good." Hide them with the layout. The `arch` layout makes the arch exactly
her width, so the cut edges become its straight sides. `behind` scales her to the full
canvas width, so the edges run off the cover. Check `<name>_check.jpg` for a clean hair edge.

Optional colour grade (the user asked for the girls "more saturated", colour only):
`python $SKILL/scripts/grade.py cut.png cut-g.png` keeps transparency.

## 4. Lay it out

```bash
python $SKILL/scripts/cover.py --layout arch   --person cut-g.png --kicker "The" --lines "London|Loophole" --pill "for international students" --out A.jpg
python $SKILL/scripts/cover.py --layout circle --person cut-g.png --width 1000 --kicker "The unfair advantage of a" --lines "Study Here.|Work Here." --pill "UK Masters" --out B.jpg
python $SKILL/scripts/cover.py --layout photo  --photo comp.png --lines "Study in London.|Get hired in London." --pill "The UK Masters advantage" --out C.jpg
```

| Layout | When to use it |
|---|---|
| `arch` (approved, Manon) | The cutout's arms touch both sides of her frame. The arch hides the cut edges. |
| `circle` (approved, Maria) | She's centred with a clean head and shoulders. Her head breaks over the circle's top. Use `--width` around 1000 for a 4K cutout. |
| `photo` (approved, Mathilde) | A full photo on a high-end background (section 5), filling the lower half under a soft fade. |
| `behind` | The last headline line tucks behind her head. She fills the full width. Liked, but the arch won. |
| `band` | A full-width blue band behind her, with a white pill. |

`--head-y` (default 760) sets where the top of her head lands. The script warns if any text
leaves the profile-grid crop (y 240-1680). Look at every cover at full size before sending.

## 5. High-end background (the `photo` layout)

The user's rule: "only cut the person out and then put them in the background." **Never
let Nano Banana re-render the girl.** A version that did ("swap the background, keep her
the same") was rejected: "it looks like you did something to the face with AI."

```bash
python $SKILL/scripts/plate.py campus <job>/plate-campus.png            # or library, office, or a custom description
python $SKILL/scripts/composite.py <job>/girls/<name>.png 0,380,1080,1460 <job>/plate-campus.png <job>/comp.png 4.5
```

`plate.py` generates an EMPTY scene (no people) in an iPhone portrait-mode look.
`composite.py` matches only the plate to her (brightness, colour, grain, depth blur) and
adds a light wrap on her hair edge. Use a blur of about 4.5 for a waist-up framing and
about 7 for a tight face. A plate that's too sharp is what makes a composite look fake.

## 6. Deliver three options

```bash
python $SKILL/scripts/sheet.py <job>/options.jpg <job>/A.jpg <job>/B.jpg <job>/C.jpg
```

Send the sheet first, then each cover. Write one line per option: which girl, which layout,
which hook. Final picks go in `<job>/final/FINAL picks/`.

## Rules that came from rejections

- No boxes or rounded photo cards around the girl: "I don't like the whole box thing."
- No AI props (graduation caps, binder clips, passports), and not too much detail:
  "classic AI-generated assets... doesn't look polished." Clean paper and dot grid only.
- The headline font is Poppins. Thomas disliked the earlier Montserrat ("not a big fan of
  the font"), and the team wanted it "a little more modern".
- Use the girls, not Thomas, on MiM Prep covers.
- Never alter a face: cutouts and plates only, and grading touches colour only.

## Posting

Never post or schedule until the user says so. The MiM Prep Instagram account is not
connected to PlugKit as of 2026-10-20 (only @thomas_d_c is), so ask how they want it posted.
