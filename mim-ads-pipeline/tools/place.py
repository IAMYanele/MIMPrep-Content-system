"""Place a body's approved cutaways on one hook's job by anchoring each to the words it covers.

usage: python place.py <job> <spec.json>
spec: {"cta": "book a free call",
       "cuts": [{"clip": ..., "in": .., "dur": .., "cx": .., "why": .., "anchor": "at most top", "lead": 0.08}]}
Writes <job>/cutaways.json and <job>/cta_start.txt (start of the CTA phrase).
Refuses a cutaway that would run into the CTA or leave under ~1 s of face before the next one.
"""
import json, re, sys
from pathlib import Path

job, spec = Path(sys.argv[1]), json.load(open(sys.argv[2]))
words = json.load(open(job / "words.json"))
toks = [re.sub(r"[^a-z0-9']", "", w["w"].lower()) for w in words]


def find(phrase, after=0.0, back=0):
    p = phrase.lower().split()
    for i in range(len(toks) - len(p) + 1):
        if words[i]["s"] >= after and toks[i:i + len(p)] == p:
            return words[max(0, i - back)]["s"]
    raise SystemExit(f"{job.name}: anchor not found: '{phrase}' after {after:.2f}s")


cta = find(spec["cta"], 8.0)
hook_end = next(w["e"] for w in words if w.get("end_sent"))
out, prev_end = [], 0.0
for c in spec["cuts"]:
    at = round(find(c["anchor"], hook_end, c.get("back", 0)) - c.get("lead", 0.08), 2)
    end = at + c["dur"]
    if end > cta - 0.3:
        raise SystemExit(f"{job.name}: '{c['anchor']}' cutaway runs into the CTA ({end:.2f} > {cta:.2f})")
    if prev_end and at - prev_end < 0.9:
        raise SystemExit(f"{job.name}: only {at - prev_end:.2f}s of face before '{c['anchor']}'")
    out.append({k: c[k] for k in ("clip", "in", "dur", "cx", "why")} | {"at": at})
    prev_end = end
json.dump(out, open(job / "cutaways.json", "w"), indent=1)
(job / "cta_start.txt").write_text(f"{cta:.2f}")
print(f"{job.name}: cutaways at {[o['at'] for o in out]}  CTA {cta:.2f}")
