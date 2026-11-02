---
name: solid-card-reel
description: The solid-card reel style (the Hormozi "purple card" format, re-skinned to MiM Prep blue #004AAD) - a talking head that cuts back and forth to full-screen flat brand-colour cards where photoreal cut-out objects, white ALL-CAPS Poppins labels, italic sub-labels and hand-drawn white arrows build up one part at a time on the words, with 2-3 word Poppins captions and black-italic title pills ("#1: THE WORKLOAD"). Does the whole job from a raw multi-camera or single-camera clip - transcript, tight cut, per-angle 9:16 crops, card plan on the cut's joins, GPT Image 2 object assets (always with reference frames attached), the HyperFrames build, render, -14 LUFS, phone copy. Use whenever someone says "Hormozi style", "purple card style", "solid card", "the style of this Instagram reel" for a reel with flat colour cards and objects, "edit these in the card style", or hands over a talking-head clip and that reference. Also for remaking the cards of an existing reel in this style, or generating the card objects alone.
---

# Solid-card reel

Reference: Hormozi reel `instagram.com/reel/DUle-S3kun3` (1.85M views). About half the runtime is the creator full
frame, half is full-screen flat cards. Built for Margaux's three LBS MFA reels (2026-10-29).

**Built on** the `business-short-form-reels` engine (`reel_engine.py`, `kit.py`: cut-aligned mode windows, focus-pull
entrances, captions, HyperFrames render) plus this skill's `scripts/hz.py`, which re-skins it. The card ART follows the
Ultimate Editors design-layer method: read `references/composition-brief.md` before designing a single card.

On Thomas / MiM Prep work, start the cover job first (`edit-with-thumbnail`; MiM Prep page posts use `mimprep-cover`).

## The look (non-negotiable unless the creator changes it)

- **Two modes only**: creator full screen <-> full-screen card. No split screen, no glass, no glow, no grain, no orbs.
- **Card colour = the brand's signature colour.** MiM Prep = `#004AAD`. Never ship the reference creator's purple
  (Yanele, 2026-10-29: "dont make the colour purple make it mim preps signature blue colour").
- **Hero pictures are FLAT real photos cut out on the card colour** (`scripts/gen_asset.py --gemini --style flat`, Nano Banana + reference frames): straight-on, plain daylight, never glossy 3D product shots.
  **Never emoji or clip-art** (Yanele, 2026-10-29: the emoji version looked "very cheap"). Flat drawn badges only where
  a photo can't carry the idea: flags, tick/cross badges, white wordmark chips for company names, the white avatar.
- Type: Poppins throughout. Labels ExtraBold caps; sub-labels Medium italic; lists Medium with a bold key word.
- Captions: 2-4 words, Poppins Medium 60 px white, key words `<b>`/`<i>`. On the creator at y 1150 with a soft shadow;
  on cards at y 1330 under the graphic, no shadow.
- Title pills on the creator: Poppins Black Italic caps, white on a brand-blue box, chest height (top ~950), one line.
- Opening hook on frame 1: Poppins Black Italic caps, black on white boxes, two lines, chest height (top ~900).
- Card graphics are drawn at FULL size in frame coordinates (`hz.py` turns off the engine's 84% shrink), centred,
  inside y 380-1150 and x 65-1015.

## Workflow

`E=~/.claude/skills/business-short-form-reels` · `S=~/.claude/skills/solid-card-reel/scripts` · work dir `W` · project `P`

1. **Transcribe**: `ffmpeg -i raw -vn -ac 1 -ar 48000 $W/a48.wav`, 16 kHz copy, `python3 $E/scripts/01_transcribe.py $W`,
   `01b_el_to_tx.py $W`. Always start from a NEW, empty work dir: `01_transcribe` reuses any `a16.flac` it finds.
2. **Cut** (`02_cut.py $W --fps <SOURCE fps>`): pass the source frame rate (25/1 for most podcast cameras). The default
   23.976 places video by frame number and audio by seconds, so a 25 fps source drifts out of sync.
   Then `02b_guard_words.py`, `03_verify_cut.py`. Check every flub range against the energy map before trusting it:
   whisper doubles words ("because Because") and drops them; cut fillers only at real dips (>= 10 dB), else leave them.
   Protect a final word that runs into the end of the file (`protect.json`) and merge any split it still makes.
3. **Render the cut** (`04_render_cut.py`), then `python3 $S/angle_crops.py "<CUT 16x9>" "<out>/hf-media"`: finds every
   camera-angle change, centres a 9:16 crop on the MOST CONFIDENT face per angle (the largest box can be a plant), and
   writes `cam_full.mp4` plus an audio-only `cam_top.mp4`. `05b_cut_words.py $W` for the cut's words.
4. **Plan**: `python3 $S/plan_joins.py <raw> $W` lists joins, angle changes and the same-angle JUMPS. Every jump is a
   mode switch or sits under a card; angle changes may stay inside a creator block; never return to the creator just
   before an angle change. Then choose cards: about 50-60% of the runtime, 2-7 s each, one idea per card.
4b. **Animation-brain pass** (Ultimate Editors `short-form-animation-brain` + `animation-psychology`; read its
   `references/animation-methodology.md` and `content-psychology.md` first). Mark each moment's emotional beat (hook / pain /
   problem / reframe / stakes / money line / section), ask its five questions, and cut every card that fails "would removing
   it hurt?" - an uncovered same-angle jump then gets `H.punch(...)` instead of a card. Pick a brain type per card and never
   the same type twice in a row: card list, vertical slider (`H.slider`), crowd (`H.crowd`), comparison (stacked, never side
   by side), concept, money line (`H.money`, one per video, under 12 words, one word in a `<u>` block), credibility lower third
   (`H.lower_third`), section markers (the pills). Portrait stacks vertically: no three-across rows. Write the design canvas
   (time | beat | type | content | emotional job) and send a labelled mockup board (`scripts/board.py` over the snapshots)
   for approval BEFORE rendering. Density: the brain says 4-6 animations per 60-90 s; this style runs denser (7-9 cards),
   because the cards also hide the cut's jumps - say so when you send the board.
5. **Objects**: list one object per card idea (composition brief, section 2) and run `gen_asset.py`. QC every PNG on blue
   (section 4) before building. About 90 s per object; run 4 in parallel.
6. **Build**: copy the engine (`reel_engine.py`, `kit.py`, `mix.py`, `assets/brand.css`, `assets/fonts`) and `hz.py` +
   `fonts/` into `P`, then write `build.py` (worked examples: `references/examples/*.py`). Pattern:
   `H.setup_project(...)` -> `H.captions(...)` -> `E.init(...)` -> `H.style()` -> overlays (`H.hook`, `H.pill`) ->
   one `K.raw(...)` scene per card built from `H.img / label / text / lines / arrow / person / flag / chip / tick`, a
   `blank(...)` scene under every creator block so scenes tile the timeline -> `K.flush(); E.build()`.
   Motion follows the brain: every element springs in AT its word (`H.brain_js(H.spring(ids, word_times))`: stiffness 220,
   damping 18, 0.1 s lead), and `H.hard_cuts(ROOT)` after `E.build()` strips the engine's whole-card blur-in and fade-out
   (no fades, the cut is the transition). Rebuild a build.py around a new card set with `scripts/splice.py`.
   `npx hyperframes lint`, then `npx hyperframes snapshot --at <every card's fullest moment>` and read every tile.
7. **Render one at a time**: `npx hyperframes render -o <out> --fps 24000/1001 --quality looks --workers 1`, then
   `python3 $S/loudnorm.py <raw render> <final>` (-14 LUFS, -1 dBTP, video copied). Check the frames either side of a
   few switches. Phone copy: two-pass x264 at ~23 MB for `SendUserFile`.

## Gotchas (all hit on the first job)

- **Render temp space.** HyperFrames refuses to start with under 1 GB free on the TEMP drive, and its frame cache
  symlinks into the render folder, which FAT32/exFAT can't do (`EISDIR ... symlink`, after minutes of extraction).
  With C: nearly full, render with `TEMP`/`TMP` on a drive with space and `--frames-cache-dir off` (no cache, so no
  symlink): slower on a USB drive, but it works. On Yanele's PC only C: is NTFS, D: is read-only, F:/G: are FAT32.
- On Windows `subprocess` can't find `npx` by name: the engine's `stt.py` now resolves `npx.cmd`, and falls back to
  faster-whisper (with a filler-keeping prompt) when HyperFrames has no local whisper model.
- `font_family_without_font_face` lint: every font, emoji included, needs an `@font-face` (hz.py declares them).
- A `tl.set` at time 0 doesn't render on frame 0: `H.style()` forces the creator camera on for a reel that opens on her.
- Caption display fixes go in `show=` (ASR spellings, names, British spelling); match on the heard word.
- Never cut a word that whisper reports twice without checking the audio: in Margaux 3, "because Because" was one word.

## Files

`scripts/hz.py` (the look + helpers) · `scripts/gen_asset.py` (objects) · `scripts/angle_crops.py` · `scripts/plan_joins.py` ·
`scripts/loudnorm.py` · `scripts/fonts/` (Poppins, OFL) · `references/composition-brief.md` · `references/refs/` (the 3
reference card frames every object generation attaches; local only, not in git) · `references/examples/` (Margaux 1-3 builds).
