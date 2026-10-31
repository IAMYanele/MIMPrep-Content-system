"""Prove a job's captions carry the master script, word for word.

Compares the words actually in <job>/chunks.json (what gets burned on screen) against
scripts.json. Punctuation and case are ignored - those are not shown on the pill.

usage: python verify_captions.py            # every job that exists
       python verify_captions.py A1 B2      # only these
"""
import json, re, sys
from pathlib import Path

ROOT = Path(r"G:/mim-master-urgency-2026-10")
specs = json.load(open(ROOT / "tools/scripts.json"))
ids = [a for a in sys.argv[1:] if not a.startswith("-")] or sorted(specs)
norm = lambda s: re.sub(r"[^a-z0-9' ]", " ", s.lower())
tok = lambda s: norm(s).split()

bad = 0
for jid in ids:
    job = ROOT / "jobs" / jid
    ch = job / "chunks.json"
    if not ch.exists():
        print(f"  {jid:3s} -- no chunks.json (not built yet)"); continue
    chunks = json.load(open(ch))
    on_screen = []
    for c in chunks:
        t = c.get("text") if isinstance(c, dict) else str(c)
        on_screen += tok(t or "")
    want = tok(specs[jid]["script"])
    if on_screen == want:
        print(f"  {jid:3s} OK   {len(want)} words, {len(chunks)} pills")
    else:
        bad += 1
        import difflib
        print(f"  {jid:3s} MISMATCH  on-screen {len(on_screen)} vs script {len(want)}")
        for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, on_screen, want).get_opcodes():
            if tag != "equal":
                print(f"        {tag:7s} screen={' '.join(on_screen[i1:i2])!r} script={' '.join(want[j1:j2])!r}")
print(f"\n  {len(ids)-bad}/{len(ids)} match the master script")
sys.exit(1 if bad else 0)
