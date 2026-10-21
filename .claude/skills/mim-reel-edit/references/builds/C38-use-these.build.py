#!/usr/bin/env python3
"""Use These - Business Short Form reel (HyperFrames).   python3 build.py
Source: C38 RAW CUTTED.mp4 (Dubai reels).

Nine seconds, four beats: "For GMAT prep, use this. For commercial awareness, use this..."
The four NEEDS are spoken; the four RESOURCES are only ever "this" -- they were on-screen
labels in the original and were never recoverable. The brands below were chosen for a
European master's application and approved by the editor, so each need now carries the
real logo of the thing to use.

Logos sit on white chips: all four are dark or full-colour marks and would disappear
against #050505. Sources are Wikimedia Commons, listed in assets/items/SOURCES.txt.

Two modes, not three. Every cut in the middle is a big jump and they fall 0.5-1.5s apart,
so a split block would have to contain a visible jump cut; one full-screen animation
covers all six of them instead.

Cuts: 1.1241 1.5829 3.0427 3.5849 4.8779 5.4618 6.2542 6.7547 - all "MUST switch or hide"."""
import os
import reel_engine as E
import kit as K

ROOT = os.path.dirname(os.path.abspath(__file__))
DUR = 9.217542

FACE = [[0, 1.1241], [6.7547, DUR]]
FULL = [[1.1241, 6.7547]]

K.captions(ROOT + "/words.json", ROOT + "/captions.json")
# The slate names all four needs in text, so no caption runs under it.
HIDE = [[1.1241, 6.7547]]

E.init(ROOT, DUR, FACE, FULL, title="Use These", words="words.json",
       keep={"GMAT", "DM"}, hide=HIDE)

# need (spoken) -> the resource to use for it
NEEDS = [("r0", "GMAT PREP", "assets/items/gmat.svg"),
         ("r1", "COMMERCIAL AWARENESS", "assets/items/ft.svg"),
         ("r2", "CHOOSING PROGRAMS", "assets/items/qs.svg"),
         ("r3", "FUNDING", "assets/items/erasmus.png")]

USE_CSS = """.us{position:absolute;left:90px;width:900px;z-index:5}
  .ur{display:flex;align-items:center;gap:16px;height:110px;margin-bottom:16px;padding:0 24px;box-sizing:border-box;
    border-radius:20px;background:rgba(20,19,18,.94);border:2px solid rgba(255,255,255,.2);
    box-shadow:0 20px 50px rgba(0,0,0,.5);opacity:0}
  .ur.on{opacity:1}
  .un{flex:1;font-family:"HelvB",Helvetica,sans-serif;font-size:33px;letter-spacing:-.03em;color:#F2F0EC}
  .ulogo{width:320px;min-width:320px;height:70px;border-radius:14px;background:#FFFFFF;
    display:flex;align-items:center;justify-content:center;padding:0 16px;box-sizing:border-box}
  .ulogo img{max-width:288px;max-height:46px;width:auto;height:auto;display:block}"""


def slate(top, shown):
    rows = "".join('<div id="{ID}-%s" class="ur%s"><span class="un">%s</span>'
                   '<span class="ulogo"><img src="%s" alt=""/></span></div>'
                   % (rid, " on" if rid in shown else "", label, src)
                   for rid, label, src in NEEDS)
    return '<div class="us" style="top:%dpx">%s</div>' % (top, rows)


def row_in(rid, t):
    return ("""__ft(q("%s"), {opacity:0, y:-20, filter:"blur(10px)"},
               {opacity:1, y:0, filter:"blur(0px)", duration:0.38, ease:"power3.out"}, T(%s));"""
            % (rid, t))


K.raw("s01-open", 0, 1.1241, False, "", "", "")

# GMAT prep is named at 0.44, before the slate exists, so row 0 opens already placed.
# The three remaining rows land on the word that names them; then all four take the
# accent edge together, one beat before he says "DM me".
K.raw("s02-slate", 1.1241, 6.7547, True, slate(690, {"r0"}), USE_CSS,
      row_in("r1", 1.85) + row_in("r2", 3.85) + row_in("r3", 5.82) + """
      __tt(q("r0"), {borderColor:"rgba(68,144,246,.75)", duration:0.35}, T(6.45));
      __tt(q("r1"), {borderColor:"rgba(68,144,246,.75)", duration:0.35}, T(6.50));
      __tt(q("r2"), {borderColor:"rgba(68,144,246,.75)", duration:0.35}, T(6.55));
      __tt(q("r3"), {borderColor:"rgba(68,144,246,.75)", duration:0.35}, T(6.60));""")

K.raw("s03-cta", 6.7547, DUR, False, "", "", "")

# ---------------------------------------------------------------- overlays
K.hook("four things", "you need", 1.05)
K.lps("cta", DUR, [("DM: STRATEGY", "hot", 6.95)])

K.flush()
E.build()
