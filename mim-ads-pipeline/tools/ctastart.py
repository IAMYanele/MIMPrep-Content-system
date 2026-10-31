"""Print the time the CTA line ("Book a free call now...") starts, for render_job.py."""
import json, sys
from pathlib import Path
job = Path(r"G:/mim-master-urgency-2026-10/jobs") / sys.argv[1]
words = json.load(open(job / "words.json"))
for i, w in enumerate(words):
    if w["w"].lower().strip('.,"') == "book" and i + 3 < len(words) \
       and [x["w"].lower() for x in words[i+1:i+4]] == ["a", "free", "call"]:
        print(f"{w['s']:.2f}"); sys.exit()
sys.exit("CTA line not found")
