#!/usr/bin/env python3
"""How To Survive Second Year - Business Short Form reel (HyperFrames).   python3 build_v2.py
Source: C33 RAW CUTTED.mp4 (Dubai reels).

v2. v1 leaned on a pill stack for four of its five graphics. Each beat now gets its
own form, and the tip-three idea develops across a split -> full pair:

  load-bearing pillars  (year two is what the application stands on)
  a crowd, one steps up (member vs committee role)
  slots filling fast    (autumn applications)
  reverse arrow         (plan backwards)  split -> full

Cuts: 3.2095 9.0070 18.1411 26.1908 32.6973 35.2832 - every one is a mode switch."""
import os
import reel_engine as E
import kit as K

ROOT = os.path.dirname(os.path.abspath(__file__))
DUR = 47.380667

FACE = [[0, 3.2095], [9.0070, 13.5], [18.1411, 26.1908], [42.0, DUR]]
FULL = [[32.6973, 35.2832]]

K.captions(ROOT + "/words.json", ROOT + "/captions.json")
# No caption wherever the graphic already carries the words; the face windows keep
# their one-word captions.
HIDE = [[3.2095, 9.0070], [13.5, 18.1411], [26.1908, 42.0]]

E.init(ROOT, DUR, FACE, FULL, title="How To Survive Second Year", words="words.json",
       emph={"overlooked", "committee", "summer", "reverse", "strategy"},
       keep={"DM", "GMAT", "Treasurer"}, hide=HIDE)

K.raw("s01-open", 0, 3.2095, False, "", "", "")

# ---------------------------------------------------------------- 1. what the application stands on
# He says it "stands on" year two. Three pillars, and only the middle one is carrying
# the slab - the picture makes the weight obvious before the sentence finishes.
K.raw("s02-pillars", 3.2095, 9.0070, False, """
    <div class="pl">
      <div id="{ID}-slab" class="plslab">YOUR APPLICATION</div>
      <div class="plrow">
        <div class="plcol"><i id="{ID}-p0" class="plp"></i><span>YEAR 1</span></div>
        <div class="plcol"><i id="{ID}-p1" class="plp hot"></i><span id="{ID}-l1" class="hot">YEAR 2</span></div>
        <div class="plcol"><i id="{ID}-p2" class="plp"></i><span>YEAR 3</span></div>
      </div>
    </div>""",
    """.pl{position:absolute;left:150px;top:60px;width:780px;z-index:5}
    .plslab{height:92px;border-radius:14px;background:rgba(20,19,18,.94);border:2px solid rgba(255,255,255,.24);
      display:flex;align-items:center;justify-content:center;font-family:"HelvB",Helvetica,sans-serif;
      font-size:36px;letter-spacing:-.035em;color:#F2F0EC;opacity:0}
    .plrow{display:flex;justify-content:space-between;margin-top:14px}
    .plcol{width:230px;text-align:center;font-family:"HelvB",Helvetica,sans-serif;font-size:27px;color:#9A928A}
    .plcol span.hot{color:#A9CCFF}
    .plp{display:block;width:100%;height:0;border-radius:10px;background:rgba(255,255,255,.18);margin-bottom:14px}
    .plp.hot{background:linear-gradient(180deg,#4490F6,rgba(68,144,246,.35));box-shadow:0 0 44px rgba(68,144,246,.55)}""",
    """__ft(q("p0"), {height:0}, {height:150, duration:0.45, ease:"power3.out"}, T(3.60));
    __ft(q("p1"), {height:0}, {height:150, duration:0.45, ease:"power3.out"}, T(3.85));
    __ft(q("p2"), {height:0}, {height:150, duration:0.45, ease:"power3.out"}, T(4.10));
    __ft(q("slab"), {opacity:0, y:-26}, {opacity:1, y:0, duration:0.5, ease:"power3.out"}, T(7.82));
    __tt(q("p0"), {opacity:0.3, duration:0.5}, T(8.16));
    __tt(q("p2"), {opacity:0.3, duration:0.5}, T(8.16));""")

K.raw("s03-skip", 9.0070, 13.5, False, "", "", "")

# ---------------------------------------------------------------- 2. member vs committee
# Everyone in the society is a dot. One of them steps up and gets the badge.
DOTS = "".join('<i class="cdd" id="{ID}-d%d" style="left:%dpx;top:%dpx"></i>' % (i, 40 + (i % 9) * 78, 70 + (i // 9) * 76)
               for i in range(27))
K.raw("s04-crowd", 13.5, 18.1411, False,
    '<div class="cd">' + DOTS +
    '<div id="{ID}-badge" class="cdb">COMMITTEE</div></div>',
    """.cd{position:absolute;left:150px;top:40px;width:780px;height:330px;z-index:5}
    .cdd{position:absolute;width:40px;height:40px;border-radius:20px;background:rgba(255,255,255,.22);opacity:0}
    .cdb{position:absolute;left:230px;top:240px;width:320px;text-align:center;padding:16px 0;border-radius:16px;
      background:rgba(68,144,246,.2);border:2px solid #4490F6;box-shadow:0 0 46px rgba(68,144,246,.5);
      font-family:"HelvB",Helvetica,sans-serif;font-size:32px;letter-spacing:-.03em;color:#A9CCFF;opacity:0}""",
    """for (var i=0;i<27;i++){ __ft(q("d"+i), {opacity:0}, {opacity:1, duration:0.3}, T(13.90 + i*0.015)); }
    __tt(q("d13"), {backgroundColor:"#4490F6", scale:1.5, boxShadow:"0 0 34px rgba(68,144,246,.8)", duration:0.45, ease:"back.out(1.5)"}, T(15.38));
    __ft(q("badge"), {opacity:0, y:14}, {opacity:1, y:0, duration:0.45, ease:"power3.out"}, T(15.56));""")

K.raw("s05-grow", 18.1411, 26.1908, False, "", "", "")

# ---------------------------------------------------------------- 3. the autumn window filling
# Slots down a year strip: autumn fills almost at once, which is the urgency.
SLOTS = "".join('<i class="slq" id="{ID}-s%d" style="left:%dpx"></i>' % (i, 20 + i * 68) for i in range(11))
K.raw("s06-slots", 26.1908, 32.6973, False,
    '<div class="sl">' + SLOTS +
    '<div class="slaxis"><span style="left:10px">AUTUMN</span><span style="right:10px">SPRING</span></div></div>',
    """.sl{position:absolute;left:170px;top:120px;width:760px;height:200px;z-index:5}
    .slq{position:absolute;top:0;width:52px;height:120px;border-radius:10px;background:rgba(255,255,255,.14);
      transform-origin:50% 100%}
    .slaxis{position:absolute;left:0;right:0;top:146px;font-family:"HelvB",Helvetica,sans-serif;font-size:25px;color:#9A928A}
    .slaxis span{position:absolute}""",
    """[0,1,2,3,4,5].forEach(function(i){
       __tt(q("s"+i), {backgroundColor:"#4490F6", boxShadow:"0 0 30px rgba(68,144,246,.55)", duration:0.3}, T(28.78 + i*0.16));
     });
    [6,7].forEach(function(i){ __tt(q("s"+i), {backgroundColor:"rgba(68,144,246,.45)", duration:0.3}, T(29.90 + i*0.12)); });""")

# ---------------------------------------------------------------- 4. plan it backwards (split -> full)
ARROW = """<div class="rv">
      <div class="rvbox" id="{ID}-a">FINAL YEAR<em>first round opens</em></div>
      <svg class="rvarr" viewBox="0 0 620 60" width="620" height="60">
        <path id="{ID}-line" d="M600,30 L40,30" pathLength="1000" fill="none" stroke="#4490F6"
              stroke-width="8" stroke-linecap="round" stroke-dasharray="1000" stroke-dashoffset="1000"/>
      </svg>
      <svg class="rvhead" id="{ID}-head" viewBox="0 0 60 60" width="60" height="60">
        <path d="M44,12 L16,30 L44,48" fill="none" stroke="#4490F6" stroke-width="8"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div class="rvbox rvb2" id="{ID}-b">THE SUMMER BEFORE<em>start your GMAT prep</em></div>
    </div>"""
ARROW_CSS = """.rv{position:absolute;left:90px;width:900px;height:300px;z-index:5}
    .rvbox{position:absolute;top:0;width:430px;padding:24px 20px;box-sizing:border-box;border-radius:18px;
      background:rgba(20,19,18,.94);border:2px solid rgba(255,255,255,.22);font-family:"HelvB",Helvetica,sans-serif;
      font-size:36px;letter-spacing:-.035em;color:#F2F0EC;text-align:center;opacity:0}
    .rvbox em{display:block;margin-top:9px;font-style:normal;font-size:25px;color:#9A928A}
    .rvbox.rvb2{left:470px;border-color:rgba(68,144,246,.6)}
    .rvarr{position:absolute;left:140px;top:170px}
    .rvhead{position:absolute;left:120px;top:165px;opacity:0}"""

K.raw("s07-reverse", 32.6973, 35.2832, True, ARROW,
    ARROW_CSS.replace(".rv{position:absolute;left:90px;", ".rv{position:absolute;left:90px;top:825px;"),
    """__ft(q("a"), {opacity:0, y:16}, {opacity:1, y:0, duration:0.45, ease:"power3.out"}, T(32.80));
    __ft(q("line"), {strokeDashoffset:1000}, {strokeDashoffset:0, duration:0.9, ease:"power2.inOut"}, T(33.40));
    __ft(q("head"), {opacity:0}, {opacity:1, duration:0.25}, T(34.15));
    __ft(q("b"), {opacity:0, y:16}, {opacity:1, y:0, duration:0.45, ease:"power3.out"}, T(34.30));""")

# the same picture, now in the panel and already complete, while he fills in the detail
K.raw("s08-plan", 35.2832, 42.0, False, ARROW,
    ARROW_CSS.replace(".rv{position:absolute;left:90px;", ".rv{position:absolute;left:90px;top:60px;")
    + """ .rv .rvbox{opacity:1} .rv .rvhead{opacity:1}""",
    """tl.set(q("line"), {strokeDashoffset:0}, T(35.30));
    __tt(q("a"), {borderColor:"rgba(68,144,246,.6)", duration:0.4}, T(36.08));
    __tt(q("b"), {boxShadow:"0 0 48px rgba(68,144,246,.45)", duration:0.5}, T(39.94));""")

K.raw("s09-cta", 42.0, DUR, False, "", "", "")

# ---------------------------------------------------------------- overlays
K.hook("How to survive", "second year", 3.10)
K.agenda([("1", "ONE SOCIETY", 12.76),
          ("2", "YOUR SUMMER", 22.58),
          ("3", "PLAN IN REVERSE", 33.32)], 9.30, 43.10)
K.lps("res", 22.10, [("POINT TO A RESULT", "green", 21.56)])

K.flush()
E.build()
