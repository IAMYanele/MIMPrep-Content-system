"""Build base.mp4: the source reframed to 1080x1920 shot by shot, with long silences tightened.

One ffmpeg pass: a time-dependent crop follows the camera (x0 per shot from shots.json),
then select/aselect drop the same spans from picture and sound so they can't drift.
Silences longer than --min-silence are shortened to --keep (half kept each side, so
every cut lands inside dead air, never on a word).

usage:
  python make_base.py --job <job>                 # reads <job>/shots.json
  python make_base.py --job <job> --noise -36dB   # soft talker: measure first, see the skill
writes <job>/public/base.mp4 (video + original audio) and <job>/timemap.json
"""
import argparse, json, re, subprocess
from pathlib import Path


def silences(src, noise, d):
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-vn", "-af", f"silencedetect=noise={noise}:d={d}",
                        "-f", "null", "-"], capture_output=True, text=True)
    if "silencedetect" not in p.stderr and "silence_" not in p.stderr:
        raise SystemExit("silencedetect printed nothing; check ffmpeg ran (never trust empty output)")
    st = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", p.stderr)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", p.stderr)]
    return list(zip(st, en))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--job", required=True)
    ap.add_argument("--noise", default="-33dB")
    ap.add_argument("--min-silence", type=float, default=0.45)
    ap.add_argument("--keep", type=float, default=0.18)
    ap.add_argument("--trim", action="append", default=[],
                    help="extra span to drop, in SOURCE seconds, as a,b (a bad take, a stray line)")
    ap.add_argument("--crf", type=int, default=18)
    a = ap.parse_args()
    job = Path(a.job)
    meta = json.load(open(job / "shots.json"))
    src, dur, shots = meta["src"], meta["duration"], meta["shots"]

    drop = []
    for s, e in silences(src, a.noise, a.min_silence):
        s, e = max(0.0, s), min(dur, e)
        if e - s > a.min_silence:
            drop.append((s + a.keep / 2, e - a.keep / 2))
    for t in a.trim:
        x, y = map(float, t.split(",")); drop.append((x, y))
    drop.sort()
    merged = []
    for s, e in drop:
        if merged and s <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))
    keep, t = [], 0.0
    for s, e in merged:
        if s > t:
            keep.append((t, s))
        t = max(t, e)
    if t < dur:
        keep.append((t, dur))

    # crop x follows the camera; nested if() over the shot starts
    expr = str(shots[-1]["x0"])
    for sh in reversed(shots[:-1]):
        expr = f"if(lt(t\\,{sh['end']:.3f})\\,{sh['x0']}\\,{expr})"
    cw, ch = shots[0]["crop_w"], shots[0]["crop_h"]
    sel = "+".join(f"between(t\\,{s:.3f}\\,{e:.3f})" for s, e in keep)
    vf = f"crop={cw}:{ch}:x='{expr}':y=0,scale=1080:1920:flags=lanczos,select='{sel}',setpts=N/FRAME_RATE/TB"
    af = f"aselect='{sel}',asetpts=N/SR/TB"
    out = job / "public"; out.mkdir(parents=True, exist_ok=True)
    graph = f"[0:v]{vf}[v];[0:a]{af}[a]"
    (job / "base_filter.txt").write_text(graph, encoding="utf-8")       # kept for debugging
    cmd = ["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", src,
           "-filter_complex", graph, "-map", "[v]", "-map", "[a]",
           "-c:v", "libx264", "-preset", "medium", "-crf", str(a.crf), "-pix_fmt", "yuv420p",
           "-fps_mode", "cfr", "-c:a", "aac", "-b:a", "192k", str(out / "base.mp4")]
    subprocess.run(cmd, check=True)

    tm, o = [], 0.0
    for s, e in keep:
        tm.append({"src_a": round(s, 3), "src_b": round(e, 3), "out_a": round(o, 3)})
        o += e - s
    json.dump({"src": src, "kept": tm, "out_duration": round(o, 3), "removed": [list(m) for m in merged]},
              open(job / "timemap.json", "w"), indent=1)
    real = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                 str(out / "base.mp4")], capture_output=True, text=True).stdout.strip())
    print(f"base.mp4: {dur:.2f}s -> {real:.2f}s ({len(merged)} spans removed, expected {o:.2f}s)")
    if abs(real - o) > 0.2:
        print("WARNING: base duration differs from the time map; check the select expression")


if __name__ == "__main__":
    main()
