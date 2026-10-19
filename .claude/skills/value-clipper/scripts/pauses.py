"""Calibrated pause map for a region of the raw video: where cuts are allowed to land.

Never cut on a Whisper word timestamp. Word times drift ±100ms, a "word" can span
seconds, and cutting on one clips the opening consonant, which once flipped "don't do
a summary" into "do a summary". Cuts go in the MIDDLE of a real pause.

The silence threshold is measured, not remembered: the speaker's loud 0.25s slices are
measured and the threshold set ~11dB under them. A fixed -30dB once sat above a soft
speaker's quiet passages and labelled 3.2s of real speech as silence.

Also counts speech bursts (short-pause silencedetect) against the transcript's words in
each stretch: more bursts than words means a false start or repeat Whisper merged away.

usage:
  python pauses.py "<raw.mp4>" --out <job>/seg1 --start 412 --end 655.5 [--words <job>/seg1/words.json]
writes <out>/pauses.json: {"noise_db", "pauses": [[start, end, mid], ...], "suspect": [...]}
"""
import argparse, json, re, subprocess
from pathlib import Path
import numpy as np


def slices_db(src, start, end, step=0.25):
    p = subprocess.run(["ffmpeg", "-hide_banner", "-ss", f"{start:.3f}", "-t", f"{end - start:.3f}", "-i", src, "-vn",
                        "-af", f"asetnsamples=n={int(16000 * step)},astats=metadata=1:reset=1,"
                               "ametadata=print:key=lavfi.astats.Overall.RMS_level", "-ar", "16000", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    vals = [float(v) for v in re.findall(r"RMS_level=(-?[\d.]+|-inf)", p) if v != "-inf"]
    return np.array(vals) if vals else np.array([-60.0])


def silences(src, start, end, noise, d):
    p = subprocess.run(["ffmpeg", "-hide_banner", "-ss", f"{start:.3f}", "-t", f"{end - start:.3f}", "-i", src, "-vn",
                        "-af", f"silencedetect=noise={noise:.1f}dB:d={d}", "-f", "null", "-"], capture_output=True, text=True).stderr
    if "Press [q]" not in p and "silencedetect" not in p and "Output #0" not in p:
        raise SystemExit("ffmpeg printed nothing: check the source path (never trust an empty silence map)")
    st = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", p)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", p)]
    if len(en) < len(st):
        en.append(end - start)
    return [(max(0.0, a) + start, b + start) for a, b in zip(st, en)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("--out", required=True)
    ap.add_argument("--start", type=float, default=0.0); ap.add_argument("--end", type=float)
    ap.add_argument("--min", type=float, default=0.25, help="shortest pause a cut may land in")
    ap.add_argument("--noise", type=float, help="override the measured threshold (dB)")
    ap.add_argument("--words", help="words.json for the burst check")
    a = ap.parse_args()
    end = a.end or float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.src],
                                        capture_output=True, text=True).stdout.strip())
    db = slices_db(a.src, a.start, end)
    speech_peak = float(np.percentile(db, 90))
    noise = a.noise if a.noise is not None else min(-30.0, speech_peak - 11)
    pauses = [(s, e, (s + e) / 2) for s, e in silences(a.src, a.start, end, noise, a.min)]

    suspect = []
    if a.words:
        words = json.load(open(a.words, encoding="utf-8"))
        bursts = silences(a.src, a.start, end, noise, 0.12)
        runs, prev = [], a.start                      # speech runs between short silences
        for s, e in bursts:
            if s - prev > 0.08:
                runs.append((prev, s))
            prev = e
        if end - prev > 0.08:
            runs.append((prev, end))
        # compare per stretch between the cut-worthy pauses
        bounds = [a.start] + [m for _, _, m in pauses] + [end]
        for x, y in zip(bounds, bounds[1:]):
            nw = sum(1 for w in words if x <= (w["s"] + w["e"]) / 2 < y)
            nb = sum(1 for r in runs if x <= (r[0] + r[1]) / 2 < y)
            if nb > nw + 1 and y - x > 1.0:
                suspect.append({"from": round(x, 2), "to": round(y, 2), "words": nw, "bursts": nb})

    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    json.dump({"src": a.src, "start": a.start, "end": end, "speech_peak_db": round(speech_peak, 1), "noise_db": round(noise, 1),
               "pauses": [[round(s, 3), round(e, 3), round(m, 3)] for s, e, m in pauses], "suspect": suspect},
              open(out / "pauses.json", "w"), indent=1)
    print(f"speech peaks ~{speech_peak:.1f} dB -> silence threshold {noise:.1f} dB, {len(pauses)} pauses >= {a.min}s")
    for s in suspect:
        print(f"  check {s['from']:.2f}-{s['to']:.2f}: {s['bursts']} speech bursts vs {s['words']} words "
              f"(likely a false start or repeat Whisper merged)")


if __name__ == "__main__":
    main()
