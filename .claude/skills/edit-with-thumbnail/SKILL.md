---
name: edit-with-thumbnail
description: Coordinator for every video edit for Thomas / MiM Prep. The moment someone starts editing a video in Claude (a CV review, an interview or b-roll reel, a talking-head clip, an ad, a batch of clips), launch the thumbnail/cover for that video as a background job so it is made in parallel with the edit, then hand the finished edit and three cover options over together. Covers come from the video's own footage or, when that isn't cover quality, from the high-quality photo library. Use whenever a video edit begins or is requested ("edit this video", "cut this", "make the reels", "edit the CV reviews", "make this in the background style"), even if nobody mentions a thumbnail. Works alongside cv-review-vertical, thomas-broll-reel, mim-reel-edit and thomas-reel-cover.
---

# Edit with thumbnail

Thomas's workflow (call, 2026-10-19): "once we have a reel automatically, the thumbnail
will be generated... give me three options. I take the best option and then you
schedule it via PlugKit." Nobody should have to remember the cover separately, and it
shouldn't wait until the edit is finished. So every edit starts the cover first, in
parallel.

## 0. Raw footage? Clip it first

If what you've been handed is a raw take or a long recording (a CV review session, a GMAT
session, a consultation call, a podcast), run `value-clipper` first: value segments, then
approval, then clean clips. The cover job starts per approved clip, when that clip's edit
starts. Don't make covers for segments the user hasn't approved.

## 1. Before touching the edit: launch the cover job

Work out, from the request and the files:

| | |
|---|---|
| **Video** | the file being edited, and its RAW source if different (4K raws make better covers) |
| **Edit skill** | `cv-review-vertical`, `thomas-broll-reel`, `mim-reel-edit`, or none |
| **Page** | Thomas's page (@thomas_d_c) uses `thomas-reel-cover`. For MiM Prep page posts, see "MiM Prep page" below |
| **Transcript** | any existing one (captions JSON, `words.json`, `transcript.txt`, `cv-work/captions/`) |
| **Cover job folder** | `<covers root>/<slug>/`. On Yanele's PC: `F:\thomas b-roll\<slug>\` |

Then start a **background agent** with the Agent tool (`run_in_background: true`,
general-purpose) and the brief below, filled in. Don't wait for it: go straight to the
edit.

```
Make the Instagram reel cover for this video by following the thomas-reel-cover skill
(load it with the Skill tool and read its references/style.md first).

Video: <path to the video being edited>
Raw footage of the same shoot: <path(s), or "none">
What it's about: <one line, or "read the transcript">
Transcript: <path, or "none yet - transcribe the source audio yourself with faster-whisper base.en, only to understand the topic">
Series / context: <e.g. "CV review, Thomas's studio, no student name or CV on the cover">
Job folder: <covers root>/<slug>/
Photo library: F:\thomas pics, F:\thomas content\b-roll stills (and the shared Drive photo folder if synced)

Deliver: 3 finished cover options (different images AND different hooks), the options
sheet from options_sheet.py, and a 3-line summary (image source + hook for each).
Rules: do NOT post, schedule or upload anything. Do NOT render or encode video:
frame grabs and stills only, at most 2 worker processes, because an edit render
is running and renders must never overlap. Don't edit the video's files.
```

On machines where background agents aren't available, finish the edit and then run
`thomas-reel-cover` yourself before you report back.

**Batches** (e.g. 12 CV reviews): launch **one** background cover agent for the
whole batch, working through the videos in the order you'll edit them, not one agent
per video. Twelve parallel jobs would starve the renders, and the covers need to
differ from each other on the grid.

## 2. Do the edit

Follow the edit skill as normal. Two touch points with the cover job:
- If the edit changes what the video says (a re-clip, a dropped section), tell the
  cover agent with SendMessage so the hook still matches the final cut. A cover can't
  promise something the edit cut.
- When the edit's final transcript exists and the cover agent had none, send it the
  path.

## 3. Hand over together

When both are done, deliver in one message:
1. The edited video (path), with the edit skill's usual notes.
2. The cover options sheet, sent with SendUserFile so it's visible. The agent's report
   isn't shown to the user, so relay its three-line summary.
3. One question: which cover? (and, if relevant, which edit version).

Verify before relaying: open the sheet and each cover yourself. The agent's report is
a claim, not proof.

## 4. After the pick

- Add the picked cover to `covers-log.csv` (the cover skill explains the format), so
  later covers don't reuse it.
- **Never post or schedule without an explicit "post it" / "schedule it".** Posting
  goes through PlugKit with the cover attached and the user's caption. For CV reviews,
  confirm the student agreed to be posted first (CV Review 03 was taken down at the
  owner's request). PlugKit can't unpublish.

## Image source order (what the cover agent falls back through)

1. The video's own shoot. Raw footage, never the captioned edit. Frames must pass the
   Forbes test: tight, composed, mouth closed, sharp.
2. If no frame passes (wide shot, mid-word, soft 1080p crop), use Thomas's
   high-quality photos and the b-roll stills library.
3. A photo the user supplies or links.

Never retouch or regenerate Thomas's face. Real photos only. Nano Banana adds only the
lettering. Thomas, 2026-10-19: "We have 4K photos. We have B-rolls. Why do we edit
like this? It cheapens the brand so much."

## MiM Prep page

Posts for the MiM Prep account (Margot, Manuel or Ali CV reviews, GMAT-session clips,
consultation clips) are a different brand. Thomas wants them in **MiM Prep's own
palette**, one blue matched exactly, aligned with the website and distinct from his
personal page, and never with heavily edited faces. There is no locked MiM Prep cover
template yet. Until there is, tell the user and ask whether to use
`thomas-reel-cover`'s workflow (real image, text-only Nano Banana, 3 options) with the
MiM palette swapped in, rather than his dark cream look.
