"""Single-camera stand-in for the reference's two-angle cutting: alternate sentences get a
1.12x punch-in centred on the face, switching in the gap before each sentence.

usage: python punch.py <job> [--zoom 1.12] [--skip-first]
reads <job>/transcript.txt (sentence starts) and <job>/public/base.mp4, rewrites base.mp4 in place
(the wide original is kept as base_wide.mp4) and writes <job>/punch.json.
"""
import argparse, json, re, subprocess
from pathlib import Path

import cv2

ap = argparse.ArgumentParser()
ap.add_argument("job"); ap.add_argument("--zoom", type=float, default=1.12)
a = ap.parse_args()
job = Path(a.job)
base = job / "public" / "base.mp4"
wide = job / "public" / "base_wide.mp4"
if not wide.exists():
    base.rename(wide)

# face centre from a few frames
cap = cv2.VideoCapture(str(wide))
fc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)); xs, ys = [], []
for i in range(5, n, max(1, n // 12)):
    cap.set(cv2.CAP_PROP_POS_FRAMES, i); ok, im = cap.read()
    if not ok:
        continue
    f = fc.detectMultiScale(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY), 1.1, 6, minSize=(120, 120))
    if len(f):
        x, y, w, h = max(f, key=lambda r: r[2]); xs.append(x + w / 2); ys.append(y + h / 2)
xs.sort(); ys.sort()
px, py = xs[len(xs) // 2], ys[len(ys) // 2]

lines = [l for l in (job / "transcript.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
spans = [tuple(map(float, re.match(r"\s*([\d.]+)-\s*([\d.]+)", l).groups())) for l in lines]
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                            str(wide)], capture_output=True, text=True).stdout)
# switch points: midway through the gap before a sentence (never on a word), and only once the
# current framing has held ~2.2 s, so a short line like "Here's why" never gets its own zoom
gaps = [round((spans[i - 1][1] + spans[i][0]) / 2, 3) for i in range(1, len(spans))]
cuts = [0.0]
for g in gaps:
    if g - cuts[-1] >= 2.2:
        cuts.append(g)
if dur - cuts[-1] < 2.2 and len(cuts) > 1:
    cuts.pop()
cuts.append(dur)
punched = [(cuts[i], cuts[i + 1]) for i in range(len(cuts) - 1) if i % 2 == 1]

z = a.zoom
cw, ch = round(1080 / z / 2) * 2, round(1920 / z / 2) * 2
cx, cy = round(px * (1 - 1 / z)), round(py * (1 - 1 / z))
en = "+".join(f"between(t,{s},{e - 0.001})" for s, e in punched)
graph = (f"[0:v]split[a][b];[b]crop={cw}:{ch}:{cx}:{cy},scale=1080:1920:flags=lanczos[z];"
         f"[a][z]overlay=0:0:enable='{en}'[v]")
subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", str(wide), "-filter_complex", graph,
                "-map", "[v]", "-map", "0:a", "-c:v", "libx264", "-preset", "medium", "-crf", "17",
                "-pix_fmt", "yuv420p", "-c:a", "copy", str(base)], check=True)
json.dump({"face": [px, py], "zoom": z, "punched": punched}, open(job / "punch.json", "w"), indent=1)
print(f"face ({px:.0f},{py:.0f}); punched {len(punched)} sentences: {punched}")
