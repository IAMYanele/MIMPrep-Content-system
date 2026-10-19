---
name: value-clipper
description: Clip a raw Thomas / MiM Prep recording (CV review take, GMAT session, consultation call, podcast or interview) into clean short-form clips in three levels - (1) transcribe and find the value segments, the nuggets Thomas's audience genuinely benefits from, and list them for approval; (2) cut one approved segment down to its value by removing every filler, um, uh, repeat, restart and redundant sentence, cutting in real pauses or at the energy dip between words; (3) when it would make the clip clearer or more engaging, also build a rearranged version alongside the in-order one so the user picks. Renders at original resolution, -14 LUFS, and re-transcribes the output to prove it. Use whenever someone hands over raw or long footage and wants clips, "find the clippable parts", "clip this", "what's worth posting from this call", "cut the CV review takes", "remove the ums", or "tighten this clip". Stops at the clean clips; editing (verticals, captions, b-roll) and covers are the next skills.
---

# Value clipper

Three levels, in order. Each level is judgement first, then the scripts do the mechanical
part. Scripts are in `scripts/` next to this file (`$SKILL`). Work in a job folder next to
the footage (e.g. `F:\cv review dubao\clip-jobs\<raw name>\`), never inside the skill.

Read `references/value-test.md` (what qualifies) and `references/cutting-craft.md` (how
to cut speech so nobody hears it) before the first clip of a session.

## Setup

- ffmpeg/ffprobe on PATH (ffmpeg 9).
- `pip install numpy requests faster-whisper`
- `OPENAI_API_KEY` makes transcription fast. When it's out of credits (often), the
  scripts fall back to local faster-whisper on their own: ~0.6x realtime on this PC (a
  4-minute take took 2m40s), so run long recordings in the background.

## Before Level 1

Get: the raw file(s), what kind of recording it is (CV review, GMAT session,
consultation, podcast), who's speaking, and whether a transcript already exists
(Fathom, Zoom and Riverside export them, often with speaker names, and an existing one
saves the slowest step). Note any student whose consent you don't know.

## Level 1: find the value segments

```bash
python $SKILL/scripts/transcribe.py "<raw.mp4>" --out <job>/full
```

Read `<job>/full/transcript.md` start to finish. Over ~1 hour of material, work in
passes with a running shortlist and rank at the end. Mark every stretch that passes the
value test for this content type (`references/value-test.md`): insider insight or story,
lesson, tactical information, or a worry plus its answer, and always "would Thomas's
audience genuinely benefit?".

Present the ranked list in the format in `value-test.md`: main point, type, timestamps,
speaker, key verbatim lines, why it's valuable, privacy flags. Then the near-misses with
their weakness named. **Stop and wait for approval.** Nothing gets cut until the user
picks.

Speakers aren't labelled in a fresh transcript. Don't guess who said a line. A guest's or
student's words presented as Thomas's is a factual error about a real person.

## Level 2: strip the segment down to its value

For each approved segment:

```bash
python $SKILL/scripts/transcribe.py "<raw>" --out <job>/segA --start 5 --end 40      # verbatim, the segment on its own
python $SKILL/scripts/pauses.py "<raw>" --out <job>/segA --start 5 --end 40 --min 0.12 --words <job>/segA/words.json
python $SKILL/scripts/fillers.py --seg <job>/segA --src "<raw>"
```

**The standard: remove every um, uh, filler and redundancy.** Not only the ones that
happen to sit in a pause. On the first test, a "so make it clippable, that... make it
clickable" stumble was left in because it had no pause around it, and the user flagged
it: "that's a redundancy, and he needs to remove that... and the uhs and the ums."

Three things make that possible:
1. **Verbatim segment transcripts.** A segment pass (`--start/--end`) prompts Whisper
   with disfluent text so it writes down the "uh" and "um" it normally deletes. Short
   slices also hear stutters the full-file pass merges ("make it make it clickable").
2. **Hidden fillers.** `fillers.py` measures the sound inside every gap between words.
   Each voiced burst is transcribed on its own: an "uh" or wordless sound is listed as
   `hidden`, while a real word (Whisper's timing was off) is dropped from the list.
3. **Energy-dip cuts.** With no pause, the cut goes at the quietest 10ms between the two
   words, with a short fade. That's how an editor cuts a tight um.

Each finding comes graded **PAUSE** or **DIP** (remove it) or **HARD** (no gap at all:
drop the whole sentence instead of cutting inside a word).

Then decide, in the segment's own words:
- **Blocks:** the parts that carry the point. For CV reviews: the feedback points, never
  the read-aloud.
- **Removals:** every filler, um and uh; repeats ("make it, make it"); abandoned starts
  and the connector before them ("so make it clippable, that"); whole sentences that only
  restate another one ("And then that's clickable. The LinkedIn, but once again, you know,
  the LinkedIn, you can put the hyperlink. So just put LinkedIn..." keeps only the last
  version). Keep a soft "like" or "actually" only when it carries meaning.
- **Length:** as short as possible, as long as the point needs. There's no fixed cap, but
  every block has to earn its place. Over ~90s, cut the weakest block first.

Write the plan (`<job>/plan_in_order.json`):

```json
{"source": "F:/.../raw.mp4", "name": "CV Review 08 - Paris CV 5-10", "version": "in-order",
 "blocks": [{"from": 7.9, "to": 37.6, "note": "contact details"},
            {"from": 83.2, "to": 94.3, "note": "all experience in Paris: go abroad early"}],
 "remove": [[15.34, 19.26], [86.02, 88.43]]}
```

**Dead air** (a tutor writing on the board, someone thinking): add `"tighten": 0.4` to the
plan and every pause longer than 0.4s inside a block is cut down to 0.3s, entirely inside
the silence. Class recordings need this: the GRE class had 2-10s pauses mid-sentence.

Dry run, then read it aloud:

```bash
python $SKILL/scripts/assemble.py <job>/plan_in_order.json --pauses <job>/full --pauses <job>/segA --words <job>/full --words <job>/segA
```

Edges are handled two ways:
- **Block edges** (`from`/`to`) come off the transcript, where Whisper can place a word up
  to ~250ms early. An end edge takes the next pause, so the last word finishes; cutting
  at a dip there clipped "space" to "save" in testing. A start edge takes the last pause
  before it.
- **Removal edges** are already exact (fillers.py put them in a pause or dip), so they
  stay put.

An edge flagged "no pause or dip" needs a listen. Check what each removal takes with it:
one cut that started a pause too early also deleted "contact you".

## Level 3: rearrange, when it helps

Always deliver the **in-order** version. Then ask: would a different order make this
clearer or more engaging, while staying about the same main point?
- **Clarity:** setup before the claim, problem before the fix, verdict before the reasons.
- **Engagement:** opening on the strongest line (the score, the surprising claim, the
  student's question), then the explanation, then the payoff.

If yes, write `plan_rearranged.json` with the same blocks and removals in the new order,
and put a `"why"` on each moved block. The dry run marks the moved block `[MOVED]`. Read
the joins: no "this" pointing at something that now comes later, no line whose meaning
changes out of its original context. A rearrangement that changes what someone meant is
fabrication. If nothing would genuinely improve, say so and deliver only the in-order
cut.

Why both versions: on the first CV clips, a reordered cut built for virality was rejected
as reading like a supercut. The user now wants rearranged versions offered, but always
next to the honest in-order cut, with the moves spelled out.

## Render and verify

```bash
python $SKILL/scripts/assemble.py <job>/plan_in_order.json <same --pauses/--words> --render --out "<CLIPPED folder>/<name>.mp4"
python $SKILL/scripts/assemble.py <job>/plan_rearranged.json <same> --render --out "<CLIPPED folder>/<name> (rearranged).mp4"
```

One at a time, never in parallel. Each render is frame-accurate at original resolution,
with 20ms fades at joins, -14 LUFS, a clean-decode check, and a re-transcription of the
finished file printed for read-back. **Read that read-back.** It's what the viewer hears.
It caught the "experience" leaking into a block's start and the "outside of London"
stumble in testing. Back up any delivered clip before overwriting it.

## Sources other than a local file

- **Fathom share links**: the Fathom connector can't open other people's shares, but the
  share page is public. Its page data has the full transcript with speaker names and
  timestamps (`copyTranscriptUrl`), which is enough for Level 1 without any video. The
  video is an HLS stream at `<share url>/video.m3u8`. When `canDownload` is false, ask
  before pulling anything, then pull ONLY the approved minutes:
  `ffmpeg -ss <start> -i "<share>/video.m3u8" -t <len> -c copy seg.mp4`. Treat each
  downloaded segment as its own raw file (it starts on a keyframe, not exactly at
  `<start>`).
- Screen-share recordings (a tutor's iPad) usually show no faces, but the student's voice
  is still there. Flag it.

## Deliver

For each clip: path, length, the main point, what was removed (a line per removal type),
and for a rearranged version a short table of what moved and why. Repeat any privacy
flags. Then **stop at the clips** and offer the next step:
- CV review: the `cv-review-vertical` skill builds the 9:16 split-screen.
- Interview / podcast in Thomas's ad style: `thomas-broll-reel`.
- Anything else: a reel edit.

When an edit starts, `edit-with-thumbnail` launches the cover in parallel. Nothing is
posted, uploaded or scheduled without an explicit ask.

## Worked example (the test this skill was built on)

`CV Review -_7.mp4` (4:15 raw). Level 1 kept 4 feedback points and dropped the
education read-aloud, the projects and sports read-aloud, and a GMAT/career tangent.
Level 2 removed:
- the "for the contact, for the contact" false start,
- a repeated "If you use your email address, make it make it clickable. Make it as",
- "so make it clippable, that" (at an energy dip),
- a restated LinkedIn sentence including its "you know",
- "please try to have, like, uh",
- "Yeah, for the CV,",
- an "outside of London" slip.

v1 kept the tight stumble and the user sent it back. v2 is 43.4s, against 64.8s for the
hand-made clip of the same points. Level 3 offered a version opening on the 5.5/10
grade. Files are in `F:\cv review dubao\skill-test\out\` (v2 is current).
