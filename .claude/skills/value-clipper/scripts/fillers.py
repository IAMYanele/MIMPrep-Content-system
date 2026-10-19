"""Level 2 helper: find every filler, um, repeat and stumble in a segment, with a cut for each.

The rule (from the user, 2026-10-19): remove ALL of them, the ums and uhs and every
redundancy, not only the ones that happen to sit in a pause. CV 08 test feedback: "so make
it clippable, that... make it clickable" was left in and should have gone.

What it finds:
  filler   um / uh / ah / er / hmm, "you know", "I mean", "sort of", "kind of", "so yeah"
  repeat   the same 1-5 words twice in a row ("make it, make it clickable")
  restart  a short phrase abandoned and said again ("so make it clippable, that make it clickable")
  hidden   voiced sound in a gap between words that isn't a word: an um or uh Whisper left out.
           Each one is transcribed on its own to hear what it is; real words (Whisper's timing
           was just off) are dropped from the list.
  soft     "like", "basically", "actually", "literally": only when they carry no meaning

Each finding gets a cut whose edges sit, in order of preference:
  PAUSE  in a real pause (pauses.json)                         -> remove
  DIP    at an energy dip between words (>= 18dB under speech) -> remove; listen on the read-back
  HARD   no pause and no dip: inside a word                     -> drop the whole sentence instead
A connector right before a restart ("so", "and", "but") goes with it.

usage:
  python fillers.py --seg <job>/segA --src "<raw.mp4>"
Needs the segment's words.json (from a verbatim segment pass) and pauses.json.
"""
import argparse, json, re
from pathlib import Path
from audio import Track

ONE = {"um", "uh", "uhm", "umm", "uhh", "ah", "er", "erm", "hmm", "mm", "mhm"}
MULTI = [("you", "know"), ("i", "mean"), ("sort", "of"), ("kind", "of"), ("so", "yeah"), ("you", "see")]
SOFT = {"basically", "literally", "actually", "like"}
CONNECT = {"so", "and", "but", "then", "like", "or"}
STOP = {"the", "a", "to", "of", "and", "in", "you", "i", "it", "is", "be", "for", "that", "so", "on"}
MIN_DIP = 18.0


def norm(w):
    return re.sub(r"[^\w']", "", w.lower())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seg", required=True); ap.add_argument("--src", required=True)
    ap.add_argument("--no-hidden", action="store_true", help="skip the per-burst check (faster)")
    a = ap.parse_args()
    seg = Path(a.seg)
    words = json.load(open(seg / "words.json", encoding="utf-8"))
    pj = json.load(open(seg / "pauses.json")) if (seg / "pauses.json").exists() else {"pauses": []}
    pauses = pj["pauses"]
    if not words:
        raise SystemExit("no words")
    trk = Track(a.src, words[0]["s"] - 1.0, words[-1]["e"] + 1.0)
    n = [norm(w["w"]) for w in words]

    def edge(t, before):
        """Best cut point near a word boundary t: a pause, else an energy dip, else HARD."""
        near = [p for p in pauses if p[1] >= t - 0.25 and p[0] <= t + 0.25]
        if near:
            return min(near, key=lambda p: abs(p[2] - t))[2], "PAUSE"
        v, depth = trk.valley(t, 0.12)
        return v, ("DIP" if depth >= MIN_DIP else "HARD")

    found = []

    def add(kind, i, j, note=""):
        while kind == "restart" and i > 0 and n[i - 1] in CONNECT and words[i]["s"] - words[i - 1]["e"] < 0.4:
            i -= 1                                    # "so make it clippable..." takes its "so" with it
        s_cut, k1 = edge((words[i - 1]["e"] + words[i]["s"]) / 2 if i else words[i]["s"] - 0.05, True)
        e_cut, k2 = edge((words[j]["e"] + words[j + 1]["s"]) / 2 if j + 1 < len(words) else words[j]["e"] + 0.05, False)
        grade = "HARD" if "HARD" in (k1, k2) else ("DIP" if "DIP" in (k1, k2) else "PAUSE")
        found.append({"kind": kind, "text": " ".join(w["w"] for w in words[i:j + 1]), "at": round(words[i]["s"], 2),
                      "cut": [round(s_cut, 3), round(e_cut, 3)], "grade": grade, "note": note})

    def restart_at(i):
        for k, max_gap in ((3, 6), (2, 4)):
            if k == 2 and set(n[i:i + 2]) <= STOP:
                continue
            for j in range(i + k + 1, min(len(n) - k + 1, i + k + max_gap + 1)):
                if n[i:i + k] == n[j:j + k] and words[j]["s"] - words[i]["s"] < 5:
                    return j
        return None

    i = 0
    while i < len(words):
        if n[i] in ONE:
            add("filler", i, i); i += 1; continue
        hit = next((p for p in MULTI if tuple(n[i:i + len(p)]) == p), None)
        if hit:
            add("filler", i, i + len(hit) - 1); i += len(hit); continue
        if n[i] in SOFT:
            add("soft", i, i, "only if it carries no meaning")
        done = False
        for k in range(5, 0, -1):                     # immediate repeat: drop the FIRST copy
            if i + 2 * k <= len(n) and n[i:i + k] == n[i + k:i + 2 * k] and any(len(x) > 1 for x in n[i:i + k]):
                if k == 1 and n[i] in {"that", "had", "very", "really", "no", "so"}:
                    continue
                add("repeat", i, i + k - 1, "said twice, keep the second"); i += k; done = True; break
        if done:
            continue
        j = restart_at(i)
        if j is not None:
            add("restart", i, j - 1, "abandoned start, the retake follows"); i = j
        else:
            i += 1

    hidden = []
    if not a.no_hidden:
        gaps = []
        for w0, w1 in zip(words, words[1:]):
            if w1["s"] - w0["e"] >= 0.2:
                for rs, re_ in trk.voiced_runs(w0["e"] + 0.04, w1["s"] - 0.04):
                    gaps.append((rs, re_))
        if gaps:
            from faster_whisper import WhisperModel
            import tempfile, subprocess, os
            m = None
            for name in ("small.en", "small", "base.en", "tiny"):
                try:
                    m = WhisperModel(name, device="cpu", compute_type="int8", local_files_only=True); break
                except Exception:
                    continue
            for rs, re_ in gaps:
                tmp = Path(tempfile.gettempdir()) / f"burst_{os.getpid()}.wav"
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{rs - 0.15:.3f}", "-t", f"{re_ - rs + 0.3:.3f}", "-i", a.src,
                                "-vn", "-ac", "1", "-ar", "16000", "-af", "apad=pad_dur=0.5", str(tmp)], check=True)
                segs, _ = m.transcribe(str(tmp), language="en", vad_filter=False,
                                       initial_prompt="Umm, uh, hmm, er, ah. So, uh, um.")
                heard = " ".join(s.text for s in segs).strip()
                tmp.unlink(missing_ok=True)
                h = [norm(x) for x in heard.split() if norm(x)]
                if not h or all(x in ONE for x in h):
                    s_cut, k1 = edge(rs, True); e_cut, k2 = edge(re_, False)
                    grade = "HARD" if "HARD" in (k1, k2) else ("DIP" if "DIP" in (k1, k2) else "PAUSE")
                    hidden.append({"kind": "hidden", "text": heard or "(voiced, no words)", "at": round(rs, 2),
                                   "cut": [round(s_cut, 3), round(e_cut, 3)], "grade": grade,
                                   "note": "um/uh Whisper left out of the transcript"})
    found = sorted(found + hidden, key=lambda f: f["at"])
    json.dump(found, open(seg / "fillers.json", "w", encoding="utf-8"), indent=1)
    for f in found:
        print(f"{f['at']:8.2f}  {f['kind']:7s} {f['grade']:5s}  cut {f['cut'][0]:.2f}-{f['cut'][1]:.2f}  \"{f['text']}\"  {f['note']}")
    print(f"{len(found)} findings -> {seg / 'fillers.json'}   (remove PAUSE and DIP cuts; HARD = drop the sentence)")


if __name__ == "__main__":
    main()
