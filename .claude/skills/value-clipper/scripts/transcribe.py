"""Word-timestamped transcript of a raw video, or of one region of it.

Level 1 reads the whole recording, so run it on the full file. Levels 2 and 3 need
exact word times for one segment: run it again with --start/--end on just that
region. A few minutes of audio transcribes far more accurately than an hour, and
times come back in SOURCE seconds either way.

Writes into --out:
  words.json        [{"w", "s", "e"}], source seconds
  transcript.md     one line per sentence-ish segment: [HH:MM:SS.s - HH:MM:SS.s] text

OpenAI whisper-1 first (fast; needs OPENAI_API_KEY with credits), split at pauses into
<=10-minute chunks sent in parallel. Falls back to local faster-whisper with VAD on,
using whichever model is already fully cached (a stalled first download once hung
this for 10+ minutes). Whisper invents text over long silence ("Thanks for watching!"
on a loop): VAD and the pause-split keep that out, but distrust any line repeated in
a silent stretch.

Segment passes (--start/--end) are VERBATIM by default: Whisper is prompted with disfluent
text, which makes it write down the "um", "uh" and stumbles it normally deletes. Level 2
needs those, because a filler that isn't in the transcript can't be found or cut.

usage:
  python transcribe.py "<raw.mp4>" --out <job>/full
  python transcribe.py "<raw.mp4>" --out <job>/seg1 --start 412.0 --end 655.5
  python transcribe.py "<raw.mp4>" --out <job>/full --local      # skip the API
"""
import argparse, json, os, re, subprocess, tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


# Whisper copies the style of its prompt: a disfluent prompt makes it keep the fillers.
VERBATIM_PROMPT = ("Umm, so, uh, I think, like, you know, the, the CV is, um, it's uh, it's quite good. "
                   "Hmm, okay. So, uh, make it, make it clickable. Er, yeah.")


def hms(t):
    h, r = divmod(max(0.0, t), 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:04.1f}"


def extract(src, start, end, out):
    cmd = ["ffmpeg", "-v", "error", "-y"]
    if start:
        cmd += ["-ss", f"{start:.3f}"]
    cmd += ["-i", src]
    if end:
        cmd += ["-t", f"{end - (start or 0):.3f}"]
    cmd += ["-vn", "-ac", "1", "-ar", "16000", "-b:a", "64k", out]
    subprocess.run(cmd, check=True)


def duration(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f],
                                capture_output=True, text=True).stdout.strip())


def split_points(audio, total, chunk=600):
    """Cut points near every `chunk` seconds, moved into the nearest real pause."""
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", audio, "-af", "silencedetect=noise=-38dB:d=0.4", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", p)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", p)]
    mids = [(a + b) / 2 for a, b in zip(st, en)]
    pts, t = [0.0], chunk
    while t < total - 30:
        near = [m for m in mids if abs(m - t) < 60]
        pts.append(min(near, key=lambda m: abs(m - t)) if near else t)
        t = pts[-1] + chunk
    return pts + [total]


def api_chunk(args):
    audio, a, b, verbatim = args
    import requests
    tmp = Path(tempfile.gettempdir()) / f"vc_{os.getpid()}_{int(a * 1000)}.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", audio, "-c:a", "libmp3lame",
                    "-b:a", "64k", str(tmp)], check=True)
    with open(tmp, "rb") as f:
        r = requests.post("https://api.openai.com/v1/audio/transcriptions",
                          headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"},
                          files={"file": (tmp.name, f, "audio/mpeg")},
                          data={"model": "whisper-1", "response_format": "verbose_json",
                                "timestamp_granularities[]": ["word", "segment"], "language": "en",
                                **({"prompt": VERBATIM_PROMPT} if verbatim else {})}, timeout=600)
    tmp.unlink(missing_ok=True)
    if r.status_code != 200:
        raise RuntimeError(f"OpenAI {r.status_code}: {r.text[:160]}")
    j = r.json()
    words = [{"w": w["word"], "s": w["start"] + a, "e": w["end"] + a} for w in j.get("words", [])]
    segs = [{"s": s["start"] + a, "e": s["end"] + a, "text": s["text"].strip()} for s in j.get("segments", [])]
    return words, segs


def via_api(audio, total, verbatim):
    if not os.environ.get("OPENAI_API_KEY"):
        raise RuntimeError("no OPENAI_API_KEY")
    pts = split_points(audio, total)
    with ThreadPoolExecutor(6) as ex:
        parts = list(ex.map(api_chunk, [(audio, a, b, verbatim) for a, b in zip(pts, pts[1:])]))
    return [w for p in parts for w in p[0]], [s for p in parts for s in p[1]], "OpenAI whisper-1"


def via_local(audio, model_pref, verbatim):
    from faster_whisper import WhisperModel
    names = [model_pref] if model_pref else ["small.en", "small", "medium.en", "base.en"]
    m = name = None
    for n in names:
        try:
            m = WhisperModel(n, device="cpu", compute_type="int8", local_files_only=True); name = n; break
        except Exception:
            continue
    if m is None:
        name = model_pref or "small.en"
        m = WhisperModel(name, device="cpu", compute_type="int8")
    segs_it, _ = m.transcribe(audio, word_timestamps=True, language="en", vad_filter=True,
                              initial_prompt=VERBATIM_PROMPT if verbatim else None)
    words, segs = [], []
    for sg in segs_it:
        segs.append({"s": sg.start, "e": sg.end, "text": sg.text.strip()})
        words += [{"w": w.word.strip(), "s": w.start, "e": w.end} for w in sg.words]
    return words, segs, f"faster-whisper {name} (local)"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("--out", required=True)
    ap.add_argument("--start", type=float, default=0.0); ap.add_argument("--end", type=float)
    ap.add_argument("--local", action="store_true"); ap.add_argument("--model")
    ap.add_argument("--verbatim", dest="verbatim", action="store_true", default=None,
                    help="keep ums/uhs (default for --start/--end segment passes)")
    ap.add_argument("--clean", dest="verbatim", action="store_false", help="normal transcript, fillers dropped")
    a = ap.parse_args()
    if a.verbatim is None:
        a.verbatim = a.end is not None or a.start > 0
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    audio = str(Path(tempfile.gettempdir()) / f"vc_{os.getpid()}.wav")
    extract(a.src, a.start, a.end, audio)
    total = duration(audio)
    try:
        if a.local:
            raise RuntimeError("--local")
        words, segs, how = via_api(audio, total, a.verbatim)
    except Exception as e:
        print(f"API transcription unavailable ({e}); transcribing locally", flush=True)
        words, segs, how = via_local(audio, a.model, a.verbatim)
    if a.verbatim:
        how += ", verbatim"
    for w in words:                                   # back to source time
        w["s"] = round(w["s"] + a.start, 3); w["e"] = round(w["e"] + a.start, 3)
        w["w"] = w["w"].strip()
    for s in segs:
        s["s"] = round(s["s"] + a.start, 2); s["e"] = round(s["e"] + a.start, 2)
    json.dump(words, open(out / "words.json", "w", encoding="utf-8"), indent=0)
    with open(out / "transcript.md", "w", encoding="utf-8") as f:
        f.write(f"# {Path(a.src).name}  ({hms(a.start)} - {hms(a.start + total)}, {how})\n")
        f.write("# Speakers are NOT labelled: confirm who is talking before attributing a line.\n\n")
        for s in segs:
            if s["text"]:
                f.write(f"[{hms(s['s'])} - {hms(s['e'])}] {s['text']}\n")
    Path(audio).unlink(missing_ok=True)
    print(f"{how}: {len(words)} words, {len(segs)} lines -> {out / 'transcript.md'}")


if __name__ == "__main__":
    main()
