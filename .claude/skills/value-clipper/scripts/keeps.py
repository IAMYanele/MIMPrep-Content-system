"""Turn the words you KEEP into an assemble.py plan with measured cut edges.

Pick the kept words by index from a chunk_words.py words.json, and this writes the plan:
one exact block, and a removal for every gap between kept ranges. Each edge sits at the
quietest point between the last kept word and the first removed one: a measured pause when
there is one, else the deepest 10ms energy dip. The plan is marked "exact_edges", so
assemble.py uses the edges as given (re-snapping a measured edge to the deepest dip within
0.12s once moved a cut after "advice" into the "The" of the next line).

usage: python keeps.py <spec.json>
spec:
  {"source": "F:/.../raw.mp4", "name": "GMAT - One mock exam a week",
   "words": "<job>/mocks_c",            # chunk_words.py output (words.json)
   "pauses": "<job>/mocks",             # pauses.json of the SAME source file, never another one
   "tighten": 0.45, "out": "<job>/plan_mocks.json",
   "keep": [[2, 17], [29, 34], ...],    # inclusive word-index ranges, in order
   "first": 16.95, "last": 89.9,        # optional: hand-measured clip start / end
   "override": {"4": [50.33, null]}}    # optional: hand-measured edge for removal #4 (null = keep computed)
Also writes <out>.expected.json: the kept words in order, spelled from <words>/words_fixed.json
when it exists (same indices, caption spelling), for zoom-session-reel's captions.
Edges shallower than 18dB under speech are flagged: those are the joins to profile by ear.
"""
import json, os, sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audio import Track

spec = json.load(open(sys.argv[1], encoding="utf-8"))
W = json.load(open(Path(spec["words"]) / "words.json", encoding="utf-8"))
P = json.load(open(Path(spec["pauses"]) / "pauses.json"))["pauses"]
trk = Track(spec["source"])


def boundary(p, q):
    """Quietest point between word p and the next word q: (time, depth in dB; 99 = in a pause)."""
    a, b = sorted((W[p]["e"], W[q]["s"]))
    a, b = a - 0.1, b + 0.1
    inside = [x for x in P if x[1] > a and x[0] < b]
    if inside:
        x = max(inside, key=lambda x: min(x[1], b) - max(x[0], a))
        return x[2], 99.0
    k0, k1 = trk.idx(a), trk.idx(b)
    k = k0 + int(trk.db[k0:k1 + 1].argmin())
    return round(trk.t0 + k * 0.01, 3), round(trk.peak - float(trk.db[k]), 1)


keep = spec["keep"]
first = boundary(keep[0][0] - 1, keep[0][0])[0] if keep[0][0] > 0 else W[0]["s"] - 0.3
last = boundary(keep[-1][1], keep[-1][1] + 1)[0] if keep[-1][1] + 1 < len(W) else W[-1]["e"] + 0.3
remove = []
for (i0, j0), (i1, j1) in zip(keep, keep[1:]):
    s, ds = boundary(j0, j0 + 1)
    e, de = boundary(i1 - 1, i1)
    remove.append([round(s, 3), round(e, 3)])
    gone = " ".join(w["w"] for w in W[j0 + 1:i1])
    warn = "   <- shallow edge, profile it" if min(ds, de) < 18 else ""
    print(f"  cut {len(remove) - 1:2d}  {s:7.2f}-{e:7.2f} ({ds:>4} / {de:>4} dB)  [{gone}]{warn}")
for k, (s0, e0) in spec.get("override", {}).items():
    k = int(k)
    if s0 is not None: remove[k][0] = s0
    if e0 is not None: remove[k][1] = e0
    print(f"  override cut {k}: {remove[k]}")
first = spec.get("first", first); last = spec.get("last", last)
plan = {"source": spec["source"], "name": spec["name"], "version": "in-order", "exact_edges": True,
        "tighten": spec.get("tighten", 0.45),
        "blocks": [{"from": round(first, 3), "to": round(last, 3), "exact": True, "note": spec.get("note", "")}],
        "remove": remove}
json.dump(plan, open(spec["out"], "w", encoding="utf-8"), indent=1)
fixed = Path(spec["words"]) / "words_fixed.json"
FW = json.load(open(fixed, encoding="utf-8")) if fixed.exists() else W
json.dump([FW[k]["w"] for i, j in keep for k in range(i, j + 1)],
          open(str(spec["out"]).replace(".json", ".expected.json"), "w", encoding="utf-8"))
print("KEPT: " + " | ".join(" ".join(w["w"] for w in W[i:j + 1]) for i, j in keep))
print(f"plan -> {spec['out']}")
