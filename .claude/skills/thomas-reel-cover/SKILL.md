---
name: thomas-reel-cover
description: Make the Instagram reel cover / thumbnail for a video on Thomas's own page (@thomas_d_c) - the dark "Forbes magazine" look with a real photo or video frame of Thomas, a small tracked kicker over a big Helvetica Now headline in ALL CAPS, the big word tucked behind his hair. Finds the best source image (the video's own raw footage, the b-roll stills, or Thomas's photo library), writes click-worthy hooks, mocks them on the real cover, has Nano Banana add ONLY the lettering, and delivers 3 options plus a grid preview. Use for any "thumbnail", "cover", "reel cover" or "cover image" for Thomas's page, CV review covers, or when the edit-with-thumbnail skill hands off a video. Not for the MiM Prep page (use mimprep-cover) or YouTube 16:9 thumbnails (mim-thumbnail).
---

# Thomas reel cover

The cover is the first thing a new follower sees, and Thomas judges it hard: "if there
is a thumbnail that is super ChatGPT-like, where it's not photogenic... it's a big,
big problem." Every approved cover so far is a **real** photo or frame of Thomas,
graded dark and editorial, with clean type. Read `references/style.md` once per
session: it has the approved covers, the rejected ones and why.

Scripts are in `scripts/` next to this file (`$SKILL`). Work in a job folder, never
inside the skill.

## Setup (once per machine)

- `pip install pillow pillow-heif opencv-python numpy google-genai rembg`
- ffmpeg on PATH.
- Font: Helvetica Now Text Medium (`HelveticaNowText-Medium.ttf`) installed, or set
  `COVER_FONT` to its path. It's the reel caption font. Don't substitute another font.
- `GEMINI_API_KEY` in the environment or in a `.env` (the scripts look in the job
  folder, the repo's `plugkit/.env`, and `~/plug kit/.env`). Never print the key.

Where things live on Yanele's PC (on another machine, ask):

| What | Where |
|---|---|
| Thomas's photos (HEIC, 24MP) | `F:\thomas pics\stories`, `F:\thomas pics\linkedinstories` |
| Stills pulled from b-roll | `F:\thomas content\b-roll stills` (filenames carry clip + time) |
| B-roll video | `F:\thomas b-roll`, `F:\thomas content\b-rolls` |
| CV review studio raws (1080p) | `F:\cv review dubao\INDIVIDUAL CVS UNCLIPPED` |
| Cover jobs + finals | `F:\thomas b-roll\<slug>\` with `final\` inside |
| Covers already used | `F:\thomas b-roll\covers-log.csv` |

When the team's shared photo database (Osvaldo's carousel photos on Google Drive) is
synced locally, add that folder to the photo search.

## 1. Know the video

Get the video path and what it says. **Look for an existing transcript first**: the
edit almost always has one (captions JSON, `words.json`, an `.ass` file, the CV
pipeline's `cv-work/captions/`). The user has asked "why do you need the transcript?"
and "it should already have one cached". Only transcribe if nothing exists.

Write one sentence: what does the viewer get from this video?

## 2. The hook (headline)

The headline is a reason to click, not a description of the video. Format: a small
kicker (2-6 words) over a big word or two. The big words carry the hook.

- Approved: `MAKING A GOOD CV / UNREJECTABLE`, `NEVER MAKE YOUR CV / TOO DENSE`,
  `MAKING A BAD CV / GREAT`, `THE LONDON / LOOPHOLE`.
- Rejected: `WHY A LONDON MASTERS IS AN / UNFAIR ADVANTAGE` (too long), and two
  rounds of descriptive options ("THE UK MASTERS / EDGE", "THE VISA THAT GETS YOU /
  HIRED"): "they still suck... make it a reason for people to want to click."
- Good hook shapes: a loophole or cheat code, an unfair advantage, a verdict ("TOO
  DENSE"), a transformation ("GREAT"), a pain point ("WHY LONDON BANKS / REJECT YOU").
- ALL CAPS always ("dont make them lower case"). No em or en dashes. Never invent a
  number or a result the video doesn't state.

Write 8-12 hooks, then **show them on the actual cover** with `mock_options.py`
before choosing. A list in chat was rejected because nobody could picture how the
words would fit.

## 3. Find the image: three candidates

Thomas: "We have 4K photos. We have B-rolls. Why do we edit like this?" Use real,
sharp images of him, and never retouch or regenerate his face.

The **Forbes test**, which most rejections failed ("this is not a Forbes magazine
cover photo"): tight on Thomas, he fills the frame, composed pose (arms crossed, fist
on chin, hands clasped, a confident look just off camera), mouth closed, sharp. A wide
shot with him small in a busy room fails. So does a talking frame with his mouth
mid-word, or an upscaled 1080p crop that looks soft.

Gather candidates from three places, then pick the three strongest that are all
different from each other:

1. **The video's own shoot.** Scan the RAW footage, not the edited reel (edited reels
   have burned-in captions across his chest):
   `python $SKILL/scripts/find_frames.py --out <job>/scan <raw files or folder>`.
   For CV reviews the user has twice asked for "the pic from the same studio
   environment", so one option should be a studio frame. Those raws are 1080p
   landscape, so the crop is upscaled about 1.8x: say so when you deliver.
2. **Thomas's photo library and the b-roll stills:**
   `python $SKILL/scripts/photo_sheet.py --out <job>/photos "F:/thomas pics" "F:/thomas content/b-roll stills"`.
   Full-resolution stills are the sharpest option available. Match the setting to the
   video when you can (London street for a London video, laptop for a CV video).
3. **A pasted or linked photo** from the user. Get the original file. If only a small
   copy exists, say so. Upscaling with Nano Banana is allowed **only when the user
   asks**, and then you check the face still matches.

Rules for choosing:
- Check `covers-log.csv`: don't reuse a photo or frame that's already on the grid,
  and don't put the same pose on two covers that will post side by side.
- Text never covers his face.
- CV reviews: no CV, no student name, nothing from the document in the cover.
- The face detector in the finders also catches other people. Look at the sheets;
  don't trust the ranking.

## 4. Lay it out

```bash
python $SKILL/scripts/cover_layout.py --src <photo or video> [--t 130.0] --name a \
    --kicker "THE LONDON" --big "LOOPHOLE" --mode dark --placement top --out <job>/build
```

- `--mode dark`: indoor or studio. The room is muted and pulled down, Thomas keeps
  his colour, with a soft falloff so he never looks cut out.
- `--mode street`: busy outdoor background. One grade over everything. `dark` left a
  glowing halo around him on a London street.
- `--mode light`: a bright photo stays bright with near-black ink.
- `--placement top` tucks the big word behind the top of his hair (the signature
  look). Use `bottom` when his head is near the top of the frame. The script warns
  when text leaves the profile-grid area (y 240-1680) or the source is upscaled more
  than 1.25x.
- `--head-box x,y,w,h` when he's in profile and the face detector misses him or locks
  onto a reflection (it did on the elevator photo).
- Kicker size defaults to 50px. 30px was too small to read ("make it bigger so we can
  see it"), so don't go much below that.

Open `<name>-preview.png` at full size before spending an API call.

## 5. Nano Banana adds the lettering, and nothing else

The photo must not change: no regenerated faces, no relighting, no new scenes. The
first attempt at this generated whole new scenes and one cover came out as a
different man. So Nano Banana only draws the text, and the scripts copy back just the
letters onto the untouched plate.

```bash
python $SKILL/scripts/add_text.py --base <job>/build/a-base.png --prompt-file <job>/build/a-prompt.txt \
    --ref <job>/build/a-guide.png --expect <job>/build/a-textmask.png --out <job>/build/a-nb.png
python $SKILL/scripts/shift_composite.py --dir <job>/build --name a --out "<job>/final/<Title> - cover (A).jpg"
```

Add `--ink dark` to `shift_composite.py` for `--mode light` covers. Add `--fill` when
letters crossing a bright window came out see-through.

- `add_text.py` prints a per-line check. A line below 80% usually means Nano Banana
  drew the block in the wrong place (it once drew it 102px too high).
  `shift_composite.py` finds and corrects the offset. Accept a match of 0.9 or more.
  Below that, regenerate rather than patch.
- Always look at `check_zoom.jpg`: every letter whole, spelled right, no stray marks,
  his hair in front of the big word. Clean up stray lines by restoring the original
  plate in that strip, never by repainting the photo.
- Each call costs money. Mock first, fix the layout, then generate. Use `--reuse-raw`
  to re-composite an existing output without a new call.

## 6. Deliver three options

Thomas: "give me three options. I take the best option and then you schedule it."

```bash
python $SKILL/scripts/options_sheet.py --out <job>/options.jpg <job>/final/*cover*.jpg
```

Send the sheet first. It shows each cover full size and as the profile-grid crop. Add
one line per option: the image source and the hook angle. Flag anything soft, such as
an upscaled studio frame. When the user picks, add a row to `covers-log.csv`
(date, video, option, image source + time, headline).

## 7. Posting

Never post or schedule until the user says so. Posting goes through PlugKit (it can't
unpublish, so a mistake stays live until someone deletes it in the app). Use the
caption the user gives. For CV reviews, confirm the student agreed to be posted before
publishing (see the cv-review-vertical skill's privacy section).

## Not this skill: the MiM Prep page

On 2026-10-19 Thomas asked for the MiM Prep page covers to use **MiM Prep's own colour
palette** (one blue, matched exactly), to stay distinct from his personal page while
staying aligned with the website, and never to use heavily edited faces. Don't put this
dark cream-on-black look on MiM Prep posts. MiM Prep page covers use the
**`mimprep-cover`** skill instead. On Yanele's PC the brand colours are in
`Documents\ai.agents\workflow-agents\mim-creative-studio\studio\src\brand.ts`.
