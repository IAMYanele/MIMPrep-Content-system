"""Cut a building out of a blue sky (the fallback subject when nobody in the video faces the camera, e.g. the
IE tower on 2026-11-01). Keys out blue sky, keeps the biggest shape, fills holes, upscales 2x with a light sharpen.
Only crop rows above any burned-in caption: the cut bottom edge runs off the cover anyway.
usage: python sky_cut.py <frame.png> <out.png> <bottom_row>"""
import sys, numpy as np, cv2
from PIL import Image, ImageFilter
src, out, bottom = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = np.asarray(Image.open(src).convert("RGB"))[:bottom].astype(np.int16)
r, b = im[..., 0], im[..., 2]
bld = (~((b - r > 45) & (b > 110))).astype(np.uint8)
bld = cv2.morphologyEx(bld, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(bld, 8)
m = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
H, W = m.shape
n2, lab2, st2, _ = cv2.connectedComponentsWithStats(1 - m, 4)
for i in range(1, n2):                                    # fill holes (sky reflected in the glass)
    x, y, w, h, _ = st2[i]
    if x > 0 and y > 0 and x + w < W and y + h < H: m[lab2 == i] = 1
rgba = Image.fromarray(im.astype(np.uint8)).convert("RGBA"); rgba.putalpha(Image.fromarray(m * 255).filter(ImageFilter.GaussianBlur(0.7)))
x, y, w, h = cv2.boundingRect(m)
rgba = rgba.crop((max(0, x - 4), 0, min(W, x + w + 4), H)).resize(((min(W, x + w + 4) - max(0, x - 4)) * 2, H * 2), Image.LANCZOS)
al = rgba.split()[3]; rgba = rgba.convert("RGB").filter(ImageFilter.UnsharpMask(2, 60, 2)).convert("RGBA"); rgba.putalpha(al); rgba.save(out)
chk = Image.new("RGBA", rgba.size, (241, 241, 241, 255)); chk.alpha_composite(rgba); chk.convert("RGB").save(out[:-4] + "_check.jpg", quality=90)
print(out, rgba.size)
