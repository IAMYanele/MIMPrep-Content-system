"""Reference-style b-roll: runs of one or more pre-baked pieces (single 9:16 or 2-up/3-up stacks), each run
anchored to the words it covers, a white flash where a run hands back to the face and between pieces.

usage: python place2.py <job> <spec.json>
spec: {"cta": "book a free call",
       "runs": [{"anchor": "at most top", "back": 0, "lead": 0.08, "why": "...",
                 "pieces": [{"dur": 3.0, "panels": [{"src":..,"in":..,"cx":..,"cy":..,"zoom":..}, ...]}, ...]}]}
Pieces are baked once per body into G:/mim-master-urgency-2026-10/baked/<spec>_<run>_<piece>.mp4 (same for every
hook, since the body is the same) and only rebuilt when their panels change.
Writes <job>/cutaways.json, <job>/flashes.json and <job>/cta_start.txt.
"""
import hashlib, json, os, re, sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
from bake import bake

job, spec_path = Path(sys.argv[1]), Path(sys.argv[2])
spec = json.load(open(spec_path))
BAKED = Path(r"G:/mim-master-urgency-2026-10/baked"); BAKED.mkdir(exist_ok=True)
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
cuts, flashes, prev_end = [], [], 0.0
for r, run in enumerate(spec["runs"]):
    at = round(find(run["anchor"], hook_end, run.get("back", 0)) - run.get("lead", 0.08), 2)
    if prev_end and at - prev_end < 1.0:
        raise SystemExit(f"{job.name}: only {at - prev_end:.2f}s of face before run {r + 1} '{run['anchor']}'")
    t = at
    for k, pc in enumerate(run["pieces"]):
        key = hashlib.md5(json.dumps(pc, sort_keys=True).encode()).hexdigest()[:8]
        out = BAKED / f"{spec_path.stem}_{r + 1}{chr(97 + k)}_{key}.mp4"
        if not out.exists():
            bake(str(out), pc["dur"], pc["panels"])
        cuts.append({"clip": str(out).replace("\\", "/"), "in": 0.0, "dur": pc["dur"], "at": round(t, 2), "cx": None,
                     "why": f"run {r + 1}{chr(97 + k)}: {run.get('why', '')}"})
        if k:
            flashes.append(round(t, 2))          # between pieces of one run
        t += pc["dur"]
    if t > cta - 0.25:
        raise SystemExit(f"{job.name}: run {r + 1} '{run['anchor']}' runs into the CTA ({t:.2f} > {cta:.2f})")
    if run.get("flash_out", True):
        flashes.append(round(t, 2))              # b-roll hands back to the face
    prev_end = t
json.dump(cuts, open(job / "cutaways.json", "w"), indent=1)
json.dump(flashes, open(job / "flashes.json", "w"))
(job / "cta_start.txt").write_text(f"{cta:.2f}")
share = sum(c["dur"] for c in cuts) / words[-1]["e"]
print(f"{job.name}: runs at {[c['at'] for c in cuts]}  flashes {flashes}  CTA {cta:.2f}  b-roll {share:.0%}")
