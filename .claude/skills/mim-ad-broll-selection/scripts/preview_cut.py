"""Preview exactly what a cutaway will look like: the 9:16 crop, across the whole window.

A single in-point frame is not enough - subjects walk out of frame, cameras pan, and the
crop can land on the wrong person. This renders start / middle / end of the window at the
crop that prep_cutaways.py would use, so the composition can be judged before committing.

Usage: python preview_cut.py <out.jpg> <clip> <in> <dur> <cx|auto> [<clip> <in> <dur> <cx> ...]
"""
import subprocess
import sys

from PIL import Image

OUT = sys.argv[1]
args = sys.argv[2:]
TILE_W = 300

rows = []
for i in range(0, len(args), 4):
    clip, t_in, dur, cx = args[i], float(args[i + 1]), float(args[i + 2]), args[i + 3]
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height", "-of", "csv=p=0", clip],
        capture_output=True, text=True).stdout.strip().splitlines()[0].split(",")
    W, H = int(probe[0]), int(probe[1])
    tiles = []
    for t in (t_in, t_in + dur / 2, t_in + dur - 0.05):
        if W > H:
            cw = int(round(H * 9 / 16)) // 2 * 2
            c = 0.5 if cx == "auto" else float(cx)
            x0 = int(min(max(c * W - cw / 2, 0), W - cw)) // 2 * 2
            vf = f"crop={cw}:{H}:{x0}:0,scale={TILE_W}:-2"
        else:
            vf = f"scale={TILE_W}:-2"
        raw = subprocess.run(
            ["ffmpeg", "-nostdin", "-v", "error", "-ss", f"{t:.3f}", "-i", clip,
             "-frames:v", "1", "-vf", vf, "-f", "image2pipe", "-vcodec", "mjpeg", "-"],
            capture_output=True).stdout
        if raw:
            import io
            tiles.append(Image.open(io.BytesIO(raw)).convert("RGB"))
    if tiles:
        h = max(t.height for t in tiles)
        row = Image.new("RGB", (TILE_W * len(tiles), h), (20, 20, 20))
        for k, t in enumerate(tiles):
            row.paste(t, (k * TILE_W, 0))
        rows.append((clip.split("/")[-1], t_in, cx, row))

if rows:
    w = max(r[3].width for r in rows)
    h = sum(r[3].height for r in rows)
    sheet = Image.new("RGB", (w, h), (20, 20, 20))
    y = 0
    for name, t_in, cx, row in rows:
        sheet.paste(row, (0, y))
        y += row.height
        print(f"row: {name}  in {t_in}  cx {cx}")
    sheet.save(OUT, quality=88)
    print(f"-> {OUT}  (start / middle / end of each window)")
