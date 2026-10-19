"""Two-pass loudness normalise to -14 LUFS.

The video stream is copied, never re-encoded, so the picture stays bit-identical and
a clip normalises in seconds. Only the audio is touched.

Usage:
    python norm.py <file-or-dir> [more files...] [--target -14] [--dry-run]

Pass a directory to do every .mp4 in it. Files already within 0.5 LUFS of the target
are skipped, so running this twice is not destructive -- each extra pass would
otherwise add another AAC generation and nudge the duration by ~0.1s.

Writes to a temp file and only moves it over the original once the duration checks
out, so an interrupted run cannot leave a truncated deliverable.
"""
import json
import os
import re
import shutil
import subprocess
import sys

TARGET = -14.0
FILTER = "I={i}:TP=-1.5:LRA=11"


def probe_duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], capture_output=True, text=True)
    return float(r.stdout.strip() or 0)


def measure_lufs(path):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", path,
                          "-af", "ebur128=framelog=verbose", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    m = re.search(r"Integrated loudness.*?I:\s*(-?[\d.]+)", out, re.S)
    return float(m.group(1)) if m else None


def normalise(src, target=TARGET, dry_run=False):
    """Two-pass loudnorm. Returns (before_lufs, after_lufs) or None if skipped."""
    before = measure_lufs(src)
    if before is not None and abs(before - target) <= 0.5:
        print(f"  skip  {os.path.basename(src)[:44]:<44} already {before} LUFS")
        return None
    if dry_run:
        print(f"  would {os.path.basename(src)[:44]:<44} {before} -> {target} LUFS")
        return None

    f = FILTER.format(i=target)
    pass1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af",
                            f"loudnorm={f}:print_format=json", "-f", "null", "-"],
                           capture_output=True, text=True)
    blobs = re.findall(r"\{[^{}]*input_i[^{}]*\}", pass1.stdout + pass1.stderr, re.S)
    if not blobs:
        print(f"  FAIL  {os.path.basename(src)} - could not measure")
        return None
    st = json.loads(blobs[-1])

    d0 = probe_duration(src)
    tmp = src + ".norm.tmp.mp4"
    meas = (f"loudnorm={f}"
            f":measured_I={st['input_i']}:measured_TP={st['input_tp']}"
            f":measured_LRA={st['input_lra']}:measured_thresh={st['input_thresh']}"
            f":offset={st['target_offset']}:linear=true")
    rc = subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", src,
                         "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy",
                         "-af", meas, "-c:a", "aac", "-b:a", "192k",
                         "-movflags", "+faststart", tmp]).returncode
    if rc != 0 or not os.path.exists(tmp):
        if os.path.exists(tmp):
            os.remove(tmp)
        print(f"  FAIL  {os.path.basename(src)} - encode rc={rc}")
        return None

    d1 = probe_duration(tmp)
    if abs(d1 - d0) > 0.15:
        os.remove(tmp)
        print(f"  FAIL  {os.path.basename(src)} - duration drift {d0:.2f} -> {d1:.2f}")
        return None

    shutil.move(tmp, src)
    after = measure_lufs(src)
    print(f"  ok    {os.path.basename(src)[:44]:<44} {before} -> {after} LUFS")
    return before, after


def collect(args):
    out = []
    for a in args:
        if os.path.isdir(a):
            out += [os.path.join(a, f) for f in sorted(os.listdir(a))
                    if f.lower().endswith(".mp4")]
        elif os.path.isfile(a):
            out.append(a)
        else:
            print(f"  (not found: {a})")
    return out


if __name__ == "__main__":
    argv = sys.argv[1:]
    dry = "--dry-run" in argv
    argv = [a for a in argv if a != "--dry-run"]
    target = TARGET
    if "--target" in argv:
        i = argv.index("--target")
        target = float(argv[i + 1])
        del argv[i:i + 2]
    files = collect(argv)
    if not files:
        print(__doc__)
        sys.exit(1)
    print(f"normalising {len(files)} file(s) to {target} LUFS"
          f"{' (dry run)' if dry else ''}")
    for p in files:
        normalise(p, target, dry)
