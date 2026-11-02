"""Tidy a cutout's edge. Only the alpha changes, never her pixels. Steps run in this order, each optional:

  --blob            keep only the biggest connected shape (drops stray bits of furniture, pillows, plants)
  --trim SIDE:PTS   cut everything outside a smooth curve along her hair, e.g. --trim left:540:358,700:296,870:250
                    (y:x points in cutout pixels). Use it for a rough or see-through hair edge, a lump of background
                    caught in her hair, or the white of a window between strands. Stack several --trim flags.
  --erode N         pull the whole edge in by N px (a dark or bright rim left by the old background)

Find the y:x points on a gridded zoom of the cutout (clean.py --grid writes one) before trimming.
usage: python clean.py <cut.png> <out.png> [--blob] [--trim left:y:x,y:x,...] [--erode 2] [--grid x0,y0,x1,y1]"""
import argparse
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--blob", action="store_true")
ap.add_argument("--trim", action="append", default=[])
ap.add_argument("--erode", type=int, default=0)
ap.add_argument("--grid", help="x0,y0,x1,y1: write <out>_grid.jpg, a zoom with pixel coordinates, to find --trim points")
a = ap.parse_args()
p = np.asarray(Image.open(a.src).convert("RGBA")).copy().astype(np.float32)
H, W = p.shape[:2]; xx = np.arange(W)
if a.blob:
    n, lab, st, _ = cv2.connectedComponentsWithStats((p[..., 3] > 100).astype(np.uint8), 8)
    keep = cv2.dilate((lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8), np.ones((15, 15), np.uint8))
    p[..., 3] *= keep
for t in a.trim:
    side, pts = t.split(":", 1)
    yx = sorted(tuple(int(v) for v in q.split(":")) for q in pts.split(","))
    ys = np.array([q[0] for q in yx]); xs = np.array([q[1] for q in yx], float)
    for y in range(max(0, ys[0]), min(H, ys[-1] + 1)):
        e = np.interp(y, ys, xs)
        k = (xx - e) / 2.5 + 0.5 if side == "left" else (e - xx) / 2.5 + 0.5
        p[y, :, 3] *= np.clip(k, 0, 1)
if a.erode:
    al = Image.fromarray(p[..., 3].clip(0, 255).astype(np.uint8)).filter(ImageFilter.MinFilter(2 * a.erode + 1)).filter(ImageFilter.GaussianBlur(1.2))
    p[..., 3] = np.asarray(al)
out = Image.fromarray(p.clip(0, 255).astype(np.uint8)); out.save(a.out)
for bg, tag in (((0, 74, 173, 255), "blue"), ((241, 241, 241, 255), "white")):
    b = Image.new("RGBA", out.size, bg); b.alpha_composite(out); b.convert("RGB").resize((W * 600 // H, 600)).save(a.out[:-4] + f"_check_{tag}.jpg")
if a.grid:
    x0, y0, x1, y1 = (int(v) for v in a.grid.split(","))
    b = Image.new("RGBA", out.size, (241, 241, 241, 255)); b.alpha_composite(out); z = b.crop((x0, y0, x1, y1)).convert("RGB")
    d = ImageDraw.Draw(z)
    for x in range(0, z.width, 25): d.line([(x, 0), (x, z.height)], fill=(0, 160, 0)); d.text((x + 1, 1), str(x + x0), fill=(255, 0, 0))
    for y in range(0, z.height, 40): d.line([(0, y), (z.width, y)], fill=(0, 160, 255)); d.text((1, y + 1), str(y + y0), fill=(255, 0, 0))
    z.resize((z.width * 3, z.height * 3)).save(a.out[:-4] + "_grid.jpg")
print(a.out)
