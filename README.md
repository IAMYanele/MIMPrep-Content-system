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
| `value-clipper` | Raw recording to clean clips in three levels: find the value segments (approval first), strip fillers, repeats and restarts cutting only in pauses, then optionally a rearranged version next to the in-order one. |
| `cv-review-vertical` | CV review footage to sub-1:15 clips and 9:16 split-screen verticals (reviewer on top, blurred CV scrolling below), plus the privacy and consent checks. |
| `thomas-broll-reel` | The "Talk about your background" ad style: vertical reframe per camera shot, white-pill captions, ~2s cutaways of Thomas's own b-roll. Uses the `ThomasBrollReel` Remotion comp. |
| `thomas-reel-cover` | @thomas_d_c reel covers: real photo or frame, dark editorial grade, Helvetica Now headline. Nano Banana adds the text only. 3 options and a grid preview. |

Each skill's `SKILL.md` lists what it needs (ffmpeg, Python packages, fonts, API keys) and
the rules that came from feedback on real deliverables. Edit skills here in the repo, not
in `~/.claude/skills`.

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
