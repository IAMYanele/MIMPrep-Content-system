"""Remove spans from a cut clip AND remap its word-level transcript to match.

Re-timing an ASS around a removed span loses any caption line that straddles the
cut. Working at the WORD level avoids that entirely: words before a cut keep their
times, words after shift back, words inside are dropped. The result is exact and
needs no API call, so it works when transcription credits are out.
"""
import json, os, subprocess, sys
W = os.path.dirname(os.path.abspath(__file__))


def remap_words(words, cuts):
    """cuts: [(a, b)] in clip time, non-overlapping, ascending.

    A word is dropped only when MOST of it falls inside a cut. Dropping on any
    overlap deletes words that merely touch a cut edge by a few hundredths of a
    second -- that silently removed 'Final', 'better' and 'this' from a clip whose
    cuts were all inside dead air. Whisper's boundaries are loose enough that edge
    contact means nothing.
    """
    out = []
    for w in words:
        s, e = w["start"], w["end"]
        dur = max(e - s, 1e-6)
        inside = sum(max(0.0, min(e, b) - max(s, a)) for a, b in cuts)
        if inside > 0.5 * dur:
            continue
        # a zero-length word strictly inside a cut is genuinely gone
        if e - s < 1e-6 and any(a < s < b for a, b in cuts):
            continue
        shift = sum(b - a for a, b in cuts if b <= s)
        ns = s - shift
        out.append({"word": w["word"], "start": ns, "end": max(ns, e - shift)})
    return out


def keep_windows(total, cuts):
    wins, t = [], 0.0
    for a, b in cuts:
        if a > t:
            wins.append((t, a))
        t = b
    if t < total:
        wins.append((t, total))
    return wins


def cut_video(src, dst, wins):
    parts, v, a = [], [], []
    for i, (s, e) in enumerate(wins):
        d = e - s
        if d <= 0.05:
            continue
        f = min(0.02, d / 4)
        parts.append(f"[0:v]trim=start={s:.3f}:end={e:.3f},setpts=PTS-STARTPTS[v{i}]")
        parts.append(f"[0:a]atrim=start={s:.3f}:end={e:.3f},asetpts=PTS-STARTPTS,"
                     f"afade=t=in:st=0:d={f:.3f},afade=t=out:st={d-f:.3f}:d={f:.3f}[a{i}]")
        v.append(f"[v{i}]"); a.append(f"[a{i}]")
    parts.append("".join(x + y for x, y in zip(v, a)) +
                 f"concat=n={len(v)}:v=1:a=1[vo][ao]")
    return subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src,
                           "-filter_complex", ";".join(parts),
                           "-map", "[vo]", "-map", "[ao]",
                           "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                           "-pix_fmt", "yuv420p", "-r", "30", "-fps_mode", "cfr",
                           "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                           "-movflags", "+faststart", dst]).returncode


def apply(clip, src, dst, cuts):
    cuts = sorted(cuts)
    total = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                                  "format=duration", "-of", "csv=p=0", src],
                                 capture_output=True, text=True).stdout.strip())
    wins = keep_windows(total, cuts)
    rc = cut_video(src, dst, wins)
    newdur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                                   "format=duration", "-of", "csv=p=0", dst],
                                  capture_output=True, text=True).stdout.strip() or 0)
    fj_path = f"{W}/captions/clip{clip}_final.json"
    fj = json.load(open(fj_path, encoding="utf-8"))
    before = len(fj["words"])
    fj["words"] = remap_words(fj["words"], cuts)
    fj["duration"] = total - sum(b - a for a, b in cuts)
    json.dump(fj, open(fj_path, "w", encoding="utf-8"), ensure_ascii=False)
    removed = sum(b - a for a, b in cuts)
    print(f"clip{clip}: rc={rc}  {total:.2f}s -> {newdur:.2f}s (removed {removed:.2f}s), "
          f"words {before} -> {len(fj['words'])}")
    return rc
