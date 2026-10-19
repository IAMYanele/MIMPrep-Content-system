"""Composite Nano Banana's lettering onto the untouched plate, correcting any offset it drew the text at.

Nano Banana redraws the whole image, so only the letters are taken from its output: the
photo is aligned, the new ink is isolated, slid back onto the planned layout if it was
drawn too high or low (it once drew a block 102px high), and pasted onto the original
plate. Thomas's hair is put back in front of the big word.

usage:
  python shift_composite.py --dir build --name a --out "final/Cover.jpg" [--ink dark] [--fill]

--ink dark   near-black lettering on a light photo (cover_layout.py --mode light)
--fill       fill letters solid from the layout where they cross a pale area and came out
             see-through (only applied when the match is >= 0.95)
Writes check_full.jpg (half size) and check_zoom.jpg (the text band) next to the output.
"""
import argparse, sys
from pathlib import Path
import numpy as np, cv2
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_text import align  # noqa: E402

W, H = 1080, 1920


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True); ap.add_argument("--name", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--ink", choices=["cream", "dark"], default="cream")
    ap.add_argument("--fill", action="store_true")
    a = ap.parse_args()

    P = lambda s: Path(a.dir) / f"{a.name}-{s}"
    base = np.asarray(Image.open(P("base.png")).convert("RGB")).astype(np.float32)
    gen0 = np.asarray(Image.open(P("nb.nanobanana-raw.png")).convert("RGB").resize((W, H), Image.LANCZOS))
    exp = (np.asarray(Image.open(P("textmask.png")).convert("L")) > 127).astype(np.float32)
    rows = np.where(exp.any(1))[0]
    y0, y1 = max(0, rows.min() - 250), min(H, rows.max() + 250)
    ex = np.zeros((H, W), np.uint8); ex[y0:y1] = 255
    g = align(gen0, base.astype(np.uint8), ex).astype(np.float32)        # line up the photo, ignoring the text band

    L = cv2.cvtColor(g.astype(np.uint8), cv2.COLOR_RGB2LAB)[..., 0].astype(np.float32)
    Lb = cv2.cvtColor(base.astype(np.uint8), cv2.COLOR_RGB2LAB)[..., 0].astype(np.float32)
    ink = np.clip(((Lb - L) if a.ink == "dark" else (L - Lb)) - 25, 0, None) / 60
    ink = np.clip(ink, 0, 1); ink[:y0] = 0; ink[y1:] = 0
    ink = cv2.GaussianBlur(ink, (0, 0), 0.6)

    best = (-1, 0, 0)
    for dy in range(-400, 402, 2):
        for dx in range(-30, 31, 3):
            s = cv2.warpAffine(ink, np.float32([[1, 0, dx], [0, 1, dy]]), (W, H))
            ov = (s * exp).sum() / (np.sqrt((s * s).sum() * (exp * exp).sum()) + 1e-6)
            if ov > best[0]:
                best = (ov, dx, dy)
    ov, dx, dy = best
    print(f"text offset corrected: dx={dx} dy={dy}, match {ov:.2f}")
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    a_s = cv2.warpAffine(ink, M, (W, H))[..., None]
    g_s = cv2.warpAffine(g, M, (W, H))
    if a.fill and ov >= 0.95:
        fill = cv2.GaussianBlur(cv2.erode(exp, np.ones((3, 3), np.uint8)), (0, 0), 0.7)[..., None]
        colour = np.median(g_s[(a_s[..., 0] > 0.9) & (exp > 0.5)], axis=0)
        g_s = np.where(fill > a_s, colour, g_s); a_s = np.maximum(a_s, fill)
    out = base * (1 - a_s) + g_s * a_s

    subj = np.asarray(Image.open(P("subject.png"))).astype(np.float32) / 255
    mt = cv2.dilate(np.asarray(Image.open(P("masthead.png"))), np.ones((25, 25), np.uint8)).astype(np.float32) / 255
    occ = (subj * mt)[..., None]
    out = out * (1 - occ) + base * occ                                   # hair stays in front of the big word

    img = Image.fromarray(np.clip(out, 0, 255).round().astype(np.uint8))
    outp = Path(a.out); outp.parent.mkdir(parents=True, exist_ok=True)
    img.save(outp, quality=95)
    img.resize((540, 960)).save(outp.parent / "check_full.jpg", quality=90)
    img.crop((20, max(0, rows.min() - 80), W - 20, rows.max() + 80)).save(outp.parent / "check_zoom.jpg", quality=90)
    print("saved", outp)
    if ov < 0.9:
        print("WARNING: lettering does not match the layout well. Look at check_zoom.jpg before using it.")


if __name__ == "__main__":
    main()
