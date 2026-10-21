#!/usr/bin/env python3
"""Step 4 — render the cut.   04_render_cut.py "<raw.MP4>" <work_dir>/edl.json "<out CUT 16x9.mp4>"
Frame-accurate select, 8ms audio crossfades at every join, HEVC 45M (keeps the 4K for cropping), AAC 320k.
Write the output."""
import json, subprocess, sys, tempfile, numpy as np, soundfile as sf

_MAC = __import__("sys").platform == "darwin"
def _venc(rate="40M", h264=False):
    """Video encoder args. VideoToolbox on macOS; libx264 elsewhere (the
    fallback this pack already uses in coaching-call-clips/03_clips.py)."""
    if _MAC:
        return (["-c:v","h264_videotoolbox","-b:v",rate] if h264 else
                ["-c:v","hevc_videotoolbox","-b:v",rate,"-tag:v","hvc1"])
    return ["-c:v","libx264","-crf","15","-preset","fast","-pix_fmt","yuv420p"]

src, edl, out = sys.argv[1:4]; E = json.load(open(edl)); keeps = E["keeps"]; FPS = E["fps"]
FR = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", src]).decode().strip().splitlines()[0].strip().strip(",")
tmp = tempfile.mkdtemp(); wav = f"{tmp}/a.wav"; subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vn", "-c:a", "pcm_s24le", wav], check=True)
a, sr = sf.read(wav, always_2d=True); X = int(0.008 * sr); parts = []
for s, e in keeps:
    c = a[int(round(s / FPS * sr)): int(round(e / FPS * sr))].copy(); r = np.linspace(0, 1, X)[:, None]; c[:X] *= r; c[-X:] *= r[::-1]; parts.append(c)
sf.write(f"{tmp}/t.wav", np.concatenate(parts), sr, subtype="PCM_24"); lst = f"{tmp}/l.txt"
with open(lst, "w") as L:                       # ffmpeg select dies past ~100 between() terms -> chunks of 50
    for k in range(0, len(keeps), 50):
        sel = "+".join(f"between(n,{s},{e - 1})" for s, e in keeps[k: k + 50]); p = f"{tmp}/p{k}.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-an", "-vf", f"select='{sel}',setpts=N/({FR})/TB", "-r", FR, *_venc("45M"), p], check=True)
        L.write(f"file '{p}'\n")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-i", f"{tmp}/t.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-shortest", out], check=True)
print("wrote", out, f"{sum(e - s for s, e in keeps) / FPS:.2f}s")
