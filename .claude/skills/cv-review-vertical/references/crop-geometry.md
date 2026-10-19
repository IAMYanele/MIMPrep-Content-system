# Solving a crop rect from landmarks

When a client points at a reference edit and says "crop it like this", eyeballing the
zoom gets close and stays wrong. If the scene contains anything fixed -- the lamp
bars on the back wall, a poster edge, a mic arm -- the crop rect can be solved
exactly instead.

## The idea

The reference panel is some rectangle of the source, scaled to the panel size. Two
landmarks visible in both images are enough, because scale falls out of the ratio of
the distance between them:

```
s   = distance_in_reference / distance_in_source
W   = panel_width  / s          # crop width in source pixels
H   = panel_height / s
cx  = landmark_source_x - landmark_reference_x / s
cy  = landmark_source_y - landmark_reference_y / s
```

Everything else is a consistency check, and the checks are what make this
trustworthy.

## Doing it

**1. Measure landmarks in the reference.** If the reference is a video you can only
stream (a Frame.io share, say), you do not need to download it. Play it in the
built-in browser, draw the frame to a canvas at natural size, and read pixels with
`getImageData` -- those are true pixel values, unlike a screenshot, which is scaled
by the pane. Find bright vertical bars as runs of columns with many bright rows, and
record each one's centre, width and vertical extent.

**2. Measure the same landmarks in the source** (`scripts/lamps.py`).

**3. Try every pairing.** You usually cannot tell by eye which source bar is which
reference bar. Enumerate the pairings, compute `s` for each, and throw out any that
imply a crop wider than the source or out of bounds.

**4. Let the checks pick the winner.** Survivors are separated by evidence the
solution did not use:

- *Bar widths.* A bar `w` px wide in the source must appear `w * s` px wide in the
  reference. This alone killed most candidates.
- *Vertical positions.* Predict a landmark's top edge and compare. The accepted
  solution predicted 179.2 against a measured 178.
- *Which landmarks are visible at all.* The winning rect put exactly three bars
  inside the frame and pushed four outside -- and the reference showed exactly three.
  A bright run at x≈0 that looked like an edge artifact turned out to be a fourth bar
  clipped by the crop's left edge, which is itself strong confirmation.

A solution that satisfies all three is right. One that only matches spacing is a
coincidence waiting to happen.

## What it produced here

```
scale 0.8352   crop 1292x766 at (383, 114)   zoom 1.485x
```

Verified afterwards in the render: bars landed at x=2/104/218 against the reference's
0/103.5/217.5, on all twelve clips.

## Notes

- **Check the camera didn't move** before reusing a rect across a shoot. Measuring the
  bars in every clip took one pass and found them at 376/506/643 ±1px throughout,
  which is what justified a single rect.
- **Prefer downscales.** 1292->1080 loses nothing. If a match implies upscaling, the
  reference was probably made from higher-resolution masters.
- Template matching (sliding NCC over candidate scales) also works but is far slower
  in pure Python, and it needs the same landmark reasoning to interpret anyway.
- Match on *static* background only. Sampling a region containing the person makes
  the score depend on which frame you grabbed.
