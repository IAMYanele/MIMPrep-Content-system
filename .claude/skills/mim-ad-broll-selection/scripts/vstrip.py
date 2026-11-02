"""Vertical (9:16) strips straight from Frame.io scrub sheets, to judge a clip's crop
across its whole length before downloading it. Usage:
   python vstrip.py out.jpg NAME:cx[:hfrac] [NAME:cx[:hfrac] ...]
hfrac < 1 simulates a punch-in (part of the height, centred at 0.55)."""
import os, sys
from PIL import Image, ImageDraw
S = os.environ.get("SCRUB_DIR", "F:/mim-ads-2026-10/scrubs")   # the downloaded scrub sheets
PICKS = [5, 25, 45, 65, 85]
TH = 300; TW = int(round(TH*9/16))
rows = []
for spec in sys.argv[2:]:
    parts = spec.split(":")
    name, cx = parts[0], float(parts[1])
    hf = float(parts[2]) if len(parts) > 2 else 1.0
    im = Image.open(f"{S}/{name}.scrub.webp").convert("RGB")
    tw, th = im.width/10, im.height/10
    row = Image.new("RGB", (TW*len(PICKS), TH+18), (13,13,13))
    d = ImageDraw.Draw(row); d.rectangle([0,0,row.width,18], fill=(0,0,0))
    d.text((4,3), f"{name}  cx {cx}" + (f"  punch {hf}" if hf < 1 else ""), fill=(255,212,0))
    for k,p in enumerate(PICKS):
        tile = im.crop((int((p%10)*tw), int((p//10)*th), int((p%10+1)*tw), int((p//10+1)*th)))
        W, H = tile.size
        ch = H*hf; cw = ch*9/16
        x0 = min(max(cx*W-cw/2, 0), W-cw); y0 = min(max(0.55*H-ch/2, 0), H-ch)
        v = tile.crop((int(x0), int(y0), int(x0+cw), int(y0+ch))).resize((TW,TH))
        dd = ImageDraw.Draw(v); dd.line([TW/2,0,TW/2,TH], fill=(255,214,0), width=1)
        dd.rectangle([0,TH-12,22,TH], fill=(0,0,0)); dd.text((2,TH-12), str(p), fill=(0,255,180))
        row.paste(v,(k*TW,18))
    rows.append(row)
W = max(r.width for r in rows)
s = Image.new("RGB",(W,sum(r.height for r in rows)),(13,13,13)); y=0
for r in rows: s.paste(r,(0,y)); y+=r.height
s.save(sys.argv[1], quality=90); print(sys.argv[1], s.size)
