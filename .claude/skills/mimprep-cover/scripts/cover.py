"""Lay out a MiM Prep reel cover (1080x1920) on clean MiM paper in brand blue.

Layouts (all approved by the team, 2026-10-20):
  arch    girl cutout in front of a MiM-blue arch exactly as wide as she is, so the straight edges where the
          source frame cut her arms become the arch's sides. Head breaks out above the arch.      (Manon)
  circle  girl cutout in front of a blue ringed circle centred on her face; head breaks over its top. (Maria)
  photo   a full real photo (girl composited on a high-end plate) filling the lower half under a soft fade. (Mathilde)
  behind  girl cutout scaled to the full width (arm edges run off the canvas) with the last headline line
          tucked behind the top of her head.
  band    girl cutout in front of a full-width blue band, white pill.

usage:
  python cover.py --layout arch   --person cut.png --kicker "The" --lines "London|Loophole" --pill "for international students" --out a.jpg
  python cover.py --layout circle --person cut.png --kicker "The unfair advantage of a" --lines "Study Here.|Work Here." --pill "UK Masters" --out b.jpg
  python cover.py --layout photo  --photo comp.png --lines "Study in London.|Get hired in London." --pill "The UK Masters advantage" --out c.jpg
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageOps

sys.path.insert(0, os.path.dirname(__file__))
from common import W, H, BLUE, BLUE_L, PAPER, DOT, GRID_SAFE, bold, serif, logo

ap = argparse.ArgumentParser()
ap.add_argument("--layout", required=True, choices=["arch", "circle", "photo", "behind", "band"])
ap.add_argument("--person", help="RGBA cutout from cutout.py (arch/circle/behind/band)")
ap.add_argument("--photo", help="full photo, e.g. composite.py output (photo layout)")
ap.add_argument("--kicker", default="")
ap.add_argument("--lines", required=True, help="headline lines separated by |")
ap.add_argument("--pill", default="")
ap.add_argument("--out", required=True)
ap.add_argument("--head-y", type=int, default=760, help="where the top of her head lands (canvas px)")
ap.add_argument("--width", type=int, default=900, help="arch: arch and person width; circle/band: person width")
a = ap.parse_args()
lines = a.lines.split("|")
notes = []          # (top, bottom, text) of every text element, for the grid-safe check


def paper():
    c = Image.new("RGBA", (W, H), PAPER + (255,))
    d = ImageDraw.Draw(c)
    for y in range(24, H, 36):
        for x in range(24, W, 36):
            d.ellipse((x - 2, y - 2, x + 2, y + 2), fill=DOT)
    lg = logo()
    w = 180
    lg = lg.resize((w, round(lg.height * w / lg.width)), Image.LANCZOS)
    c.alpha_composite(lg, ((W - w) // 2, 255))
    return c


def ctext(d, y, t, f, fill=BLUE, track=0, stroke=0):
    tw = sum(d.textlength(ch, font=f) + track for ch in t) - track
    x = (W - tw) / 2
    for ch in t:
        d.text((x, y), ch, font=f, fill=fill, stroke_width=stroke, stroke_fill=fill)
        x += d.textlength(ch, font=f) + track
    bb = d.textbbox((0, y), t, font=f)
    notes.append((bb[1], bb[3], t))


def pill(c, y, t, f=None, bgc=BLUE, fg="white", pad=(36, 14)):
    f = f or serif(58)
    d = ImageDraw.Draw(c)
    bb = d.textbbox((0, 0), t, font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    h = th + 2 * pad[1] + 8
    x0 = (W - tw) / 2 - pad[0]
    d.rounded_rectangle((x0, y, x0 + tw + 2 * pad[0], y + h), radius=h // 2, fill=bgc)
    d.text(((W - tw) / 2 - bb[0], y + pad[1] - bb[1] + 4), t, font=f, fill=fg)
    notes.append((y, y + h, t))
    return y + h


def headtop(p):
    m = np.asarray(p.split()[3]) > 128
    return int(np.where(m.sum(1) > 20)[0][0])


def face_cx(p):
    """Horizontal centre of her head: the opaque columns just below the head top."""
    m = np.asarray(p.split()[3]) > 128
    t = headtop(p)
    band = m[t:t + max(20, p.height // 8)]
    return float(np.where(band.any(0))[0].mean())


def place(cut, s, head_y, cx=W / 2):
    p = Image.open(cut).convert("RGBA")
    h0, fx = headtop(p), face_cx(p)
    p = p.resize((round(p.width * s), round(p.height * s)), Image.LANCZOS)
    x, y = round(cx - fx * s), round(head_y - h0 * s)
    return p.crop((0, 0, p.width, min(p.height, H - y))), x, y


def headline_top(d, yy=395, size=118, ksize=70):
    if a.kicker:
        ctext(d, yy, a.kicker, serif(ksize))
        yy += 90
    for t in lines:
        ctext(d, yy, t, bold(size), track=-4, stroke=1)
        yy += round(size * 1.12)


c = paper()
d = ImageDraw.Draw(c)

if a.layout == "arch":
    s = a.width / Image.open(a.person).width
    p, x, y = place(a.person, s, a.head_y)
    x = (W - p.width) // 2          # centre the cutout itself, so its cut edges meet the arch's sides
    top = a.head_y + 120
    sh = Image.new("RGBA", (W, H))
    ds = ImageDraw.Draw(sh)
    ds.rounded_rectangle((x, top, x + p.width - 1, H + 500), radius=p.width // 2, fill=BLUE + (255,))
    for r in range(p.width // 2 - 40, 60, -55):
        ds.arc((W // 2 - r, top + p.width // 2 - r, W // 2 + r, top + p.width // 2 + r), 180, 360, fill=BLUE_L + (70,), width=2)
    c.alpha_composite(sh)
    c.alpha_composite(p, (x, y))
    headline_top(d)
    if a.pill:
        pill(c, 1560, a.pill)

elif a.layout == "circle":
    s = a.width / Image.open(a.person).width
    p, x, y = place(a.person, s, a.head_y + 20)
    r = 410
    cy = a.head_y + 20 + r + 20
    sh = Image.new("RGBA", (W, H))
    ds = ImageDraw.Draw(sh)
    ds.ellipse((W // 2 - r, cy - r, W // 2 + r, cy + r), fill=BLUE + (255,))
    for rr in range(r - 45, 80, -55):
        ds.ellipse((W // 2 - rr, cy - rr, W // 2 + rr, cy + rr), outline=BLUE_L + (70,), width=2)
    c.alpha_composite(sh)
    c.alpha_composite(p, (x, y))
    headline_top(d)
    if a.pill:
        pill(c, 1560, a.pill, serif(62))

elif a.layout == "band":
    s = a.width / Image.open(a.person).width
    p, x, y = place(a.person, s, a.head_y + 20)
    sh = Image.new("RGBA", (W, H))
    ds = ImageDraw.Draw(sh)
    ds.rectangle((0, 1240, W, H), fill=BLUE + (255,))
    for yy in range(1270, H, 46):
        ds.line((0, yy, W, yy), fill=BLUE_L + (45,), width=2)
    c.alpha_composite(sh)
    c.alpha_composite(p, (x, y))
    headline_top(d)
    if a.pill:
        pill(c, 1550, a.pill, serif(70), bgc="white", fg=BLUE)

elif a.layout == "behind":
    p0 = Image.open(a.person)
    s = W / p0.width                 # full width: the arm edges run off the canvas
    p, x, y = place(a.person, s, a.head_y + 40)
    x = 0
    ht = y + round(headtop(p0) * s)
    f = bold(150)
    cap = d.textbbox((0, 0), "H", font=f)
    ch = cap[3] - cap[1]
    gap = round(ch * 1.25)
    ylast = ht + round(ch * 0.18) - ch          # the last line tucks just behind the top of her head
    ys = [ylast - gap * (len(lines) - 1 - i) for i in range(len(lines))]
    if a.kicker:
        ctext(d, ys[0] - cap[1] - 100, a.kicker, serif(76))
    for t, yy in zip(lines, ys):
        ctext(d, yy - cap[1], t, f, track=-5, stroke=1)
    c.alpha_composite(p, (x, y))
    if a.pill:
        pill(c, 1560, a.pill)

elif a.layout == "photo":
    ctext(d, 380, lines[0], bold(118), track=-4, stroke=1)
    if len(lines) > 1:
        ctext(d, 530, lines[1], bold(84), fill=BLUE_L, track=-3, stroke=1)
    if a.pill:
        pill(c, 680, a.pill, serif(60))
    top = 860
    im = ImageOps.fit(Image.open(a.photo).convert("RGB"), (W, H - top), Image.LANCZOS, centering=(0.5, 0.3)).convert("RGBA")
    fade = (np.clip(np.arange(H - top) / 160, 0, 1)[:, None] * 255).repeat(W, 1).astype(np.uint8)
    im.putalpha(Image.fromarray(fade))
    c.alpha_composite(im, (0, top))

c.convert("RGB").save(a.out, quality=95)
bad = [t for y0, y1, t in notes if y0 < GRID_SAFE[0] or y1 > GRID_SAFE[1]]
print(a.out, "| WARNING, outside the profile-grid crop:" if bad else "| all text inside the profile-grid crop", bad if bad else "")
