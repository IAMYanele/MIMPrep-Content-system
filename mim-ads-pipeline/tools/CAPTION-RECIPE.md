# London master ads - captions + CTA (recipe)

Source: `F:\london master ads uncaptioned\Hook <n><L>.mp4` (D is `Hook <n>DD.mp4`).
These are finished talking-head masters: NO b-roll, no captions. We add captions + the
blue book-a-call graphic only. Do not add b-roll.

Canonical script for every ad: `tools/scripts.json` (keyed A1..E3, verbatim from
`MIMPrep_Thomas_master_urgency_2026-10-20.pdf`). Each entry has `src`, `hook`, `body`,
`script` (hook + body) and `out_name`.

## Per ad (job id = letter + hook number, e.g. C2)

    cd G:/mim-master-urgency-2026-10/tools
    bash prep.sh "<src from scripts.json>" <jobid>     # new_job -> base.mp4 -> whisper -> punch
    python scriptalign.py <jobid> --dry                # read the diff first
    python scriptalign.py <jobid>                      # re-map captions onto master script
    python ctastart.py <jobid>                         # -> cta_start seconds
    python render_job.py <jobid> "<out_name>" <cta_start>

Output lands in `G:	homas london master captioned\` (set in render_job.py OUT_DIR).

## Why scriptalign exists

faster-whisper mishears this pack systematically: "round" -> "one" (6x in body A alone),
"Book a free call" -> "Look a free code", "every round that passes" -> "everyone that
passes", "a full file" -> "a profile". Captions carry the SCRIPT wording aligned onto the
measured timings - never the raw ASR text. ALWAYS read `--dry` output before applying; if
a replacement looks wrong (a whole sentence swapped, or a span far longer than the words
it covers), stop and say so rather than rendering it.

After `scriptalign`, `jobs/<jobid>/transcript.txt` must read exactly as the hook + body in
scripts.json. Check it.

## Rules

- ONE render at a time. `render_job.py` takes `F:\mim-ads-2026-10\render.lock` and waits
  for other sessions, so just run it - never bypass the lock, never run two renders.
- Disk is tight: G: had ~2.6 GB free and F: ~322 MB. Do not write to F:.
  `render_job.py` deletes its own render.mp4/render_cta.mp4 after each mux.
- The CTA graphic is `F:\mim-ads-2026-10\tools\cta.png` (1080x1920 RGBA), overlaid from
  `cta_start` to the end with a 0.25s fade. It must come in on the word "Book".
- Masters are 1728x3072 @ 29.97fps; the comp renders 1080x1920. That is expected.
