# Remove a span from a finished 16:9 clip (frame-accurate, tiny fades so joins don't click).
import subprocess, sys, os
import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
from cvpaths import WORK as W
def src_fps(src):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=r_frame_rate", "-of", "csv=p=0", src],
                       capture_output=True, text=True).stdout.strip().strip(",")
    num, den = (r.split("/") + ["1"])[:2]
    return float(num) / float(den) if float(den) else 30.0

def trim(src, dst, cut_a, cut_b, total):
    """Audio and video are cut on the same frame-snapped times so the join cannot slip by up to
    a frame, and the de-click fade is 6ms rather than 20ms so it does not eat the kept speech."""
    keep = [(0.0, cut_a), (cut_b, total)]
    parts, vl, al = [], [], []
    fps = src_fps(src)
    for i, (a, b) in enumerate(keep):
        f0, f1 = round(a * fps), round(b * fps)
        vs, ve = (f0 - 0.25) / fps, (f1 - 0.25) / fps
        a0, a1 = f0 / fps, f1 / fps
        d = a1 - a0
        if d <= 0.05: continue
        f = min(0.006, d / 4)
        parts.append(f"[0:v]trim=start={vs:.6f}:end={ve:.6f},setpts=PTS-STARTPTS[v{i}]")
        parts.append(f"[0:a]atrim=start={a0:.6f}:end={a1:.6f},asetpts=PTS-STARTPTS,"
                     f"afade=t=in:st=0:d={f:.6f},afade=t=out:st={d-f:.6f}:d={f:.6f}[a{i}]")
        vl.append(f"[v{i}]"); al.append(f"[a{i}]")
    parts.append("".join(v+a for v, a in zip(vl, al)) + f"concat=n={len(vl)}:v=1:a=1[vo][ao]")
    cmd = ["ffmpeg","-v","error","-y","-i",src,"-filter_complex",";".join(parts),
           "-map","[vo]","-map","[ao]","-c:v","libx264","-preset","medium","-crf","20",
           "-pix_fmt","yuv420p","-r","30","-fps_mode","cfr","-c:a","aac","-b:a","192k",
           "-movflags","+faststart", dst]
    r = subprocess.run(cmd)
    return r.returncode

if __name__ == "__main__":
    IN = "F:/cv review dubao/CLIPPED"
    JOBS = [
      # (clip number, file name in IN, cut from, cut to)   e.g. (12, "CV Review 12 - <...>.mp4", 23.93, 28.66)
    ]
    for clip, name, a, b in JOBS:
        src = f"{IN}/{name}"
        tot = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                                    "-of","csv=p=0",src],capture_output=True,text=True).stdout.strip())
        dst = f"{W}/trimmed/clip{clip}.mp4"
        rc = trim(src, dst, a, b, tot)
        nt = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                                   "-of","csv=p=0",dst],capture_output=True,text=True).stdout.strip() or 0)
        print(f"clip{clip}: {tot:.2f}s -> {nt:.2f}s (removed {b-a:.2f}s)  rc={rc}")
