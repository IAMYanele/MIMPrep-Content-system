# MiM ads pipeline

Tooling for the Thomas / MiM Prep ad packs (master urgency, bachelor urgency),
backed up here from `G:\mim-master-urgency-2026-10\` on 2026-10-31 because that
drive is not version controlled and the ad working folders are being cleared.

The media itself is NOT here — finished ads live on Frame.io and are linked per-ad
in the **MIM Prep Ads Tracker** sheet (`17tuEa1w_Xv8Y6jBL3HmwSd3PLteIE2WdLJc04GTIwgQ`,
Ads tab). This is the code and the editorial decisions only.

## tools/

The captioning + render pipeline. `CAPTION-RECIPE.md` is the entry point - it has the
exact per-ad commands.

| file | what it does |
|---|---|
| `prep.sh` | decode check -> job -> base.mp4 -> whisper -> punch-ins |
| `new_job.py` | start a job from an already-vertical source (one full-frame shot) |
| `make_base_v.py` | build base.mp4 (tightened) from the job's shots |
| `scriptalign.py` | **re-maps captions onto the master script**, keeping measured timings |
| `verify_captions.py` | proves the on-screen words match the script, word for word |
| `ctastart.py` | finds the second the "Book a free call" line starts |
| `render_job.py` | assemble -> Remotion render -> CTA overlay -> mux. Holds a render lock |
| `scripts.json` | the 15 master-urgency ad scripts, verbatim from the client PDF |
| `fio_dl.py` | Frame.io public-share listing/download from the shell |
| `place.py`, `place2.py`, `punch.py`, `bake.py` | b-roll placement, punch-ins, baking |

### Why scriptalign exists

faster-whisper mishears this pack systematically: `round`->"one" (6x in body A alone),
`Book a free call`->"Look a free code", `every round that passes`->"everyone that passes",
`a full file`->"a profile", `most top`->"no stop". Captions must carry the SCRIPT wording
aligned onto the measured word timings, never the raw ASR text. Always read
`scriptalign.py <job> --dry` before applying, then `verify_captions.py <job>` before rendering.

## specs/ and review/

The b-roll placement decisions for the Dubai ads (which clip over which words, crops,
timings) and the review passes on them. These were hand-tuned; regenerating them means
redoing that judgement.

## Not backed up here

- `reference-dubai-approved/` (222 MB) - the approved Dubai bachelor ads the b-roll style
  is copied from. On Frame.io: AD-A `f.io/SPt6FY0h`, AD-B `f.io/4TIss9o1`,
  AD-C `f.io/MjH0aX9X`, AD-D `f.io/nibToiUP`.
- The b-roll library itself - `F:\thomas b-roll\videos\b-roll` (251 clips at
  consolidation, index CSV beside it).
