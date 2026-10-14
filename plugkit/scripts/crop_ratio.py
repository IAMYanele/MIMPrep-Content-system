"""Crop a photo to a portrait ratio around a chosen centre, then resize. Crop + resize only; pixels are not edited.
usage: python scripts/crop_ratio.py SRC OUT CX CY [W H]   (CX, CY = crop centre, fractions 0-1; default 1080x1440 = 3:4)"""
import sys
from PIL import Image, ImageOps
import pillow_heif; pillow_heif.register_heif_opener()
src, out, cx, cy = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
OW, OH = (int(sys.argv[5]), int(sys.argv[6])) if len(sys.argv) > 6 else (1080, 1440)
r = OW / OH
im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
W, H = im.size
cw, ch = (W, round(W / r)) if W / H < r else (round(H * r), H)
l = min(max(0, round(cx * W - cw / 2)), W - cw); t = min(max(0, round(cy * H - ch / 2)), H - ch)
im.crop((l, t, l + cw, t + ch)).resize((OW, OH), Image.LANCZOS).save(out)
print(out, (l, t, cw, ch))
