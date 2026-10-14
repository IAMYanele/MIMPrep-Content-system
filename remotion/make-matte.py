"""
Generate an alpha-matted overlay clip so on-screen graphics can sit BEHIND the
subject (the "text behind head" look) while she and the product stay in front.

There is no real green screen in this footage - the background is a wood wall and
a lamp - so the "key" has to be an AI matte. rembg/u2net runs about 1.2s/frame on
this machine (CPU only, no CUDA), so we only matte the frame RANGE where graphics
are actually on screen rather than the whole video.

Output is VP9/WebM with yuva420p, which Remotion can layer with transparency.

  python make-matte.py <src.mp4> <startSec> <endSec> <out.webm>
"""
import os
import subprocess
import sys
import tempfile
import time

from PIL import Image
from rembg import new_session, remove

FF = r"C:/Users/yanel/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffmpeg.exe"

src, start, end, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
fps = 25
work = tempfile.mkdtemp(prefix="matte_")
raw = os.path.join(work, "raw")
cut = os.path.join(work, "cut")
os.makedirs(raw, exist_ok=True)
os.makedirs(cut, exist_ok=True)

dur = end - start
subprocess.run(
    [FF, "-y", "-ss", str(start), "-t", str(dur), "-i", src,
     "-vf", f"fps={fps}", os.path.join(raw, "f%05d.png")],
    check=True, capture_output=True,
)
frames = sorted(os.listdir(raw))
print(f"{len(frames)} frames to matte ({dur:.1f}s)", flush=True)

sess = new_session("u2net")
t0 = time.time()
for i, fn in enumerate(frames, 1):
    im = Image.open(os.path.join(raw, fn))
    # alpha_matting off: it is far slower on CPU and u2net's own edges are clean
    # enough at 1080p for hair against this background.
    res = remove(im, session=sess)
    res.save(os.path.join(cut, fn))
    if i % 25 == 0 or i == len(frames):
        el = time.time() - t0
        print(f"  {i}/{len(frames)}  {el:.0f}s elapsed  ~{el/i*(len(frames)-i):.0f}s left", flush=True)

subprocess.run(
    [FF, "-y", "-framerate", str(fps), "-i", os.path.join(cut, "f%05d.png"),
     "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "3M", "-an", out],
    check=True, capture_output=True,
)
print("wrote", out, os.path.getsize(out), "bytes")
