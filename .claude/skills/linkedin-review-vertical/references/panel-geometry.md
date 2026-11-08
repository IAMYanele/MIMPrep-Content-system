# The lower panel: geometry and held stills

The reel is 1080x1920. The reviewer sits in the upper region, the profile capture in
the lower one. Two things about the panel cause almost all the mistakes.

## 1. The panel is not a full frame of the capture

The capture is a phone or screen recording — a real one here was 1206x2622. The panel
**scales it to 1080 wide and then takes the centre band of rows**, roughly 1280 of
them. Everything outside that band never appears.

The consequence is the one that actually went wrong: a section map built by looking at
full frames of the capture does not match what the panel shows. A block was planned
against a frame where the right section was visible near the top, and in the panel that
row had been cropped away, so the hold sat on an unrelated entry.

**Always plan holds from panel-sized frames.** Render the panel crop first, then pick
the frames:

```bash
# preview exactly what the panel will show, at the time you are considering
ffmpeg -ss <t> -i capture.mp4 -frames:v 1 \
  -vf "scale=1080:-2,crop=1080:1280:(iw-1080)/2:(ih-1280)/2" panel_<t>.png
```

If a section will not fit the band at that scale, scroll the capture so it does and
re-record, or choose a different anchor row — do not fix it by shrinking the whole
capture, which makes the text unreadable at reel size.

## 2. Hold a still per block; never follow the raw scroll

The capture scrolls continuously while the reviewer talks. The talk then gets cut:
pauses removed, repeats dropped, segments reordered. A panel that plays the raw scroll
under a cut track drifts immediately out of step and shows a section the reviewer
stopped discussing twenty seconds ago.

So the panel is built from **one held still per block of talk**:

1. Split the cut into blocks, one per thing the reviewer is addressing (the headline,
   a role, education, languages…).
2. For each block, choose one panel-cropped frame that shows that thing.
3. Hold it for the whole block, and change it on the block boundary.

A change on a block boundary reads as deliberate. A change in the middle of a sentence
reads as a glitch.

### Moving within a long block

If a block runs long and the subject is a tall section, a slow vertical move is
allowed, but it must be built, not inherited from the capture: interpolate between two
panel-cropped stills across the block's duration. Keep it under about a fifth of the
panel height, or it reads as a swoop.

Do not build it from the capture's own scrolling, and do not drive it with ffmpeg's
`crop` from time — that steps in whole pixels and the panel shimmers.

## 3. Checks before rendering

- Open every hold at full size. The thing being discussed should be unambiguous and
  centred in the band, not clipped at an edge.
- Put the holds side by side as a set. Two consecutive holds that look nearly the same
  read as the panel being broken.
- Check the first and last frame of each hold for anything that is not the profile —
  see the privacy section in `SKILL.md`.
