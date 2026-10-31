"""Timestamped contact sheet. usage: sheet.py <video> <out.jpg> [fps=2] [cols=16] [t0] [t1]"""
import subprocess, sys
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
v, out = sys.argv[1], sys.argv[2]
fps = float(sys.argv[3]) if len(sys.argv) > 3 else 2
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 16
t0 = float(sys.argv[5]) if len(sys.argv) > 5 else 0
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", v],
                           capture_output=True, text=True).stdout)
t1 = float(sys.argv[6]) if len(sys.argv) > 6 else dur
W, H = 180, 320
raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t0), "-to", str(t1), "-i", v, "-vf", f"fps={fps},scale={W}:{H}",
                      "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
n = len(raw) // (W * H * 3)
rows = (n + cols - 1) // cols
sheet = Image.new("RGB", (cols * W, rows * H))
font = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 18)
for i in range(n):
    im = Image.frombytes("RGB", (W, H), raw[i * W * H * 3:(i + 1) * W * H * 3])
    d = ImageDraw.Draw(im); t = t0 + i / fps
    d.rectangle([0, 0, 62, 22], fill=(0, 0, 0)); d.text((3, 1), f"{t:.1f}", fill=(255, 255, 0), font=font)
    sheet.paste(im, ((i % cols) * W, (i // cols) * H))
sheet.save(out, quality=82)
print(out, n, "frames")
