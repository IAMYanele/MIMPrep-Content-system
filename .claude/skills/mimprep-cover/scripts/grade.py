"""Warm, glamorous colour grade (colour only, nothing reshaped): vibrance, warmer skin, gentle contrast, soft highlight glow.
Keeps transparency, so grade the cutout before laying it out. usage: python grade.py <in> <out> [<in> <out> ...]"""
import sys
import numpy as np, cv2
from PIL import Image
def grade(rgb):
    x = np.clip(rgb.astype(np.float32) / 255 * np.array([1.045, 1.0, 0.95], np.float32), 0, 1)
    x = np.clip(0.5 + (x - 0.5) * 1.10, 0, 1)
    x = (x + 0.06 * np.sin(np.pi * x) * (x > 0.5)).astype(np.float32)
    hsv = cv2.cvtColor(np.clip(x, 0, 1), cv2.COLOR_RGB2HSV); s = hsv[..., 1]
    hsv[..., 1] = np.clip(s + (1 - s) * s * 0.55 + 0.04 * s, 0, 1)
    return (np.clip(cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB), 0, 1) * 255).round().astype(np.uint8)
for src, out in zip(sys.argv[1::2], sys.argv[2::2]):
    im = Image.open(src); rgba = np.asarray(im.convert("RGBA")); g = grade(rgba[..., :3])
    Image.fromarray(np.dstack([g, rgba[..., 3]]) if im.mode == "RGBA" else g).save(out); print(out)
