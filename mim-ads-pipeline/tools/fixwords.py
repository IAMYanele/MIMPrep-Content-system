"""Correct misheard words in <job>/words.json without re-transcribing, then rebuild chunks/transcript.

usage: python fixwords.py <job> "your law firm=your referees" "an interview=and interview" ...
Each fix replaces a run of words (matched case-insensitively, punctuation ignored) with new words,
spreading the run's time span evenly over them. A fix that matches nothing is an error.
"""
import json, re, sys
from pathlib import Path

sys.path.insert(0, r"C:\Users\yanel\.claude\skills\thomas-broll-reel\scripts")
from captions import chunk  # noqa: E402

job = Path(sys.argv[1])
words = json.load(open(job / "words.json"))
norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
for fx in sys.argv[2:]:
    old, new = (x.split() for x in fx.split("=", 1))
    hit = False
    for i in range(len(words) - len(old) + 1):
        if [norm(w["w"]) for w in words[i:i + len(old)]] == [norm(o) for o in old]:
            run = words[i:i + len(old)]
            s, e, end_sent = run[0]["s"], run[-1]["e"], run[-1].get("end_sent", False)
            step = (e - s) / len(new)
            # a new word ending in . or ? closes a sentence (the mark itself is not shown)
            rep = [{"w": n.rstrip(".?"), "s": round(s + k * step, 3), "e": round(s + (k + 1) * step, 3),
                    "end_sent": n[-1] in ".?"} for k, n in enumerate(new)]
            rep[-1]["end_sent"] = rep[-1]["end_sent"] or end_sent
            words[i:i + len(old)] = rep
            hit = True
            break
    if not hit:
        raise SystemExit(f"no match for '{fx}'")
json.dump(words, open(job / "words.json", "w"), indent=0)
json.dump(chunk(words), open(job / "chunks.json", "w"), indent=0)
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
print(open(job / "transcript.txt", encoding="utf-8").read())
