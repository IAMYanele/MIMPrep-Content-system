#!/usr/bin/env python3
"""Margaux 1 - My experience at the LBS MFA.   python3 build.py
Hormozi solid-card look in MiM Prep blue (#004AAD): creator full screen <-> full-screen blue cards (hz.py).
All times are GLOBAL seconds on the cut. Same-angle joins (30.12, 46.28, 47.04, 80.72) are a switch or under a card;
cards end on an angle change or well clear of one. Cards are drawn at full size in frame coordinates."""
import os
import reel_engine as E
import kit as K
import hz as H
import phrases as P

ROOT = os.path.dirname(os.path.abspath(__file__))
DUR = 90.16
s = lambda t: round(t - 0.002, 3)          # exact switch value for a cut at t
MEDIA = "G:/margaux-2026-10/raw/Margaux Podcast Studio (October 16th)/Margaux 1 - My experience at LBS MFA - Edit/hf-media"
H.setup_project(ROOT, MEDIA + "/cam_full.mp4", MEDIA + "/cam_top.mp4")
OBJ = ['globe', 'highlighter', 'whiteboard', 'notebook', 'handshake', 'briefcase']
H.assets_into(ROOT, OBJ, "G:/margaux-2026-10/assets_flat")


# v3 (animation brain): 9 cards. The Paris events card is cut - her face carries 19.4-30.1 (no jumps inside).
FACE = [[0, s(5.12)], [s(12.12), 14.8], [s(19.36), s(30.12)], [34.9, 36.6], [s(41.96), s(46.28)], [53.3, 56.9], [s(64.52), 67.9], [72.8, 75.4], [s(80.72), 83.6]]
FULL = [[s(5.12), s(12.12)], [14.8, s(19.36)], [s(30.12), 34.9], [36.6, s(41.96)], [s(46.28), 53.3], [56.9, s(64.52)], [67.9, 72.8], [75.4, s(80.72)], [83.6, DUR]]

H.captions(ROOT + "/words.json", ROOT + "/captions.json", P.PHRASES, P.STYLED, P.SHOW)
E.init(ROOT, DUR, FACE, FULL, title="Margaux 1 - My experience at the LBS MFA")
H.style()

blank = lambda sid, a, b: K.raw(sid, a, b, True, "", "", "")
L, IM, TX, BX, SV, AR, PS, CH, FL = H.label, H.img, H.text, H.box, H.lines, H.arrow, H.person, H.chip, H.flag
SP, BJ = H.spring, H.brain_js

# ---------------------------------------------------------------- creator blocks: hook + credibility marker, section markers
H.hook(["MY LBS MFA", "EXPERIENCE"], s(5.12), top=900)
H.lower_third("lt", "MARGAUX", "LBS MFA ALUMNA", 1.36, s(5.12) - 0.15, top=1290)
H.pill("p1", ["MASTER IN FINANCE"], 28.4, s(30.12) - 0.2, top=950)
H.pill("p2", ["HOW WE PREPARED"], 81.0, 83.4, top=950)

blank("f00", 0, s(5.12))

# 1 - background, a journey stacked vertically: France (bachelor at ESSEC) -> Munich (exchange at the LMU)
K.raw("j1-path", s(5.12), s(12.12), True,
      FL("fr", 300, 500, 230, "fr") + TX("frl", 450, 445, "FRANCE", 64, 800) + TX("frs", 452, 525, "Bachelor at ESSEC", 38, 500, True) +
      SV([("ln", "M300,600 L300,720", 9)] + AR("ar", 300, 640, 300, 740, 0.0, 9, 24)[1:]) +
      FL("de", 300, 840, 230, "de") + TX("del", 450, 785, "MUNICH", 64, 800) + TX("des", 452, 865, "Exchange at the LMU", 38, 500, True), "",
      BJ(SP(["fr", "frl"], [7.62, 7.65]) + SP(["frs"], [8.18], **{"from": 0.9, "y": 20}) + H.drawn(["ln", "arh"], 9.9, 0.35) +
         SP(["de", "del"], [10.84, 10.87]) + SP(["des"], [11.66], **{"from": 0.9, "y": 20})))
K.ac(7.62, "pop", -24); K.ac(10.84, "pop", -24)

blank("f01", s(12.12), 14.8)

# 2 - the journey continues: the one thing missing (?) -> the UK, academic experience
K.raw("j2-uk", 14.8, s(19.36), True,
      FL("fr", 300, 430, 170, "fr") + TX("frl", 420, 400, "FRANCE", 52, 800) + FL("de", 300, 620, 170, "de") + TX("del", 420, 590, "GERMANY", 52, 800) +
      SV([("l1", "M300,500 L300,560", 8), ("l2", "M300,690 L300,790", 8)]) +
      '<div id="{ID}-q" class="hz-x" style="left:300px;top:880px;width:230px;height:154px;border:6px dashed #fff;border-radius:12px;'
      'display:flex;align-items:center;justify-content:center;font-family:Pop;font-weight:900;font-size:96px;color:#fff;box-sizing:border-box">?</div>' +
      FL("uk", 300, 880, 230, "uk") + TX("ukl", 450, 825, "THE UK", 64, 800) + TX("uks", 452, 905, "Academic experience", 38, 500, True), "",
      BJ(SP(["fr", "frl", "de", "del"], [14.8] * 4, **{"from": 1}) + 'tl.set([q("l1"), q("l2")], {strokeDashoffset:0}, 0);' +
         SP(["q"], [16.38]) + 'tl.to(q("q"), {opacity:0, duration:0.1}, T(18.9));' + SP(["uk", "ukl"], [19.0, 19.06]) + SP(["uks"], [19.1], **{"from": 0.9, "y": 20})))
K.ac(16.38, "pop", -24); K.ac(19.0, "accept", -22)

blank("f02", s(19.36), s(30.12))

# 3 - concept: what surprised her most - how international it was
K.raw("j3-intl", s(30.12), 34.9, True,
      TX("sp", 540, 400, "What surprised me most", 46, 600, True, "center") + IM("gl", 540, 680, "globe", 340) +
      L("il", 540, 880, "INTERNATIONAL", size=92), "",
      BJ(SP(["sp"], [31.44], **{"from": 0.9, "y": 20}) + SP(["gl"], [32.98]) + SP(["il"], [33.42], **{"from": 0.8, "y": 20})) +
      'tl.fromTo(q("gl"), {rotation:-6}, {rotation:6, duration:1.2, repeat:1, yoyo:true, ease:"sine.inOut"}, T(33.2));')
K.ac(32.98, "pop", -23)

blank("f04", 34.9, 36.6)

# 4 - crowd visualisation: expected a lot of British students - reality, very few
cr_html, cr_js = H.crowd("cw", [("EXPECTED", "Lots of British students", 18, False, 380, 36.8), ("REALITY", "Very few", 1, True, 770, 40.54)])
K.raw("j4-brits", 36.6, s(41.96), True, cr_html + FL("uk", 540, 1080, 110, "uk"), "",
      BJ(cr_js + SP(["uk"], [41.26])))
K.ac(36.8, "pop", -24); K.ac(40.54, "accept", -22)

blank("f05", s(41.96), s(46.28))

# 5 - MONEY LINE: my best advice - trust yourself, just apply
K.raw("j5-money", s(46.28), 53.3, True,
      TX("ey", 540, 430, "My best advice", 52, 600, True, "center") +
      H.money("m1", 540, 540, "Trust yourself", size=104) + H.money("m2", 540, 700, "Just <u>apply</u>", size=150), "",
      BJ(SP(["ey"], [47.34], **{"from": 0.9, "y": 20}) + SP(["m1"], [48.74], **{"from": 0.8, "y": 0}) + SP(["m2"], [52.68], **{"from": 0.7, "y": 0})))
K.ac(48.74, "pop", -23); K.ac(52.68, "shine2", -22)

blank("f06", 53.3, 56.9)

# 6 - card list: the right way to do it - worth highlighting / super important to say / don't say
rw = [("hl", "WORTH HIGHLIGHTING", "", 58.14), ("ok", "SUPER IMPORTANT", "Things you should say", 60.92), ("no", "DON'T SAY", "Some stuff you shouldn't", 63.52)]
K.raw("j6-say", 56.9, s(64.52), True,
      "".join((IM("we%d" % k, 165, 500 + k * 200, "highlighter", 70, 170) if e == "hl" else H.tick("we%d" % k, 170, 500 + k * 200, 96, e == "ok")) +
              TX("wt%d" % k, 265, 455 + k * 200, t, 56, 800) + (TX("ws%d" % k, 267, 530 + k * 200, sub, 36, 500, True) if sub else "") for k, (e, t, sub, _) in enumerate(rw)), "",
      BJ("".join(SP(["we%d" % k, "wt%d" % k] + (["ws%d" % k] if sub else []), [t, t + 0.03, t + 0.2][:3 if sub else 2], **{"from": 0.7, "y": 30}) for k, (_, _, sub, t) in enumerate(rw))))
[K.ac(t, "pop", -24) for _, _, _, t in rw]

blank("f07", s(64.52), 67.9)

# 7 - vertical slider: talk to students before applying - the culture -> what to expect -> a good application
sl_html, sl_js = H.slider("v", [("01", "THE CULTURE", "", 68.82), ("02", "WHAT TO EXPECT", "", 69.98), ("03", "A GOOD APPLICATION", "", 72.30)], y0=470, h=140, gap=70)
K.raw("j7-talk", 67.9, 72.8, True, TX("ey", 540, 380, "Talk to students first", 46, 600, True, "center") + sl_html, "",
      BJ(SP(["ey"], [68.0], **{"from": 0.9, "y": 20}) + sl_js))
[K.ac(t, "pop", -24) for t in (68.82, 69.98, 72.30)]

blank("f08", 72.8, 75.4)

# 8 - concept chain, stacked: ME -> LBS -> PIMCO (PIMCO hires a lot from LBS; the name helped me get in)
K.raw("j8-pimco", 75.4, s(80.72), True,
      H.chip("pim", 540, 400, "PIMCO", 84) + H.chip("lbs", 540, 690, "LBS", 84) + PS("me", 540, 1010, 150) + L("mel", 540, 1095, "ME", size=44) +
      SV(AR("a1", 540, 680, 540, 540, 0.0, 10, 26) + AR("a2", 540, 925, 540, 820, 0.0, 10, 26)) +
      TX("hi", 600, 585, "Hires a lot from LBS", 40, 600, True), "",
      BJ(SP(["pim"], [75.48]) + SP(["lbs"], [77.32]) + H.drawn(["a1", "a1h"], 77.5, 0.35) + SP(["hi"], [77.7], **{"from": 0.9, "y": 10}) +
         SP(["me", "mel"], [78.36, 78.4]) + H.drawn(["a2", "a2h"], 79.4, 0.35)))
K.ac(75.48, "pop", -23); K.ac(77.32, "pop", -23); K.ac(79.4, "accept", -22)

blank("f09", s(80.72), 83.6)

# 9 - card list: small groups with friends - brainstorm, talk it through, mock interviews -> a job
pr = [("whiteboard", "BRAINSTORM", 85.36), ("notebook", "TALK IT THROUGH", 86.24), ("handshake", "MOCK INTERVIEWS", 87.48)]
K.raw("j9-prep", 83.6, DUR, True,
      PS("g0", 440, 470, 130) + PS("g1", 540, 450, 150) + PS("g2", 640, 470, 130) +
      "".join(IM("pe%d" % k, 180, 650 + k * 150, e, 120, 150) + TX("pt%d" % k, 285, 610 + k * 150, t, 56, 800) for k, (e, t, _) in enumerate(pr)) +
      IM("jb", 400, 1095, "briefcase", 100) + H.chip("job", 590, 1060, "A JOB", 56), "",
      BJ(SP(["g0", "g1", "g2"], [83.74, 83.78, 83.82]) + "".join(SP(["pe%d" % k, "pt%d" % k], [t, t + 0.03], **{"from": 0.7, "y": 30}) for k, (_, _, t) in enumerate(pr)) +
         SP(["jb", "job"], [89.64, 89.67])))
K.ac(83.74, "pop", -24); [K.ac(t, "pop", -24) for _, _, t in pr]; K.ac(89.64, "accept", -22)

K.flush()
E.build()
H.hard_cuts(ROOT)
