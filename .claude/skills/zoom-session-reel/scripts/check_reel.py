"""Checks a finished 9:16 session reel before it's delivered, and writes a frame sheet to look at.

  decode   the file decodes start to end (a read hiccup on F: once truncated a render silently)
  green    no Zoom speaker-border green in the student panel (it bled into the mosaic/blur once)
  sheet    <reel>.check.png: frames at 1s, 5s, 9.75s (title fading), 10.5s, mid and end

usage: python check_reel.py "<reel 9x16 - TITLE - mosaic.mp4>" ["<more reels>" ...]
"""
import subprocess, sys
import cv2, numpy as np

bad = 0
for reel in sys.argv[1:]:
    err = subprocess.run(["ffmpeg", "-v", "error", "-i", reel, "-f", "null", "-"], capture_output=True, text=True).stderr.strip()
    cap = cv2.VideoCapture(reel); fps = cap.get(cv2.CAP_PROP_FPS) or 30; n = 0; green = 0
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        n += 1
        b = fr[fr.shape[0] // 2:].astype(int)
        green += int(((b[..., 1] - b[..., 2] > 25) & (b[..., 1] - b[..., 0] > 40)).sum() > 400)
    dur = n / fps
    tiles = []
    for t in (1, 5, 9.75, 10.5, dur / 2, max(0, dur - 1)):
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, fr = cap.read()
        if ok:
            tiles.append(cv2.resize(fr, (270, 480)))
    if tiles:
        cv2.imwrite(reel.rsplit(".", 1)[0] + ".check.png", np.hstack(tiles))
    ok = not err and green == 0
    bad += not ok
    print(f"{'OK  ' if ok else 'FAIL'} {reel}: {dur:.1f}s, {'decodes clean' if not err else 'DECODE ERRORS ' + err[:120]}, "
          f"green-tinted frames in the student panel: {green}")
sys.exit(1 if bad else 0)
