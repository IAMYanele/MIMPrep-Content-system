#!/usr/bin/env python3
"""Margaux 2 - 3 things nobody tells you about the LBS MFA.   python3 build.py
Hormozi solid-card look in MiM Prep blue (#004AAD): creator full screen <-> full-screen blue cards (hz.py).
All times are GLOBAL seconds on the cut. Switches sit on the cut's joins: same-angle joins (visible jumps) are always
a switch or under a card; angle changes may stay inside a creator block.
Cards are drawn at full size in frame coordinates (graphic y ~380-1250, caption at 1330)."""
import os
import reel_engine as E
import kit as K
import hz as H

ROOT = os.path.dirname(os.path.abspath(__file__))
DUR = 73.24
s = lambda t: round(t - 0.002, 3)          # exact switch value for a join at t
MEDIA = "G:/margaux-2026-10/raw/Margaux Podcast Studio (October 16th)/Margaux 2 - 3 things nobody tells you - Edit/hf-media"
H.setup_project(ROOT, MEDIA + "/cam_full.mp4", MEDIA + "/cam_top.mp4")
OBJ = ['fistbump', 'cheers', 'calendar_aug', 'cv', 'laptop_test', 'handshake', 'alarm', 'coffee', 'bizcard', 'lanyard', 'exam_stack', 'puzzle', 'books']
H.assets_into(ROOT, OBJ, "G:/margaux-2026-10/assets_flat")

# v3 (animation brain): 7 cards. The "good grades + job" card is cut - the face carries it, with a punch-in over the 35.44 jump.
FACE = [[0, s(7.52)], [s(20.12), s(26.96)], [s(32.56), s(42.56)], [s(54.16), s(59.44)], [s(64.6), s(68.04)]]
FULL = [[s(7.52), s(20.12)], [s(26.96), s(32.56)], [s(42.56), s(54.16)], [s(59.44), s(64.6)], [s(68.04), DUR]]

H.captions(ROOT + "/words.json", ROOT + "/captions.json", [
    "I'm gonna share", "three things", "nobody really tells you", "about the LBSMFA",
    "So the first thing", "is the workload", "at the start", "which is crazy", "You just arrived", "you just want", "to make friends",
    "you want to go out", "but the summer", "internships applications", "already open", "in August",
    "So you also", "have to apply", "do online assessments", "prepare for interviews", "and all of this", "at the same time",
    "So my second surprise", "was about", "the networking", "which is taking", "a lot of our time", "So on top", "of everything else",
    "you have to do", "coffee chats", "you have to", "network a lot", "you have to do", "the networking events", "from LBS",
    "and you have to do", "everything", "at the same time", "while studying", "get good grades", "and still have", "to find a job",
    "And the third thing", "that nobody tells you", "is about the classes", "that are", "super intense",
    "So exams start", "in October", "you have", "group projects", "and you need", "to prepare", "for your midterms", "as well", "and so",
    "the biggest key", "is to stay organized", "otherwise", "you just lose track", "super fast", "it's not going", "to be efficient",
    "So now what", "would I really", "do differently", "So from day one", "I'll just build", "a small group", "with people",
    "who have the same", "professional interests", "than me", "and same goals", "so that way", "I wouldn't waste time",
    "finding the right", "group of people", "And a big group", "is not always better", "Having a small", "and a focus group", "works best"],
    styled={"crazy": "i", "august": "b", "networking": "b", "intense": "i", "organized": "b", "differently": "i", "small": "b",
            "best": "i", "nobody": "b", "job": "b", "october": "b", "same": "b"},
    show={"lbsmfa": "LBS MFA", "organized": "organised", "internships": "internship"})
E.init(ROOT, DUR, FACE, FULL, title="Margaux 2 - 3 things nobody tells you")
H.style()

blank = lambda sid, a, b: K.raw(sid, a, b, True, "", "", "")     # under a creator block (the scenes tile the timeline)
L, IM, TX, BX, SV, AR, PS = H.label, H.img, H.text, H.box, H.lines, H.arrow, H.person
SP, BJ = H.spring, H.brain_js

# ---------------------------------------------------------------- creator blocks: hook, section markers, punch-in over the uncovered jump
H.hook(["3 THINGS NOBODY TELLS YOU", "ABOUT THE LBS MFA"], s(4.24), top=900)
H.pill("p1", ["#1: THE WORKLOAD"], 5.48, s(7.52) - 0.2, top=950)
H.pill("p2", ["#2: NETWORKING"], 22.2, 25.0, top=950)
H.pill("p3", ["#3: THE CLASSES"], 40.6, s(42.56) - 0.2, top=950)
H.pill("p4", ["WHAT I'D DO DIFFERENTLY"], 57.1, s(59.44) - 0.2, top=950)
H.punch([[s(35.44), s(37.8)]])

blank("f00", 0, s(7.52))

# A - PAIN, comparison stacked vertically: what you want (friends, going out) / but the apps are already open in AUGUST
K.raw("a-aug", s(7.52), s(14.16), True,
      TX("ey", 540, 380, "You just arrived&hellip;", 42, 600, True, "center") +
      IM("e1", 330, 560, "fistbump", 150, 340) + L("l1", 330, 650, "MAKE FRIENDS", size=52) +
      IM("e2", 760, 545, "cheers", 190, 220) + L("l2", 760, 650, "GO OUT", size=52) +
      SV([("dv", "M240,770 L840,770", 6)]) +
      IM("e3", 540, 925, "calendar_aug", 230) + L("l3", 540, 1060, "APPS ALREADY OPEN", "Summer internships", size=62, sub_size=38), "",
      BJ(SP(["ey"], [7.54], **{"from": 0.9, "y": 20}) + SP(["e1", "l1"], [8.98, 9.0]) + SP(["e2", "l2"], [10.18, 10.2]) +
         H.drawn(["dv"], 10.72, 0.3) + H.dim(["ey", "e1", "l1", "e2", "l2"], 10.72) + SP(["e3"], [11.02]) + SP(["l3"], [12.34], **{"from": 0.9, "y": 20})))
K.ac(8.98, "pop", -24); K.ac(10.18, "pop", -24); K.ac(11.02, "pop", -22)

# B - PROBLEM, card list: each item on its word, then "all at the same time"
rows = [("cv", "APPLY", 15.64), ("laptop_test", "ONLINE ASSESSMENTS", 16.28), ("handshake", "INTERVIEWS", 17.28)]
K.raw("b-stack", s(14.16), s(20.12), True,
      "".join(IM("re%d" % k, 140, 440 + k * 175, e, 130, 150) + TX("rt%d" % k, 245, 400 + k * 175, t, 56, 800) for k, (e, t, _) in enumerate(rows)) +
      IM("ck", 540, 985, "alarm", 140) + L("sm", 540, 1070, "ALL AT THE SAME TIME", size=60), "",
      BJ("".join(SP(["re%d" % k, "rt%d" % k], [t, t + 0.04], **{"from": 0.7, "y": 30}) for k, (_, _, t) in enumerate(rows)) +
         SP(["ck", "sm"], [19.44, 19.5]) + 'tl.fromTo(q("ck"), {rotation:-12}, {rotation:12, duration:0.09, repeat:7, yoyo:true, ease:"none"}, T(19.6));'))
[K.ac(t, "pop", -24) for _, _, t in rows]; K.ac(19.44, "shine", -22)

blank("f01", s(20.12), s(26.96))

# C - "on top of everything else": a stack - blocks drop onto EVERYTHING ELSE (concept visualisation, vertical)
blk = lambda i, top, obj, lab, solid=False: ('<div id="{ID}-%s" class="hz-sl" style="left:160px;top:%dpx;width:760px;height:128px;%s">%s'
    '<span class="l"><b>%s</b></span></div>') % (i, top, "background:#fff;color:#004AAD;border-color:#fff" if solid else "",
    ('<img src="assets/obj/%s.png" style="height:96px;width:120px;object-fit:contain"/>' % obj) if obj else "", lab)
K.raw("c-pile", s(26.96), s(32.56), True,
      blk("k0", 1000, "", "EVERYTHING ELSE", True) + blk("k1", 860, "coffee", "COFFEE CHATS") + blk("k2", 720, "bizcard", "NETWORKING") +
      blk("k3", 580, "lanyard", "LBS EVENTS") + TX("ot", 540, 470, "On top of&hellip;", 44, 600, True, "center"), "",
      BJ(SP(["k0", "ot"], [26.96, 26.96], **{"from": 1}) + "".join(SP(["k%d" % k], [t], **{"from": 0.95, "y": -160}) for k, t in ((1, 27.94), (2, 29.28), (3, 30.74)))))
[K.ac(t, "pop", -23) for t in (27.94, 29.28, 30.74)]

blank("f02", s(32.56), s(42.56))

# D - the classes: vertical slider, the active step moves down on each word (exams in October -> group projects -> midterms)
sl_html, sl_js = H.slider("v", [("01", "EXAMS", "Start in October", 42.92), ("02", "GROUP PROJECTS", "", 45.12), ("03", "MIDTERMS", "", 47.6)], y0=430, h=160, gap=80)
sl_img = IM("v0i", 830, 510, "exam_stack", 120, 170) + IM("v1i", 830, 750, "puzzle", 120, 170) + IM("v2i", 830, 990, "books", 120, 170)
K.raw("d-slide", s(42.56), 48.62, True, sl_html + sl_img, "",
      BJ(sl_js + SP(["v0i"], [43.0]) + SP(["v1i"], [45.2]) + SP(["v2i"], [47.7])))
[K.ac(t, "pop", -24) for t in (42.92, 45.12, 47.6)]

# E - MONEY LINE: the one sentence to screenshot
K.raw("e-money", 48.62, s(54.16), True,
      TX("bk", 540, 520, "The biggest key", 52, 600, True, "center") +
      H.money("mn", 540, 610, "Stay<br><u>organised</u>", size=150, sub="Otherwise you lose track super fast", sub_size=44), "",
      BJ(SP(["bk"], [49.26], **{"from": 0.9, "y": 20}) + SP(["mn"], [50.3], **{"from": 0.7, "y": 0})) +
      'tl.fromTo(q("mn") + " i", {opacity:0}, {opacity:1, duration:0.2}, T(52.4));')
K.ac(50.3, "shine2", -22)

blank("f03", s(54.16), s(59.44))

# F - REFRAME, concept: a small group with the same professional interests and the same goals
K.raw("f-grp", s(59.44), s(64.6), True,
      PS("pa", 395, 800, 200) + PS("pb", 540, 765, 235) + PS("pc", 685, 800, 200) + L("gn", 540, 930, "SMALL GROUP", size=72) +
      BX("x1", 90, 420, 72, 72) + TX("t1", 184, 414, "Same <b>professional</b><br><b>interests</b>", 46, 500) +
      BX("x2", 700, 420, 72, 72) + TX("t2", 794, 414, "Same <b>goals</b>", 46, 500) +
      SV(AR("a1", 300, 560, 420, 670, -0.2, 8, 24) + AR("a2", 850, 500, 680, 670, 0.2, 8, 24) +
         [("k1", "M104,456 L124,478 L156,436", 11), ("k2", "M714,456 L734,478 L766,436", 11)]), "",
      BJ(SP(["pa", "pb", "pc"], [59.62, 59.66, 59.70]) + SP(["gn"], [59.94], **{"from": 0.9, "y": 20}) + SP(["x1", "t1"], [61.44, 61.44], **{"from": 0.9, "y": 20}) +
         H.drawn(["a1", "a1h"], 61.5, 0.4) + H.drawn(["k1"], 62.4, 0.25) + SP(["x2", "t2"], [63.84, 63.84], **{"from": 0.9, "y": 20}) +
         H.drawn(["a2", "a2h"], 63.9, 0.4) + H.drawn(["k2"], 64.12, 0.25)))
K.ac(59.62, "pop", -23); K.ac(62.4, "pop", -25); K.ac(64.12, "pop", -25)

blank("f04", s(64.6), s(68.04))

# G - STAKES, crowd visualisation: the big group fades; the small, focused few glow
cr_html, cr_js = H.crowd("cw", [("BIG GROUP", "Not always better", 18, False, 380, 68.32), ("SMALL &amp; FOCUSED", "Works best", 3, True, 770, 70.82)])
K.raw("g-crowd", s(68.04), DUR, True, cr_html, "",
      BJ(cr_js + H.dim(["cwp0_%d" % k for k in range(18)], 69.7, 0.25)))
K.ac(68.32, "pop", -23); K.ac(70.82, "accept", -22)

K.flush()
E.build()
H.hard_cuts(ROOT)
