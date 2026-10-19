"""Preview several headlines on the real cover plate, side by side, before any Nano Banana call.

Uses the exact layout code from cover_layout.py (same font, sizes, hair overlap), drawn
with plain PIL, so the user picks words by seeing them on the cover. That's what landed
"THE LONDON / LOOPHOLE": a list of options in chat was rejected because nobody could
picture how they would fit.

usage:
  python mock_options.py --dir build --name a --out options.jpg \
      --opt "THE LONDON|LOOPHOLE" --opt "THIS IS YOUR|UNFAIR ADVANTAGE" --opt "|UNFAIR/ADVANTAGE"
Each --opt is "KICKER|BIG", BIG may hold two lines split by "/". Mode, placement and head
position come from the plate's <name>-layout.json.
"""
import argparse, json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cover_layout import layout_text, font_path, CREAM, INK  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True); ap.add_argument("--name", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--opt", action="append", required=True)
    a = ap.parse_args()
    d = Path(a.dir)
    lay = json.load(open(d / f"{a.name}-layout.json"))        # written by cover_layout.py
    base = Image.open(d / f"{a.name}-base.png").convert("RGB")
    mask = np.asarray(Image.open(d / f"{a.name}-subject.png")).astype(np.float32) / 255
    placement, head_top = lay["placement"], lay["head_top"]
    occl = mask if placement == "top" else mask * 0
    ink = INK if lay["mode"] == "light" else CREAM
    font = font_path()
    tiles = []
    for n, opt in enumerate(a.opt, 1):
        kicker, _, big = opt.partition("|")
        lines = [l.strip().upper() for l in big.split("/") if l.strip()]
        both, mt, kl, _ = layout_text(kicker.strip().upper(), lines, head_top, placement, lay["kicker_size"], font)
        im = base.copy()
        im.paste(ink, (0, 0), Image.fromarray((np.asarray(mt).astype(np.float32) * (1 - occl)).astype(np.uint8)))
        im.paste(ink, (0, 0), kl)
        t = im.resize((360, 640))
        ImageDraw.Draw(t).text((10, 8), str(n), fill=(255, 60, 60), font=ImageFont.truetype(font, 34))
        tiles.append(t)
    sheet = Image.new("RGB", (368 * len(tiles) - 8, 640), (255, 255, 255))
    for i, t in enumerate(tiles):
        sheet.paste(t, (i * 368, 0))
    sheet.save(a.out, quality=90)
    print("saved", a.out)


if __name__ == "__main__":
    main()
