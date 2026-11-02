"""The approved MiM cover grade (colour only, nothing reshaped): warmer skin, gentle contrast, soft highlight glow,
then a smooth colour boost. Keeps transparency, so grade the cutout before laying it out. Never grade the video.

The boost works on the LAB colour channels and lightly smooths only them, so it lifts colour evenly without the
red blotches an HSV saturation push leaves on compressed 1080p phone footage. --sat 1.25 matches the covers Yanele
approved on 2026-11-02 after "they need to look a bit more saturated"; --sat 1.0 is the old, weaker grade.

usage: python grade.py <in> <out> [<in> <out> ...] [--sat 1.25]"""
import argparse
import numpy as np, cv2
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("pairs", nargs="+", help="in out [in out ...]")
ap.add_argument("--sat", type=float, default=1.25, help="colour boost on top of the warm grade (1.0 = none)")
a = ap.parse_args()


def warm(rgb):
    x = np.clip(rgb.astype(np.float32) / 255 * np.array([1.045, 1.0, 0.95], np.float32), 0, 1)
    x = np.clip(0.5 + (x - 0.5) * 1.10, 0, 1)
    x = (x + 0.06 * np.sin(np.pi * x) * (x > 0.5)).astype(np.float32)
    hsv = cv2.cvtColor(np.clip(x, 0, 1), cv2.COLOR_RGB2HSV); s = hsv[..., 1]
    hsv[..., 1] = np.clip(s + (1 - s) * s * 0.55 + 0.04 * s, 0, 1)
    return (np.clip(cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB), 0, 1) * 255).round().astype(np.uint8)


def boost(rgb, k):
    if k == 1.0: return rgb
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    for ch in (1, 2):                                    # colour channels only; L (the detail) is untouched
        lab[..., ch] = np.clip(128 + (cv2.GaussianBlur(lab[..., ch], (0, 0), 1.6) - 128) * k, 0, 255)
    return cv2.cvtColor(lab.round().astype(np.uint8), cv2.COLOR_LAB2RGB)


for src, out in zip(a.pairs[0::2], a.pairs[1::2]):
    im = Image.open(src); rgba = np.asarray(im.convert("RGBA"))
    g = boost(warm(rgba[..., :3]), a.sat)
    Image.fromarray(np.dstack([g, rgba[..., 3]]) if im.mode == "RGBA" else g).save(out); print(out)
