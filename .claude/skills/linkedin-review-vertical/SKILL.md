---
name: linkedin-review-vertical
description: Edit LinkedIn profile review footage (a MiM Prep reviewer going through a student's LinkedIn on camera, usually a two-camera studio session with a separate audio recorder) into 9:16 split-screen reels - reviewer on top, the profile held below, burned-in captions, -14 LUFS. Covers syncing the camera to the separate audio recorder and removing the drift, transcribing a long take without Whisper derailing, measuring cut edges off the waveform, harvesting every actionable piece of feedback across the profile sections into one clip, the held-still panel, and the privacy checks that matter more here than on a CV. Use whenever the work involves LinkedIn review footage, a profile screen recording cut under a talking head, "review my LinkedIn" clips, two-camera studio sessions that need waveform sync, or re-cutting / re-captioning a clip from this pipeline. When a new edit starts, also run the edit-with-thumbnail skill so the cover is made in parallel.
---

# LinkedIn review verticals

A reviewer goes through a student's LinkedIn on camera. The deliverable is a 9:16
reel: reviewer on top, the part of the profile being discussed held below, captions
burned in.

This is a sibling of `cv-review-vertical` and reuses its machinery for captions,
loudness and span-cutting (`norm.py`, `cut_spans.py`, `cut_ass.py`, `build_vertical.py`).
What is different, and what this skill is for:

- the source is a **two-camera studio session plus a separate audio recorder**, so it
  has to be synced and de-drifted before a single cut is made;
- the thing under the talking head is a **screen recording of a live profile**, not a
  static PDF, so the panel has to be built from held stills rather than the raw scroll;
- a profile review produces **many small actionable notes spread across sections**, and
  the clip that is worth posting collects all of them, not the single best one;
- the screen recording captures **other people's data**, which a CV never does.

Scripts are in `scripts/` next to this file (call it `$SKILL`).

```
camera A + camera B + recorder.wav
        |  sync + drift                 (wavsync.py)
        v
   base.mp4  (one angle, clean audio)
        |  transcribe, choose spans, cut on measured edges   (wordedge.py)
        v
   cut.mp4
        |  split screen + held profile stills + captions
        v
   VERTICAL/*.mp4
```

## 1. Sync before anything else

Never cut first. Every cut you make before the audio is right has to be made again.

```bash
python $SKILL/scripts/wavsync.py cameraA.wav recorder.wav
```

It reports the offset, the drift in ms per minute, and the resample ratio. Then:

```bash
# apply the ratio to the recorder, then mux it onto the camera
ffmpeg -i recorder.wav -af "atempo=1.0,aresample=async=1:first_pts=0" -ar 48000 rec_fixed.wav
ffmpeg -i cameraA.mp4 -itsoffset <offset> -i rec_fixed.wav \
       -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k base.mp4
```

Two traps, both of which cost a render here:

- **The resample ratio is `k = 1 - slope`, not `1 / (1 - slope)`.** Inverting it doubles
  the drift. It looks almost right, which is the dangerous kind of wrong. The residual
  after a correct fit should be within a few ms across the whole take; if it grew, you
  inverted it.
- **A cross-correlation must only score full overlaps.** A partial overlap sums fewer
  samples, so a loud fragment can win at the wrong lag. `wavsync.lag()` returns `None`
  rather than guess. Verify with probes spread across the take, not one at the clapper:
  one probe cannot tell an offset from a drift.

Render the synced base **before** cutting, so every later cut inherits the sync.

## 2. Transcribe without letting Whisper derail

A long take fed to Whisper whole will pick its language from whatever is at the top of
the file. A session that opened with half a minute of crew chatter was detected as
French and came back as 752 repetitions of a subtitling credit and ellipses - for a
61-minute file, with no error.

So: **force the language and chunk the audio.** Ten-minute pieces at 64 kbps mono is
plenty, and the same session then transcribed to ~5,000 real words.

```bash
ffmpeg -i base.mp4 -vn -ac 1 -ar 16000 -b:a 64k -f segment -segment_time 600 chunk%02d.mp3
# then transcribe each chunk with language="en" and add the chunk offset to every timestamp
```

Sanity-check the result before using it: a transcript whose unique-word count is a tiny
fraction of its word count has derailed.

## 3. Find every actionable note, not the best one

The clip worth posting is the one a viewer can act on. Go through the take and collect
**every** concrete, actionable item, across all the sections the reviewer covers -
headline, about, each role under experience, education, skills, languages - then build
the clip from those. A clip built around one good point looks thin next to the same
session's worth of advice.

Use `value-clipper` to find and tighten the segments; this skill's job is to make sure
the harvest is complete before the cutting starts.

## 4. Cut on measured edges, in pauses

Whisper word times are not cut points. In a long take many words come back with an
identical start and end.

```bash
python $SKILL/scripts/wordedge.py base.wav 12.40 12.90        # refine a word
python $SKILL/scripts/wordedge.py base.wav 10 40 --pauses     # safe cut points
```

`wordedge` measures at 1 ms on the full band **and** on everything above 4 kHz, and
holds the word open while either is live. A word ending in a fricative (s, f, th, sh)
has almost no broadband energy - on a floor with normal low-frequency room rumble a
trailing "s" measured only 2.6 dB above it - so a broadband-only edge lands in the
wrong place. It can clip the word early, or, when rumble lifts the floor estimate, run
past the end of the word entirely; measured on a synthetic case the overrun was 115 ms.
The high band isolates the fricative and gives the true edge either way. The 120 ms pad
bounds how far an edge can travel, so a bad floor estimate cannot run away.

Cut **in a pause**, not on a word boundary: take the middle of a span from `--pauses`.
Cutting on a word start shaves the consonant; pad 0.3 s if you must cut near one.

## 5. Build the vertical

Reviewer on top, profile below. Geometry and the held-still rule are in
`references/panel-geometry.md` - read it before placing anything, because the panel
does **not** show what a full-screen frame of the capture shows, and a section map
built from the wrong frames puts the wrong part of the profile under the wrong words.

The short version:

- **Hold a still per block, don't follow the scroll.** The capture scrolls continuously;
  once the talk is cut, a panel that follows the raw scroll shows a section the reviewer
  is no longer talking about. Pick one frame per block and hold it.
- The panel **scales the capture to 1080 wide and then crops the centre rows**, so plan
  the holds from panel-sized frames, never from the full capture.

Captions and loudness: use `cv-review-vertical`'s `captrans.py` and `norm.py`. Target
-14 LUFS.

## 6. Deliver with square pixels

`scale=1080:-2` on a source whose height does not divide cleanly writes a non-square
pixel aspect (a real case came out 2240:2241), and the file then opens distorted in
Premiere. Put `setsar=1` in the filter chain, or fix a finished file without
re-encoding:

```bash
ffmpeg -i in.mp4 -c copy -aspect 1080:1920 out.mp4
```

The `h264_metadata` bitstream filter does **not** fix this: MP4's container `pasp` box
overrides the bitstream, so the player keeps using the old ratio.

Other things that bite on this machine:

- ffmpeg 9 removed `-vsync`; use `-fps_mode`.
- **Renders run one at a time.** Back up a delivered clip before re-rendering over it.
- Check a "finished" file really finished. A render killed partway leaves an `mdat`
  with no `moov` and the file looks plausible in a listing. `ffmpeg -v error -i f -f null -`
  on every deliverable.

## Privacy - stricter here than on a CV

A screen recording of a live profile captures far more than the profile. Real sessions
here have included, on screen and in frame: an internal sales chat with real phone
numbers, a messaging list holding other students' profile URLs, and a personal
university email address.

- **One person's consent covers that person.** It does not cover anybody else whose
  name, photo, message or contact details are on that screen, and it does not cover the
  reviewer's own inbox or chat windows.
- Before anything is cut, scrub the capture for windows, tabs, notifications and
  sidebars that are not the profile. Blur or exclude them.
- Check the **first and last frame of every hold**, not just the middle - a notification
  slides in, and a scroll reveals the next person's name at the edge.
- Covers never show the profile, the student's name, or anything from the screen.
- Nothing is posted or scheduled until the person has agreed, and that agreement is for
  this clip.

If in doubt, leave it out and say so: a re-cut is cheap next to publishing somebody
else's contact details.
