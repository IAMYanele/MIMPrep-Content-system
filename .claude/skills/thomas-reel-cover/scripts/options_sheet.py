"""Put the finished cover options side by side, each with how it will look in the profile grid.

The top row is the full 9:16 cover; the bottom row is the centre 3:4 crop Instagram shows
on the profile grid. Send this sheet first so the pick is made on both views.

usage:
  python options_sheet.py --out options_sheet.jpg final/A.jpg final/B.jpg final/C.jpg
"""
import argparse
from pathlib import Path
from PIL import Image, ImageDraw


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("covers", nargs="+"); ap.add_argument("--out", required=True)
    a = ap.parse_args()
    tw, th, gh = 360, 640, 480
    sheet = Image.new("RGB", (len(a.covers) * (tw + 12) - 12, 30 + th + 12 + gh + 24), (255, 255, 255))
    d = ImageDraw.Draw(sheet)
    for i, c in enumerate(a.covers):
        im = Image.open(c).convert("RGB").resize((1080, 1920))
        x = i * (tw + 12)
        d.text((x + 4, 8), f"{chr(65 + i)}  {Path(c).stem[:40]}", fill=(0, 0, 0))
        sheet.paste(im.resize((tw, th)), (x, 30))
        sheet.paste(im.crop((0, 240, 1080, 1680)).resize((tw, gh)), (x, 30 + th + 12))
    d.text((4, sheet.height - 18), "top: full cover   bottom: profile-grid crop (centre 3:4)", fill=(90, 90, 90))
    sheet.save(a.out, quality=90)
    print("saved", a.out)


if __name__ == "__main__":
    main()
