#!/usr/bin/env python3
"""Rebuild a build.py from its header (everything before the creator-blocks marker) and a new tail file.
   splice.py <build.py> <tail.py> "<FACE line>" "<FULL line>" "<comment>"
The old FACE/FULL definitions are replaced, and SP/BJ shortcuts are added after the helper aliases."""
import re, sys

p, tailp, face, full, note = sys.argv[1:6]
s = open(p, encoding="utf-8").read()
head = s[:s.index("# ---------------------------------------------------------------- creator blocks")]
head = re.sub(r"(# v3 \(animation brain\)[^\n]*\n)?FACE = \[.*?\]\]\n", "", head, count=1, flags=re.S)
head = re.sub(r"FULL = \[.*?\]\]\n", "", head, count=1, flags=re.S)
head = head.replace("H.captions(", "# %s\nFACE = %s\nFULL = %s\n\nH.captions(" % (note, face, full), 1)
if "SP, BJ = H.spring, H.brain_js" not in head:
    head = re.sub(r"(\nL, IM, [^\n]*\n)", r"\1SP, BJ = H.spring, H.brain_js\n", head, count=1)
open(p, "w", encoding="utf-8").write(head + open(tailp, encoding="utf-8").read())
print("spliced", p)
