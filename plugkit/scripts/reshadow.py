"""Keep Nano Banana's letters but replace its shadow with an even, soft one.
usage: python scripts/reshadow.py BASE RAW EXPECT OUT [opacity] [blur]"""
import sys
from pathlib import Path
import numpy as np, cv2
from PIL import Image
sys.path.insert(0, str(Path(__file__).parent))
from add_text import align, text_mask
base_p, raw_p, exp_p, out_p = sys.argv[1:5]
op = float(sys.argv[5]) if len(sys.argv) > 5 else 0.55
blur = float(sys.argv[6]) if len(sys.argv) > 6 else 9
base_im = Image.open(base_p).convert("RGB"); base = np.asarray(base_im).astype(np.float32)
expect = np.asarray(Image.open(exp_p).convert("L"))
gen = align(np.asarray(Image.open(raw_p).convert("RGB").resize(base_im.size, Image.LANCZOS)), base.astype(np.uint8), expect).astype(np.float32)
_, keep = text_mask(gen.astype(np.uint8), base.astype(np.uint8), expect)
# letter alpha: bright pixels of Nano Banana's text, only right where the letters belong
region = cv2.dilate((expect > 127).astype(np.uint8), np.ones((9, 9), np.uint8)).astype(np.float32)
lum = gen.mean(2)
letters = np.clip((lum - 120) / 100, 0, 1) * region
shadow = cv2.GaussianBlur(cv2.dilate(keep, np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), blur)
shadow = np.roll(shadow, 3, axis=0)                                        # slight drop
shadow = np.clip(shadow / max(shadow.max(), 1e-6) * 1.6, 0, 1) * op
res = base * (1 - shadow[..., None])                                       # even dark halo
res = res * (1 - letters[..., None]) + gen * letters[..., None]            # Nano Banana's letters on top
Image.fromarray(res.clip(0, 255).round().astype(np.uint8)).save(out_p, quality=95)
print("saved", out_p)
