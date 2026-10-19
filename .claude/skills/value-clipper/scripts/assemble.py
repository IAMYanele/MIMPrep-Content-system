"""Build a clip from a plan: snap every edge into a pause, read the result back, render, verify.

The plan (JSON) lists the blocks of the source in PLAY order, plus spans to remove:

  {"source": "F:/.../raw.mp4", "name": "CV Review 08 - Paris CV 5-10", "version": "in-order",
   "blocks": [{"from": 6.09, "to": 38.38, "note": "contact details"},
              {"from": 80.36, "to": 94.48, "note": "all experience in Paris"}],
   "remove": [[12.31, 13.02], [86.10, 86.95]]}

In-order version: blocks ascend in source time. Rearranged version: same blocks, new
order, with "why" on each moved block. Each block becomes one or more windows (the
"remove" spans are carved out of it), and every window edge moves to the midpoint of the
nearest real pause from pauses.json files (searched in --pauses dirs). An edge with no
pause nearby is padded 0.3s into the silence before a start and flagged, because cutting
on a word start shaves the consonant.

  python assemble.py plan.json --pauses <job>/seg1 --pauses <job>/seg2 --words <job>/seg1 ...   # dry run: read-back only
  python assemble.py plan.json ... --render --out "F:/.../CLIPPED/<name>.mp4"                  # render + verify

The dry run prints the joined script with "|" at every join and [MOVED] on blocks out of
source order. Read it aloud: it must play as one continuous thought, with no dangling
"and that's why..." and no "this"/"he" pointing at something that was cut.
Rendering: frame-accurate trim/atrim per window, 20ms audio fades at every join, concat,
original resolution and frame rate, two-pass loudnorm to -14 LUFS. Then the output is
re-transcribed (locally) and printed, so the words are checked in the actual file.
"""
import argparse, json, os, re, subprocess, sys, tempfile
from pathlib import Path


def load_many(dirs, fname):
    out = []
    for d in dirs:
        p = Path(d) / fname
        if p.exists():
            j = json.load(open(p, encoding="utf-8"))
            out += j["pauses"] if fname == "pauses.json" else j
    return out


def _inside(t, pauses):
    return next((q for q in pauses if q[0] - 0.02 <= t <= q[1] + 0.02), None)


def snap_block(t, pauses, start, track=None):
    """Outer edge of a block. These come off the transcript, and Whisper places words up to
    ~250ms early or late ("space" was transcribed 200ms before it was said, and a cut there
    clipped it). So let the words finish: an end edge takes the first pause after it, a start
    edge the last pause before it (keeping at most 0.35s of the pause). Neither: the energy dip
    right at t. Nothing: pad and flag."""
    q = _inside(t, pauses)
    if not q:
        if start:
            c = [x for x in pauses if t - 0.6 <= x[1] <= t + 0.15]
            q = max(c, key=lambda x: x[1]) if c else None
        else:
            c = [x for x in pauses if t - 0.15 <= x[0] <= t + 0.8]
            q = min(c, key=lambda x: x[0]) if c else None
    if q:
        return (max(q[2], q[1] - 0.35) if start else min(q[2], q[0] + 0.35)), "pause"
    if track is not None:
        v, depth = track.valley(t, 0.12)
        if depth >= 18:
            return v, "dip"
    return (t - 0.3 if start else t + 0.15), "none"


def snap_cut(t, pauses, start, track=None):
    """Edge of a removal. fillers.py already put these in a pause or an energy dip, so stay put:
    the pause they sit in (or one within 0.15s), else the dip within 0.12s."""
    q = _inside(t, pauses) or next((x for x in pauses if abs(x[2] - t) <= 0.15), None)
    if q:
        return (max(q[2], q[1] - 0.35) if start else min(q[2], q[0] + 0.35)), "pause"
    if track is not None:
        v, depth = track.valley(t, 0.12)
        if depth >= 18:
            return v, "dip"
    return t, "none"


def windows(plan, pauses, track=None, sets=()):
    """Edges are tagged by origin: "block" (rough, from the transcript), "cut" (a removal fillers.py
    placed exactly) or "gap" (dead air being tightened: already inside silence, used as is)."""
    rem = [(x, y, "cut") for x, y in plan.get("remove", [])]
    tight = plan.get("tighten")              # e.g. 0.4: shorten any pause longer than this to 0.3s
    if tight:
        for s, e, m in pauses:
            if e - s > tight and not any(x - 0.05 <= s and e <= y + 0.05 for x, y, _ in rem):
                rem.append((s + 0.15, e - 0.15, "gap"))   # a tutor writing on the board: 2-4s of dead air
    rem.sort()
    merged = []
    for x, y, k in rem:                      # overlapping removals merge; the outer edges keep their kind
        if merged and x <= merged[-1][1]:
            px, py, pk = merged[-1]
            merged[-1] = (px, max(py, y), pk if py >= y else k)
        else:
            merged.append((x, y, k))
    snap = {"block": snap_block, "cut": snap_cut, "gap": lambda t, *a: (t, "pause")}
    out = []
    for bi, b in enumerate(plan["blocks"]):
        pieces, cur, cur_kind = [], b["from"], "block"
        for x, y, k in merged:
            if b["from"] < x < b["to"]:
                pieces.append((cur, cur_kind, x, k)); cur, cur_kind = max(cur, y), k
        pieces.append((cur, cur_kind, b["to"], "block"))
        for s, s_kind, e, e_kind in pieces:
            ss, k1 = snap[s_kind](s, pauses, True, track)
            ee, k2 = snap[e_kind](e, pauses, False, track)
            if ee - ss > 0.15:
                out.append({"block": bi, "s": round(ss, 3), "e": round(ee, 3), "ok_start": k1 != "none", "ok_end": k2 != "none",
                            "how": (k1, k2),
                            "note": b.get("note", ""), "why": b.get("why", "")})
    return out


def no_overlap(wins):
    """Neighbouring windows that both snapped outward can overlap in the source and replay ~0.2s
    twice. Where one window continues straight on from the last, start it where the last ended."""
    for a, b in zip(wins, wins[1:]):
        if a["s"] < b["s"] < a["e"]:
            b["s"] = a["e"]
    return [w for w in wins if w["e"] - w["s"] > 0.15]


def moved_blocks(plan):
    """The fewest blocks that explain the reorder: everything outside the longest run that still
    plays in source order. Moving one block to the front marks that block only, not the rest."""
    src = [b["from"] for b in plan["blocks"]]
    n = len(src); best = [1] * n; prev = [-1] * n
    for i in range(n):
        for j in range(i):
            if src[j] < src[i] and best[j] + 1 > best[i]:
                best[i], prev[i] = best[j] + 1, j
    i = max(range(n), key=lambda k: best[k]) if n else -1
    keep = set()
    while i != -1:
        keep.add(i); i = prev[i]
    return set(range(n)) - keep


def load_word_sets(dirs):
    """One word list per transcript, so a window reads from the tightest transcript covering it
    (a segment's own transcript beats the full-file one: it catches stutters the long pass merges)."""
    sets = []
    for d in dirs:
        p = Path(d) / "words.json"
        if p.exists():
            ws = json.load(open(p, encoding="utf-8"))
            if ws:
                sets.append((ws[0]["s"], ws[-1]["e"], ws))
    return sets


def text_of(sets, s, e):
    cover = [x for x in sets if x[0] <= s + 1.0 and x[1] >= e - 1.0] or sets
    ws = min(cover, key=lambda x: x[1] - x[0])[2] if cover else []
    # by START time: Whisper stretches a word's END into the silence after it, so a midpoint can
    # land in a tightened gap and the word vanishes from the read-back although it's in the audio
    return " ".join(w["w"] for w in ws if s - 0.05 <= w["s"] < e - 0.05)


def render(src, wins, out):
    parts = []
    for i, w in enumerate(wins):
        d = w["e"] - w["s"]; f = min(0.012 if "dip" in w.get("how", ()) else 0.02, d / 4)   # dip cuts: shorter fade
        parts.append(f"[0:v]trim=start={w['s']:.3f}:end={w['e']:.3f},setpts=PTS-STARTPTS[v{i}]")
        parts.append(f"[0:a]atrim=start={w['s']:.3f}:end={w['e']:.3f},asetpts=PTS-STARTPTS,"
                     f"afade=t=in:d={f:.3f},afade=t=out:st={d - f:.3f}:d={f:.3f}[a{i}]")
    parts.append("".join(f"[v{i}][a{i}]" for i in range(len(wins))) + f"concat=n={len(wins)}:v=1:a=1[v][a]")
    tmp = str(Path(out).with_suffix(".tmp.mp4"))
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", src, "-filter_complex", ";".join(parts),
                    "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
                    "-fps_mode", "cfr", "-c:a", "aac", "-b:a", "192k", tmp], check=True)
    p1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-vn", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                         "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(p1[p1.rfind("{"):p1.rfind("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
          f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", tmp, "-c:v", "copy", "-af", ln, "-c:a", "aac",
                    "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", out], check=True)
    os.remove(tmp)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plan"); ap.add_argument("--pauses", action="append", default=[])
    ap.add_argument("--words", action="append", default=[])
    ap.add_argument("--render", action="store_true"); ap.add_argument("--out")
    a = ap.parse_args()
    plan = json.load(open(a.plan, encoding="utf-8"))
    pauses = load_many(a.pauses, "pauses.json")
    words = load_word_sets(a.words)
    if not pauses:
        sys.exit("no pauses.json found: run pauses.py on every region the plan uses")
    from audio import Track
    wins = no_overlap(windows(plan, pauses, Track(plan["source"]), words))
    total = sum(w["e"] - w["s"] for w in wins)
    print(f"{plan.get('name', '')}  [{plan.get('version', 'in-order')}]  {len(wins)} windows, {total:.1f}s\n")
    moved, prev_block = moved_blocks(plan), None
    for w in wins:
        if w["block"] != prev_block:
            print(f"--- block {w['block'] + 1}: {w['note']}"
                  + (f"   [MOVED] {w['why'] or '(say why it moved)'}" if w["block"] in moved else ""))
        bad = [n for n, ok in (("start", w["ok_start"]), ("end", w["ok_end"])) if not ok]
        dips = [n for n, k in zip(("start", "end"), w["how"]) if k == "dip"]
        flag = (f"   <- no pause or dip at the {' and '.join(bad)}: padded, listen to this edge" if bad
                else (f"   (cut at an energy dip: {' and '.join(dips)})" if dips else ""))
        print(f"  {w['s']:8.2f}-{w['e']:8.2f} | {text_of(words, w['s'], w['e'])}{flag}")
        prev_block = w["block"]
    if total > 90:
        print(f"\nNOTE: {total:.0f}s. Fine only if every block earns its place; cut the weakest block first.")
    if not a.render:
        print("\n(dry run: read it aloud, then add --render --out <file.mp4>)")
        return
    if not a.out:
        sys.exit("--out is required with --render")
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    render(plan["source"], wins, a.out)
    json.dump({"plan": plan, "windows": wins}, open(Path(a.out).with_suffix(".cuts.json"), "w"), indent=1)
    err = subprocess.run(["ffmpeg", "-v", "error", "-i", a.out, "-f", "null", "-"], capture_output=True, text=True).stderr
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.out],
                             capture_output=True, text=True).stdout.strip())
    print(f"\nrendered {a.out}: {d:.2f}s (planned {total:.2f}s)" + (f"\nDECODE ERRORS: {err[:200]}" if err.strip() else ", decodes clean"))
    vdir = Path(tempfile.gettempdir()) / f"vc_verify_{os.getpid()}"
    subprocess.run([sys.executable, str(Path(__file__).with_name("transcribe.py")), a.out, "--out", str(vdir), "--local"],
                   check=True, capture_output=True)
    print("\nwhat the rendered file actually says (re-transcribed):")
    print(" ".join(w["w"] for w in json.load(open(vdir / "words.json", encoding="utf-8"))))


if __name__ == "__main__":
    main()
