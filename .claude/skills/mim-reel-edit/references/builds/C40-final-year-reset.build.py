#!/usr/bin/env python3
"""Final Year Reset - Business Short Form reel (HyperFrames).   python3 build.py
Source: C40 RAW CUTTED.mp4 (Dubai reels).

v2. v1 used a pill stack for six of its eight graphics, which is the animation
brain's anti-pattern #1 (same card format every beat) and #5 (illustrating exactly
what is said). This version gives each idea its own form, and lets three of them
develop across a split -> full pair so the idea builds instead of restarting:

  runway bar  ->  runway resolves      (time pressure: 12 months left)
  ring fills  ->  remainder lights up  (the essays are the unclaimed part)
  depth bars  ->  depth full screen    (a title floats, a story goes down)
  real Google Doc  (the honest essay)
  rising line graph (progress, not promises)
  the file with three ticks (the close)

Cuts: 2.7925 4.5859 8.1311 12.8859 15.6803 19.7677 20.6853 41.2475 47.1284 48.9636
19.7677 sits under a full-screen animation; every other cut is a mode switch."""
import os
import reel_engine as E
import kit as K

ROOT = os.path.dirname(os.path.abspath(__file__))
DUR = 53.720333

FACE = [[0, 2.7925], [36.0, 41.2475], [47.1284, 48.9636]]
FULL = [[8.1311, 12.8859], [15.6803, 20.6853], [26.5, 30.82], [48.9636, DUR]]

K.captions(ROOT + "/words.json", ROOT + "/captions.json")
# Captions are suppressed wherever the graphic already carries the words, so the
# viewer never reads the same thing twice. The face windows keep their one-word
# captions; the split/full beats let their own text do the work.
HIDE = [[8.1311, 36.0], [41.2475, 47.1284], [48.9636, DUR]]

E.init(ROOT, DUR, FACE, FULL, title="Final Year Reset", words="words.json",
       emph={"essays", "depth", "honestly", "progress", "lost"},
       keep={"GPA", "GMAT", "DM"}, hide=HIDE)

ACC = "#4490F6"; GRN = "#2FA65A"; GREY = "#9A928A"

# ---------------------------------------------------------------- 1. the runway
# A degree drawn as a spent bar with a lit tail. The words say "12 months"; the bar
# says how little is left, which is the feeling the words don't carry.
RUNWAY_CSS = """.rw{position:absolute;left:90px;width:900px;z-index:5}
  .rwtrack{position:relative;height:74px;border-radius:37px;background:rgba(255,255,255,.10);overflow:hidden}
  .rwspent{position:absolute;left:0;top:0;bottom:0;width:0;background:rgba(255,255,255,.22)}
  .rwleft{position:absolute;right:0;top:0;bottom:0;width:25%;background:linear-gradient(90deg,rgba(68,144,246,.35),#4490F6);
    box-shadow:0 0 50px rgba(68,144,246,.55);opacity:0}
  .rwticks{position:absolute;left:0;right:0;top:0;bottom:0;display:flex}
  .rwticks i{flex:1;border-right:2px solid rgba(5,5,5,.55)}
  .rwcap{display:flex;justify-content:space-between;margin-top:18px;font-family:"HelvB",Helvetica,sans-serif;
    font-size:25px;letter-spacing:-.02em;color:#9A928A}
  .rwcap b{color:#F2F0EC;font-weight:400}"""

K.raw("s01-open", 0, 2.7925, False, "", "", "")

K.raw("s02-runway", 2.7925, 8.1311, False,
    """<div class="rw" style="top:250px">
         <div class="rwtrack"><i class="rwspent" id="{ID}-sp"></i><i class="rwleft" id="{ID}-lf"></i>
           <div class="rwticks">""" + "".join("<i></i>" for _ in range(12)) + """</div></div>
         <div class="rwcap"><span id="{ID}-c0">YEAR 1</span><b id="{ID}-c1">FINAL YEAR</b></div>
       </div>""",
    RUNWAY_CSS,
    """__ft(q("sp"), {width:"0%"}, {width:"75%", duration:2.0, ease:"power2.inOut"}, T(3.20));
    __ft(q("lf"), {opacity:0}, {opacity:1, duration:0.45, ease:"power3.out"}, T(7.55));""")

# full screen: the tail is the whole point - still open
K.raw("s03-left", 8.1311, 12.8859, True,
    """<div class="rw" style="top:950px">
         <div class="rwtrack"><i class="rwspent" style="width:75%"></i><i class="rwleft" id="{ID}-lf" style="opacity:1"></i>
           <div class="rwticks">""" + "".join("<i></i>" for _ in range(12)) + """</div></div>
         <div class="rwcap"><span>SPENT</span><b id="{ID}-tag">12 MONTHS LEFT</b></div>
       </div>
       <div id="{ID}-stamp" class="rwst">STILL OPEN</div>""",
    RUNWAY_CSS + """.rwst{position:absolute;left:0;width:1080px;top:810px;text-align:center;
      font-family:"HelvB",Helvetica,sans-serif;font-size:72px;letter-spacing:-.045em;color:#4490F6;
      text-shadow:0 0 40px rgba(68,144,246,.5);opacity:0}""",
    """__tt(q("lf"), {boxShadow:"0 0 90px rgba(68,144,246,.85)", duration:0.5}, T(10.60));
    __ft(q("stamp"), {opacity:0, scale:0.9, filter:"blur(14px)"}, {opacity:1, scale:1, filter:"blur(0px)", duration:0.55, ease:"power3.out"}, T(10.66));""")

# ---------------------------------------------------------------- 2. the application, as a ring
# Three segments he names are only part of it. The empty arc is the argument.
RING = """<svg viewBox="0 0 420 420" width="420" height="420" class="rgsvg">
    <circle cx="210" cy="210" r="168" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="44"/>
    <circle id="{ID}-a1" cx="210" cy="210" r="168" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="44"
      pathLength="1000" stroke-dasharray="1000" stroke-dashoffset="1000" transform="rotate(-90 210 210)"/>
    <circle id="{ID}-a2" cx="210" cy="210" r="168" fill="none" stroke="#4490F6" stroke-width="44"
      pathLength="1000" stroke-dasharray="1000" stroke-dashoffset="1000" transform="rotate(-90 210 210)"/>
  </svg>"""
RING_CSS = """.rg{position:absolute;left:330px;z-index:5}
  .rgsvg{overflow:visible;filter:drop-shadow(0 20px 50px rgba(0,0,0,.5))}
  .rglab{position:absolute;left:0;width:420px;text-align:center;font-family:"HelvB",Helvetica,sans-serif;
    letter-spacing:-.03em;color:#F2F0EC;opacity:0}"""

K.raw("s04-ring", 12.8859, 15.6803, False,
    '<div class="rg" style="top:30px">' + RING +
    '<div id="{ID}-l1" class="rglab" style="top:170px;font-size:34px">GRADES<br>INTERNSHIP<br>ACTIVITIES</div></div>',
    RING_CSS,
    """__ft(q("a1"), {strokeDashoffset:1000}, {strokeDashoffset:620, duration:1.5, ease:"power2.inOut"}, T(12.95));
    __ft(q("l1"), {opacity:0}, {opacity:1, duration:0.4}, T(13.10));""")

# full screen: the unclaimed arc is the essays
K.raw("s05-essays", 15.6803, 20.6853, True,
    '<div class="rg" style="top:700px">' + RING +
    '<div id="{ID}-l1" class="rglab" style="top:150px;font-size:30px;opacity:1;color:#9A928A">GRADES<br>INTERNSHIP<br>ACTIVITIES</div>'
    '<div id="{ID}-l2" class="rglab" style="top:188px;font-size:52px">YOUR<br>ESSAYS</div></div>',
    RING_CSS,
    """tl.set(q("a1"), {strokeDashoffset:620}, 0);
    __tt(q("l1"), {opacity:0, duration:0.35}, T(18.30));
    __ft(q("a2"), {strokeDashoffset:1000}, {strokeDashoffset:380, duration:1.0, ease:"power2.inOut"}, T(18.39));
    __ft(q("l2"), {opacity:0, scale:0.92}, {opacity:1, scale:1, duration:0.45, ease:"power3.out"}, T(19.31));""")

# ---------------------------------------------------------------- 3. surface vs depth
DEPTH_CSS = """.dp{position:absolute;left:100px;width:880px;z-index:5}
  .dpc{position:absolute;top:0;width:380px;text-align:center;opacity:0}
  .dpc.r{left:500px}
  .dptag{display:inline-block;font-family:"HelvB",Helvetica,sans-serif;font-size:38px;letter-spacing:-.03em;
    color:#F2F0EC;padding:16px 30px;border-radius:17px;background:rgba(20,19,18,.94);border:2px solid rgba(255,255,255,.24)}
  .dpc.r .dptag{border-color:rgba(68,144,246,.7);color:#A9CCFF}
  .dpline{display:block;width:7px;margin:18px auto 0;border-radius:4px;height:0;
    background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.06))}
  .dpc.r .dpline{background:linear-gradient(180deg,#4490F6,rgba(68,144,246,.08));box-shadow:0 0 34px rgba(68,144,246,.6)}
  .dpfoot{margin-top:16px;font-family:"HelvB",Helvetica,sans-serif;font-size:27px;color:#9A928A}"""
DEPTH = ('<div class="dp" style="top:%dpx">'
         '<div id="{ID}-l" class="dpc"><span class="dptag">A TITLE</span><i id="{ID}-ll" class="dpline"></i>'
         '<div class="dpfoot" id="{ID}-lf">stops here</div></div>'
         '<div id="{ID}-r" class="dpc r"><span class="dptag">A STORY</span><i id="{ID}-rl" class="dpline"></i>'
         '<div class="dpfoot" id="{ID}-rf">keeps going</div></div></div>')

K.raw("s06-depth", 20.6853, 26.5, False, DEPTH % 30, DEPTH_CSS,
    """__ft(q("l"), {opacity:0, y:16}, {opacity:1, y:0, duration:0.4, ease:"power3.out"}, T(22.38));
    __ft(q("ll"), {height:0}, {height:96, duration:0.5, ease:"power2.out"}, T(22.80));
    __ft(q("r"), {opacity:0, y:16}, {opacity:1, y:0, duration:0.4, ease:"power3.out"}, T(23.88));
    __ft(q("rl"), {height:0}, {height:96, duration:0.5, ease:"power2.out"}, T(24.30));""")

# The full-screen beat continues the same picture, so it has to be COMPLETE on its
# first frame. Relying on an entrance authored before the scene start left the frame
# blank, so the base state is set in CSS here and only the change is animated.
K.raw("s07-deep", 26.5, 30.82, True, DEPTH % 620,
    DEPTH_CSS + """
    .dp .dpc{opacity:1}
    .dp .dpline{height:120px}""",
    """__tt(q("rl"), {height:430, duration:1.2, ease:"power2.inOut"}, T(27.92));
    __tt(q("l"), {opacity:0.34, duration:0.5}, T(28.20));
    __tt(q("rf"), {color:"#A9CCFF", duration:0.4}, T(28.60));""")

# ---------------------------------------------------------------- 4. the honest essay, in a real doc
K.gdoc("s08-doc", 30.82, 36.0, "Personal statement", "Where I actually was",
       "What made me start", (31.20, 32.58, 33.70, 34.64))

K.raw("s09-turn", 36.0, 41.2475, False, "", "", "")

# ---------------------------------------------------------------- 5. progress, drawn
K.graph("s10-prog", 41.2475, 47.1284, False,
        pts=[(0, 350), (240, 300), (470, 205), (700, 120), (900, 40)], t=42.30, dur=4.1,
        label="12 MONTHS",
        marks=[(240, 300, 42.96), (470, 205, 45.02), (700, 120, 46.59)],
        tags=[("UP EARLIER", False, 250, False, 42.96),
              ("RESPONSIBILITY", False, 140, False, 45.02),
              ("GRADES MOVING", True, 30, True, 46.59)])

K.raw("s11-file", 47.1284, 48.9636, False, "", "", "")

# ---------------------------------------------------------------- 6. the close: the file is still alive
K.raw("s12-close", 48.9636, DUR, True, """
    <div class="fl">
      <div class="flcard">
        <div class="flrow" id="{ID}-r0"><i class="flt" id="{ID}-t0">&#10003;</i><span>SOLID GPA</span></div>
        <div class="flrow" id="{ID}-r1"><i class="flt" id="{ID}-t1">&#10003;</i><span>SOLID GMAT</span></div>
        <div class="flrow" id="{ID}-r2"><i class="flt" id="{ID}-t2">&#10003;</i><span>INCOMING INTERNSHIP</span></div>
      </div>
      <div id="{ID}-verdict" class="flv">NOT LOST</div>
    </div>""",
    """.fl{position:absolute;left:120px;top:720px;width:840px;z-index:5}
    .flcard{border-radius:26px;background:rgba(18,17,16,.94);border:2px solid rgba(255,255,255,.2);overflow:hidden;
      box-shadow:0 26px 70px rgba(0,0,0,.6)}
    .flrow{display:flex;align-items:center;gap:22px;padding:26px 30px;border-bottom:2px solid rgba(255,255,255,.08);
      font-family:"HelvB",Helvetica,sans-serif;font-size:36px;letter-spacing:-.03em;color:#F2F0EC;opacity:0}
    .flrow:last-child{border-bottom:0}
    .flt{width:46px;height:46px;min-width:46px;border-radius:23px;background:rgba(47,166,90,.18);color:#2FA65A;
      display:flex;align-items:center;justify-content:center;font-style:normal;font-size:28px;opacity:0}
    .flv{margin-top:34px;text-align:center;font-family:"HelvB",Helvetica,sans-serif;font-size:96px;
      letter-spacing:-.05em;color:#2FA65A;text-shadow:0 0 46px rgba(47,166,90,.45);opacity:0}""",
    """[[0,48.17],[1,49.54],[2,51.53]].forEach(function(p){
       __ft(q("r"+p[0]), {opacity:0, x:-18}, {opacity:1, x:0, duration:0.4, ease:"power3.out"}, T(p[1]));
       __ft(q("t"+p[0]), {opacity:0, scale:0.5}, {opacity:1, scale:1, duration:0.35, ease:"back.out(1.6)"}, T(p[1]+0.22));
     });
    __ft(q("verdict"), {opacity:0, scale:0.92, filter:"blur(12px)"}, {opacity:1, scale:1, filter:"blur(0px)", duration:0.5, ease:"power3.out"}, T(52.32));""")

# ---------------------------------------------------------------- overlays
K.hook("Final year, a 2:1,", "no internship?", 2.70)

# one pill on the only long face window, naming the beat rather than repeating it
K.lps("tp", 41.00, [("THE TURNING POINT", "", 37.52)])

K.flush()
E.build()
