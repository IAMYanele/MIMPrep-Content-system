#!/usr/bin/env python3
"""Two-pass loudnorm to -14 LUFS / -1 dBTP, video stream copied.   loudnorm.py <in.mp4> <out.mp4>"""
import json, re, subprocess, sys

src, out = sys.argv[1], sys.argv[2]
LN = "loudnorm=I=-14:TP=-1:LRA=11"
r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", src, "-af", LN + ":print_format=json", "-f", "null", "-"], capture_output=True, text=True)
m = json.loads(re.findall(r"\{[^{}]*\}", r.stderr)[-1])
af = (LN + ":measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true"
      % (m["input_i"], m["input_tp"], m["input_lra"], m["input_thresh"], m["target_offset"]))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-c:v", "copy", "-af", af, "-ar", "48000", "-c:a", "aac", "-b:a", "256k",
                "-movflags", "+faststart", out], check=True)
r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", out, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True)
print(out, "| in", m["input_i"], "LUFS ->", re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1], "LUFS, peak", re.findall(r"Peak:\s+(-?[\d.]+)", r.stderr)[-1], "dBFS")
