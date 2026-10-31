"""Re-map a job's captions onto the MASTER SCRIPT wording, keeping the ASR timings.

Whisper mishears this pack badly ("round"->"one", "Book a free call"->"Look a free code").
Captions must carry the SCRIPT text, so we align the script's words to words.json and keep
each word's measured time; inserted/!=-length runs share their span evenly.

usage: python scriptalign.py <job_id>          # script comes from tools/scripts.json
       python scriptalign.py <job_id> --dry    # show the diff, write nothing
"""
import json, re, sys, difflib
from pathlib import Path

sys.path.insert(0, r"C:\Users\yanel\.claude\skills\thomas-broll-reel\scripts")
from captions import chunk  # noqa: E402

ROOT = Path(r"G:/mim-master-urgency-2026-10")
jid = sys.argv[1]
dry = "--dry" in sys.argv
spec = json.load(open(ROOT / "tools/scripts.json"))[jid]
job = ROOT / "jobs" / jid
words = json.load(open(job / "words.json"))

norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
tgt = [t for t in spec["script"].split() if norm(t)]
a = [norm(w["w"]) for w in words]
b = [norm(t) for t in tgt]

out, sm = [], difflib.SequenceMatcher(None, a, b, autojunk=False)
ops = sm.get_opcodes()
for tag, i1, i2, j1, j2 in ops:
    if tag == "equal":
        for k in range(i2 - i1):
            w = dict(words[i1 + k]); w["w"] = tgt[j1 + k].strip('.,?!"')
            w["end_sent"] = tgt[j1 + k].rstrip('"').endswith((".", "?", "!"))
            out.append(w)
    elif tag in ("replace", "delete", "insert"):
        new = tgt[j1:j2]
        if not new:
            continue
        if i2 > i1:                       # time span of the words being replaced
            s, e = words[i1]["s"], words[i2 - 1]["e"]
        else:                             # pure insertion: borrow from the seam
            s = words[i1 - 1]["e"] if i1 > 0 else words[0]["s"]
            e = words[i1]["s"] if i1 < len(words) else words[-1]["e"]
            if e <= s: e = s + 0.08 * len(new)
        step = (e - s) / len(new)
        for k, t in enumerate(new):
            out.append({"w": t.strip('.,?!"'), "s": round(s + k * step, 3),
                        "e": round(s + (k + 1) * step, 3),
                        "end_sent": t.rstrip('"').endswith((".", "?", "!"))})

changed = sum(1 for x, y in zip([w["w"] for w in words], [w["w"] for w in out]) if norm(x) != norm(y))
print(f"  {jid}: asr {len(words)} words -> script {len(out)} words  ({changed}+ differ)")
if dry:
    sm2 = difflib.SequenceMatcher(None, a, b, autojunk=False)
    for tag, i1, i2, j1, j2 in sm2.get_opcodes():
        if tag != "equal":
            print(f"    {tag:7s} {' '.join(w['w'] for w in words[i1:i2])!r}  ->  {' '.join(tgt[j1:j2])!r}")
    sys.exit()
json.dump(out, open(job / "words.json", "w"), indent=1)
chunks = chunk(out)
json.dump(chunks, open(job / "chunks.json", "w"), indent=1)
lines, cur = [], []
for w in out:
    cur.append(w)
    if w.get("end_sent"):
        lines.append(f"{cur[0]['s']:6.2f}-{cur[-1]['e']:6.2f}  " + " ".join(x["w"] for x in cur)); cur = []
if cur:
    lines.append(f"{cur[0]['s']:6.2f}-{cur[-1]['e']:6.2f}  " + " ".join(x["w"] for x in cur))
(job / "transcript.txt").write_text("\n".join(lines), encoding="utf-8")
print(f"  wrote words.json, chunks.json ({len(chunks)} pills), transcript.txt")
