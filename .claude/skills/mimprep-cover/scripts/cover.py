"""Lay out a MiM Prep reel cover (1080x1920): the dot-grid page in MiM blue or white, the logo, the headline,
and the cutout rising from the bottom edge. Nothing else goes on the page: no shapes, no pills, no photo
backgrounds (all rejected; see references/style.md).

Layouts:
  plain       white paper + grey dots, blue text, cutout under the headline.
  bluepage    MiM-blue page + blue dots, white text, cutout under the headline.
  behind      white page; the last headline line tucks behind the top of her head (approved 2026-10-29).
  bluebehind  the same on the blue page.

usage:
  python cover.py --layout plain    --person cut-g.png --lines "9 free courses|worth opening" --out A.jpg
  python cover.py --layout bluepage --person cut-g.png --kicker "What actually got me into" --lines "LBS" --out B.jpg
  python cover.py --layout bluepage --person tower.png --center-bbox --head-w 100 --head-y 820 --lines "Are IE students|lazy?" --out C.jpg
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(__file__))
from common import W, H, BLUE, PAPER, DOT, GRID_SAFE, bold, serif, logo

ap = argparse.ArgumentParser()
ap.add_argument("--layout", required=True, choices=["plain", "bluepage", "behind", "bluebehind"])
ap.add_argument("--person", required=True, help="RGBA cutout (cutout.py, then clean.py / grade.py)")
ap.add_argument("--kicker", default="", help="small italic line above the headline; only when the headline needs it")
ap.add_argument("--lines", required=True, help="headline lines separated by |")
ap.add_argument("--head-w", type=int, default=380, help="plain/bluepage: her head (hair) width on the canvas, px")
ap.add_argument("--head-y", type=int, default=0, help="where the top of her head lands (0 = just under the headline)")
ap.add_argument("--center-bbox", action="store_true", help="centre the cutout on its full width (objects like a building)")
ap.add_argument("--out", required=True)
a = ap.parse_args()
lines = a.lines.split("|")
blue = a.layout in ("bluepage", "bluebehind")
ink = "white" if blue else BLUE
notes = []          # (top, bottom, text) of every text element, for the grid-safe check


def page():
    c = Image.new("RGBA", (W, H), (BLUE if blue else PAPER) + (255,))
    d = ImageDraw.Draw(c)
    dot, r = ((28, 96, 188), 3) if blue else (DOT, 2)           # blue page: subtle polka dots (brighter ones read as too high-contrast)
    for y in range(24, H, 36):
        for x in range(24, W, 36):
            d.ellipse((x - r, y - r, x + r, y + r), fill=dot)
    lg = logo()
    if blue:
        alpha = lg.split()[3]
        lg = Image.new("RGBA", lg.size, (255, 255, 255, 255))
        lg.putalpha(alpha)
    w = 180
    lg = lg.resize((w, round(lg.height * w / lg.width)), Image.LANCZOS)
    c.alpha_composite(lg, ((W - w) // 2, 255))
    return c


def ctext(d, y, t, f, fill, track=0, stroke=0):
    tw = sum(d.textlength(ch, font=f) + track for ch in t) - track
    x = (W - tw) / 2
    for ch in t:
        d.text((x, y), ch, font=f, fill=fill, stroke_width=stroke, stroke_fill=fill)
        x += d.textlength(ch, font=f) + track
    bb = d.textbbox((0, y), t, font=f)
    notes.append((bb[1], bb[3], t))


def headtop(p):
    m = np.asarray(p.split()[3]) > 128
    return int(np.where(m.sum(1) > 20)[0][0])


def face_cx(p):
    """Horizontal centre of her head: the opaque columns just below the head top."""
    m = np.asarray(p.split()[3]) > 128
    t = headtop(p)
    band = m[t:t + max(20, p.height // 8)]
    return float(np.where(band.any(0))[0].mean())


def head_width(p):
    m = np.asarray(p.split()[3]) > 128
    t = headtop(p)
    band = m[t + p.height // 40: t + p.height // 12]
    return float(np.median(band.sum(1)))


def defringe(p):
    """Pull the old background out of her soft hair edge: semi-transparent pixels take the colour of the
    nearby opaque pixels (premultiplied blur), and the alpha is tightened by a pixel. Her pixels are not moved."""
    arr = np.asarray(p).astype(np.float32)
    al = arr[..., 3:] / 255
    k = max(3, round(p.width / 400)) | 1
    num = np.asarray(Image.fromarray((arr[..., :3] * al).clip(0, 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(k))).astype(np.float32)
    den = np.asarray(Image.fromarray((al[..., 0] * 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(k))).astype(np.float32)[..., None] / 255
    inner = num / np.maximum(den, 1e-3)
    edge = (al < 0.97) & (al > 0)
    arr[..., :3] = np.where(edge, inner, arr[..., :3])
    a2 = Image.fromarray(arr[..., 3].astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = Image.fromarray(arr.clip(0, 255).astype(np.uint8))
    out.putalpha(a2)
    return out


c = page()
d = ImageDraw.Draw(c)
p0 = defringe(Image.open(a.person).convert("RGBA"))
m = np.asarray(p0.split()[3]) > 128
touch_l, touch_r = m[:, :3].any(), m[:, -3:].any()
h0, fx = headtop(p0), face_cx(p0)

if a.layout in ("plain", "bluepage"):
    yy = 400
    if a.kicker:
        ctext(d, yy, a.kicker, serif(72), ink)
        yy += 96
    size = 124 if max(len(t) for t in lines) <= 13 else 108
    for t in lines:
        ctext(d, yy, t, bold(size), ink, track=-4, stroke=1)
        yy += round(size * 1.12)
    head_y = a.head_y or yy + 10                          # her hair starts just under the headline
    s = a.head_w / head_width(p0)
    s = max(s, (H - head_y) / (p0.height - h0))           # her frame's bottom edge runs off the canvas
    if touch_l or touch_r:
        s = max(s, W / p0.width)                          # side cut edges must also run off the canvas
    p = p0.resize((round(p0.width * s), round(p0.height * s)), Image.LANCZOS)
    x, y = round(W / 2 - fx * s), round(head_y - h0 * s)
    if a.center_bbox: x = (W - p.width) // 2                # an object (building) is centred on its full width, not its top
    if touch_l: x = min(x, 0)
    if touch_r: x = max(x, W - p.width)
    c.alpha_composite(p.crop((0, 0, p.width, min(p.height, H - y))), (x, y))

else:                                                     # behind / bluebehind
    s = W / p0.width                                      # full width: the arm edges run off the canvas
    p = p0.resize((round(p0.width * s), round(p0.height * s)), Image.LANCZOS)
    head_y = a.head_y or 800
    x, y = 0, round(head_y - h0 * s)
    ht = y + round(h0 * s)
    f = bold(150)
    cap = d.textbbox((0, 0), "H", font=f)
    ch = cap[3] - cap[1]
    gap = round(ch * 1.25)
    ylast = ht + round(ch * 0.18) - ch                    # the last line tucks just behind the top of her head
    ys = [ylast - gap * (len(lines) - 1 - i) for i in range(len(lines))]
    if a.kicker:
        ctext(d, ys[0] - cap[1] - 100, a.kicker, serif(76), ink)
    for t, yt in zip(lines, ys):
        ctext(d, yt - cap[1], t, f, ink, track=-5, stroke=1)
    c.alpha_composite(p.crop((0, 0, p.width, min(p.height, H - y))), (x, y))

print(f"scale {s:.2f}x (source {p0.width}x{p0.height})")
c.convert("RGB").save(a.out, quality=95)
bad = [t for y0, y1, t in notes if y0 < GRID_SAFE[0] or y1 > GRID_SAFE[1]]
print(a.out, "| WARNING, outside the profile-grid crop:" if bad else "| all text inside the profile-grid crop", bad if bad else "")
