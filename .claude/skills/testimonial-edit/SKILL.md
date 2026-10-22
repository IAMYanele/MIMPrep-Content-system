---
name: testimonial-edit
description: Edit a multi-camera talking-head interview or testimonial (an alumni story, a guest, a student) into a polished 16:9 long form and a 9:16 short with a narrative arc. Covers checking the angles are really in sync, testing lip sync against the picture rather than against the other camera, the dialogue cut, multicam angle assignment, slow drift so the cuts stop feeling abrupt, subject-centred b-roll, burned captions and -14 LUFS delivery. Use whenever someone hands over interview or testimonial footage - "edit this testimonial", "two camera angles", "cut this interview", "make a short out of this interview", "alumni video" - or asks to fix sync, add motion or re-cut an existing interview edit. Not for CV reviews (cv-review-vertical), GMAT or consultation calls (zoom-session-reel), or Thomas's own talking-head reels (mim-reel-edit).
---

# Testimonial edit

Built from the Margaux / LBS MFA job (2026-10-22): two cameras, 105s take, delivered as a
1:43 16:9 and a 40s 9:16. **Read "Mistakes not to repeat" before touching anything.** Every
item in it is something that was actually shipped wrong on that job and had to be redone.

## Workflow

1. **Launch the cover job first.** `edit-with-thumbnail` runs it in parallel. For a guest or
   alumna on the MiM Prep page that is `mimprep-cover`, whose pipeline assumes one of the UGC
   creators - say in the brief that this person is NOT one of them and the frames come from
   this footage.
2. **Check the angles.** Bit-identical audio across the files means one mic feed and a shared
   timeline. Confirm the PICTURES line up too (see below) - matching durations prove nothing.
3. **Transcribe** with `value-clipper`'s `transcribe.py`. Its local pass is usually better than
   a supplied transcript: on this job it resolved "BS" to LBS and the supplied file had "master
   and finance" where she says master in finance.
4. **Measure lip sync before cutting** (see below). Fixing it afterwards means re-rendering.
5. **Cut the dialogue** with `value-clipper`. Read the re-transcription of the render, always.
6. **Assign angles**, one change per shift in what she is doing, and put an angle change on
   every audio cut so the join is masked.
7. **Add the drift** (see below). Hard cuts between two locked-off cameras feel abrupt because
   nothing moves.
8. **The short** needs an arc, not a highlight (see below).
9. **Deliver** at -14 LUFS, both formats, and say what was cut and what was left in.

## Lip sync: test audio against PICTURE

**The mistake:** the two angles were cross-correlated against each other, came back aligned at
0 frames, and that was reported as "cutting between angles can't throw her lips off". That test
answers a different question. If the recorder bakes an offset between audio and video, both
angles carry the same offset and the test still reads zero.

Measuring mouth motion against audio energy is too noisy to settle it either (r = 0.04 on this
footage, with the peak wandering between +280ms and +440ms depending on the window). Frame
stepping an onset is also misleading: articulation genuinely leads sound, a jaw drops before a
/g/ releases, so a 40-80ms lead looks normal at any single onset.

**What works: an A/B ladder, judged by the editor.**

```bash
# video copied bit-for-bit, so audio timing is the ONLY variable
ffmpeg -y -ss 78 -i cut.mp4 -itsoffset 0.040 -ss 78 -i cut.mp4 \
  -map 0:v -map 1:a -t 25 -vf scale=1280:720 -c:v libx264 -crf 21 -preset fast \
  -c:a aac -b:a 160k "END test audio +40ms.mp4"
```

- Positive `-itsoffset` on the audio input = audio LATER.
- Build 25s excerpts at +40 / +80 / +120ms and ask which reads right.
- **Then test the winning offset at the START too.** Same offset at both ends = a constant
  shift, apply it globally. A different offset at each end = drift, and no shift can fix it -
  resample the audio instead. "It gets worse towards the end" is the editor telling you it is
  drift; take that literally.
- On this job: +40ms at both ends, constant, applied with `-itsoffset 0.040 -c:v copy`.

Verify numerically afterwards: `silencedetect` the same speech onset before and after and check
it moved by exactly the amount intended.

## Slow drift, and the judder that comes with it

Nine hard cuts between two static angles read as abrupt. **The editor's words: "these rough,
abrupt cuts are quite disturbing... it makes it difficult to focus on the content."** Give every
segment 2-3.5% of scale drift across its whole length, alternating push-in and pull-out so no
two consecutive segments move the same way, plus a little horizontal travel on the wides. About
0.2% per second - below conscious notice, but the frame stops feeling dead.

Push IN on the beats where the viewer should lean closer (the emotional turn, the payoff).

**`zoompan` snaps the crop origin to whole pixels, which on a move this slow is judder.** It was
shipped once and only caught by measurement - stills looked like a clean push. Measure it:

```bash
ffmpeg -ss 2 -t 4 -i out.mp4 -vf "crop=400:300:100:100,scale=20:15,format=gray" -f rawvideo j.raw
# then frame-to-frame mean abs diff; EVENLY SPACED spikes = the filter snapping, not the subject
```

Spikes at a regular period (13.7 frames on this job) are the artefact. The fix is to do the move
at 2x and downscale, so the snap falls below one output pixel:

```
scale=3840:2160:flags=lanczos,zoompan=...:s=3840x2160:fps=25,scale=1920:1080:flags=lanczos
```

Measured: 8 periodic spikes -> 3 irregular ones, magnitude halved. Irregular spikes are the
subject moving and are fine. Pan values are in the supersampled space, so double them.

## The short needs an arc

**The mistake:** the first short was the tactic and its result - "I had no clue what to say, so I
talked to current students, and it got me into PIMCO". Tight, accurate, and flat. **The editor:
"there's no arc, no story, no value."**

A tactic is information. Nobody cares about it until they know who is talking and what was at
stake. Build four beats, and keep them in the speaker's own order so nothing is rearranged:

| Beat | What it does |
|---|---|
| **Who** | "I'm X, I'm a Y" - why listen to this person |
| **How I got here** | the choice or the search - gives the story somewhere to start |
| **The advice** | names the viewer's own fear, then answers it. The emotional centre |
| **What I did, and what it got me** | the tactic, and the named result |

~40s is fine for this; 20s was not enough to hold an arc. Cut the weakest phrasing inside each
beat rather than dropping a beat.

## B-roll

- **Centre the crop on the SUBJECT, not the frame.** A dead-centre 9:16 crop of a 4K frame
  clipped a seated subject clean off the right edge on this job (they sat at x~2575, the crop
  ended at 2527). Draw the crop window on a full frame and look before committing.
- Only where it amplifies the line. Her face holds the intro (who is speaking) and the payoff
  (the emotion); b-roll covers the action lines. ~4s of a 20s clip, ~6s of a 40s one.
- **Never b-roll that contradicts the story.** Clips with another school's signage were ruled
  out of an LBS story - on screen that is a factual claim about where she studied.
- **Never a person who could be mistaken for the speaker.** Two shots of a dark-haired woman
  presenting were dropped for exactly this.
- **Watch what the juxtaposition claims.** Running MiM Prep event footage under "I talked to
  current students" implies she did that through MiM Prep, which she never says. Raise it with
  the editor rather than sliding it in.
- 4K b-roll cropped to 9:16 is a DOWNSCALE and stays sharp; the speaker's 1080p crop is an
  upscale and does not. Give the speaker a gentler move (1.5%) than the b-roll (3%) so the
  difference in sharpness is not obvious at the cut.

## Cutting edges: read the re-transcription

`assemble.py` re-transcribes what it rendered. **Read it every time.** On this job it caught:

- `"alumni"` rendered as `"alum"` - the block end landed inside the word. Extend the end past
  the word; a block end that is the NEXT word's start time will clip the current one.
- `"apply"` rendered as `"plan"` - same fault, block ended on the word's start time.
- A removal whose padded edge swallowed the following word: cutting `"like"` ate the `"the"`
  after it, giving "give yourself means to reach out". Cutting `"a lot of"` took the article
  with it, giving "there is right way".
- `tighten` cutting into speech: the audio pause map and the word list disagreed by ~0.3s and it
  was eating `"I'm"`. With only one pause over 0.30s in the take, tighten saved 0.24s and was
  not worth the risk - it was dropped.

A take this clean needs one or two cuts, not ten. **Polished means no obvious stumbles, not cut
until it sounds synthetic.** Three cuts were tried and reverted on this job for making the line
worse than the filler did.

## Captions

Burned in on the 9:16; none on the 16:9 (it carries its own CC and burned text dirties a
polished frame). Helvetica Now Text Medium 88, white, no outline, soft shadow, `\pos(540,1380)`.

- Time them from the re-transcription of the RENDER, not the plan.
- **Group by phrase, never mechanically.** Automatic 4-word chunks gave "So before I had / no
  clue what I", which splits a unit. Hand-group, or break on punctuation and gaps over 0.35s.
- At 88px keep lines under ~22 characters or they overflow the 960px safe width.
- Correct the transcriber on proper nouns and anything it mishears: PIMCO, LBS, and on this job
  "Margot" -> Margaux, "fill" -> feel, "fine arts" -> finance. Never put a school name on screen
  off a single ASR reading - confirm it is said repeatedly, or ask.

## Speed

**The editor, after an hour: "I need this video to be done now."** Most of that hour was avoidable.

- **Never two-pass a review copy.** A two-pass `preset slow` encode of a 103s file ran for about
  twenty minutes; `-crf 25 -preset veryfast` did the same job in 52 seconds. Two-pass exists to
  hit a size target, which a review copy does not have.
- Get the brief right before rendering. Three full rebuilds of the short happened because the
  first had no context and the second had context but no arc. Ask what the clip is FOR.
- Render one thing at a time, and do sync and motion in the same pass rather than two.
- The 4K supersampled motion passes are genuinely slow. Budget for them and say so up front.

## Related

`value-clipper` (the dialogue cut and the scripts), `edit-with-thumbnail` (the cover, in
parallel), `mimprep-cover` / `thomas-reel-cover` (the covers themselves), `mim-reel-edit`
(Thomas's own graphics reels, a different format entirely).
