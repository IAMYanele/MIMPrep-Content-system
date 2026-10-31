"""One row per clip: a frame every <step> s (landscape tiles, time-labelled). usage: strips.py <out.jpg> <step> <video>..."""
import subprocess, sys, os
from PIL import Image, ImageDraw, ImageFont
out, step = sys.argv[1], float(sys.argv[2]); W, H, MAXN = 256, 144, 14
font = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 14)
rows = []
for v in sys.argv[3:]:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", v, "-vf", f"fps=1/{step},scale={W}:{H}", "-frames:v", str(MAXN),
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    n = len(raw) // (W * H * 3)
    rows.append((os.path.basename(v), [Image.frombytes("RGB", (W, H), raw[i*W*H*3:(i+1)*W*H*3]) for i in range(n)]))
sheet = Image.new("RGB", (MAXN * W, len(rows) * (H + 18)), (15, 15, 15)); d = ImageDraw.Draw(sheet)
for r, (name, ims) in enumerate(rows):
    y = r * (H + 18)
    d.text((4, y + 1), name, fill=(255, 255, 0), font=font)
    for i, im in enumerate(ims):
        dd = ImageDraw.Draw(im); dd.text((3, 2), f"{i*step:.0f}s", fill=(0, 255, 0), font=font)
        sheet.paste(im, (i * W, y + 18))
sheet.save(out, quality=82); print(out, len(rows))
