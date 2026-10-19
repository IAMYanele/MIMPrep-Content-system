# Remove a span from a finished 16:9 clip (frame-accurate, tiny fades so joins don't click).
import subprocess, sys, os
import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
from cvpaths import WORK as W
def trim(src, dst, cut_a, cut_b, total):
    keep = [(0.0, cut_a), (cut_b, total)]
    parts, vl, al = [], [], []
    for i, (a, b) in enumerate(keep):
        d = b - a
        if d <= 0.05: continue
        f = min(0.02, d / 4)
        parts.append(f"[0:v]trim=start={a:.3f}:end={b:.3f},setpts=PTS-STARTPTS[v{i}]")
        parts.append(f"[0:a]atrim=start={a:.3f}:end={b:.3f},asetpts=PTS-STARTPTS,"
                     f"afade=t=in:st=0:d={f:.3f},afade=t=out:st={d-f:.3f}:d={f:.3f}[a{i}]")
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
