"""Rebuild MiM ads: assemble -> render -> CTA overlay -> mux. One render at a time.

usage: python rebuild_all.py <letter> "<output file name>" <cta_start_seconds>
   e.g. python rebuild_all.py D "Master D - We only take 30 per round - Hook 2 - EDIT v3.mp4" 19.94
Holds F:\\mim-ads-2026-10\\render.lock while it runs, so two sessions never render at once."""
import json
import os
import subprocess
import sys
import time
from pathlib import Path

SKILL = r"C:\Users\yanel\.claude\skills\thomas-broll-reel\scripts"
REMOTION = r"C:\Users\yanel\Documents\remotion"
CTA_PNG = r"F:\mim-ads-2026-10\tools\cta.png"
OUT_DIR = Path(r"G:\thomas london master captioned")
LOCK = Path(r"F:\mim-ads-2026-10\render.lock")

JOBS = [(sys.argv[1], sys.argv[2], float(sys.argv[3]))]

# one render at a time across sessions: wait for another session's lock (stale after 30 min)
while True:
    try:   # atomic: only one waiter can create the lock
        fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.write(fd, f"{sys.argv[1]} {time.strftime('%H:%M:%S')}".encode()); os.close(fd)
        break
    except FileExistsError:
        try:
            if time.time() - LOCK.stat().st_mtime >= 1800:
                LOCK.unlink(missing_ok=True); continue
            print(f"render.lock held by: {LOCK.read_text(errors='replace').strip()} - waiting", flush=True)
        except FileNotFoundError:
            continue
        time.sleep(30)
import atexit
atexit.register(lambda: LOCK.unlink(missing_ok=True))


def run(cmd, cwd=None):
    # render-fast.mjs prints emoji; the default cp1252 decode blew up the reader thread and
    # every job bailed before rendering. Decode as UTF-8 and never fail on a stray byte.
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, shell=False,
                       encoding="utf-8", errors="replace")
    if p.returncode != 0:
        print(f"  FAILED: {' '.join(str(c) for c in cmd[:3])}...\n{p.stderr[-800:]}", flush=True)
        return None
    return p.stdout


for letter, out_name, cta_start in JOBS:
    job = Path(fr"G:\mim-master-urgency-2026-10\jobs\{letter}")
    print(f"=== {letter} ===", flush=True)

    if run([sys.executable, fr"{SKILL}\finish.py", "--job", str(job), "assemble"]) is None:
        continue

    edit = json.load(open(job / "edit.json"))
    dur = edit["durationInSeconds"]
    stills = [12] + [round((b["from"] + b["dur"] / 2) * 25) for b in edit["broll"]]

    if run(["node", "render-fast.mjs", "ThomasBrollReel",
            "--public-dir", str(job / "public"), "--props", str(job / "edit.json"),
            "--stills", ",".join(map(str, stills)), "--stills-out", str(job / "stills"),
            "--concurrency", "2", "--out", str(job / "render.mp4")], cwd=REMOTION) is None:
        continue
    print("  rendered", flush=True)

    # Remotion leaves a ~25 MB asset dir in TEMP per render. 119 of them had built up and
    # filled C:, which made Chrome fail the next render with a misleading fetch error.
    import tempfile, shutil
    tmp = Path(tempfile.gettempdir())
    for d in tmp.glob("remotion-*"):
        if d.is_dir():
            shutil.rmtree(d, ignore_errors=True)

    hold = round(dur - cta_start, 2)
    graph = (f"[1:v]format=rgba,fade=t=in:st=0:d=0.25:alpha=1,"
             f"setpts=PTS-STARTPTS+{cta_start}/TB[c];"
             f"[0:v][c]overlay=0:0:eof_action=pass:enable='gte(t,{cta_start})'[v0]")
    # reference-style white flash on each b-roll hand-off: a white frame on the cut, fading over 3 frames
    flashes = json.load(open(job / "flashes.json")) if (job / "flashes.json").exists() else []
    boxes = [f"drawbox=x=0:y=0:w=iw:h=ih:t=fill:color=white@{a}:enable='between(t,{f + 0.04 * k:.3f},{f + 0.04 * k + 0.039:.3f})'"
             for f in flashes for k, a in enumerate((0.92, 0.55, 0.22))]
    graph += ";[v0]" + (",".join(boxes) if boxes else "null") + "[v]"
    if run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", str(job / "render.mp4"),
            "-loop", "1", "-framerate", "25", "-t", str(hold), "-i", CTA_PNG,
            "-filter_complex", graph, "-map", "[v]", "-c:v", "libx264", "-preset", "medium",
            "-crf", "16", "-pix_fmt", "yuv420p", "-fps_mode", "cfr",
            str(job / "render_cta.mp4")]) is None:
        continue
    print(f"  CTA from {cta_start}s", flush=True)

    out = run([sys.executable, fr"{SKILL}\finish.py", "--job", str(job), "mux",
               "--render", str(job / "render_cta.mp4"), "--out", str(OUT_DIR / out_name)])
    if out:
        print("  " + "\n  ".join(out.strip().splitlines()[-2:]), flush=True)

    for f in ("render.mp4", "render_cta.mp4"):
        (job / f).unlink(missing_ok=True)

print("ALL DONE", flush=True)
