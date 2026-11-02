"""Fill see-through holes in a cutout's alpha inside her body (e.g. a black lace top): union of three models' hard
masks, hole-filled and eroded. Her pixels are not changed, only how opaque they are.
It can pull background objects into the cutout when they touch her (it did on Maria's apartment footage), so check
the _check.jpg and run clean.py afterwards.
usage: python solidify.py <frame> <x0,y0,x1,y1> <cut.png> <out.png>   (same frame and box as cutout.py)"""
import sys, numpy as np, cv2
from PIL import Image
from rembg import remove, new_session
src, box, cut, out = sys.argv[1], tuple(int(v) for v in sys.argv[2].split(",")), sys.argv[3], sys.argv[4]
im = Image.open(src).convert("RGB").crop(box); W, H = im.size
sc = 1400 / max(W, H); small = im.resize((round(W * sc), round(H * sc)), Image.LANCZOS)
ms = [np.asarray(remove(small, session=new_session(m), only_mask=True)).astype(np.float32) / 255 for m in ("u2net_human_seg", "isnet-general-use", "u2net")]
hard = (np.maximum.reduce(ms) > 0.35).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(hard); hard = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
ff = hard.copy(); h, w = ff.shape; m2 = np.zeros((h + 2, w + 2), np.uint8); inv = (1 - ff).copy()
cv2.floodFill(inv, m2, (0, 0), 0); hard = np.maximum(hard, inv)            # fill enclosed holes
core = cv2.erode(hard, np.ones((9, 9), np.uint8))
core = cv2.resize(core.astype(np.float32), (W, H), interpolation=cv2.INTER_LINEAR)
core = cv2.GaussianBlur(core, (0, 0), 3)
p = Image.open(cut).convert("RGBA"); a = np.asarray(p).copy()
a[..., 3] = np.maximum(a[..., 3], (core * 255).clip(0, 255).astype(np.uint8))
Image.fromarray(a).save(out)
chk = Image.new("RGBA", (W, H), (0, 74, 173, 255)); chk.alpha_composite(Image.fromarray(a)); chk.convert("RGB").resize((W * 600 // H, 600)).save(out[:-4] + "_check.jpg")
print(out)
