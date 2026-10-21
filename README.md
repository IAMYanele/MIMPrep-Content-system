# MIMPrep Content System

Content production system for MiM Prep / Thomas Dussud: Instagram covers and carousels, plus Remotion video editing.

## `.claude/skills/`: the Claude skills (start here)

Every video and cover is produced from these skills, so the output matches the approved
templates. Install them once per machine, and again after every `git pull`:

```powershell
powershell -ExecutionPolicy Bypass -File install-skills.ps1     # Windows
```
```bash
./install-skills.sh                                              # macOS / Linux / Git Bash
```

| Skill | What it does |
|---|---|
| `edit-with-thumbnail` | The coordinator. Whenever a video edit starts, it launches the cover in the background so the edit and 3 cover options arrive together. |
| `value-clipper` | Raw recording to clean clips in three levels: find the value segments (approval first), strip fillers, repeats and restarts with measured cut edges and crossfaded joins, then optionally a rearranged version next to the in-order one. |
| `zoom-session-reel` | GMAT sessions and consultation calls recorded on Zoom/Fathom to 9:16 reels: tutor on top, student below with the face hidden (mosaic and blur variants), seam captions, and Thomas's title card with the tutor's credentials. |
| `cv-review-vertical` | CV review footage to sub-1:15 clips and 9:16 split-screen verticals (reviewer on top, blurred CV scrolling below), plus the privacy and consent checks. |
| `thomas-broll-reel` | The "Talk about your background" ad style: vertical reframe per camera shot, white-pill captions, ~2s cutaways of Thomas's own b-roll. Uses the `ThomasBrollReel` Remotion comp. |
| `mim-reel-edit` | Thomas's talking-head reels: picks between the two engines below, and carries the MiM house rules (brand blue, no caption where a graphic already says the words, animations on the exact word onset, tier-table placement for the desk set-up). Worked references for the Dubai batch. |
| `business-short-form-reels` | The graphics-reel engine: tight cut, text hook, then a rotation of creator full frame / split screen / full-screen animation with every mode switch landing on a real edit cut. |
| `ranking-format` | The tier-list engine: presenter full frame, an S-F table, and a card per item that pops up and shrinks into its tier row on the verdict. |
| `thomas-reel-cover` | @thomas_d_c reel covers: real photo or frame, dark editorial grade, Helvetica Now headline. Nano Banana adds the text only. 3 options and a grid preview. |
| `mimprep-cover` | MiM Prep page covers in the MiM brand (paper and dot grid, #004AAD, Poppins headline, serif kicker, blue pill) with a UGC creator cut out of her real clip, on an approved arch, circle or high-end background photo. Faces are never altered. The creators' Drive folder links and photos are kept local, not in this public repo. |

Each skill's `SKILL.md` lists what it needs (ffmpeg, Python packages, fonts, API keys) and
the rules that came from feedback on real deliverables. Edit skills here in the repo, not
in `~/.claude/skills`.


### Where the two reel engines came from

`business-short-form-reels` and `ranking-format` are from the Creator Skill Pack, filled in
with MiM Prep's own brand profile. They are published here with the repo owner's
confirmation that the rights allow it. The HyperFrames engine they build on is not bundled:
it runs through `npx hyperframes` and is Apache 2.0
(https://github.com/heygen-com/hyperframes).

**No font files are committed anywhere in this repo.** Helvetica Now Text Medium is a
licensed Monotype font and has to be installed per machine, then copied to
`~/.claude/creator-profile/assets/fonts/` so `apply_profile.py` can hand it to each skill.
The skills' `assets/fonts/` folders are intentionally empty here.

## `plugkit/` — covers & carousels
Real photos and video frames stay untouched; Nano Banana (Gemini image API) only adds the text.

- `scripts/carousel_layout.py` — lays out a carousel from `carousel/<name>/slides.json` (3:4, Neue Haas Grotesk, white centred text, red hand-drawn circle on the cover) and writes the text guide + mask for each slide.
- `scripts/add_text.py` — sends a slide + text guide to Nano Banana, then copies back **only** the new lettering onto the original photo and checks every line against the intended text.
- `scripts/reshadow.py` — keeps Nano Banana's letters but replaces its shadow with an even one.
- `scripts/nano_banana.py`, `scripts/crop45.py`, `scripts/crop_ratio.py`, `scripts/recomposite.py` — helpers.
- `carousel/bs-like-dating/` — example carousel spec ("Applying to business school is like dating").

Setup: `pip install pillow pillow-heif opencv-python numpy google-genai rembg`, then put `GEMINI_API_KEY=...` in `plugkit/.env` (never committed).

```bash
python plugkit/scripts/carousel_layout.py plugkit/carousel/bs-like-dating
```

## `remotion/` — video editing
Remotion + Next.js workspace: compositions in `src/remotion/`, render/transcribe/B-roll scripts at the root, and the full playbook in `REMOTION_OPS_GUIDE.md` and `REMOTION_PROMPT_FRAMEWORK.md`. Media, renders and footage are not in the repo.

```bash
cd remotion && npm install && npx remotion studio
```

Keys (`PEXELS_API_KEY`, `PIXABAY_API_KEY`, Remotion AWS) go in `remotion/.env` — see `.env.example`.
