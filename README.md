# MIMPrep Content System

Content production system for MiM Prep / Thomas Dussud: Instagram covers and carousels, plus Remotion video editing.

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
