# MiM Prep cover style: the rules, and the approvals and rejections they came from

Updated 2026-11-02 from every MiM cover decision between 2026-10-28 and 2026-11-02, plus the 2026-10-19 team call.
`approved-vs-rejected-2026-10-28_11-02.jpg` shows them day by day: rejected covers in red with Yanele's words,
approved ones in green. `approved-current.jpg` is the current look. Both stay on this machine and are never
committed, because they show the creators.

## The one template (non-negotiable)

Every cover is the **dot-grid page**, in one of two colours, and nothing else:

| Page | Background | Dots | Logo | Text |
|---|---|---|---|---|
| White | paper `#F1F1F1` | grey `#C5CAD6` | blue | MiM blue `#004AAD` |
| Blue | MiM blue `#004AAD` | slightly lighter blue | white | white |

On the page: the MIMPREP logo at the top, the headline under it, and the subject cut out and rising from the bottom
edge. **No shapes or graphics behind the subject** (no circles, arches, bands, rings, icons), **no pills**, **no
photo backgrounds or blurred real backgrounds**, no light-blue second lines. Yanele, 2026-11-02: "it is very
important that we stick to the blue background with the polka dots, or white with the polka dots. No shapes and
stuff in the background."

Variants, both on the same page:
- **Standard** (`plain` / `bluepage`): headline on top, subject underneath. Almost every approved cover.
- **Text behind the head** (`behind` / `bluebehind`): the last headline line tucks behind the top of the head
  (approved 2026-10-29, "Overrated or underrated? / Business Schools").

**Alternate white and blue on the grid.** Each new post is the opposite colour to the one before it, so check the
newest live post first. "Do the opposite color that Maria's is going to be" (1 Nov); "white blue white blue
format" (28 Oct); "schedule them in white, blue, white" (29 Oct).

Headline in Poppins SemiBold (Thomas disliked Montserrat), the optional top line in Georgia Pro Condensed Italic.

## Text

- **Headline only by default.** Add the small italic top line only when the headline doesn't make sense on its
  own (Yanele, 2026-11-02). Removed on 2 Nov: "Applying for a finance master's?", "We asked an IE student".
- **No pills, ever.** "remove the pill and its text" (25 Oct, 27 Oct, 28 Oct x2), then "remove the pills. no
  pills" (29 Oct).
- **No light-blue subtitle lines** ("and what gets you in", "for finance", "We asked a student").
- One or two short, bold lines. Two styles have been approved:
  - a punchy statement: "Applications", "LBS", "9 free courses worth opening", "Finance in 30 days";
  - the viewer's own question: "Is your CV getting ignored or shortlisted?", "Are IE students lazy?",
    "How to answer "Why Warwick"" (with the quoted question in bold).
- Fold extra words into the main headline rather than adding a line: "remove the pill... and add essay to the main
  text" (25 Oct).
- Headline bigger rather than smaller; the last line may tuck behind the head (27 Oct).
- Don't let two text styles compete: "the ehl text and normal text is fighting each other for attention" (27 Oct).
- Never invent a number the video doesn't say; no em dashes.

## The subject

**Who:** whoever is in the video going up on the MiM Prep page: the UGC girls (Maria, Manon, Mathilde, Margaux,
Charlene...), Alex and the other guys, or Thomas (Yanele, 2026-11-02). If someone's photo has already been
approved for a cover, reuse it when asked: "use the same photo you did last time for alex" (31 Oct).

**Fallback, ask first:** when nobody in the video faces the camera and there's no raw (e.g. a street interview),
a cut-out of the place on the same page, like the IE tower (approved 1 Nov). Confirm with Yanele before using it.

**The photo is what gets rejected most now.** Seven rejections on 31 Oct and 1 Nov were the photo alone:
- Rejected: a neutral or serious mouth (Margaux, "better thumbnail needed" from Thomas); eyes half closed or
  narrowed, or a glance and head tilt (Margaux, "I don't like the photo"; Maria, "use better photo", "change
  Maria's photo"); a stiff pose (Mathilde in the scarf, "I don't like this photo"); profile, talking to someone
  off camera (Alice).
- Approved: looking **straight into the lens**, eyes open and relaxed, a **soft closed smile or a genuine smile**,
  head level, sharp. "Forbes quality."
- Take the frame from the **raw footage**, never the captioned edit ("extract the image of manon from the raw
  footage", 27 Oct; "pull frames from the raw", 29 Oct).
- Prefer **bright, evenly lit takes against a plain wall**. Every cutout problem in this period came from footage
  shot against a bright window (Margaux's studio): window light through her hair, a dark rim, a rough edge.
- **Framing:** head and shoulders fill the lower half, hair just under the headline, centred ("centre her",
  31 Oct). The person is big; never small inside a shape.

## Cutout quality

- No visible cut edges: "maria is cut out here no?" (28 Oct). cover.py runs edges that touch the frame off the canvas.
- No background left in or around the hair: "fix the white by her hair" (1 Nov). No rough or lumpy hair edge:
  "the hair is still off here can you pls trim it" (1 Nov). Trim the outline with `clean.py --trim`.
- Never let AI change a face. Nano Banana must not re-render the person ("looks like you did something to the face
  with AI", 20 Oct). Trimming or keying the outline is fine; anything touching her face is not.

## Colour grade

- **Grade the cover only, never the video.** "No, I said only calibrate the thumbnail, not the video" (29 Oct).
- Every batch needed a grade before approval: "colourgrade maria / mathilde / manon" (28 Oct), "they look pale"
  (31 Oct), "they need to look a bit more saturated" (2 Nov), "Let's go with B, warm glow" (29 Oct).
- Approved look: warm, golden skin and rich hair, never pale or flat. `grade.py` (default `--sat 1.25`) is that
  look. The old HSV saturation push left red blotches on 1080p phone footage; grade.py's boost doesn't.
- Match the subject to the page, and if a background ever needs tidying keep the real room, only neater
  ("use her normal background as in the video and remove the clutter", 27 Oct).

## Posting

- Show covers (and the videos) before uploading, scheduling or reposting anything: "no show me them before you
  upload them" (25 Oct); "only once you send me the thumbnail will we discuss re-uploading it" (28 Oct).
- @mim_prep posts go out with **no caption**.
- Judge on the grid, not alone: a cover was taken down because "it doesn't look good on the feed" (27 Oct).

## Retired (do not use)

- Shapes behind the girl: blue arch, ringed circle, striped band (approved 20 Oct, rejected 28 Oct: "remove the
  blue circle in the background", "remove the blue icon in the background", "change the thumbnail to the blue style
  we have"). The 20 Oct approved covers are in `_retired/` for history only.
- Photo layout on a real or generated background with a fade (rejected 29 Oct "change the cover styling", 1 Nov
  "Not the whole blurred out format. It has to be in the same template"). `plate.py` and `composite.py` are in
  `scripts/_retired/`.
- Rounded photo cards ("I don't like the whole box thing"), AI props like grad caps and binder clips ("classic
  AI-generated assets"), Montserrat.
