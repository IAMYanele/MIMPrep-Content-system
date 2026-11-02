#!/usr/bin/env python3
"""Margaux 3 - My application and interview (what actually got me into LBS).   python3 build.py
Hormozi solid-card look in MiM Prep blue (#004AAD): creator full screen <-> full-screen blue cards (hz.py).
All times are GLOBAL seconds on the cut. Same-angle joins (3.52, 7.2, 33.08, 35.56, 41.04, 80.16) are a switch or under a card;
cards end on an angle change or well clear of one. Cards are drawn at full size in frame coordinates."""
import os
import reel_engine as E
import kit as K
import hz as H
import phrases as P

ROOT = os.path.dirname(os.path.abspath(__file__))
DUR = 82.48
s = lambda t: round(t - 0.002, 3)          # exact switch value for a cut at t
MEDIA = "G:/margaux-2026-10/raw/Margaux Podcast Studio (October 16th)/Margaux 3 - My application and interview - Edit/hf-media"
H.setup_project(ROOT, MEDIA + "/cam_full.mp4", MEDIA + "/cam_top.mp4")
OBJ = ['briefcase', 'gre_sheet', 'medal', 'folders', 'lanyard', 'gradcap', 'books', 'hourglass', 'trophy', 'scale', 'stopwatch', 'tradingscreen', 'compass', 'coffee2', 'clover']
H.assets_into(ROOT, OBJ, "G:/margaux-2026-10/assets_flat")


# v3 (animation brain): 9 cards. The mock-interviews card is cut - her face carries it (61.5-70.5, no jumps inside).
FACE = [[0, s(3.52)], [s(10.28), 12.9], [s(17.84), s(23.6)], [s(31.36), s(33.08)], [s(41.04), 43.7], [s(48.4), 50.6], [61.5, 70.5]]
FULL = [[s(3.52), s(10.28)], [12.9, s(17.84)], [s(23.6), s(31.36)], [s(33.08), s(41.04)], [43.7, s(48.4)], [50.6, 61.5], [70.5, DUR]]

H.captions(ROOT + "/words.json", ROOT + "/captions.json", P.PHRASES, P.STYLED, P.SHOW)
E.init(ROOT, DUR, FACE, FULL, title="Margaux 3 - My application and interview")
H.style()

blank = lambda sid, a, b: K.raw(sid, a, b, True, "", "", "")
L, IM, TX, BX, SV, AR, PS, CH = H.label, H.img, H.text, H.box, H.lines, H.arrow, H.person, H.chip
SP, BJ = H.spring, H.brain_js

# ---------------------------------------------------------------- creator blocks: hook + section markers
H.hook(["WHAT ACTUALLY GOT ME", "INTO LBS"], s(3.52), top=900)
H.pill("p1", ["#1: WORK EXPERIENCE"], 10.6, 12.7, top=950)
H.pill("p3", ["#3: SPORTS"], 32.6, s(33.08) - 0.15, top=950)
H.pill("p4", ["THE INTERVIEW"], 41.5, 43.5, top=950)
H.pill("p5", ["MY BEST ADVICE"], 68.2, 70.3, top=950)

blank("f00", 0, s(3.52))

# 1 - PROMISE, card list stacked vertically: the three things, each on its word
three = [("briefcase", "WORK EXPERIENCE", 6.26), ("gre_sheet", "GRE SCORE", 7.44), ("medal", "OUTSIDE OF SCHOOL", 8.70)]
K.raw("c1-three", s(3.52), s(10.28), True,
      TX("ey", 540, 380, "3 things that got me in", 46, 600, True, "center") +
      "".join(TX("n%d" % k, 120, 495 + k * 210, str(k + 1), 76, 900, True, "center") + IM("ie%d" % k, 270, 540 + k * 210, e, 150, 190) +
              TX("il%d" % k, 390, 505 + k * 210, t, 56, 800) for k, (e, t, _) in enumerate(three)), "",
      BJ(SP(["ey"], [3.80], **{"from": 0.9, "y": 20}) + "".join(SP(["n%d" % k, "ie%d" % k, "il%d" % k], [t, t + 0.03, t + 0.06], **{"from": 0.7, "y": 30}) for k, (_, _, t) in enumerate(three))))
[K.ac(t, "pop", -24) for _, _, t in three]

blank("f01", s(10.28), 12.9)

# 2 - vertical slider: 2.5 years apprenticeship -> internship -> master at LBS (the active step follows her words)
sl_html, sl_js = H.slider("v", [("01", "2.5 YEARS", "Apprenticeship", 13.1), ("02", "INTERNSHIP", "Right before starting", 14.76), ("03", "LBS", "Master", 16.56)], y0=430, h=160, gap=80)
K.raw("c2-path", 12.9, s(17.84), True,
      sl_html + IM("v0i", 830, 510, "folders", 120, 170) + IM("v1i", 830, 750, "lanyard", 130, 170) + IM("v2i", 830, 990, "gradcap", 110, 170), "",
      BJ(sl_js + SP(["v0i"], [13.15]) + SP(["v1i"], [14.8]) + SP(["v2i"], [16.6])))
[K.ac(t, "pop", -24) for t in (13.1, 14.76, 16.56)]

blank("f02", s(17.84), s(23.6))

# 3 - #2 grades and GRE: card list (the eyebrow carries the section number)
rows = [("books", "GRADES", "Decent, in a very good bachelor", 24.28), ("gre_sheet", "GRE", "A very good score", 28.38), ("hourglass", "4 MONTHS", "Of intense studying", 29.56)]
K.raw("c3-gre", s(23.6), s(31.36), True,
      TX("ey", 540, 370, "#2: GRADES &amp; GRE", 46, 800, True, "center") +
      "".join(IM("re%d" % k, 165, 520 + k * 215, e, 150, 170) + TX("rt%d" % k, 285, 465 + k * 215, t, 66, 800) + TX("rs%d" % k, 287, 550 + k * 215, sub, 36, 500, True)
              for k, (e, t, sub, _) in enumerate(rows)), "",
      BJ(SP(["ey"], [23.62], **{"from": 1}) + "".join(SP(["re%d" % k, "rt%d" % k, "rs%d" % k], [t, t + 0.03, t + 0.2], **{"from": 0.7, "y": 30}) for k, (_, _, _, t) in enumerate(rows))))
[K.ac(t, "pop", -24) for _, _, _, t in rows]

blank("f03", s(31.36), s(33.08))

# 4 - #3 sports, concept in two phases: COMPETING (trophy) -> BALANCE (scale over studies / job / sport, stacked)
bal = [("gradcap", "STUDIES", 39.30), ("briefcase", "JOB", 40.04), ("stopwatch", "SPORT", 40.74)]
K.raw("c4-sport", s(33.08), s(41.04), True,
      IM("tr", 540, 650, "trophy", 330) + L("tl", 540, 850, "COMPETING", "A well-known club in Paris", size=88, sub_size=42) +
      IM("sc", 540, 520, "scale", 230) + L("bl", 540, 650, "BALANCE", size=76) +
      "".join(IM("be%d" % k, 380, 815 + k * 125, e, 100, 130) + TX("bt%d" % k, 470, 785 + k * 125, t, 58, 800) for k, (e, t, _) in enumerate(bal)), "",
      BJ(SP(["tr"], [33.40]) + SP(["tl"], [34.18], **{"from": 0.9, "y": 20}) + 'tl.to([q("tr"), q("tl")], {opacity:0, duration:0.12}, T(37.9));' +
         SP(["sc", "bl"], [38.2, 38.25]) + "".join(SP(["be%d" % k, "bt%d" % k], [t, t + 0.03], **{"from": 0.7, "y": 30}) for k, (_, _, t) in enumerate(bal)) +
         'tl.fromTo(q("sc"), {rotation:-6}, {rotation:6, duration:0.5, repeat:3, yoyo:true, ease:"sine.inOut"}, T(38.8));'))
K.ac(33.40, "pop", -23); K.ac(38.2, "pop", -23); [K.ac(t, "pop", -24) for _, _, t in bal]

blank("f04", s(41.04), 43.7)

# 5 - credibility marker for the interviewer: LBS alumni, Master in Finance, trading at UBS
K.raw("c5-alum", 43.7, s(48.4), True,
      PS("pp", 540, 590, 260) + CH("ch", 540, 760, "LBS ALUMNI", 60) + TX("mf", 540, 885, "Master in Finance", 46, 600, True, "center") +
      IM("ue", 390, 1010, "tradingscreen", 90, 130) + TX("ub", 470, 980, "Trading at <b>UBS</b>", 46, 500), "",
      BJ(SP(["pp", "ch"], [43.86, 43.9]) + SP(["mf"], [44.80], **{"from": 0.9, "y": 20}) + SP(["ue", "ub"], [47.50, 47.53], **{"from": 0.8, "y": 20})))
K.ac(43.86, "pop", -23); K.ac(47.5, "pop", -24)

blank("f05", s(48.4), 50.6)

# 6 - comparison: pretty technical - half market finance, half real motivations (why LBS, free time)
K.raw("c6-half", 50.6, 61.5, True,
      L("tc", 540, 300, "PRETTY TECHNICAL", size=64) +
      SV([("hl", "M540,400 A270,270 0 0 0 540,940", 9), ("hr", "M540,400 A270,270 0 0 1 540,940", 9), ("mid", "M540,400 L540,940", 7)]) +
      '<svg class="hz-sv" width="1080" height="1500"><path id="{ID}-fl" d="M540,400 A270,270 0 0 0 540,940 Z" fill="rgba(255,255,255,.18)" opacity="0"/>'
      '<path id="{ID}-fr" d="M540,400 A270,270 0 0 1 540,940 Z" fill="rgba(255,255,255,.18)" opacity="0"/></svg>' +
      IM("me", 410, 670, "tradingscreen", 160) + TX("mt", 330, 965, "MARKET FINANCE", 44, 800, align="center") +
      IM("he", 670, 670, "compass", 170) + TX("ht", 760, 965, "MOTIVATIONS", 44, 800, align="center") +
      TX("w1", 760, 1030, "Why LBS?", 36, 600, True, "center") + TX("w2", 760, 1080, "Free time", 36, 600, True, "center"), "",
      BJ(SP(["tc"], [52.70], **{"from": 0.9, "y": 20}) + H.drawn(["hl", "hr"], 53.22, 0.5) + H.drawn(["mid"], 53.5, 0.3) +
         'tl.to(q("fl"), {opacity:1, duration:0.2}, T(54.4));' + SP(["me", "mt"], [54.44, 54.47]) +
         'tl.to(q("fr"), {opacity:1, duration:0.2}, T(57.7));' + SP(["he", "ht"], [57.72, 57.75]) +
         SP(["w1"], [58.82], **{"from": 0.9, "y": 20}) + SP(["w2"], [60.86], **{"from": 0.9, "y": 20})))
K.ac(53.22, "slide", -23); K.ac(54.44, "pop", -24); K.ac(57.72, "pop", -24)

blank("f06", 61.5, 70.5)

# 7 - card list (checklist): talk to students and alumni - ask about their daily life and their path
K.raw("c7-talk", 70.5, s(76.04), True,
      IM("tb", 540, 490, "coffee2", 200) + L("tl", 540, 620, "TALK TO STUDENTS<br>&amp; ALUMNI", size=62) +
      BX("x1", 250, 870, 78, 78) + TX("t1", 360, 872, "Their <b>daily life</b>", 52, 500) +
      BX("x2", 250, 990, 78, 78) + TX("t2", 360, 992, "Their <b>path</b>", 52, 500) +
      SV([("k1", "M265,906 L285,928 L318,884", 12), ("k2", "M265,1026 L285,1048 L318,1004", 12)]), "",
      BJ(SP(["tb"], [70.56]) + SP(["tl"], [70.98], **{"from": 0.9, "y": 20}) + SP(["x1", "t1"], [73.06, 73.06], **{"from": 0.9, "y": 20}) + H.drawn(["k1"], 73.4, 0.25) +
         SP(["x2", "t2"], [74.12, 74.12], **{"from": 0.9, "y": 20}) + H.drawn(["k2"], 74.4, 0.25)))
K.ac(70.56, "pop", -23); K.ac(73.4, "pop", -25); K.ac(74.4, "pop", -25)

# 8 - MONEY LINE: LBS is a community, and not everyone finds their place in it
K.raw("c8-money", s(76.04), s(80.16), True,
      H.money("mn", 540, 560, "LBS is a<br><u>community</u>", size=124, sub="Not everyone finds their place in it", sub_size=44), "",
      BJ(SP(["mn"], [76.46], **{"from": 0.7, "y": 0})) + 'tl.fromTo(q("mn") + " i", {opacity:0}, {opacity:1, duration:0.2}, T(77.74));')
K.ac(76.46, "shine2", -22)

# 9 - close: good luck for all your applications
K.raw("c9-luck", s(80.16), DUR, True,
      IM("lk", 540, 670, "clover", 330) + L("ll", 540, 870, "GOOD LUCK", "For all your applications", size=92, sub_size=42), "",
      BJ(SP(["lk"], [80.4]) + SP(["ll"], [80.64], **{"from": 0.9, "y": 20})))
K.ac(80.4, "accept", -22)

K.flush()
E.build()
H.hard_cuts(ROOT)
