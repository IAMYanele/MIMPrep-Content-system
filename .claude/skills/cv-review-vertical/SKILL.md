---
name: cv-review-vertical
description: Edit CV-review footage (Thomas, Margot, Manuel or any MiM Prep reviewer critiquing a student's CV on camera) into sub-1:15 shorts and 9:16 split-screen verticals - reviewer on top, the student's CV scrolling below with personal data blurred, burned-in captions, -14 LUFS. Covers clipping the long take, compositing the vertical, blurring, captions, loudness and the privacy/consent checks before anything is posted. Use whenever the work involves CV review clips, "cv review" footage, the CLIPPED or VERTICAL folders, split-screen talking-head-over-document edits, blurring a CV on screen, or re-cutting / re-captioning / re-cropping a clip from this pipeline, even if the request only names one small piece like "fix the captions on CV 09" or "blur the references on that one". When a new CV review edit starts, also run the edit-with-thumbnail skill so the cover is made in parallel.
---

# CV review verticals

Two stages, and they are separate jobs. Stage 1 cuts a 20-40 minute take down to
sub-1:15 shorts. Stage 2 rebuilds each short as a 9:16 split-screen. Most mistakes
come from blurring the line between them, above all building the vertical from the
*raw* footage instead of the cut, which silently desynchronises every caption.

**Starting a new edit?** Kick off the cover first: follow the `edit-with-thumbnail`
skill, which runs `thomas-reel-cover` in the background while you edit. Covers for CV
reviews never show the CV or the student's name.

Scripts are in `scripts/` next to this file (call it `$SKILL`). They write
intermediates to `./cv-work` in the folder you run them from; set `CVWORK` to put
that scratch elsewhere. `references/` has the detail that would bloat this file.

```
long take  --stage 1-->  CLIPPED/*.mp4 (16:9, ≤1:15)  --stage 2-->  VERTICAL/*.mp4 (9:16)
```

Both folders are deliverables. A change asked for in one format is not automatically
wanted in the other: ask, or do the named one and say what you left.

On Yanele's PC the current batch lives in `F:\cv review dubao\` (raw takes in
`INDIVIDUAL CVS UNCLIPPED`, then `CLIPPED`, then `VERTICAL`). On another machine, ask
where the footage is.

## Running it

```bash
export SKILL=<this skill's folder>
export CVWORK=/path/for/intermediates          # optional, defaults to ./cv-work
python $SKILL/scripts/captrans.py <clip-n> <cut.mp4>    # transcribe a finished cut
python $SKILL/scripts/norm.py "<CLIPPED folder>"         # loudness; --dry-run to preview
python $SKILL/scripts/pauses.py <audio> <a> <b> [mindur] # safe cut points in a window
python $SKILL/scripts/cut_ass.py in.ass out.ass 12.4,13.1 20,21.5   # re-time an ASS around cuts
python $SKILL/scripts/lamps.py <reference.png> <source.png>  # solve a crop rect
```

To remove spans from a finished cut and keep the captions exact (no API call), use
`cut_spans.apply(clip, src, dst, [(a, b), ...])` from Python with
`PYTHONPATH=$SKILL/scripts`. It cuts the video and remaps the word-level transcript.

`run_all.py` (the batch driver) and `cvimg.py` (the CV blur) hold per-batch settings:
the clip map, `IN`/`OUT` folders, `TRIMMED`, `SCROLL_END`, `NO_BAND`, `EXTRA`. Copy
them into the job folder, edit the copies, and run them with
`PYTHONPATH=$SKILL/scripts` so they still find `build_vertical.py` and `cvpaths.py`.
Never edit the installed copies for one batch.

`cvimg.py` reads each CV from `$CVWORK/cvs/clip<N>.pdf` and the student's details
(name, emails, phone, address, LinkedIn, from the submission sheet) from
`$CVWORK/sheet/clipmap.json`. Those details are what it searches for and blurs.

Every script is safe to import: nothing runs at import time, so reading a constant
can't start a re-encode. Keep it that way if you add one. An unguarded driver here once
silently re-encoded three delivered clips.

---

## Stage 1: clipping the long take

**The clip is feedback, not the CV read aloud.** Thomas (or the reviewer) often reads
the CV out before commenting. That part goes. A CV 08 cut was rejected as "a
regurgitation of the CV" because half of it was him reading "BBA, Yonsei University,
Top 3% Dean's List". Keep only what's wrong with the CV, why, and how to fix it, plus
the score.

**Keep source order.** Points appear in the order they were said. Reordering for a
better arc was rejected outright. Pick the 3-4 main points, keep them in sequence,
drop everything between.

**Only CV feedback.** Career advice, market talk and anecdotes go, even when they're
good. The clip is about the document.

**Under 1:15.** Cut whole beats to get there, never shave syllables.

**Cut on silence, never on a word timestamp.** The single highest-value rule here.
Whisper word times drift ±100ms, a "word" can span seconds, and cutting at one clips
the opening consonant, which can invert meaning (`don't do a summary` became `do a
summary`). Build a silence map and cut at each pause's **midpoint**:

```bash
ffmpeg -hide_banner -i in.mp4 -af "silencedetect=noise=-33dB:d=0.25" -f null -
```

Snapping to pauses also halves the window count, which is what actually fixes "the
whole video feels choppy".

**Calibrate the threshold first.** `-33dB` suits a normally levelled speaker. On a soft
talker (≈-36 LUFS) `-30dB` sat above his quiet passages and called 3.2s of real speech
silence. Measure, then set `noise` about 10-12dB under the speech peaks. Real silence
reads -60 to -83dB mean; soft speech still modulates across 0.25s slices.
`pauses.py` and `speech.py` wrap this.

**Watch the picture, not just the waveform.** Sample frames. A segment where the
reviewer looks away from camera (often right after an off-camera interruption) goes,
even with clean audio. A false start hides from Whisper as one long "word": more
speech bursts than words in a span means a repeat it merged.

**When removing a span from a finished cut**, drop a caption word only when most of
it lies inside the cut. A rule that dropped any word merely touching the cut edge
silently deleted "Final", "better" and "this" from CV 12.

---

## Stage 2: the vertical composite

Canvas 1080x1920: a 640px talking-head panel on top, a 1280px CV window below.
`run_all.py` drives it; `build_vertical.py` composites.

**Feed it the edited cut** from `CLIPPED/`, never the original take.

**Caption from the finished audio.** Transcribe the *cut* clip (`captrans.py`,
whisper-1 with word timestamps) so times are already in output time. When a clip is
trimmed further, re-transcribe the trimmed file. If the OpenAI key is out of credits,
map words from the cached source transcript through the cut windows (exact), and only
fall back to `resplit_ass.py` re-timing (approximate) as a last resort.

**Zero-length words.** Whisper sometimes emits a word with zero duration ("quantify"
at 46.20-46.20). The overlap clamp turned those into negative-length lines and they
vanished: 17 words across 10 clips before anyone noticed. `build_vertical.py` now
widens them by borrowing time from neighbours (`widen_degenerate`). After any caption
change, diff the caption words against the transcript words and confirm none are
missing.

**Stale word-fix rules.** `capfix.py` rules written for one round's audio can hide
words after a re-cut (a leftover rule rewrote "space once again" to "space" while he
clearly says it). If a caption disagrees with the audio, check capfix before anything
else.

### Framing the top panel

The crop is solved from landmarks, not guessed. In Thomas's studio three lamp bars
on the back wall are fixed points: find them in a reference frame and the source and
the spacing ratio gives the scale (`lamps.py`, `references/crop-geometry.md`).
Current values in `build_vertical.py`:

```
crop 1292x766 at (383, 114)  ->  scale to 1080x640     # a 1.485x zoom
```

**New reviewer or new room = re-solve.** The rect above is for Thomas's studio
(bars at x=376/506/643 in every clip so far). Margot, Manuel, Ali or a different setup
need their own landmarks and crop, checked on frames before rendering.

### Captions

```
Helvetica Now Text Medium, 88, white, no outline, soft shadow, baseline y=556
max 2 words and 11 characters per line
```

The size is right as is: both land on a 31px x-height. When captions "look too big"
the cause is usually **line length**. Measure before resizing. Lines break at sentence
ends (align the punctuated text to the word list), and each line's end is clamped to
the next line's start minus 0.01s, or libass paints two lines on top of each other.
Word fixes (uni/committee/cohort, names, `%` as an empty token, split decimals like
"6 / 5" for 6.5, "out of 10") are in `references/captions.md` and `capfix.py`.

### Blurring the CV

Non-negotiable: name, email, phone, LinkedIn/socials, home address, references
block. `cvimg.py` renders the PDF tall and pixelates them. Two modes:

- **header band** (default): blur everything above the first real section heading
  (EDUCATION / EXPERIENCE / PROFILE...), catching the whole contact block.
- **targeted** (`NO_BAND`): only the found items, for when the band hides too much.

Watch the padding: text rects sit ~12px above the glyphs, so boxes need padding, but
cap it (~26px). An uncapped `h * 0.85` blurred half a page once.

The references rule blanks from the match to the page bottom, so it must match the
**whole word** and never fire in the top half of a page. A substring hit on "with over
80% of p**referen**ces" blurred 77% of CV 13. After any blur, look at the full PNG.

---

## Privacy and consent (read before every batch)

CV Review 03 was taken down on 2026-10-16 at the CV owner's request. Only the name had
been blurred in that edit; the school, GPA, named employers and dates stayed readable,
which was enough for people who know the student to recognise them. Thomas's standing
instruction: whoever edits a CV review checks the owner's privacy properly.

For each CV, before rendering:
1. **Know the consent level.** Many students send their CV and agree to "blur my name
   and use it". Some have agreed to nothing. Ask if you don't know. Never guess.
2. **Name-only consent:** the default header band plus the contact fields.
3. **No clear consent, or the student asked for more:** also blur the identifying
   specifics (school names, employer names, exact GPA, dates), or don't post it.
4. Never try to recover a blurred name or identify a student from the footage, even
   when asked who a CV belonged to. Point to the intake records instead.
5. Covers never show the CV, the student's name or anything from the document.

Nothing is posted without an explicit "post it". PlugKit cannot unpublish Instagram
posts, so a mistake goes live and stays live until someone deletes it in the app.

---

## Audio level

Both formats get `loudnorm=I=-14:TP=-1.5:LRA=11`, two-pass. For a while the verticals
were at -14.5 LUFS while every 16:9 clip sat at -36 because normalisation only lived in
the vertical build. `norm.py` normalises with `-c:v copy` in seconds. Check both formats
whenever you touch either.

## Verifying before you send

- Every output must probe a duration and decode clean (`ffmpeg -v error -i f -f null -`).
  A killed render leaves a file with no moov atom.
- **Never render in parallel.** One at a time. Back up anything already delivered
  before overwriting it.
- Don't filter ffmpeg's stderr when checking a render; an early failure was invisible
  because the error was grepped away.
- Confirm the specific thing asked for. "Stop the scroll at 0:23" means comparing frames
  at 0:23 and the end and proving they're identical.
- Read the clip's final transcript top to bottom: it should sound like feedback, in
  source order, with no read-aloud CV and no dangling "because".

## Gotchas that cost real time

- **ffmpeg 9 removed `-vsync`.** Use `-fps_mode cfr`.
- **`silencedetect` and `volumedetect` log at INFO.** Under `-v error` they print
  nothing. Use `-hide_banner`, and never conclude "no pauses" from empty output.
- **Check the file you're about to report on.** A "typo" already fixed in the delivered
  copy wasted a round trip.
- Transcription needs OpenAI credits. Cached source transcripts usually exist; look
  before re-transcribing.

## Reference files

- `references/crop-geometry.md`: solving a crop rect from landmarks
- `references/cv-blurring.md`: blur targets, keywords, padding
- `references/captions.md`: style, chunking, sentence alignment, word fixes
