"""Accurate word timings for a region: transcribe it in short chunks, each cut in a measured pause.

Whisper over a long region drifts. On a Fathom GMAT session the segment transcript had
"work" 2.8s early, and whole hesitations ("um, so,", "keep, keep the", "some, uh, some")
folded into stretched words, so cuts planned on it landed in the wrong place and the ums
survived. Chunks of at most --max seconds, split in the middle of real pauses and transcribed
with a disfluent prompt and no carried-over context, keep the timing tight and hear the
stumbles.

usage:
  python chunk_words.py "<raw.mp4>" --pauses <job>/segA --start 15 --end 111 --out <job>/segA_c
writes <out>/words.json ([{"w", "s", "e"}], source time). Needs pauses.json for the region.
"""
import argparse, json, os, subprocess, sys, tempfile
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audio import seek

PROMPT = "Umm, so, uh, I think, like, you know, the, the CV is, um, it's uh, it's quite good. Hmm, okay. Er, yeah."


def split_points(pauses, start, end, maxlen):
    """Cut at the longest pause in each [cur+3, cur+maxlen] window (slightly favouring later ones)."""
    cuts, cur = [start], start
    while end - cur > maxlen:
        cands = [p for p in pauses if cur + 3.0 < p[2] <= cur + maxlen]
        nxt = max(cands, key=lambda p: (p[1] - p[0]) + (p[2] - cur) * 0.05)[2] if cands else cur + maxlen
        cuts.append(nxt); cur = nxt
    return cuts + [end]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("--pauses", required=True, help="dir with pauses.json for this SAME file")
    ap.add_argument("--start", type=float, required=True); ap.add_argument("--end", type=float, required=True)
    ap.add_argument("--out", required=True); ap.add_argument("--max", type=float, default=9.0)
    a = ap.parse_args()
    pauses = [p for p in json.load(open(Path(a.pauses) / "pauses.json"))["pauses"] if a.start < p[2] < a.end]
    cuts = split_points(pauses, a.start, a.end, a.max)

    from faster_whisper import WhisperModel
    m = None
    for name in ("small.en", "small", "base.en"):             # whichever is fully downloaded
        try:
            m = WhisperModel(name, device="cpu", compute_type="int8", local_files_only=True); break
        except Exception:
            continue
    if m is None:
        sys.exit("no local faster-whisper model: run once with internet so 'small' downloads")

    words, tmp = [], os.path.join(tempfile.gettempdir(), f"cw_{os.getpid()}.wav")
    for x, y in zip(cuts, cuts[1:]):
        subprocess.run(["ffmpeg", "-v", "error", "-y"] + seek(a.src, x, y - x) + ["-vn", "-ac", "1", "-ar", "16000", tmp], check=True)
        segs, _ = m.transcribe(tmp, language="en", beam_size=5, word_timestamps=True, vad_filter=False,
                               condition_on_previous_text=False, initial_prompt=PROMPT)
        got = [{"w": w.word.strip(), "s": round(x + w.start, 3), "e": round(x + w.end, 3)} for s in segs for w in s.words if w.word.strip()]
        words += got
        print(f"{x:7.2f}-{y:7.2f}  " + " ".join(f"{w['w']}@{w['s']:.2f}" for w in got), flush=True)
    os.remove(tmp)
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    json.dump(words, open(out / "words.json", "w", encoding="utf-8"), indent=0)
    print(f"{len(words)} words -> {out / 'words.json'}")


if __name__ == "__main__":
    main()
