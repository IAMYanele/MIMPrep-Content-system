#!/usr/bin/env python3
"""Joins vs camera-angle changes on the CUT clock, from the raw file + edl (decode only, no encode).
   plan_joins.py <raw.mp4> <work_dir>
Prints every join, every angle change, and the joins that are same-angle JUMPS (must be a switch or under a card)."""
import json, sys
import cv2

raw, W = sys.argv[1], sys.argv[2]
E = json.load(open(f"{W}/edl.json")); F = E["fps"]; keeps = [(a / F, b / F) for a, b in E["keeps"]]
cap = cv2.VideoCapture(raw); fps = cap.get(cv2.CAP_PROP_FPS); prev, ang, f = None, [], 0
while True:
    ok = cap.grab()
    if not ok: break
    if f % 1 == 0:
        ok, fr = cap.retrieve(); g = cv2.cvtColor(cv2.resize(fr, (96, 54)), cv2.COLOR_BGR2GRAY).astype("float32")
        if prev is not None and abs(g - prev).mean() > 18: ang.append(f / fps)
        prev = g
    f += 1
def to_cut(t):
    acc = 0
    for a, b in keeps:
        if a - 0.02 <= t <= b + 0.02: return round(acc + max(0, t - a), 2)
        acc += b - a
    return None
joins, acc = [], 0
for a, b in keeps[:-1]:
    acc += b - a; joins.append(round(acc, 2))
angc = sorted(set(x for x in (to_cut(t) for t in ang) if x is not None))
print("dur", round(sum(b - a for a, b in keeps), 2))
print("joins ", joins)
print("angles", angc)
print("JUMPS ", [j for j in joins if not any(abs(j - x) < 0.1 for x in angc)])
