---
name: mim-reel-edit
description: Thomas / MiM Prep talking-head reels. Turns one raw desk-set clip into a finished 9:16 reel in the MiM brand, either as a graphics reel (full-screen creator / split screen / full-screen animation, built with business-short-form-reels) or as a tier-list reel (S-F table, item cards dropping into rows, built with ranking-format). Use whenever a Thomas talking-head clip needs editing into a reel - "edit this reel", "make the Dubai reels", "do the next one the same way", "tier list", "ranking video", "rank these" - and for one part alone: just the cut, just the captions, a new animation, or a re-render after a change. Not for CV reviews (cv-review-vertical), GMAT sessions (zoom-session-reel) or the background ad style (thomas-broll-reel).
---

# MiM reel edit

The entry point the `edit-with-thumbnail` coordinator names for Thomas's talking-head
reels. It does not replace the two engine skills; it says which one to reach for and
carries the house rules that were settled on the Dubai batch (2026-10-21), so a new reel
matches the five that shipped instead of re-deriving the style each time.

## Pick the engine first

| The video | Skill | Shape |
|---|---|---|
| He explains something, makes a point, lists steps | `business-short-form-reels` | creator full frame / split screen / full-screen animation, switching on real edit cuts |
| He RANKS things into tiers, or sorts them into named verdicts | `ranking-format` | presenter full frame the whole way, S-F table, a card per item dropping into its row |

A video that sorts things into verdicts he repeats ("gets you in the door / sets you
apart / hurts you") is a ranking video even though he never says a letter: map his
verdicts onto the fixed tiers (best to S, neutral to C, worst to F). The engine
hard-codes S A B C D E F with no override, so his own wording has to carry in the
captions and the audio.

## Brand

| | |
|---|---|
| Accent | `#4490F6` - MiM Prep secondary, the dominant colour on every graphic |
| Depth | `#004AAD` - MiM Prep primary, for the ambient glow and darker gradient stops |
| Background | `#050505` |
| Positive / negative | `#2FA65A` green and `#B3261E` red, never the accent, for verdicts and gain/loss |
| Type | Helvetica Now Text Medium |

The accent lives in `~/.claude/creator-profile/profile.json` and is pushed into every
skill by `setup/apply_profile.py`. **Change it there and re-run apply_profile, never by
editing a skill's files** - apply_profile rewrites them all from `setup/.pristine` and
would discard the edit.

## House rules

1. **No caption where the graphic already carries the words.** Put the span of every
   text-bearing scene in `HIDE` and pass it as `E.init(..., hide=HIDE)`. A reel that
   ends up with zero phrase captions is correct, not a bug - C33 shipped that way.
   Face windows keep their one-word captions.
2. **Animations fire on the exact word onset**, read from `words.json`, not on a rounded
   nearby time.
3. **Full-screen graphics centre at 46-50% of frame height.** Scenes composed with a
   caption underneath go top-heavy once the caption is hidden, so re-measure after
   setting `HIDE`.
4. **Nothing on screen may name something he does not say.** Several of these videos were
   shot against on-screen labels that are not in the footage. Where the label is lost,
   build the graphic from the verdict and the reason in his own words rather than
   inventing the item - and if a label is unavoidable, get it from Thomas first.
5. **Tier table placement for this desk set-up:** his chin runs y1040-1090, so the table's
   home position (y1000) covers his jaw. Use `{"scale": 0.8, "top": 1180}` in
   `layout.json`. Captions sit at `top - 78` and move with the table, so the
   caption-to-table distance never needs separate adjustment. The F row then sits at
   y1525-1580, just below the safe line - check it against the Instagram UI before
   shipping a reel whose F tier matters.
6. **Master to -14 LUFS**, including ranking reels (the ranking skill's own `final.sh`
   does -16; a batch posted together must match).

## Gotchas

- **Always render with `--workers 1`.** Multi-worker capture stages every frame as a JPEG
  in `%TEMP%` - about 2.7GB for a 54s reel - and `C:` has no room. `--workers 1` streams
  straight into the mp4.
- **CSS lengths need an explicit unit.** `style="top:%d"` yields `top:620`, which is
  invalid and silently ignored; the element falls back to `top:auto` and jumps to the top
  of the frame. Write `top:%dpx`. Lint does not catch it - a snapshot contact sheet does.
- **Render one reel at a time**, and keep the cut, crops and renders on the drive that
  holds the raw file.
- Ranking reels: **render the 720p preview and get approval before `final.sh`.** The
  engine writes `review_events.json`, so a note like "the third card is late" maps to an
  exact event and is fixed in `plan.json`, not by rebuilding.
- Ignorable warnings: the GSAP CDN fetch failing (it still runs - verify by checking two
  frames inside one scene differ) and `404 assets/proof/avatar.jpg` (the Google Docs
  account avatar, which falls back to grey).

## Fonts

No font files are committed to this repo. Install **Helvetica Now Text Medium** on the
machine and copy it to `~/.claude/creator-profile/assets/fonts/` so `apply_profile.py`
can hand it to each skill. The skills' `assets/fonts/` folders are intentionally empty
here.

## Worked references

The Dubai batch, built with these rules. Reels are in `references/reels/`; each project's
`build.py` or `plan.json` is the readable source of its edit.

| Reel | Engine | What it shows |
|---|---|---|
| `C40-final-year-reset.mp4` | business | six distinct graphic forms, a real Google Doc scene, hide spans cutting 58 captions to 8 |
| `C33-second-year.mp4` | business | load-bearing pillars, crowd-to-committee, slots filling, a split-to-full reverse arrow; zero phrase captions |
| `C38-use-these.mp4` | business | four needs, each with the real brand logo on a white chip; two modes only, because every cut in the middle is a big jump 0.5-1.5s apart |
| `C34-ranking-extracurriculars.mp4` | ranking | the tier ladder filling up; item labels are inferences, since the activities are never spoken |
| `C36-gets-you-in-the-door.mp4` | ranking | three spoken verdicts mapped to S / C / F, nine items, ending 3/3/3 |

## With the coordinator

`edit-with-thumbnail` starts the cover job before the edit begins, so a reel and three
cover options arrive together. Launch that first, then come back here and edit. Covers for
Thomas's page come from `thomas-reel-cover`; MiM Prep page posts use `mimprep-cover`.
