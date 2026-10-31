"""Draw the crop each panel will use on its source frame, plus the cropped result, one row per panel.
usage: python cropcheck.py <out.jpg> <panels.json>
panels.json: [{"src": .., "in": .., "dur": .., "n": 1|2|3, "cx": .5, "cy": .5, "zoom": 1.0}, ...]
"""
import json, subprocess, sys
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, __import__("os").path.dirname(__file__))
from bake import crop_box, probe

font = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 16)
rows = []
for p in json.load(open(sys.argv[2])):
    W, H = probe(p["src"])
    for frac in (0.1, 0.9):
        t = p["in"] + p.get("dur", 2) * frac
        png = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", p["src"], "-frames:v", "1", "-f", "image2pipe",
                              "-vcodec", "png", "-"], capture_output=True).stdout
        im = Image.open(BytesIO(png)).convert("RGB")
        x, y, w, h = crop_box(W, H, p.get("n", 1), p.get("cx", .5), p.get("cy", .5), p.get("zoom", 1))
        crop = im.crop((x, y, x + w, y + h))
        pw, ph = 1080, 1920 // p.get("n", 1)
        crop = crop.resize((300 * pw // ph, 300))
        small = im.resize((300 * W // H, 300))
        s = 300 / H
        ImageDraw.Draw(small).rectangle([x * s, y * s, (x + w) * s, (y + h) * s], outline=(255, 0, 0), width=3)
        ImageDraw.Draw(small).line([(x + w / 2) * s, y * s, (x + w / 2) * s, (y + h) * s], fill=(0, 255, 0), width=1)
        row = Image.new("RGB", (small.width + crop.width + 10, 320), (20, 20, 20))
        row.paste(small, (0, 20)); row.paste(crop, (small.width + 10, 20))
        ImageDraw.Draw(row).text((4, 1), f"{p['src'].split('/')[-1]} t={t:.1f} n={p.get('n', 1)} cx={p.get('cx', .5)} cy={p.get('cy', .5)} z={p.get('zoom', 1)}",
                                 fill=(255, 255, 0), font=font)
        rows.append(row)
cols = 2
Wm = max(r.width for r in rows)
sheet = Image.new("RGB", (Wm * cols, 320 * ((len(rows) + cols - 1) // cols)), (0, 0, 0))
for i, r in enumerate(rows):
    sheet.paste(r, ((i % cols) * Wm, (i // cols) * 320))
sheet.save(sys.argv[1], quality=82)
print(sys.argv[1], len(rows))
