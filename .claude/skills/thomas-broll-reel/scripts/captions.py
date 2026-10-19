"""Transcribe base.mp4 with word timestamps and build the 2-word caption chunks.

Transcribes the FINISHED base (already tightened), so every time is in output time.
OpenAI whisper-1 first (fast, needs OPENAI_API_KEY and credits); local faster-whisper
if the API fails. Writes:

  <job>/words.json        every word with start/end (output time)
  <job>/chunks.json       caption chunks for the comp
  <job>/transcript.txt    one sentence per line with timestamps, for planning cutaways

Chunking matches the reference reel: 2 words per pill, 1 when the pair is longer than
17 characters, never pairing across a sentence end. Each chunk holds until the next
starts so a pill never blinks out mid-sentence. Full stops and commas are dropped on
screen.

usage:
  python captions.py --job <job> [--fix "Mim=MiM" --fix "Esec=ESSEC"] [--local]
"""
import argparse, json, os, re, subprocess, tempfile
from pathlib import Path

GLOSSARY = {"mim": "MiM", "lbs": "LBS", "hec": "HEC", "essec": "ESSEC", "escp": "ESCP", "lse": "LSE",
            "gmat": "GMAT", "mba": "MBA", "cv": "CV", "insead": "INSEAD", "ehl": "EHL"}


def api_words(audio):
    import requests
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        raise RuntimeError("no OPENAI_API_KEY")
    with open(audio, "rb") as f:
        r = requests.post("https://api.openai.com/v1/audio/transcriptions",
                          headers={"Authorization": f"Bearer {key}"},
                          files={"file": (Path(audio).name, f, "audio/mpeg")},
                          data={"model": "whisper-1", "response_format": "verbose_json",
                                "timestamp_granularities[]": "word", "language": "en"}, timeout=300)
    if r.status_code != 200:
        raise RuntimeError(f"OpenAI {r.status_code}: {r.text[:200]}")
    j = r.json()
    return [{"w": w["word"], "s": w["start"], "e": w["end"]} for w in j.get("words", [])], j.get("text", "")


def local_words(audio):
    from faster_whisper import WhisperModel
    m = None
    for name in ("small.en", "small", "base.en", "medium.en"):     # use a model that's already fully cached:
        try:                                                        # a stalled first download hung this for 10+ min
            m = WhisperModel(name, device="cpu", compute_type="int8", local_files_only=True)
            break
        except Exception:
            continue
    if m is None:
        print("no cached whisper model; downloading small.en", flush=True)
        name = "small.en"; m = WhisperModel(name, device="cpu", compute_type="int8")
    segs, _ = m.transcribe(audio, word_timestamps=True, language="en")
    words, text = [], []
    for sg in segs:
        text.append(sg.text)
        for w in sg.words:
            words.append({"w": w.word.strip(), "s": w.start, "e": w.end})
    return words, " ".join(text), f"faster-whisper {name}"


def punctuate(words, text):
    """whisper-1 word lists carry no punctuation: copy sentence ends back from the full text."""
    toks = re.findall(r"\S+", text)
    j = 0
    for w in words:
        bare = re.sub(r"[^\w%'.]", "", w["w"]).lower().strip(".")
        for k in range(j, min(j + 6, len(toks))):
            if re.sub(r"[^\w%'.]", "", toks[k]).lower().strip(".,!?") == bare:
                w["end_sent"] = bool(re.search(r"[.!?]$", toks[k])); j = k + 1
                break
    return words


def clean(words, fixes):
    out = []
    for w in words:
        t = w["w"].strip()
        if t in ("%", "percent") and out:            # "%" comes back as its own empty-looking token
            out[-1]["w"] += "%"; out[-1]["e"] = w["e"]; continue
        t = re.sub(r"[,.;:!?\"]+$", "", re.sub(r'^["(]+', "", t))
        if not t:
            continue
        t = GLOSSARY.get(t.lower(), t)
        t = fixes.get(t, t)
        out.append({"w": t, "s": float(w["s"]), "e": float(w["e"]), "end_sent": w.get("end_sent", False)})
    # zero-length words (whisper emits them) would become invisible chunks: borrow time from neighbours
    for i, w in enumerate(out):
        if w["e"] - w["s"] < 0.06:
            lo = out[i - 1]["e"] if i else w["s"] - 0.1
            hi = out[i + 1]["s"] if i + 1 < len(out) else w["e"] + 0.1
            w["s"], w["e"] = max(lo, w["s"] - 0.05), min(hi, max(w["e"], w["s"]) + 0.08)
    return out


def chunk(words, max_pair=17, gap_hold=1.0):
    chunks, i = [], 0
    while i < len(words):
        a = words[i]
        if i + 1 < len(words) and not a["end_sent"] and len(a["w"]) + 1 + len(words[i + 1]["w"]) <= max_pair:
            b = words[i + 1]; chunks.append({"text": f"{a['w']} {b['w']}", "start": a["s"], "end": b["e"]}); i += 2
        else:
            chunks.append({"text": a["w"], "start": a["s"], "end": a["e"]}); i += 1
    for c, n in zip(chunks, chunks[1:]):
        c["end"] = n["start"] if n["start"] - c["end"] < gap_hold else c["end"] + 0.15
    for c in chunks:
        c["start"], c["end"] = round(c["start"], 3), round(max(c["end"], c["start"] + 0.12), 3)
    return chunks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--job", required=True)
    ap.add_argument("--fix", action="append", default=[], help="word fix as Wrong=Right")
    ap.add_argument("--local", action="store_true", help="skip the API, use faster-whisper")
    a = ap.parse_args()
    job = Path(a.job)
    audio = Path(tempfile.gettempdir()) / f"tb_{os.getpid()}.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(job / "public" / "base.mp4"), "-vn", "-ac", "1",
                    "-ar", "16000", "-b:a", "64k", str(audio)], check=True)
    try:
        if a.local:
            raise RuntimeError("--local")
        words, text = api_words(str(audio)); how = "OpenAI whisper-1"
    except Exception as e:
        print(f"API transcription unavailable ({e}); using local faster-whisper")
        words, text, how = local_words(str(audio))
    words = clean(punctuate(words, text), dict(f.split("=", 1) for f in a.fix))
    chunks = chunk(words)
    json.dump(words, open(job / "words.json", "w"), indent=0)
    json.dump(chunks, open(job / "chunks.json", "w"), indent=0)
    lines, cur = [], []
    for w in words:
        cur.append(w)
        if w["end_sent"]:
            lines.append(cur); cur = []
    if cur:
        lines.append(cur)
    with open(job / "transcript.txt", "w", encoding="utf-8") as f:
        for ln in lines:
            f.write(f"{ln[0]['s']:6.2f}-{ln[-1]['e']:6.2f}  {' '.join(w['w'] for w in ln)}\n")
    print(f"{how}: {len(words)} words -> {len(chunks)} chunks. Read {job / 'transcript.txt'} and check names.")


if __name__ == "__main__":
    main()
