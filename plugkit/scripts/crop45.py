"""Crop a photo to 4:5 (1080x1350) around a chosen centre. Crop + resize only; pixels are not edited.
usage: python scripts/crop45.py SRC OUT CX CY   (CX, CY = crop centre as fractions 0-1)"""
import sys
from PIL import Image, ImageOps
import pillow_heif; pillow_heif.register_heif_opener()
src, out, cx, cy = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
W, H = im.size
cw, ch = (W, round(W * 1.25)) if W / H < 0.8 else (round(H * 0.8), H)
cw, ch = min(cw, W), min(ch, H)
l = min(max(0, round(cx * W - cw / 2)), W - cw); t = min(max(0, round(cy * H - ch / 2)), H - ch)
im.crop((l, t, l + cw, t + ch)).resize((1080, 1350), Image.LANCZOS).save(out)
print(out, (l, t, cw, ch))
