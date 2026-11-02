"""Put a real person on a background plate so it reads as one photo. Only the PLATE is adjusted: brightness and colour
matched to the room she was filmed in, portrait-mode depth blur, the footage's grain. Her pixels stay untouched.
usage: python composite.py <frame> <x0,y0,x1,y1> <plate.png> <out.png> [blur=4.5]"""
import sys
import numpy as np, cv2
from PIL import Image, ImageOps
from rembg import remove, new_session
src, box, plate, out = sys.argv[1], tuple(int(v) for v in sys.argv[2].split(",")), sys.argv[3], sys.argv[4]
BLUR = float(sys.argv[5]) if len(sys.argv) > 5 else 4.5
im = Image.open(src).convert("RGB").crop(box); W, H = im.size; o = np.asarray(im).astype(np.float32)
a = np.asarray(remove(im, session=new_session("u2net"), only_mask=True, alpha_matting=True, alpha_matting_foreground_threshold=240,
                      alpha_matting_background_threshold=15, alpha_matting_erode_size=8)).astype(np.float32) / 255
n, lab, st, _ = cv2.connectedComponentsWithStats((a > .5).astype(np.uint8))
a *= cv2.dilate((lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8), np.ones((25, 25), np.uint8))
p = np.asarray(ImageOps.fit(Image.open(plate).convert("RGB"), (W, H), Image.LANCZOS)).astype(np.float32)
bg = a < .05
ol, pl = (cv2.cvtColor(x.astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32) for x in (o, p))
for c, wgt in ((0, .85), (1, .5), (2, .5)): pl[..., c] += wgt * (ol[..., c][bg].mean() - pl[..., c].mean())   # match the room's light
p = cv2.GaussianBlur(cv2.cvtColor(np.clip(pl, 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB).astype(np.float32), (0, 0), BLUR)
hp = o - cv2.GaussianBlur(o, (0, 0), 1.5); sigma = float(np.median(np.abs(hp[bg]))) * 1.48
p += np.random.default_rng(1).normal(0, sigma, p.shape[:2])[..., None]                                        # same grain as the footage
edge = (a * (1 - a) * 4)[..., None]; fg = o * (1 - .25 * edge) + cv2.GaussianBlur(p, (0, 0), 12) * .25 * edge   # light wrap on the hair edge
A = a[..., None]; Image.fromarray(np.clip(fg * A + p * (1 - A), 0, 255).astype(np.uint8)).save(out); print(out)
