"""Assemble the comp's props, then (after the render) mux the audio and verify the deliverable.

  python finish.py --job <job> assemble
      writes <job>/edit.json from base.mp4 + chunks.json + broll.json and prints the render command
  python finish.py --job <job> mux --render <job>/render.mp4 --out "F:/.../<Title> - EDIT.mp4"
      two-pass loudnorm to -14 LUFS on base.mp4's audio, muxed onto the silent render
      (-c:v copy, -ar 48000 as an OUTPUT flag: loudnorm alone emits 96 kHz), then checks:
      clean decode, duration vs base, loudness, and that every cutaway moves in the final.
"""
import argparse, json, re, subprocess
from pathlib import Path
import numpy as np


def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)],
                                capture_output=True, text=True).stdout.strip())


def frame(f, t, w=270):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(f), "-frames:v", "1", "-vf", f"scale={w}:-2",
                          "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).astype(float) if raw else None


def assemble(job, fps):
    base = job / "public" / "base.mp4"
    props = {"base": "base.mp4", "durationInSeconds": round(dur(base), 3), "fps": fps,
             "chunks": json.load(open(job / "chunks.json")),
             "broll": json.load(open(job / "broll.json")) if (job / "broll.json").exists() else []}
    json.dump(props, open(job / "edit.json", "w"), indent=1)
    print(f"edit.json: {props['durationInSeconds']}s, {len(props['chunks'])} chunks, {len(props['broll'])} cutaways")
    mids = [round((b["from"] + b["dur"] / 2) * fps) for b in props["broll"]]
    print("\nRender ONE job at a time, from the Remotion project folder:")
    print(f'  node render-fast.mjs ThomasBrollReel --public-dir "{job / "public"}" --props "{job / "edit.json"}" '
          f'--stills {",".join(map(str, [12] + mids))} --stills-out "{job / "stills"}" --out "{job / "render.mp4"}"')


def mux(job, render, out):
    base = job / "public" / "base.mp4"
    p1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(base), "-vn", "-af",
                         "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                        capture_output=True, text=True).stderr
    m = json.loads(p1[p1.rfind("{"):p1.rfind("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", str(render), "-i", str(base),
                    "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-af", ln, "-c:a", "aac", "-b:a", "192k",
                    "-ar", "48000", "-shortest", "-movflags", "+faststart", str(out)], check=True)

    problems = []
    err = subprocess.run(["ffmpeg", "-v", "error", "-i", str(out), "-f", "null", "-"], capture_output=True, text=True).stderr
    if err.strip():
        problems.append(f"decode errors: {err.strip()[:200]}")
    d_out, d_base = dur(out), dur(base)
    if abs(d_out - d_base) > 0.15:
        problems.append(f"duration {d_out:.2f}s vs base {d_base:.2f}s")
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(out), "-vn", "-af", "ebur128", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", meas)
    lufs = float(lufs[-1]) if lufs else None
    if lufs is None or abs(lufs + 14) > 1.0:
        problems.append(f"loudness {lufs} LUFS (want -14)")
    edit = json.load(open(job / "edit.json"))
    for b in edit["broll"]:
        f1, f2 = frame(out, b["from"] + 0.15), frame(out, b["from"] + b["dur"] - 0.2)
        mot = float(np.abs(f1 - f2).mean()) if f1 is not None and f2 is not None and len(f1) == len(f2) else 0
        if mot < 1.0:
            problems.append(f"cutaway at {b['from']:.1f}s looks frozen (motion {mot:.2f})")
    print(f"{out}: {d_out:.2f}s, {lufs} LUFS")
    print("OK: decodes clean, duration matches, -14 LUFS, every cutaway moves" if not problems
          else "PROBLEMS:\n  " + "\n  ".join(problems))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--job", required=True); ap.add_argument("step", choices=["assemble", "mux"])
    ap.add_argument("--fps", type=int, default=25)
    ap.add_argument("--render"); ap.add_argument("--out")
    a = ap.parse_args()
    job = Path(a.job)
    if a.step == "assemble":
        assemble(job, a.fps)
    else:
        mux(job, Path(a.render), Path(a.out))


if __name__ == "__main__":
    main()
