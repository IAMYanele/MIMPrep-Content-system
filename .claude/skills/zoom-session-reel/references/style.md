# Zoom session reel: measurements and the feedback behind them

All coordinates are in the 1080x1920 output unless they say "source".

## The approved example

On 2026-10-20 Thomas sent a version of "GMAT - How to structure your prep" with a title card
added and said "Add a big title like this on this clip", and "add her credentials". That
reel is the reference for everything below. It stays on Yanele's PC and isn't in this
public repo: it shows the tutor and a student's voice. Its card is reproduced in
`title-card-reference.png`, with a placeholder pill.

## Layout

| Element | Value |
|---|---|
| Panels | tutor 1080x960 on top, student 1080x960 below, no gap |
| Source crops (Fathom 1280x720) | tutor 360x320 at (90,6); student 360x320 at (776,34): the largest 9:8 box inside each 640x360 tile, 6px in from the green border, clear of the name label |
| Caption | Helvetica Now Text Medium 88, white, no outline, soft shadow (`&H78000000`, shadow 3), centred at y=960; glyphs span y 940-994 |
| Caption lines | max 2 words, 11 characters, never across a sentence end, never two on screen |

## Title card

| Element | Value |
|---|---|
| Box | white `#FFFFFF`, corner radius 25, 254 tall, top at **y=1016**, centred on x=540, 54px padding each side of the widest line (731 wide for Thomas's title) |
| Title | 2 lines, `#111111`, cap height 65px, baselines 112 and 211 below the box top, centred |
| Typeface | Thomas's example uses a bold condensed serif we don't have. Closest installed: Georgia Pro Condensed SemiBold narrowed to 91%, so "How to structure" is 622px wide like his. Ranked over all 668 installed fonts by width, weight and shape, then compared side by side |
| Pill | the tutor's credential pill, 708x79, radius 15, 20px under the box, centred. e.g. name · school logos · GMAT score |
| Timing | on from frame 0; fades out over 0.1s starting 9.70s (measured frame by frame on the example) |

**Why the box top is at 1016, not 1123.** Thomas's example had the box at y=1123. The user
drew a line on the first render: "Make sure that the top of the text is sitting right
under the caption. So it looks like the caption is sitting on the title text." The
caption's lowest pixel is y=994, so the card moved up 107px, pill and all.

## Hiding the student

| | Mosaic (Thomas's pick) | Blur (kept as the alternative) |
|---|---|---|
| Area | ellipse 1.24 x 1.64 face widths, forehead to chin; hair and background untouched | feathered ellipse 1.9 x 2.7 face widths: the whole head |
| Look | ~9 square blocks across the face (block = face width / 9, about 16px source) | pixelate to 1/22, then Gaussian sigma 14 |
| Check | the detected face core is 100% covered in every frame | the face core's sharpness drops below 4 (it was 8-27 unblurred) |

History: first a soft blur over the head. Thomas asked for "a mosaic blur on the student's
face… just on the face and not their background". Then the user asked for both variants.
Both once picked up Zoom's green speaker border into the bottom blocks/blur, when the student
was talking. The border is now replaced before averaging, and `check_reel.py` scans for green.

## Cutting (value-clipper, but it decides how these reels feel)

The first cuts of this session were sent back: "not clipped well enough… redundancies… a
lot of filler words… ums and ahs… some of the cuts are very rough and abrupt". And for the
mock-exam clip: "too stretched out… keep it to one mock exam a week, how it's done, how we
should think about it… any other additional details necessary". The fixes were:
- chunked transcription, because word times drifted up to 2.8s,
- keep-lists with measured edges,
- crossfaded joins,
- one point per clip, getting more valuable as it goes.

The re-cuts ran 58.7s, 49.1s and 38.1s (from 62-64s).
