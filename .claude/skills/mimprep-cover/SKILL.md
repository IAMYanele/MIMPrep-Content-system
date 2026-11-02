---
name: mimprep-cover
description: 'Make Instagram reel covers / thumbnails for the MiM Prep page (@mim_prep, not Thomas''s personal page) in its one approved template - the white or MiM-blue (004AAD) dot-grid page with the logo, a short bold Poppins headline, and the person from the video cut out of the raw footage and rising from the bottom edge. No shapes, pills or photo backgrounds. Covers finding the creators'' raw clips in the shared Drive folders, picking a frame where they smile into the lens, a clean cutout that never alters the face, edge clean-up, the approved warm colour grade (cover only, never the video), white/blue alternation on the grid, and swapping covers on scheduled PlugKit posts. Use for any "MiM Prep thumbnail", "MiM Prep cover", "cover for the MiM page", "thumbnails for these reels going up on mim prep", UGC creator covers (Maria, Manon, Mathilde, Margaux, Charlene, Alex...), or when edit-with-thumbnail hands off a MiM Prep video. Not for Thomas''s own page (thomas-reel-cover) or YouTube 16:9 thumbnails.'
---

# MiM Prep reel cover

One template, no exceptions: the **white or MiM-blue dot-grid page**, the logo, a short bold headline, and the
person cut out and rising from the bottom edge. **No shapes or graphics behind them, no pills, no photo
backgrounds.** Yanele: "it is very important that we stick to the blue background with the polka dots, or white
with the polka dots."

Read `references/style.md` once per session: it has every rule with Yanele's exact words, and
`references/approved-vs-rejected-2026-10-28_11-02.jpg` shows what passed and what didn't. Scripts are in `scripts/`
next to this file (`$SKILL`). Work in a job folder (e.g. `F:\thomas b-roll\mim-<date>\`), never inside the skill.

## Setup (once per machine)

- `pip install pillow opencv-python numpy rembg pymatting faster-whisper`, and ffmpeg on PATH.
- Fonts: Poppins SemiBold + Medium and Georgia Pro Condensed Italic (override with `MIM_FONT_BOLD`,
  `MIM_FONT_MEDIUM`, `MIM_FONT_SERIF`). The logo is bundled in `assets/mimprep-logo.png`.

## 1. Know the post and the grid

- Get each video (Frame.io: see the frameio-shell-download memory; if the share API refuses, read the HLS base
  from the browser pane) and its hook. Transcribe if there's no transcript.
- **Check the newest post on @mim_prep** (PlugKit `list_posts`). Covers alternate white and blue, so the first new
  cover is the opposite colour to it, and the rest alternate from there in posting order.
- Headline: **headline only by default**, one or two short bold lines. Two approved styles: a punchy statement
  ("Applications", "LBS", "9 free courses worth opening") or the viewer's own question ("Are IE students lazy?",
  "Is your CV getting ignored or shortlisted?"). Add the small italic top line (`--kicker`) only when the headline
  doesn't make sense alone. Never a pill, never a light-blue second line, never a number the video doesn't say.

## 2. Find the person and the frame

Whoever is in the video can be on its cover: the UGC girls, Alex or the other guys, or Thomas. Take the frame
from the **raw footage**, never the captioned edit. The girls' raw clips are in public Drive folders whose IDs are
in `references/drive-folders.local.md` (local only, never commit; ask Yanele if it's missing).

```bash
python $SKILL/scripts/drive_list.py --out <job>/girls --sheet <ManonId>:Manon <MariaId>:Maria
python $SKILL/scripts/drive_get.py <fileId> <job>/girls/raw/<name>.mov        # only the takes you picked
python $SKILL/scripts/scan_clip.py <job>/girls/raw/<name>.mov <job>/girls/scan_<name>.jpg 0.4
python $SKILL/scripts/grab_frame.py <job>/girls/raw/<name>.mov <seconds> <job>/girls/<name>.png
```

Match the take to the reel (same outfit, same room; the Drive folder names usually carry the script title).
Then pick the frame, checking at full size, in this order:
1. **Looking straight into the lens**, eyes open and relaxed (not narrowed, not glancing, head level).
2. **A soft closed smile or a genuine smile.** A neutral or serious mouth was rejected every time.
3. Sharp, mouth not mid-word, no hands in front of the body.
4. **Bright, evenly lit, plain wall behind.** Avoid frames with a bright window behind the hair: that is what
   caused every cutout problem (white through the hair, dark rim, rough edge).

Show 2 or 3 face crops side by side and pick the warmest. When nobody faces the camera and there's no raw, ask
Yanele before using the fallback: the place cut out on the same page (`sky_cut.py` for a building on a blue sky).

## 3. Cut out, clean, grade (pixels of the face are never changed)

```bash
python $SKILL/scripts/cutout.py <frame.png> 0,0,1080,1920 <job>/cut/<name>.png [--model isnet]
python $SKILL/scripts/solidify.py <frame.png> 0,0,1080,1920 <job>/cut/<name>.png <job>/cut/<name>s.png
python $SKILL/scripts/clean.py <job>/cut/<name>s.png <job>/cut/<name>c.png --blob [--erode 2] [--trim left:y:x,y:x,...]
python $SKILL/scripts/grade.py <job>/cut/<name>c.png <job>/cut/<name>g.png
```

- `--model isnet` holds dark clothes and hair better. Crop the box above gesturing hands and furniture.
- Run `solidify.py` by default: on its own, the cutout often leaves a light top, the neck or lace see-through
  (Manon's white top showed the page through it in testing). Skip it only if it pulls background objects into her
  (it did on Maria's apartment footage); then use the plain cutout and `clean.py`.
- `clean.py --blob` drops stray background bits (pillows, plants). `--erode 2` removes a dark or pale rim.
  `--trim` cuts the hair outline to a smooth curve where it is rough or shows window light between strands; get
  the y:x points from `--grid x0,y0,x1,y1`. Check both `_check_blue.jpg` and `_check_white.jpg`.
- `grade.py` is the approved warm grade with the colour boost (`--sat 1.25` default). Grade the cutout only, never
  the video. Look at the face at full size afterwards: skin should be warm and golden, not orange or blotchy.

## 4. Lay it out

```bash
python $SKILL/scripts/cover.py --layout plain    --person cut-g.png --lines "9 free courses|worth opening" --out A.jpg
python $SKILL/scripts/cover.py --layout bluepage --person cut-g.png --kicker "What actually got me into" --lines "LBS" --out B.jpg
python $SKILL/scripts/cover.py --layout behind   --person cut-g.png --kicker "Overrated or underrated?" --lines "Business|Schools" --out C.jpg
python $SKILL/scripts/cover.py --layout bluepage --person tower.png --center-bbox --head-w 100 --head-y 820 --lines "Are IE students|lazy?" --out D.jpg
```

| Layout | Page |
|---|---|
| `plain` | white page, blue text, subject under the headline |
| `bluepage` | blue page, white text, subject under the headline |
| `behind` / `bluebehind` | the last headline line tucks behind the top of the head |

- `--head-w` (default 380) is the head width; the subject is never smaller than the bottom half of the cover.
- `--head-y` moves the subject down when hair touches the headline (a descender like the "g" in "opening").
- The script warns if text leaves the profile-grid crop (y 240-1680).
- Look at every cover at full size before sending: hair edge, eyes, skin colour, text clear of the head.

## 5. Show, then schedule

```bash
python $SKILL/scripts/sheet.py <job>/covers.jpg A.jpg B.jpg C.jpg D.jpg
```

- Send the sheet in posting order, then each cover; one line each (who, page colour, headline).
- **Never upload, schedule, post or repost until Yanele says so.** File finals as
  `<job>/final2/<n> <time> <headline> (<who>, <layout>).jpg`, older versions in `v1 (replaced)/`, and write a
  `build-params.txt` with each source frame, cutout steps and cover.py arguments so any cover can be rebuilt.
- PlugKit (@mim_prep is connected): `create_media_upload` + `curl -T` to the `apiUploadUrl`, then `create_post`
  with `content: ""` (no captions on MiM) and `mediaItems[{type: video, url, thumbnail}]`. A cover change on a
  scheduled post is `update_post` with the same video and the new thumbnail. A published post can't be changed or
  deleted from PlugKit: Yanele deletes it in the Instagram app, then repost.

## Rules from rejections (details and quotes in references/style.md)

- Only the white or blue dot-grid page. No shapes, pills, photo backgrounds, blurred fades or light-blue subtitles.
- Headline only unless a top line is needed; short and bold.
- The photo: smile into the lens, from the raw, evenly lit, big in the frame, centred.
- Clean edges: no cut edges, no background in the hair, no rough outline.
- Warm, saturated grade on every cover; cover only, never the video.
- Alternate white and blue; show everything before it goes up; no captions.
