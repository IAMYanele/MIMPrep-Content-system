"""Start a job for an already-vertical source (Vansh's assembled cuts): one full-frame shot.
usage: python new_job.py <src.mp4> <job_dir>"""
import json, subprocess, sys
from pathlib import Path

src, job = sys.argv[1], Path(sys.argv[2])
job.mkdir(parents=True, exist_ok=True)
p = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                    "-show_entries", "format=duration", "-of", "json", src], capture_output=True, text=True)
j = json.loads(p.stdout)
w, h = j["streams"][0]["width"], j["streams"][0]["height"]
d = float(j["format"]["duration"])
json.dump({"src": src.replace("\\", "/"), "width": w, "height": h, "duration": round(d, 3),
           "shots": [{"start": 0.0, "end": round(d, 3), "x0": 0, "crop_w": w, "crop_h": h, "cam": 1}]},
          open(job / "shots.json", "w"), indent=1)
print(f"{job}: {w}x{h} {d:.2f}s")
