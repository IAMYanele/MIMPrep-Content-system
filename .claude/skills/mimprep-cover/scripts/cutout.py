"""Cut a person out of a real frame (original pixels, alpha-matted hair). The person is never altered.
Also reports where her arms touch the frame edges: cover.py runs those straight cut edges off the canvas.
--model isnet (isnet-general-use) holds dark clothes and hair better than the default u2net; if it still leaves
see-through holes in her top, run solidify.py next.
usage: python cutout.py <frame> <x0,y0,x1,y1> <out.png> [--model u2net|isnet]"""
import argparse
import numpy as np, cv2
from PIL import Image
from rembg import remove, new_session
ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("box"); ap.add_argument("out")
ap.add_argument("--model", default="u2net", choices=["u2net", "isnet"])
args = ap.parse_args()
src, box, out = args.src, tuple(int(v) for v in args.box.split(",")), args.out
im = Image.open(src).convert("RGB").crop(box); W, H = im.size
sc = 1400 / max(W, H); small = im.resize((round(W * sc), round(H * sc)), Image.LANCZOS)
model = {"u2net": "u2net", "isnet": "isnet-general-use"}[args.model]
a = np.asarray(remove(small, session=new_session(model), only_mask=True, alpha_matting=True, alpha_matting_foreground_threshold=240,
                      alpha_matting_background_threshold=15, alpha_matting_erode_size=8)).astype(np.float32) / 255
n, lab, st, _ = cv2.connectedComponentsWithStats((a > .5).astype(np.uint8))
a *= cv2.dilate((lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8), np.ones((15, 15), np.uint8))   # biggest blob = her
a = cv2.resize(a, (W, H), interpolation=cv2.INTER_CUBIC).clip(0, 1)
rgba = im.convert("RGBA"); rgba.putalpha(Image.fromarray((a * 255).astype(np.uint8))); rgba.save(out)
chk = Image.new("RGBA", rgba.size, (0, 74, 173, 255)); chk.alpha_composite(rgba); chk.convert("RGB").resize((W * 600 // H, 600)).save(out.rsplit(".", 1)[0] + "_check.jpg")
m = a > .5; rows = np.where(m.sum(1) > 20)[0]
touch = [r for r in range(H) if m[r, :3].any() or m[r, -3:].any()]
print(out, f"{W}x{H}", "| head top row", int(rows[0]), "| touches frame edge from row", touch[0] if touch else "never")
