#!/usr/bin/env python3
"""Per-angle 9:16 crops for a multi-camera 16:9 cut: each angle segment is cropped around its own face.
   angle_crops.py <cut16x9.mp4> <out_dir> [--audio-top]
Writes out_dir/cam_full.mp4 (1080x1920, muted) and out_dir/cam_top.mp4 (tiny 96x86 video carrying the AUDIO only:
these reels have no split mode, so the engine's top camera is never visible) and out_dir/angles.json."""
import json, os, subprocess, sys
import cv2

src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
cap = cv2.VideoCapture(src); FPS = cap.get(cv2.CAP_PROP_FPS); N = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)); H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
CW = round(H * 9 / 16 / 2) * 2

# 1. angle changes = big frame-to-frame differences on a small grey thumbnail
prev, cuts, f = None, [0], 0
while True:
    ok, fr = cap.read()
    if not ok: break
    g = cv2.cvtColor(cv2.resize(fr, (96, 54)), cv2.COLOR_BGR2GRAY).astype("float32")
    if prev is not None and abs(g - prev).mean() > 18 and f - cuts[-1] > 6: cuts.append(f)
    prev = g; f += 1
N = f; cuts.append(N)

# 2. face centre per segment (median of a few samples), largest face
casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
segs = []
for a, b in zip(cuts, cuts[1:]):
    xs = []
    for k in range(5):
        cap.set(cv2.CAP_PROP_POS_FRAMES, a + (b - a) * (k + 1) // 6); ok, fr = cap.read()
        if not ok: continue
        # most CONFIDENT face, not the largest: the bonsai behind her reads as a big low-confidence "face"
        fs, _, wt = casc.detectMultiScale3(cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY), 1.1, 6, minSize=(H // 10, H // 10), outputRejectLevels=True)
        if len(fs): x, y, w, h = fs[max(range(len(fs)), key=lambda k: float(wt[k]))]; xs.append(x + w / 2)
    cx = sorted(xs)[len(xs) // 2] if xs else (segs[-1]["cx"] if segs else W / 2)
    x0 = int(min(max(0, cx - CW / 2), W - CW)) // 2 * 2
    segs.append({"f0": a, "f1": b, "t0": round(a / FPS, 3), "t1": round(b / FPS, 3), "cx": round(cx), "x": x0, "faces": len(xs)})
json.dump({"fps": FPS, "crop_w": CW, "segments": segs}, open(f"{out}/angles.json", "w"), indent=1)
for s in segs: print("%7.2f-%7.2f  face x %4d  crop x %4d  (%d/5 detections)" % (s["t0"], s["t1"], s["cx"], s["x"], s["faces"]))

# 3. one ffmpeg pass: trim each segment, crop it, concat
fc = "".join("[0:v]trim=start_frame=%d:end_frame=%d,setpts=PTS-STARTPTS,crop=%d:%d:%d:0,scale=1080:1920:flags=lanczos,setsar=1[v%d];" % (s["f0"], s["f1"], CW, H, s["x"], i)
             for i, s in enumerate(segs)) + "".join("[v%d]" % i for i in range(len(segs))) + "concat=n=%d:v=1:a=0[o]" % len(segs)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", fc, "-map", "[o]", "-an", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
                "-pix_fmt", "yuv420p", "-movflags", "+faststart", f"{out}/cam_full.mp4"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", "scale=96:86,setsar=1", "-c:v", "libx264", "-crf", "35", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", f"{out}/cam_top.mp4"], check=True)
print("wrote", out)
