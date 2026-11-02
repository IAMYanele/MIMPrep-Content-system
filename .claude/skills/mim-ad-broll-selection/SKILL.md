---
name: mim-ad-broll-selection
description: Choose the b-roll for a Thomas / MiM Prep ad or reel - which clips go over which words, how the runs are built and timed, where to crop, and which shots to reject. The target look is the approved Dubai bachelor ads (about 40% b-roll in chained runs, one full-screen clip at a time, a white flash on each hand-off, mostly Thomas teaching). Use whenever b-roll is being picked or re-picked for a talking-head edit (the thomas-broll-reel pipeline, an ad from the shoot list, a reel), when b-roll has been rejected as "not on point", "poor selection", thin, repetitive or unfocused, or when deciding what to pull down from the Frame.io library. Every rule here came from Yanele rejecting a cut, so follow them before a render rather than after.
---

# Choosing the b-roll for a MiM Prep ad

The edit pipeline is `thomas-broll-reel`. This skill is the layer above it: **what** goes in
the cutaway slots. Three rounds of rejected cuts on the October 2026 Master ad pack produced
the first rules here. Then on 2026-10-26 the user turned down the whole approach for the
London Master ads. Three sparse cutaways per ad read thin. The user's verdict was "Don't do it
to my constraints, just do b-roll like ... those ads". "Those ads" are the approved Dubai bachelor
ads. **Copy them.** The section below says what they do. The rest of the skill is how to pick
and frame the clips that fill them.

## The target: the approved Dubai ads

The references are the "Thomas Bachelor Ads Dubai" on Frame.io (`f.io/SPt6FY0h`, `4TIss9o1`,
`MjH0aX9X`, `nibToiUP`), saved locally at `G:\mim-master-urgency-2026-10\reference-dubai-approved`
(`AD-A` to `AD-D`). Watch one before planning an ad. Measured from them:

- **About 35–40% of the runtime is b-roll**, in about **four runs of 2.5–3.5 s**. The hook
  and the CTA stay on his face.
- **A run can chain two clips** of about 1.3–1.6 s each. That gives a run its variety. A
  lone clip under 2 s still reads as flicker, but two chained clips read as one beat.
- **One b-roll on screen at a time, always full-screen 9:16.** The Dubai refs use 2-up and
  3-up split-screen stacks. The user doesn't want them: "there needs to only be one B-roll
  showing up at a time" (2026-10-26).
- **A white flash on every hand-off**, lasting 3 frames. It goes between the clips of a run
  and where the run hands back to his face.
- **Mostly Thomas teaching**: presenting in front of a slide, mentoring a student, on a video
  call. When the line names a place, show that place.
- **Reusing clips across the ads in a set is fine.** The references share clips.

## The one question

> What is the sentence about? Put **that** on screen.

Not the presenter, not the mood, not the nicest-looking clip to hand. If he says "the
students who apply in the next round", the picture is students. If he says "each student
gets real attention from a mentor", it is a one-to-one across a table. If he says "every
round that passes means fewer seats", it is a room with seats filling up.

**Thomas teaching is the backbone, Thomas living is not.** The reference ads are mostly
Thomas presenting in front of a MiM slide, mentoring a student, or on a call. That shows the
service the ad is selling. What gets rejected is lifestyle Thomas: walking down a street,
in a car, on his phone, or idling at his own laptop. That says nothing about the applicant's
problem:

> "if they're talking about students and committees and things you can do, why do we have
> b-roll of Thomas"

So when the line is about the applicant, show Thomas *working on the applicant's problem*, or
show the applicant. Thomas on his own fits best when the line is about him or the business,
as in "we take 30 students per round" or "I've seen this for years". The best match is a slide
that says what he is saying. The "Limited Seats in the Cohort" slide over "we only take 30
per round" is the model.

## What these ads need

The theme is **getting admissions**. The vocabulary of pictures is:

- Thomas presenting in front of a MiM slide, ideally one whose title matches the line
- Thomas mentoring: across a table, leaning over a student's laptop, or on a video call
- students round a table in a room, laptops open, talking
- an office or seminar setup: a long table, a presentation screen, a boardroom
- one person working at a laptop
- a one-to-one conversation across a table
- a campus or lobby, people in business dress

Not: travel, cars, restaurants, city establishing shots, the presenter on a phone.

## Rules

1. **Match the picture to the argument.** See above. Write the line each cutaway covers into
   `cutaways.json`'s `why` and check it reads as a sentence that makes sense.
2. **Never cut away over the CTA.** The closing "book a free call now" stays on his face with
   only the Click The Link graphic. Cutting away while he asks for the call undercuts it.
3. **Build runs, not lone cutaways.** About 35–40% of the runtime, in about four runs of
   2.5–3.5 s, with a white flash on every hand-off. On a 23–28 s ad that is roughly 9–10 s
   of b-roll. A run is one clip, or two chained clips of about 1.3–1.6 s each. A single clip
   under ~2 s on its own reads as flicker. The old target of three 2–3 s cutaways at ~30% is
   what the user called thin.
4. **One subject, centred.** Every cutaway needs a single clear focal point sitting in the
   middle of the 9:16 frame. A crop that gives "a bit of Thomas and a bit of the laptop"
   commits to neither and will be rejected. Decide what the shot is *of*, then set `cx` by
   hand so that thing is centred — the automatic subject finder picks the nearest face, which
   is regularly the wrong person, a stranger, or an empty chair.

   A **wide** shot — a lecture theatre, a long table — usually cannot give one at full height:
   the 9:16 crop keeps all 2160 lines, so the people stay small with dead wall above and bare
   floor or table below. Punch in instead: take only part of the source height and scale up.
   The footage is 4K, so 1.1–1.3x costs nothing visible, and it is the difference between "a
   room" and "two students you can actually see".

```bash
python $SKILL/scripts/punch.py out.jpg "<clip>" <in> <dur> <cx> <cy> 1.0,0.82,0.72
```

   `prep_cutaways.py` always crops full height, so bake the chosen punch into its own
   1080x1920 file first and point `cutaways.json` at that (it takes the vertical path and
   leaves the frame alone). Keep enough of the wide shot for the line to still read — the
   "seats" shot is pointless once the seats are cropped out.

   **A subtle pan** gives a static cutaway some life ("add some subtle pan so they have some
   engagement", Ad C, 2026-10-25). Bake it with `panclip.py`:

```bash
python $SKILL/scripts/panclip.py <src> <out.mp4> <t0> <dur> <cx_start> <cx_end> <cy> <hfrac>
```

   About a fifth of the frame width over 3 s reads as a deliberate drift, not a swoop. Pan
   *along* something — a row of students, a table — so the move reveals rather than wanders,
   and keep the main subject fully in frame on the first frame (a pan that opens on a clipped
   face reads as a framing mistake even if it settles). Do not build the pan from time with
   ffmpeg's `crop`: it moves in whole pixels, so the step rounds unevenly and the shot
   shimmers — measured on Ad C as steps alternating 2 and 3 px. `panclip.py` upscales the
   strip 4x and advances an exact whole number of those pixels per frame (`x = start + n*step`),
   which measured 2.50 px every frame. Check a new pan on a **frozen real frame** with
   `cv2.phaseCorrelate`: the live footage measures subject motion, and a test pattern is
   periodic and fools the correlation.
5. **Reuse across ads is fine; repeats inside one ad are not.** The reference ads share clips,
   so the strongest shots, such as the "Limited Seats" slide, can appear in several ads of a set.
   The old one-clip-one-ad rule and its claims file no longer apply. Inside one ad, don't show
   the same clip twice. Two windows of the same take in one ad are the same room, light and
   people, and read as the shot repeating even when the framing differs. "Plainly a different
   shot" is how that repeat gets justified, so don't use it.
6. **Clean and authoritative.** Reject slouching, clutter, dim murky frames, backs of heads
   filling the frame, and anything that looks like a holiday. These are ads for a consultancy
   that gets people into business school; the pictures should look like competent people at
   work.
7. **Preview the whole window, never a single frame.** A clip drifts over 2–3 seconds:
   subjects walk out, cameras pan, the shot ends on empty floor. Use
   `scripts/preview_cut.py` (below), which renders start / middle / end at the exact crop the
   pipeline will use. Then, after `prep_cutaways.py`, put the ad's finished cutaways side by
   side and look at them as a set — that is the only check that catches two shots which are
   each fine alone and too alike together.
8. **Stabilise a shaky cutaway, and measure rather than guess.** Handheld clips look fine as
   stills and wobble badly as a 2-second full-screen cut. Measure the mean frame-to-frame
   change inside the actual 9:16 crop: under ~3 is steady, over ~10 needs work. Then:

```bash
ffmpeg -i <clip> -vf "vidstabdetect=shakiness=6:accuracy=15:result=x.trf" -f null -
ffmpeg -i <clip> -vf "vidstabtransform=input=x.trf:smoothing=24:optzoom=1:zoom=0:interpol=bicubic:crop=black,unsharp=5:5:0.6:3:3:0.4" -c:v libx264 -crf 16 <clip>_stab.mp4
```

   `optzoom=1` crops in just enough to hide the edges, so check the framing again afterwards —
   and check for real black bands (a full-height column under ~10 grey), not merely dark pixels,
   which are usually just a dark jacket at the edge. Stabilise only the clips that need it: the
   zoom costs field of view, which a tight two-person frame cannot spare.
9. **Compliance binds the pictures.** For ads: no other institution's branding or signage in
   frame (EHL, LBS, HEC…), no statistics or rankings on a screen, nothing implying an
   admission result. A clothing brand on a jumper is fine; a school logo is not. Check the
   first *and* last frame — a poster can pan into shot.

   MiM's own slides are the exception: they are on-message and the user named them as the
   best Master footage. Two of them still carry something this rule bans. Don't drop them
   silently, and don't use them silently either: flag it when offering the set and let the
   user decide. The "Match with Your Mentor" screen (`C20260319_0011`) shows a small school
   logo (Kellogg, Bocconi, ESADE…) under each mentor. "Why Timing & Insider Info Matter"
   (`C20250925_1371`) shows "5-8 apps/day in Dec vs 15-20/day in Jan".
10. **No motion graphics unless instructed.** Cutaways in an ad are real footage. Don't add
   animated text, counters, charts or other motion graphics on your own initiative ("dont use
   motion graphics in the ads unless instructed", 2026-10-25). The "Click The Link" CTA graphic
   is fine — it was asked for. A subtle camera-style pan on real footage (`panclip.py`) is not a
   motion graphic. If a graphic would help, suggest it and wait for a yes.
11. **Own footage only.** MiM ads use only Thomas's / MiM Prep's own b-roll — the local folders
   the user gave (`F:\thomas b-roll`, `F:\thomas content\b-rolls`, clips already pulled into
   `Downloads\mim-ads-working-broll`) or the Thomas/MiM Frame.io library. No movie or TV clips,
   no stock, no footage from anywhere else ("only use thomas' broll for these ads or the local
   broll that i gave you", 2026-10-25). The movie-clip method in `broll-visual-storytelling` is
   for other clients' organic reels, not these ads.
12. **Look at every frame before saying a shot doesn't exist.** On Ad C the line was about
   recommendation letters and I told the user the local footage had no letter, document or
   phone shot — from file names and a few sample frames. The user replied "they do exist in the
   local footage. Have a look." A contact sheet of all 57 local clips at one frame every 2 s
   (about 14 minutes of footage, a few minutes to build) found a formatted letter on a laptop
   screen inside the boardroom clip `C20260313_0020` (10–14 s) and Thomas waiting on a phone call
   in `C20260821_0030`. Useful shots hide inside clips catalogued as something else. Build the
   full-length sheet first, and only then say what's missing.

## Where the footage is

The master library is the Frame.io share `https://f.io/Hrid3BA1` — 15 folders, ~3,170 items,
570 GB. It is not local and must not be bulk-downloaded. The catalogue of what is in each
folder lives at
`workflow-agents/scripter/clients/thomas/video-edits/mim-ads-2026-10-notes.md` in the
`ai.agents` repo.

A thumbnail index of the whole library is already built at
`G:\mim-master-urgency-2026-10\broll-index` (`library.json` plus one contact sheet per folder,
made by `tools\index_library.py`). Clips pulled for the Master ads are kept in a shared kit at
`G:\mim-master-urgency-2026-10\broll-kit`, because the ads reuse them.

Best folders for ad b-roll, in order:

| Folder | Why |
|---|---|
| `Curated Broll` → `C20250925_13xx` (Sep 2025 seminar) | **The best Master footage**: Thomas in front of his own slides. `1346` "How to Get into the World's Top Business Schools"; `1385` / `1386` / `1392` "Limited Seats in the Cohort" / "we only take ~30 students per round"; `1371` "Why Timing & Insider Info Matter" (see rule 9); `1349` the audience in suits. All are in the kit. The room is at EHL, so keep its signage out of the crop. |
| `Curated Broll` → `C20260319_*` (March 2026) | A bright modern meeting room: students in a row at a white table each on a laptop, a mentor leaning in over someone's screen (`0009`), Thomas at the "MiM Prep Masters Admissions" screen (`0005`), the "Tailored 1:1 mentorship" slide (`0014`), "Match with Your Mentor" (`0011`, see rule 9). |
| `Curated Broll` → `C20260313_*` (March 2026) | Boardroom panels in suits across a long table, tiered lecture theatre, whiteboard sessions. Good for anything about committees, rounds and interviews. |
| `B-roll Event 3 September in Paris` (44) | A workshop in a classic Parisian room. Usable, but it is one room on one day, so a whole set cut from it looks like one ad five times. Hold it in reserve. |
| `MAIN BROLL → Paris Wework` (52) | Office and co-working setups. |
| `MAIN BROLL → B-roll EHL` (44) | Campus and business dress — watch for EHL signage. |

Avoid in ads: `C20260313_0033` and the other whiteboard clips (GMAT/GRE scores and school
names are legible); `C20260313_0041` / `0043` / `0044` (the wall screen reads "The Best
Preparation Company in the World" and "MIM Prep Bachelor's Admissions" — a superlative claim,
and the wrong product for a Master pack); and the `C20260903_00##` windows around in 8–13 s
where a screen reads "We help very ambitious students get into the world's top business
schools", which is an outcome claim on screen.

Pull only the clips the ads need, never a whole folder, and put them in the kit. Download from
the shell, not the Frame.io page: the user doesn't want to confirm each browser download
("use shell commands to download them not the windows ui because then i have to confirm").
`G:\mim-master-urgency-2026-10\tools\fio_dl.py list|get` uses Frame.io's public share API.
Decode-check every download (`ffmpeg -v error -i <file> -f null -`), because a file left by
an interrupted session once had the right size and zero-filled packets. C:, D: and F: are
nearly full, so keep downloads on G:. Local pools (`F:\thomas b-roll`,
`F:\thomas content\b-rolls`) are mostly travel and presenter footage, weak for ads about
applicants, so search them by eye (rule 12) before saying they lack a shot.

## Workflow

1. Write out each ad's lines with timings (`transcript.txt` from the captions step).
2. Plan about four runs. Anchor each to the words it covers, decide what each clip in it
   must show, and check the total comes to 35–40% of the runtime with the hook and CTA left
   on his face.
3. **Index before downloading.** Frame.io serves a filmstrip of every clip at
   `https://assets.frame.io/scrub/<asset_id>/scrub_sheet.webp`, a 4809x2709 image holding a
   10x10 grid of frames from across the clip — tiles are 481x271, enough to judge content and
   pick an in-point. In the share page, `document.querySelectorAll('img[src*="scrub_sheet"]')`
   gives the signed URLs; `fetch` them (status 200, so the canvas is not tainted), compose a
   contact sheet on a canvas and download that one image. This reads a whole folder for a few
   MB instead of hundreds. Chrome blocks a run of automatic downloads, so compose one sheet
   rather than saving each file, and expect the finished file to land in Downloads under a
   UUID `.tmp` name before it is renamed.
4. **Show the options and let the user choose** before cutting anything: one row per run
   (or per clip of a run) with the line it covers, two candidates each — **as 9:16 crops, never as the wide
   16:9 frame.** A vertical crop keeps a third of the width, so a wide frame sells a shot the
   ad will never show: Ad B's first set was approved off wide frames (a lecture theatre, a
   long table) and rejected the moment it played, because the crop left small people and
   dead wall. `vstrip.py` cuts 9:16 strips straight out of the scrub sheets, across the
   clip's whole length, before anything is downloaded:

```bash
python $SKILL/scripts/vstrip.py out.jpg C20260313_0034:0.37 C20260319_0036:0.52 ...
```

   Before offering a set, check that no **student or extra** is the subject of two slots in
   one ad. Different clips from the same shoot often share a subject — `C20260313_0025` and
   `0034` are the same student in the same white shirt — and two cutaways four seconds apart
   then read as one shot repeated, which is the complaint rule 5 exists to prevent. Thomas is
   the exception: he is the face of the ad and the user asks for him in shot, so him
   appearing in two cutaways is fine — but say so when offering the set.
5. Pull only the approved clips, from the shell, into the kit (see "Where the footage is"):

```bash
python G:/mim-master-urgency-2026-10/tools/fio_dl.py list <share_id>
python G:/mim-master-urgency-2026-10/tools/fio_dl.py get <out_dir> 1080 <share_id>
```

   Then decode-check each file. The browser route also works: on the asset page, Download
   → **Proxy h264_2160** gives full 4K at a tenth of the original's size. But it makes the
   user confirm each download, so keep it for a one-off.
6. Preview every candidate window at its crop:

```bash
python $SKILL/scripts/preview_cut.py out.jpg \
    "<clip>" <in> <dur> <cx|auto> ["<clip2>" <in> <dur> <cx> ...]
```

   Look at all three frames per row. Reject anything that drifts, slouches, or has no centre.
7. **Set `cx` against a drawn centre line**, never by eye on a plain preview. `cxtest.py`
   renders one window at several `cx` values with the frame's middle marked:

```bash
python $SKILL/scripts/cxtest.py out.jpg "<clip>" <in> <dur> 0.40,0.46,0.52,0.58
```

   Without the line a crop repeatedly *looks* centred when the subject is a third of the way
   over. Walk `cx` out until a neighbour's shoulder or a second face enters an edge, then step
   back one.
8. **Build the runs.** The pipeline for this is in `G:\mim-master-urgency-2026-10\tools`:
   - `make_specs.py` holds each ad's runs, as an anchor phrase plus pieces of
     `{src, in, cx, cy, zoom}`. It asserts that no stack slips in.
   - `place2.py <job> <spec.json>` bakes every piece to its own 1080x1920 clip (`bake.py`).
     It then writes `cutaways.json`, `flashes.json` and `cta_start.txt`. It refuses a run with
     less than 1 s of face before it, or one that runs into the CTA.
   - `render_job.py` renders, draws the white flashes (a white frame fading over 3 frames at
     0.92 / 0.55 / 0.22), adds the CTA and muxes.

   Outside that pipeline, write `cutaways.json` by hand with the chosen `cx` values, and don't
   leave `cx: null` unless the clip has exactly one obvious subject. Then run
   `prep_cutaways.py`.
9. **Open the cutaways side by side as a set before rendering** (`cutaways_sheet.jpg`). That is
   the only check that catches two clips that are each fine alone and too alike together.

## Placing them in time

- **Put the camera switch under the b-roll, never next to it.** These ads cut between two
  angles of one take. A cutaway that ends just before a switch shows a flash of one angle and
  then a jump to the other. On Ad D v3 a cutaway ended at 5.5 s and the side-to-front switch
  came at 5.6 s. The user called it "super rough" and asked to "extend the B-roll a little bit
  so that the cut is invisible". So when a cutaway ends within ~1.5 s of a switch, run it
  0.3–0.5 s past the switch. The viewer then comes back onto an angle that is already running.
  Starts work the same way. A cutaway that begins less than ~1 s after a switch flashes the new
  angle. Start it just before the switch so it covers it, or give the new angle a full second.
  (This replaces the old rule of keeping each cutaway inside one angle segment.)
- **Find the switches before writing `cutaways.json`**, on the base the cutaways sit on:

```bash
ffmpeg -i <job>/public/base.mp4 -vf "select='gt(scene,0.15)',showinfo" -an -f null - 2>&1 | grep -o "pts_time:[0-9.]*"
```

- **Keep ~1 s of his face between two runs.** Any less reads as another flash (`place2.py`
  refuses it). Moving one run to cover a switch usually means retiming its neighbours. In
  D v4 the first cutaway grew to 3.2–6.1 s, the second moved to 7.2–9.3 s, and the third
  started early (10.3 s) to cover the 10.56 s switch.
- **A trim jump on his face is the same problem in a smaller form.** When a pause is cut out,
  his head snaps. The fix is the other angle: "if it doesn't look good in terms of the cut, then
  we can insert that side angle". That means rebuilding the base, so offer it rather than doing
  it. On Ad D the user left the one at 14.92 s.
- Leave the hook on his face.
- Nothing after the CTA line begins.
- **After the render, check the cuts in the delivered file:**

```bash
python $SKILL/scripts/cutscan.py "<deliverable>.mp4"
```

  It lists every cut (b-roll edges and camera switches measure 50–160) and flags any two that
  are less than 1 s apart. A white flash counts once, with its fade frames, and is labelled.
  Fast camera motion and isolated jumps go in a separate list to check by eye. A trim jump on
  his face and a handheld jolt inside a cutaway measure the same, so look at the frames either
  side of each one. Tested on D v4 (passes), a London ad with seven flashes (all labelled,
  passes) and a planted 0.12 s shot (flagged).
