"""Lay out carousel slide text in the MiM Prep / thomas_d_c carousel style.

Style (from refs/carousel-style): 3:4 slides, full-bleed photo, soft dark fade behind the text,
bold tight Neue Haas Grotesk headline + light Neue Haas Grotesk body, white, centred, tight leading.
Cover: a red hand-drawn circle around one word.

For each slide in slides.json it writes, under <carousel>/build/:
  sNN-base.png      the photo + the dark fade where the text sits (the photo itself is not edited)
  sNN-guide.png     the exact text, positions and sizes on plain grey: the brief for Nano Banana
  sNN-textmask.png  where the letters should be (used to check Nano Banana's spelling/placement)
  sNN-preview.png   base + text set directly in code, for comparison
  sNN-circle.png    (cover only) the red hand-drawn circle, as RGBA, composited last

usage: python scripts/carousel_layout.py carousel/<name>
"""
import json, math, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FD = "C:/Users/yanel/AppData/Local/Microsoft/Windows/Fonts/"
HAAS = FD + "NHaasGroteskTXPro-Rg.ttf"
W, H, MARGIN = 1080, 1440, 60
# size, tracking (px at that size), line height, faux-bold stroke (Haas has no bold installed)
STYLES = {
    "cover": dict(size=118, track=-0.045, lh=1.0, bold=0.024),
    "head":  dict(size=76, track=-0.04, lh=1.03, bold=0.024),
    "cta":   dict(size=76, track=-0.04, lh=1.0, bold=0.024),
    "body":  dict(size=41, track=-0.03, lh=1.13, bold=0.0),
}
GAP = 0.55   # gap between blocks, as a fraction of the body size

def measure(text, font, track):
    d = ImageDraw.Draw(Image.new("L", (1, 1)))
    return sum(d.textlength(c, font=font) + track for c in text) - track

def wrap(text, font, track, maxw):
    lines, cur = [], ""
    for w in text.split(" "):
        t = (cur + " " + w).strip()
        if measure(t, font, track) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur)
    return lines

def balance(text, font, track, maxw):
    """Wrap, then narrow the measure so lines come out even (no lonely last word)."""
    lines = wrap(text, font, track, maxw)
    n, w = len(lines), maxw
    while n > 1 and w > maxw * 0.55:
        trial = wrap(text, font, track, w - 10)
        if len(trial) > n: break
        lines, w = trial, w - 10
    return lines

def layout(slide, scale):
    items, y = [], 0
    for b in slide["blocks"]:
        st = STYLES[b["style"]]; size = round(st["size"] * scale)
        font = ImageFont.truetype(HAAS, size); track = st["track"] * size
        maxw = (W - 2 * MARGIN) * (0.86 if b["style"] == "body" else 1.0)
        for ln in balance(b["text"], font, track, maxw):
            x = (W - measure(ln, font, track)) / 2
            items.append(dict(x=x, y=y, text=ln, font=font, track=track, stroke=round(st["bold"] * size), style=b["style"]))
            y += round(size * st["lh"])
        y += round(STYLES["body"]["size"] * scale * GAP)
    total = y - round(STYLES["body"]["size"] * scale * GAP)
    y0 = slide["y"] if slide["zone"] == "top" else slide["y"] - total
    for it in items: it["y"] += y0
    return items, y0, y0 + total

def fit(slide):
    """Largest scale (<= 1) at which the text stays clear of the face/subject (slide['limit'])."""
    scale = 1.0
    while scale > 0.6:
        items, top, bottom = layout(slide, scale)
        ok = bottom <= slide["limit"] if slide["zone"] == "top" else top >= slide["limit"]
        if ok: break
        scale -= 0.02
    return items, top, bottom, scale

def draw_text(items, size=(W, H)):
    m = Image.new("L", size, 0); d = ImageDraw.Draw(m)
    for it in items:
        x = it["x"]
        for c in it["text"]:
            d.text((x, it["y"]), c, font=it["font"], fill=255, stroke_width=it["stroke"], stroke_fill=255)
            x += d.textlength(c, font=it["font"]) + it["track"]
    return m

def word_box(items, word):
    d = ImageDraw.Draw(Image.new("L", (1, 1)))
    for it in items:
        i = it["text"].find(word)
        if i < 0: continue
        x0 = it["x"] + measure(it["text"][:i], it["font"], it["track"]) + (it["track"] if i else 0)
        x1 = x0 + measure(word, it["font"], it["track"])
        b = d.textbbox((0, it["y"]), word, font=it["font"])
        return x0, b[1], x1, b[3]
    raise ValueError(f"circle word {word!r} not found")

def hand_circle(box, color=(226, 45, 38)):
    """A red marker loop around a word, drawn like the examples: slightly tilted, overshooting its start."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2 + 2
    rx, ry = (x1 - x0) / 2 + 26, (y1 - y0) / 2 + 24
    big = 4
    im = Image.new("RGBA", (W * big, H * big), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    rot = math.radians(-4)
    pts = []
    for k in range(0, 401):
        t = math.radians(200 + k * 0.98)                     # ~392 degrees: the loop overshoots
        wob = 1 + 0.035 * math.sin(3 * t) + 0.02 * math.sin(5 * t + 1)
        drift = 1 + 0.06 * (k / 400)                          # end sits a little outside the start
        px, py = rx * wob * drift * math.cos(t), ry * wob * drift * math.sin(t)
        pts.append(((cx + px * math.cos(rot) - py * math.sin(rot)) * big,
                    (cy + px * math.sin(rot) + py * math.cos(rot)) * big))
    for k in range(len(pts) - 1):
        w = (5.5 + 2.5 * math.sin(math.pi * k / len(pts))) * big   # thicker mid-stroke, like a marker
        d.line([pts[k], pts[k + 1]], fill=color + (255,), width=round(w))
        d.ellipse([pts[k][0] - w / 2, pts[k][1] - w / 2, pts[k][0] + w / 2, pts[k][1] + w / 2], fill=color + (255,))
    return im.resize((W, H), Image.LANCZOS)

def fade(zone, top, bottom, photo):
    """Dark fade behind the text; stronger when the photo is bright there, so white text always reads."""
    lum = np.asarray(photo.convert("L"), np.float32)[max(0, top):min(H, bottom)].mean()
    strength = float(np.clip(0.62 + (lum - 90) / 260, 0.62, 0.86))
    ys = np.arange(H, dtype=np.float32)
    if zone == "top":
        a = np.clip(1 - (ys - top) / max(bottom - top + 330, 1), 0, 1)
    else:
        a = np.clip(1 - (bottom - ys) / max(bottom - top + 330, 1), 0, 1)
    return (a ** 1.35 * strength)[:, None].repeat(W, 1)

def main(cdir):
    cdir = Path(cdir); spec = json.loads((cdir / "slides.json").read_text(encoding="utf-8"))
    out = cdir / "build"; out.mkdir(exist_ok=True)
    for s in spec["slides"]:
        n = f"s{s['n']:02d}"
        photo = Image.open(cdir / s["frame"]).convert("RGB")
        items, top, bottom, scale = fit(s)
        a = fade(s["zone"], top, bottom, photo)
        if s.get("fade"):   # per-slide override: smooth ramp from 'start' to full strength at 'full'
            f = s["fade"]; ys = np.arange(H, dtype=np.float32)
            r = np.clip((ys - f["start"]) / (f["full"] - f["start"]), 0, 1) if s["zone"] == "bottom"                 else np.clip((f["start"] - ys) / (f["start"] - f["full"]), 0, 1)
            r = r * r * (3 - 2 * r)                                   # smoothstep, no visible edge
            a = (r * f["strength"])[:, None].repeat(W, 1)
        base = Image.fromarray((np.asarray(photo, np.float32) * (1 - a[..., None])).round().astype(np.uint8))
        base.save(out / f"{n}-base.png")
        mask = draw_text(items); mask.save(out / f"{n}-textmask.png")
        guide = Image.new("RGB", (W, H), (70, 70, 74)); guide.paste((255, 255, 255), (0, 0), mask); guide.save(out / f"{n}-guide.png")
        shadow = mask.filter(ImageFilter.GaussianBlur(7)).point(lambda v: int(v * 0.45))
        prev = base.copy(); prev.paste((0, 0, 0), (0, 0), shadow); prev.paste((255, 255, 255), (0, 0), mask)
        if s.get("circle"):
            circ = hand_circle(word_box(items, s["circle"])); circ.save(out / f"{n}-circle.png")
            prev = Image.alpha_composite(prev.convert("RGBA"), circ).convert("RGB")
        prev.save(out / f"{n}-preview.png")
        print(n, f"text y {top}-{bottom}  scale {scale:.2f}  lines {len(items)}")

if __name__ == "__main__":
    main(sys.argv[1])
